"use client";

import { Pause, Play, UserSearch } from "lucide-react";
import { Boton, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  AREA_OBJETIVO,
  type Seguimiento,
} from "@/lib/seguimiento";

/**
 * Modo automático: el robot sigue a la persona por sí solo.
 *
 * Replica el seguidor de `object_tracker.py`: mantiene a la persona centrada
 * girando, y a la distancia adecuada avanzando o retrocediendo según cuánto
 * ocupe en el encuadre.
 */
export function ModoAutomatico({ seguimiento }: { seguimiento: Seguimiento }) {
  const { estado, detalle, deteccion } = seguimiento;
  const activo = estado === "siguiendo";
  const ocupado = estado === "arrancando";
  const disponible = estado !== "sin-configurar";

  return (
    <div className="flex flex-1 flex-col">
      <CardTitle
        icon={<UserSearch size={20} aria-hidden className="text-ink-faint" />}
      >
        Seguimiento de personas
      </CardTitle>

      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="text-center">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-label",
              activo
                ? "bg-ok-bg text-ok ring-1 ring-inset ring-ok/30"
                : estado === "error"
                  ? "bg-danger-bg text-danger ring-1 ring-inset ring-danger/30"
                  : "bg-base-700 text-ink-faint"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                activo
                  ? "animate-pulse bg-ok"
                  : estado === "error"
                    ? "bg-danger"
                    : "bg-ink-faint"
              )}
            />
            {activo ? "Siguiendo" : estado === "error" ? "Error" : "Detenido"}
          </span>

          <p
            className="mt-3 text-sm text-ink-muted"
            role={estado === "error" ? "alert" : "status"}
          >
            {detalle}
          </p>
        </div>

        <Boton
          onClick={() =>
            activo ? void seguimiento.detener() : void seguimiento.iniciar()
          }
          disabled={!disponible || ocupado}
          variante={activo ? "secundario" : "primario"}
          className="mx-auto"
        >
          {activo ? (
            <Pause size={18} aria-hidden />
          ) : (
            <Play size={18} aria-hidden />
          )}
          {ocupado
            ? "Arrancando…"
            : activo
              ? "Detener seguimiento"
              : "Iniciar seguimiento"}
        </Boton>

        {activo && (
          <dl className="tabular space-y-1.5 border-t border-base-500 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-faint">Área objetivo</dt>
              <dd className="font-bold text-ink-muted">{AREA_OBJETIVO}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-faint">Área actual</dt>
              <dd className="font-bold text-ink-muted">
                {deteccion ? deteccion.area.toFixed(3) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-faint">Orden</dt>
              <dd className="font-bold text-signal">
                {deteccion?.orden ?? "—"}
              </dd>
            </div>
          </dl>
        )}

        <p className="text-center text-xs text-ink-faint">
          Cambia a Teleoperado para conducirlo tú y detener el seguimiento.
        </p>
      </div>
    </div>
  );
}
