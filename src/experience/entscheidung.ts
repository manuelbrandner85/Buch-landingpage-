import type {
  Dienstlage,
  Entscheidung,
  Geraet,
  Leserwunsch,
  Messwerte,
  Netz,
  Stufe,
  Szenenbedarf,
} from './typen';
import { startstufe } from './geraet';
import { netzTraegtStreaming } from './netz';
import { gedeckelt, rang } from './stufen';

/**
 * Die Entscheidungsstelle.
 *
 * Diese Datei kennt keinen Browser, keine Uhr und keinen Zufall. Sie bekommt
 * Zahlen und gibt eine Entscheidung zurück. Das ist keine Stilfrage: Nur so
 * lässt sich die gesamte Gerätematrix — vom Spielerechner bis zum alten
 * Telefon — durchrechnen, ohne ein einziges dieser Geräte zu besitzen. Alles
 * Browserabhängige liegt in `geraet.ts`, `netz.ts` und `messung.ts`.
 */

export interface Lage {
  geraet: Geraet;
  netz: Netz;
  bedarf: Szenenbedarf;
  wunsch: Leserwunsch;
  dienste: Dienstlage;
  /** Erst vorhanden, wenn die Szene ein paar Sekunden lief. */
  messwerte?: Messwerte;
}

export function entscheiden(lage: Lage): Entscheidung {
  const { geraet, netz, bedarf, wunsch, dienste } = lage;
  const gruende: string[] = [];

  // --------------------------------------------------- oertliche Einstufung
  let stufe = startstufe(geraet);
  gruende.push(`Geraet ergibt als Startstufe ${stufe}.`);

  // Zwei ausdrückliche Entscheidungen des Lesers wiegen schwerer als jede
  // Messung. Das ist kein Leistungsurteil über sein Gerät — er hat gesagt,
  // was er will.
  if (geraet.wenigerBewegung) {
    stufe = gedeckelt(stufe, 'OPTIMIERT');
    gruende.push('Weniger Bewegung gewuenscht — hoechstens OPTIMIERT.');
  }
  if (netz.datensparen || wunsch.datensparen) {
    stufe = gedeckelt(stufe, 'OPTIMIERT');
    gruende.push('Datensparen aktiv — hoechstens OPTIMIERT.');
  }

  // Gemessene Bildraten schlagen die Vermutung aus dem Gerät.
  if (lage.messwerte && lage.messwerte.proben >= 60) {
    const m = lage.messwerte;
    if (m.bilderJeSekunde < 30) {
      stufe = gedeckelt(stufe, 'RUECKFALL');
      gruende.push(
        `Gemessen ${m.bilderJeSekunde.toFixed(0)} fps — das Geraet haelt seine Startstufe nicht.`,
      );
    } else if (m.bilderJeSekunde < 45) {
      stufe = gedeckelt(stufe, 'OPTIMIERT');
      gruende.push(`Gemessen ${m.bilderJeSekunde.toFixed(0)} fps — auf OPTIMIERT gedeckelt.`);
    }
  }

  // Trägt das Gerät die Szene örtlich? Zwei Arten zu scheitern: gar keine
  // Rendermöglichkeit, oder eine, die unter dem Mindestmass der Szene bleibt.
  const kannOertlich = geraet.webgpu || geraet.webgl2;
  const zuSchwach =
    rang(bedarf.mindestens) >= 0 && rang(stufe) > rang(bedarf.mindestens);
  const oertlichGescheitert = !kannOertlich || zuSchwach;

  if (!kannOertlich) {
    gruende.push('Weder WebGPU noch WebGL2 — oertlich ist nichts zu rechnen.');
  } else if (zuSchwach) {
    gruende.push(
      `Szene "${bedarf.name}" braucht mindestens ${bedarf.mindestens}, oertlich reicht es nur fuer ${stufe}.`,
    );
  }

  // ------------------------------------------------------- die Kostenbremse
  //
  // Eine Grafikkarte im Rechenzentrum kostet Geld, solange sie läuft. Sie
  // startet deshalb nur in zwei Fällen: Das Gerät schafft es örtlich nicht,
  // ODER der Leser hat die grosse Fassung ausdrücklich angefordert — bei
  // einem Buch heisst das: er hat „Welt betreten" gedrückt.
  //
  // Ohne diese Regel mietet ein Spielerechner an Glasfaser Rechenzeit an, die
  // er nicht braucht, und das fällt erst auf der Rechnung auf. Und: Pixel
  // Streaming startet NIE beim Laden der Seite. Ein Leser, der die Szene noch
  // gar nicht geöffnet hat, belegt keine GPU.
  const streamenErlaubt =
    bedarf.unrealMoeglich &&
    dienste.gpuFrei &&
    netzTraegtStreaming(netz) &&
    (oertlichGescheitert || wunsch.grosseFassungGewuenscht);

  // Der ausdrückliche Wunsch des Lesers steht über allem ausser der
  // Machbarkeit — auch über der Kostenbremse, denn er hat selbst gedrueckt.
  if (wunsch.stufe !== 'AUTO') {
    if (wunsch.stufe === 'GESTREAMT' && !streamenErlaubt) {
      gruende.push('GESTREAMT gewuenscht, aber nicht moeglich — oertlicher Weg.');
    } else {
      return {
        stufe: wunsch.stufe,
        gruende: [...gruende, `Leser hat ${wunsch.stufe} fest gewaehlt.`],
      };
    }
  }

  if (streamenErlaubt) {
    const grund = wunsch.grosseFassungGewuenscht
      ? 'Leser hat die grosse Fassung angefordert'
      : 'oertlich nicht darstellbar, Leitung traegt aber ein Bild aus dem Rechenzentrum';
    return { stufe: 'GESTREAMT', gruende: [...gruende, `GESTREAMT: ${grund}.`] };
  }

  if (bedarf.unrealMoeglich && !dienste.gpuFrei) {
    gruende.push('Keine freie Grafikkarte im Rechenzentrum — oertlicher Weg.');
  }

  if (!kannOertlich || stufe === 'RUECKFALL') {
    if (!bedarf.rueckfallVorhanden) {
      gruende.push(
        'Achtung: Fuer diese Szene gibt es kein vorgerendertes Material — es bleibt ein Standbild.',
      );
    }
    return {
      stufe: 'RUECKFALL',
      gruende: [...gruende, 'RUECKFALL: vorgerendertes Material statt Echtzeit.'],
    };
  }

  return { stufe, gruende: [...gruende, `${stufe}, oertlich gerechnet.`] };
}

/**
 * Die nächste Sicherung, wenn eine Stufe im Betrieb ausfällt.
 *
 * Kein Fehlerbild, keine technische Meldung — der Leser sieht nur, dass die
 * Seite weiterläuft. Wer hier eine Meldung einblendet, macht aus einem
 * abgefangenen Ausfall einen sichtbaren Defekt. Ein dezenter Vermerk ist
 * zulässig, eine Fehlerbox nicht.
 *
 * Die Kette aus dem Auftrag:
 *   Pixel Streaming → Three.js/WebGL → Video → Bild
 */
export function naechsteStufe(aktuell: Stufe, geraet: Geraet): Stufe {
  if (aktuell === 'GESTREAMT') {
    if (geraet.webgpu) return 'HIGH_END';
    if (geraet.webgl2) return 'OPTIMIERT';
    return 'RUECKFALL';
  }
  if (aktuell === 'HIGH_END') {
    return geraet.webgl2 ? 'OPTIMIERT' : 'RUECKFALL';
  }
  return 'RUECKFALL';
}
