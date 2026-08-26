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
import { Badge, Card, CardTitle, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  configuracionInicial,
  contactosEmergencia as contactosIniciales,
} from "@/lib/mock-data";

function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium text-brand-800">{etiqueta}</label>
        {children}
      </div>
      {ayuda && <p className="mt-1.5 text-xs text-brand-500">{ayuda}</p>}
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
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        activo ? "bg-calm" : "bg-brand-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          activo ? "translate-x-[1.375rem]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState(configuracionInicial);
  const [contactos, setContactos] = useState(contactosIniciales);

  const nivelSensibilidad =
    config.sensibilidadCaidas >= 80
      ? { texto: "Muy alta — más avisos, más falsas alarmas", tono: "warning" as const }
      : config.sensibilidadCaidas >= 50
        ? { texto: "Equilibrada — recomendada", tono: "calm" as const }
        : { texto: "Baja — solo caídas evidentes", tono: "warning" as const };

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
            icon={<Phone size={18} aria-hidden className="text-brand-500" />}
            action={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                <Plus size={15} aria-hidden />
                Añadir contacto
              </button>
            }
          >
            Contactos de emergencia
          </CardTitle>

          <p className="mb-4 text-sm text-brand-600">
            Se avisa en este orden. Si el primero no responde en 2 minutos, se
            notifica al siguiente.
          </p>

          <ul className="divide-y divide-brand-100">
            {contactos.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                <GripVertical
                  size={16}
                  aria-hidden
                  className="shrink-0 cursor-grab text-brand-300"
                />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brand-900">{c.nombre}</p>
                  <p className="text-sm text-brand-600">
                    {c.relacion} · {c.telefono}
                  </p>
                </div>
                {c.telegram && <Badge tono="brand">Telegram</Badge>}
                <button
                  type="button"
                  aria-label={`Eliminar a ${c.nombre}`}
                  onClick={() =>
                    setContactos((prev) => prev.filter((x) => x.id !== c.id))
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-brand-400 transition-colors hover:bg-alert-bg hover:text-alert-dark"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* --- Detección de caídas --- */}
        <Card>
          <CardTitle
            icon={
              <ShieldAlert size={18} aria-hidden className="text-brand-500" />
            }
          >
            Detección de caídas
          </CardTitle>

          <div className="divide-y divide-brand-100">
            <div className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="sensibilidad"
                  className="text-sm font-medium text-brand-800"
                >
                  Sensibilidad
                </label>
                <span className="text-sm font-semibold text-brand-700">
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
                className="mt-3 w-full accent-brand-500"
              />
              <div className="mt-2">
                <Badge tono={nivelSensibilidad.tono}>
                  {nivelSensibilidad.texto}
                </Badge>
              </div>
            </div>

            <Campo
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
                aria-label="Minutos de inactividad"
                className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
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
            icon={<Clock size={18} aria-hidden className="text-brand-500" />}
          >
            Horarios de check-in
          </CardTitle>

          <p className="mb-1 text-sm text-brand-600">
            El robot busca a la persona y saluda para comprobar que está bien.
          </p>

          <div className="divide-y divide-brand-100">
            <Campo etiqueta="Desde">
              <input
                type="time"
                value={config.checkInInicio}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, checkInInicio: e.target.value }))
                }
                aria-label="Hora de inicio"
                className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              />
            </Campo>

            <Campo etiqueta="Hasta">
              <input
                type="time"
                value={config.checkInFin}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, checkInFin: e.target.value }))
                }
                aria-label="Hora de fin"
                className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              />
            </Campo>

            <Campo
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
                aria-label="Intervalo de check-in"
                className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
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
            icon={<Bot size={18} aria-hidden className="text-brand-500" />}
          >
            Acerca del robot
          </CardTitle>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
                Cómputo embebido
              </dt>
              <dd className="mt-1 text-sm text-brand-800">
                NVIDIA Jetson Orin NX 16 GB
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
                Cámara
              </dt>
              <dd className="mt-1 text-sm text-brand-800">
                Intel RealSense D435i (RGB-D)
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
                Notificaciones
              </dt>
              <dd className="mt-1 text-sm text-brand-800">
                N8N → Telegram
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setConfig(configuracionInicial);
            setContactos(contactosIniciales);
          }}
          className="rounded-xl border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Descartar cambios
        </button>
        <button
          type="button"
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
        >
          Guardar configuración
        </button>
      </div>
    </>
  );
}
