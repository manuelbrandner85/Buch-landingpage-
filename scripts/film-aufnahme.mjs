/**
 * Die Website filmen — für den Trendonix-Film.
 *
 * Vier Einstellungen des Films zeigen nicht erzeugte Bilder, sondern die
 * echte Seite. Das ist der Unterschied zwischen einem Film, der etwas
 * behauptet, und einem, der es zeigt — bei einem Haus, dessen einzige Regel
 * genau das ist, kann es gar nicht anders sein.
 *
 * Aufgenommen wird der fertige Export aus `out/`, nicht die Live-Seite: Der
 * Export ist derselbe Stand, liegt hier und braucht kein Netz. Ein kleiner
 * Server davor, weil die Seite mit `file://` nicht lädt.
 *
 *   npm run export      (einmal, damit out/ aktuell ist)
 *   node scripts/film-aufnahme.mjs
 *
 * Ergebnis: WebM-Dateien neben den erzeugten Aufnahmen im AUTOPILOT-Ordner.
 * Der Schnitt wandelt sie um; hier wird nichts umgerechnet, damit die
 * Aufnahme nicht zweimal durch einen Kodierer läuft.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUS = process.env.FILM_ZIEL
  ?? 'C:/Users/manue/Desktop/Buch/Die unsichtbare Fäden/Band 1/05_Marketing/'
     + '05_Social_Kampagne/AUTOPILOT/ausgabe/2026-08-31/film';

const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon',
};

/**
 * Die Aufnahmen.
 *
 * `scrollen` ist der Anteil der Seitenhöhe, über den in `dauer` Sekunden
 * gefahren wird. Die Welt ist scrollgesteuert — ohne Scrollen steht sie
 * still, und ein Standbild braucht keine Aufnahme.
 */
const AUFNAHMEN = (process.env.NUR ? [] : []).concat([
  { name: 'w_welt', weg: '/faeden/', dauer: 7, warten: 6500, scrollen: 0.30 },
  { name: 'w_band', weg: '/faeden/band-1/', dauer: 7, warten: 6500, scrollen: 0.22 },
  { name: 'w_ort', weg: '/faeden/ort/laetoli/', dauer: 6, warten: 3000, scrollen: 0.55 },
  // Nicht die Buchseite: Dort stehen Titel, Cover und Preise, und der Film
  // wirbt fuer kein Buch. Das Kapitel „Am Rand des Belegten" zeigt genau das,
  // wovon der Satz an dieser Stelle spricht — den Beleg neben dem Satz.
  { name: 'w_beleg', weg: '/faeden/kapitel/6/', dauer: 7, warten: 3500, scrollen: 0.45 },
]).filter((a) => !process.env.NUR || a.name === process.env.NUR);

const server = createServer(async (anfrage, antwort) => {
  try {
    let p = decodeURIComponent(anfrage.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const datei = join(wurzel, 'out', p);
    const inhalt = await readFile(datei);
    antwort.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' });
    antwort.end(inhalt);
  } catch {
    antwort.writeHead(404); antwort.end('nicht da');
  }
});

if (!existsSync(join(wurzel, 'out', 'index.html'))) {
  console.error('out/ fehlt — erst `npm run export` laufen lassen.');
  process.exit(1);
}
await mkdir(AUS, { recursive: true });
await new Promise((f) => server.listen(8123, f));
console.log('Server auf 8123');

const browser = await puppeteer.launch({
  headless: false,          // WebGL läuft im sichtbaren Fenster verlässlicher
  args: [
    '--window-size=1928,1113',
    '--autoplay-policy=no-user-gesture-required',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
  ],
  defaultViewport: { width: 1920, height: 1080 },
});

for (const a of AUFNAHMEN) {
  const seite = await browser.newPage();
  await seite.setViewport({ width: 1920, height: 1080 });
  console.log('→', a.weg);
  await seite.goto('http://127.0.0.1:8123' + a.weg, { waitUntil: 'networkidle2', timeout: 60000 });
  // Der Zustimmungsbalken gehört nicht in einen Film. Wegklicken, nicht
  // ausblenden: Ausgeblendet bliebe er im Bild, sobald etwas nachlädt.
  await seite.evaluate(() => {
    for (const k of document.querySelectorAll('button')) {
      if (/einverstanden|akzeptieren|zustimmen/i.test(k.textContent || '')) k.click();
    }
  }).catch(() => {});
  await new Promise((f) => setTimeout(f, a.warten));

  const ziel = join(AUS, a.name + '.webm');
  const band = await seite.screencast({ path: ziel, speed: 1 });

  // Gleichmäßig scrollen, nicht springen: Die Kamera der Welt hängt am
  // Scrollstand, und ein Sprung sieht aus wie ein Fehler.
  await seite.evaluate(async (sek, anteil) => {
    const hoehe = document.body.scrollHeight - window.innerHeight;
    const weit = hoehe * anteil;
    const start = performance.now();
    await new Promise((fertig) => {
      const schritt = (jetzt) => {
        const t = Math.min(1, (jetzt - start) / (sek * 1000));
        // Weich anfahren und weich auslaufen, damit kein Ruck am Anfang steht.
        const w = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        window.scrollTo(0, weit * w);
        if (t < 1) requestAnimationFrame(schritt); else fertig();
      };
      requestAnimationFrame(schritt);
    });
  }, a.dauer, a.scrollen);

  await new Promise((f) => setTimeout(f, 400));
  await band.stop();
  console.log('   ', a.name + '.webm');
  await seite.close();
}

await browser.close();
server.close();
console.log('FERTIG');
