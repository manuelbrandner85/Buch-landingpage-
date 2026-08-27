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

const heute = new Date().toISOString().slice(0, 10);
const beitraegeText = liesText(join(wurzel, 'src', 'data', 'gemeinsam', 'beitraege.ts'));
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
}
const letzte30 = tage.slice(-30);

// Eine Zeile ohne Verkaufszahlen ist keine Verkaufszahl: Steht in allen Feldern
// ein Strich, bleibt die Luecke sichtbar, auch wenn die Datei da ist.
const keineVerkaeufe = !tage.length
  || letzte30.every((t) => t.kindle === null && t.taschenbuch === null && t.kenp === null);
if (keineVerkaeufe) {
  fehlt('Verkäufe', zahlenText
    ? (tage.length
        ? 'In ZAHLEN.md stehen Tageszeilen, aber ohne Verkaufszahlen — Kindle, Taschenbuch und KENP sind unausgefüllt. Sie stehen nur im KDP-Konto.'
        : 'ZAHLEN.md steht bereit, aber es ist noch keine Tageszeile eingetragen. Die Zahlen stehen nur im KDP-Konto.')
    : 'ZAHLEN.md gibt es noch nicht. Die Zahlen stehen nur im KDP-Konto; Amazon-Seiten darf keine Automatik abrufen.');
}
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
const journalVorrat = beitraegeText
  ? [...beitraegeText.matchAll(/datum:\s*'(\d{4}-\d{2}-\d{2})'/g)].filter((m) => m[1] > heute).length
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

// ── Termine: was ansteht, steht sonst nur in Textdateien ──────────────────
//
// Der Tagesplan liegt in plan.json, die Journalbeiträge im Repository, die
// Live steht freitags um 20:00. Drei Orte, an denen niemand nachsieht, der
// gerade auf dem Sofa sitzt. Hier laufen sie zusammen — die nächsten vierzehn
// Tage, nichts weiter.
const KANALNAMEN = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', pinterest: 'Pinterest' };
const WOCHENTAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const plan = autopilot ? lies(join(autopilot, 'plan.json')) : null;
if (autopilot && !plan) fehlt('Termine', 'plan.json nicht gefunden — der Tagesplan fehlt.');
const inVierzehn = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
const termine = [];
const tagFinden = (d) => {
  let t = termine.find((x) => x.d === d);
  if (!t) { t = { d, wochentag: WOCHENTAG[new Date(d + 'T12:00:00Z').getUTCDay()], punkte: [] }; termine.push(t); }
  return t;
};
for (const tag of plan?.tage ?? []) {
  if (!tag?.datum || tag.datum < heute || tag.datum > inVierzehn) continue;
  for (const [schluessel, name] of Object.entries(KANALNAMEN)) {
    const e = tag[schluessel];
    if (!e) continue;
    tagFinden(tag.datum).punkte.push({
      kanal: name,
      zeit: e.uhrzeit ?? null,
      was: tag.beitrag ?? null,
      zustand: e.erledigt ? 'erledigt' : (e.schon_geplant ? 'terminiert' : 'offen'),
      hinweis: e.hinweis || null,
    });
  }
}
// Die Live ist keine Datei, sondern eine Verabredung: freitags 20:00, so steht
// es in LIVE.md. Sie gehört in den Kalender wie alles andere auch.
for (let i = 0; i <= 14; i++) {
  const d = new Date(Date.now() + i * 864e5);
  if (d.getUTCDay() !== 5) continue;
  const tag = d.toISOString().slice(0, 10);
  if (tag < heute) continue;
  tagFinden(tag).punkte.push({ kanal: 'TikTok LIVE', zeit: '20:00', was: null, zustand: 'steht', hinweis: 'fester Termin' });
}
for (const m of beitraegeText ? beitraegeText.matchAll(/slug:\s*'([^']+)'[\s\S]{0,400}?datum:\s*'(\d{4}-\d{2}-\d{2})'/g) : []) {
  if (m[2] < heute || m[2] > inVierzehn) continue;
  tagFinden(m[2]).punkte.push({ kanal: 'Journal', zeit: null, was: m[1], zustand: 'terminiert', hinweis: null });
}
termine.sort((a, b) => (a.d < b.d ? -1 : 1));

// ── Verlauf: was gestern war, weiß sonst niemand ──────────────────────────
//
// Ein Dashboard ohne Gedächtnis zeigt immer nur den Augenblick. Ob 22.656
// Follower viel oder wenig sind, entscheidet sich daran, wie viele es vorige
// Woche waren. Deshalb legt jeder Lauf einen Tagesstand ab — einen je Tag, der
// letzte des Tages gewinnt. Geschrieben wird nur, wenn sich etwas geändert
// hat: Sonst wüchse die Datei stündlich um eine Zeile ohne Neuigkeit.
const VERLAUF = join(wurzel, 'daten', 'cockpit-verlauf.json');
const verlaufDatei = lies(VERLAUF) ?? {
  _hinweis: 'Ein Tagesstand je Zeile, geschrieben von scripts/cockpit.mjs. Nicht von Hand pflegen. Was fehlt, fehlt — es wird nichts nachgetragen und nichts geglättet.',
  tage: [],
};
const tagesstand = {
  d: new Date().toISOString().slice(0, 10),
  rang: buch.rangGesamt ?? null,
  rez: buch.rezensionen?.anzahl ?? null,
  gesamt: null,
  kanaele: {},
};
for (const k of basis.kanaele) {
  if (typeof k.follower === 'number') tagesstand.kanaele[k.name] = k.follower;
}
const gezaehlt = Object.values(tagesstand.kanaele);
if (gezaehlt.length) tagesstand.gesamt = gezaehlt.reduce((a, b) => a + b, 0);

