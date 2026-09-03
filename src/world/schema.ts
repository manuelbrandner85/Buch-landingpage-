import { wegVollstaendig } from './wege';
import { TRENDONIX } from '@/data/gemeinsam/haus';
import { kanalAdressen } from '@/data/gemeinsam/kanaele';
import { BASIS_PFAD } from './bilder';

/**
 * Was Suchmaschinen von einer Seite wissen dürfen.
 *
 * Strukturierte Daten sind keine Werbung, sondern eine Auskunft: Das hier ist
 * ein Ort, das ein Kapitel, das ein Buch, und so hängen sie zusammen. Google
 * baut daraus die auffälligen Treffer – aber nur, wenn die Angaben mit dem
 * übereinstimmen, was auf der Seite steht. Deshalb kommt hier nichts hinein,
 * was die Seite nicht auch zeigt: kein Preis, den niemand nennt, keine
 * Bewertung, die es nicht gibt.
 */
export interface Krume { name: string; weg: string }

/** Der Pfad von der Startseite bis hierher – Google zeigt ihn im Treffer an. */
export const brotkrumen = (krumen: Krume[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: krumen.map((k, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: k.name,
    ...(wegVollstaendig(k.weg) ? { item: wegVollstaendig(k.weg) } : {}),
  })),
});

/**
 * Die Beschreibung unter dem Suchtreffer.
 *
 * Google zeigt dort rund 155 Zeichen. Zu lang wird mitten im Wort abgeschnitten
 * — zu kurz ist schlimmer: Eine Zeile mit 46 Zeichen lässt zwei Drittel der
 * Fläche leer, die dem Treffer zusteht, und Google füllt sie dann selbst mit
 * einem beliebigen Satz von der Seite. Deshalb wird hier aus mehreren Teilen
 * zusammengesetzt und am Satzende getrennt, nicht am Zeichen.
 */
export const suchbeschreibung = (
  teile: (string | undefined)[], hoechstens = 158,
): string => {
  // Punkt dazwischen, wo einer fehlt: Eine Unterzeile endet ohne Satzzeichen,
  // und ohne diesen Schritt klebte der nächste Teil daran fest.
  const text = teile
    .filter(Boolean)
    .map((t) => t!.replace(/\s+/g, ' ').trim())
    .map((t) => (/[.!?…:]$/.test(t) ? t : `${t}.`))
    .join(' ')
    .trim();
  if (text.length <= hoechstens) return text;
  const kurz = text.slice(0, hoechstens + 1);
  const satz = Math.max(
    kurz.lastIndexOf('. '), kurz.lastIndexOf('! '), kurz.lastIndexOf('? '),
  );
  // Nur am Satzende trennen, wenn danach noch genug übrig bleibt: Sonst
  // fällt bei einem langen zweiten Teil der ganze zweite Teil weg, und die
  // Beschreibung ist wieder so kurz wie vorher.
  if (satz > hoechstens * 0.72) return kurz.slice(0, satz + 1).trim();
  return `${kurz.slice(0, kurz.lastIndexOf(' ')).trim()} …`;
};

/**
 * Wo es im gedruckten Buch steht: „Band 1, Kapitel 1, Seite 12–39“.
 *
 * Nicht Zierde, sondern der Teil der Beschreibung, den nur diese eine Seite
 * hat — und zugleich die Auskunft, die ein Suchender wirklich braucht: Steht
 * das, was ich suche, im Buch, und wo.
 */
export const fundstelle = (
  { bandNummer, kapitel, seiten }:
  { bandNummer?: number; kapitel?: number; seiten?: number[] },
): string => {
  const teile: string[] = [];
  if (bandNummer !== undefined) teile.push(`Band ${bandNummer}`);
  if (kapitel !== undefined) teile.push(`Kapitel ${kapitel}`);
  if (seiten?.length) {
    teile.push(seiten.length > 1
      ? `Seite ${seiten[0]}–${seiten[seiten.length - 1]}`
      : `Seite ${seiten[0]}`);
  }
  return teile.join(', ');
};

