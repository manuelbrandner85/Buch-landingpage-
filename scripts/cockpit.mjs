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

// ── Der Monat: eine zweite Zeilenart in derselben Datei ───────────────────
//
// Die Tageszeile sagt, was an einem Tag verkauft wurde; die Monatszeile sagt,
// wo der Monat steht. Beides in einer Zeile zu führen wäre kürzer und falsch —
// „13 Bestellungen“ ist keine Tagesangabe, und wer sie als eine liest, addiert
// den Monat dreißigmal.
//   JJJJ-MM-TT | Monat JJJJ-MM | Bestellungen n | eBook n | Druck n | KENP n | Tantiemen x,xx
const monatRe = /^(\d{4}-\d{2}-\d{2})\s*\|\s*Monat\s+(\d{4}-\d{2})\s*\|\s*Bestellungen\s+(\S+)\s*\|\s*eBook\s+(\S+)\s*\|\s*Druck\s+(\S+)\s*\|\s*KENP\s+(\S+)\s*\|\s*Tantiemen\s+(\S+)/i;
const monatsTage = [];
if (zahlenText) {
  for (const roh of zahlenText.split(/\r?\n/)) {
    const m = roh.trim().match(monatRe);
    if (!m) continue;
    monatsTage.push({
      d: m[1], monat: m[2], bestellungen: zzahl(m[3]), ebook: zzahl(m[4]),
      druck: zzahl(m[5]), kenp: zzahl(m[6]), tantiemen: zzahl(m[7]),
    });
  }
  monatsTage.sort((a, b) => (a.d < b.d ? -1 : 1));
}
const MONATSNAMEN = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const jungerMonat = monatsTage[monatsTage.length - 1] ?? null;
let monat = basis.monat ?? null;
if (jungerMonat) {
  const [jahr, mm] = jungerMonat.monat.split('-');
  const zeitraum = `${MONATSNAMEN[Number(mm) - 1]} ${jahr}`;
  // Die Aufteilung der Tantiemenquellen steht nicht in der Zeile. Sie aus einem
  // älteren Stand weiterzuschleppen wäre eine Zahl, die niemand abgelesen hat —
  // sie bleibt nur, wenn sie zum selben Monat und zum selben Tag gehört.
  const passt = basis.monat?.zeitraum === zeitraum && basis.monat?.stand === jungerMonat.d;
  monat = {
    zeitraum,
    stand: jungerMonat.d,
    bestellungen: jungerMonat.bestellungen,
    ebook: jungerMonat.ebook,
    druck: jungerMonat.druck,
    tantiemen: jungerMonat.tantiemen,
    kenp: jungerMonat.kenp,
    quellen: passt ? (basis.monat.quellen ?? null) : null,
    hinweis: passt ? (basis.monat.hinweis ?? null)
      : 'Aus dem KDP-Bericht abgelesen. „Bearbeitete Bestellungen“ ist nicht dasselbe wie ausgezahlte Verkäufe; Stornos und Rückgaben können die Zahl noch senken.',
  };
}

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

// ── Kanäle: erst das Abgerufene, dann die Handpflege ──────────────────────
//
// `scripts/kanaele.mjs` liest, was öffentlich zu lesen ist — TikTok, Pinterest,
// YouTube, Bluesky. Diese Zahlen haben Vorrang vor allem, was in
// `cockpit-basis.json` steht: Der Abruf lief heute, die Handpflege irgendwann.
// Instagram und Facebook geben ohne Anmeldung nichts heraus und bleiben, wie
// sie eingetragen wurden — sichtbar an `quelle: "Handpflege"`.
const abruf = lies(join(wurzel, 'daten', 'kanaele-abruf.json'));
if (!abruf) fehlt('Kanalabruf', 'daten/kanaele-abruf.json fehlt — läuft scripts/kanaele.mjs im Stundenlauf?');
for (const f of abruf?.fehler ?? []) fehlt('Kanalabruf', f);

