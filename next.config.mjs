/**
 * Zwei Ziele aus einer Konfiguration:
 *
 *  · GitHub Pages – statischer Export unter einem Unterpfad
 *    (`/Buch-landingpage-/`). Dafür wird NEXT_PUBLIC_BASIS_PFAD gesetzt.
 *  · Vercel oder ein eigener Server – ohne Unterpfad, mit Bildoptimierung.
 *
 * Die Pfade der Motive werden zur Laufzeit über denselben Wert gebildet
 * (siehe src/world/bilder.ts), sonst sucht die Kinoebene die Bilder in der Wurzel.
 */
const basisPfad = process.env.NEXT_PUBLIC_BASIS_PFAD ?? '';
const alsExport = process.env.NEXT_EXPORT === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(alsExport ? { output: 'export', trailingSlash: true } : {}),
  ...(basisPfad ? { basePath: basisPfad, assetPrefix: basisPfad } : {}),
  images: {
    // Beim statischen Export gibt es keinen Bildserver – die Varianten
    // erzeugt scripts/assets.mjs ohnehin schon vorab.
    unoptimized: alsExport,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  experimental: { optimizePackageImports: ['gsap'] },
};
export default nextConfig;
