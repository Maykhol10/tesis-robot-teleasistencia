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
import { BotonChat, PanelChat } from "@/components/chat";
import {
  adultoMayor,
  configuracionInicial,
  estadoRobot,
} from "@/lib/mock-data";

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
    // Centrada en el alto sobrante: la tarjeta se estira hasta igualar al
    // vídeo, y la cruceta pegada arriba dejaría un hueco debajo.
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto grid w-fit grid-cols-3 grid-rows-3 gap-1.5">
        {botones.map(({ dir, Icono, clase }) => (
          <button
            key={dir}
            type="button"
            disabled={!habilitado}
            aria-label={`Mover ${dir}`}
            className={cn(
              clase,
              "grid h-14 w-14 cursor-pointer place-items-center rounded-xl border border-base-500 bg-base-800 text-ink-muted transition-colors",
              "hover:border-base-400 hover:bg-base-700 active:bg-base-600",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-base-800",
              dir === "detener" && "border-danger/50 bg-danger-bg text-danger"
            )}
          >
            <Icono size={22} aria-hidden />
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-ink-muted">
        {habilitado
          ? "Evita obstáculos por sí solo mientras lo guías."
          : "La teleoperación está desactivada en Configuración."}
      </p>
    </div>
  );
}

export default function TelepresenciaPage() {
  const [microfono, setMicrofono] = useState(true);
  const [camara, setCamara] = useState(true);
  const stream = useStreamRobot();
  const [chatAbierto, setChatAbierto] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        titulo="Telepresencia"
        descripcion={`Videollamada en vivo con ${adultoMayor.nombre.split(" ")[0]} a través del robot.`}
      >
        <Badge tono={stream.estado === "conectado" ? "ok" : "neutral"}>
          <PuntoEstado tono={stream.estado === "conectado" ? "ok" : "neutral"} />
          {stream.estado === "conectado" ? "Llamada activa" : stream.detalle}
        </Badge>
      </PageHeader>

      {/* Al abrir la conversación el vídeo cede ancho en vez de quedar tapado:
          durante la teleoperación hay que seguir viendo lo que hace el robot. */}
      <div
        className={cn(
          // La altura de la fila la fija el vídeo (su proporción 16:9 más la
          // barra de acciones); las otras columnas se estiran a esa medida y
          // desplazan por dentro si su contenido no cabe.
          "grid min-h-0 gap-5",
          chatAbierto ? "lg:grid-cols-4" : "lg:grid-cols-3"
        )}
      >
        {/* --- Video en vivo --- */}
        <div className="min-h-0 lg:col-span-2">
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
                          : stream.estado === "error"
                            ? "Reintentar"
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

              <BotonChat
                abierto={chatAbierto}
                alPulsar={() => setChatAbierto((v) => !v)}
              />

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
        </div>

        {/* --- Guiar al robot. La celda es el ancla: la tarjeta se estira
            dentro sin aportar altura a la fila. --- */}
        <div className="relative min-h-0">
          <Card className="flex min-h-0 flex-col overflow-y-auto lg:absolute lg:inset-0">
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

        {chatAbierto && (
          <div className="relative min-h-0">
            <PanelChat alCerrar={() => setChatAbierto(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