/** Die feste Kennung des Hauses – damit alle Blätter dieselbe Stelle meinen. */
export const hausKennung = () => `${wegVollstaendig(`${BASIS_PFAD}/`) ?? ''}#haus`;

/** Das Haus – überall dasselbe, damit die Profile zusammenfinden. */
export const haus = () => ({
  '@type': 'Organization',
  // Ohne Kennung ist jede Erwähnung ein neues Haus: Der Verfasser eines
  // Kapitels, der Herausgeber eines Buches und die Organisation auf der
  // Startseite waren fuer Google bis dahin drei verschiedene Organisationen
  // mit demselben Namen. Mit `@id` sind es drei Verweise auf eine.
  '@id': hausKennung(),
  name: TRENDONIX.name,
  ...(wegVollstaendig(`${BASIS_PFAD}/`) ? { url: wegVollstaendig(`${BASIS_PFAD}/`) } : {}),
  // Absolut, nicht `/marke/…`: Ein Logo mit relativer Adresse wird von Google
  // verworfen, und dann steht im Wissenspanel kein Zeichen.
  logo: wegVollstaendig('/marke/trendonix.png') ?? `${BASIS_PFAD}/marke/trendonix.png`,
  sameAs: kanalAdressen(),
});

/**
 * Die Website als Ganzes.
 *
 * Google nimmt den Namen, den es über dem Treffer anzeigt, aus dieser Angabe –
 * nicht aus dem Titel. Fehlt sie, rät Google ihn aus der Adresse, und dann
 * steht dort „Trendonix-buecher.de“ statt „Trendonix“.
 */
export const netz = () => ({
  // Ohne eigenen `@context`: Dieses Wesen steht im `@graph` der Startseite,
  // und dort gilt der Kontext des Blattes.
  '@type': 'WebSite',
  '@id': `${wegVollstaendig(`${BASIS_PFAD}/`) ?? ''}#seite`,
  name: TRENDONIX.name,
  alternateName: `${TRENDONIX.name} Bücher`,
  ...(wegVollstaendig(`${BASIS_PFAD}/`) ? { url: wegVollstaendig(`${BASIS_PFAD}/`) } : {}),
  inLanguage: 'de',
  publisher: { '@id': hausKennung() },
});

/** Ein Text mit Verfasser und Stand: Kapitelseiten und Journalbeiträge. */
export const aufsatz = (
  { titel, beschreibung, weg, datum, bild }:
  { titel: string; beschreibung?: string; weg: string; datum?: string; bild?: string },
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: titel,
  ...(beschreibung ? { description: beschreibung } : {}),
  inLanguage: 'de',
  ...(wegVollstaendig(weg) ? { mainEntityOfPage: wegVollstaendig(weg) } : {}),
  ...(datum ? { datePublished: datum } : {}),
  ...(bild ? { image: bild } : {}),
  author: haus(),
  publisher: haus(),
});

/** Ein Ort auf der Karte – mit Koordinaten, damit er als Ort erkannt wird. */
export const ort = (
  { name, beschreibung, lat, lon, weg }:
  { name: string; beschreibung: string; lat: number; lon: number; weg: string },
) => ({
  '@context': 'https://schema.org',
  '@type': 'Place',
  name,
  description: beschreibung,
  geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon },
  ...(wegVollstaendig(weg) ? { url: wegVollstaendig(weg) } : {}),
});

/** Die Begriffssammlung – jeder Eintrag ein eigener Begriff. */
export const begriffssammlung = (
  { titel, weg, eintraege }:
  { titel: string; weg: string; eintraege: { wort: string; erklaerung: string; weg?: string }[] },
) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  name: titel,
  inLanguage: 'de',
  ...(wegVollstaendig(weg) ? { url: wegVollstaendig(weg) } : {}),
  hasDefinedTerm: eintraege.map((e) => ({
    '@type': 'DefinedTerm',
    name: e.wort,
    description: e.erklaerung,
    ...(e.weg && wegVollstaendig(e.weg) ? { url: wegVollstaendig(e.weg) } : {}),
  })),
});

