/**
 * Barrierefreiheit messen statt schätzen: axe-core gegen den gebauten Export.
 *
 * Geprüft wird, was ausgeliefert wird – nicht die Offlinefassung: das Haus, die
 * Welt, eine Buchseite, eine Kapitelseite und die Überseite. Ein kleiner
 * Dateiserver reicht dafür; der Export ist statisch.
 *
 *   NEXT_EXPORT=1 npm run build && npm run pruefe:a11y
 *
 * Gefundene und behobene Verstöße:
 *  · Text über Deckkraft abgedunkelt (Quellenzeilen, Fußzeile, Ankunft) – 31 Stellen
 *  · Gold auf Elfenbein: 1,4 : 1 – im Druck tragfähig, auf dem Bildschirm nicht
 *  · Geschlossene Ringe und ungeprüfte Fragen über opacity zurückgesetzt
 *  · Herkunftsbadge stand innerhalb der Definitionsliste
 *  · Fußzeile des Hauses: Feinschrift zu blass, Links nur farblich unterschieden
 */
import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// `.pathname` einer file-URL ist unter Windows kein gueltiger Pfad: Er beginnt
// mit einem Schraegstrich vor dem Laufwerksbuchstaben, und Umlaute stehen darin
// prozentkodiert. `fileURLToPath` macht daraus den Pfad, den das Dateisystem
// versteht — sonst behauptet die Pruefung, es gaebe keinen Export.
const WURZEL = fileURLToPath(new URL('../out/', import.meta.url));
if (!existsSync(WURZEL)) {
  console.error('Kein Export gefunden. Zuerst: NEXT_EXPORT=1 npm run build');
  process.exit(1);
}

const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.avif': 'image/avif',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

const server = createServer(async (anfrage, antwort) => {
  const pfad = decodeURIComponent((anfrage.url ?? '/').split('?')[0]);
  let datei = join(WURZEL, normalize(pfad).replace(/^(\.\.[/\\])+/, ''));
  if (existsSync(datei) && statSync(datei).isDirectory()) datei = join(datei, 'index.html');
  try {
    const inhalt = await readFile(datei);
    antwort.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' });
    antwort.end(inhalt);
  } catch {
    antwort.writeHead(404).end('nicht da');
  }
});
// Freien Port vom Betriebssystem geben lassen, damit die Prüfung nicht an
// einem belegten Port scheitert.
await new Promise((fertig) => server.listen(0, '127.0.0.1', fertig));
const PORT = server.address().port;

const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
// Wo kein Chrome von Puppeteer installiert ist, lässt sich über
// PUPPETEER_EXECUTABLE_PATH ein vorhandener Browser angeben.
const b = await puppeteer.launch({
  ...(process.env.PUPPETEER_EXECUTABLE_PATH
    ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
  args: [
  '--no-sandbox', '--disable-dev-shm-usage',
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });

const SEITEN = ['/', '/faeden/', '/buch/band-1/', '/faeden/kapitel/1/', '/ueber/', '/impressum/'];
let gesamt = 0;

for (const seite of SEITEN) {
  await p.goto(`http://127.0.0.1:${PORT}${seite}`, { waitUntil: 'networkidle2', timeout: 90000 });
  // Warten, bis nichts mehr einblendet — nicht anderthalb Sekunden raten.
  //
  // Der Hinweis „Scrollen" auf der Schwelle steht zuerst auf Deckkraft 0 und
  // blendet ab der dritten Sekunde ein. Wer vorher misst, misst eine Farbe,
  // die es im Ruhezustand nicht gibt: Die Prüfung meldete 3,09 : 1, während
  // die Zeile fertig eingeblendet auf 8,66 : 1 kommt.
  //
  // Ein Prüfbericht, der zuverlässig eine Warnung erfindet, wird nach dem
  // dritten Mal überlesen — und dann fehlt er, wenn es zählt. Also wird auf
  // die tatsächlichen Übergänge gewartet, mit einer Obergrenze, damit eine
  // Dauerschleife die Prüfung nicht anhält.
  await p.evaluate(async () => {
    const laufende = document.getAnimations()
      .filter((a) => a.playState === 'running' || a.playState === 'pending');
    await Promise.race([
      Promise.allSettled(laufende.map((a) => a.finished)),
      new Promise((f) => setTimeout(f, 9000)),
    ]);
  });
  await new Promise((r) => setTimeout(r, 400));
  await p.evaluate(axe);
  const r = await p.evaluate(async () => await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  }));
  gesamt += r.violations.length;
  console.log(`${seite} → ${r.violations.length} Verstöße`);
  for (const v of r.violations) {
    console.log(`  [${v.impact}] ${v.id} (${v.nodes.length}×) – ${v.help}`);
    console.log('   ', v.nodes[0].html.slice(0, 140).replace(/\s+/g, ' '));
    if (v.nodes[0].any?.[0]?.message) console.log('   →', v.nodes[0].any[0].message.slice(0, 170));
  }
}

await b.close();
server.close();
console.log(gesamt === 0 ? '\nWCAG 2.1 AA: keine Verstöße.' : `\nInsgesamt ${gesamt} Verstöße.`);
process.exit(gesamt === 0 ? 0 : 1);
