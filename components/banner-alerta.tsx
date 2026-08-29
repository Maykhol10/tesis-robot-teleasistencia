"use client";

import { useState } from "react";
import { AlertTriangle, MapPin, Video, X } from "lucide-react";
import { alertaCritica, etiquetaTipoAlerta } from "@/lib/mock-data";
import { tiempoRelativo } from "@/lib/utils";
import { BotonEnlace } from "@/components/ui";

/**
 * Aviso destacado de una emergencia sin atender.
 *
 * Vive sólo en la página de alertas: aquí la lista completa queda justo
 * debajo, así que descartarlo no esconde la emergencia — sigue en la lista,
 * marcada como pendiente.
 */
export function BannerAlerta() {
  const [visible, setVisible] = useState(true);

  if (!alertaCritica || !visible) return null;

  const titulo = etiquetaTipoAlerta[alertaCritica.tipo];

  return (
    <div
      role="alert"
      className="zona-alerta animate-pulso-alerta mb-5 overflow-hidden rounded-2xl border border-danger/50 bg-danger-bg"
    >
      {/* Cinta superior: la palabra antes que el dato. */}
      <div className="flex items-center gap-2 bg-danger-solid px-4 py-1.5">
        <AlertTriangle size={14} aria-hidden className="text-white" />
        <span className="text-xs font-bold uppercase tracking-label text-white">
          Emergencia sin atender
        </span>
        <span className="tabular ml-auto text-xs font-bold text-white/90">
          {tiempoRelativo(alertaCritica.timestamp)}
        </span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Descartar este aviso. La alerta seguirá en la lista de abajo."
          className="-mr-1.5 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-ink">{titulo}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-muted">
            <MapPin size={15} aria-hidden className="shrink-0 text-danger" />
            <span className="font-bold text-danger">
              {alertaCritica.ubicacion}
            </span>
            — {alertaCritica.descripcion}
          </p>
        </div>

        <div className="flex flex-1 gap-2 sm:flex-none">
          <BotonEnlace
            href="/telepresencia"
            variante="emergencia"
            className="flex-1 sm:flex-none"
          >
            <Video size={18} aria-hidden />
            Ver ahora
          </BotonEnlace>
        </div>
      </div>
    </div>
  );
}
