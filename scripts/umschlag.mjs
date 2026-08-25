/**
 * Aus dem Druckumschlag die drei Flächen des Buchkörpers.
 *
 *   node scripts/umschlag.mjs <umschlag.pdf> <band> <basisname> [--seiten=206]
 *
 * Der Umschlag einer Klebebindung ist eine Fläche: Rückseite, Rücken,
 * Vorderseite nebeneinander, ringsum Beschnitt. Die Website braucht die drei
 * getrennt – der gebundene Band im Raum setzt sich daraus zusammen.
 *
 * Gerechnet wird nicht geschätzt: Die Höhe der Datei abzüglich zweimal
 * Beschnitt ergibt die Seitenhöhe, daraus über das Seitenverhältnis die
 * Seitenbreite, und was in der Mitte übrig bleibt, ist der Rücken. Die
 * Rückenstärke fällt dabei als Nebenprodukt ab; sie steht in `Buch3D`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import sharp from 'sharp';

const [pdf, band, basis] = process.argv.slice(2);
if (!pdf || !band || !basis) {
  console.error('Aufruf: node scripts/umschlag.mjs <umschlag.pdf> <band> <basisname>');
  process.exit(1);
}

const BESCHNITT = 9;          // 0,125 Zoll, wie bei KDP
const SEITE = 432 / 648;      // 6 × 9 Zoll – das Format der Reihe
const DPI = 300;
const ZIEL = `public/assets/${band}/szenen`;
const QUELLE = `assets-quelle/${band}`;
mkdirSync(ZIEL, { recursive: true });
mkdirSync(QUELLE, { recursive: true });

const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
const [, bPt, hPt] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/).map(Number);

const seiteHoehe = hPt - 2 * BESCHNITT;
const seiteBreite = seiteHoehe * SEITE;
const ruecken = bPt - 2 * BESCHNITT - 2 * seiteBreite;
if (ruecken <= 0) throw new Error('Der Umschlag ist schmaler als zwei Seiten – Format prüfen.');

const px = (pt) => Math.round(pt * DPI / 72);
console.log(`Umschlag ${bPt.toFixed(1)} × ${hPt.toFixed(1)} pt`
  + ` → Seite ${seiteBreite.toFixed(1)} × ${seiteHoehe.toFixed(1)} pt,`
  + ` Rücken ${ruecken.toFixed(2)} pt (${(ruecken / seiteBreite).toFixed(4)} der Breite)`);

const roh = `/tmp/umschlag-${basis}`;
execFileSync('pdftoppm', ['-r', String(DPI), '-png', '-f', '1', '-l', '1', pdf, roh]);
const datei = existsSync(`${roh}-1.png`) ? `${roh}-1.png` : `${roh}-01.png`;

const oben = px(BESCHNITT), hoch = px(seiteHoehe), breit = px(seiteBreite);
const flaechen = [
  ['rueckseite', px(BESCHNITT), breit],
  ['ruecken', px(BESCHNITT + seiteBreite), px(ruecken)],
  ['vorn', px(BESCHNITT + seiteBreite + ruecken), breit],
];

for (const [name, links, weite] of flaechen) {
  const bild = sharp(datei).extract({ left: links, top: oben, width: weite, height: hoch });
  if (name === 'vorn') {
    // Die Vorderseite geht als Quellbild in die normale Bildstrecke.
    await bild.clone().resize({ width: 1200 }).jpeg({ quality: 94 })
      .toFile(`${QUELLE}/${basis}.jpg`);
    console.log(`${QUELLE}/${basis}.jpg`);
  } else {
    for (const [endung, wandeln] of [['webp', (b) => b.webp({ quality: 86, effort: 4 })],
      ['avif', (b) => b.avif({ quality: 62, effort: 4 })]]) {
      await wandeln(bild.clone().resize({ width: name === 'ruecken' ? 200 : 900 }))
        .toFile(`${ZIEL}/${basis}-${name}.${endung}`);
    }
    console.log(`${ZIEL}/${basis}-${name}.{webp,avif}`);
  }
}
unlinkSync(datei);
