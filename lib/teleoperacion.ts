"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { URL_ROBOT } from "@/lib/webrtc";

export type Direccion =
  | "adelante"
  | "atras"
  | "izquierda"
  | "derecha"
  | "detener";

/**
 * Cada cuánto se repite la orden mientras el botón sigue pulsado.
 *
 * El robot para solo si deja de recibirlas (tiene 600 ms de margen), así que
 * este intervalo debe ser bastante menor: con la conexión intacta el
 * movimiento es continuo, y si se corta el robot se detiene en medio segundo
 * en vez de seguir andando por la casa.
 */
const INTERVALO_MS = 200;

/** Límites que acepta el robot; los repite en /robot/estado. */
export const VELOCIDAD_MIN = 3;
export const VELOCIDAD_MAX = 25;
export const VELOCIDAD_POR_DEFECTO = 5;

export interface Teleoperacion {
  /** Dirección en curso, o null si está parado. */
  activa: Direccion | null;
  error: string | null;
  velocidad: number;
  setVelocidad: (v: number) => void;
  empezar: (direccion: Direccion) => void;
  parar: () => void;
}

export function useTeleoperacion(habilitado: boolean): Teleoperacion {
  const [activa, setActiva] = useState<Direccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [velocidad, setVelocidad] = useState(VELOCIDAD_POR_DEFECTO);
  const repetidorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const enVueloRef = useRef(false);

  // La repetición lee la velocidad de aquí: si se cambia el mando mientras
  // el robot anda, la siguiente orden ya sale con el valor nuevo.
  const velocidadRef = useRef(velocidad);
  velocidadRef.current = velocidad;

  const enviar = useCallback(async (direccion: Direccion) => {
    // Si la petición anterior sigue en curso, saltamos este ciclo: encolarlas
    // sólo añade retardo entre lo que se pulsa y lo que hace el robot.
    if (enVueloRef.current) return;
    enVueloRef.current = true;
    try {
      const r = await fetch(`${URL_ROBOT}/robot/comando`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direccion, velocidad: velocidadRef.current }),
      });
      if (!r.ok) {
        const cuerpo = await r.json().catch(() => ({}));
        throw new Error(cuerpo.error ?? `el robot respondió ${r.status}`);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo mover el robot");
    } finally {
      enVueloRef.current = false;
    }
  }, []);

  const parar = useCallback(() => {
    if (repetidorRef.current) {
      clearInterval(repetidorRef.current);
      repetidorRef.current = null;
    }
    setActiva(null);
    if (URL_ROBOT) void enviar("detener");
  }, [enviar]);

  const empezar = useCallback(
    (direccion: Direccion) => {
      if (!habilitado || !URL_ROBOT) return;
      if (direccion === "detener") {
        parar();
        return;
      }

      if (repetidorRef.current) clearInterval(repetidorRef.current);
      setActiva(direccion);
      void enviar(direccion);
      repetidorRef.current = setInterval(() => void enviar(direccion), INTERVALO_MS);
    },
    [habilitado, enviar, parar]
  );

  // Salir de la página con el robot en marcha lo dejaría andando hasta que
  // saltara su vigilante; mejor pararlo explícitamente.
  useEffect(() => {
    return () => {
      if (repetidorRef.current) clearInterval(repetidorRef.current);
      if (URL_ROBOT) {
        // keepalive permite que la petición salga aunque la página se cierre.
        void fetch(`${URL_ROBOT}/robot/comando`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direccion: "detener" }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  return { activa, error, velocidad, setVelocidad, empezar, parar };
}
