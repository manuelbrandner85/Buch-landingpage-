/**
 * Prüft die Weltdaten vor jedem Build.
 *
 * Der Anspruch des Buches ist Belegbarkeit – die Website muss denselben Anspruch
 * technisch durchhalten. Deshalb schlägt der Build fehl, wenn eine Szene ihre
 * Buchseite verschweigt, ein Motiv ohne Herkunftsangabe auftaucht oder ein
 * Asset auf eine Datei zeigt, die es nicht gibt.
 */
import { readFileSync, existsSync } from 'node:fs';

const lies = (p) => readFileSync(p, 'utf8');
const holen = (text, muster) => [...text.matchAll(muster)].map((m) => m[1]);

const szenenText = lies('src/data/band-1/szenen.ts');
const assetText = lies('src/data/band-1/assets.ts');
const orteText = lies('src/data/gemeinsam/orte.ts');
const kapitelText = lies('src/data/band-1/band.ts');

const fehler = [];
const warnung = [];

// --- Assets: Datei je Asset vorhanden? ---
const assets = [...assetText.matchAll(/id: '([\w-]+)', datei: '([\w-]+)'/g)]
  .map(([, id, datei]) => ({ id, datei }));
const assetIds = new Set(assets.map((a) => a.id));

for (const a of assets) {
  const pfad = `public/assets/band-1/szenen/${a.datei}-640.webp`;
  if (!existsSync(pfad)) fehler.push(`Asset "${a.id}": ${pfad} fehlt. npm run assets ausführen.`);
}

// --- Szenen: Blöcke einzeln zerlegen ---
const bloecke = szenenText.split(/\n  \{\n/).slice(1);
const kapitelIds = new Set(holen(kapitelText, /\{ id: (\d+), bandId/g).map(Number));
const gueltigeEvidenz = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
const gesehen = new Set();

for (const block of bloecke) {
  const id = block.match(/id: '([\w-]+)'/)?.[1] ?? '(ohne id)';
  const typ = block.match(/typ: '(\w+)'/)?.[1];

  if (gesehen.has(id)) fehler.push(`Szene "${id}": doppelte id.`);
  gesehen.add(id);

  const platte = block.match(/platte: '([\w-]+)'/)?.[1];
  if (platte && !assetIds.has(platte)) fehler.push(`Szene "${id}": Asset "${platte}" gibt es nicht.`);

  const kapitel = block.match(/kapitelId: (\d+)/)?.[1];
  if (kapitel && !kapitelIds.has(Number(kapitel))) {
    fehler.push(`Szene "${id}": Kapitel ${kapitel} ist nicht definiert.`);
  }

  // Jede Szene mit Buchinhalt nennt ihre Seite.
  const mitInhalt = ['auftakt', 'motiv', 'papier', 'interaktion'];
  if (typ && mitInhalt.includes(typ) && !/buchseite: \d+/.test(block)) {
    fehler.push(`Szene "${id}": buchseite fehlt – jede Aussage muss auf das Buch zeigen.`);
  }

  // Motive brauchen Herkunftsangabe und Quellenzeile.
  if (typ === 'motiv') {
    if (!/badge: '/.test(block)) fehler.push(`Szene "${id}": badge (Herkunft) fehlt.`);
    if (!/quelle: '/.test(block)) fehler.push(`Szene "${id}": quelle („Woher wir das wissen“) fehlt.`);
  }

  for (const stufe of holen(block, /evidenz: '(\w+)'/g)) {
    if (!gueltigeEvidenz.has(stufe)) fehler.push(`Szene "${id}": Evidenzstufe "${stufe}" ist ungültig.`);
  }

  const seite = Number(block.match(/buchseite: (\d+)/)?.[1] ?? 0);
  if (seite && (seite < 1 || seite > 206)) {
    fehler.push(`Szene "${id}": Seite ${seite} liegt außerhalb von Band 1 (1–206).`);
  }
}

// --- Orte: jedes Kapitel im Vorkommen muss existieren ---
for (const [, name, kapitel] of orteText.matchAll(/name: '([^']+)'[\s\S]{0,400}?kapitel: (\d+)/g)) {
  if (!kapitelIds.has(Number(kapitel))) fehler.push(`Ort "${name}": Kapitel ${kapitel} ist nicht definiert.`);
}

// --- Kapitel ohne eigene Szene sind erlaubt, aber erwähnenswert ---
for (const k of kapitelIds) {
  if (!szenenText.includes(`kapitelId: ${k}`)) warnung.push(`Kapitel ${k} hat noch keine Szene.`);
}

for (const w of warnung) console.warn(`  Hinweis: ${w}`);

if (fehler.length) {
  console.error('\nWeltdaten fehlerhaft:\n' + fehler.map((f) => `  · ${f}`).join('\n') + '\n');
  process.exit(1);
}
console.log(`Weltdaten geprüft: ${gesehen.size} Szenen, ${assets.length} Assets – in Ordnung.`);
