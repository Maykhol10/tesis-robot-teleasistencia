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
  Boton,
  Card,
  CardTitle,
  PageHeader,
  PuntoEstado,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStreamRobot } from "@/lib/webrtc";
import {
  adultoMayor,
  configuracionInicial,
  conversacion,
  estadoRobot,
  etiquetaEmisor,
  type Emisor,
} from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

// Cada emisor tiene su propio color de burbuja: quien habla se distingue
// sin leer la etiqueta.
const estiloMensaje: Record<Emisor, string> = {
  "adulto-mayor": "bg-warn-bg text-ink ring-warn/30",
  cuidador: "bg-signal/15 text-ink ring-signal/40",
  "agente-llm": "bg-base-700 text-ink-muted ring-base-500",
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
              "grid h-14 cursor-pointer place-items-center rounded-xl border border-base-500 bg-base-800 text-ink-muted transition-colors",
              "hover:border-base-400 hover:bg-base-700 active:bg-base-600",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-base-800",
              dir === "detener" && "border-danger/50 bg-danger-bg text-danger"
            )}
          >
            <Icono size={22} aria-hidden />
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-muted">
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
  const stream = useStreamRobot();

  return (
    <>
      <PageHeader
        titulo="Telepresencia"
        descripcion={`Videollamada en vivo con ${adultoMayor.nombre.split(" ")[0]} a través del robot.`}
      >
        <Badge tono={stream.estado === "conectado" ? "ok" : "neutral"}>
          <PuntoEstado tono={stream.estado === "conectado" ? "ok" : "neutral"} />
          {stream.estado === "conectado" ? "Llamada activa" : stream.detalle}
        </Badge>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* --- Video en vivo --- */}
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="reticula relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
              {/* Stream del robot. Sigue oculto hasta que llega el primer
                  frame: un <video> vacío se ve como un rectángulo negro. */}
              <video
                ref={stream.videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "h-full w-full object-cover",
                  stream.estado !== "conectado" && "hidden"
                )}
              />

              {stream.estado !== "conectado" && (
                <div className="grid h-full w-full place-items-center text-center">
                  <div>
                    <Camera
                      size={40}
                      aria-hidden
                      className="mx-auto text-ink-faint"
                    />
                    <p className="mt-3 text-sm font-bold text-ink-muted">
                      {stream.estado === "sin-configurar"
                        ? "Modo demostración"
                        : "Cámara del robot"}
                    </p>
                    <p className="tabular mt-1 text-xs text-ink-faint">
                      {stream.detalle}
                    </p>
                    {stream.estado !== "sin-configurar" && (
                      <Boton
                        onClick={stream.conectar}
                        variante="secundario"
                        className="mt-4"
                        disabled={stream.estado === "conectando"}
                      >
                        <Video size={18} aria-hidden />
                        {stream.estado === "conectando"
                          ? "Conectando…"
                          : "Conectar al robot"}
                      </Boton>
                    )}
                  </div>
                </div>
              )}

              {/* Esquinas de encuadre: leen como visor de cámara. */}
              {[
                "left-3 top-3 border-l-2 border-t-2",
                "right-3 top-3 border-r-2 border-t-2",
                "left-3 bottom-3 border-b-2 border-l-2",
                "right-3 bottom-3 border-b-2 border-r-2",
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`absolute h-6 w-6 border-signal/50 ${pos}`}
                />
              ))}

              {/* El distintivo sólo aparece con video real: si no, afirmaría
                  que hay una emisión en curso que no existe. */}
              {stream.estado === "conectado" && (
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md bg-danger-solid px-2.5 py-1 text-xs font-bold uppercase tracking-label text-white">
                  <Circle
                    size={7}
                    aria-hidden
                    className="fill-white text-white"
                  />
                  En vivo
                  {stream.fps !== null && (
                    <span className="tabular font-bold text-white/90">
                      {stream.fps.toFixed(0)} fps
                    </span>
                  )}
                </div>
              )}

              {/* Miniatura del cuidador (cámara local). */}
              <div className="absolute bottom-5 right-5 grid h-24 w-32 place-items-center rounded-xl border border-base-400 bg-base-800 text-xs font-bold text-ink-faint">
                {camara ? "Tu cámara" : "Cámara apagada"}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 p-4">
              <Boton
                onClick={() => setMicrofono((v) => !v)}
                aria-pressed={!microfono}
                variante="secundario"
                className={cn(
                  !microfono && "bg-danger-bg text-danger ring-danger/40"
                )}
              >
                {microfono ? (
                  <Mic size={18} aria-hidden />
                ) : (
                  <MicOff size={18} aria-hidden />
                )}
                {microfono ? "Micrófono" : "Silenciado"}
              </Boton>

              <Boton
                onClick={() => setCamara((v) => !v)}
                aria-pressed={!camara}
                variante="secundario"
                className={cn(
                  !camara && "bg-danger-bg text-danger ring-danger/40"
                )}
              >
                {camara ? (
                  <Video size={18} aria-hidden />
                ) : (
                  <VideoOff size={18} aria-hidden />
                )}
                {camara ? "Cámara" : "Cámara apagada"}
              </Boton>

              <Boton
                variante="emergencia"
                className="px-5"
                onClick={stream.desconectar}
                disabled={stream.estado !== "conectado"}
              >
                <PhoneOff size={18} aria-hidden />
                Finalizar
              </Boton>
            </div>
          </Card>

          <Card className="mt-5">
            <CardTitle
              icon={<Bot size={20} aria-hidden className="text-ink-faint" />}
            >
              Guiar al robot
            </CardTitle>
            <ControlesMovimiento
              habilitado={configuracionInicial.teleoperacionPermitida}
            />
          </Card>
        </div>

        {/* --- Transcripción del agente conversacional --- */}
        <Card className="flex max-h-[36rem] min-h-0 flex-col lg:max-h-[calc(100dvh-8rem)]">
          <CardTitle
            icon={<Bot size={20} aria-hidden className="text-ink-faint" />}
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
                  <p className="mb-1 text-xs font-bold text-ink-muted">
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
            className="mt-4 flex gap-2 border-t border-base-500 pt-4"
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
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-base-500 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-signal"
            />
            <Boton
              type="submit"
              aria-label="Enviar mensaje"
              className="w-12 shrink-0 px-0"
            >
              <Send size={18} aria-hidden />
            </Boton>
          </form>
          <p className="mt-2 text-sm text-ink-muted">
            El robot leerá tu mensaje en voz alta.
          </p>
        </Card>
      </div>
    </>
  );
}
