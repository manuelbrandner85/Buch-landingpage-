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

/** Das Haus – überall dasselbe, damit die Profile zusammenfinden. */
export const haus = () => ({
  '@type': 'Organization',
  name: TRENDONIX.name,
  ...(wegVollstaendig(`${BASIS_PFAD}/`) ? { url: wegVollstaendig(`${BASIS_PFAD}/`) } : {}),
  logo: `${BASIS_PFAD}/marke/trendonix.png`,
  sameAs: kanalAdressen(),
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
}[]) => kaufwege.map((k) => ({
  '@type': 'Book',
  bookFormat: FORMEN[k.form] ?? 'https://schema.org/Paperback',
  url: k.url,
  inLanguage: 'de',
  ...(k.isbn ? { isbn: k.isbn } : {}),
  ...(k.preis
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
