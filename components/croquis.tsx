import { cn } from "@/lib/utils";
import {
  habitacionPorNombre,
  habitaciones,
  vanos,
  type Habitacion,
  type Vano,
} from "@/lib/mock-data";

// ---------------------------------------------------------------------------
// Croquis arquitectónico del departamento.
//
// Convención de plano: muros macizos de grosor constante, vanos restados del
// muro y puertas con hoja y arco de barrido. Sólo blanco y negro — el único
// elemento con color es el punto de la persona, que así no compite con nada.
//
// Lienzo 100 x 70 definido en lib/mock-data.
// ---------------------------------------------------------------------------

const MURO = 1.6; // grosor de tabique interior
const MURO_EXT = 2.4; // grosor de muro perimetral

const centro = (h: Habitacion) => ({
  cx: h.x + h.ancho / 2,
  cy: h.y + h.alto / 2,
});

/**
 * Segmentos macizos de un muro una vez restados sus vanos.
 */
function tramos(
  inicio: number,
  fin: number,
  aberturas: { desde: number; hasta: number }[]
) {
  const orden = [...aberturas].sort((a, b) => a.desde - b.desde);
  const salida: [number, number][] = [];
  let cursor = inicio;
  for (const a of orden) {
    if (a.desde > cursor) salida.push([cursor, a.desde]);
    cursor = Math.max(cursor, a.hasta);
  }
  if (cursor < fin) salida.push([cursor, fin]);
  return salida;
}

/** Puerta batiente: hoja recta más arco de barrido a 90°. */
function Puerta({ v }: { v: Vano }) {
  const ancho = v.hasta - v.desde;
  const g = v.giro ?? 1;

  if (v.eje === "h") {
    const x = v.desde;
    const y = v.pos;
    return (
      <g stroke="#F1F6FA" strokeWidth="0.5" fill="none" opacity="0.8">
        <line x1={x} y1={y} x2={x} y2={y + ancho * g} />
        <path
          d={`M ${x} ${y + ancho * g} A ${ancho} ${ancho} 0 0 ${
            g > 0 ? 0 : 1
          } ${x + ancho} ${y}`}
          strokeDasharray="1 1"
          opacity="0.55"
        />
      </g>
    );
  }

  const x = v.pos;
  const y = v.desde;
  return (
    <g stroke="#F1F6FA" strokeWidth="0.5" fill="none" opacity="0.8">
      <line x1={x} y1={y} x2={x + ancho * g} y2={y} />
      <path
        d={`M ${x + ancho * g} ${y} A ${ancho} ${ancho} 0 0 ${
          g > 0 ? 1 : 0
        } ${x} ${y + ancho}`}
        strokeDasharray="1 1"
        opacity="0.55"
      />
    </g>
  );
}

