/**
 * Der Plan hört nicht mehr auf.
 *
 * `plan.json` reichte bis zum 04.09. und dann nicht weiter. Ein Plan mit
 * Enddatum ist kein Plan, sondern ein Countdown: Am letzten Tag steht alles
 * still, und es fällt erst auf, wenn schon zwei Tage nichts passiert ist.
 *
 * Dieses Skript hält drei Dinge in Ordnung, einmal je Stundenlauf:
 *
 *   1. **Vorne aufräumen.** Was vorbei und erledigt ist, verschwindet aus der
 *      Anzeige. Was vorbei und *nicht* erledigt ist, verschwindet nicht — es
 *      wird nachgeholt.
 *   2. **Nachholen zu anderer Zeit.** Ein Beitrag, der um 15:30 nicht
 *      hinausging, wird nicht wieder auf 15:30 gelegt. Beim ersten Mal 11:00,
 *      dann 18:30, dann 09:30. Wer denselben Zeitpunkt viermal probiert,
 *      probiert nicht, sondern wartet.
 *   3. **Hinten anbauen.** Es stehen immer vierzehn Tage im Voraus da. Jeder
 *      Tag, der vergeht, hängt hinten einen neuen an — deshalb endlos, ohne
 *      dass die Datei ins Kraut schießt.
 *
 * **Was es nicht tut: sich Beiträge ausdenken.** Geplant wird nur, wofür eine
 * Datei existiert. Ist der Vorrat durch, fängt die Rotation von vorn an — mit
 * Sperrfrist, damit derselbe Clip nicht binnen eines Monats zweimal läuft, und
 * sichtbar als `wiederholung`, damit der Rundlauf einen neuen Text dazu
 * schreibt statt denselben. Reicht auch das nicht, sagt es das laut, statt
 * leere Tage zu planen.
 *
 * Beim Bandwechsel zieht der Vorrat mit: Sobald ein anderer Band auf
 * 'erschienen' steht, wird aus dessen Ordner geplant.
 *
 *   node scripts/termine.mjs           schreibt plan.json
 *   node scripts/termine.mjs --zeigen  schreibt nichts, meldet nur
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const nurZeigen = process.argv.includes('--zeigen');

const HORIZONT = 14;      // so viele Tage stehen immer im Voraus
const SPERRE = 30;        // so viele Tage Abstand, bevor ein Clip wiederholt wird
const STANDARDZEIT = '15:30';
// Andere Zeit heißt andere Zeit. Die Reihenfolge ist die der Versuche.
const NACHHOLZEITEN = ['11:00', '18:30', '09:30', '20:15'];
const MAX_VERSUCHE = NACHHOLZEITEN.length;
const VIDEOKANAELE = [['tiktok', 'tt'], ['instagram', 'ig'], ['facebook', 'fb']];
const WOCHENTAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const ORTE = [
  process.env.COCKPIT_AUTOPILOT,
  'C:/Users/manue/Desktop/Buch/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT',
  join(process.env.HOME ?? '', 'mnt/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT'),
  join(process.env.HOME ?? '', 'mnt/AUTOPILOT'),
].filter(Boolean);
const autopilot = ORTE.find((o) => existsSync(join(o, 'plan.json'))) ?? ORTE.find((o) => existsSync(o));
if (!autopilot) { console.log('Termine: AUTOPILOT-Ordner nicht gefunden.'); process.exit(0); }

const PLAN = join(autopilot, 'plan.json');
const lies = (p) => { try { return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
const plan = lies(PLAN);
if (!plan?.tage) { console.log('Termine: plan.json fehlt oder ist kein gültiger Plan.'); process.exit(0); }

// ── Die Uhr geht nach Berlin ──────────────────────────────────────────────
//
// Auf dem Rechner stimmt die Zeitzone, in der Linux-Umgebung des Rundlaufs
// nicht — dort läuft alles auf UTC. Ein Plan, der zwischen Mitternacht und
// zwei Uhr den Vortag für heute hält, verschiebt Beiträge, die noch gar nicht
// fällig waren.
const berlin = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).format(d).replace(' ', 'T');
const jetzt = berlin();
const heute = jetzt.slice(0, 10);
const tagPlus = (iso, n) => berlin(new Date(Date.parse(iso + 'T12:00:00Z') + n * 864e5)).slice(0, 10);
const wochentagVon = (iso) => WOCHENTAG[new Date(iso + 'T12:00:00Z').getUTCDay()];

// ── Welcher Band ist öffentlich? ──────────────────────────────────────────
let band = null;
for (const nr of [1, 2, 3]) {
  const t = (() => { try { return readFileSync(join(wurzel, 'src', 'data', `band-${nr}`, 'band.ts'), 'utf8'); } catch { return ''; } })();
  if (/status:\s*'erschienen'/.test(t)) band = nr;
}
// Der Vorrat des Bandes liegt in dessen eigenen Ordnern. Für Band 1 sind das
// die im AUTOPILOT; ein späterer Band bringt seine eigenen mit.
const vorratOrdner = (kuerzel) => band === 1
  ? join(autopilot, kuerzel)
  : join(autopilot, `BAND${band}`, kuerzel);

const clips = (kuerzel) => {
  try {
    return readdirSync(vorratOrdner(kuerzel))
      .filter((f) => f.toLowerCase().endsWith('.mp4'))
      .map((f) => f.replace(/\.mp4$/i, ''))
      .sort();
  } catch { return []; }
};

// Geplant wird nur, was auf ALLEN drei Videokanälen liegt: Ein Tag, an dem
// zwei Kanäle etwas haben und einer ins Leere greift, ist kein geplanter Tag.
const vorrat = VIDEOKANAELE
  .map(([, k]) => new Set(clips(k)))
  .reduce((a, b) => new Set([...a].filter((x) => b.has(x))));

const meldungen = [];
let geaendert = false;
let geaendertVerfall = false;

// ── 1. Überfälliges einsammeln ────────────────────────────────────────────
//
// Überfällig heißt: Zeitpunkt vorbei, `erledigt` nicht gesetzt, und noch nicht
// weitergeschoben. Pinterest hat keine Uhrzeit — dort zählt der ganze Tag.
plan.nachholen = Array.isArray(plan.nachholen) ? plan.nachholen : [];
const offeneNachholer = (kanal, datum) => plan.nachholen
  .filter((n) => n.kanal === kanal && n.datum === datum && !n.erledigt).length;

const ueberfaellig = [];
for (const tag of plan.tage) {
  if (!tag?.datum || tag.datum > heute) continue;
  for (const [kanal] of [...VIDEOKANAELE, ['pinterest']]) {
    const e = tag[kanal];
    if (!e || e.erledigt === true || e.verschobenNach || e.verfallen) continue;
    // `schon_geplant` heißt: Der Beitrag liegt in der Warteschlange der
    // Plattform selbst. Ob er hinausging, weiß dieser Plan nicht — und genau
    // deshalb wird er NICHT nachgeholt. Ein Doppelpost desselben Clips ist
    // teurer als ein verpasster: Er sieht nach Maschine aus, und TikTok
    // drosselt Wiederholungen.
    if (e.schon_geplant === true) continue;
    const wann = e.uhrzeit ? `${tag.datum}T${e.uhrzeit}` : `${tag.datum}T23:59`;
    if (wann >= jetzt) continue;
    // Älteres als eine Woche wird nicht nachgeholt. Der Vorrat läuft ohnehin
    // in Rotation: Der Clip kommt von selbst wieder dran, und eine Liste, die
    // zwei Wochen Rückstand mitschleppt, arbeitet niemand ab.
    const tageHer = (Date.parse(heute) - Date.parse(tag.datum)) / 864e5;
    if (tageHer > 7) {
      e.verfallen = true;
      geaendertVerfall = true;
      continue;
    }
    ueberfaellig.push({ tag, kanal, eintrag: e });
  }
}

for (const { tag, kanal, eintrag } of ueberfaellig) {
  const versuche = (eintrag.verschoben ?? 0) + 1;
  if (versuche > MAX_VERSUCHE) {
    // Vier vergebliche Anläufe sind kein Zeitproblem mehr. Weiterschieben
    // würde den Punkt nur unsichtbar halten; er gehört sichtbar stehen.
    if (!eintrag.haengt) {
      eintrag.haengt = true;
      geaendert = true;
      meldungen.push(`${kanal} ${tag.beitrag ?? ''} vom ${tag.datum} hängt nach ${MAX_VERSUCHE} Versuchen`);
    }
    continue;
  }
  const zeit = NACHHOLZEITEN[versuche - 1];
  // Der nächste Tag, an dem dieser Kanal höchstens einen offenen Punkt hat.
  // Zwei Beiträge je Kanal und Tag erlaubt KANAELE.md, drei nicht.
  let ziel = tagPlus(heute, 1);
  for (let i = 0; i < 30; i++) {
    if (offeneNachholer(kanal, ziel) < 1) break;
    ziel = tagPlus(ziel, 1);
  }
  plan.nachholen.push({
    kanal,
    beitrag: tag.beitrag ?? null,
    urspruenglich: eintrag.urspruenglich ?? tag.datum,
    datum: ziel,
    uhrzeit: zeit,
    verschoben: versuche,
    // Der Plan weiß nicht sicher, ob am Ursprungstag doch etwas hinausging —
    // vielleicht hat Manuel von Hand gepostet und es nur nicht eingetragen.
    // Deshalb: erst im Kanal nachsehen, dann posten. Steht der Clip schon da,
    // wird abgehakt statt veröffentlicht.
    pruefenVorPosten: true,
    hinweis: 'Vor dem Posten im Kanal nachsehen, ob der Clip doch schon draußen ist.',
  });
  eintrag.verschobenNach = ziel;
  eintrag.verschoben = versuche;
  geaendert = true;
  meldungen.push(`${kanal} ${tag.beitrag ?? ''} → ${ziel} um ${zeit} (Versuch ${versuche + 1})`);
}

// Nachholer, die selbst überfällig geworden sind, wandern weiter — nach
// denselben Regeln, bis die Versuche aufgebraucht sind.
for (const n of plan.nachholen) {
  if (n.erledigt || n.haengt) continue;
  if (`${n.datum}T${n.uhrzeit}` >= jetzt) continue;
  const versuche = (n.verschoben ?? 1) + 1;
  if (versuche > MAX_VERSUCHE) {
    n.haengt = true;
    geaendert = true;
    meldungen.push(`${n.kanal} ${n.beitrag ?? ''} hängt nach ${MAX_VERSUCHE} Versuchen`);
    continue;
  }
  n.uhrzeit = NACHHOLZEITEN[versuche - 1];
  let ziel = tagPlus(heute, 1);
  for (let i = 0; i < 30; i++) {
    if (offeneNachholer(n.kanal, ziel) < 1) break;
    ziel = tagPlus(ziel, 1);
  }
  n.datum = ziel;
  n.verschoben = versuche;
  geaendert = true;
  meldungen.push(`${n.kanal} ${n.beitrag ?? ''} → ${ziel} um ${n.uhrzeit} (Versuch ${versuche + 1})`);
}

// ── 2. Hinten anbauen, bis der Horizont wieder steht ──────────────────────
const zuletztBenutzt = new Map();
for (const tag of plan.tage) {
  if (!tag?.beitrag || !tag.datum) continue;
  const bisher = zuletztBenutzt.get(tag.beitrag);
  if (!bisher || tag.datum > bisher) zuletztBenutzt.set(tag.beitrag, tag.datum);
}

const naechsterBeitrag = (fuerDatum) => {
  if (!vorrat.size) return null;
  // Wer noch nie dran war, kommt zuerst. Danach der, dessen letzter Auftritt
  // am längsten her ist.
  const kandidaten = [...vorrat].sort((a, b) => {
    const av = zuletztBenutzt.get(a) ?? '';
    const bv = zuletztBenutzt.get(b) ?? '';
    return av < bv ? -1 : av > bv ? 1 : (a < b ? -1 : 1);
  });
  const frisch = kandidaten.find((c) => {
    const v = zuletztBenutzt.get(c);
    return !v || (Date.parse(fuerDatum) - Date.parse(v)) / 864e5 >= SPERRE;
  });
  return { name: frisch ?? kandidaten[0], wiederholung: !frisch };
};

const letzterTag = plan.tage.reduce((m, t) => (t?.datum && t.datum > m ? t.datum : m), heute);
const bisWann = tagPlus(heute, HORIZONT);
let neueTage = 0;
let wiederholungAb = null;

if (!band) {
  meldungen.push('Kein Band steht auf „erschienen" — es wird nichts geplant.');
} else if (!vorrat.size) {
  meldungen.push(`Band ${band} ist öffentlich, aber für ihn liegen keine Clips auf allen drei Kanälen. Es wird nichts angebaut.`);
} else {
  let d = letzterTag;
  while (d < bisWann) {
    d = tagPlus(d, 1);
    if (plan.tage.some((t) => t.datum === d)) continue;
    const wahl = naechsterBeitrag(d);
    if (!wahl) break;
    if (wahl.wiederholung && !wiederholungAb) wiederholungAb = d;
    const neu = {
      tag: (plan.tage.at(-1)?.tag ?? 0) + 1,
      datum: d,
      wochentag: wochentagVon(d),
      beitrag: wahl.name,
      angelegt: 'termine.mjs',
    };
    if (wahl.wiederholung) neu.wiederholung = true;
    for (const [kanal] of VIDEOKANAELE) neu[kanal] = { uhrzeit: STANDARDZEIT };
    neu.pinterest = { max_pins: 5, quelle: 'zuerst Pin-Entwuerfe, dann neue Pins', erledigt: false, hinweis: '' };
    plan.tage.push(neu);
    zuletztBenutzt.set(wahl.name, d);
    neueTage++;
    geaendert = true;
  }
}

// ── 3. Der Vorrat, ehrlich gerechnet ──────────────────────────────────────
//
// Fünfzehn Clips bei einem Beitrag am Tag heißt: Nach fünfzehn Tagen fängt
// alles von vorn an. Die Sperrfrist von dreißig Tagen lässt sich damit gar
// nicht einhalten — nicht weil die Rotation schlecht wäre, sondern weil der
// Vorrat für diese Taktzahl zu klein ist. Das ist keine Störung, die man
// wegprogrammiert; es ist eine Auskunft, die jemand haben will.
const ersteWiederholung = plan.tage
  .filter((t) => t.datum >= heute && t.wiederholung)
  .map((t) => t.datum).sort()[0] ?? null;
const vorratStand = {
  band,
  clips: vorrat.size,
  reichtTage: vorrat.size,
  sperreTage: SPERRE,
  wiederholungAb: ersteWiederholung,
  reichtFuerSperre: vorrat.size >= SPERRE,
};
if (JSON.stringify(plan.vorrat) !== JSON.stringify(vorratStand)) {
  plan.vorrat = vorratStand;
  geaendert = true;
}

// ── 4. Melden ─────────────────────────────────────────────────────────────
const offen = plan.tage.filter((t) => t.datum >= heute).length;
const zeile = [
  `Band ${band ?? '—'}`,
  `${vorrat.size} Clips im Vorrat`,
  `${offen} Tage im Plan`,
  neueTage ? `${neueTage} neu angebaut` : null,
  plan.nachholen.filter((n) => !n.erledigt && !n.haengt).length
    ? `${plan.nachholen.filter((n) => !n.erledigt && !n.haengt).length} nachzuholen` : null,
  plan.nachholen.filter((n) => n.haengt).length
    ? `${plan.nachholen.filter((n) => n.haengt).length} hängt` : null,
  wiederholungAb ? `Wiederholungen ab ${wiederholungAb}` : null,
].filter(Boolean).join(', ');

if (nurZeigen) {
  console.log('Termine: ' + zeile);
  for (const m of meldungen) console.log('   · ' + m);
  process.exit(0);
}
if (!geaendert && !geaendertVerfall) { console.log('Termine: unverändert (' + zeile + ').'); process.exit(0); }

plan.tage.sort((a, b) => (a.datum < b.datum ? -1 : 1));
writeFileSync(PLAN, JSON.stringify(plan, null, 1) + '\n', 'utf8');
console.log('Termine: ' + zeile);
for (const m of meldungen) console.log('   · ' + m);
