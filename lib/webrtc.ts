"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Conexión WebRTC con el robot.
 *
 * El robot expone POST /offer: recibe la oferta SDP del navegador y responde
 * con la respuesta. A partir de ahí el video viaja por RTP/UDP directo entre
 * el navegador y la Pi, sin pasar por este servidor ni por la web.
 *
 * La URL del robot vive en NEXT_PUBLIC_ROBOT_URL porque cambia según dónde
 * esté desplegado: IP local en desarrollo, túnel HTTPS desde fuera de casa.
 * Sin la variable definida, la interfaz se queda en modo demostración.
 */
export const URL_ROBOT = process.env.NEXT_PUBLIC_ROBOT_URL ?? "";

export type EstadoStream =
  | "sin-configurar"
  | "desconectado"
  | "conectando"
  | "conectado"
  | "error";

export interface Stream {
  estado: EstadoStream;
  detalle: string;
  fps: number | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  conectar: () => Promise<void>;
  desconectar: () => void;
}

export function useStreamRobot(): Stream {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const medidorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [estado, setEstado] = useState<EstadoStream>(
    URL_ROBOT ? "desconectado" : "sin-configurar"
  );
  const [detalle, setDetalle] = useState(
    URL_ROBOT ? "Listo para conectar" : "Sin robot configurado"
  );
  const [fps, setFps] = useState<number | null>(null);

  const desconectar = useCallback(() => {
    if (medidorRef.current) {
      clearInterval(medidorRef.current);
      medidorRef.current = null;
    }
    pcRef.current?.close();
    pcRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setFps(null);
    setEstado(URL_ROBOT ? "desconectado" : "sin-configurar");
    setDetalle(URL_ROBOT ? "Desconectado" : "Sin robot configurado");
  }, []);

  const conectar = useCallback(async () => {
    if (!URL_ROBOT) return;

    desconectar();
    setEstado("conectando");
    setDetalle("Negociando con el robot…");

    try {
      // STUN permite al navegador descubrir su propia dirección pública. Sin
      // esto sólo anuncia su IP privada, y desde otra red no hay ninguna ruta
      // por la que el video pueda llegar aunque la señalización funcione.
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addEventListener("track", (e) => {
        if (videoRef.current) videoRef.current.srcObject = e.streams[0];
      });

      pc.addEventListener("connectionstatechange", () => {
        if (pc.connectionState === "connected") {
          setEstado("conectado");
          setDetalle("Transmitiendo");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setEstado("error");
          setDetalle("Se perdió la conexión con el robot");
        }
      });

      // Sólo recibimos: la cámara del cuidador se envía aparte, si se activa.
      pc.addTransceiver("video", { direction: "recvonly" });

      await pc.setLocalDescription(await pc.createOffer());

      // Esperamos a que ICE termine para mandar una única oferta completa.
      await new Promise<void>((listo) => {
        if (pc.iceGatheringState === "complete") return listo();
        const revisar = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", revisar);
            listo();
          }
        };
        pc.addEventListener("icegatheringstatechange", revisar);
      });

      const r = await fetch(`${URL_ROBOT}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp,
          type: pc.localDescription?.type,
        }),
      });
      if (!r.ok) throw new Error(`el robot respondió ${r.status}`);

      await pc.setRemoteDescription(await r.json());

      // Los fps reales los reporta el navegador, no los suponemos.
      medidorRef.current = setInterval(async () => {
        const stats = await pc.getStats();
        stats.forEach((s) => {
          if (s.type === "inbound-rtp" && s.kind === "video") {
            setFps(s.framesPerSecond ?? null);
          }
        });
      }, 1000);
    } catch (e) {
      setEstado("error");
      setDetalle(e instanceof Error ? e.message : "No se pudo conectar");
      pcRef.current?.close();
      pcRef.current = null;
    }
  }, [desconectar]);

  // Al salir de la página cerramos la conexión: si no, la Pi sigue enviando.
  useEffect(() => desconectar, [desconectar]);

  return { estado, detalle, fps, videoRef, conectar, desconectar };
}
