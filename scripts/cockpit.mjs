/**
 * Das Cockpit füllen.
 *
 * Ein Dashboard, das von Hand gepflegt wird, ist nach drei Tagen falsch.
 * Deshalb steht hier eine Trennung: Was ein Mensch weiß, steht in
 * `daten/cockpit-basis.json`. Was sich messen lässt, holt dieses Skript bei
 * jedem Lauf frisch — aus der stündlichen Windows-Aufgabe (Deploys,
 * Zertifikate, Linkprüfung), aus ZAHLEN.md (Verkäufe) und aus dem Repository
 * selbst (Journalvorrat, Bandstatus).
 *
 * Die eiserne Regel gilt auch hier: Fehlt eine Zahl, steht dort `null` und im
 * Dashboard „keine Daten“. Es wird nichts geschätzt und nichts fortgeschrieben.
 *
 *   node scripts/cockpit.mjs            schreibt public/cockpit-…/cockpit.json
 *   node scripts/cockpit.mjs --pruefen  schreibt nichts, meldet nur
 *
 * Wo der Autopilot-Ordner liegt, sagt COCKPIT_AUTOPILOT; ohne die Variable
 * werden die bekannten Orte auf dem Windows-Rechner und im Linux-Mount probiert.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(wurzel, 'public', 'cockpit-eb4e3e9d63d6', 'cockpit.json');
const nurPruefen = process.argv.includes('--pruefen');

const ORTE = [
  process.env.COCKPIT_AUTOPILOT,
  'C:/Users/manue/Desktop/Buch/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT',
  join(process.env.HOME ?? '', 'mnt/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT'),
  join(process.env.HOME ?? '', 'mnt/AUTOPILOT'),
].filter(Boolean);

const autopilot = ORTE.find((o) => existsSync(join(o, 'cockpit-windows.json')))
  ?? ORTE.find((o) => existsSync(o));

/** JSON lesen, ohne dass ein fehlender Ordner den ganzen Lauf beendet. */
const lies = (pfad) => {
  try {
    // Die Windows-Aufgabe schreibt mit BOM; JSON.parse verschluckt sich daran.
    return JSON.parse(readFileSync(pfad, 'utf8').replace(/^\uFEFF/, ''));
  } catch { return null; }
};
const liesText = (pfad) => { try { return readFileSync(pfad, 'utf8'); } catch { return null; } };

const luecken = [];
const fehlt = (was, warum) => luecken.push({ was, warum });

// ── Der redaktionelle Teil ────────────────────────────────────────────────
const basis = lies(join(wurzel, 'daten', 'cockpit-basis.json'));
if (!basis) {
  console.error('Fehler: daten/cockpit-basis.json fehlt oder ist kein gültiges JSON.');
  process.exit(1);
}

