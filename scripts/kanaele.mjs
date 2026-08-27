/**
 * Kanalzahlen holen, ohne sich irgendwo anzumelden.
 *
 * Bis heute standen Follower und Reaktionen in `daten/cockpit-basis.json` und
 * wurden von Hand nachgetragen — bei jeder Zahl ein Blick in eine App, ein
 * Abtippen, ein Datum. Das hält niemand durch, und was niemand durchhält,
 * steht nach drei Tagen falsch da.
 *
 * Vier der sechs Kanäle geben ihre Zahlen öffentlich heraus:
 *
 *   TikTok     im Zustandsobjekt der Profilseite ("followerCount")
 *   Pinterest  ebenso ("follower_count", "pin_count")
 *   YouTube    als Text auf der Kanalseite ("10 Abonnenten")
 *   Bluesky    über die offene XRPC-Schnittstelle, ohne Schlüssel
 *
 * Instagram und Facebook nicht: Beide liefern angemeldeten Browsern etwas
 * anderes als allen übrigen, und in dem, was hier ankommt, steht die Zahl
 * schlicht nicht. Sie bleiben Handarbeit — und das Dashboard sagt das auch.
 *
 * Die Regel des Hauses gilt hier besonders streng: **Was nicht gelesen wurde,
 * wird nicht geschrieben.** Schlägt ein Abruf fehl, bleibt der letzte
 * erfolgreiche Wert mit *seinem* Datum stehen; er altert dann sichtbar, statt
 * sich als frisch auszugeben. Ein stiller Rückfall auf gestern wäre der eine
 * Fehler, den man in einem Dashboard nie bemerkt.
 *
 *   node scripts/kanaele.mjs          schreibt daten/kanaele-abruf.json
 *   node scripts/kanaele.mjs --zeigen schreibt nichts, meldet nur
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(wurzel, 'daten', 'kanaele-abruf.json');
const nurZeigen = process.argv.includes('--zeigen');

// Ohne Browserkennung antworten TikTok und Pinterest mit einer Sparfassung,
// in der die Zahlen fehlen. Das ist keine Umgehung einer Sperre: Die Seiten
// sind öffentlich, es geht nur darum, dieselbe Fassung zu bekommen wie jeder
// Besucher.
const KENNUNG = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

const hol = async (url, kopf = {}) => {
  const a = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': KENNUNG, 'accept-language': 'de-DE,de;q=0.9', ...kopf },
  });
  if (!a.ok) throw new Error('HTTP ' + a.status);
  return a.text();
};

/**
 * Eine Zahl nur dann glauben, wenn sie eindeutig ist.
 *
 * Steht dasselbe Feld mehrfach in der Seite und widersprechen sich die Werte,
 * ist unklar, welches Objekt gemeint war — dann lieber nichts. Gleiche Werte
 * mehrfach sind dagegen eine Bestätigung, kein Widerspruch.
 */
const eindeutig = (text, feld) => {
  const alle = [...text.matchAll(new RegExp('"' + feld + '":\\s*(\\d+)', 'g'))].map((m) => Number(m[1]));
  if (!alle.length) return null;
  const verschieden = new Set(alle);
  return verschieden.size === 1 ? alle[0] : null;
};

