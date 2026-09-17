/**
 * Den fertigen Export aus `out/` ausliefern — für Messungen und Aufnahmen.
 *
 * Kein Entwicklungsserver: Der baut on demand, liefert unkomprimiert aus und
 * misst deshalb etwas anderes als die Seite, die später im Netz steht. Was
 * hier bedient wird, ist Byte für Byte das, was auf den Server hochgeht.
 *
 * Als Programm:   node scripts/aus-bedienen.mjs [Port]
 * Als Baustein:   import { bedienen } from './aus-bedienen.mjs'
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const WURZEL = path.resolve(import.meta.dirname, '..');
const AUS = path.join(WURZEL, 'out');

const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf',
};

/** Startet den Server. Gibt `{ adresse, schliessen }` zurück. */
export async function bedienen(port = 4317) {
  if (!existsSync(path.join(AUS, 'index.html'))) {
    throw new Error('Kein Export in out/ — erst `npm run export`.');
  }

  const dienst = createServer(async (anfrage, antwort) => {
    try {
      const weg = decodeURIComponent((anfrage.url ?? '/').split('?')[0]);
      let datei = path.join(AUS, weg);
      // Der Export legt jede Seite als `<weg>/index.html` ab. Ein Weg ohne
      // Endung ist deshalb ein Ordner, kein fehlender Dateityp.
      if (weg.endsWith('/')) datei = path.join(datei, 'index.html');
      else if (!path.extname(datei)) {
        if (existsSync(`${datei}.html`)) datei += '.html';
        else if (existsSync(path.join(datei, 'index.html'))) datei = path.join(datei, 'index.html');
      }
      const inhalt = await readFile(datei);
      antwort.writeHead(200, {
        'Content-Type': TYPEN[path.extname(datei)] ?? 'application/octet-stream',
        // Content-Length ist hier kein Detail, sondern die halbe Messung.
        //
        // Ohne diesen Kopf schickt Node die Antwort in Stücken (chunked), und
        // dann steht in der Antwort keine Länge. `scripts/pruefe-tempo.mjs`
        // zählt das Seitengewicht aus genau diesem Kopf — im ersten Lauf kam
        // deshalb für jede Seite „0 KB (JS 0)" heraus, und das Gewichtsbudget
        // war still erfüllt, ohne dass irgendetwas geprüft wurde. Eine
        // Messung, die nie anschlägt, ist schlimmer als keine.
        'Content-Length': String(inhalt.byteLength),
        // Nichts zwischenspeichern: Eine Messung, die den zweiten Besuch
        // misst, misst nicht das, was zählt.
        'Cache-Control': 'no-store',
      });
      antwort.end(inhalt);
    } catch {
      antwort.writeHead(404, { 'Content-Type': 'text/plain' }).end('nicht da');
    }
  });

  await new Promise((fertig) => dienst.listen(port, fertig));
  return {
    adresse: `http://127.0.0.1:${port}`,
    schliessen: () => new Promise((f) => dienst.close(f)),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const { adresse } = await bedienen(Number(process.argv[2] ?? 4317));
  console.log(`out/ liegt auf ${adresse} — mit Strg+C beenden.`);
}
