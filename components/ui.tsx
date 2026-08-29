import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import type {
  EstadoAlerta,
  EstadoConexion,
  SeveridadAlerta,
} from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Primitivas del centro de control.
//
// Principios que estas primitivas imponen:
//  - El color saturado está reservado a los estados. El resto es gris frío.
//  - Ningún estado se comunica solo con color: siempre hay texto o forma.
//  - Todo control interactivo mide >=44px de alto.
//  - Las cifras van en monoespaciada tabular para poder compararlas.
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
  elevada,
}: {
  children: ReactNode;
  className?: string;
  elevada?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-base-500 p-5",
        elevada ? "bg-base-700 shadow-raised" : "bg-base-800 shadow-card",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * Etiqueta de sección en versalitas espaciadas: el tic visual que hace que
 * un panel se lea como instrumental y no como una web.
 */
export function Rotulo({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-label text-ink-faint",
        className
      )}
    >
      {children}
    </p>
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
      <h2 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-label text-ink-muted">
        {icon && <span className="text-signal">{icon}</span>}
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
        <h1 className="text-2xl font-bold tracking-tight text-ink">{titulo}</h1>
        {descripcion && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
            {descripcion}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Botones
// ---------------------------------------------------------------------------

const variantes = {
  primario:
    "bg-signal text-signal-deep hover:bg-signal/85 active:bg-signal/70 font-bold",
  emergencia:
    "bg-danger-solid text-white hover:bg-danger-solid/85 active:bg-danger-solid/70",
  secundario:
    "bg-base-700 text-ink-muted ring-1 ring-inset ring-base-500 hover:bg-base-600 hover:text-ink active:bg-base-500",
  fantasma: "text-ink-muted hover:bg-base-700 hover:text-ink active:bg-base-600",
} as const;

type Variante = keyof typeof variantes;

/** Altura mínima 44px en todas las variantes: es el objetivo táctil mínimo. */
const baseBoton =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function Boton({
  variante = "primario",
  className,
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      type="button"
      className={cn(baseBoton, variantes[variante], className)}
      {...props}
    />
  );
}

export function BotonEnlace({
  variante = "primario",
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return (
    <Link className={cn(baseBoton, variantes[variante], className)} {...props} />
  );
}

// ---------------------------------------------------------------------------
// Badges y estados
// ---------------------------------------------------------------------------

const tonos = {
  ok: "bg-ok-bg text-ok ring-ok/30",
  signal: "bg-signal/10 text-signal ring-signal/30",
  warn: "bg-warn-bg text-warn ring-warn/30",
  danger: "bg-danger-bg text-danger ring-danger/35",
  neutral: "bg-base-700 text-ink-muted ring-base-500",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset",
        tonos[tono],
        className
      )}
    >
      {children}
    </span>
  );
}

export const tonoSeveridad: Record<SeveridadAlerta, Tono> = {
  critica: "danger",
  alta: "warn",
  media: "signal",
};

export const tonoEstadoAlerta: Record<EstadoAlerta, Tono> = {
  pendiente: "danger",
  "en-proceso": "warn",
  atendida: "ok",
};

export const tonoConexion: Record<EstadoConexion, Tono> = {
  "en-linea": "ok",
  inestable: "warn",
  desconectado: "danger",
};

export const etiquetaConexion: Record<EstadoConexion, string> = {
  "en-linea": "En línea",
  inestable: "Inestable",
  desconectado: "Desconectado",
};

/**
 * Marca de severidad. El color no es el único canal: cada nivel lleva una
 * forma distinta (triángulo / rombo / círculo) para quien no distingue
 * rojo de ámbar.
 */
export function MarcaSeveridad({ severidad }: { severidad: SeveridadAlerta }) {
  const forma = {
    critica: "M8 1 L15 14 L1 14 Z", // triángulo
    alta: "M8 1 L15 8 L8 15 L1 8 Z", // rombo
    media: "M8 2 A6 6 0 1 1 7.99 2 Z", // círculo
  }[severidad];
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" aria-hidden>
      <path d={forma} fill="currentColor" />
    </svg>
  );
}

