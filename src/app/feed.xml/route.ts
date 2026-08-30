import { TRENDONIX } from '@/data/gemeinsam/haus';
import { sichtbareBeitraege } from '@/world/journal';

/**
 * Der Atom-Feed des Journals.
 *
 * Warum überhaupt. Das Journal ist der einzige Kanal des Hauses, der niemandem
 * sonst gehört – keine Plattform, keine Reichweitenregel, keine Sperre. Genau
 * dieser Kanal hatte bis zum 30.08.2026 keinen Feed: Wer den Beiträgen folgen
 * wollte, musste sich selbst daran erinnern, wieder vorbeizuschauen. Ein Feed
 * kehrt das um. Er kostet eine Datei und wird von Leseprogrammen, von
 * Sammeldiensten und von einem Teil der eigenen Automatisierung gelesen.
 *
 * Warum Atom und nicht RSS. Atom schreibt die Zeitangabe verbindlich vor
 * (RSS lässt drei Schreibweisen zu), verlangt eine eindeutige Kennung je
 * Eintrag und regelt, ob im Inhalt Text oder HTML steht. Wer RSS liest,
 * liest auch Atom; umgekehrt gilt das nicht immer.
 *
 * Sichtbarkeit: `sichtbareBeitraege()` – dieselbe Regel wie überall im Haus.
 * Ein Beitrag über einen Band, der noch schweigt, steht auch hier nicht drin,
 * und ein Beitrag mit einem Datum in der Zukunft ebenfalls nicht.
 */

// Beim statischen Export muss die Route zur Bauzeit feststehen.
export const dynamic = 'force-static';

const BASIS = process.env.NEXT_PUBLIC_BASIS_URL ?? 'https://example.invalid';

/**
 * Fünf Zeichen, die in XML etwas anderes bedeuten als sich selbst.
 * Ohne diese Zeile zerlegt ein einziges „&" in einer Überschrift den ganzen
 * Feed – und zwar still: Das Leseprogramm zeigt dann gar nichts an.
 */
const xml = (text: string) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

/**
 * Ein Beitragsdatum ist ein Tag ohne Uhrzeit. Atom will einen Zeitpunkt.
 * Zwölf Uhr mittags UTC: So liegt der Eintrag in jeder Zeitzone der Welt am
 * richtigen Tag – bei 00:00 wäre er westlich von Greenwich einen Tag zu früh.
 */
const zeitpunkt = (tag: string) => `${tag}T12:00:00Z`;

export function GET() {
  const beitraege = sichtbareBeitraege();
  const neuester = beitraege[0]?.datum;

  const eintraege = beitraege.map((b) => {
    const adresse = `${BASIS}/blog/${b.slug}/`;
    // Der volle Text, nicht nur der Anriss: Ein Feed, der zum Weiterklicken
    // zwingt, wird abbestellt. Wer den Beitrag im Leseprogramm zu Ende liest,
    // hat ihn gelesen – das ist der Zweck.
    const inhalt = b.absaetze
      .map((a) => (a.startsWith('## ')
        ? `<h2>${xml(a.slice(3))}</h2>`
        : `<p>${xml(a)}</p>`))
      .join('');
    return [
      '  <entry>',
      `    <title>${xml(b.titel)}</title>`,
      `    <link rel="alternate" type="text/html" href="${xml(adresse)}"/>`,
      `    <id>${xml(adresse)}</id>`,
      `    <published>${zeitpunkt(b.datum)}</published>`,
      `    <updated>${zeitpunkt(b.datum)}</updated>`,
      `    <summary type="text">${xml(b.auszug)}</summary>`,
      `    <content type="html">${xml(inhalt)}</content>`,
      '  </entry>',
    ].join('\n');
  }).join('\n');

  const feed = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="de">',
    `  <title>${xml(TRENDONIX.name)} – Journal</title>`,
    `  <subtitle>${xml(TRENDONIX.kurzfassung)}</subtitle>`,
    `  <link rel="alternate" type="text/html" href="${BASIS}/blog/"/>`,
    `  <link rel="self" type="application/atom+xml" href="${BASIS}/feed.xml"/>`,
    // Die Kennung des Feeds. Sie darf sich nie ändern, sonst gilt der Feed
    // als ein neuer und alle Einträge erscheinen noch einmal als ungelesen.
    `  <id>${BASIS}/</id>`,
    `  <updated>${neuester ? zeitpunkt(neuester) : new Date().toISOString()}</updated>`,
    // Kein Personenname: Die Bände tragen im Druck Trendonix, die Kanäle
    // laufen unter Trendonix, und wer dahintersteht, steht im Impressum.
    `  <author><name>${xml(TRENDONIX.name)}</name></author>`,
    eintraege,
    '</feed>',
    '',
  ].join('\n');

  return new Response(feed, {
    headers: {
      'content-type': 'application/atom+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
