/**
 * Vorschaubilder für geteilte Links (Open Graph).
 *
 *   npm run vorschaubilder
 *
 * Wer die Seite in eine Bio, nach Facebook oder in eine Nachricht setzt,
 * bekam bisher nur Text: kein Bild, keine Fläche, kein Blick. Ein geteilter
 * Link ohne Bild wird überlesen. Hier bekommt deshalb jede Seite, die geteilt
 * wird, ein eigenes Bild – 1200 × 630, aus ihrem eigenen Motiv, mit ihrem
 * eigenen Titel und der Marke.
 *
 * Erzeugt wird nach `public/og/`. Die Bilder sind Teil der Veröffentlichung,
 * nicht der Bauzeit: Sie ändern sich nur, wenn sich Motive oder Titel ändern.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const B = 1200, H = 630;
const ZIEL = 'public/og';
mkdirSync(ZIEL, { recursive: true });

const roh = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Zeilen umbrechen, ohne Wörter zu zerschneiden. */
function brechen(text, proZeile) {
  const worte = String(text).split(/\s+/);
  const zeilen = []; let z = '';
  for (const w of worte) {
    if ((z + ' ' + w).trim().length > proZeile && z) { zeilen.push(z.trim()); z = w; }
    else z = (z + ' ' + w).trim();
  }
  if (z) zeilen.push(z);
  return zeilen;
}

async function karte({ motiv, eyebrow, titel, unterzeile, datei }) {
  const grund = existsSync(motiv)
    ? await sharp(motiv).resize(B, H, { fit: 'cover', position: 'centre' })
      .modulate({ brightness: 0.74, saturation: 0.95 }).toBuffer()
    : await sharp({ create: { width: B, height: H, channels: 3, background: '#060a14' } })
      .jpeg().toBuffer();

  const zeilen = brechen(titel, 26);
  const oben = 300 - (zeilen.length - 1) * 32;
  const marke = await readFile('public/marke/trendonix-tx.png');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${B}" height="${H}">
    <defs>
      <linearGradient id="d" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#060a14" stop-opacity=".92"/>
        <stop offset="0.62" stop-color="#060a14" stop-opacity=".58"/>
        <stop offset="1" stop-color="#060a14" stop-opacity=".34"/>
      </linearGradient>
    </defs>
    <rect width="${B}" height="${H}" fill="url(#d)"/>
    <text x="72" y="${oben - 54}" fill="#c9a227" font-family="Cormorant Garamond Light, Cormorant Garamond, EB Garamond, serif"
      font-size="22" letter-spacing="7">${roh(eyebrow).toUpperCase()}</text>
    ${zeilen.map((z, i) => `<text x="72" y="${oben + i * 64}" fill="#F1ECE0"
      font-family="Cormorant Garamond Light, Cormorant Garamond, EB Garamond, serif" font-size="60">${roh(z)}</text>`).join('')}
    ${unterzeile ? `<text x="72" y="${oben + zeilen.length * 64 + 14}" fill="#E3C88B"
      font-family="Cormorant Garamond Light, Cormorant Garamond, EB Garamond, serif" font-size="27" font-style="italic">${roh(unterzeile)}</text>` : ''}
    <rect x="72" y="${H - 96}" width="88" height="1" fill="#A8863F"/>
  </svg>`;

  await sharp(grund)
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: await sharp(marke).resize({ width: 118 }).toBuffer(), top: H - 168, left: 72 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${ZIEL}/${datei}.jpg`);
  console.log(`${ZIEL}/${datei}.jpg`);
}

// --- Was geteilt wird ------------------------------------------------------
const { default: daten } = await import('./og-daten.mjs');
for (const k of daten) await karte(k);
