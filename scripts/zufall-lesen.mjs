/**
 * Der Feed von „Alles nur Zufall?“ als Daten — und nur der Feed.
 *
 *   pdftotext -layout -enc UTF-8 <Druck_Innenteil.pdf> zufall-innen.txt
 *   node scripts/zufall-lesen.mjs <zufall-innen.txt>
 *
 * Schreibt `src/data/zufall/feed.ts`: zu jedem der vierzig Kapitel den
 * Beitrag, mit dem es aufmacht — @-Konto, Bildunterschrift, Hashtags, die drei
 * Zahlen am Rand — und die zweite Leseordnung, die das Buch selbst angibt.
 *
 * WAS DIESES SKRIPT NICHT LIEST, UND ZWAR ABSICHTLICH:
 * den Kapiteltext, die Kommentarspalte, den Nachtrag, den Steckbrief. Das ist
 * das Buch. Eine Welt, die es mitliefert, wirbt nicht für den Band, sie
 * ersetzt ihn. Wer hier etwas hinzufügen will, soll vorher diesen Absatz
 * lesen: Die Behauptung gehört ins Netz, die Auflösung ins Buch.
 *
 * Der Textlayer selbst bleibt draußen — er liegt neben dem Repository, nicht
 * darin, und wird nach dem Lauf gelöscht.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const quelle = process.argv[2];
if (!quelle) { console.error('Aufruf: node scripts/zufall-lesen.mjs <zufall-innen.txt>'); process.exit(1); }
const seiten = readFileSync(quelle, 'utf8').split('\f');

// Die Emoji des Satzes landen im Textlayer als griechische Zeichen — kein Text,
// sondern Bild. Sie fliegen raus, statt als Zeichensalat auf der Seite zu stehen.
const sauber = (t) => String(t ?? '')
  .replace(/[ἀ-῿Ͱ-Ͽ]+/g, '')
  .replace(/(\p{L})-\s+(\p{L})/gu, '$1$2')
  .replace(/\s+/g, ' ')
  .trim();

// ——— Kapitelanfänge: die Seite, die mit der zweistelligen Nummer aufmacht ———
const anfang = {};
seiten.forEach((p, i) => {
  const z = p.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
  const m = z[0]?.trim().match(/^(\d{2})$/);
  if (!m) return;
  const nr = Number(m[1]);
  if (nr >= 1 && nr <= 40 && anfang[nr] === undefined) anfang[nr] = i;
});

// ——— Inhaltsverzeichnis ———
const toc = {};
for (const p of seiten.slice(1, 5)) {
  const z = p.split('\n');
  z.forEach((l, j) => {
    const m = l.trim().match(/^(\d{1,2}) (\S.*)$/);
    if (!m) return;
    const nr = Number(m[1]);
    if (nr < 1 || nr > 40 || toc[nr]) return;
    toc[nr] = { titel: sauber(m[2]), unterzeile: sauber(z[j + 1] ?? '') };
  });
}

// ——— Die zweite Leseordnung ———
const ordnungIndex = seiten.findIndex((p) => p.includes('ZWEITE LESEORDNUNG'));
const ordnung = [...(seiten[ordnungIndex] ?? '').matchAll(/^\s*((?:\d{1,2}\s*·\s*){4}\d{1,2})\s*$/gm)]
  .flatMap((m) => m[1].split('·').map((n) => Number(n.trim())));

// ——— Ein Schnipsel aus der Kommentarspalte ———
//
// Sechs Zeilen je Kapitel, von vierzig bis sechzig, die im Buch stehen. Nicht
// als Spalte, sondern als Strom: In einem Livestream zieht Text vorbei und ist
// weg, und genau so laufen sie in der Welt.
//
// Warum überhaupt: Der Ton dieses Buches steckt in diesen Stimmen — Dirk
// erklärt, Claudia trifft, Kevin fragt. Ohne sie ist der Feed nur ein Bild mit
// Behauptung. Warum nur sechs: Weil die Spalte selbst das Buch ist. Wer mehr
// will, kauft es. Wer hier mehr einträgt, hebt diese Grenze auf — dann bitte
// bewusst und nicht aus Versehen.
const WIEVIEL = 6;
const SPRECHER = /^(@[A-Za-z0-9_]+|Dirk|Claudia|Kevin|Lucy)\b(.*)$/;
const LIKES = /^([\d.]+) Gefällt mir$/;

function schnipsel(text) {
  const zeilen = text.split('\n');
  const aus = [];
  for (let i = 0; i < zeilen.length && aus.length < WIEVIEL; i++) {
    const strip = zeilen[i].trim();
    const m = strip ? SPRECHER.exec(strip) : null;
    if (!m) continue;
    let rest = m[2].trim();
    if (rest.startsWith('angeheftet')) rest = rest.slice('angeheftet'.length).trim();
    for (let j = i + 1; j < zeilen.length; j++) {
      const ns = zeilen[j].trim();
      if (!ns || SPRECHER.test(ns) || LIKES.test(ns) || ns === ns.toUpperCase()) break;
      rest += ' ' + ns;
    }
    const sauberer = sauber(rest);
    if (sauberer) aus.push({ von: m[1], text: sauberer });
  }
  return aus;
}

// ——— Je Kapitel: nur die Feed-Seite davor ———
//
// Das Buch setzt drei Formen von Feed-Seite, weil es drei Formen im Netz gibt:
//
//   A  „@NoCurveHere folgen“, Bildunterschrift klein, drei Zahlen am Rand.
//   B  Ein KI-Clip: Bildunterschrift groß in Versalien, darunter
//      „KI-generiert · Stimme synthetisch“, dann ein Konto ohne Klammeraffe
//      („verborgene.welt.archiv“), keine Zahlen.
//   C  Wie A, nur ohne Zahlen.
//
// Der Leser darf keine davon zu einer anderen machen. Was fehlt, bleibt leer —
// eine Zahl zu ergänzen, die im Buch nicht steht, wäre eine erfundene Zahl in
// einer Spalte, die ohnehin von erfundenen Zahlen handelt.
// Ein Konto ohne Klammeraffe steht allein auf seiner Zeile, klein und ohne
// Leerzeichen — „verborgene.welt.archiv“, aber auch „maschinenwacht“. Die
// Bildunterschriften dieser Form stehen dagegen in Versalien.
const KONTO_OHNE_AT = /^[a-z0-9][a-z0-9._-]{3,}$/;

const kapitel = [];
for (let nr = 1; nr <= 40; nr++) {
  const i = anfang[nr];
  const bis = (anfang[nr + 1] ?? seiten.length) - 1;
  // Ungetrimmt: Die Zahlen stehen als eigene Spalte am rechten Rand, und nur
  // am Abstand davor lässt sich eine Randzahl von einer Jahreszahl im Satz
  // unterscheiden. „1947 stand in der zeitung“ ist Text, „…drin   14,9 Tsd“
  // nicht.
  const tik = (seiten[i - 1] ?? '').split('\n');

  let handle;
  let ton;
  let kiHinweis = false;
  const hashtags = [];
  const zahlen = [];
  const rest = [];

  for (const roh of tik) {
    if (!roh.trim()) continue;
    let zeile = roh
      .replace(/\s{2,}(\d+[,.]?\d*)\s*Tsd\s*$/, (_, z) => { zahlen.push(`${z} Tsd`); return ''; })
      .replace(/^\s*(\d+[,.]?\d*)\s*Tsd\s*$/, (_, z) => { zahlen.push(`${z} Tsd`); return ''; })
      .replace(/\s{2,}(\d[\d.,]*)\s*$/, (_, z) => { zahlen.push(z); return ''; })
      .trim();
    if (!zeile) continue;

    const folgen = /^(@[A-Za-z0-9_]+)\s+folgen\b(.*)$/.exec(zeile);
    if (folgen) { handle ??= folgen[1]; if (folgen[2].trim()) rest.push(folgen[2].trim()); continue; }

    const original = /^Originalton\s*[—–-]\s*(.+)$/.exec(zeile);
    if (original) { ton ??= sauber(original[1]); continue; }

    if (/^KI-generiert/.test(zeile)) { kiHinweis = true; continue; }

    if (zeile.startsWith('#')) {
      for (const m of zeile.matchAll(/#(\S+)/g)) hashtags.push(sauber(m[1]));
      continue;
    }

    if (KONTO_OHNE_AT.test(zeile)) { handle ??= zeile; continue; }

    // Eine nackte Zahl am Rand ist eine Zahl, keine Bildunterschrift. Ohne
    // diese Zeile stand bei „Chemtrails“ ein „8.940“ mitten im Satz.
    if (/^[\d][\d.,]*$/.test(zeile)) { zahlen.push(zeile); continue; }

    rest.push(zeile);
  }

  kapitel.push({
    nr,
    titel: toc[nr]?.titel ?? '',
    unterzeile: toc[nr]?.unterzeile ?? '',
    seite: i,
    handle,
    caption: sauber(rest.join(' ')),
    hashtags: hashtags.filter(Boolean),
    zahlen,
    ton,
    kiHinweis: kiHinweis || undefined,
    kommentare: schnipsel(seiten.slice(i, bis).join('\n')),
  });
}

const j = (v) => JSON.stringify(v, null, 2).replace(/\n/g, '\n  ');

writeFileSync('src/data/zufall/feed.ts', `import type { Feedkapitel } from '../gemeinsam/typen';

/**
 * Vierzig Behauptungen, so wie sie im Buch im Feed stehen.
 *
 * ERZEUGT von \`scripts/zufall-lesen.mjs\`. Nicht von Hand ändern.
 *
 * Hier steht die Behauptung und sonst nichts — keine Auflösung, kein
 * Kapiteltext, keine Kommentarspalte, kein Nachtrag. Das ist eine Regel, keine
 * Lücke: Der Feed ist das, was man ohnehin sieht; das Buch ist das, was man
 * danach weiß. \`seite\` sagt, wo im gedruckten Band das hier steht.
 */
export const FEED: Feedkapitel[] = ${j(kapitel)};

/**
 * Die zweite Leseordnung — aus dem Buch, Seite ${ordnungIndex + 1}.
 *
 * „Im Feed steht die flache Erde zwischen einem Rezept und einem Hund.
 * Danach kommt etwas über die Titanic, dann eine Turnübung, dann Roswell.
 * Nichts hat mit dem davor zu tun. Genau das ist der Grund, warum es wirkt."
 *
 * Das Buch gibt diese Reihenfolge selbst an. Die Welt läuft in genau ihr:
 * unsortiert, nie zweimal Ähnliches hintereinander. Die letzte Zeile steht
 * mit Absicht am Ende — es sind die fünf Kapitel, in denen lebende Menschen
 * beschuldigt werden.
 */
export const LESEORDNUNG: number[] = ${JSON.stringify(ordnung)};
`);

console.log(`feed.ts: ${kapitel.length} Kapitel, Leseordnung ${ordnung.length} Einträge, ` +
  `ohne Kapiteltext, ohne Kommentare, ohne Nachtrag.`);
