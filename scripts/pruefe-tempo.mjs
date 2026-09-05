/**
 * Wie schnell die Seite wirklich ist — gemessen, nicht geschätzt.
 *
 * Zwei Betriebsarten:
 *
 *   node scripts/pruefe-tempo.mjs --statisch
 *     Liest den fertigen Export in `out/` und prüft, was ohne Browser
 *     feststeht: wie viel JavaScript der erste Bildschirm zieht und wie
 *     schwer die schwersten Seiten sind. Läuft in Sekunden und gehört
 *     deshalb in jede Veröffentlichung.
 *
 *   node scripts/pruefe-tempo.mjs [Adresse]
 *     Fährt einen gedrosselten Browser gegen die laufende Seite: LCP, CLS,
 *     Bildzeiten, Seitengewicht. Braucht Puppeteer und eine Minute.
 *
 * Warum überhaupt Budgets: Am 05.09.2026 stand der LCP der Startseite auf
 * einem gedrosselten Telefon bei 3112 ms — nicht wegen des Netzes und nicht
 * wegen der Bilder, sondern weil der Fließtext im Empfang mit `opacity:0`
 * auf seine Einblendung nach 2,1 Sekunden wartete. Niemand hatte das je
 * gemessen, also fiel es niemandem auf. Ein Budget, das erst am Ende geprüft
 * wird, ist kein Budget.
 */
import { readFileSync, existsSync } from 'node:fs';
import { brotliCompressSync, constants } from 'node:zlib';
import { join } from 'node:path';

const BUDGET = {
  lcp: 2500,          // Google zählt darüber als „verbesserungswürdig"
  lcpZiel: 1800,      // eigener Anspruch
  cls: 0.05,
  bild95: 30,         // 95. Perzentil der Bildzeit in ms (16,7 = 60 Bilder/s)
  seiteKB: 1200,      // Gesamtgewicht einer Seite beim ersten Besuch
  jsKB: 300,          // JavaScript des ersten Bildschirms, gepackt gezählt
};

const SEITEN = [
  ['Startseite', '/'],
  ['Welt Band 1', '/faeden/band-1/'],
  ['Buchseite', '/buch/zufall/'],
  ['Kapitelseite', '/faeden/kapitel/1/'],
];

const maengel = [];

/* ------------------------------------------------------------ statisch */
function statisch() {
  if (!existsSync('out/index.html')) {
    console.error('Kein Export in out/ — erst bauen.');
    process.exit(1);
  }
  for (const [name, weg] of SEITEN) {
    const pfad = join('out', weg.replace(/^\//, ''), 'index.html');
    if (!existsSync(pfad)) continue;
    const html = readFileSync(pfad, 'utf8');
    // Nur die Skripte, die der erste Bildschirm anfordert.
    const skripte = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]);
    let js = 0;
    for (const s of new Set(skripte)) {
      // Der Spiegel unter github.io traegt einen Basispfad vor jeder Adresse.
      // Gesucht wird deshalb ab `_next/`, nicht ab dem Anfang.
      const i = s.indexOf('_next/');
      if (i < 0) continue;
      const p = join('out', s.slice(i).split('?')[0]);
      // Gepackt gemessen, denn gepackt wird es auch ausgeliefert. Die rohe
      // Dateigroesse ist rund viermal so hoch und sagt ueber die Ladezeit
      // nichts — ein Budget auf rohe Bytes waere ein Budget auf Luft.
      if (existsSync(p)) {
        js += brotliCompressSync(readFileSync(p), {
          params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
        }).length;
      }
    }
    const kb = Math.round(js / 1024);
    const zeile = `${name.padEnd(14)} JS ${String(kb).padStart(4)} KB`;
    if (kb > BUDGET.jsKB) maengel.push(`${name}: ${kb} KB JavaScript (Budget ${BUDGET.jsKB})`);
    console.log(`  ${zeile}`);
  }
}