const kanaele = basis.kanaele.map((k) => {
  const a = abruf?.kanaele?.[k.name];
  if (!a || typeof a.follower !== 'number') {
    return { ...k, quelle: 'Handpflege' };
  }
  return {
    ...k,
    follower: a.follower,
    reaktionen: a.reaktionen ?? k.reaktionen ?? null,
    reaktionenLabel: a.reaktionenLabel ?? k.reaktionenLabel ?? null,
    beitraege: a.beitraege ?? null,
    stand: a.stand,
    quelle: 'abgerufen',
  };
});

// ── Reichweite über alle Kanäle, ohne Schätzung ───────────────────────────
const bekannt = kanaele.filter((k) => typeof k.follower === 'number');
const reichweite = {
  gesamt: bekannt.length ? bekannt.reduce((a, k) => a + k.follower, 0) : null,
  kanaeleGezaehlt: bekannt.length,
  kanaeleGesamt: kanaele.length,
  abgerufen: kanaele.filter((k) => k.quelle === 'abgerufen').length,
};
if (bekannt.length < kanaele.length) {
  const ohne = kanaele.filter((k) => typeof k.follower !== 'number').map((k) => k.name);
  fehlt('Reichweite', `${ohne.join(' und ')} ${ohne.length === 1 ? 'gibt' : 'geben'} ohne Anmeldung keine Followerzahl heraus — die Zahl kommt nur aus der App.`);
}
// Eine Zahl von Hand ist so lange gut, wie sie jung ist. Wird sie alt, sieht
// man ihr das nicht an — sie steht da wie jede andere. Also sagt es das
// Dashboard selbst, statt darauf zu warten, dass es jemandem auffällt.
const alteHand = kanaele.filter((k) => {
  if (k.quelle !== 'Handpflege' || !k.stand) return false;
  return (Date.parse(heute) - Date.parse(k.stand)) / 864e5 >= 14;
});
for (const k of alteHand) {
  fehlt(k.name, `Die Followerzahl steht seit dem ${k.stand} unverändert. ${k.name} gibt sie ohne Anmeldung nicht heraus; sie altert hier, ohne falsch auszusehen.`);
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
  // Der Monatsstand gehört nur dann zu diesem Tag, wenn er auch an diesem Tag
  // abgelesen wurde. Eine gestrige Zahl als heutige zu führen hieße, eine
  // waagerechte Kurve zu zeichnen, wo in Wahrheit niemand nachgesehen hat.
  best: jungerMonat?.d === heute ? jungerMonat.bestellungen : null,
  tant: jungerMonat?.d === heute ? jungerMonat.tantiemen : null,
  dep: technik.deploy ?? null,
};
for (const k of kanaele) {
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
for (const k of kanaele) {
  const p = reihe((t) => t.kanaele?.[k.name]);
  if (p.length) kanalReihen[k.name] = p;
}
const verlauf = {
  tage: letzte.length,
  seit: letzte.length ? letzte[0].d : null,
  rang: reihe((t) => t.rang),
  rezensionen: reihe((t) => t.rez),
  reichweite: reihe((t) => t.gesamt),
  bestellungen: reihe((t) => t.best),
  tantiemen: reihe((t) => t.tant),
  kanaele: kanalReihen,
};

// ── „vorher“ gehört nicht in die Handpflege ───────────────────────────────
//
// Bisher musste jemand den alten Wert von Hand nach `vorher` schieben, bevor er
// den neuen eintrug: zwei Handgriffe für eine Zahl. Wird einer vergessen, zeigt
// das Dashboard einen Pfeil, den es nicht geben dürfte — und niemand merkt es,
// weil er ja plausibel aussieht. Der Vortageswert steht längst im Verlauf.
//
// Solange der Verlauf für einen Kanal noch keinen früheren Tag kennt, bleibt
// der eingetragene Wert stehen; von seinem zweiten Tag an übernimmt die Maschine.
const vortag = (nimm) => {
  for (let i = bisher.length - 1; i >= 0; i--) {
    if (bisher[i].d >= tagesstand.d) continue;
    const v = nimm(bisher[i]);
    if (typeof v === 'number') return { v, d: bisher[i].d };
  }
  return null;
};
for (const k of kanaele) {
  const vor = vortag((t) => t.kanaele?.[k.name]);
  if (vor) { k.vorher = vor.v; k.vergleichVom = vor.d; }
  else k.vergleichVom = null;
}

// ── Was ist heute anders? ─────────────────────────────────────────────────
//
// Die eigentliche Frage an ein Dashboard lautet nicht „wie steht es“, sondern
// „was hat sich seit gestern bewegt“. Alles andere ist Nachschlagen. Verglichen
// wird gegen den jüngsten Tag, der nicht der heutige ist — nicht gegen den
// vorigen Lauf: sonst meldete jede Stunde dieselbe Bewegung noch einmal.
const vorTag = bisher.filter((t) => t.d < tagesstand.d).pop() ?? null;
const aenderungen = [];
const bewegt = (was, alt, neu, kleinerIstBesser, formt) => {
  if (typeof alt !== 'number' || typeof neu !== 'number' || alt === neu) return;
  const f = formt ?? ((v) => String(v));
  const rauf = neu > alt;
  aenderungen.push({
    was,
    von: f(alt),
    nach: f(neu),
    delta: (rauf ? '+' : '−') + f(Math.abs(neu - alt)),
    richtung: (kleinerIstBesser ? !rauf : rauf) ? 'gut' : 'schlecht',
  });
};
if (vorTag) {
  bewegt('Rang', vorTag.rang, tagesstand.rang, true, (v) => '#' + v.toLocaleString('de-DE'));
  bewegt('Rezensionen', vorTag.rez, tagesstand.rez, false);
  bewegt('Follower gesamt', vorTag.gesamt, tagesstand.gesamt, false,
    (v) => v.toLocaleString('de-DE'));
  for (const k of kanaele) {
    bewegt(k.name, vorTag.kanaele?.[k.name], tagesstand.kanaele[k.name], false,
      (v) => v.toLocaleString('de-DE'));
  }
  bewegt('Bestellungen im Monat', vorTag.best, tagesstand.best, false);
  bewegt('Tantiemen im Monat', vorTag.tant, tagesstand.tant, false,
    (v) => v.toFixed(2).replace('.', ',') + ' €');
  if (vorTag.dep && tagesstand.dep && vorTag.dep !== tagesstand.dep) {
    aenderungen.push({
      was: 'Veröffentlichung', von: vorTag.dep, nach: tagesstand.dep, delta: null,
      richtung: tagesstand.dep === 'erfolgreich' ? 'gut' : 'schlecht',
    });
  }
}
const aenderungenStand = {
  seit: vorTag?.d ?? null,
  punkte: aenderungen,
  hinweis: !vorTag
    ? 'Heute steht der erste Tagesstand. Ab morgen steht hier, was sich bewegt hat.'
    : (aenderungen.length ? null : 'Seit dem letzten Stand hat sich keine der gemessenen Zahlen bewegt.'),
};

// ── Die Warnzeile ─────────────────────────────────────────────────────────
//
// Vier Dinge dürfen nicht im Technik-Reiter versauern, weil sie mit jedem Tag
// teurer werden: eine rote Veröffentlichung, ein ablaufendes Zertifikat, tote
// Links und ein Rechnerlauf, der sich nicht mehr meldet. Sie stehen ganz oben
// und in Rot. Was ein Mensch bemerkt hat und keine Maschine messen kann — ein
// falsches Konto im Browser etwa — trägt der Rundlauf in basis.warnungen ein.
const warnungen = [];
const warnen = (stufe, text) => warnungen.push({ stufe, text });
// Eine Handwarnung mit `bis` verschwindet von selbst. Ohne Ablauf bliebe sie
// stehen, bis jemand daran denkt — und eine Warnung, die eine Woche steht,
// wird nicht mehr gelesen, auch die nicht, die daneben neu dazukommt.
for (const wn of basis.warnungen ?? []) {
  if (!wn?.text) continue;
  if (wn.bis && wn.bis < heute) continue;
  warnen(wn.stufe === 'hoch' ? 'hoch' : 'mittel', wn.text);
}
if (technik.deploy && technik.deploy !== 'erfolgreich') {
  warnen('hoch', `Die Veröffentlichung steht auf „${technik.deploy}“ — die Website zeigt noch den Stand davor.`);
}
if (typeof technik.zertifikatTage === 'number' && technik.zertifikatTage < 30) {
  warnen('hoch', `Das Zertifikat läuft in ${technik.zertifikatTage} Tagen ab.`);
}
if (technik.linksKaputt) {
  const erste = technik.linksZiele[0];
  warnen('mittel', `${technik.linksKaputt} tote${technik.linksKaputt === 1 ? 'r' : ''} Link${technik.linksKaputt === 1 ? '' : 's'} auf der Seite${erste ? ` — ${erste.code} auf ${erste.ziel}` : ''}.`);
}
const stundenHer = (iso) => {
  const t = Date.parse(iso ?? '');
  return Number.isFinite(t) ? (Date.now() - t) / 36e5 : null;
};
const laufAlt = stundenHer(technik.stand);
if (laufAlt === null) {
  warnen('mittel', 'Vom stündlichen Rechnerlauf liegt kein Stand vor — läuft die Aufgabe „Trendonix PC“ noch?');
} else if (laufAlt > 6) {
  // In Stufen, nicht auf die Stunde genau: Eine Warnung, die sich stündlich
  // umformuliert, schiebt stündlich eine neue Datei hoch, ohne etwas Neues zu
  // sagen. Was zählt, ist die Größenordnung.
  const wie = laufAlt > 48 ? `seit ${Math.floor(laufAlt / 24)} Tagen`
    : laufAlt > 24 ? 'seit über einem Tag'
      : laufAlt > 12 ? 'seit mehr als zwölf Stunden' : 'seit mehr als sechs Stunden';
  warnen('mittel', `Der stündliche Rechnerlauf hat sich ${wie} nicht gemeldet.`);
}
const letzterKdp = tage.length ? tage[tage.length - 1].d : null;
const tageHer = letzterKdp ? Math.round((Date.parse(heute) - Date.parse(letzterKdp)) / 864e5) : null;
if (tageHer !== null && tageHer >= 2) {
  warnen('mittel', `Seit ${tageHer} Tagen wurde kein KDP-Stand abgelesen — Verkäufe und Rang stehen still.`);
}

// ── Ereignisse, die sich selbst aufschreiben ──────────────────────────────
//
// „Was sich tut“ war bisher vollständig Handarbeit: Jemand musste einen Satz
// tippen, damit im Dashboard steht, was passiert ist. Vier Dinge weiß der Lauf
// aber selbst, und sie sind genau die, die man nicht verpassen will.
//
// Sie werden festgehalten statt jedes Mal neu abgeleitet: Morgen ist der
// Vergleichstag ein anderer, und ein Ereignis, das nur so lange existiert, wie
// es frisch ist, ist keine Chronik, sondern ein Blinken.
const EREIGNISSE = join(wurzel, 'daten', 'cockpit-ereignisse.json');
const ereignisDatei = lies(EREIGNISSE) ?? {
  _hinweis: 'Von scripts/cockpit.mjs selbst erzeugt: neue Rezension, Wechsel der Veröffentlichung, erschienener Journalbeitrag, Bewegung im Monatsstand. Nicht von Hand pflegen — Handgeschriebenes gehört nach cockpit-basis.json unter „aktivitaet".',
  eintraege: [],
};
const ereignisse = ereignisDatei.eintraege ?? [];
const schonDa = new Set(ereignisse.map((e) => e.id));
const jetztIso = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const merken = (id, kanal, text) => {
  if (schonDa.has(id)) return;
  schonDa.add(id);
  ereignisse.push({ id, zeit: jetztIso, kanal, text });
};

if (vorTag) {
  if (typeof tagesstand.rez === 'number' && typeof vorTag.rez === 'number' && tagesstand.rez > vorTag.rez) {
    const mehr = tagesstand.rez - vorTag.rez;
    merken(`rez-${tagesstand.d}-${tagesstand.rez}`, 'Amazon',
      `${mehr === 1 ? 'Eine neue Rezension' : mehr + ' neue Rezensionen'} — jetzt ${tagesstand.rez} insgesamt${buch.rezensionen?.schnitt ? `, Durchschnitt ${String(buch.rezensionen.schnitt).replace('.', ',')}` : ''}.`);
  }
  if (vorTag.dep && tagesstand.dep && vorTag.dep !== tagesstand.dep) {
    merken(`deploy-${tagesstand.d}-${tagesstand.dep}`, 'Technik',
      tagesstand.dep === 'erfolgreich'
        ? 'Die Veröffentlichung steht wieder auf grün.'
        : `Die Veröffentlichung ist auf „${tagesstand.dep}“ gewechselt.`);
  }
  if (typeof tagesstand.best === 'number' && typeof vorTag.best === 'number' && tagesstand.best > vorTag.best) {
    merken(`best-${tagesstand.d}-${tagesstand.best}`, 'Amazon',
      `${tagesstand.best - vorTag.best} Bestellung${tagesstand.best - vorTag.best === 1 ? '' : 'en'} mehr im Monat — jetzt ${tagesstand.best}.`);
  }
}
// Ein Journalbeitrag, dessen Datum heute ist, steht ab heute auf der Website.
for (const m of beitraegeText ? beitraegeText.matchAll(/slug:\s*'([^']+)'[\s\S]{0,400}?datum:\s*'(\d{4}-\d{2}-\d{2})'/g) : []) {
  if (m[2] === heute) merken(`journal-${m[1]}`, 'Website', `Der Journalbeitrag „${m[1]}“ ist heute erschienen.`);
}

