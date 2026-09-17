/**
 * Den Hero ansehen — im Browser, nicht im Kopf.
 *
 * Bedient den fertigen Export aus `out/` über einen winzigen Server und
 * macht Aufnahmen bei drei Breiten: Telefon hochkant, Tablet, Schreibtisch.
 * Dazu die Konsolenfehler und die fehlgeschlagenen Anfragen — beides sind
 * die Fehler, die man beim Durchlesen des Codes nie findet.
 *
 * Warum überhaupt: Der Bildausschnitt der Bühne stand beim ersten Anlauf auf
 * einem Kameraabstand, bei dem das Buch doppelt so hoch war wie das Bild.
 * Nachgerechnet ließ sich das beheben — bemerkt hätte es erst der Browser.
 *
 * Aufruf:
 *   npm run export && node scripts/hero-ansehen.mjs /buch/band-1/
 */

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const WURZEL = path.resolve(import.meta.dirname, '..');
const AUS = path.join(WURZEL, 'out');
const ZIEL = path.join(WURZEL, 'qa', 'hero');
const WEG = process.argv[2] ?? '/buch/band-1/';

const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

const BREITEN = [
  ['telefon', 390, 844, 3],
  ['tablet', 820, 1180, 2],
  ['schreibtisch', 1512, 945, 2],
];

function server() {
  return createServer(async (anfrage, antwort) => {
    try {
      let p = decodeURIComponent((anfrage.url ?? '/').split('?')[0]);
      let datei = path.join(AUS, p);
      if (p.endsWith('/')) datei = path.join(datei, 'index.html');
      else if (!path.extname(datei) && existsSync(`${datei}.html`)) datei += '.html';
      const inhalt = await readFile(datei);
      antwort.writeHead(200, {
        'Content-Type': TYPEN[path.extname(datei)] ?? 'application/octet-stream',
      });
      antwort.end(inhalt);
    } catch {
      antwort.writeHead(404).end('weg');
    }
  });
}

async function main() {
  if (!existsSync(path.join(AUS, 'index.html'))) {
    console.error('Kein Export in out/ — erst `npm run export`.');
    process.exit(1);
  }
  await mkdir(ZIEL, { recursive: true });

  const dienst = server();
  await new Promise((fertig) => dienst.listen(4317, fertig));
  const adresse = `http://127.0.0.1:4317${WEG}`;

  const browser = await puppeteer.launch({
    // WebGL braucht auf einem Server keinen Bildschirm, aber einen
    // Renderer. Ohne diese Schalter faellt Chrome auf SwiftShader zurueck —
    // und die Engine stuft SwiftShader korrekt als RUECKFALL ein. Man saehe
    // dann das Standbild und haette die Buehne nie geprueft.
    headless: 'new',
    args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--no-sandbox'],
  });

  const fehler = [];
  const verloren = [];

  for (const [name, breite, hoehe, dichte] of BREITEN) {
    const seite = await browser.newPage();
    seite.on('console', (m) => {
      if (m.type() === 'error') fehler.push(`${name}: ${m.text()}`);
    });
    seite.on('requestfailed', (r) => {
      verloren.push(`${name}: ${r.url()} — ${r.failure()?.errorText}`);
    });
    /**
     * Auch Antworten ab 400 mitschreiben, mit Adresse.
     *
     * `requestfailed` meldet nur, was gar nicht ankam. Eine 404 ist für den
     * Browser eine erfolgreiche Anfrage — sie taucht hier bisher nur als
     * Konsolenzeile „Failed to load resource: 404" auf, ohne zu sagen,
     * WELCHE Datei fehlt. Damit ist der Befund wertlos: Man weiß, dass etwas
     * fehlt, und sucht dann von Hand.
     */
    seite.on('response', (a) => {
      if (a.status() >= 400) verloren.push(`${name}: ${a.url()} — HTTP ${a.status()}`);
    });
    await seite.setViewport({
      width: breite, height: hoehe, deviceScaleFactor: dichte,
      isMobile: breite < 700, hasTouch: breite < 700,
    });
    await seite.goto(adresse, { waitUntil: 'networkidle2', timeout: 60_000 });
    // Der Bühne Zeit geben, das Modell zu laden und das Standbild
    // auszublenden. Ohne diese Pause zeigt die Aufnahme das Standbild und
    // beweist nichts über die Bühne.
    await new Promise((f) => setTimeout(f, 4500));

    const stand = await seite.evaluate(() => {
      const leinwand = document.querySelector('canvas.hero-buehne');
      const bild = document.querySelector('img.hero-standbild');
      return {
        buehneDa: Boolean(leinwand),
        buehneGroesse: leinwand ? `${leinwand.width}x${leinwand.height}` : '—',
        standbildWeg: bild?.classList.contains('hero-standbild--weg') ?? null,
        titel: document.querySelector('.hero-titel')?.textContent ?? null,
        wege: [...document.querySelectorAll('.hero-weg')].map((a) => a.textContent?.trim()),
        ueberlauf: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    const datei = path.join(ZIEL, `${name}.png`);
    await seite.screenshot({ path: datei });
    console.log(
      `${name.padEnd(13)} ${breite}x${hoehe}@${dichte}  Buehne ${stand.buehneDa ? stand.buehneGroesse : 'FEHLT'}` +
      `  Standbild ${stand.standbildWeg === null ? '—' : stand.standbildWeg ? 'ausgeblendet' : 'liegt noch'}` +
      `  Ueberlauf ${stand.ueberlauf ? 'JA' : 'nein'}`,
    );
    console.log(`              Titel: ${stand.titel} · Wege: ${stand.wege.join(' | ')}`);
    await seite.close();
  }

  await browser.close();
  dienst.close();

  if (fehler.length) {
    console.log('\nKonsolenfehler:');
    for (const f of fehler) console.log('  ·', f);
  }
  if (verloren.length) {
    console.log('\nFehlgeschlagene Anfragen:');
    for (const v of verloren) console.log('  ·', v);
  }
  if (!fehler.length && !verloren.length) console.log('\nKeine Konsolenfehler, keine verlorenen Anfragen.');
}

await main();