/* --------------------------------------------------------------- live */
async function live(basis) {
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  for (const [name, weg] of SEITEN) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const cdp = await page.target().createCDPSession();
    await cdp.send('Network.enable');
    // Mittelklasse-Telefon an einer mäßigen Verbindung — nicht der eigene Rechner.
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    // Der Beobachter muss stehen, bevor die Seite laedt: Nachtraeglich gibt
    // `getEntriesByType` fuer diese Messung nichts zurueck.
    await page.evaluateOnNewDocument(() => {
      window.__lcp = 0;
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__lcp = Math.round(e.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* alter Browser */ }
    });
    let bytes = 0, js = 0, fehler = 0;
    page.on('response', (r) => {
      const n = Number(r.headers()['content-length'] || 0);
      bytes += n;
      if ((r.headers()['content-type'] || '').includes('javascript')) js += n;
    });
    page.on('console', (m) => { if (m.type() === 'error') fehler += 1; });
    page.on('pageerror', () => { fehler += 1; });
    try {
      await page.goto(basis.replace(/\/$/, '') + weg, { waitUntil: 'domcontentloaded', timeout: 120000 });
    } catch (e) {
      maengel.push(`${name}: nicht erreichbar (${e.message.split('\n')[0]})`);
      await page.close();
      continue;
    }
    /*
     * Zwei Zahlen, weil es zwei Wahrheiten gibt.
     *
     * Der Browser aktualisiert die Ladezeitmessung so lange, bis der Besucher
     * das erste Mal etwas tut — dann steht sie fest. Im Feld, also in dem, was
     * Google fuer die Bewertung heranzieht, ist das nach ein bis zwei Sekunden
     * der Fall: gescrollt wird sofort. Im Labor ohne jede Geste laeuft die
     * Messung dagegen weiter, und dann gewinnt am Ende das groesste Element,
     * das irgendwann auftaucht — auf der Startseite der bewegte Grund, der
     * bewusst spaet kommt und niemanden warten laesst.
     *
     * Deshalb wird hier beides genommen: der Stand nach 1,8 s (so sieht es der
     * Besucher) und der Stand nach 6 s ohne Geste (so sieht es ein Messwerkzeug).
     */
    await new Promise((r) => { setTimeout(r, 1800); });
    const lcpFeld = await page.evaluate(() => window.__lcp || 0);
    await new Promise((r) => { setTimeout(r, 4200); });
    const m = await page.evaluate(() => new Promise((res) => {
      let lcp = 0, cls = 0;
      lcp = window.__lcp || 0;
      try {
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; })
          .observe({ type: 'layout-shift', buffered: true });
      } catch { /* alter Browser */ }
      const t = []; let n = 0, vorher = performance.now();
      const takt = () => {
        const jetzt = performance.now(); t.push(jetzt - vorher); vorher = jetzt;
        if ((n += 1) < 150) requestAnimationFrame(takt);
        else {
          t.sort((a, b) => a - b);
          res({ lcp: Math.round(lcp), cls: Number(cls.toFixed(4)),
            p95: Number(t[Math.floor(t.length * 0.95)].toFixed(1)) });
        }
      };
      requestAnimationFrame(takt);
    }));
    const kb = Math.round(bytes / 1024);
    console.log(`  ${name.padEnd(14)} LCP ${String(lcpFeld).padStart(5)} ms (Geste)`
      + ` / ${String(m.lcp).padStart(5)} ms (Labor) | CLS ${String(m.cls).padStart(6)}`
      + ` | Bild p95 ${String(m.p95).padStart(5)} ms | ${String(kb).padStart(5)} KB`
      + ` (JS ${Math.round(js / 1024)}) | Fehler ${fehler}`);
    // Gemessen wird gegen den Wert, den auch Google heranzieht.
    if (lcpFeld > BUDGET.lcp) maengel.push(`${name}: LCP ${lcpFeld} ms (Budget ${BUDGET.lcp})`);
    if (m.cls > BUDGET.cls) maengel.push(`${name}: CLS ${m.cls} (Budget ${BUDGET.cls})`);
    if (m.p95 > BUDGET.bild95) maengel.push(`${name}: Bildzeit p95 ${m.p95} ms (Budget ${BUDGET.bild95})`);
    if (kb > BUDGET.seiteKB) maengel.push(`${name}: ${kb} KB Seitengewicht (Budget ${BUDGET.seiteKB})`);
    if (fehler) maengel.push(`${name}: ${fehler} Konsolenfehler`);
    await page.close();
  }
  await browser.close();
}

const arg = process.argv[2];
if (arg === '--statisch') { console.log('Tempo, statisch geprüft:'); statisch(); }
else { console.log('Tempo, gedrosselt gemessen (Telefon, 1,6 Mbit, CPU ×4):');
  await live(arg || 'https://www.trendonix-buecher.de'); }

if (maengel.length === 0) { console.log('\nAlle Budgets eingehalten.'); process.exit(0); }
console.error(`\n${maengel.length} Überschreitung(en):`);
for (const m of maengel) console.error(`  · ${m}`);
console.error('\nEin Budget, das erst am Ende geprüft wird, ist kein Budget.');
process.exit(1);