/** Punto de estado con halo — comunica "vivo" sin ser alarmista. */
export function PuntoEstado({ tono = "ok" }: { tono?: Tono }) {
  const color =
    tono === "danger" ? "bg-danger" : tono === "warn" ? "bg-warn" : "bg-ok";
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className={cn(
          "animate-latido absolute inline-flex h-full w-full rounded-full",
          color
        )}
      />
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
    </span>
  );
}

/**
 * Lectura de telemetría. La cifra domina; la etiqueta va arriba en
 * versalitas y la unidad se separa para que el número se lea de un vistazo.
 */
export function Lectura({
  etiqueta,
  valor,
  unidad,
  detalle,
  icono,
  tono = "signal",
  barra,
}: {
  etiqueta: string;
  valor: string;
  unidad?: string;
  detalle?: string;
  icono?: ReactNode;
  tono?: Tono;
  /** Porcentaje 0-100 para la barra inferior. Omitir si no aplica. */
  barra?: number;
}) {
  const colorTexto = {
    ok: "text-ok",
    signal: "text-signal",
    warn: "text-warn",
    danger: "text-danger",
    neutral: "text-ink",
  }[tono];
  const colorBarra = {
    ok: "bg-ok",
    signal: "bg-signal",
    warn: "bg-warn",
    danger: "bg-danger",
    neutral: "bg-ink-faint",
  }[tono];

  return (
    <div className="rounded-2xl border border-base-500 bg-base-800 p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Rotulo>{etiqueta}</Rotulo>
        {icono && <span className={cn("shrink-0", colorTexto)}>{icono}</span>}
      </div>

      <p className="mt-2.5 flex items-baseline gap-1">
        <span className={cn("tabular text-metric font-bold", colorTexto)}>
          {valor}
        </span>
        {unidad && (
          <span className="text-sm font-bold text-ink-faint">{unidad}</span>
        )}
      </p>

      {barra !== undefined && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-base-600">
          <div
            className={cn("h-full rounded-full transition-all", colorBarra)}
            style={{ width: `${Math.max(0, Math.min(100, barra))}%` }}
          />
        </div>
      )}

      {detalle && (
        <p className="mt-2 truncate text-xs text-ink-faint">{detalle}</p>
      )}
    </div>
  );
}

/** Barra de progreso genérica (batería, sensibilidad, etc.). */
export function Barra({
  valor,
  tono = "ok",
  etiqueta,
}: {
  valor: number;
  tono?: "ok" | "warn" | "danger" | "signal";
  etiqueta?: string;
}) {
  const color = {
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
    signal: "bg-signal",
  }[tono];
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-base-600"
      role="progressbar"
      aria-valuenow={Math.round(valor)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={etiqueta}
    >
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${Math.max(0, Math.min(100, valor))}%` }}
      />
    </div>
  );
}

/**
 * Gráfico de chispa en SVG: la silueta de una serie, sin ejes ni leyenda.
 * Sirve para dar contexto a una cifra sin robarle protagonismo.
 */
export function Chispa({
  datos,
  tono = "signal",
  className,
}: {
  datos: number[];
  tono?: "ok" | "signal" | "warn";
  className?: string;
}) {
  if (datos.length < 2) return null;
  const max = Math.max(...datos);
  const min = Math.min(...datos);
  const rango = max - min || 1;
  const puntos = datos.map((d, i) => {
    const x = (i / (datos.length - 1)) * 100;
    const y = 28 - ((d - min) / rango) * 24 - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const color = { ok: "#34D399", signal: "#22D3EE", warn: "#FBBF24" }[tono];

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
      aria-hidden
    >
      <polyline
        points={`0,28 ${puntos.join(" ")} 100,28`}
        fill={color}
        fillOpacity={0.12}
        stroke="none"
      />
      <polyline
        points={puntos.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Estado vacío honesto: dice qué falta y por qué está bien. */
export function Vacio({
  icono,
  titulo,
  descripcion,
}: {
  icono?: ReactNode;
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div className="grid place-items-center gap-2 px-4 py-10 text-center">
      {icono && (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-base-700 text-ink-faint">
          {icono}
        </div>
      )}
      <p className="text-base font-bold text-ink">{titulo}</p>
      {descripcion && (
        <p className="max-w-sm text-sm text-ink-faint">{descripcion}</p>
      )}
    </div>
  );
}
