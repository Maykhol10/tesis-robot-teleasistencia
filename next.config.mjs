// NEXT_BASE_PATH se define solo en el workflow de GitHub Pages (proyecto servido
// bajo /tesis-robot-teleasistencia). Al migrar a un dominio propio, no se define
// y el sitio se sirve desde la raíz sin tocar este archivo.
const basePath = process.env.NEXT_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
