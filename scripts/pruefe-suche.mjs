/**
 * Prüft, was Suchmaschinen von jeder Seite zu sehen bekommen.
 *
 * Am 27.08.2026 hatte die fertige Seite 123 Beanstandungen: eine 223 Zeichen
 * lange Beschreibung auf jeder Seite ohne eigene, sechzig zu lange Ortstitel,
 * drei Weltseiten ganz ohne erste Überschrift, doppelte Beschreibungen. Nichts
 * davon war zu sehen – der Bau war grün, die Seite sah gut aus, und trotzdem
 * war jeder zweite Treffer bei Google beschädigt.
 *
 * Deshalb läuft diese Prüfung jetzt bei jeder Veröffentlichung mit. Sie liest
 * den fertigen Export, nicht den Quelltext: Was hier steht, ist genau das, was
 * ausgeliefert wird.
 *
 * Geprüft wird nur, was indexiert werden soll. Seiten mit `noindex` – die
 * Weiterleitungen unter /welt/ etwa – dürfen alles doppelt haben; sie stehen
 * in keinem Index.
 *
 *   node scripts/pruefe-suche.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = 'out';
const MAX_TITEL = 65;
const MAX_BESCHREIBUNG = 170;

function seiten(ordner) {
  const aus = [];
  for (const eintrag of readdirSync(ordner)) {
    const pfad = join(ordner, eintrag);
    if (statSync(pfad).isDirectory()) aus.push(...seiten(pfad));
    else if (eintrag === 'index.html') aus.push(pfad);
  }
  return aus;
}

const eins = (html, muster) => (html.match(muster) ?? [])[1];

const alle = seiten(WURZEL);
const titel = new Map();
const beschreibungen = new Map();
const maengel = [];

for (const pfad of alle) {
  const html = readFileSync(pfad, 'utf8');
  const weg = `/${pfad.replace(`${WURZEL}/`, '').replace(/index\.html$/, '')}`;
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;

  const t = eins(html, /<title>([\s\S]*?)<\/title>/);
  const b = eins(html, /<meta name="description" content="([\s\S]*?)"/);
  const kanonisch = eins(html, /<link rel="canonical" href="([^"]*)"/);
  const ueberschriften = (html.match(/<h1[\s>]/g) ?? []).length;

  if (!t) maengel.push([weg, 'kein Titel']);
  else {
    if (t.length > MAX_TITEL) maengel.push([weg, `Titel ${t.length} Zeichen`]);
    titel.set(t, [...(titel.get(t) ?? []), weg]);
  }
  if (!b) maengel.push([weg, 'keine Beschreibung']);
  else {
    if (b.length > MAX_BESCHREIBUNG) {
      maengel.push([weg, `Beschreibung ${b.length} Zeichen`]);
    }
    beschreibungen.set(b, [...(beschreibungen.get(b) ?? []), weg]);
  }
  if (!kanonisch) maengel.push([weg, 'kein canonical']);
  if (ueberschriften !== 1) maengel.push([weg, `${ueberschriften} Überschriften erster Ordnung`]);
}

for (const [t, wege] of titel) {
  if (wege.length > 1) maengel.push([wege.join(', '), `gleicher Titel: „${t.slice(0, 40)}…“`]);
}
for (const [, wege] of beschreibungen) {
  if (wege.length > 1) maengel.push([wege.join(', '), 'gleiche Beschreibung']);
}

const zaehlbar = alle.length;
if (maengel.length === 0) {
  console.log(`${zaehlbar} Seiten geprüft. Titel, Beschreibungen und Überschriften sitzen.`);
  process.exit(0);
}

console.error(`${maengel.length} Beanstandungen auf ${zaehlbar} Seiten:\n`);
for (const [weg, was] of maengel) console.error(`  ${weg}\n    ${was}`);
console.error(
  '\nEine zu lange Beschreibung wird bei Google mitten im Satz abgeschnitten,'
  + '\nein doppelter Titel macht zwei Seiten ununterscheidbar. Beides ist'
  + '\nunsichtbar, solange niemand nachsieht – deshalb sieht das hier nach.',
);
process.exit(1);
