"use client";

import {
  AREA_OBJETIVO,
  FACTOR_AREA,
  TOLERANCIA_AREA,
  TOLERANCIA_X,
  type Deteccion,
} from "@/lib/seguimiento";

/**
 * Marcas del seguimiento dibujadas sobre el vídeo.
 *
 * Reproduce lo que `object_tracker.py` pinta con OpenCV en `_draw_overlays`:
 * bandas negras arriba y abajo con FPS, área, desvío y la orden; cuadro de
 * puntería centrado; recuadro de la persona con su porcentaje; y el punto
 * rojo del centro suavizado por Kalman.
 *
 * Va en SVG encima del vídeo en vez de quemado en la imagen: así el vídeo
 * llega limpio, el texto se lee nítido a cualquier tamaño, y la Pi no gasta
 * CPU dibujando —que aquí va justa, con la inferencia ya corriendo.
 */
export function CapaSeguimiento({
  deteccion,
  activo,
  fps,
  invertida = false,
}: {
  deteccion: Deteccion | null;
  activo: boolean;
  fps: number | null;
  invertida?: boolean;
}) {
  const area = deteccion?.area ?? 0;
  const desvio = deteccion?.desviacionX ?? 0;
  const hayPersona = Boolean(deteccion?.caja);

  // Mismo criterio de color que el original: verde dentro de rango, rojo
  // fuera. Es lo que distingue "el robot está a gusto" de "va a corregir".
  const enRangoArea =
    area >= AREA_OBJETIVO - TOLERANCIA_AREA &&
    area <= AREA_OBJETIVO + TOLERANCIA_AREA;
  const colorArea = hayPersona && enRangoArea ? "#00FF00" : "#FF4444";
  // El original compara con `tolerance` (0.1), no con la efectiva.
  const colorDesvio = hayPersona && Math.abs(desvio) < 0.1 ? "#00FF00" : "#FF4444";

  // Cuadro de puntería: `effective_tolerance * min(w,h) * area_factor` sobre
  // un encuadre cuadrado de 100×100 en el viewBox.
  const lado = TOLERANCIA_X * 100 * FACTOR_AREA;

  return (
    <>
      {/* Bandas en HTML, no dentro del SVG: éste se estira sin conservar
          proporción y el texto saldría deformado. */}
      <div className="tabular pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 bg-black px-3 py-1 text-[11px] font-bold">
        <span className="text-[#9696FF]">
          FPS: {fps !== null ? fps.toFixed(1) : "—"}
        </span>
        <span className="text-white/80">
          {activo ? "SEGUIMIENTO ACTIVO" : "SEGUIMIENTO DETENIDO"}
        </span>
      </div>

      <div className="tabular pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-6 gap-y-0.5 bg-black px-3 py-1 text-xs font-bold">
        <span style={{ color: colorArea }}>Area: {area.toFixed(3)}</span>
        <span style={{ color: colorDesvio }}>X: {desvio.toFixed(3)}</span>
        <span className="text-[#4499FF]">{deteccion?.orden ?? "Stop"}</span>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full ${
          invertida ? "rotate-180" : ""
        }`}
      >
        {/* Cuadro de puntería: mientras la persona esté centrada aquí, el
            robot no corrige el giro. */}
        <rect
          x={50 - lado / 2}
          y={50 - lado / 2}
          width={lado}
          height={lado}
          fill="none"
          stroke="#00FF00"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {/* Las dos marcas negras a media altura del cuadro, como el degradado
            de líneas del original. */}
        <line
          x1={50 - lado / 2}
          y1={50}
          x2={50 - lado / 4}
          y2={50}
          stroke="#000"
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={50 + lado / 4}
          y1={50}
          x2={50 + lado / 2}
          y2={50}
          stroke="#000"
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        />

        {deteccion?.caja && (
          <g>
            <rect
              x={deteccion.caja.x0 * 100}
              y={deteccion.caja.y0 * 100}
              width={(deteccion.caja.x1 - deteccion.caja.x0) * 100}
              height={(deteccion.caja.y1 - deteccion.caja.y0) * 100}
              fill="none"
              stroke={colorArea}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
            {/* Centro suavizado por Kalman a media altura: el punto que el
                robot persigue, no el centro crudo del recuadro. */}
            <circle cx={deteccion.centroX * 100} cy={50} r={0.9} fill="#FF0000" />
          </g>
        )}
      </svg>

      {/* Etiqueta de la persona, fuera del SVG para que no se deforme. */}
      {deteccion?.caja && (
        <span
          className="tabular pointer-events-none absolute text-xs font-bold"
          style={
            invertida
              ? {
                  right: `${deteccion.caja.x0 * 100}%`,
                  bottom: `${deteccion.caja.y0 * 100}%`,
                  transform: "translateY(1.35em)",
                  color: colorArea,
                }
              : {
                  left: `${deteccion.caja.x0 * 100}%`,
                  top: `${deteccion.caja.y0 * 100}%`,
                  transform: "translateY(-1.35em)",
                  color: colorArea,
                }
          }
        >
          persona: {Math.round(deteccion.confianza * 100)}%
        </span>
      )}
    </>
  );
}
