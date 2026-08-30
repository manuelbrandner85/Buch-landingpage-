/**
 * Standbilder der Zufall-Welt in beiden Formaten.
 *
 *   node scripts/zufall-standbilder.mjs
 *
 * ffmpeg auf der Linux-Seite kann kein AVIF schreiben, sharp schon — und die
 * Bildquellen des Hauses fragen zuerst nach AVIF. Deshalb dieser eine Schritt
 * mit sharp: das Bühnenfoto und die vierzig Kapitel-Standbilder, jeweils AVIF
 * neben WebP.
 */
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const ZIEL = 'public/assets/zufall/szenen';
const BREITEN = [640, 1000, 1600];

async function stufen(quelle, name, breiten = BREITEN) {
  for (const b of breiten) {
    await sharp(quelle).resize({ width: b }).avif({ quality: 55, effort: 4 })
      .toFile(`${ZIEL}/${name}-${b}.avif`);
    await sharp(quelle).resize({ width: b }).webp({ quality: 82 })
      .toFile(`${ZIEL}/${name}-${b}.webp`);
  }
  console.log(`${name}: ${breiten.join(', ')}`);
}

// Das entzerrte Foto, nicht das rohe: Die Aufnahme hat Perspektive — die
// Scheibe ist unten 715 Pixel breit und oben 623 —, und in ein Trapez passt
// kein Rechteck. Entzerrt sitzt der Bildschirm auf den Pixel genau.
await stufen('assets-quelle/zufall/buehne/handy-gerade.jpg', 'buehne-handy');
await stufen('assets-quelle/zufall/kapitel/kap01.jpg', 'cover-zufall-feed', [640, 1000]);

for (let n = 1; n <= 40; n++) {
  const nr = String(n).padStart(2, '0');
  const webp = `${ZIEL}/kap${nr}-1000.webp`;
  if (!existsSync(webp)) { console.log(`kap${nr}: Standbild fehlt`); continue; }
  for (const b of [640, 1000]) {
    const q = `${ZIEL}/kap${nr}-${b}.webp`;
    if (!existsSync(q)) continue;
    await sharp(q).avif({ quality: 52, effort: 4 }).toFile(`${ZIEL}/kap${nr}-${b}.avif`);
  }
}
console.log('vierzig Kapitel-Standbilder auch als AVIF.');
