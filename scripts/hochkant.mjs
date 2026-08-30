/**
 * Ein Kapitelbild von „Alles nur Zufall?“ als Hochformat 9:16.
 *
 *   node scripts/hochkant.mjs kap01 [breite]
 *
 * Die Bilder aus dem Satz sind 2:3 – ein Buchformat. Der Feed ist 9:16, ein
 * Telefonformat. Umgerechnet wird nicht durch Stauchen, sondern durch
 * Beschneiden an den Seiten: Die Höhe bleibt ganz, links und rechts fällt
 * gleich viel weg. Bei diesen Motiven ist das der dunkle Rand, nicht das Motiv.
 *
 * Das Ergebnis geht an kie.ai als Startbild der Bewegtfassung und dient
 * gleichzeitig als Standbild, solange keine Bewegtfassung da ist.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const name = process.argv[2];
const breite = Number(process.argv[3] ?? 1080);
if (!name) { console.error('Aufruf: node scripts/hochkant.mjs kap01 [breite]'); process.exit(1); }

const quelle = `assets-quelle/zufall/kapitel/${name}.jpg`;
const zielOrdner = 'assets-quelle/zufall/hochkant';
mkdirSync(zielOrdner, { recursive: true });
const ziel = `${zielOrdner}/${name}-9x16.jpg`;

const m = await sharp(quelle).metadata();
const sollBreite = Math.min(m.width, Math.round(m.height * 9 / 16));
const links = Math.max(0, Math.round((m.width - sollBreite) / 2));

await sharp(quelle)
  .extract({ left: links, top: 0, width: sollBreite, height: m.height })
  .resize({ width: breite, height: Math.round(breite * 16 / 9), fit: 'cover' })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(ziel);

console.log(`${ziel}  (${m.width}x${m.height} -> ${breite}x${Math.round(breite * 16 / 9)})`);
