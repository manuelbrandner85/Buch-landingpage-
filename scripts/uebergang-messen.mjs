/**
 * Der Übergang vom Standbild zur Bühne — gemessen, nicht angesehen.
 *
 * Das Standbild liegt unter der Bühne und wird ausgeblendet, sobald diese
 * zeichnet. Bildausschnitt und Drehung stimmen (beide kommen aus
 * `src/hero/kamera.json`) — die Helligkeit tut es nicht von selbst: Blender
 * rechnet mit AgX und eigenen Lichteinheiten, Three mit ACES und anderen.
 * Eine Zahl vom einen ins andere zu übertragen ergibt nichts; verglichen
 * werden muss das fertige Bild.
 *
 * Dieses Skript legt beides auf dieselbe Größe, misst die Leuchtdichte im
 * Buchbereich und nennt den Faktor, um den die Belichtung der Bühne
 * danebenliegt.
 *
 * Voraussetzung: `npm run export` und `node scripts/hero-ansehen.mjs`.
 * Aufruf:        node scripts/uebergang-messen.mjs
 */

import path from 'node:path';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const WURZEL = path.resolve(import.meta.dirname, '..');
const STANDBILD = path.join(WURZEL, 'public', 'modelle', 'buch-poster-quer.png');
const BUEHNE = path.join(WURZEL, 'qa', 'hero', 'schreibtisch.png');
const GRUND = { r: 7, g: 10, b: 18 };   // derselbe Wert wie in hero.css

/** Leuchtdichte je Bildpunkt aus einem rohen RGB-Puffer. */
function leuchtdichte(daten, kanaele) {
  const n = daten.length / kanaele;
  const l = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * kanaele;
    l[i] = (0.2126 * daten[j] + 0.7152 * daten[j + 1] + 0.0722 * daten[j + 2]) / 255;
  }
  return l;
}

function median(werte) {
  const s = Float64Array.from(werte).sort();
  return s[Math.floor(s.length / 2)];
}

async function main() {
  for (const p of [STANDBILD, BUEHNE]) {
    if (!existsSync(p)) {
      console.error(`Fehlt: ${p}\nErst \`npm run export\` und \`node scripts/hero-ansehen.mjs\`.`);
      process.exit(1);
    }
  }

  // Beide auf dieselbe Größe, das Standbild vorher auf den CSS-Grund gelegt.
  const breite = 1512;
  const hoehe = 945;

  const standbild = await sharp(STANDBILD)
    .flatten({ background: GRUND })
    .resize(breite, hoehe, { fit: 'fill' })
    .raw().toBuffer({ resolveWithObject: true });

  const buehne = await sharp(BUEHNE)
    .removeAlpha()
    .resize(breite, hoehe, { fit: 'fill' })
    .raw().toBuffer({ resolveWithObject: true });

  // Gemessen wird nur dort, wo das Buch steht — der leere Grund ist in
  // beiden Bildern identisch und würde den Unterschied verwässern.
  const alpha = await sharp(STANDBILD).ensureAlpha().extractChannel(3)
    .resize(breite, hoehe, { fit: 'fill' })
    .raw().toBuffer();

  const ls = leuchtdichte(standbild.data, standbild.info.channels);
  const lb = leuchtdichte(buehne.data, buehne.info.channels);

  const s = [];
  const b = [];
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] > 200) { s.push(ls[i]); b.push(lb[i]); }
  }
  if (s.length < 1000) {
    console.error('Zu wenig Buchfläche gefunden — steht das Standbild richtig?');
    process.exit(1);
  }

  const ms = median(s);
  const mb = median(b);
  const mittelS = s.reduce((a, c) => a + c, 0) / s.length;
  const mittelB = b.reduce((a, c) => a + c, 0) / b.length;

  console.log(`Buchfläche: ${s.length} Bildpunkte`);
  console.log(`Standbild  Median ${ms.toFixed(3)}  Mittel ${mittelS.toFixed(3)}`);
  console.log(`Bühne      Median ${mb.toFixed(3)}  Mittel ${mittelB.toFixed(3)}`);

  const abweichung = Math.abs(mb - ms) / ms;
  console.log(`Abweichung ${(abweichung * 100).toFixed(1)} %`);

  // 8 Prozent sind die Grenze, unterhalb derer eine Überblendung von 900 ms
  // den Unterschied sicher verdeckt. Darüber sieht man einen Sprung.
  if (abweichung > 0.08) {
    console.error(
      `\nÜber der Grenze von 8 %. Die Bühne ist ${mb < ms ? 'zu dunkel' : 'zu hell'}.\n` +
      `Stellschraube: renderer.toneMappingExposure in src/hero/buehne-bauen.ts.`,
    );
    process.exitCode = 1;
  } else {
    console.log('Innerhalb der Grenze von 8 % — der Wechsel ist nicht zu sehen.');
  }
}

await main();