/**
 * Die Ausgaben eines Buches für das Datenblatt.
 *
 * Ein Titel ist ein Werk, eine Ausgabe ist ein Ding mit eigener Nummer: Das
 * Taschenbuch hat eine andere ISBN als das E-Book, und im Buchhandel wird über
 * genau diese Nummer bestellt. Steht sie hier, verbindet Google die Buchseite
 * mit den Einträgen bei tolino, Thalia und jeder Buchhandlung, die den Titel
 * führt – ohne sie bleibt die Seite ein Text neben dem Handel.
 *
 * Preis und Verfügbarkeit nur, wenn beides feststeht: Ein Datenblatt, das
 * einen falschen Preis nennt, wird von Google nicht ignoriert, sondern
 * abgestraft.
 */
const FORMEN: Record<string, string> = {
  'Taschenbuch': 'https://schema.org/Paperback',
  'Gebunden': 'https://schema.org/Hardcover',
  'E-Book': 'https://schema.org/EBook',
  'Hörbuch': 'https://schema.org/AudiobookFormat',
};

export const ausgaben = (kaufwege: {
  haendler: string; form: string; url: string; isbn?: string; preis?: number;
  art?: 'kauf' | 'ausleihe';
}[]) => kaufwege.map((k) => ({
  '@type': 'Book',
  bookFormat: FORMEN[k.form] ?? 'https://schema.org/Paperback',
  url: k.url,
  inLanguage: 'de',
  ...(k.isbn ? { isbn: k.isbn } : {}),
  // Eine Ausleihe ist kein Angebot: kein Preis, keine Verfuegbarkeit, kein
  // Verkaeufer. Wer eine Bibliothek als Offer auszeichnet, behauptet einen
  // Handel, den es nicht gibt.
  ...(k.preis && k.art !== 'ausleihe'
    ? {
      offers: {
        '@type': 'Offer',
        price: k.preis,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: k.url,
        seller: { '@type': 'Organization', name: k.haendler },
      },
    }
    : {}),
}));

/**
 * Sternzahl und Rezensionen für das Datenblatt.
 *
 * Google zeigt Sterne im Treffer – aber nur, wenn dieselben Zahlen auch auf
 * der Seite stehen. Ein `aggregateRating` für eine Seite ohne sichtbare
 * Bewertungen ist kein Vorteil, sondern ein Verstoß: Google nennt das
 * unzulässige Auszeichnung und nimmt dann der ganzen Domain die
 * Sonderdarstellung weg. Deshalb gibt beides hier `undefined` zurück, sobald
 * die Daten fehlen, und die Seite zeigt genau das, was hier steht.
 */
export const urteil = (
  wert: { schnitt: number; anzahl: number; skala?: number } | null,
) => (wert && wert.anzahl > 0
  ? {
    '@type': 'AggregateRating',
    ratingValue: wert.schnitt,
    ratingCount: wert.anzahl,
    bestRating: wert.skala ?? 5,
    worstRating: 1,
  }
  : undefined);

export const stimmen = (liste: {
  text: string; autor?: string; quelle: string; sterne?: number;
  skala?: number; datum?: string;
}[]) => liste.map((s) => ({
  '@type': 'Review',
  reviewBody: s.text,
  author: { '@type': 'Person', name: s.autor ?? 'Leser' },
  publisher: { '@type': 'Organization', name: s.quelle },
  ...(s.datum ? { datePublished: s.datum } : {}),
  ...(s.sterne !== undefined
    ? {
      reviewRating: {
        '@type': 'Rating',
        ratingValue: s.sterne,
        bestRating: s.skala ?? 5,
        worstRating: 1,
      },
    }
    : {}),
}));
