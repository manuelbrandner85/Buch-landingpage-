/**
 * Tiefenkarten mit einem echten Tiefenmodell.
 *
 * Bis hierher waren die Karten eine Näherung aus Bildhöhe und Helligkeit.
 * Für Landschaften ging das durch, für Innenräume nicht: In der Kammer von
 * Dunhuang lag das helle Fenster hinten und wurde als „nah" gelesen.
 *
 * Jetzt läuft Depth Anything V2 (small) über jedes Motiv. Das Modell schätzt
 * die relative Tiefe je Bildpunkt – daraus entsteht echte Verdeckung: Der
 * Vordergrund schiebt sich beim Fahren wirklich vor den Hintergrund.
 *
 *   npm run tiefenkarten
 *   npm run tiefenkarten -- --band=band-3
 *
 * Das Modell liegt unter modelle/depth.onnx und ist nicht im Repository
 * (99 MB). Fehlt es, wird es beim ersten Lauf geladen.
 *
 * ---------------------------------------------------------------------------
 * 08.09.2026 — drei Fehler, die alle dieselbe Wirkung hatten
 *
 * Die Karte ist keine Illustration, sondern Messdaten. Die Kinoebene liest aus
 * ihr, was beim Durchfahren nah ist und wo die Schärfeebene liegt – mit
 * denselben UV-Koordinaten, mit denen sie auch das Motiv liest. Was hier
 * ungenau wird, wird dort räumlich falsch.
 *
 * 1. **Das Seitenverhältnis war fest auf 16:9 verdrahtet** (`512 * 9/16`).
 *    Dreizehn Motive haben ein anderes: Band 3 liegt bei 1,49 und 1,34,
 *    `b3-kap16-motiv` bei 2,71, die Coverbilder bei 0,67. Bei ihnen lag die
 *    Tiefeninformation systematisch an der falschen Bildstelle – die Engine
 *    las „nah", wo „fern" war. Jetzt folgt die Karte dem Motiv.
 *
 * 2. **512 Pixel waren zu wenig.** Gezeigt wird das Motiv mit bis zu 2560 px,
 *    die Karte hatte ein Fünftel davon. Silhouetten – Felskante, Türrahmen,
 *    Grashalm – fielen unter die Rasterung, und genau an den Silhouetten
 *    entsteht der Eindruck von Raum. Jetzt 1024 auf der langen Kante.
 *
 * 3. **`webp({quality:82})` war zu grob.** Auf einem Graustufengradienten macht
 *    das aus einer Fläche, die schräg in den Raum läuft, eine Treppe. Gemessen
 *    an `grabung`, 1024×576, gegen die unkomprimierte Karte:
 *
 *    | | Größe | größter Fehler | mittlerer Fehler |
 *    |---|---|---|---|
 *    | PNG grau | 100 KB | 0 | 0 |
 *    | WebP verlustfrei | 56 KB | 0 | 0 |
 *    | **WebP q95** | **16 KB** | **9/255** | **0,36** |
 *    | WebP q82 (alt, bei 512 px) | 8 KB | 18/255 | 0,59 |
 *
 *    Gewählt ist q95: doppelte Datenmenge gegenüber vorher, dafür vierfache
 *    Auflösung und halber Fehler. Verlustfrei wäre das Siebenfache der alten
 *    Größe – bei vier Szenen im Ladefenster rund 190 KB mehr, für einen
 *    Unterschied von neun Stufen auf 255. Wer die Karten je verlustfrei
 *    braucht: `{ lossless: true, effort: 6 }` statt der Zeile unten.
 *
 * Dazu: Der Gaußfilter mit Radius 1,2 war auf 512 px sehr stark. Er war gegen
 * das Flimmern des Versatzes da, hat aber jede Kante mitgenommen. Ein
 * Medianfilter tut dasselbe gegen Rauschen und lässt Kanten stehen – danach
 * genügt ein sehr kleiner Gauß.
 */
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import { readdir, mkdir, access, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

// Band wählbar: npm run assets -- --band=band-2
// Ohne Angabe bleibt es bei Band 1 und assets-quelle/ – wie bisher.
const arg = (n, s) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? s;
const BAND = arg('band', 'band-1');
const QUELLE = arg('quelle', BAND === 'band-1' ? 'assets-quelle' : `assets-quelle/${BAND}`);
const ZIEL = `public/assets/${BAND}/szenen`;
const MODELL = 'modelle/depth.onnx';
const HERKUNFT = 'https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx';
const KANTE = 518;                    // Eingabegröße des Modells
const LANGE_KANTE = 1024;             // längere Kante der fertigen Karte

await mkdir('modelle', { recursive: true });
try { await access(MODELL); } catch {
  console.log('Tiefenmodell wird geladen (99 MB, einmalig) …');
  const a = await fetch(HERKUNFT);
  await pipeline(Readable.fromWeb(a.body), createWriteStream(MODELL));
}

const sitzung = await ort.InferenceSession.create(MODELL);
const dateien = (await readdir(QUELLE)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const datei of dateien) {
  const name = path.parse(datei).name;
  const quelle = path.join(QUELLE, datei);

  // Das Seitenverhältnis des Motivs. Die Karte wird später darauf zurückgeführt –
  // die Kinoebene sampelt Motiv und Karte mit denselben Koordinaten.
  const { width: qBreite, height: qHoehe } = await sharp(quelle).metadata();
  const quer = qBreite >= qHoehe;
  const zBreite = quer ? LANGE_KANTE : Math.round(LANGE_KANTE * (qBreite / qHoehe));
  const zHoehe = quer ? Math.round(LANGE_KANTE * (qHoehe / qBreite)) : LANGE_KANTE;

  // Vorverarbeitung wie beim Modell: quadratisch, normalisiert, CHW.
  // Die Verzerrung auf das Quadrat ist gewollt und die übliche Betriebsart des
  // Modells; sie wird beim Zurückführen wieder aufgehoben.
  const { data } = await sharp(quelle).resize(KANTE, KANTE, { fit: 'fill' })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const eingabe = new Float32Array(3 * KANTE * KANTE);
  const mittel = [0.485, 0.456, 0.406], streuung = [0.229, 0.224, 0.225];
  for (let i = 0; i < KANTE * KANTE; i++) {
    for (let k = 0; k < 3; k++) {
      eingabe[k * KANTE * KANTE + i] = (data[i * 3 + k] / 255 - mittel[k]) / streuung[k];
    }
  }

  const ergebnis = await sitzung.run({
    [sitzung.inputNames[0]]: new ort.Tensor('float32', eingabe, [1, 3, KANTE, KANTE]),
  });
  const roh = ergebnis[sitzung.outputNames[0]].data;

  // Auf 0…255 spreizen: nah = hell, fern = dunkel
  let min = Infinity, max = -Infinity;
  for (const v of roh) { if (v < min) min = v; if (v > max) max = v; }
  const spanne = Math.max(1e-6, max - min);
  const grau = Buffer.alloc(roh.length);
  for (let i = 0; i < roh.length; i++) grau[i] = Math.round(((roh[i] - min) / spanne) * 255);

  const seite = Math.round(Math.sqrt(roh.length));
  const ziel = path.join(ZIEL, `${name}-tiefe.webp`);
  await sharp(grau, { raw: { width: seite, height: seite, channels: 1 } })
    .resize(zBreite, zHoehe, { fit: 'fill', kernel: 'lanczos3' })
    .median(3)                        // gegen Rauschen, ohne die Kanten mitzunehmen
    .blur(0.5)                        // Restflimmern des Versatzes, sehr klein gehalten
    .webp({ quality: 95, effort: 6 })
    .toFile(ziel);

  const kb = Math.round((await stat(ziel)).size / 1024);
  console.log(`${name}-tiefe.webp  ${zBreite}×${zHoehe}  ${kb} KB  (Depth Anything V2)`);
}
