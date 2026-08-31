/**
 * Alle Bücher des Hauses aus den Daten selbst lesen.
 *
 * Bis heute kannte das Cockpit genau ein Buch: Band 1, von Hand in
 * `daten/cockpit-basis.json` eingetragen. Das war schon bei zwei Titeln zu
 * viel Handarbeit und bei vier eine Fehlerquelle — ein Preis, der auf der
 * Website steht und im Dashboard nicht, ist genau die Sorte Abweichung, die
 * niemandem auffällt.
 *
 * Also holt sich das Dashboard die Bücher dort, wo sie ohnehin gepflegt
 * werden: aus `src/data/`. Damit kann es keinen Unterschied mehr geben — was
 * hier steht, ist wörtlich das, was die Website zeigt.
 *
 * Gelesen wird als Text, nicht als Programm. Das ist die Hausart (siehe
 * `pruefe-welt.mjs`) und hat einen Grund: Die Datendateien sind TypeScript
 * mit Pfadkürzeln; sie auszuführen hieße, einen Übersetzer in einen
 * Stundenlauf zu hängen, der ohne ihn seit Monaten läuft.
 *
 * Die eiserne Regel gilt auch hier: Was nicht dasteht, wird nicht geraten.
 * Ein fehlendes Feld ist `null`, und `luecken` sagt, welches.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const lies = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/**
 * Kommentare weg, Zeichenketten bleiben.
 *
 * Ein simples `replace(/\/\/.*$/gm, '')` würde jede Amazon-Adresse zerstören —
 * `https://` enthält zwei Schrägstriche. Deshalb läuft der Text hier einmal
 * Zeichen für Zeichen durch, mit Blick darauf, ob er gerade in einer
 * Zeichenkette steht.
 */
