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
 *
 * Das Modell liegt unter modelle/depth.onnx und ist nicht im Repository
 * (99 MB). Fehlt es, wird es beim ersten Lauf geladen.
 */
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import { readdir, mkdir, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const QUELLE = 'assets-quelle';
const ZIEL = 'public/assets/band-1/szenen';
const MODELL = 'modelle/depth.onnx';
const HERKUNFT = 'https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx';
const KANTE = 518;                    // Eingabegröße des Modells

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

  // Vorverarbeitung wie beim Modell: quadratisch, normalisiert, CHW
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
  await sharp(grau, { raw: { width: seite, height: seite, channels: 1 } })
    .resize(512, Math.round(512 * 9 / 16), { fit: 'fill' })
    .blur(1.2)                        // Kanten leicht glätten, sonst flimmert der Versatz
    .webp({ quality: 82 })
    .toFile(path.join(ZIEL, `${name}-tiefe.webp`));
  console.log(`${name}-tiefe.webp  (Depth Anything V2)`);
}
