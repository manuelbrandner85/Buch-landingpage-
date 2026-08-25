/**
 * Bildpipeline: aus jedem Quellmotiv AVIF und WebP in mehreren Breiten.
 * Aufruf:  npm run assets
 *
 * Quellen liegen unter  assets-quelle/<name>.jpg  (nicht im Repo, weil groß)
 * Ergebnis liegt unter  public/assets/band-1/szenen/<name>-<breite>.avif
 *
 * Hinweis: Die Motive stammen aus dem Buch. Im Druck-PDF ist jede Seite eine
 * flach gerechnete Ebene – für Vollbild bitte die Originalrenderings verwenden.
 */
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Band wählbar: npm run assets -- --band=band-2
// Ohne Angabe bleibt es bei Band 1 und assets-quelle/ – wie bisher.
const arg = (n, s) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? s;
const BAND = arg('band', 'band-1');
const QUELLE = arg('quelle', BAND === 'band-1' ? 'assets-quelle' : `assets-quelle/${BAND}`);
const ZIEL = `public/assets/${BAND}/szenen`;
const BREITEN = [640, 1000, 1600, 1920, 2560];

await mkdir(ZIEL, { recursive: true });
const dateien = (await readdir(QUELLE)).filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f));

for (const datei of dateien) {
  const name = path.parse(datei).name;
  const bild = sharp(path.join(QUELLE, datei));
  const { width = 0 } = await bild.metadata();

  for (const b of BREITEN) {
    if (b > width * 1.2) continue; // nicht hochrechnen
    await bild.clone().resize({ width: b })
      .avif({ quality: 60, effort: 4, chromaSubsampling: '4:4:4' })
      .toFile(path.join(ZIEL, `${name}-${b}.avif`));
    await bild.clone().resize({ width: b })
      .webp({ quality: 80, effort: 4 })
      .toFile(path.join(ZIEL, `${name}-${b}.webp`));
  }
  // Poster für spätere Motion-Sequenzen
  await bild.clone().resize({ width: 640 }).blur(8)
    .avif({ quality: 35 }).toFile(path.join(ZIEL, `${name}-poster.avif`));
  console.log(`${name}: ${BREITEN.filter((b) => b <= width * 1.2).length} Breiten + Poster`);
}