export const ohneKommentare = (t) => {
  let raus = '';
  for (let i = 0; i < t.length;) {
    const c = t[i];
    if (c === "'" || c === '"' || c === '`') {
      raus += c; i++;
      while (i < t.length) {
        if (t[i] === '\\') { raus += t.slice(i, i + 2); i += 2; continue; }
        raus += t[i];
        if (t[i] === c) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; continue; }
    if (c === '/' && t[i + 1] === '*') {
      i += 2;
      while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++;
      i += 2; continue;
    }
    raus += c; i++;
  }
  return raus;
};

/** Von der ersten Klammer `auf` bis zu ihrer Gegenklammer, Zeichenketten übersprungen. */
const klammer = (t, ab, auf = '{', zu = '}') => {
  const start = t.indexOf(auf, ab);
  if (start < 0) return null;
  let tiefe = 0;
  for (let j = start; j < t.length; j++) {
    const c = t[j];
    if (c === "'" || c === '"' || c === '`') {
      j++;
      while (j < t.length) { if (t[j] === '\\') { j += 2; continue; } if (t[j] === c) break; j++; }
      continue;
    }
    if (c === auf) tiefe++;
    else if (c === zu) { tiefe--; if (tiefe === 0) return { start, ende: j + 1, text: t.slice(start, j + 1) }; }
  }
  return null;
};

const text = (block, feld) => {
  const m = block.match(new RegExp(`\\b${feld}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? m[1].replace(/\\'/g, "'") : null;
};
/**
 * Ein Text, der über mehrere Zeilen mit `+` zusammengesetzt ist.
 *
 * `satz: 'Der Band ist fertig: … ' + 'Was fehlt, ist der Kaufweg.'` ist in
 * diesen Dateien der Normalfall — die Zeilenbreite von achtzig Zeichen zwingt
 * dazu. Wer nur den ersten Teil liest, bekommt einen halben Satz.
 */
const textLang = (block, feld) => {
  const m = block.match(new RegExp(`\\b${feld}:\\s*((?:'(?:[^'\\\\]|\\\\.)*'\\s*\\+?\\s*)+)`));
  if (!m) return null;
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)]
    .map((x) => x[1].replace(/\\'/g, "'")).join('');
};

const zahl = (block, feld) => {
  const m = block.match(new RegExp(`\\b${feld}:\\s*(-?\\d+(?:\\.\\d+)?)`));
  return m ? Number(m[1]) : null;
};

/** Ein Buchobjekt aus einer Datendatei holen — oder null, wenn keins drin steht. */
const buchAus = (roh) => {
  const t = ohneKommentare(roh);
  const treffer = t.search(/export\s+const\s+\w+\s*:\s*Buch\s*=/);
  if (treffer < 0) return null;
  const ganz = klammer(t, treffer);
  if (!ganz) return null;

  // Die Kaufwege zuerst herausschneiden. Sonst fände `text(block, 'url')`
  // weiter unten die Adresse des ersten Kaufwegs und hielte sie für ein Feld
  // des Buches.
  const wegeStelle = ganz.text.search(/\bkaufwege:\s*\[/);
  let wege = [];
  let rumpf = ganz.text;
  if (wegeStelle >= 0) {
    const liste = klammer(ganz.text, wegeStelle, '[', ']');
    if (liste) {
      rumpf = ganz.text.slice(0, liste.start) + ganz.text.slice(liste.ende);
      for (let i = 0; ;) {
        const eintrag = klammer(liste.text, i);
        if (!eintrag) break;
        i = eintrag.ende;
        wege.push({
          haendler: text(eintrag.text, 'haendler'),
          form: text(eintrag.text, 'form'),
          url: text(eintrag.text, 'url'),
          isbn: text(eintrag.text, 'isbn'),
          preis: zahl(eintrag.text, 'preis'),
          art: text(eintrag.text, 'art') ?? 'kauf',
          hinweis: text(eintrag.text, 'hinweis'),
        });
      }
    }
  }

  // Dasselbe für den Standblock eines noch nicht erschienenen Bandes.
  let standBlock = null;
  const standStelle = rumpf.search(/\bstand:\s*\{/);
  if (standStelle >= 0) {
    const s = klammer(rumpf, standStelle);
    if (s) { standBlock = s.text; rumpf = rumpf.slice(0, s.start) + rumpf.slice(s.ende); }
  }

  return {
    id: text(rumpf, 'id'),
    reiheId: text(rumpf, 'reiheId'),
    nummer: zahl(rumpf, 'nummer'),
    titel: text(rumpf, 'titel'),
    unterzeile: text(rumpf, 'unterzeile'),
    status: text(rumpf, 'status'),
    erschienen: text(rumpf, 'erschienen'),
    seiten: zahl(rumpf, 'seiten'),
    cover: Boolean(text(rumpf, 'coverAsset')),
    kaufwege: wege,
    arbeitsstand: standBlock
      ? {
          kurz: text(standBlock, 'kurz'),
          satz: textLang(standBlock, 'satz'),
          vom: text(standBlock, 'vom'),
        }
      : null,
  };
};

/** Die Sternzahlen und Zitate, nach Band sortiert. */
const stimmenAus = (roh) => {
  const t = ohneKommentare(roh);
  const holen = (name) => {
    const stelle = t.search(new RegExp(`export\\s+const\\s+${name}\\s*:`));
    if (stelle < 0) return [];
    // Ab dem Gleichheitszeichen suchen, nicht ab dem Namen: Die Typangabe
    // `Bewertungsstand[]` steht dazwischen und bringt eine eigene eckige
    // Klammer mit. Wer die erste nimmt, liest ein leeres Paar.
    const liste = klammer(t, t.indexOf('=', stelle), '[', ']');
    if (!liste) return [];
    const raus = [];
    for (let i = 0; ;) {
      const e = klammer(liste.text, i);
      if (!e) break;
      i = e.ende;
      raus.push(e.text);
    }
    return raus;
  };
  const bewertungen = holen('BEWERTUNGEN').map((b) => ({
    bandId: text(b, 'bandId'), quelle: text(b, 'quelle'), url: text(b, 'url'),
    schnitt: zahl(b, 'schnitt'), anzahl: zahl(b, 'anzahl'),
    skala: zahl(b, 'skala') ?? 5, stand: text(b, 'stand'),
  }));
  const zitate = holen('STIMMEN').map((s) => ({
    bandId: text(s, 'bandId'), quelle: text(s, 'quelle'),
    autor: text(s, 'autor'), sterne: zahl(s, 'sterne'), datum: text(s, 'datum'),
  }));
  return { bewertungen, zitate };
};

/** Wie viele Tage liegt ein ISO-Datum zurück? */
const tageHer = (iso, heute) => (iso ? Math.round((Date.parse(heute) - Date.parse(iso)) / 864e5) : null);

/**
 * Alle Bücher lesen, die die Website öffentlich zeigt.
 *
 * Öffentlich heißt hier dasselbe wie in `registry.ts`: alles außer `in Arbeit`.
 * Ein Band, der noch schweigt, steht in den Daten und gehört nicht ins
 * Dashboard — er hat keine Seite, keinen Preis und keine Zahl.
 */
export function buecherLesen(wurzel, heute = new Date().toISOString().slice(0, 10)) {
  const daten = join(wurzel, 'src', 'data');
  const luecken = [];
  const fehlt = (was, warum) => luecken.push({ was, warum });

  // Die Reihennamen, damit im Dashboard „Die Unsichtbaren Fäden — Band 2“
  // steht und nicht „faeden 2“.
  const reihen = {};
  for (const datei of readdirSync(daten).filter((d) => d.endsWith('.ts'))) {
    const t = ohneKommentare(lies(join(daten, datei)));
    const stelle = t.search(/export\s+const\s+\w+\s*:\s*Reihe\s*=/);
    if (stelle < 0) continue;
    const b = klammer(t, stelle);
    if (!b) continue;
    const id = text(b.text, 'id');
    if (id) reihen[id] = text(b.text, 'titel');
  }

  const { bewertungen, zitate } = stimmenAus(lies(join(daten, 'gemeinsam', 'stimmen.ts')));
  const standText = ohneKommentare(lies(join(daten, 'gemeinsam', 'stand.ts')));
  const preisstand = text(standText, 'PREISSTAND')
    ?? (standText.match(/PREISSTAND\s*=\s*'([^']+)'/)?.[1] ?? null);
  const inhaltsstand = standText.match(/\bSTAND\s*=\s*'([^']+)'/)?.[1] ?? null;

  // Jede Datendatei, in der ein Buch stehen kann. Kein festes Verzeichnis:
  // Kommt ein fünfter Titel dazu, findet ihn dieses Skript von selbst.
  const buecher = [];
  for (const ordner of readdirSync(daten, { withFileTypes: true })) {
    if (!ordner.isDirectory() || ordner.name === 'gemeinsam') continue;
    for (const datei of readdirSync(join(daten, ordner.name)).filter((d) => d.endsWith('.ts'))) {
      const b = buchAus(lies(join(daten, ordner.name, datei)));
      if (b?.id) buecher.push(b);
    }
  }

  const oeffentlich = buecher.filter((b) => b.status !== 'in Arbeit');
  oeffentlich.sort((a, b) => (a.reiheId === b.reiheId
    ? (a.nummer ?? 0) - (b.nummer ?? 0)
    : (a.reiheId ?? '').localeCompare(b.reiheId ?? '')));

  const fertig = oeffentlich.map((b) => {
    const bew = bewertungen.filter((x) => x.bandId === b.id && x.anzahl > 0);
    const zit = zitate.filter((x) => x.bandId === b.id);
    const gewicht = bew.reduce((s, x) => s + x.anzahl, 0);
    const urteil = gewicht
      ? {
          schnitt: Math.round((bew.reduce((s, x) => s + (x.schnitt / (x.skala || 5)) * 5 * x.anzahl, 0) / gewicht) * 10) / 10,
          anzahl: gewicht,
          quellen: [...new Set(bew.map((x) => x.quelle))],
          stand: bew.map((x) => x.stand).sort().at(-1) ?? null,
        }
      : null;

    // Was diesem Titel fehlt — je Buch, damit die Meldung nicht nur „irgendwo
    // fehlt eine ISBN“ heißt.
    const mangel = [];
    const name = `${reihen[b.reiheId] ?? b.reiheId}${b.reiheId === 'zufall' ? '' : ` — Band ${b.nummer}`}`;
    if (b.status === 'erschienen' && !b.kaufwege.length) {
      mangel.push('erschienen, aber kein Kaufweg eingetragen');
    }
    for (const w of b.kaufwege) {
      if (w.art === 'ausleihe') continue;
      if (w.preis === null) mangel.push(`${w.form} bei ${w.haendler}: kein Preis`);
      if (!w.isbn && w.form !== 'E-Book') mangel.push(`${w.form}: keine ISBN`);
    }
    if (!b.cover) mangel.push('kein Cover hinterlegt');
    // Erst nach zwei Wochen. Am Erscheinungstag ist „noch keine Bewertung"
    // keine Lücke, sondern der Normalzustand — und eine Meldung, die zwangs-
    // läufig kommt, ist keine Meldung.
    const draussen = b.status === 'erschienen' ? tageHer(b.erschienen, heute) : null;
    if (!urteil && draussen !== null && draussen >= 14) {
      mangel.push(`seit ${draussen} Tagen im Handel und noch ohne Bewertung`);
    }

    return {
      id: b.id,
      name,
      titel: b.titel,
      unterzeile: b.unterzeile,
      reihe: reihen[b.reiheId] ?? b.reiheId,
      nummer: b.nummer,
      status: b.status,
      erschienen: b.erschienen,
      tageDraussen: b.status === 'erschienen' ? tageHer(b.erschienen, heute) : null,
      seiten: b.seiten,
      weg: `/buch/${b.id}/`,
      ausgaben: b.kaufwege.map((w) => ({
        form: w.form, haendler: w.haendler, url: w.url,
        isbn: w.isbn, preis: w.preis, hinweis: w.hinweis, art: w.art,
      })),
      formen: [...new Set(b.kaufwege.filter((w) => w.art !== 'ausleihe').map((w) => w.form))],
      bewertung: urteil,
      zitate: zit.length,
      arbeitsstand: b.arbeitsstand,
      mangel,
    };
  });

  for (const b of fertig) {
    for (const m of b.mangel) fehlt(b.name, m);
  }
  const stumm = buecher.length - oeffentlich.length;

  return {
    buecher: fertig,
    preisstand,
    inhaltsstand,
    stumm,
    erschienen: fertig.filter((b) => b.status === 'erschienen').length,
    luecken,
  };
}
