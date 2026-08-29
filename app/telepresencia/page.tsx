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
import {
  useTeleoperacion,
  VELOCIDAD_MAX,
  VELOCIDAD_MIN,
  type Direccion,
} from "@/lib/teleoperacion";
import { BotonChat, PanelChat } from "@/components/chat";
import {
  adultoMayor,
  configuracionInicial,
  estadoRobot,
} from "@/lib/mock-data";

/** Cruceta de teleoperación. Solo se muestra si el cuidador tiene permiso. */
function ControlesMovimiento({ habilitado }: { habilitado: boolean }) {
  const botones: { dir: Direccion; etiqueta: string; Icono: typeof ArrowUp; clase: string }[] = [
    { dir: "adelante", etiqueta: "adelante", Icono: ArrowUp, clase: "col-start-2 row-start-1" },
    { dir: "izquierda", etiqueta: "a la izquierda", Icono: ArrowLeft, clase: "col-start-1 row-start-2" },
    { dir: "detener", etiqueta: "detener", Icono: Square, clase: "col-start-2 row-start-2" },
    { dir: "derecha", etiqueta: "a la derecha", Icono: ArrowRight, clase: "col-start-3 row-start-2" },
    { dir: "atras", etiqueta: "atrás", Icono: ArrowDown, clase: "col-start-2 row-start-3" },
  ];

  const robot = useTeleoperacion(habilitado);

  return (
    // Centrada en el alto sobrante: la tarjeta se estira hasta igualar al
    // vídeo, y la cruceta pegada arriba dejaría un hueco debajo.
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto grid w-fit grid-cols-3 grid-rows-3 gap-1.5">
        {botones.map(({ dir, etiqueta, Icono, clase }) => (
          <button
            key={dir}
            type="button"
            disabled={!habilitado}
            aria-label={
              dir === "detener" ? "Detener el robot" : `Mover ${etiqueta}`
            }
            // El robot se mueve mientras el botón siga pulsado. Soltar, salir
            // con el puntero o quitar el foco lo detiene: así no se queda
            // andando por un gesto a medias.
            onPointerDown={() => robot.empezar(dir)}
            onPointerUp={robot.parar}
            onPointerLeave={robot.parar}
            onBlur={robot.parar}
            // Con el teclado: mantener pulsada la tecla mueve, soltarla para.
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!e.repeat) robot.empezar(dir);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") robot.parar();
            }}
            className={cn(
              clase,
              "grid h-14 w-14 cursor-pointer touch-none select-none place-items-center rounded-xl border border-base-500 bg-base-800 text-ink-muted transition-colors",
              "hover:border-base-400 hover:bg-base-700 active:bg-base-600",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-base-800",
              dir === "detener" && "border-danger/50 bg-danger-bg text-danger",
              robot.activa === dir && "border-signal bg-signal/20 text-signal"
            )}
          >
            <Icono size={22} aria-hidden />
          </button>
        ))}
      </div>
      {/* Velocidad. Se puede mover con el robot en marcha: la siguiente
          repetición de la orden ya sale con el valor nuevo. */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor="velocidad"
            className="text-xs font-bold uppercase tracking-label text-ink-muted"
          >
            Velocidad
          </label>
          <span className="tabular text-sm font-bold text-signal">
            {robot.velocidad}
          </span>
        </div>
        <input
          id="velocidad"
          type="range"
          min={VELOCIDAD_MIN}
          max={VELOCIDAD_MAX}
          step={1}
          value={robot.velocidad}
          disabled={!habilitado}
          onChange={(e) => robot.setVelocidad(Number(e.target.value))}
          className="mt-2 h-11 w-full cursor-pointer accent-signal disabled:cursor-not-allowed disabled:opacity-40"
        />
        <div className="flex justify-between text-xs text-ink-faint">
          <span>Lenta</span>
          <span>Rápida</span>
        </div>
      </div>

      <p
        className={cn(
          "mt-3 text-center text-sm",
          robot.error ? "font-bold text-danger" : "text-ink-muted"
        )}
        // Un fallo al mover debe leerse en cuanto ocurre, no al final.
        role={robot.error ? "alert" : undefined}
      >
        {robot.error
          ? robot.error
          : habilitado
            ? "Mantén pulsado para mover. Se detiene al soltar."
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
