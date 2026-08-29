"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock, MessageCircle, Timer } from "lucide-react";
import {
  Badge,
  Barra,
  Card,
  CardTitle,
  Lectura,
  PageHeader,
} from "@/components/ui";
import {
  actividadSemanal,
  etiquetaTipoAlerta,
  temasFrecuentes,
  tiemposRespuesta,
} from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

// Tokens de gráfico alineados con el tema oscuro de tailwind.config.
// Las series son las únicas superficies saturadas del panel.
const ejes = {
  stroke: "#243447",
  tick: { fill: "#8199AE", fontSize: 12, fontFamily: "var(--font-mono)" },
};

const estiloTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #4E6C8F",
    background: "#16212D",
    boxShadow: "0 8px 28px rgba(0,0,0,0.55)",
    fontSize: 14,
    color: "#F1F6FA",
  },
  labelStyle: { color: "#A8BDCF", fontWeight: 700 },
  cursor: { fill: "rgba(34,211,238,0.08)" },
};

export default function HistorialPage() {
  const totalMovimientos = actividadSemanal.reduce(
    (s, d) => s + d.movimientos,
    0
  );
  const totalInteracciones = actividadSemanal.reduce(
    (s, d) => s + d.interaccionesLLM,
    0
  );
  const promedioHoras =
    actividadSemanal.reduce((s, d) => s + d.horasActivo, 0) /
    actividadSemanal.length;
  const promedioRespuesta =
    tiemposRespuesta.reduce((s, r) => s + r.tiempoRespuestaMin, 0) /
    tiemposRespuesta.length;

  const maxTema = Math.max(...temasFrecuentes.map((t) => t.conteo));

  return (
    <>
      <PageHeader
        titulo="Historial y reportes"
        descripcion="Resumen de la última semana: actividad diaria, respuesta ante alertas e interacciones con el asistente."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Lectura
          etiqueta="Movimientos"
          valor={String(totalMovimientos)}
          detalle="Últimos 7 días"
          tono="signal"
          icono={<Activity size={18} aria-hidden />}
        />
        <Lectura
          etiqueta="Horas activa"
          valor={promedioHoras.toFixed(1)}
          unidad="h / día"
          detalle="Promedio de la semana"
          tono="ok"
          icono={<Clock size={18} aria-hidden />}
        />
        <Lectura
          etiqueta="Interacciones"
          valor={String(totalInteracciones)}
          detalle="Con el asistente"
          tono="warn"
          icono={<MessageCircle size={18} aria-hidden />}
        />
        <Lectura
          etiqueta="Respuesta media"
          valor={promedioRespuesta.toFixed(1)}
          unidad="min"
          detalle="Ante una alerta"
          tono="ok"
          icono={<Timer size={18} aria-hidden />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle
            icon={<Activity size={16} aria-hidden />}
          >
            Actividad diaria
          </CardTitle>
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`Movimientos detectados por día: ${actividadSemanal
              .map((d) => `${d.dia}, ${d.movimientos}`)
              .join("; ")}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={actividadSemanal}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#243447"
                  vertical={false}
                />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={ejes.tick} />
                <YAxis axisLine={false} tickLine={false} tick={ejes.tick} />
                <Tooltip
                  {...estiloTooltip}
                  formatter={(v: number) => [`${v}`, "Movimientos"]}
                />
                <Bar
                  dataKey="movimientos"
                  fill="#22D3EE"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Eventos de movimiento detectados por el robot cada día.
          </p>
        </Card>

        <Card>
          <CardTitle
            icon={<Clock size={16} aria-hidden />}
          >
            Horas activa por día
          </CardTitle>
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`Horas activa por día: ${actividadSemanal
              .map((d) => `${d.dia}, ${d.horasActivo} horas`)
              .join("; ")}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={actividadSemanal}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#243447"
                  vertical={false}
                />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={ejes.tick} />
                <YAxis axisLine={false} tickLine={false} tick={ejes.tick} />
                <Tooltip
                  {...estiloTooltip}
                  formatter={(v: number) => [`${v} h`, "Activa"]}
                />
                <Line
                  type="monotone"
                  dataKey="horasActivo"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#34D399" }}
                  activeDot={{ r: 6, fill: "#34D399", stroke: "#0F1720", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Una caída sostenida puede indicar un cambio en la rutina.
          </p>
        </Card>

        <Card>
          <CardTitle
            icon={<Timer size={16} aria-hidden />}
          >
            Tiempos de respuesta ante alertas
          </CardTitle>
          <ul className="divide-y divide-base-500">
            {tiemposRespuesta.map((r) => (
              <li
                key={r.alertaId}
                className="flex items-center justify-between gap-4 py-3 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="font-bold text-ink">
                    {etiquetaTipoAlerta[r.tipo]}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatFechaHora(r.timestamp)} · {r.atendidoPor}
                  </p>
                </div>
                <Badge tono={r.tiempoRespuestaMin <= 3 ? "ok" : "warn"}>
                  {r.tiempoRespuestaMin} min
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle
            icon={
              <MessageCircle size={16} aria-hidden />
            }
          >
            Temas de conversación
          </CardTitle>
          <ul className="space-y-3.5">
            {temasFrecuentes.map((t) => (
              <li key={t.tema}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <p className="text-sm text-ink">{t.tema}</p>
                  <p className="shrink-0 text-sm font-bold text-ink-muted">
                    {t.conteo}
                  </p>
                </div>
                <Barra
                  valor={(t.conteo / maxTema) * 100}
                  tono="signal"
                  etiqueta={`${t.tema}: ${t.conteo} conversaciones`}
                />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Resumen generado a partir de los registros del asistente
            conversacional.
          </p>
        </Card>
      </div>
    </>
  );
}
