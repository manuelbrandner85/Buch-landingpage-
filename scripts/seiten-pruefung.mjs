/**
 * Bestandsaufnahme der laufenden Seite — messen statt vermuten.
 *
 * Vier Seitenarten, drei Breiten, jeweils: erster Bildschirm und ganze Seite
 * als Bild, dazu LCP, CLS, Anzahl und Größe der Anfragen, waagerechter
 * Überlauf, Konsolenfehler und die Zahl der h1.
 *
 * Gedrosselt auf Mittelklasse (4× langsamere CPU). Ungedrosselt gemessen
 * sieht jede Seite gut aus — die Besucher kommen aber vom Telefon.
 *
 *   node scripts/seiten-pruefung.mjs [https://www.trendonix-buecher.de]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const BASIS = process.argv[2] || 'https://www.trendonix-buecher.de';
const AUS = join(dirname(fileURLToPath(import.meta.url)), '..', 'qa');

const SEITEN = [
  ['start', '/'],
  ['buch', '/buch/band-1/'],
  ['zufall', '/buch/zufall/'],
  ['schwelle', '/faeden/'],
];
const BREITEN = [['handy', 390, 844], ['tablet', 834, 1112], ['gross', 1440, 900]];

await mkdir(AUS, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const bericht = [];

for (const [name, weg] of SEITEN) {
  for (const [breiteName, w, h] of BREITEN) {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
    const fehler = [], abgelehnt = [];
    let anfragen = 0, bytes = 0;
    p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text().slice(0, 140)); });
    p.on('pageerror', (e) => fehler.push('JS: ' + String(e).slice(0, 140)));
    p.on('requestfailed', (r) => abgelehnt.push(r.url().slice(0, 90)));
    p.on('response', async (r) => {
      anfragen++;
      const l = Number(r.headers()['content-length'] || 0);
      if (l) bytes += l;
    });
    const kunde = await p.target().createCDPSession();
    await kunde.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    let ladefehler = null;
    try {
      await p.goto(BASIS + weg, { waitUntil: 'networkidle2', timeout: 90000 });
    } catch (e) { ladefehler = String(e).slice(0, 120); }
    await p.evaluate(() => {
      for (const k of document.querySelectorAll('button')) {
        if (/einverstanden|akzeptieren/i.test(k.textContent || '')) k.click();
      }
    }).catch(() => {});
    await new Promise((f) => setTimeout(f, 2500));

    const mess = await p.evaluate(() => {
      const lcpE = performance.getEntriesByType('largest-contentful-paint').pop();
      let cls = 0;
      for (const e of performance.getEntriesByType('layout-shift') || []) {
        if (!e.hadRecentInput) cls += e.value;
      }
      const doc = document.documentElement;
      const zuBreit = [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 2)
        .slice(0, 4)
        .map((el) => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      return {
        lcp: lcpE ? Math.round(lcpE.startTime) : null,
        cls: Math.round(cls * 1000) / 1000,
        ueberlauf: doc.scrollWidth > doc.clientWidth + 2,
        zuBreit,
        h1: document.querySelectorAll('h1').length,
        ohneAlt: [...document.images].filter((i) => !i.alt).length,
        hoehe: document.body.scrollHeight,
      };
    }).catch(() => ({}));

    const marke = `${name}_${breiteName}`;
    await p.screenshot({ path: join(AUS, marke + '_oben.png') }).catch(() => {});
    if (breiteName !== 'tablet') {
      await p.screenshot({ path: join(AUS, marke + '_ganz.png'), fullPage: true }).catch(() => {});
    }
    bericht.push({ seite: name, breite: breiteName, ladefehler, anfragen,
      kb: Math.round(bytes / 1024), fehler, abgelehnt: abgelehnt.slice(0, 3), ...mess });
    console.log(`${marke.padEnd(18)} LCP ${String(mess.lcp ?? '–').padStart(5)} ms  CLS ${mess.cls ?? '–'}  ${anfragen} Anfr.  ${Math.round(bytes / 1024)} KB  Überlauf ${mess.ueberlauf ? 'JA ' + (mess.zuBreit || []).join(',') : 'nein'}  Fehler ${fehler.length}`);
    await p.close();
  }
}

await browser.close();
await writeFile(join(AUS, 'bericht.json'), JSON.stringify(bericht, null, 2), 'utf8');
console.log('\nBilder und bericht.json in qa/');
