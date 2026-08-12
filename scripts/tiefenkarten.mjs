/**
 * Tiefenkarten für die 2.5D-Kamerafahrt.
 *
 * EHRLICHER HINWEIS ZUM VERFAHREN
 * Dies ist keine gemessene Tiefe, sondern eine Näherung aus zwei Signalen:
 *   1. der Bildhöhe – was unten liegt, ist bei Landschaftsaufnahmen näher,
 *   2. der Helligkeit – dunkle Bereiche liegen meist hinten.
 * Für Landschaften trifft das gut zu (Graben, Feld, Straße, Meeresgrund),
 * für Innenräume nur teilweise (Kammer, Çatalhöyük). Deshalb steht die
 * Mischung je Motiv in der Tabelle unten und nicht fest im Code.
 *
 * Sobald die Originalrenderings vorliegen, sollte hier ein echtes
 * Tiefenmodell laufen (Depth Anything, MiDaS). Der Rest der Kette ändert
 * sich dadurch nicht: Die Engine liest weiterhin <name>-tiefe.webp.
 *
 *   npm run tiefenkarten
 */
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const QUELLE = 'assets-quelle';
const ZIEL = 'public/assets/band-1/szenen';

/** [Anteil Bildhöhe, Anteil Helligkeit, Horizont] – Rest ergänzt sich. */
const EINSTELLUNG = {
  cover:      [0.75, 0.25, 0.30],
  graben:     [0.85, 0.15, 0.18],   // weite Landschaft, klarer Horizont
  feld:       [0.85, 0.15, 0.22],
  strasse:    [0.90, 0.10, 0.15],   // Fluchtpunkt: Tiefe fast rein vertikal
  versunken:  [0.70, 0.30, 0.25],
  feuer:      [0.45, 0.55, 0.45],   // Nachtszene: Helligkeit trägt mehr
  grabung:    [0.60, 0.40, 0.30],
  catal:      [0.35, 0.65, 0.40],   // Innenraum
  dunhuang:   [0.35, 0.65, 0.35],
  bibliothek: [0.40, 0.60, 0.35],
  baustelle:  [0.45, 0.55, 0.38],
  persien:    [0.60, 0.40, 0.30],
  kap2:       [0.85, 0.15, 0.20], kap3: [0.80, 0.20, 0.25],
  kap4:       [0.80, 0.20, 0.25], kap6: [0.70, 0.30, 0.28],
};

const dateien = (await readdir(QUELLE)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const datei of dateien) {
  const name = path.parse(datei).name;
  const [wHoehe, wLicht, horizont] = EINSTELLUNG[name] ?? [0.7, 0.3, 0.3];

  const B = 512;
  const bild = sharp(path.join(QUELLE, datei)).resize({ width: B });
  const { data, info } = await bild.clone().greyscale().blur(9)
    .raw().toBuffer({ resolveWithObject: true });

  const aus = Buffer.alloc(info.width * info.height);
  for (let y = 0; y < info.height; y++) {
    // Bildhöhe: unterhalb des Horizonts steigt die Nähe an
    const rampe = Math.max(0, (y / info.height - horizont) / (1 - horizont));
    for (let x = 0; x < info.width; x++) {
      const i = y * info.width + x;
      const licht = data[i] / 255;
      const t = wHoehe * rampe + wLicht * licht;
      aus[i] = Math.round(Math.min(1, Math.max(0, t)) * 255);
    }
  }

  await sharp(aus, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(3)
    .webp({ quality: 70 })
    .toFile(path.join(ZIEL, `${name}-tiefe.webp`));
  console.log(`${name}-tiefe.webp  (Höhe ${wHoehe}, Licht ${wLicht}, Horizont ${horizont})`);
}
