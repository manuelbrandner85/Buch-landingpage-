import type { Szenenbedarf } from './typen';
import { BEDARFSMUSTER } from './bedarf';

/**
 * Was ein Buch an digitaler Inszenierung verträgt — und was nicht.
 *
 * Die wichtigste Antwort dieser Datei ist oft „kein 3D". Ein statisches Cover
 * ist ein optimiertes Bild; eine filmische Szene ohne Interaktion ist ein
 * vorgerendertes Video; ein 3D-Buch mit zwei Animationen gehört auf keinen
 * GPU-Server. Blender und Unreal sind Werkzeuge, keine Vorgabe.
 *
 * Rein und prüfbar: Die Empfehlung muss nachvollziehbar sein, sonst wird sie
 * zur Geschmacksfrage.
 */

export type Genre =
  | 'sachbuch'
  | 'historischer-roman'
  | 'fantasy'
  | 'thriller'
  | 'science-fiction'
  | 'satire';

export interface Buchsteckbrief {
  titel: string;
  genre: Genre;
  /** Gibt es einen Handlungsort, der sich zeigen laesst? */
  schauplatzVorhanden: boolean;
  /** Spielt die Zeit eine Rolle — Epochen, Entwicklungen, Zeitleiste? */
  zeitlicheTiefe: boolean;
  /** Gibt es Figuren, die man sehen will? */
  figurenImVordergrund: boolean;
  /** Soll der Leser selbst etwas tun koennen, oder nur zusehen? */
  interaktionGewuenscht: boolean;
}

export type Element =
  | 'cover-3d'
  | 'karte'
  | 'zeitleiste'
  | 'datenbild'
  | 'schauplatz'
  | 'figur'
  | 'partikel'
  | 'kamerafahrt'
  | 'ton'
  | 'standbild';

export interface Empfehlung {
  elemente: Element[];
  /** Welcher Weg fuer den schwersten Teil sinnvoll ist. */
  technik: 'kein-3d' | 'video' | 'three' | 'unreal';
  bedarf: Szenenbedarf;
  gruende: string[];
}

/** Was jedes Genre von Haus aus mitbringt. */
const NACH_GENRE: Record<Genre, Element[]> = {
  // Ein Sachbuch lebt von Belegen, nicht von Atmosphaere. Diagramme, Karten
  // und eine Zeitleiste tragen hier mehr als jede Landschaft.
  sachbuch: ['datenbild', 'karte', 'zeitleiste'],
  'historischer-roman': ['karte', 'zeitleiste', 'schauplatz'],
  fantasy: ['schauplatz', 'figur', 'partikel'],
  // Dunkel und filmisch. Bewegung subtil — ein Thriller, der funkelt, ist
  // kein Thriller mehr.
  thriller: ['kamerafahrt', 'ton', 'standbild'],
  'science-fiction': ['schauplatz', 'partikel', 'kamerafahrt'],
  // Satire nimmt sich selbst nicht ernst. Aufwaendige 3D-Welten wirken hier
  // unfreiwillig komisch — im falschen Sinn.
  satire: ['cover-3d', 'datenbild'],
};

export function empfehlung(b: Buchsteckbrief): Empfehlung {
  const gruende: string[] = [];
  const elemente = new Set<Element>(NACH_GENRE[b.genre]);
  gruende.push(`Genre "${b.genre}" bringt ${NACH_GENRE[b.genre].join(', ')} mit.`);

  if (!b.schauplatzVorhanden) {
    elemente.delete('schauplatz');
    gruende.push('Kein zeigbarer Handlungsort — Schauplatz faellt weg.');
  }
  if (!b.zeitlicheTiefe) {
    elemente.delete('zeitleiste');
    gruende.push('Keine zeitliche Tiefe — Zeitleiste faellt weg.');
  }
  if (!b.figurenImVordergrund) {
    elemente.delete('figur');
    gruende.push('Figuren stehen nicht im Vordergrund — Figurendarstellung faellt weg.');
  }

  // Das Cover gibt es immer. Ob es sich dreht, entscheidet die Technik weiter
  // unten — als Bild ist es ohnehin da.
  elemente.add('cover-3d');

  const liste = [...elemente];

  // ---------------------------------------------------------- Technikwahl
  //
  // Die Reihenfolge ist absichtlich so: Erst wird geprüft, ob es überhaupt
  // ohne 3D geht. Das ist die häufigste richtige Antwort und die, die am
  // seltensten gegeben wird.

  const nurFlaches = liste.every((e) =>
    (['cover-3d', 'datenbild', 'karte', 'zeitleiste', 'standbild'] as Element[]).includes(e),
  );

  if (nurFlaches && !b.interaktionGewuenscht) {
    gruende.push(
      'Nur Flaches und keine Interaktion gewuenscht — ein optimiertes Bild mit dezenter Bewegung reicht. Kein 3D.',
    );
    return {
      elemente: liste,
      technik: 'kein-3d',
      bedarf: BEDARFSMUSTER.stimmung(b.titel),
      gruende,
    };
  }

  const schwer = liste.includes('schauplatz');

  if (schwer && b.interaktionGewuenscht) {
    // Begehbar heisst: der Leser bewegt sich frei. Das ist der einzige Fall,
    // der eine Grafikkarte im Rechenzentrum wirklich rechtfertigt.
    gruende.push(
      'Begehbarer Schauplatz mit freier Bewegung — das ist der Fall, fuer den Pixel Streaming gebaut ist.',
    );
    return { elemente: liste, technik: 'unreal', bedarf: BEDARFSMUSTER.schauplatz(b.titel), gruende };
  }

  if (schwer && !b.interaktionGewuenscht) {
    // Ein Schauplatz, durch den nur die Kamera fährt, ist ein Film. Ihn
    // live zu rechnen kostet Geld und bringt nichts, was ein Video nicht
    // auch kann.
    gruende.push(
      'Schauplatz ohne Interaktion — eine vorgerenderte Sequenz sieht besser aus und kostet nichts.',
    );
    return { elemente: liste, technik: 'video', bedarf: BEDARFSMUSTER.stimmung(b.titel), gruende };
  }

  gruende.push('Ueberschaubare Szene mit Interaktion — oertliches Echtzeit-3D.');
  return {
    elemente: liste,
    technik: 'three',
    bedarf: liste.includes('karte')
      ? BEDARFSMUSTER.karte(b.titel)
      : BEDARFSMUSTER.buchobjekt(b.titel),
    gruende,
  };
}
