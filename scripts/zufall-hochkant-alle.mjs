/**
 * Alle vierzig Kapitelmotive ins Hochformat — und ein Kontaktabzug dazu.
 *
 *   node scripts/zufall-hochkant-alle.mjs
 *
 * Die Bilder aus dem Satz sind 2:3, der Feed ist 9:16. Beschnitten wird an den
 * Seiten, nie gestaucht: die Höhe bleibt ganz. Zusätzlich entsteht ein Blatt
 * mit allen vierzig nebeneinander — zum Ansehen, bevor vierzig Bewegtfassungen
 * beauftragt werden.
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';

const QUELLE = 'assets-quelle/zufall/kapitel';
const ZIEL = 'assets-quelle/zufall/hochkant';
mkdirSync(ZIEL, { recursive: true });

const nummer = (n) => String(n).padStart(2, '0');
const kacheln = [];

for (let n = 1; n <= 40; n++) {
  const name = `kap${nummer(n)}`;
  const quelle = `${QUELLE}/${name}.jpg`;
  if (!existsSync(quelle)) { console.error(`fehlt: ${quelle}`); continue; }
  const ziel = `${ZIEL}/${name}-9x16.jpg`;

  const m = await sharp(quelle).metadata();
  const breite = Math.min(m.width, Math.round(m.height * 9 / 16));
  const links = Math.max(0, Math.round((m.width - breite) / 2));
  const zugeschnitten = sharp(quelle).extract({ left: links, top: 0, width: breite, height: m.height });

  await zugeschnitten.clone()
    .resize({ width: 1080, height: 1920, fit: 'cover' })
    .jpeg({ quality: 90, mozjpeg: true }).toFile(ziel);

  kacheln.push(await sharp(ziel).resize({ width: 180, height: 320, fit: 'cover' }).toBuffer());
  process.stdout.write(`${name} `);
}

// Kontaktabzug: acht Spalten, fünf Reihen
const SP = 8, B = 180, H = 320, L = 8;
const zeilen = Math.ceil(kacheln.length / SP);
await sharp({
  create: {
    width: SP * (B + L) + L, height: zeilen * (H + L) + L,
    channels: 3, background: '#060A14',
  },
})
  .composite(kacheln.map((input, i) => ({
    input, left: L + (i % SP) * (B + L), top: L + Math.floor(i / SP) * (H + L),
  })))
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('assets-quelle/zufall/kontaktabzug.jpg');

console.log(`\n${kacheln.length} Motive im Hochformat, Kontaktabzug geschrieben.`);
