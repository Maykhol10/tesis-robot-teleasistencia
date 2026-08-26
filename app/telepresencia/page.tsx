"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Camera,
  Circle,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Square,
  Video,
  VideoOff,
} from "lucide-react";
import {
  Badge,
  Card,
  CardTitle,
  PageHeader,
  PuntoEstado,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  adultoMayor,
  configuracionInicial,
  conversacion,
  estadoRobot,
  etiquetaEmisor,
  type Emisor,
} from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

const estiloMensaje: Record<Emisor, string> = {
  "adulto-mayor": "bg-warm-50 text-brand-900 ring-warm-200",
  cuidador: "bg-brand-500 text-white ring-brand-600",
  "agente-llm": "bg-brand-50 text-brand-800 ring-brand-100",
};

/** Cruceta de teleoperación. Solo se muestra si el cuidador tiene permiso. */
function ControlesMovimiento({ habilitado }: { habilitado: boolean }) {
  const botones = [
    { dir: "adelante", Icono: ArrowUp, clase: "col-start-2 row-start-1" },
    { dir: "izquierda", Icono: ArrowLeft, clase: "col-start-1 row-start-2" },
    { dir: "detener", Icono: Square, clase: "col-start-2 row-start-2" },
    { dir: "derecha", Icono: ArrowRight, clase: "col-start-3 row-start-2" },
    { dir: "atrás", Icono: ArrowDown, clase: "col-start-2 row-start-3" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 grid-rows-3 gap-2">
        {botones.map(({ dir, Icono, clase }) => (
          <button
            key={dir}
            type="button"
            disabled={!habilitado}
            aria-label={`Mover ${dir}`}
            className={cn(
              clase,
              "grid h-12 place-items-center rounded-xl border border-brand-200 bg-white text-brand-700 transition-colors",
              "hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white",
              dir === "detener" && "border-alert/30 text-alert-dark"
            )}
          >
            <Icono size={18} aria-hidden />
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-brand-500">
        {habilitado
          ? "El robot evita obstáculos automáticamente aunque lo estés guiando."
          : "La teleoperación está desactivada en Configuración."}
      </p>
    </div>
  );
}

export default function TelepresenciaPage() {
  const [microfono, setMicrofono] = useState(true);
  const [camara, setCamara] = useState(true);
  const [borrador, setBorrador] = useState("");

  return (
    <>
      <PageHeader
        titulo="Telepresencia"
        descripcion={`Videollamada en vivo con ${adultoMayor.nombre.split(" ")[0]} a través del robot.`}
      >
        <Badge tono="calm">
          <PuntoEstado tono="calm" />
          Llamada activa · 04:12
        </Badge>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* --- Video en vivo --- */}
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-brand-900">
              {/* Marcador de posición del stream RGB-D del robot. */}
              <div className="grid h-full w-full place-items-center text-center">
                <div>
                  <Camera
                    size={40}
                    aria-hidden
                    className="mx-auto text-brand-400"
                  />
                  <p className="mt-3 text-sm text-brand-200">
                    Video en vivo · Intel RealSense D435i
                  </p>
                  <p className="mt-1 text-xs text-brand-400">
                    {estadoRobot.ubicacion} · 1280×720 · 30 fps
                  </p>
                </div>
              </div>

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                <Circle
                  size={8}
                  aria-hidden
                  className="fill-alert text-alert"
                />
                EN VIVO
              </div>

              {/* Miniatura del cuidador (cámara local). */}
              <div className="absolute bottom-4 right-4 grid h-24 w-32 place-items-center rounded-xl border border-white/20 bg-brand-800 text-xs text-brand-300">
                {camara ? "Tu cámara" : "Cámara apagada"}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setMicrofono((v) => !v)}
                aria-pressed={!microfono}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  microfono
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "bg-alert-bg text-alert-dark hover:bg-alert/15"
                )}
              >
                {microfono ? (
                  <Mic size={16} aria-hidden />
                ) : (
                  <MicOff size={16} aria-hidden />
                )}
                {microfono ? "Micrófono" : "Silenciado"}
              </button>

              <button
                type="button"
                onClick={() => setCamara((v) => !v)}
                aria-pressed={!camara}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  camara
                    ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                    : "bg-alert-bg text-alert-dark hover:bg-alert/15"
                )}
              >
                {camara ? (
                  <Video size={16} aria-hidden />
                ) : (
                  <VideoOff size={16} aria-hidden />
                )}
                {camara ? "Cámara" : "Cámara apagada"}
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-alert px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-alert-dark"
              >
                <PhoneOff size={16} aria-hidden />
                Finalizar
              </button>
            </div>
          </Card>

          <Card className="mt-5">
            <CardTitle
              icon={<Bot size={18} aria-hidden className="text-brand-500" />}
            >
              Guiar al robot
            </CardTitle>
            <ControlesMovimiento
              habilitado={configuracionInicial.teleoperacionPermitida}
            />
          </Card>
        </div>

        {/* --- Transcripción del agente conversacional --- */}
        <Card className="flex max-h-[36rem] flex-col lg:max-h-none">
          <CardTitle
            icon={<Bot size={18} aria-hidden className="text-brand-500" />}
          >
            Conversación
          </CardTitle>

          <ol className="flex-1 space-y-3 overflow-y-auto pr-1">
            {conversacion.map((m) => {
              const propio = m.emisor === "cuidador";
              return (
                <li
                  key={m.id}
                  className={cn("flex flex-col", propio && "items-end")}
                >
                  <p className="mb-1 text-xs font-medium text-brand-500">
                    {etiquetaEmisor[m.emisor]} · {formatFechaHora(m.timestamp)}
                  </p>
                  <p
                    className={cn(
                      "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm ring-1 ring-inset",
                      estiloMensaje[m.emisor]
                    )}
                  >
                    {m.texto}
                  </p>
                </li>
              );
            })}
          </ol>

          <form
            className="mt-4 flex gap-2 border-t border-brand-100 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              setBorrador("");
            }}
          >
            <label htmlFor="mensaje" className="sr-only">
              Escribir mensaje
            </label>
            <input
              id="mensaje"
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              placeholder="Escribe un mensaje…"
              className="min-w-0 flex-1 rounded-xl border border-brand-200 px-3.5 py-2.5 text-sm text-brand-900 outline-none placeholder:text-brand-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              className="grid w-11 shrink-0 place-items-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600"
            >
              <Send size={16} aria-hidden />
            </button>
          </form>
          <p className="mt-2 text-xs text-brand-500">
            El robot leerá tu mensaje en voz alta.
          </p>
        </Card>
      </div>
    </>
  );
}
