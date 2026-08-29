"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  LayoutDashboard,
  Settings,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { alertasPendientes, adultoMayor, estadoRobot } from "@/lib/mock-data";
import { PuntoEstado } from "@/components/ui";

const enlaces = [
  { href: "/", etiqueta: "Panel", icono: LayoutDashboard },
  { href: "/telepresencia", etiqueta: "Telepresencia", icono: Video },
  { href: "/alertas", etiqueta: "Alertas", icono: AlertTriangle },
  { href: "/historial", etiqueta: "Historial", icono: BarChart3 },
  { href: "/configuracion", etiqueta: "Ajustes", icono: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const pendientes = alertasPendientes.length;

  return (
    <nav
      aria-label="Navegación principal"
      className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-base-500 bg-base-900 px-3 py-2 md:h-full md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-4"
    >
      {/* Identidad del sistema */}
      <div className="mb-3 hidden items-center gap-3 px-2 pb-4 pt-1 md:flex">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal/10 text-signal ring-1 ring-inset ring-signal/30">
          <Bot size={21} aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-base font-bold tracking-tight text-ink">ALIADA</p>
          <p className="text-xs tracking-label text-ink-faint">
            TELEASISTENCIA
          </p>
        </div>
      </div>

      {enlaces.map(({ href, etiqueta, icono: Icono }) => {
        const activo =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        const conBadge = href === "/alertas" && pendientes > 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              // min-h-11 = 44px: objetivo táctil mínimo en toda la barra.
              "group relative flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
              activo
                ? "bg-base-700 text-ink"
                : "text-ink-faint hover:bg-base-800 hover:text-ink-muted"
            )}
          >
            {/* Marca de página activa: barra cian a la izquierda. El estado
                no depende solo del tono del fondo. */}
            {activo && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-signal"
              />
            )}
            <Icono
              size={19}
              aria-hidden
              className={activo ? "text-signal" : ""}
            />
            <span>{etiqueta}</span>
            {conBadge && (
              <span
                className="ml-auto grid h-6 min-w-6 place-items-center rounded-md bg-danger-solid px-1.5 text-xs font-bold tabular text-white"
                aria-hidden
              >
                {pendientes}
              </span>
            )}
          </Link>
        );
      })}

      {/* Un único anuncio contextual para el contador, en lugar de leer
          un número suelto en el enlace. */}
      {pendientes > 0 && (
        <p role="status" aria-atomic className="sr-only">
          {pendientes}{" "}
          {pendientes === 1 ? "alerta pendiente" : "alertas pendientes"}
        </p>
      )}

      {/* Pie: a quién se está cuidando y si el enlace con el robot vive. */}
      <div className="mt-auto hidden rounded-xl border border-base-500 bg-base-800 p-3 md:block">
        <p className="text-xs font-bold uppercase tracking-label text-ink-faint">
          Vigilando
        </p>
        <p className="mt-1.5 text-sm font-bold text-ink">
          {adultoMayor.nombre}
        </p>
        <p className="tabular text-xs text-ink-faint">
          {adultoMayor.edad} años
        </p>
        <div className="mt-3 flex items-center gap-2 border-t border-base-500 pt-2.5">
          <PuntoEstado tono={estadoRobot.conexion === "en-linea" ? "ok" : "warn"} />
          <span className="text-xs font-bold text-ink-muted">
            Enlace {estadoRobot.conexion === "en-linea" ? "activo" : "inestable"}
          </span>
        </div>
      </div>
    </nav>
  );
}
