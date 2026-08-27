/**
 * Die Zahlen aus der Google-Suche holen, ohne dass jemand hinsieht.
 *
 * Klicks, Impressionen, Position und die häufigsten Suchanfragen standen bis
 * heute nur in der Search Console — eine Website, in die sich täglich ein
 * Mensch einloggen musste, um vier Zahlen abzuschreiben. Das ist der letzte
 * Handgriff im Dashboard, der sich abschaffen lässt.
 *
 * Angemeldet wird sich mit einem **Dienstkonto**: Google gibt dafür eine
 * Schlüsseldatei aus, das Skript unterschreibt damit eine kurzlebige
 * Bescheinigung (JWT) und tauscht sie gegen ein Zugriffsmerkmal, das eine
 * Stunde gilt. Kein Passwort, kein Anmeldefenster, nichts, was jemand
 * eintippen müsste — und nichts, was in diesem Repository liegt.
 *
 * **Die Schlüsseldatei gehört nicht ins Repository.** Sie liegt im
 * AUTOPILOT-Ordner neben den anderen Zugängen. Wer sie hat, kann die
 * Suchdaten dieser Website lesen; mehr nicht, weil das Dienstkonto in der
 * Search Console nur Leserechte bekommt. Trotzdem: nicht committen, nicht
 * verschicken, nicht in einen Chat kopieren.
 *
 *   node scripts/suche-abruf.mjs          schreibt daten/suche-abruf.json
 *   node scripts/suche-abruf.mjs --zeigen schreibt nichts, meldet nur
 *
 * Wo der Schlüssel liegt, sagt GOOGLE_DIENSTKONTO; ohne die Variable werden
 * die bekannten Orte probiert.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSign } from 'node:crypto';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(wurzel, 'daten', 'suche-abruf.json');
const nurZeigen = process.argv.includes('--zeigen');

const SEITE = 'https://www.trendonix-buecher.de/';
const BEREICH = 'https://www.googleapis.com/auth/webmasters.readonly';

const ORTE = [
  process.env.GOOGLE_DIENSTKONTO,
  'C:/Users/manue/Desktop/Buch/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT/REGISTRIERUNG/google-dienstkonto.json',
  join(process.env.HOME ?? '', 'mnt/Die unsichtbare Fäden/Band 1/05_Marketing/05_Social_Kampagne/AUTOPILOT/REGISTRIERUNG/google-dienstkonto.json'),
  join(process.env.HOME ?? '', 'mnt/AUTOPILOT/REGISTRIERUNG/google-dienstkonto.json'),
].filter(Boolean);

const schluesselPfad = ORTE.find((o) => existsSync(o)) ?? null;

/** Ohne Schlüssel ist das kein Fehler, sondern ein Zustand: noch nicht eingerichtet. */
const ohneSchluessel = (grund) => {
  const raus = {
    _hinweis: 'Von scripts/suche-abruf.mjs geholt. Nicht von Hand pflegen.',
    stand: null,
    eingerichtet: false,
    hinweis: grund,
    klicks: null, impressionen: null, position: null,
    von: null, bis: null, tage: 0, suchanfragen: [],
  };
  if (nurZeigen) { console.log('Suche: ' + grund); process.exit(0); }
  const alt = (() => { try { return readFileSync(ZIEL, 'utf8'); } catch { return null; } })();
  const text = JSON.stringify(raus, null, 2) + '\n';
  if (alt !== text) writeFileSync(ZIEL, text, 'utf8');
  console.log('Suche: ' + grund);
  process.exit(0);
};

if (!schluesselPfad) {
  ohneSchluessel('Die Suchzahlen kommen, sobald das Google-Dienstkonto eingerichtet ist — zehn Minuten, kostenlos. Anleitung: AUTOPILOT/REGISTRIERUNG/10_google-dienstkonto.md.');
}

let konto;
try {
  konto = JSON.parse(readFileSync(schluesselPfad, 'utf8').replace(/^\uFEFF/, ''));
} catch (e) {
  ohneSchluessel('Die Schlüsseldatei ließ sich nicht lesen: ' + e.message);
}
if (!konto.client_email || !konto.private_key) {
  ohneSchluessel('Die Schlüsseldatei enthält kein Dienstkonto (client_email und private_key fehlen).');
}

