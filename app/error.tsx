"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Boton } from "@/components/ui";

/**
 * Pantalla de error de la aplicación.
 *
 * Existe sobre todo por un fallo concreto: GitHub Pages sirve el HTML con
 * diez minutos de caché, así que justo después de un despliegue el navegador
 * pide bundles del build anterior, que ya no están. La página se queda a
 * medias y el usuario no tiene forma de saber que basta con recargar.
 *
 * Cuando el error es ese, recargamos solos una vez. La marca en sessionStorage
 * evita el bucle: si tras recargar vuelve a fallar, el problema es otro y hay
 * que mostrarlo en vez de recargar sin fin.
 */
const MARCA_RECARGA = "recarga-por-chunk";

function esFalloDeChunk(error: Error): boolean {
  const texto = `${error.name} ${error.message}`;
  return (
    /ChunkLoadError/i.test(texto) ||
    /Loading chunk [\d]+ failed/i.test(texto) ||
    /Failed to fetch dynamically imported module/i.test(texto) ||
    /error loading dynamically imported module/i.test(texto)
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!esFalloDeChunk(error)) return;

    let yaRecargado = false;
    try {
      yaRecargado = sessionStorage.getItem(MARCA_RECARGA) === "1";
      if (!yaRecargado) sessionStorage.setItem(MARCA_RECARGA, "1");
    } catch {
      // Navegación privada o almacenamiento bloqueado: sin marca no podemos
      // garantizar que no se repita, así que no recargamos.
      return;
    }

    if (!yaRecargado) window.location.reload();
  }, [error]);

  // Si llegamos aquí tras una recarga, la marca ya no sirve para nada.
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(MARCA_RECARGA);
      } catch {
        // Sin almacenamiento no hay nada que limpiar.
      }
    };
  }, []);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <AlertTriangle
          size={40}
          aria-hidden
          className="mx-auto text-warn"
        />
        <h1 className="mt-4 text-xl font-bold text-ink">
          Algo salió mal al cargar la página
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {esFalloDeChunk(error)
            ? "Puede que la aplicación se haya actualizado mientras la usabas. Recarga para obtener la versión más reciente."
            : "Vuelve a intentarlo. Si el problema sigue, recarga la página."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Boton onClick={reset}>
            <RotateCw size={18} aria-hidden />
            Reintentar
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => window.location.reload()}
          >
            Recargar la página
          </Boton>
        </div>
      </div>
    </div>
  );
}
