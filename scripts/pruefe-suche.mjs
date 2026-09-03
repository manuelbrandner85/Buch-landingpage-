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
/**
 * Untergrenzen — der Fehler, den diese Prüfung bis zum 03.09.2026 nicht sah.
 *
 * Sie kannte nur Obergrenzen, und deshalb galt eine Buchseite mit 29 Zeichen
 * Titel und 46 Zeichen Beschreibung als in Ordnung. Ein Treffer bei Google ist
 * aber eine Fläche, die einem zusteht: Wer sie nicht füllt, verschenkt sie
 * nicht nur — Google füllt sie dann selbst, mit einem beliebigen Satz von der
 * Seite. Zu kurz ist deshalb kein kleinerer Fehler als zu lang.
 */
const MIN_TITEL = 25;
const MIN_BESCHREIBUNG = 90;

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
let mitBild = 0;
const ohneBild = [];
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
    if (t.length > MAX_TITEL) maengel.push([weg, `Titel ${t.length} Zeichen – zu lang`]);
    if (t.length < MIN_TITEL) maengel.push([weg, `Titel ${t.length} Zeichen – zu kurz`]);
    titel.set(t, [...(titel.get(t) ?? []), weg]);
  }
  if (!b) maengel.push([weg, 'keine Beschreibung']);
  else {
    if (b.length > MAX_BESCHREIBUNG) {
      maengel.push([weg, `Beschreibung ${b.length} Zeichen – zu lang`]);
    }
    if (b.length < MIN_BESCHREIBUNG) {
      maengel.push([weg, `Beschreibung ${b.length} Zeichen – zu kurz`]);
    }
    beschreibungen.set(b, [...(beschreibungen.get(b) ?? []), weg]);
  }
  if (!kanonisch) maengel.push([weg, 'kein canonical']);
  // Ein Treffer ohne Vorschaubild wird auf jeder Plattform seltener geklickt.
  //
  // Nur geprüft, wenn überhaupt eine Seite eines hat: Ein Bau ohne
  // NEXT_PUBLIC_BASIS_URL – also jeder Probelauf auf dem eigenen Rechner –
  // lässt alle Vorschaubilder weg, weil ihnen die absolute Adresse fehlt.
  // Zweihundert Beanstandungen, die nur bedeuten „das war kein
  // Veröffentlichungsbau“, machen die Prüfung wertlos.
  if (/<meta property="og:image"/.test(html)) mitBild += 1;
  else ohneBild.push(weg);
  if (ueberschriften !== 1) maengel.push([weg, `${ueberschriften} Überschriften erster Ordnung`]);
}

if (mitBild > 0) for (const weg of ohneBild) maengel.push([weg, 'kein Vorschaubild']);

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
