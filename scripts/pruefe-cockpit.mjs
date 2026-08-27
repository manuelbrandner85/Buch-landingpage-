/**
 * Das Cockpit ist eine einzelne Datei ohne Bauschritt.
 *
 * Genau darin liegt seine Gefahr: Ein fehlendes Pluszeichen in einer der
 * zusammengesetzten Zeichenketten faellt niemandem auf, weil kein Uebersetzer
 * daraufsieht — bis das Telefon eine leere Seite zeigt. Diese Pruefung liest
 * die Datei, schneidet das Skript heraus und laesst es vom Parser bewerten,
 * ohne es auszufuehren. Dazu ein paar Auffaelligkeiten, die man in einer
 * 900-Zeilen-Datei sonst uebersieht.
 *
 *   node scripts/pruefe-cockpit.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORDNER = join(wurzel, 'public', 'cockpit-eb4e3e9d63d6');
const fehler = [];

const seite = readFileSync(join(ORDNER, 'index.html'), 'utf8');

// ── Das Skript herausschneiden und den Parser darauf ansetzen ─────────────
const skripte = [...seite.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!skripte.length) fehler.push('index.html enthaelt kein eingebettetes Skript.');
skripte.forEach((quelle, i) => {
  try {
    // Nur uebersetzen, nicht ausfuehren: new Function wirft bei jedem Syntaxfehler.
    new Function(quelle);
  } catch (e) {
    fehler.push(`Skript ${i + 1} in index.html: ${e.message}`);
  }
});

// ── Der Dienst im Hintergrund ─────────────────────────────────────────────
const sw = readFileSync(join(ORDNER, 'sw.js'), 'utf8');
const lager = sw.match(/LAGER\s*=\s*'([^']+)'/)?.[1] ?? null;
if (!lager) fehler.push('sw.js: kein LAGER-Name gefunden.');

// Jede sichtbare Aenderung an der Huelle braucht einen neuen Lagernamen, sonst
// bleibt auf dem Telefon die alte Fassung stehen — der teuerste Fehler dieser
// Datei, weil er nur bei anderen auftritt. Die Pruefung dafuer kann keine
// Maschine uebernehmen; sie steht als Merkposten in COCKPIT.md.
if (lager && !/-v\d+'/.test(sw)) {
  fehler.push(`sw.js: Der Lagername ${lager} traegt keine Nummer — ohne sie laesst er sich nicht hochzaehlen.`);
}

// ── Zwei Kleinigkeiten, die stumm schiefgehen ─────────────────────────────
for (const g of [...seite.matchAll(/data-g="([a-z]+)"/g)].map((m) => m[1])) {
  if (!new RegExp(`id:\\s*'${g}'`).test(seite)) {
    fehler.push(`Abschnitt data-g="${g}" hat keinen Reiter in GRUPPEN — er waere unerreichbar.`);
  }
}
if (!/rel="manifest"/.test(seite)) fehler.push('index.html: kein Verweis auf app.webmanifest.');

if (fehler.length) {
  console.error('Cockpit-Pruefung fehlgeschlagen:');
  for (const f of fehler) console.error('  - ' + f);
  process.exit(1);
}
console.log(`Cockpit geprueft: ${skripte.length} Skript(e) uebersetzbar, Lager ${lager}, alle Abschnitte erreichbar.`);
