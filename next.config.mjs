/** @type {import('next').NextConfig} */

// GitHub Pages sirve el sitio bajo /<repo>, no en la raíz del dominio.
// En desarrollo el prefijo estorba, así que sólo se aplica al construir para Pages.
const enPages = process.env.GITHUB_PAGES === "true";
const repo = "/tesis-robot-teleasistencia";

const nextConfig = {
  // Genera HTML plano en out/: Pages no ejecuta servidor Node.
  output: "export",
  basePath: enPages ? repo : "",
  assetPrefix: enPages ? repo : "",
  // Sin servidor no hay optimizador de imágenes.
  images: { unoptimized: true },
  // Pages resuelve /ruta/ -> /ruta/index.html; sin esto los enlaces dan 404.
  trailingSlash: true,
};

export default nextConfig;