// ── Anmelden: eine selbst unterschriebene Bescheinigung gegen ein Merkmal ──
//
// Das ginge auch mit einem fertigen Paket. Es sind aber dreißig Zeilen, und
// jede Abhängigkeit, die hier stünde, müsste auf dem Rechner installiert sein,
// bevor der Stundenlauf zum ersten Mal läuft. Node bringt alles mit.
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o))
  .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function merkmalHolen() {
  const jetzt = Math.floor(Date.now() / 1000);
  const kopf = b64({ alg: 'RS256', typ: 'JWT' });
  const rumpf = b64({
    iss: konto.client_email,
    scope: BEREICH,
    aud: 'https://oauth2.googleapis.com/token',
    iat: jetzt,
    exp: jetzt + 3600,
  });
  const sig = createSign('RSA-SHA256').update(`${kopf}.${rumpf}`).end()
    .sign(konto.private_key, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const a = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${kopf}.${rumpf}.${sig}`,
    }),
  });
  const j = await a.json();
  // Googles Fehlertexte hier sind knapp und trotzdem eindeutig — sie stehen
  // deshalb im Klartext im Dashboard, statt zu einem "ging nicht" zu werden.
  if (!a.ok || !j.access_token) {
    throw new Error(`Anmeldung abgelehnt (${a.status}): ${j.error_description ?? j.error ?? 'unbekannt'}`);
  }
  return j.access_token;
}

async function fragen(merkmal, koerper) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SEITE)}/searchAnalytics/query`;
  const a = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(25000),
    headers: { authorization: 'Bearer ' + merkmal, 'content-type': 'application/json' },
    body: JSON.stringify(koerper),
  });
  const j = await a.json();
  if (!a.ok) {
    const m = j.error?.message ?? 'unbekannt';
    if (a.status === 403) {
      throw new Error(`Kein Zugriff auf die Property: ${m} — steht ${konto.client_email} in der Search Console unter „Nutzer und Berechtigungen“?`);
    }
    throw new Error(`Abfrage abgelehnt (${a.status}): ${m}`);
  }
  return j.rows ?? [];
}

const tagVor = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

let raus;
try {
  const merkmal = await merkmalHolen();

  // Nach Tagen fragen, nicht nach einer Summe.
  //
  // Google liefert die letzten zwei bis drei Tage noch nicht. Eine Abfrage über
  // „die letzten sieben Tage“ ergäbe deshalb je nach Tageszeit vier, fünf oder
  // sieben gemessene Tage — und immer stünde „7 Tage“ darunter. Mit den
  // Tageszeilen weiß das Dashboard, welche Spanne es wirklich zeigt.
  const tage = await fragen(merkmal, {
    startDate: tagVor(16), endDate: tagVor(1),
    dimensions: ['date'], rowLimit: 20,
  });
  const letzte = tage
    .filter((r) => (r.impressions ?? 0) > 0 || (r.clicks ?? 0) > 0)
    .sort((a, b) => (a.keys[0] < b.keys[0] ? -1 : 1))
    .slice(-7);

  const klicks = letzte.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const impressionen = letzte.reduce((s, r) => s + (r.impressions ?? 0), 0);
  // Die Position ist ein nach Impressionen gewichteter Mittelwert. Die sieben
  // Tageswerte einfach zu mitteln wäre bequem und falsch: Ein Tag mit drei
  // Impressionen zählte dann so viel wie einer mit dreihundert.
  const position = impressionen
    ? letzte.reduce((s, r) => s + (r.position ?? 0) * (r.impressions ?? 0), 0) / impressionen
    : null;

  let suchanfragen = [];
  if (letzte.length) {
    const zeilen = await fragen(merkmal, {
      startDate: letzte[0].keys[0], endDate: letzte[letzte.length - 1].keys[0],
      dimensions: ['query'], rowLimit: 5,
    });
    suchanfragen = zeilen.map((r) => ({
      wort: r.keys[0],
      klicks: r.clicks ?? 0,
      impressionen: r.impressions ?? 0,
    }));
  }

  raus = {
    _hinweis: 'Von scripts/suche-abruf.mjs aus der Search Console geholt. Nicht von Hand pflegen.',
    stand: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    eingerichtet: true,
    hinweis: letzte.length
      ? null
      : 'Verbindung steht, aber Google hat für diese Property noch keine Suchdaten. Neue Properties brauchen dafür einige Tage.',
    klicks: letzte.length ? klicks : null,
    impressionen: letzte.length ? impressionen : null,
    position: position === null ? null : Math.round(position * 10) / 10,
    von: letzte.length ? letzte[0].keys[0] : null,
    bis: letzte.length ? letzte[letzte.length - 1].keys[0] : null,
    tage: letzte.length,
    suchanfragen,
  };
} catch (e) {
  // Ein abgelaufener Schlüssel oder eine zurückgenommene Berechtigung darf
  // nicht dazu führen, dass gestrige Zahlen als heutige weiterlaufen.
  raus = {
    _hinweis: 'Von scripts/suche-abruf.mjs geholt. Nicht von Hand pflegen.',
    stand: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    eingerichtet: true,
    hinweis: e.message,
    klicks: null, impressionen: null, position: null,
    von: null, bis: null, tage: 0, suchanfragen: [],
  };
}

const zeile = raus.klicks === null
  ? (raus.hinweis ?? 'keine Daten')
  : `${raus.klicks} Klicks, ${raus.impressionen} Impressionen, Position ${String(raus.position).replace('.', ',')} (${raus.tage} Tage bis ${raus.bis})`;

if (nurZeigen) { console.log('Suche: ' + zeile); process.exit(0); }

const ohneZeit = (o) => JSON.stringify(o, (k, v) => (k === 'stand' ? undefined : v));
let gleich = false;
try { gleich = ohneZeit(JSON.parse(readFileSync(ZIEL, 'utf8'))) === ohneZeit(raus); } catch { /* neu */ }
if (gleich) { console.log('Suche: unverändert (' + zeile + ').'); process.exit(0); }
writeFileSync(ZIEL, JSON.stringify(raus, null, 2) + '\n', 'utf8');
console.log('Suche: ' + zeile);