export function Croquis({
  /** Habitación donde está la persona, tal como la nombran los datos. */
  ubicacionPersona,
  /** Habitación donde está el robot. */
  ubicacionRobot,
  /** Habitación con una emergencia activa: se marca con trama, no con color. */
  ubicacionAlerta,
  className,
}: {
  ubicacionPersona: string;
  ubicacionRobot?: string;
  ubicacionAlerta?: string;
  className?: string;
}) {
  const persona = habitacionPorNombre(ubicacionPersona);
  const robot = ubicacionRobot ? habitacionPorNombre(ubicacionRobot) : undefined;
  const alerta = ubicacionAlerta
    ? habitacionPorNombre(ubicacionAlerta)
    : undefined;

  const pPersona = persona ? centro(persona) : undefined;
  const pRobot = robot ? centro(robot) : undefined;

  // Tabiques interiores, agrupados por eje y posición.
  const tabiquesV = [42, 74].map((pos) => ({
    pos,
    huecos: vanos.filter((v) => v.eje === "v" && v.pos === pos),
  }));
  const tabiquesH = [38, 50].map((pos) => ({
    pos,
    huecos: vanos.filter((v) => v.eje === "h" && v.pos === pos),
  }));

  const descripcion = [
    `Plano del departamento con ${habitaciones.length} ambientes.`,
    `La persona está en ${persona?.nombre ?? ubicacionPersona}.`,
    robot && `El robot está en ${robot.nombre}.`,
    alerta && `Hay una emergencia en ${alerta.nombre}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={cn("m-0", className)}>
      <svg
        viewBox="-3 -3 106 76"
        className="h-auto w-full"
        role="img"
        aria-label={descripcion}
      >
        <defs>
          {/* Rayado de arquitecto para el ambiente en emergencia. */}
          <pattern
            id="rayado-alerta"
            width="2.4"
            height="2.4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="2.4"
              stroke="#F1F6FA"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>

        {/* --- Ambiente en emergencia: trama, no color --- */}
        {alerta && (
          <rect
            x={alerta.x}
            y={alerta.y}
            width={alerta.ancho}
            height={alerta.alto}
            fill="url(#rayado-alerta)"
          />
        )}

        {/* --- Muro perimetral --- */}
        <g stroke="#F1F6FA" strokeWidth={MURO_EXT} fill="none" strokeLinecap="square">
          <line x1="0" y1="0" x2="100" y2="0" />
          <line x1="0" y1="70" x2="100" y2="70" />
          <line x1="100" y1="0" x2="100" y2="70" />
          {/* Muro izquierdo: lleva la puerta de entrada. */}
          {tramos(
            0,
            70,
            vanos.filter((v) => v.eje === "v" && v.pos === 0)
          ).map(([a, b]) => (
            <line key={`ext-${a}`} x1="0" y1={a} x2="0" y2={b} />
          ))}
        </g>

        {/* --- Tabiques interiores --- */}
        <g
          stroke="#F1F6FA"
          strokeWidth={MURO}
          fill="none"
          opacity="0.92"
          strokeLinecap="square"
        >
          {tabiquesV.map((t) =>
            tramos(0, 38, t.huecos).map(([a, b]) => (
              <line key={`v${t.pos}-${a}`} x1={t.pos} y1={a} x2={t.pos} y2={b} />
            ))
          )}
          {tabiquesH.map((t) =>
            tramos(0, 100, t.huecos).map(([a, b]) => (
              <line key={`h${t.pos}-${a}`} x1={a} y1={t.pos} x2={b} y2={t.pos} />
            ))
          )}
          {/* Tabique entre dormitorio y baño. */}
          <line x1="58" y1="50" x2="58" y2="70" />
        </g>

        {/* --- Puertas --- */}
        {vanos
          .filter((v) => v.tipo === "puerta")
          .map((v, i) => (
            <Puerta key={`p${i}`} v={v} />
          ))}

        {/* --- Rótulos de ambiente --- */}
        {habitaciones.map((h) => {
          const c = centro(h);
          const estrecho = h.alto < 14;
          return (
            <text
              key={h.id}
              x={c.cx}
              y={estrecho ? c.cy + 1.1 : c.cy - 4.5}
              textAnchor="middle"
              fontSize="3.1"
              fontWeight="700"
              letterSpacing="0.6"
              fill="#F1F6FA"
              opacity={persona?.id === h.id ? 1 : 0.55}
              style={{ textTransform: "uppercase" }}
            >
              {h.nombre}
            </text>
          );
        })}

        {/* --- Robot: contorno hueco, sin color --- */}
        {pRobot && (
          <g
            transform={`translate(${pRobot.cx} ${pRobot.cy + 6.5})`}
            aria-hidden
            stroke="#F1F6FA"
            fill="none"
            opacity="0.85"
          >
            <rect x="-2.6" y="-2.6" width="5.2" height="5.2" strokeWidth="0.5" />
            <line x1="0" y1="-2.6" x2="0" y2="-4.3" strokeWidth="0.4" />
            <circle cx="0" cy="-4.7" r="0.5" fill="#F1F6FA" stroke="none" />
          </g>
        )}

        {/* --- Persona: el único elemento con color del plano --- */}
        {pPersona && (
          <g>
            <circle
              cx={pPersona.cx}
              cy={pPersona.cy}
              r="4.2"
              fill={alerta?.id === persona?.id ? "#FB7185" : "#34D399"}
              opacity="0.2"
              className="animate-halo"
              style={{ transformOrigin: `${pPersona.cx}px ${pPersona.cy}px` }}
            />
            <circle
              cx={pPersona.cx}
              cy={pPersona.cy}
              r="2.1"
              fill={alerta?.id === persona?.id ? "#FB7185" : "#34D399"}
              stroke="#080D14"
              strokeWidth="0.7"
            />
          </g>
        )}
      </svg>

      {/* Leyenda: el color no es el único canal. */}
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ok" aria-hidden />
          Persona
        </span>
        {robot && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-[1px] border border-ink"
              aria-hidden
            />
            Robot
          </span>
        )}
        {alerta && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 border border-ink-faint"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #8199AE 0 1px, transparent 1px 3px)",
              }}
              aria-hidden
            />
            Emergencia
          </span>
        )}
      </figcaption>
    </figure>
  );
}
