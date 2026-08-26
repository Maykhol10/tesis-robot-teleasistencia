import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type {
  EstadoAlerta,
  EstadoConexion,
  SeveridadAlerta,
} from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Primitivas de UI compartidas por todas las pantallas.
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-brand-100 bg-white p-5 shadow-card",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  icon,
  action,
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-brand-800">
        {icon}
        {children}
      </h2>
      {action}
    </header>
  );
}

export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-brand-600">{descripcion}</p>
        )}
      </div>
      {children}
    </header>
  );
}

const tonos = {
  calm: "bg-calm/10 text-calm ring-calm/20",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  warm: "bg-warm-50 text-warm-500 ring-warm-200",
  warning: "bg-warning/10 text-[#a5761f] ring-warning/25",
  alert: "bg-alert-bg text-alert-dark ring-alert/25",
  neutral: "bg-brand-50 text-brand-600 ring-brand-100",
} as const;

export type Tono = keyof typeof tonos;

export function Badge({
  children,
  tono = "neutral",
  className,
}: {
  children: ReactNode;
  tono?: Tono;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tonos[tono],
        className
      )}
    >
      {children}
    </span>
  );
}

export const tonoSeveridad: Record<SeveridadAlerta, Tono> = {
  critica: "alert",
  alta: "warning",
  media: "brand",
};

export const tonoEstadoAlerta: Record<EstadoAlerta, Tono> = {
  pendiente: "alert",
  "en-proceso": "warning",
  atendida: "calm",
};

export const tonoConexion: Record<EstadoConexion, Tono> = {
  "en-linea": "calm",
  inestable: "warning",
  desconectado: "alert",
};

export const etiquetaConexion: Record<EstadoConexion, string> = {
  "en-linea": "En línea",
  inestable: "Conexión inestable",
  desconectado: "Desconectado",
};

/** Punto de estado con halo — comunica "vivo" sin ser alarmista. */
export function PuntoEstado({ tono = "calm" }: { tono?: Tono }) {
  const color =
    tono === "alert"
      ? "bg-alert"
      : tono === "warning"
        ? "bg-warning"
        : "bg-calm";
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-40",
          color
        )}
      />
      <span
        className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)}
      />
    </span>
  );
}

/** Métrica destacada para el dashboard. */
export function Metrica({
  etiqueta,
  valor,
  detalle,
  icono,
  tono = "brand",
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  icono?: ReactNode;
  tono?: Tono;
}) {
  return (
    <Card className="flex items-start gap-4">
      {icono && (
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            tonos[tono]
          )}
        >
          {icono}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
          {etiqueta}
        </p>
        <p className="mt-1 text-xl font-semibold text-brand-900">{valor}</p>
        {detalle && (
          <p className="mt-0.5 truncate text-sm text-brand-600">{detalle}</p>
        )}
      </div>
    </Card>
  );
}

/** Barra de progreso genérica (batería, sensibilidad, etc.). */
export function Barra({
  valor,
  tono = "calm",
}: {
  valor: number;
  tono?: "calm" | "warning" | "alert" | "brand";
}) {
  const color = {
    calm: "bg-calm",
    warning: "bg-warning",
    alert: "bg-alert",
    brand: "bg-brand-500",
  }[tono];
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-brand-100"
      role="progressbar"
      aria-valuenow={Math.round(valor)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.max(0, Math.min(100, valor))}%` }}
      />
    </div>
  );
}
