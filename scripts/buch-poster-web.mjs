/**
 * Die Standbilder des Hero web-tauglich machen.
 *
 * Blender liefert PNG mit Alphakanal — richtig so, denn der Hintergrund
 * kommt aus dem CSS und muss exakt dieselbe Farbe sein wie in der Buehne.
 * Nur wiegt so ein PNG 660 KB, und es liegt im ersten Bildschirm.
 *
 * Gemessen am 16.09.2026 lag der LCP der Startseite auf einem gedrosselten
 * Telefon bei 4168 ms gegen ein Budget von 2500. Ein Standbild dieser
 * Groesse haette davon noch einmal ein gutes Stueck gekostet — und zwar
 * genau in der Sekunde, in der die Seite zum ersten Mal etwas zeigt.
 *
 * AVIF traegt Transparenz und ist bei diesem Motiv (viel Dunkelheit, wenige
 * harte Kanten) um ein Vielfaches kleiner. WebP liegt als Rueckfallebene
 * daneben, das PNG bleibt als letzte Stufe liegen.
 *
 * Aufruf: node scripts/buch-poster-web.mjs
 */

import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WURZEL = path.resolve(import.meta.dirname, '..');
const ORDNER = path.join(WURZEL, 'public', 'modelle');

// Datei, Breiten. Die groesste Breite behaelt den Namen ohne Zusatz —
// so bleibt der Pfad derselbe, den der Hero ohnehin schon kennt.
const AUFTRAEGE = [
  { name: 'buch-poster-quer', breiten: [1600, 1000] },
  { name: 'buch-poster-hoch', breiten: [1080, 720] },
];

/** AVIF und WebP in einer Breite schreiben. Gibt die Groessen zurueck. */
async function fassung(quelle, name, breite, groesste) {
  const anhang = breite === groesste ? '' : `-${breite}`;
  const bild = sharp(quelle).resize({ width: breite, withoutEnlargement: true });

  const avif = await bild
    .clone()
    // 45 waren 13 KB und sahen im Kleinen gut aus — im Nachthimmel hinter
    // dem Titel standen aber deutliche Flecken, und genau dort liegt das
    // Auge. 58 kostet gut das Doppelte und ist damit immer noch ein
    // Fuenfzigstel des PNG. An dieser Stelle ist das der richtige Tausch:
    // Der Himmel auf diesem Cover ist ein weicher Verlauf, und weiche
    // Verlaeufe sind das, woran sparsame Kompression zuerst scheitert.
    .avif({ quality: 58, effort: 7 })
    .toBuffer();
  const webp = await bild.clone().webp({ quality: 72, effort: 6 }).toBuffer();

  const zielAvif = path.join(ORDNER, `${name}${anhang}.avif`);
  const zielWebp = path.join(ORDNER, `${name}${anhang}.webp`);
  await writeFile(zielAvif, avif);
  await writeFile(zielWebp, webp);
  return { breite, avif: avif.length, webp: webp.length };
}

async function main() {
  const zeilen = [];

  for (const auftrag of AUFTRAEGE) {
    const quelle = path.join(ORDNER, `${auftrag.name}.png`);
    const roh = await readFile(quelle);
    const gross = (await stat(quelle)).size;
    const groesste = Math.max(...auftrag.breiten);

    for (const breite of auftrag.breiten) {
      const ergebnis = await fassung(roh, auftrag.name, breite, groesste);
      zeilen.push({
        datei: auftrag.name,
        breite: ergebnis.breite,
        png_kb: breite === groesste ? Math.round(gross / 1024) : null,
        avif_kb: Math.round(ergebnis.avif / 1024),
        webp_kb: Math.round(ergebnis.webp / 1024),
      });
    }
  }

  console.table(zeilen);

  const groesstes = Math.max(...zeilen.map((z) => z.avif_kb));
  if (groesstes > 180) {
    // Kein stiller Durchlauf, wenn das Budget reisst. Eine Warnung, die
    // niemand sieht, ist keine.
    console.error(
      `\nWARNUNG: groesstes AVIF ${groesstes} KB — ueber der Grenze von 180 KB ` +
        `fuer ein Bild im ersten Bildschirm.`,
    );
    process.exitCode = 1;
  }
}

await main();
