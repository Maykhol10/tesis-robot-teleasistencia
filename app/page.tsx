import Link from "next/link";
import {
  Activity,
  BatteryCharging,
  BatteryMedium,
  Bot,
  Clock,
  MapPin,
  MessageCircle,
  Video,
  Wifi,
} from "lucide-react";
import {
  Badge,
  Barra,
  Card,
  CardTitle,
  Metrica,
  PageHeader,
  PuntoEstado,
  etiquetaConexion,
  tonoConexion,
  tonoEstadoAlerta,
  tonoSeveridad,
} from "@/components/ui";
import {
  actividadSemanal,
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

const tonoBateria = (n: number) =>
  n < 20 ? "alert" : n < 40 ? "warning" : "calm";

export default function DashboardPage() {
  const ultimasAlertas = alertas.slice(0, 4);
  const ultimosMensajes = [...conversacion].reverse().slice(0, 3);
  const hoy = actividadSemanal[actividadSemanal.length - 1];
  const nombreCorto = adultoMayor.nombre.split(" ")[0];

  return (
    <>
      <PageHeader
        titulo="Buenas tardes"
        descripcion={`Así va el día de ${nombreCorto}. El robot la está acompañando en este momento.`}
      >
        <Link
          href="/telepresencia"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
        >
          <Video size={16} aria-hidden />
          Iniciar videollamada
        </Link>
      </PageHeader>

      {/* Estado de la persona: lo primero y lo más grande de la pantalla. */}
      <Card className="mb-5 bg-gradient-to-br from-white to-brand-50/60">
        <div className="flex flex-wrap items-center gap-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-warm-100 text-2xl font-semibold text-warm-500">
            {adultoMayor.nombre
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-xl font-semibold text-brand-900">
                {adultoMayor.nombre}
              </h2>
              <Badge tono="calm">
                <PuntoEstado tono="calm" />
                Activa
              </Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} aria-hidden />
                {adultoMayor.ubicacionHogar}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Activity size={15} aria-hidden />
                {adultoMayor.descripcionActividad}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={15} aria-hidden />
                Última actividad {tiempoRelativo(adultoMayor.ultimaActividad)}
              </span>
            </p>
          </div>

          <dl className="flex gap-6 rounded-xl bg-white/70 px-5 py-3 ring-1 ring-inset ring-brand-100">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
                Movimientos hoy
              </dt>
              <dd className="mt-0.5 text-lg font-semibold text-brand-900">
                {hoy.movimientos}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-brand-500">
                Charlas hoy
              </dt>
              <dd className="mt-0.5 text-lg font-semibold text-brand-900">
                {hoy.interaccionesLLM}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Estado técnico del robot: presente, pero secundario. */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metrica
          etiqueta="Batería"
          valor={`${estadoRobot.bateria}%`}
          detalle={estadoRobot.cargando ? "Cargando en base" : "Autonomía ~3 h"}
          tono={tonoBateria(estadoRobot.bateria)}
          icono={
            estadoRobot.cargando ? (
              <BatteryCharging size={20} aria-hidden />
            ) : (
              <BatteryMedium size={20} aria-hidden />
            )
          }
        />
        <Metrica
          etiqueta="Conexión"
          valor={etiquetaConexion[estadoRobot.conexion]}
          detalle={`Señal Wi-Fi ${estadoRobot.senalWifi}/4`}
          tono={tonoConexion[estadoRobot.conexion]}
          icono={<Wifi size={20} aria-hidden />}
        />
        <Metrica
          etiqueta="Robot en"
          valor={estadoRobot.ubicacion}
          detalle="Navegación autónoma activa"
          tono="brand"
          icono={<Bot size={20} aria-hidden />}
        />
        <Metrica
          etiqueta="Último check-in"
          valor={tiempoRelativo(estadoRobot.ultimoCheckIn)}
          detalle={formatFechaHora(estadoRobot.ultimoCheckIn)}
          tono="brand"
          icono={<Clock size={20} aria-hidden />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle
            icon={<Activity size={18} aria-hidden className="text-brand-500" />}
            action={
              <Link
                href="/alertas"
                className="text-sm font-medium text-brand-600 hover:text-brand-800"
              >
                Ver todas
              </Link>
            }
          >
            Alertas recientes
          </CardTitle>

          <ul className="divide-y divide-brand-100">
            {ultimasAlertas.map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-900">
                      {etiquetaTipoAlerta[a.tipo]}
                    </p>
                    <Badge tono={tonoSeveridad[a.severidad]}>
                      {etiquetaSeveridad[a.severidad]}
                    </Badge>
                    <Badge tono={tonoEstadoAlerta[a.estado]}>
                      {etiquetaEstadoAlerta[a.estado]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-brand-600">{a.descripcion}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-brand-500">
                  <p>{tiempoRelativo(a.timestamp)}</p>
                  <p className="mt-0.5">{a.ubicacion}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle
            icon={
              <MessageCircle size={18} aria-hidden className="text-brand-500" />
            }
            action={
              <Link
                href="/telepresencia"
                className="text-sm font-medium text-brand-600 hover:text-brand-800"
              >
                Abrir
              </Link>
            }
          >
            Conversaciones
          </CardTitle>

          <ul className="space-y-3">
            {ultimosMensajes.map((m) => (
              <li key={m.id}>
                <p className="text-xs font-medium text-brand-500">
                  {etiquetaEmisor[m.emisor]} · {tiempoRelativo(m.timestamp)}
                </p>
                <p className="mt-0.5 text-sm text-brand-800">{m.texto}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-brand-100 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-500">
              Actividad de hoy
            </p>
            <Barra valor={(hoy.horasActivo / 12) * 100} tono="calm" />
            <p className="mt-1.5 text-sm text-brand-600">
              {hoy.horasActivo} h activa
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
