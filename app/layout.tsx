import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Aliada — Teleasistencia en casa",
  description:
    "Monitoreo y acompañamiento remoto para adultos mayores mediante un robot asistente autónomo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE">
      <head>
        {/* GitHub Pages sirve el HTML con Cache-Control: max-age=600 y no deja
            cambiarlo. Tras un despliegue el navegador sigue pidiendo durante
            diez minutos los bundles del build anterior, que ya no existen, y
            la página queda rota. Estas metaetiquetas piden que el documento
            se revalide siempre; los archivos de /_next/static llevan hash en
            el nombre, así que esos sí conviene que se cacheen. */}
        <meta httpEquiv="Cache-Control" content="no-cache, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
      </head>
      <body>
        {/* Primer elemento enfocable: permite saltar la navegación. */}
        <a href="#contenido" className="saltar-al-contenido">
          Saltar al contenido
        </a>

        {/* Altura fija a la ventana: el shell (nav + banner) no se mueve;
            solo <main> desplaza su contenido. */}
        <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
          <Nav />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <main
              id="contenido"
              tabIndex={-1}
              className="reticula min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