// ── Verkäufe: eine Zeile je Tag in ZAHLEN.md ──────────────────────────────
// Format (nicht ändern, das Dashboard liest es maschinell):
//   JJJJ-MM-TT | Kindle x | Taschenbuch x | KENP x | Rang x | Rezensionen n (Ø x,x)
const zahlenDatei = autopilot ? join(autopilot, 'ZAHLEN.md') : null;
const zahlenText = zahlenDatei ? liesText(zahlenDatei) : null;
const zeileRe = /^(\d{4}-\d{2}-\d{2})\s*\|\s*Kindle\s+(\S+)\s*\|\s*Taschenbuch\s+(\S+)\s*\|\s*KENP\s+(\S+)\s*\|\s*Rang\s+(\S+)\s*\|\s*Rezensionen\s+(\S+)(?:\s*\(Ø\s*([\d,\.]+)\))?/;
const zzahl = (s) => {
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const tage = [];
if (zahlenText) {
  for (const roh of zahlenText.split(/\r?\n/)) {
    const m = roh.trim().match(zeileRe);
    if (!m) continue;
    tage.push({
      d: m[1], kindle: zzahl(m[2]), taschenbuch: zzahl(m[3]), kenp: zzahl(m[4]),
      rang: zzahl(m[5]), rez: zzahl(m[6]), schnitt: m[7] ? zzahl(m[7]) : null,
    });
  }
  tage.sort((a, b) => (a.d < b.d ? -1 : 1));
} else {
  fehlt('Verkäufe', 'ZAHLEN.md gibt es noch nicht. Die Zahlen stehen nur im KDP-Konto; Amazon-Seiten darf keine Automatik abrufen.');
}
const letzte30 = tage.slice(-30);
const summe = (feld) => {
  const werte = letzte30.map((t) => t[feld]).filter((w) => w !== null);
  return werte.length ? werte.reduce((a, b) => a + b, 0) : null;
};
const verkaeufe = {
  gelesen: tage.length > 0,
  hinweis: tage.length ? null : 'ZAHLEN.md gibt es noch nicht — keine Verkaufszahlen, solange niemand die KDP-Berichte abliest.',
  summe30: { kindle: summe('kindle'), taschenbuch: summe('taschenbuch'), kenp: summe('kenp') },
  tage: letzte30.slice(-14),
};

// Der Rang steht in der jüngsten Zeile genauer als in der Handpflege.
const buch = structuredClone(basis.buch);
const jung = tage[tage.length - 1];
const davor = tage[tage.length - 2];
if (jung?.rang) { buch.rangGesamt = jung.rang; buch.rangStand = jung.d; }
if (davor?.rang) buch.rangVorher = davor.rang;
if (jung?.rez !== null && jung?.rez !== undefined) {
  buch.rezensionen = { anzahl: jung.rez, schnitt: jung.schnitt ?? null };
}

// ── Technik: was die stündliche Windows-Aufgabe gemessen hat ──────────────
const w = autopilot ? lies(join(autopilot, 'cockpit-windows.json')) : null;
if (!w) fehlt('Technik', 'cockpit-windows.json nicht gefunden — läuft die stündliche Windows-Aufgabe?');
const eigen = (n) => (s) => String(s?.slug ?? '').includes(n);
const deploy = w?.deploys?.find(eigen('Buch-landingpage')) ?? null;
const zert = w?.zertifikate?.find((z) => String(z.domain).includes('trendonix')) ?? null;
const links = w?.links?.find((l) => l.kurz === 'autorenseite') ?? null;

// ── Der Deploy-Stand aus erster Hand ──────────────────────────────────────
//
// cockpit-windows.json wird stündlich geschrieben und ist zwischendurch alt;
// ein rotes Feld, das längst wieder grün ist, ist schlimmer als keins. Das
// Abzeichen des Arbeitsablaufs ist öffentlich, braucht keinen Schlüssel und
// sagt in einem Wort, wie der letzte Lauf ausging.
let badge = null;
try {
  const a = await fetch('https://github.com/manuelbrandner85/Buch-landingpage-/actions/workflows/deploy.yml/badge.svg',
    { signal: AbortSignal.timeout(15000), headers: { 'cache-control': 'no-cache' } });
  if (a.ok) {
    const svg = await a.text();
    if (/>passing</.test(svg)) badge = 'erfolgreich';
    else if (/>failing</.test(svg)) badge = 'fehlgeschlagen';
  }
} catch { /* ohne Netz bleibt es beim Wert aus der Windows-Aufgabe */ }

// ── Journalvorrat: Beiträge mit Datum in der Zukunft ──────────────────────
const beitraege = liesText(join(wurzel, 'src', 'data', 'gemeinsam', 'beitraege.ts'));
const heute = new Date().toISOString().slice(0, 10);
const journalVorrat = beitraege
  ? [...beitraege.matchAll(/datum:\s*'(\d{4}-\d{2}-\d{2})'/g)].filter((m) => m[1] > heute).length
  : null;

const technik = {
  stand: w?.erzeugtAm ?? null,
  deploy: badge ?? (deploy ? (deploy.ergebnis === 'success' ? 'erfolgreich' : deploy.ergebnis) : null),
  deployQuelle: badge ? 'Abzeichen' : (deploy ? 'Windows-Lauf' : null),
  // Widerspricht das Abzeichen dem Windows-Lauf, ist dessen Zeitstempel der
  // eines anderen Laufs — dann lieber keine Zeit als eine falsche.
  deployWann: (!badge || !deploy || (badge === 'erfolgreich') === (deploy.ergebnis === 'success'))
    ? (deploy?.wann ?? null) : null,
  zertifikatTage: zert?.tageRest ?? null,
  linksGeprueft: links?.geprueft ?? null,
  linksKaputt: links?.kaputt?.length ?? null,
  linksZiele: (links?.kaputt ?? []).map((k) => ({ ziel: k.ziel, code: k.code })),
  seitenGemeldet: basis.besucher?.seitenGesamt ?? null,
  journalVorrat,
};

// ── Reichweite über alle Kanäle, ohne Schätzung ───────────────────────────
const bekannt = basis.kanaele.filter((k) => typeof k.follower === 'number');
const reichweite = {
  gesamt: bekannt.length ? bekannt.reduce((a, k) => a + k.follower, 0) : null,
  kanaeleGezaehlt: bekannt.length,
  kanaeleGesamt: basis.kanaele.length,
};
if (bekannt.length < basis.kanaele.length) {
  fehlt('Reichweite', `${basis.kanaele.length - bekannt.length} von ${basis.kanaele.length} Kanälen ohne Zahl.`);
}
if (!basis.besucher?.gelesen) fehlt('Besucher', basis.besucher?.hinweis ?? 'Keine Zahlen aus der Search Console.');

const stand = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const raus = {
  stand,
  buch,
  verkaeufe,
  besucher: basis.besucher,
  reichweite,
  kanaele: basis.kanaele,
  vorschlaege: basis.vorschlaege,
  aktivitaet: basis.aktivitaet,
  offen: basis.offen,
  technik,
  luecken,
};

const text = JSON.stringify(raus, null, 2) + '\n';
const alt = liesText(ZIEL);
// Der Zeitstempel allein ist keine Änderung — sonst lädt das Telefon stündlich
// dieselben Zahlen neu und der Abgleich schiebt eine Datei ohne Neuigkeit hoch.
const ohneStand = (s) => (s ?? '').replace(/"stand": "[^"]*",/, '');
const gleich = ohneStand(alt) === ohneStand(text);

if (nurPruefen) {
  console.log(gleich ? 'Cockpit: nichts Neues.' : 'Cockpit: es gäbe etwas zu schreiben.');
  process.exit(gleich ? 0 : 1);
}
if (gleich) { console.log('Cockpit: unverändert, nichts geschrieben.'); process.exit(0); }
writeFileSync(ZIEL, text, 'utf8');
console.log(`Cockpit geschrieben: ${tage.length} Tage Verkäufe, ${bekannt.length}/${basis.kanaele.length} Kanäle mit Zahl, ${luecken.length} Lücke(n).`);
