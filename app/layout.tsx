import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Nav } from "@/components/nav";
import { BannerAlerta } from "@/components/banner-alerta";

export const metadata: Metadata = {
  title: "Aliada — Teleasistencia en casa",
  description:
    "Monitoreo y acompañamiento remoto para adultos mayores mediante un robot asistente autónomo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE">
      <body>
        {/* Altura fija a la ventana: el shell (nav + banner) no se mueve;
            solo <main> desplaza su contenido. */}
        <div className="flex h-dvh flex-col overflow-hidden md:flex-row">
          <Nav />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <BannerAlerta />
            <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
