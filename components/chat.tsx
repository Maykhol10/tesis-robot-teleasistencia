"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Boton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { conversacion, etiquetaEmisor, type Emisor } from "@/lib/mock-data";
import { formatFechaHora } from "@/lib/utils";

// Cada emisor tiene su propio color de burbuja: quien habla se distingue
// sin leer la etiqueta.
const estiloMensaje: Record<Emisor, string> = {
  "adulto-mayor": "bg-warn-bg text-ink ring-warn/30",
  cuidador: "bg-signal/15 text-ink ring-signal/40",
  "agente-llm": "bg-base-700 text-ink-muted ring-base-500",
};

/** Botón que abre la conversación. Vive en la barra de acciones del vídeo. */
export function BotonChat({
  abierto,
  alPulsar,
}: {
  abierto: boolean;
  alPulsar: () => void;
}) {
  return (
    <Boton
      onClick={alPulsar}
      aria-pressed={abierto}
      aria-label={`${abierto ? "Cerrar" : "Abrir"} conversación, ${conversacion.length} mensajes`}
      variante="secundario"
      className={cn(abierto && "bg-signal/15 text-signal ring-signal/40")}
    >
      <MessageCircle size={18} aria-hidden />
      Conversación
      <span className="tabular ml-0.5 rounded-full bg-base-600 px-1.5 text-xs font-bold text-ink-muted">
        {conversacion.length}
      </span>
    </Boton>
  );
}

/**
 * Conversación con la persona.
 *
 * Es una columna más de la rejilla, no un panel superpuesto: durante la
 * teleoperación el vídeo y la cruceta son lo que importa, y un panel flotante
 * encima taparía justo eso. Al abrirse, el contenido se reparte el ancho.
 */
export function PanelChat({ alCerrar }: { alCerrar: () => void }) {
  const [borrador, setBorrador] = useState("");
  const listaRef = useRef<HTMLOListElement | null>(null);

  // Al montar se muestra el final de la conversación, que es lo reciente.
  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, []);

  // Escape cierra el panel: es lo que se espera de algo que se abre y cierra.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [alCerrar]);

  return (
    <section
      aria-label="Conversación"
      // Llena la altura de la fila sin aportarla: absolute la saca del
      // cálculo, así la marca el vídeo y aquí sólo desplaza la lista.
      className="flex h-[32rem] min-h-0 flex-col overflow-hidden rounded-2xl border border-base-500 lg:absolute lg:inset-0 lg:h-auto"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-base-500 px-4 py-3">
        <MessageCircle size={18} aria-hidden className="text-signal" />
        <h2 className="flex-1 text-sm font-bold text-ink">Conversación</h2>
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar conversación"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-ink-muted transition-colors hover:bg-base-700 hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>
      </header>

      <ol
        ref={listaRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
      >
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
        className="shrink-0 border-t border-base-500 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBorrador("");
        }}
      >
        <div className="flex gap-2">
          <label htmlFor="mensaje-chat" className="sr-only">
            Escribir mensaje
          </label>
          <input
            id="mensaje-chat"
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-base-500 bg-base-800 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-signal"
          />
          <Boton
            type="submit"
            aria-label="Enviar mensaje"
            className="w-12 shrink-0 px-0"
          >
            <Send size={18} aria-hidden />
          </Boton>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          El robot leerá tu mensaje en voz alta.
        </p>
      </form>
    </section>
  );
}
