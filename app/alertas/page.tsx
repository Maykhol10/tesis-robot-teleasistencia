"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Video,
} from "lucide-react";
import {
  Badge,
  Boton,
  BotonEnlace,
  Card,
  MarcaSeveridad,
  PageHeader,
  Vacio,
  tonoEstadoAlerta,
  tonoSeveridad,
} from "@/components/ui";
import { BannerAlerta } from "@/components/banner-alerta";
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
  // Confirmación efímera tras una acción: sin feedback, el cuidador no
  // sabe si el toque registró.
  const [confirmacion, setConfirmacion] = useState("");

  const visibles = useMemo(
    () =>
      filtro === "todas" ? lista : lista.filter((a) => a.estado === filtro),
    [lista, filtro]
  );

  const pendientes = lista.filter((a) => a.estado !== "atendida").length;

  function marcarAtendida(id: string) {
    const alerta = lista.find((a) => a.id === id);
    setLista((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: "atendida" } : a))
    );
    setConfirmacion(
      alerta
        ? `${etiquetaTipoAlerta[alerta.tipo]} marcada como atendida.`
        : "Alerta marcada como atendida."
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
      setConfirmacion("Nota guardada.");
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

      <BannerAlerta />

      {/* Anuncio único de los cambios de estado, sin robar el foco. */}
      <p role="status" aria-atomic className="sr-only">
        {confirmacion}
      </p>

      {/* Grupo de filtros. No es un tablist: no hay paneles asociados ni
          navegación por flechas, así que anunciarlo como tal engañaría al
          lector de pantalla. Son botones de alternancia. */}
      <div
        role="group"
        aria-label="Filtrar alertas por estado"
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
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-xl px-4 py-2 text-sm font-bold transition-colors",
                activo
                  ? "bg-signal text-signal-deep"
                  : "bg-base-800 text-ink-muted ring-1 ring-inset ring-base-500 hover:bg-base-700"
              )}
            >
              {f.etiqueta}
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-xs",
                  activo ? "bg-signal-deep/25 text-signal-deep" : "bg-base-700 text-ink-muted"
                )}
              >
                {conteo}
              </span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <Card>
          <Vacio
            icono={<ShieldCheck size={22} aria-hidden />}
            titulo="Sin alertas aquí"
            descripcion="No hay alertas en esta categoría."
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {visibles.map((a) => {
            const urgente = a.estado !== "atendida" && a.severidad === "critica";
            return (
              <li key={a.id}>
                <Card
                  className={cn(
                    // La urgencia se marca con una banda lateral gruesa,
                    // no solo con un tinte de fondo.
                    urgente &&
                      "zona-alerta border-danger/50 border-l-8 border-l-danger bg-danger-bg"
                  )}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                        urgente
                          ? "bg-danger-solid text-white"
                          : "bg-base-700 text-ink-muted"
                      )}
                    >
                      <AlertTriangle size={20} aria-hidden />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-ink">
                          {etiquetaTipoAlerta[a.tipo]}
                        </h2>
                        <Badge tono={tonoSeveridad[a.severidad]}>
                          <MarcaSeveridad severidad={a.severidad} />
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

                      <p className="mt-2 text-sm text-ink">
                        {a.descripcion}
                      </p>

                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} aria-hidden />
                          {a.ubicacion}
                        </span>
                        <span>
                          {formatFechaHora(a.timestamp)} ·{" "}
                          {tiempoRelativo(a.timestamp)}
                        </span>
                      </p>

                      {a.notas && (
                        <div className="mt-3 rounded-xl bg-base-700 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                            Notas del cuidador
                          </p>
                          <p className="mt-1 whitespace-pre-line text-sm text-ink">
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
                          {/* Etiqueta visible: un placeholder solo no basta,
                              desaparece al escribir. */}
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={`nota-${a.id}`}
                              className="mb-1 block text-xs font-bold text-ink-muted"
                            >
                              Añadir nota
                            </label>
                            <input
                              id={`nota-${a.id}`}
                              autoFocus
                              value={borrador}
                              onChange={(e) => setBorrador(e.target.value)}
                              placeholder="¿Qué pasó? ¿Cómo se resolvió?"
                              className="min-h-11 w-full rounded-xl border border-base-500 px-3.5 py-2 text-sm outline-none placeholder:text-ink-faint focus:border-signal"
                            />
                          </div>
                          <Boton
                            type="submit"
                            aria-label="Guardar nota"
                            className="mt-6 w-12 shrink-0 px-0"
                          >
                            <Send size={16} aria-hidden />
                          </Boton>
                        </form>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {a.estado !== "atendida" && (
                        <>
                          <BotonEnlace
                            href="/telepresencia"
                            variante={urgente ? "emergencia" : "primario"}
                          >
                            <Video size={16} aria-hidden />
                            Ver ahora
                          </BotonEnlace>
                          <Boton
                            variante="secundario"
                            onClick={() => marcarAtendida(a.id)}
                          >
                            <Check size={16} aria-hidden />
                            Atendida
                          </Boton>
                        </>
                      )}
                      <Boton
                        variante="secundario"
                        aria-expanded={notaAbierta === a.id}
                        aria-controls={`nota-${a.id}`}
                        onClick={() => {
                          setNotaAbierta(notaAbierta === a.id ? null : a.id);
                          setBorrador("");
                        }}
                      >
                        <MessageSquare size={16} aria-hidden />
                        Nota
                      </Boton>
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