const QUELLEN = [
  {
    name: 'TikTok',
    async lies() {
      const s = await hol('https://www.tiktok.com/@trendonix');
      // Auf der falschen Profilseite zu landen wäre der teuerste Fehler hier:
      // Die Zahlen sähen richtig aus und wären es nicht.
      const wer = s.match(/"uniqueId":"([^"]+)"/)?.[1];
      if (wer !== 'trendonix') throw new Error('fremdes Profil: ' + (wer ?? 'unbekannt'));
      const follower = eindeutig(s, 'followerCount');
      if (follower === null) throw new Error('followerCount nicht eindeutig');
      return {
        follower,
        reaktionen: eindeutig(s, 'heartCount'),
        reaktionenLabel: 'Likes',
        beitraege: eindeutig(s, 'videoCount'),
      };
    },
  },
  {
    name: 'Pinterest',
    async lies() {
      const s = await hol('https://de.pinterest.com/trendonixbuecher/');
      const wer = s.match(/"username":\s*"([^"]+)"/)?.[1];
      if (wer !== 'trendonixbuecher') throw new Error('fremdes Profil: ' + (wer ?? 'unbekannt'));
      const follower = eindeutig(s, 'follower_count');
      if (follower === null) throw new Error('follower_count nicht eindeutig');
      return { follower, beitraege: eindeutig(s, 'pin_count') };
    },
  },
  {
    name: 'YouTube',
    async lies() {
      const s = await hol('https://www.youtube.com/@Trendonixde');
      // YouTube rundet ab tausend Abonnenten ("1,2 Tsd."). Solange dort eine
      // glatte Zahl steht, ist sie genau; sobald nicht, wird nichts geraten.
      const roh = [...s.matchAll(/"(\d[\d.]*) Abonnenten"/g)].map((m) => m[1]);
      if (!roh.length) throw new Error('Abonnentenzahl nicht gefunden');
      const verschieden = new Set(roh);
      if (verschieden.size !== 1) throw new Error('Abonnentenzahl nicht eindeutig');
      return { follower: Number(roh[0].replace(/\./g, '')) };
    },
  },
  {
    name: 'Bluesky',
    async lies() {
      const s = await hol(
        'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=trendonix-buecher.bsky.social',
        { accept: 'application/json' },
      );
      const j = JSON.parse(s);
      if (j.handle !== 'trendonix-buecher.bsky.social') throw new Error('fremdes Profil: ' + j.handle);
      return {
        follower: j.followersCount ?? null,
        beitraege: j.postsCount ?? null,
      };
    },
  },
];

const jetzt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const heute = jetzt.slice(0, 10);

let alt = { kanaele: {} };
try { alt = JSON.parse(readFileSync(ZIEL, 'utf8').replace(/^﻿/, '')); } catch { /* erster Lauf */ }

const kanaele = {};
const fehler = [];

// Nacheinander, nicht gleichzeitig: vier Abrufe in einer Sekunde von derselben
// Adresse sehen nach Werkzeug aus. Der Lauf hat eine Stunde Zeit.
for (const q of QUELLEN) {
  try {
    const wert = await q.lies();
    kanaele[q.name] = { ...wert, stand: heute, gelesenAm: jetzt };
  } catch (e) {
    const vorher = alt.kanaele?.[q.name];
    fehler.push(`${q.name}: ${e.message}`);
    // Der letzte gelesene Wert bleibt — mit seinem eigenen Datum, damit im
    // Dashboard zu sehen ist, wie alt er ist.
    if (vorher) kanaele[q.name] = vorher;
  }
}

const raus = {
  _hinweis: 'Von scripts/kanaele.mjs abgerufen, nicht von Hand pflegen. Instagram und Facebook stehen hier nicht: Beide geben ihre Zahlen ohne Anmeldung nicht heraus.',
  stand: jetzt,
  kanaele,
  fehler,
};

const zeile = Object.entries(kanaele)
  .map(([n, k]) => `${n} ${k.follower ?? '—'}${k.stand !== heute ? ' (vom ' + k.stand + ')' : ''}`)
  .join(', ');

if (nurZeigen) {
  console.log(zeile + (fehler.length ? ' | Fehler: ' + fehler.join('; ') : ''));
  process.exit(0);
}

// Nur schreiben, wenn sich etwas geändert hat: Sonst hinge an jedem Stundenlauf
// ein Commit, der nichts sagt außer "eine Stunde später".
const ohneZeit = (o) => JSON.stringify(o, (k, v) => (k === 'stand' || k === 'gelesenAm' ? undefined : v));
let gleich = false;
try { gleich = ohneZeit(JSON.parse(readFileSync(ZIEL, 'utf8'))) === ohneZeit(raus); } catch { /* neu */ }
if (gleich) {
  console.log('Kanäle: unverändert (' + zeile + ').');
  process.exit(0);
}
writeFileSync(ZIEL, JSON.stringify(raus, null, 2) + '\n', 'utf8');
console.log('Kanäle abgerufen: ' + zeile + (fehler.length ? ' | Fehler: ' + fehler.join('; ') : ''));
