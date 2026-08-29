import {
  Activity,
  BatteryCharging,
  BatteryMedium,
  Bot,
  Clock,
  MapPin,
  MessageCircle,
  Radio,
  Video,
  Wifi,
} from "lucide-react";
import {
  Badge,
  BotonEnlace,
  Card,
  CardTitle,
  Chispa,
  Lectura,
  MarcaSeveridad,
  PuntoEstado,
  Rotulo,
  Vacio,
  etiquetaConexion,
  tonoConexion,
  tonoEstadoAlerta,
  tonoSeveridad,
} from "@/components/ui";
import { Croquis } from "@/components/croquis";
import {
  actividadSemanal,
  alertaCritica,
  adultoMayor,
  alertas,
  conversacion,
  estadoRobot,
  etiquetaEmisor,
  etiquetaEstadoAlerta,
  etiquetaSeveridad,
  etiquetaTipoAlerta,
} from "@/lib/mock-data";
import { formatFechaHora, tiempoRelativo } from "@/lib/utils";

const tonoBateria = (n: number) => (n < 20 ? "danger" : n < 40 ? "warn" : "ok");

export default function PanelPage() {
  const ultimasAlertas = alertas.slice(0, 4);
  const ultimosMensajes = [...conversacion].reverse().slice(0, 3);
  const hoy = actividadSemanal[actividadSemanal.length - 1];
  const nombreCorto = adultoMayor.nombre.split(" ")[0];
  const serieMovimientos = actividadSemanal.map((d) => d.movimientos);
  const serieHoras = actividadSemanal.map((d) => d.horasActivo);

  return (
    <>
      {/* ------------------------------------------------------------------
          BLOQUE PRIMARIO — la respuesta a "¿cómo está?" ocupa el ancho
          completo y se lee desde el otro lado de la habitación.
          ------------------------------------------------------------------ */}
      <section className="mb-4 overflow-hidden rounded-3xl border border-base-500 bg-base-800 shadow-raised">
        <div className="flex flex-wrap items-center gap-3 border-b border-base-500 bg-base-700/60 px-5 py-2.5">
          <div className="flex items-center gap-2">
            <PuntoEstado tono="ok" />
            <Rotulo className="text-ok">Vigilancia activa</Rotulo>
          </div>
          <span className="tabular ml-auto text-xs text-ink-faint">
            {formatFechaHora(adultoMayor.ultimaActividad)}
          </span>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <Rotulo>Estado de la persona</Rotulo>
            {/* El veredicto en una sola frase enorme. Ningún cuidador
                debería tener que interpretar cifras para saber esto. */}
            <p className="mt-2 text-hero font-bold leading-none text-ok">
              Todo bien
            </p>
            <p className="mt-3 text-lg text-ink">
              <span className="font-bold">{nombreCorto}</span> está{" "}
              {adultoMayor.descripcionActividad.toLowerCase()}.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} aria-hidden className="text-signal" />
                {adultoMayor.ubicacionHogar}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={16} aria-hidden className="text-signal" />
                Activa {tiempoRelativo(adultoMayor.ultimaActividad)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Radio size={16} aria-hidden className="text-signal" />
                Robot en {estadoRobot.ubicacion}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <BotonEnlace href="/telepresencia">
                <Video size={18} aria-hidden />
                Iniciar videollamada
              </BotonEnlace>
              <BotonEnlace href="/alertas" variante="secundario">
                Revisar alertas
              </BotonEnlace>
            </div>

            {/* Pulso del día: dos cifras y su silueta semanal. */}
            <div className="mt-6 grid gap-5 border-t border-base-500 pt-5 sm:grid-cols-2">
              <div>
                <Rotulo>Movimientos hoy</Rotulo>
                <p className="tabular mt-1 text-metric font-bold text-ink">
                  {hoy.movimientos}
                </p>
                <Chispa datos={serieMovimientos} tono="signal" />
              </div>
              <div>
                <Rotulo>Horas activa</Rotulo>
                <p className="tabular mt-1 text-metric font-bold text-ink">
                  {hoy.horasActivo}
                </p>
                <Chispa datos={serieHoras} tono="ok" />
              </div>
            </div>
          </div>

          {/* Croquis: dónde está, no sólo en qué habitación se llama. */}
          <div className="lg:border-l lg:border-base-500 lg:pl-6">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <Rotulo>Planta de la casa</Rotulo>
              <span className="text-xs font-bold text-ok">
                {adultoMayor.ubicacionHogar}
              </span>
            </div>
            <Croquis
              ubicacionPersona={adultoMayor.ubicacionHogar}
              ubicacionRobot={estadoRobot.ubicacion}
              ubicacionAlerta={alertaCritica?.ubicacion}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          TELEMETRÍA — fila de instrumentos, subordinada a lo anterior.
          ------------------------------------------------------------------ */}
      <Rotulo className="mb-2.5">Telemetría del robot</Rotulo>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Lectura
          etiqueta="Batería"
          valor={String(estadoRobot.bateria)}
          unidad="%"
          barra={estadoRobot.bateria}
          detalle={estadoRobot.cargando ? "Cargando en base" : "Autonomía ~3 h"}
          tono={tonoBateria(estadoRobot.bateria)}
          icono={
            estadoRobot.cargando ? (
              <BatteryCharging size={18} aria-hidden />
            ) : (
              <BatteryMedium size={18} aria-hidden />
            )
          }
        />
        <Lectura
          etiqueta="Señal Wi-Fi"
          valor={String(estadoRobot.senalWifi)}
          unidad="/ 4"
          barra={(estadoRobot.senalWifi / 4) * 100}
          detalle={etiquetaConexion[estadoRobot.conexion]}
          tono={tonoConexion[estadoRobot.conexion]}
          icono={<Wifi size={18} aria-hidden />}
        />
        <Lectura
          etiqueta="Ubicación robot"
          valor={estadoRobot.ubicacion}
          detalle="Navegación autónoma activa"
          tono="signal"
          icono={<Bot size={18} aria-hidden />}
        />
        <Lectura
          etiqueta="Último check-in"
          valor={tiempoRelativo(estadoRobot.ultimoCheckIn).replace("hace ", "")}
          detalle={formatFechaHora(estadoRobot.ultimoCheckIn)}
          tono="neutral"
          icono={<Clock size={18} aria-hidden />}
        />
      </div>

      {/* ------------------------------------------------------------------
          REGISTRO — bitácora de eventos y conversación.
          ------------------------------------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle
            icon={<Activity size={16} aria-hidden />}
            action={
              <BotonEnlace href="/alertas" variante="fantasma">
                Ver todas
              </BotonEnlace>
            }
          >
            Registro de eventos
          </CardTitle>

          {ultimasAlertas.length === 0 ? (
            <Vacio
              icono={<Activity size={22} aria-hidden />}
              titulo="Sin incidentes"
              descripcion="No se han detectado alertas en los últimos días."
            />
          ) : (
            <ul className="divide-y divide-base-500">
              {ultimasAlertas.map((a) => {
                const abierta = a.estado !== "atendida";
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 py-3 first:pt-0"
                  >
                    {/* Marca de tiempo como columna fija: la bitácora se
                        escanea por hora, igual que un log. */}
                    <span className="tabular w-14 shrink-0 pt-0.5 text-xs text-ink-faint">
                      {new Date(a.timestamp).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      aria-hidden
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        abierta ? "bg-danger" : "bg-base-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink">
                          {etiquetaTipoAlerta[a.tipo]}
                        </p>
                        <Badge tono={tonoSeveridad[a.severidad]}>
                          <MarcaSeveridad severidad={a.severidad} />
                          {etiquetaSeveridad[a.severidad]}
                        </Badge>
                        <Badge tono={tonoEstadoAlerta[a.estado]}>
                          {etiquetaEstadoAlerta[a.estado]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">
                        {a.descripcion}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {a.ubicacion}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle
            icon={<MessageCircle size={16} aria-hidden />}
            action={
              <BotonEnlace href="/telepresencia" variante="fantasma">
                Abrir
              </BotonEnlace>
            }
          >
            Conversación
          </CardTitle>

          <ul className="space-y-3">
            {ultimosMensajes.map((m) => (
              <li
                key={m.id}
                className="border-l-2 border-base-500 pl-3 transition-colors hover:border-signal"
              >
                <p className="text-xs font-bold text-ink-faint">
                  {etiquetaEmisor[m.emisor]}
                  <span className="tabular ml-1.5 font-normal">
                    {tiempoRelativo(m.timestamp)}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">{m.texto}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-base-500 pt-4">
            <div className="flex items-baseline justify-between">
              <Rotulo>Charlas hoy</Rotulo>
              <p className="tabular text-xl font-bold text-signal">
                {hoy.interaccionesLLM}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
