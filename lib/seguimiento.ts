"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { URL_ROBOT } from "@/lib/webrtc";

/**
 * Seguimiento automático de personas.
 *
 * Los valores replican los de `object_tracker.py`, que es el seguidor que ya
 * funciona en el robot. El área del recuadro hace de medida de distancia: si
 * la persona ocupa más de la cuenta está demasiado cerca, si ocupa menos está
 * lejos. Es una aproximación grosera pero suficiente con una sola cámara.
 */

/** Fracción del encuadre que debería ocupar la persona. */
export const AREA_OBJETIVO = 0.4;
/** Margen alrededor del área objetivo donde el robot no corrige. */
export const TOLERANCIA_AREA = 0.03;
/** Desviación horizontal admitida antes de girar: tolerance × tolerance_factor. */
export const TOLERANCIA_X = 0.18;
/** area_factor del script original, para el tamaño del cuadro de puntería. */
export const FACTOR_AREA = 2.1;

export type OrdenSeguimiento =
  | "Stop"
  | "Move Forward"
  | "Move Backward"
  | "Move Left"
  | "Move Right";

/** Lo que el robot ve y decide en cada fotograma. */
export interface Deteccion {
  /** Recuadro en coordenadas 0-1 sobre el encuadre. */
  caja: { x0: number; y0: number; x1: number; y1: number } | null;
  /** Confianza 0-1 del detector. */
  confianza: number;
  /** Centro horizontal suavizado por el filtro de Kalman, 0-1. */
  centroX: number;
  /** Fracción del encuadre que ocupa la persona. */
  area: number;
  /** Desviación respecto al centro: positiva si está a la izquierda. */
  desviacionX: number;
  orden: OrdenSeguimiento;
  velocidad: number;
}

export type EstadoSeguimiento =
  | "sin-configurar"
  | "detenido"
  | "arrancando"
  | "siguiendo"
  | "error";

export interface Seguimiento {
  estado: EstadoSeguimiento;
  detalle: string;
  deteccion: Deteccion | null;
  iniciar: () => Promise<void>;
  detener: () => Promise<void>;
}

/** Cada cuánto se pregunta al robot qué está viendo. */
const INTERVALO_MS = 300;

export function useSeguimiento(): Seguimiento {
  const [estado, setEstado] = useState<EstadoSeguimiento>(
    URL_ROBOT ? "detenido" : "sin-configurar"
  );
  const [detalle, setDetalle] = useState(
    URL_ROBOT ? "Listo para iniciar" : "Sin robot configurado"
  );
  const [deteccion, setDeteccion] = useState<Deteccion | null>(null);
  const sondeoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pararSondeo = useCallback(() => {
    if (sondeoRef.current) {
      clearInterval(sondeoRef.current);
      sondeoRef.current = null;
    }
  }, []);

  const consultar = useCallback(async () => {
    try {
      const r = await fetch(`${URL_ROBOT}/seguimiento/estado`);
      if (!r.ok) throw new Error(`el robot respondió ${r.status}`);
      const datos = await r.json();

      if (!datos.activo) {
        pararSondeo();
        setEstado("detenido");
        setDetalle("Detenido");
        setDeteccion(null);
        return;
      }

      setDeteccion(datos.deteccion ?? null);
      setEstado("siguiendo");
      setDetalle(
        datos.deteccion?.caja
          ? "Siguiendo a la persona"
          : "Buscando a la persona…"
      );
    } catch (e) {
      pararSondeo();
      setEstado("error");
      setDetalle(e instanceof Error ? e.message : "Se perdió el contacto");
    }
  }, [pararSondeo]);

  const iniciar = useCallback(async () => {
    if (!URL_ROBOT) return;
    setEstado("arrancando");
    setDetalle("Arrancando el detector…");

    try {
      const r = await fetch(`${URL_ROBOT}/seguimiento/iniciar`, {
        method: "POST",
      });
      if (!r.ok) {
        const cuerpo = await r.json().catch(() => ({}));
        throw new Error(cuerpo.error ?? `el robot respondió ${r.status}`);
      }
      setEstado("siguiendo");
      setDetalle("Buscando a la persona…");

      pararSondeo();
      void consultar();
      sondeoRef.current = setInterval(() => void consultar(), INTERVALO_MS);
    } catch (e) {
      setEstado("error");
      setDetalle(e instanceof Error ? e.message : "No se pudo iniciar");
    }
  }, [consultar, pararSondeo]);

  const detener = useCallback(async () => {
    pararSondeo();
    setDeteccion(null);
    if (!URL_ROBOT) return;
    try {
      await fetch(`${URL_ROBOT}/seguimiento/detener`, { method: "POST" });
      setEstado("detenido");
      setDetalle("Detenido");
    } catch {
      setEstado("error");
      setDetalle("No se pudo confirmar la parada");
    }
  }, [pararSondeo]);

  // Salir de la página con el seguimiento activo dejaría al robot andando
  // solo por la casa sin nadie mirando.
  useEffect(() => {
    return () => {
      if (sondeoRef.current) clearInterval(sondeoRef.current);
      if (URL_ROBOT) {
        void fetch(`${URL_ROBOT}/seguimiento/detener`, {
          method: "POST",
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  return { estado, detalle, deteccion, iniciar, detener };
}
