import type { Asset } from '@/data/gemeinsam/typen';

/**
 * Bildquellen. scripts/assets.mjs legt AVIF und WebP nebeneinander ab;
 * AVIF ist rund 15 Prozent kleiner, WebP bleibt als Rückfall.
 */
const BREITEN = [640, 1000, 1600, 2400] as const;

/** Unter GitHub Pages liegt die Welt in einem Unterordner, nicht in der Wurzel. */
export const BASIS_PFAD = process.env.NEXT_PUBLIC_BASIS_PFAD ?? '';
export const ordner = (datei: string): string =>
  `${BASIS_PFAD}/assets/band-1/szenen/${datei}`;

const verfuegbar = (asset: Asset): number[] =>
  BREITEN.filter((b) => b <= asset.breite * 1.2);

const pfad = (asset: Asset, breite: number, format: 'avif' | 'webp'): string =>
  ordner(`${asset.datei}-${breite}.${format}`);

/** Eine konkrete Quelle – für next/image und Vorschaubilder. */
export function bildQuelle(asset: Asset, wunsch = 1600, format: 'avif' | 'webp' = 'avif'): string {
  const passend = verfuegbar(asset);
  const breite = passend.reduce<number>(
    (beste, b) => (Math.abs(b - wunsch) < Math.abs(beste - wunsch) ? b : beste),
    passend[0] ?? 640);
  return pfad(asset, breite, format);
}

/**
 * Hintergrundquelle für die Kinoebene: `image-set()` überlässt dem Browser
 * die Wahl zwischen AVIF und WebP sowie zwischen den Auflösungen.
 * Auf Mobilgeräten reicht die kleinere Stufe – das spart Bandbreite,
 * ohne dass die Szene anders aussieht.
 */
export function bildSatz(asset: Asset): string {
  const passend = verfuegbar(asset);
  const klein = passend[0] ?? 640;
  const gross = passend[passend.length - 1] ?? klein;
  const eintraege = [
    `url("${pfad(asset, gross, 'avif')}") type("image/avif") 2x`,
    `url("${pfad(asset, klein, 'avif')}") type("image/avif") 1x`,
    `url("${pfad(asset, gross, 'webp')}") type("image/webp") 2x`,
    `url("${pfad(asset, klein, 'webp')}") type("image/webp") 1x`,
  ].join(', ');
  return `image-set(${eintraege})`;
}

/** Das erste Motiv wird vorgeladen, damit der Einstieg sofort da ist. */
export function vorladen(asset: Asset): { href: string; type: string } {
  return { href: bildQuelle(asset, 1000, 'avif'), type: 'image/avif' };
}
