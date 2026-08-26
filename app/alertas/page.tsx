"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  MapPin,
  MessageSquare,
  Send,
  Video,
} from "lucide-react";
import {
  Badge,
  Card,
  PageHeader,
  tonoEstadoAlerta,
  tonoSeveridad,
} from "@/components/ui";
import { cn, formatFechaHora, tiempoRelativo } from "@/lib/utils";
import {
  alertas as alertasIniciales,
  etiquetaEstadoAlerta,
  etiquetaSeveridad,
  etiquetaTipoAlerta,
  type Alerta,
  type EstadoAlerta,
} from "@/lib/mock-data";

type Filtro = "todas" | EstadoAlerta;

const filtros: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "en-proceso", etiqueta: "En proceso" },
  { valor: "atendida", etiqueta: "Atendidas" },
];

export default function AlertasPage() {
  const [lista, setLista] = useState<Alerta[]>(alertasIniciales);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [notaAbierta, setNotaAbierta] = useState<string | null>(null);
  const [borrador, setBorrador] = useState("");

  const visibles = useMemo(
    () => (filtro === "todas" ? lista : lista.filter((a) => a.estado === filtro)),
    [lista, filtro]
  );

  const pendientes = lista.filter((a) => a.estado !== "atendida").length;

  function marcarAtendida(id: string) {
    setLista((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: "atendida" } : a))
    );
  }

  function guardarNota(id: string) {
    const texto = borrador.trim();
    if (texto) {
      setLista((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, notas: a.notas ? `${a.notas}\n${texto}` : texto }
            : a
        )
      );
    }
    setBorrador("");
    setNotaAbierta(null);
  }

  return (
    <>
      <PageHeader
        titulo="Alertas y emergencias"
        descripcion={
          pendientes > 0
            ? `Hay ${pendientes} alerta${pendientes > 1 ? "s" : ""} sin atender.`
            : "No hay alertas pendientes. Todo tranquilo por ahora."
        }
      />

      <div
        role="tablist"
        aria-label="Filtrar alertas"
        className="mb-5 flex flex-wrap gap-2"
      >
        {filtros.map((f) => {
          const activo = filtro === f.valor;
          const conteo =
            f.valor === "todas"
              ? lista.length
              : lista.filter((a) => a.estado === f.valor).length;
          return (
            <button
              key={f.valor}
              role="tab"
              aria-selected={activo}
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                activo
                  ? "bg-brand-500 text-white"
                  : "bg-white text-brand-600 ring-1 ring-inset ring-brand-200 hover:bg-brand-50"
              )}
            >
              {f.etiqueta}
              <span className={cn("ml-2", activo ? "text-brand-100" : "text-brand-400")}>
                {conteo}
              </span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-brand-600">
            No hay alertas en esta categoría.
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {visibles.map((a) => {
            const urgente = a.estado !== "atendida" && a.severidad === "critica";
            return (
              <li key={a.id}>
                <Card
                  className={cn(
                    urgente && "border-alert/40 bg-alert-bg/40"
                  )}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                        urgente
                          ? "bg-alert text-white"
                          : "bg-brand-50 text-brand-600"
                      )}
                    >
                      <AlertTriangle size={20} aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-brand-900">
                          {etiquetaTipoAlerta[a.tipo]}
                        </h2>
                        <Badge tono={tonoSeveridad[a.severidad]}>
                          {etiquetaSeveridad[a.severidad]}
                        </Badge>
                        <Badge tono={tonoEstadoAlerta[a.estado]}>
                          {etiquetaEstadoAlerta[a.estado]}
                        </Badge>
                        <Badge tono="neutral">
                          {a.canalNotificacion === "telegram"
                            ? "Telegram"
                            : "App"}
                        </Badge>
                      </div>

                      <p className="mt-2 text-sm text-brand-700">
                        {a.descripcion}
                      </p>

                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} aria-hidden />
                          {a.ubicacion}
                        </span>
                        <span>
                          {formatFechaHora(a.timestamp)} ·{" "}
                          {tiempoRelativo(a.timestamp)}
                        </span>
                      </p>

                      {a.notas && (
                        <div className="mt-3 rounded-xl bg-brand-50/70 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                            Notas del cuidador
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-brand-700">
                            {a.notas}
                          </p>
                        </div>
                      )}

                      {notaAbierta === a.id && (
                        <form
                          className="mt-3 flex gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            guardarNota(a.id);
                          }}
                        >
                          <label htmlFor={`nota-${a.id}`} className="sr-only">
                            Añadir nota
                          </label>
                          <input
                            id={`nota-${a.id}`}
                            autoFocus
                            value={borrador}
                            onChange={(e) => setBorrador(e.target.value)}
                            placeholder="¿Qué pasó? ¿Cómo se resolvió?"
                            className="min-w-0 flex-1 rounded-xl border border-brand-200 px-3.5 py-2 text-sm outline-none placeholder:text-brand-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                          />
                          <button
                            type="submit"
                            aria-label="Guardar nota"
                            className="grid w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white hover:bg-brand-600"
                          >
                            <Send size={15} aria-hidden />
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {a.estado !== "atendida" && (
                        <>
                          <Link
                            href="/telepresencia"
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                          >
                            <Video size={15} aria-hidden />
                            Ver ahora
                          </Link>
                          <button
                            type="button"
                            onClick={() => marcarAtendida(a.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                          >
                            <Check size={15} aria-hidden />
                            Atendida
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNotaAbierta(notaAbierta === a.id ? null : a.id);
                          setBorrador("");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        <MessageSquare size={15} aria-hidden />
                        Nota
                      </button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
