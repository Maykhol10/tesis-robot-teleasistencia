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
  Metrica,
  PageHeader,
} from "@/components/ui";
import {
  actividadSemanal,
  etiquetaTipoAlerta,
  temasFrecuentes,
  tiemposRespuesta,
} from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

const ejes = {
  stroke: "#88c3ce",
  tick: { fill: "#336d7f", fontSize: 12 },
};

const estiloTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid #d9ecf0",
    boxShadow: "0 4px 16px rgba(45,75,87,0.08)",
    fontSize: 13,
  },
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
        <Metrica
          etiqueta="Movimientos"
          valor={String(totalMovimientos)}
          detalle="Últimos 7 días"
          tono="brand"
          icono={<Activity size={20} aria-hidden />}
        />
        <Metrica
          etiqueta="Horas activa"
          valor={`${promedioHoras.toFixed(1)} h`}
          detalle="Promedio diario"
          tono="calm"
          icono={<Clock size={20} aria-hidden />}
        />
        <Metrica
          etiqueta="Interacciones"
          valor={String(totalInteracciones)}
          detalle="Con el asistente"
          tono="warm"
          icono={<MessageCircle size={20} aria-hidden />}
        />
        <Metrica
          etiqueta="Respuesta media"
          valor={`${promedioRespuesta.toFixed(1)} min`}
          detalle="Ante una alerta"
          tono="calm"
          icono={<Timer size={20} aria-hidden />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle
            icon={<Activity size={18} aria-hidden className="text-brand-500" />}
          >
            Actividad diaria
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={actividadSemanal}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e6f1f3"
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
                  fill="#54a3b3"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-brand-500">
            Eventos de movimiento detectados por el robot cada día.
          </p>
        </Card>

        <Card>
          <CardTitle
            icon={<Clock size={18} aria-hidden className="text-brand-500" />}
          >
            Horas activa por día
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={actividadSemanal}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e6f1f3"
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
                  stroke="#5b9e7d"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#5b9e7d" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-brand-500">
            Una caída sostenida puede indicar un cambio en la rutina.
          </p>
        </Card>

        <Card>
          <CardTitle
            icon={<Timer size={18} aria-hidden className="text-brand-500" />}
          >
            Tiempos de respuesta ante alertas
          </CardTitle>
          <ul className="divide-y divide-brand-100">
            {tiemposRespuesta.map((r) => (
              <li
                key={r.alertaId}
                className="flex items-center justify-between gap-4 py-3 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-900">
                    {etiquetaTipoAlerta[r.tipo]}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-500">
                    {formatFechaHora(r.timestamp)} · {r.atendidoPor}
                  </p>
                </div>
                <Badge tono={r.tiempoRespuestaMin <= 3 ? "calm" : "warning"}>
                  {r.tiempoRespuestaMin} min
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle
            icon={
              <MessageCircle size={18} aria-hidden className="text-brand-500" />
            }
          >
            Temas de conversación
          </CardTitle>
          <ul className="space-y-3.5">
            {temasFrecuentes.map((t) => (
              <li key={t.tema}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <p className="text-sm text-brand-800">{t.tema}</p>
                  <p className="shrink-0 text-sm font-semibold text-brand-600">
                    {t.conteo}
                  </p>
                </div>
                <Barra valor={(t.conteo / maxTema) * 100} tono="brand" />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-brand-500">
            Resumen generado a partir de los registros del asistente
            conversacional.
          </p>
        </Card>
      </div>
    </>
  );
}
