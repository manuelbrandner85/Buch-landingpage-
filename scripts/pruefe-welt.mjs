/**
 * Prüft die Weltdaten vor jedem Build – über alle Bände, nicht nur den ersten.
 *
 * Der Anspruch des Buches ist Belegbarkeit – die Website muss denselben Anspruch
 * technisch durchhalten. Deshalb schlägt der Build fehl, wenn eine Szene ihre
 * Buchseite verschweigt, ein Motiv ohne Herkunftsangabe auftaucht oder ein
 * Asset auf eine Datei zeigt, die es nicht gibt.
 */
import { readFileSync, existsSync } from 'node:fs';

const lies = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const holen = (text, muster) => [...text.matchAll(muster)].map((m) => m[1]);

/**
 * Ein Band gilt als eingehängt, sobald er ein Kapitel nennt. Seitenzahl = Umfang
 * des Bandes. `reihe` sagt, in welcher Zählung seine Kapitelnummern gelten:
 * innerhalb einer Reihe müssen sie eindeutig sein, über Reihen hinweg dürfen
 * sie sich wiederholen – sonst könnte keine zweite Reihe bei Kapitel 1 anfangen.
 */
const BAENDE = [
  { id: 'band-1', reihe: 'faeden', ordner: 'src/data/band-1', kapitelDatei: 'band.ts', seiten: 206 },
  { id: 'band-2', reihe: 'faeden', ordner: 'src/data/band-2', kapitelDatei: 'band.ts', seiten: 206 },
  { id: 'band-3', reihe: 'faeden', ordner: 'src/data/band-3', kapitelDatei: 'band.ts', seiten: 206 },
];

const orteText = lies('src/data/gemeinsam/orte.ts');
const fehler = [];
const warnung = [];
const gesehen = new Set();
const kapitelJeReihe = new Map();
let assetZahl = 0;

const gueltigeEvidenz = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']);

for (const band of BAENDE) {
  const szenenText = lies(`${band.ordner}/szenen.ts`);
  const assetText = lies(`${band.ordner}/assets.ts`);
  const kapitelText = lies(`${band.ordner}/${band.kapitelDatei}`);

  // Der Band muss sich zu der Reihe bekennen, in der er hier geführt wird.
  const genannteReihe = kapitelText.match(/reiheId: '([\w-]+)'/)?.[1];
  if (genannteReihe && genannteReihe !== band.reihe) {
    fehler.push(`${band.id}: steht in Reihe "${band.reihe}", nennt aber "${genannteReihe}".`);
  }

  const kapitelIds = new Set(holen(kapitelText, /\{ id: (\d+), bandId/g).map(Number));
  if (!kapitelJeReihe.has(band.reihe)) kapitelJeReihe.set(band.reihe, new Set());
  const inReihe = kapitelJeReihe.get(band.reihe);
  for (const k of kapitelIds) {
    if (inReihe.has(k)) {
      fehler.push(`${band.id}: Kapitel ${k} ist in Reihe "${band.reihe}" doppelt vergeben.`);
    }
    inReihe.add(k);
  }
  if (!kapitelIds.size) { warnung.push(`${band.id} hat noch keine Kapitel.`); continue; }

  // --- Assets: Datei je Asset vorhanden? ---
  // `bandId` steht optional zwischen id und datei – Band 1 kennt es nicht.
  const assets = [...assetText.matchAll(
    /id: '([\w-]+)',\s*(?:bandId: '[\w-]+',\s*)?datei: '([\w-]+)'/g)]
    .map(([, id, datei]) => ({ id, datei }));
  const assetIds = new Set(assets.map((a) => a.id));
  assetZahl += assets.length;

  for (const a of assets) {
    const pfad = `public/assets/${band.id}/szenen/${a.datei}-640.webp`;
    if (!existsSync(pfad)) fehler.push(`Asset "${a.id}": ${pfad} fehlt. npm run assets ausführen.`);
  }

  // --- Szenen: Blöcke einzeln zerlegen ---
  for (const block of szenenText.split(/\n  \{\n/).slice(1)) {
    const id = block.match(/id: '([\w-]+)'/)?.[1] ?? '(ohne id)';
    const typ = block.match(/typ: '(\w+)'/)?.[1];

    if (gesehen.has(id)) fehler.push(`Szene "${id}": doppelte id.`);
    gesehen.add(id);

    const bandId = block.match(/bandId: '([\w-]+)'/)?.[1];
    if (bandId !== band.id) {
      fehler.push(`Szene "${id}": bandId "${bandId}" steht in den Daten von ${band.id}.`);
    }

    const platte = block.match(/platte: '([\w-]+)'/)?.[1];
    if (platte && !assetIds.has(platte)) fehler.push(`Szene "${id}": Asset "${platte}" gibt es nicht.`);

    const kapitel = block.match(/kapitelId: (\d+)/)?.[1];
    if (kapitel && !kapitelIds.has(Number(kapitel))) {
      fehler.push(`Szene "${id}": Kapitel ${kapitel} ist in ${band.id} nicht definiert.`);
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
    if (seite && (seite < 1 || seite > band.seiten)) {
      fehler.push(`Szene "${id}": Seite ${seite} liegt außerhalb von ${band.id} (1–${band.seiten}).`);
    }
  }

  // --- Kapitel ohne eigene Szene sind erlaubt, aber erwähnenswert ---
  for (const k of kapitelIds) {
    if (!szenenText.includes(`kapitelId: ${k}`)) warnung.push(`${band.id}: Kapitel ${k} hat noch keine Szene.`);
  }
}

// --- Orte: jedes Kapitel im Vorkommen muss es irgendwo in der Welt geben ---
for (const [, name, kapitel] of orteText.matchAll(/name: '([^']+)'[\s\S]{0,400}?kapitel: (\d+)/g)) {
  // Orte liegen in der Welt einer Reihe; die Kapitelnummer muss dort vorkommen.
  const bekannt = [...kapitelJeReihe.values()].some((s) => s.has(Number(kapitel)));
  if (!bekannt) fehler.push(`Ort "${name}": Kapitel ${kapitel} ist nicht definiert.`);
}

for (const w of warnung) console.warn(`  Hinweis: ${w}`);

if (fehler.length) {
  console.error('\nWeltdaten fehlerhaft:\n' + fehler.map((f) => `  · ${f}`).join('\n') + '\n');
  process.exit(1);
}
console.log(
  `Weltdaten geprüft: ${gesehen.size} Szenen, ` +
  `${[...kapitelJeReihe.values()].reduce((n, s) => n + s.size, 0)} Kapitel in ` +
  `${kapitelJeReihe.size} Reihe(n), ` +
  `${assetZahl} Assets – in Ordnung.`,
);
