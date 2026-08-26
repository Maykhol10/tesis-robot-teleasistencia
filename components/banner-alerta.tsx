import Link from "next/link";
import { AlertTriangle, MapPin, Video } from "lucide-react";
import { alertaCritica, etiquetaTipoAlerta } from "@/lib/mock-data";
import { tiempoRelativo } from "@/lib/utils";

/**
 * Banner persistente para una emergencia sin atender. Es lo primero que debe
 * ver el cuidador al entrar, en cualquier pantalla.
 */
export function BannerAlerta() {
  if (!alertaCritica) return null;

  return (
    <div
      role="alert"
      className="animate-pulso-alerta mx-4 mt-4 rounded-2xl border border-alert/30 bg-alert-bg p-4 md:mx-6"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-alert text-white">
          <AlertTriangle size={22} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-alert-dark">
            {etiquetaTipoAlerta[alertaCritica.tipo]} detectada ·{" "}
            {tiempoRelativo(alertaCritica.timestamp)}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-alert-dark/85">
            <MapPin size={14} aria-hidden className="shrink-0" />
            {alertaCritica.ubicacion} — {alertaCritica.descripcion}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/telepresencia"
            className="inline-flex items-center gap-2 rounded-xl bg-alert px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-alert-dark"
          >
            <Video size={16} aria-hidden />
            Ver ahora
          </Link>
          <Link
            href="/alertas"
            className="inline-flex items-center rounded-xl border border-alert/30 bg-white px-4 py-2.5 text-sm font-semibold text-alert-dark transition-colors hover:bg-alert-bg"
          >
            Detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
