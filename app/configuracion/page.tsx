"use client";

import { useState } from "react";
import {
  Bot,
  Clock,
  GripVertical,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Badge, Boton, Card, CardTitle, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  configuracionInicial,
  contactosEmergencia as contactosIniciales,
} from "@/lib/mock-data";

function Campo({
  etiqueta,
  ayuda,
  htmlFor,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  /** Id del control: sin esto la etiqueta es solo texto suelto. */
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-bold text-ink"
        >
          {etiqueta}
        </label>
        {children}
      </div>
      {ayuda && <p className="mt-1.5 text-sm text-ink-muted">{ayuda}</p>}
    </div>
  );
}

function Interruptor({
  activo,
  onChange,
  etiqueta,
}: {
  activo: boolean;
  onChange: (v: boolean) => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onChange(!activo)}
      // El contenedor mide 44px de alto aunque la pista sea mas delgada.
      className="inline-flex min-h-11 cursor-pointer items-center gap-2.5"
    >
      {/* Estado en palabras: no depende de distinguir verde de gris. */}
      <span
        className={cn(
          "text-sm font-bold",
          activo ? "text-ok" : "text-ink-muted"
        )}
      >
        {activo ? "Activado" : "Desactivado"}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          activo ? "bg-ok" : "bg-base-400"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-base-800 shadow transition-transform",
            activo ? "translate-x-[1.375rem]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState(configuracionInicial);
  const [contactos, setContactos] = useState(contactosIniciales);
  // Borrar un contacto de emergencia es destructivo: primero se pide
  // confirmacion explicita en la propia fila.
  const [porEliminar, setPorEliminar] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  const nivelSensibilidad =
    config.sensibilidadCaidas >= 80
      ? { texto: "Muy alta — más avisos, más falsas alarmas", tono: "warn" as const }
      : config.sensibilidadCaidas >= 50
        ? { texto: "Equilibrada — recomendada", tono: "ok" as const }
        : { texto: "Baja — solo caídas evidentes", tono: "warn" as const };

  return (
    <>
      <PageHeader
        titulo="Configuración"
        descripcion="Ajusta cómo el robot vigila, cuándo hace check-in y a quién avisa en una emergencia."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- Contactos de emergencia --- */}
        <Card className="lg:col-span-2">
          <CardTitle
            icon={<Phone size={20} aria-hidden className="text-ink-faint" />}
            action={
              <Boton variante="secundario">
                <Plus size={16} aria-hidden />
                Añadir contacto
              </Boton>
            }
          >
            Contactos de emergencia
          </CardTitle>

          <p className="mb-4 text-sm text-ink-muted">
            Se avisa en este orden. Si el primero no responde en 2 minutos, se
            notifica al siguiente.
          </p>

          <ul className="divide-y divide-base-500">
            {contactos.map((c, i) => (
              <li key={c.id} className="py-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <GripVertical
                    size={18}
                    aria-hidden
                    className="shrink-0 cursor-grab text-ink-faint"
                  />
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-base-700 text-sm font-bold text-ink-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{c.nombre}</p>
                    <p className="text-sm text-ink-muted">
                      {c.relacion} · {c.telefono}
                    </p>
                  </div>
                  {c.telegram && <Badge tono="signal">Telegram</Badge>}
                  <button
                    type="button"
                    aria-label={`Eliminar a ${c.nombre}`}
                    onClick={() => setPorEliminar(c.id)}
                    className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </div>

                {porEliminar === c.id && (
                  <div className="zona-alerta mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-danger-bg p-3">
                    <p className="min-w-0 flex-1 text-sm font-bold text-danger">
                      ¿Quitar a {c.nombre} de la cadena de avisos? Dejará de
                      recibir alertas de emergencia.
                    </p>
                    <Boton
                      variante="emergencia"
                      onClick={() => {
                        setContactos((prev) =>
                          prev.filter((x) => x.id !== c.id)
                        );
                        setPorEliminar(null);
                        setAviso(`${c.nombre} ya no recibirá avisos.`);
                      }}
                    >
                      Sí, quitar
                    </Boton>
                    <Boton
                      variante="secundario"
                      onClick={() => setPorEliminar(null)}
                    >
                      Cancelar
                    </Boton>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* --- Detección de caídas --- */}
        <Card>
          <CardTitle
            icon={
              <ShieldAlert size={20} aria-hidden className="text-ink-faint" />
            }
          >
            Detección de caídas
          </CardTitle>

          <div className="divide-y divide-base-500">
            <div className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="sensibilidad"
                  className="text-sm font-bold text-ink"
                >
                  Sensibilidad
                </label>
                <span className="text-base font-bold text-ink">
                  {config.sensibilidadCaidas}%
                </span>
              </div>
              <input
                id="sensibilidad"
                type="range"
                min={0}
                max={100}
                step={5}
                value={config.sensibilidadCaidas}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    sensibilidadCaidas: Number(e.target.value),
                  }))
                }
                aria-describedby="sensibilidad-nivel"
                className="mt-3 h-6 w-full cursor-pointer accent-signal"
              />
              <div className="mt-2" id="sensibilidad-nivel">
                <Badge tono={nivelSensibilidad.tono}>
                  {nivelSensibilidad.texto}
                </Badge>
              </div>
            </div>

            <Campo
              htmlFor="inactividad"
              etiqueta="Avisar tras inactividad"
              ayuda="Minutos sin movimiento detectado en horario diurno antes de generar una alerta."
            >
              <select
                value={config.alertasInactividadMin}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    alertasInactividadMin: Number(e.target.value),
                  }))
                }
                id="inactividad"
                className="min-h-11 cursor-pointer rounded-xl border border-base-500 bg-base-800 px-3 py-2 text-sm font-bold text-ink outline-none focus:border-signal"
              >
                {[30, 60, 90, 120, 180].map((m) => (
                  <option key={m} value={m}>
                    {m} minutos
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              etiqueta="Permitir teleoperación"
              ayuda="Deja que los cuidadores guíen manualmente al robot durante una videollamada."
            >
              <Interruptor
                activo={config.teleoperacionPermitida}
                etiqueta="Permitir teleoperación"
                onChange={(v) =>
                  setConfig((c) => ({ ...c, teleoperacionPermitida: v }))
                }
              />
            </Campo>
          </div>
        </Card>

        {/* --- Check-in --- */}
        <Card>
          <CardTitle
            icon={<Clock size={20} aria-hidden className="text-ink-faint" />}
          >
            Horarios de check-in
          </CardTitle>

          <p className="mb-3 text-sm text-ink-muted">
            El robot busca a la persona y saluda para comprobar que está bien.
          </p>

          <div className="divide-y divide-base-500">
            <Campo htmlFor="desde" etiqueta="Desde">
              <input
                type="time"
                value={config.checkInInicio}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, checkInInicio: e.target.value }))
                }
                id="desde"
                className="min-h-11 rounded-xl border border-base-500 px-3 py-2 text-sm font-bold text-ink outline-none focus:border-signal"
              />
            </Campo>

            <Campo htmlFor="hasta" etiqueta="Hasta">
              <input
                type="time"
                value={config.checkInFin}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, checkInFin: e.target.value }))
                }
                id="hasta"
                className="min-h-11 rounded-xl border border-base-500 px-3 py-2 text-sm font-bold text-ink outline-none focus:border-signal"
              />
            </Campo>

            <Campo
              htmlFor="intervalo"
              etiqueta="Cada"
              ayuda="Fuera de este horario el robot no interrumpe el descanso, pero sigue vigilando."
            >
              <select
                value={config.intervaloCheckInMin}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    intervaloCheckInMin: Number(e.target.value),
                  }))
                }
                id="intervalo"
                className="min-h-11 cursor-pointer rounded-xl border border-base-500 bg-base-800 px-3 py-2 text-sm font-bold text-ink outline-none focus:border-signal"
              >
                {[60, 120, 180, 240].map((m) => (
                  <option key={m} value={m}>
                    {m / 60} {m === 60 ? "hora" : "horas"}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </Card>

        {/* --- Info del robot --- */}
        <Card className="lg:col-span-2">
          <CardTitle
            icon={<Bot size={20} aria-hidden className="text-ink-faint" />}
          >
            Acerca del robot
          </CardTitle>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Cómputo embebido
              </dt>
              <dd className="mt-1 text-sm text-ink">
                NVIDIA Jetson Orin NX 16 GB
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Cámara
              </dt>
              <dd className="mt-1 text-sm text-ink">
                Intel RealSense D435i (RGB-D)
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Notificaciones
              </dt>
              <dd className="mt-1 text-sm text-ink">
                N8N → Telegram
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {/* Confirmacion de la accion: sin esto no se sabe si guardo. */}
        <p
          role="status"
          aria-atomic
          className="mr-auto text-sm font-bold text-ok"
        >
          {aviso}
        </p>
        <Boton
          variante="secundario"
          className="px-5"
          onClick={() => {
            setConfig(configuracionInicial);
            setContactos(contactosIniciales);
            setPorEliminar(null);
            setAviso("Cambios descartados.");
          }}
        >
          Descartar cambios
        </Boton>
        <Boton className="px-5" onClick={() => setAviso("Configuración guardada.")}>
          Guardar configuración
        </Boton>
      </div>
    </>
  );
}