// Ein halber Monat genügt; älteres steht ohnehin nicht mehr in der Liste.
const grenze = new Date(Date.now() - 21 * 864e5).toISOString();
ereignisDatei.eintraege = ereignisse.filter((e) => e.zeit >= grenze).slice(-40);
const ereignisseNeu = JSON.stringify(ereignisDatei.eintraege) !== JSON.stringify(lies(EREIGNISSE)?.eintraege ?? []);
if (ereignisseNeu && !nurPruefen) {
  writeFileSync(EREIGNISSE, JSON.stringify(ereignisDatei, null, 2) + '\n', 'utf8');
}

// Handgeschriebenes und Selbstgeschriebenes in einer Liste, neueste zuerst.
const aktivitaet = [...(basis.aktivitaet ?? []), ...ereignisDatei.eintraege]
  .filter((a) => a?.zeit && a?.text)
  .sort((a, b) => (a.zeit < b.zeit ? 1 : -1))
  .slice(0, 14);

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
  warnungen,
  aenderungen: aenderungenStand,
  buch,
  verkaeufe,
  monat,
  besucher: basis.besucher,
  reichweite,
  verlauf,
  termine,
  bericht,
  kosten,
  kanaele,
  vorschlaege: basis.vorschlaege,
  aktivitaet,
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
console.log(`Cockpit geschrieben: ${tage.length} Tage Verkäufe, ${bekannt.length}/${basis.kanaele.length} Kanäle mit Zahl, ${warnungen.length} Warnung(en), ${aenderungen.length} Änderung(en), ${luecken.length} Lücke(n), Verlauf ${bisher.length} Tag(e)${verlaufNeu ? ' (neu)' : ''}.`);
