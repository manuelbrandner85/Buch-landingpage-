import type { Asset, BandId } from '@/data/gemeinsam/typen';

/**
 * Bildquellen. scripts/assets.mjs legt AVIF und WebP nebeneinander ab;
 * AVIF ist rund 15 Prozent kleiner, WebP bleibt als Rückfall.
 */
const BREITEN = [640, 1000, 1600, 1920, 2560] as const;

/** Unter GitHub Pages liegt die Welt in einem Unterordner, nicht in der Wurzel. */
export const BASIS_PFAD = process.env.NEXT_PUBLIC_BASIS_PFAD ?? '';
export const ordner = (datei: string, band: BandId = 'band-1'): string =>
  `${BASIS_PFAD}/assets/${band}/szenen/${datei}`;

/**
 * Die Fassung der Bewegtbilder.
 *
 * Der Server schickt zu jeder mp4 `Cache-Control: immutable` für ein Jahr –
 * wer die Seite einmal gesehen hat, fragt danach nie wieder nach. Eine Datei
 * unter demselben Namen auszutauschen ist damit für jeden Wiederkehrer
 * wirkungslos, und man merkt es selbst nicht, weil der eigene Browser die
 * neue Datei ja hat. Dieselbe Falle wie beim Hausfilm; dort heißt die
 * Konstante `FASSUNG`.
 *
 * Wer eine Bewegtfassung neu rechnet, zählt diese Zahl hoch. Sonst nichts.
 */
const BEWEGTFASSUNG = '3';
export const bewegt = (datei: string, band: BandId = 'band-1'): string =>
  `${ordner(datei, band)}?f=${BEWEGTFASSUNG}`;

const verfuegbar = (asset: Asset): number[] =>
  BREITEN.filter((b) => b <= asset.breite * 1.2);

const pfad = (asset: Asset, breite: number, format: 'avif' | 'webp'): string =>
  ordner(`${asset.datei}-${breite}.${format}`, asset.bandId ?? 'band-1');

/** Eine konkrete Quelle – für next/image und Vorschaubilder. */
export function bildQuelle(asset: Asset, wunsch = 1600, format: 'avif' | 'webp' = 'avif'): string {
  const passend = verfuegbar(asset);
  // Aufrunden, nicht die nächstliegende Stufe nehmen.
  //
  // Vorher wurde die nächstgelegene Breite gewählt. Bei einem Bedarf von 1296
  // Pixeln lag 1000 näher als 1600 – die Kinoebene bekam also ein Bild mit
  // 1000 Pixeln und zog es auf die volle Fläche. Genau das war die Unschärfe.
  // Ein zu großes Bild kostet Bytes, ein zu kleines kostet Bildqualität; hier
  // wiegt die Bildqualität schwerer.
  const breite = passend.find((b) => b >= wunsch) ?? passend[passend.length - 1] ?? 640;
  return pfad(asset, breite, format);
}

/**
 * Alle vorhandenen Stufen eines Motivs als `srcset`.
 *
 * Der Grund im Empfang wurde bis zum 31.08.2026 fest in 1920 Pixeln geladen —
 * auch auf einem Telefon mit 390 Pixeln Breite. Das ist das größte Element des
 * ersten Bildschirms und damit das, woran die Ladezeit gemessen wird: Dort
 * 57 KB zu laden, wo 25 KB dasselbe Bild ergeben, verzögert den Aufbau ohne
 * jeden sichtbaren Gewinn.
 *
 * Mit `srcset` und `sizes` entscheidet der Browser — er kennt Breite,
 * Bildpunktdichte und, anders als wir hier, auch die Verbindung.
 */
export function bildSatzHtml(asset: Asset, format: 'avif' | 'webp' = 'avif'): string {
  return verfuegbar(asset)
    .map((b) => `${pfad(asset, b, format)} ${b}w`)
    .join(', ');
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
  // Bewusst die kleinste Stufe: Sie steht sofort, und die Kinoebene tauscht
  // gleich darauf die passende Auflösung ein. Ein doppelt geladenes großes
  // Motiv wäre teurer als dieser kurze Moment.
  return { href: bildQuelle(asset, 640, 'avif'), type: 'image/avif' };
}
