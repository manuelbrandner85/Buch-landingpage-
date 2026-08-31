/**
 * Den Filmabschnitt der Startseite ansehen — ein Bild, breit und schmal.
 *
 * Nicht zur Zierde: Ein Abschnitt, der von selbst anläuft, sieht im Quelltext
 * immer richtig aus. Ob er wirklich läuft, ob der Tonknopf im Bild sitzt und
 * ob nichts über den Film rutscht, sagt nur ein Blick darauf.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.json': 'application/json', '.avif': 'image/avif' };

const server = createServer(async (a, b) => {
  try {
    let p = decodeURIComponent(a.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const datei = join(wurzel, 'out', p);
    b.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' });
    b.end(await readFile(datei));
  } catch { b.writeHead(404); b.end('nicht da'); }
});
await new Promise((f) => server.listen(8124, f));

const browser = await puppeteer.launch({
  headless: false,
  args: ['--window-size=1440,900', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'],
});
for (const [name, b, h] of [['breit', 1440, 900], ['schmal', 430, 900]]) {
  const s = await browser.newPage();
  await s.setViewport({ width: b, height: h, deviceScaleFactor: 2 });
  await s.goto('http://127.0.0.1:8124/', { waitUntil: 'networkidle2', timeout: 60000 });
  await s.evaluate(() => {
    for (const k of document.querySelectorAll('button')) {
      if (/einverstanden|akzeptieren/i.test(k.textContent || '')) k.click();
    }
  }).catch(() => {});
  await s.evaluate(() => document.querySelector('.hausfilm')?.scrollIntoView({ block: 'center' }));
  await new Promise((f) => setTimeout(f, 4000));
  const el = await s.$('.hausfilm');
  if (el) await el.screenshot({ path: join(wurzel, `probe-film-${name}.png`) });
  const stand = await s.evaluate(() => {
    const v = document.querySelector('.hausfilm video');
    return v ? { quelle: (v.currentSrc || '').split('/').pop(), laeuft: !v.paused,
      stumm: v.muted, zeit: Math.round(v.currentTime * 10) / 10 } : null;
  });
  console.log(name, JSON.stringify(stand));
  await s.close();
}
await browser.close();
server.close();
console.log('FERTIG');