// Ein Tag, eine Zeile: Käme dieselbe Datumsangabe zweimal vor, zeigte die
// Kurve einen Sprung, den es nie gab. Der spätere Eintrag gewinnt.
const nachTag = new Map();
for (const t of verlaufDatei.tage ?? []) if (t && t.d) nachTag.set(t.d, t);
const bisher = [...nachTag.values()];
const heutiger = bisher.find((t) => t.d === tagesstand.d);
const gleichwie = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Hat das Entdoppeln etwas entfernt, gehört die bereinigte Fassung auf die
// Platte — sonst bliebe der Fehler dort für immer stehen.
let verlaufNeu = bisher.length !== (verlaufDatei.tage ?? []).length;
if (!heutiger) {
  bisher.push(tagesstand);
  verlaufNeu = true;
} else if (!gleichwie(heutiger, tagesstand)) {
  Object.assign(heutiger, tagesstand);
  verlaufNeu = true;
}
bisher.sort((a, b) => (a.d < b.d ? -1 : 1));
// Ein halbes Jahr genügt; was älter ist, beantwortet keine Frage mehr, die
// heute gestellt wird.
while (bisher.length > 180) bisher.shift();
verlaufDatei.tage = bisher;
if (verlaufNeu && !nurPruefen) {
  writeFileSync(VERLAUF, JSON.stringify(verlaufDatei, null, 2) + '\n', 'utf8');
}

// Fürs Dashboard nur die letzten 30 Tage, und nur Reihen mit mindestens zwei
// Punkten — eine Kurve aus einem einzigen Wert ist keine Kurve.
const letzte = bisher.slice(-30);
const reihe = (nimm) => {
  const p = letzte.map((t) => ({ d: t.d, v: nimm(t) })).filter((x) => typeof x.v === 'number');
  return p.length >= 2 ? p : [];
};
const kanalReihen = {};
for (const k of basis.kanaele) {
  const p = reihe((t) => t.kanaele?.[k.name]);
  if (p.length) kanalReihen[k.name] = p;
}
const verlauf = {
  tage: letzte.length,
  seit: letzte.length ? letzte[0].d : null,
  rang: reihe((t) => t.rang),
  rezensionen: reihe((t) => t.rez),
  reichweite: reihe((t) => t.gesamt),
  kanaele: kanalReihen,
};

// ── Wochenbericht: der jüngste Abschnitt, nicht die ganze Datei ───────────
const berichtText = autopilot ? liesText(join(autopilot, 'WOCHENBERICHT.md')) : null;
let bericht = null;
if (berichtText && berichtText.trim()) {
  // Der Sonntagslauf hängt oben an; der erste Abschnitt ist der neueste.
  const teile = berichtText.split(/\n(?=##\s)/).map((x) => x.trim()).filter(Boolean);
  const erst = teile.find((x) => x.startsWith('##')) ?? teile[0];
  const zeilen = erst.split('\n').map((z) => z.trim());
  bericht = {
    titel: (zeilen[0] || '').replace(/^#+\s*/, '') || 'Wochenbericht',
    zeilen: zeilen.slice(1).filter(Boolean).slice(0, 40),
  };
} else {
  fehlt('Wochenbericht', 'Es gibt noch keinen. Der Sonntagslauf schreibt den ersten.');
}

// ── Kosten: was die Bilder gekostet haben ─────────────────────────────────
const kostenDatei = autopilot ? lies(join(autopilot, 'kosten.json')) : null;
const alleBuchungen = kostenDatei?.buchungen ?? [];
const kosten = kostenDatei
  ? {
      waehrung: kostenDatei.waehrung ?? null,
      summe: alleBuchungen.reduce((a, b) => a + (Number(b.credits) || 0), 0),
      offenSumme: alleBuchungen
        .filter((b) => String(b.projekt).toLowerCase().includes('nicht zugeordnet'))
        .reduce((a, b) => a + (Number(b.credits) || 0), 0),
      buchungen: alleBuchungen.slice(-12).reverse(),
    }
  : null;
if (!kostenDatei) fehlt('Kosten', 'kosten.json nicht gefunden.');

const stand = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const raus = {
  stand,
  buch,
  verkaeufe,
  besucher: basis.besucher,
  reichweite,
  verlauf,
  termine,
  bericht,
  kosten,
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
console.log(`Cockpit geschrieben: ${tage.length} Tage Verkäufe, ${bekannt.length}/${basis.kanaele.length} Kanäle mit Zahl, ${luecken.length} Lücke(n), Verlauf ${bisher.length} Tag(e)${verlaufNeu ? ' (neu)' : ''}.`);
