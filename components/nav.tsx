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
import { alertasPendientes, adultoMayor } from "@/lib/mock-data";

const enlaces = [
  { href: "/", etiqueta: "Inicio", icono: LayoutDashboard },
  { href: "/telepresencia", etiqueta: "Telepresencia", icono: Video },
  { href: "/alertas", etiqueta: "Alertas", icono: AlertTriangle },
  { href: "/historial", etiqueta: "Historial", icono: BarChart3 },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const pendientes = alertasPendientes.length;

  return (
    <nav
      aria-label="Navegación principal"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-brand-100 bg-white px-3 py-2 md:h-full md:w-60 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-5"
    >
      <div className="mb-1 hidden items-center gap-2.5 px-2 pb-4 md:flex">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
          <Bot size={20} aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-brand-900">Aliada</p>
          <p className="text-xs text-brand-500">Teleasistencia en casa</p>
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
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              activo
                ? "bg-brand-50 text-brand-800"
                : "text-brand-600 hover:bg-brand-50/60 hover:text-brand-800"
            )}
          >
            <Icono size={18} aria-hidden />
            <span>{etiqueta}</span>
            {conBadge && (
              <span
                className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-alert px-1.5 text-xs font-semibold text-white"
                aria-label={`${pendientes} alertas pendientes`}
              >
                {pendientes}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-auto hidden rounded-xl bg-brand-50/70 p-3 md:block">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
          Cuidando a
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-900">
          {adultoMayor.nombre}
        </p>
        <p className="text-xs text-brand-600">{adultoMayor.edad} años</p>
      </div>
    </nav>
  );
}
