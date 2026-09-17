import type { Budget, Messwerte, Netz, Stufe } from './typen';
import { modellfassungFuerLeitung } from './netz';
import { budgetFuer, hoeher, tiefer } from './stufen';

/**
 * Der Regler.
 *
 * Er entscheidet nicht, WO gerechnet wird — das hat die Entscheidungsstelle
 * getan. Er entscheidet, ob die gewählte Stufe im Betrieb hält, und schaltet
 * zurück, bevor der Leser ein Ruckeln als Fehler liest.
 *
 * Zwei Dinge, die diese Datei bewusst NICHT tut:
 *
 *   1. Sie fasst nichts an. Sie gibt eine Anweisung zurück; das Umsetzen ist
 *      Sache der Szene. Nur so lässt sich das gesamte Regelverhalten über
 *      Stunden gedachter Bildzeiten durchrechnen, ohne einen Browser.
 *   2. Sie kennt keine Uhr. Zeit kommt als Parameter herein. Ein Regler mit
 *      eigener Uhr ist in Tests entweder langsam oder unehrlich.
 */

/** Was an der Szene gedreht werden kann, in der Reihenfolge des Zugriffs. */
export type Stellschraube =
  | 'renderskalierung'
  | 'nachbearbeitung'
  | 'partikel'
  | 'schatten'
  | 'lodDistanz';

/**
 * Die Reihenfolge ist nicht beliebig.
 *
 * Zuerst kommt, was am meisten bringt und am wenigsten auffällt: die
 * Renderskalierung. Ein Bild in 85 % der Pixel und wieder hochskaliert sieht
 * fast gleich aus und kostet ein Drittel weniger. Zuletzt kommen die
 * LOD-Distanzen, denn dort verändert sich sichtbar die Silhouette der Objekte
 * — und eine Silhouette, die im Stehen umspringt, sieht nach Defekt aus.
 */
export const REIHENFOLGE: readonly Stellschraube[] = [
  'renderskalierung',
  'nachbearbeitung',
  'partikel',
  'schatten',
  'lodDistanz',
];

export type Massnahme =
  | { art: 'nichts' }
  | { art: 'drosseln'; schraube: Stellschraube; grund: string }
  | { art: 'stufeRunter'; ziel: Stufe; grund: string }
  | { art: 'stufeRauf'; ziel: Stufe; grund: string };

export interface Reglerstand {
  stufe: Stufe;
  /** Bereits gezogene Stellschrauben. */
  gedrosselt: Stellschraube[];
  /** Millisekunden, bis wieder eingegriffen werden darf. */
  sperreBis: number;
  /** Stufen, die sich nicht gehalten haben, mit Anzahl der Versuche. */
  gescheitert: Record<string, number>;
  /** Seit wann läuft es ununterbrochen gut? `undefined` = nicht gut. */
  gutSeit?: number;
}

export interface Reglerregeln {
  /** Darunter wird sofort eine ganze Stufe zurückgenommen. */
  stufeRunterUnter: number;
  /** Darunter wird zuerst an den Stellschrauben gedreht. */
  drosselnUnter: number;
  /** Darüber darf vorsichtig erhöht werden. */
  raufAb: number;
  /** So lange muss es gut laufen, bevor erhöht wird (ms). */
  ruheVorErhoehung: number;
  /** Sperre nach jedem Eingriff (ms). */
  sperre: number;
  /** Mindestzahl Proben, bevor überhaupt geregelt wird. */
  mindestProben: number;
  /** Bildzeit im 95. Perzentil, ab der es trotz gutem Mittel ruckelt (ms). */
  p95Grenze: number;
  /** Ab so vielen Fehlversuchen wird eine Stufe nicht mehr angeboten. */
  aufgeben: number;
}

export const REGELN: Readonly<Reglerregeln> = Object.freeze({
  stufeRunterUnter: 30,
  drosselnUnter: 40,
  raufAb: 55,
  ruheVorErhoehung: 10_000,
  // Nach jedem Eingriff drei Sekunden Ruhe. Ohne diese Sperre regelt der
  // Regler gegen seine eigene letzte Massnahme: Der Messpuffer enthält noch
  // die schlechten Werte von vorher, also greift er erneut ein — und landet
  // binnen einer Sekunde ganz unten, obwohl die erste Massnahme gereicht
  // hätte.
  sperre: 3_000,
  mindestProben: 60,
  p95Grenze: 100,
  aufgeben: 2,
});

export function standErstellen(stufe: Stufe): Reglerstand {
  return { stufe, gedrosselt: [], sperreBis: 0, gescheitert: {} };
}

/** Eine Runde regeln. Rein: gleiche Eingaben, gleiche Antwort. */
export function regeln(
  stand: Reglerstand,
  mess: Messwerte | undefined,
  jetzt: number,
  r: Reglerregeln = REGELN,
): { stand: Reglerstand; massnahme: Massnahme } {
  const nichts = (s: Reglerstand) => ({ stand: s, massnahme: { art: 'nichts' } as Massnahme });

  // GESTREAMT wird nicht geregelt: Dort rechnet das Rechenzentrum, und eine
  // schlechte Bildrate im Browser hiesse Leitungsproblem, nicht Lastproblem.
  // Dafuer ist die Rueckfallkette zustaendig, nicht der Regler.
  if (stand.stufe === 'GESTREAMT') return nichts(stand);

  if (!mess || mess.proben < r.mindestProben) return nichts(stand);
  if (jetzt < stand.sperreBis) return nichts(stand);

  const fps = mess.bilderJeSekunde;
  const ruckelt = mess.bildzeitP95 > r.p95Grenze;

  if (fps < r.stufeRunterUnter) {
    return runter(stand, jetzt, r, `${fps.toFixed(0)} fps — eine ganze Stufe zurueck.`);
  }

  if (fps < r.drosselnUnter || ruckelt) {
    const offen = REIHENFOLGE.find((s) => !stand.gedrosselt.includes(s));

    if (offen) {
      const grund =
        ruckelt && fps >= r.drosselnUnter
          ? `${mess.bildzeitP95.toFixed(0)} ms im 95. Perzentil — es ruckelt trotz ${fps.toFixed(0)} fps.`
          : `${fps.toFixed(0)} fps — ${offen} zuruecknehmen.`;
      return {
        stand: {
          ...stand,
          gedrosselt: [...stand.gedrosselt, offen],
          sperreBis: jetzt + r.sperre,
          gutSeit: undefined,
        },
        massnahme: { art: 'drosseln', schraube: offen, grund },
      };
    }

    return runter(
      stand,
      jetzt,
      r,
      `${fps.toFixed(0)} fps trotz aller Drosselungen — eine Stufe zurueck.`,
    );
  }

  // --------------------------------------------------------- es laeuft gut
  if (fps >= r.raufAb && !ruckelt) {
    const gutSeit = stand.gutSeit ?? jetzt;
    if (jetzt - gutSeit < r.ruheVorErhoehung) return nichts({ ...stand, gutSeit });

    // Erst die Drosselungen zurücknehmen — in umgekehrter Reihenfolge,
    // zuletzt Gezogenes zuerst. Die Stufe zu erhöhen, während die Szene noch
    // gedrosselt läuft, hiesse zweimal gleichzeitig teurer zu werden.
    if (stand.gedrosselt.length > 0) {
      const zurueck = stand.gedrosselt[stand.gedrosselt.length - 1]!;
      return {
        stand: {
          ...stand,
          gedrosselt: stand.gedrosselt.slice(0, -1),
          sperreBis: jetzt + r.sperre,
          gutSeit: undefined,
        },
        massnahme: {
          art: 'drosseln',
          schraube: zurueck,
          grund: `${fps.toFixed(0)} fps stabil — ${zurueck} wieder zurueckgeben.`,
        },
      };
    }

    const ziel = hoeher(stand.stufe);
    if (ziel === stand.stufe) return nichts({ ...stand, gutSeit });

    // Eine Stufe, die schon zweimal aufgegeben wurde, wird nicht erneut
    // angeboten. Sonst pendelt die Seite für den Rest des Besuchs zwischen
    // zwei Stufen — und genau dieses Pendeln ist auffälliger als die
    // dauerhaft niedrigere Stufe.
    if ((stand.gescheitert[ziel] ?? 0) >= r.aufgeben) return nichts({ ...stand, gutSeit });

    return {
      stand: {
        ...stand,
        stufe: ziel,
        gedrosselt: [],
        sperreBis: jetzt + r.sperre,
        gutSeit: undefined,
      },
      massnahme: {
        art: 'stufeRauf',
        ziel,
        grund: `${fps.toFixed(0)} fps ueber ${Math.round(r.ruheVorErhoehung / 1000)} Sekunden — vorsichtig auf ${ziel}.`,
      },
    };
  }

  // Zwischen drosselnUnter und raufAb: brauchbar. Nichts zu tun ist hier die
  // richtige Handlung — dieser Bereich existiert nur, damit der Regler nicht
  // an jeder Grenze klebt.
  return nichts({ ...stand, gutSeit: undefined });
}

function runter(
  stand: Reglerstand,
  jetzt: number,
  r: Reglerregeln,
  grund: string,
): { stand: Reglerstand; massnahme: Massnahme } {
  const ziel = tiefer(stand.stufe);

  // Unterste Stufe erreicht. Tiefer geht es nicht.
  if (ziel === stand.stufe) return { stand, massnahme: { art: 'nichts' } };

  return {
    stand: {
      stufe: ziel,
      /**
       * Die Drosselungen bleiben stehen.
       *
       * Sie hier zu leeren wäre naheliegend — neue Stufe, neuer Anfang — und
       * es wäre falsch: Eine Stufe wird erst zurückgenommen, wenn alle fünf
       * Stellschrauben gezogen sind und es immer noch klemmt. Wer sie dabei
       * zurückgibt, macht die Szene im selben Zug WIEDER TEURER, und der
       * Leser sieht es genau dann ruckeln, wenn ihn das System entlasten
       * wollte.
       *
       * Zurückgegeben wird über den Aufwärtsweg: Läuft es zehn Sekunden
       * stabil, kommt eine Schraube zurück, dann die nächste. Das findet von
       * selbst den Punkt, an dem es gerade noch trägt.
       */
      gedrosselt: [...stand.gedrosselt],
      sperreBis: jetzt + r.sperre,
      gescheitert: {
        ...stand.gescheitert,
        [stand.stufe]: (stand.gescheitert[stand.stufe] ?? 0) + 1,
      },
      gutSeit: undefined,
    },
    massnahme: { art: 'stufeRunter', ziel, grund },
  };
}

/**
 * Das wirksame Budget: Stufenbudget plus die gezogenen Stellschrauben.
 *
 * Damit bleibt der Zustand an einer Stelle. Die Szene fragt nicht „welche
 * Stufe und welche Drosselungen", sondern bekommt fertige Zahlen.
 */
export function wirksamesBudget(stand: Reglerstand, netz?: Netz): Budget {
  const b: Budget = { ...budgetFuer(stand.stufe) };

  for (const schraube of stand.gedrosselt) {
    switch (schraube) {
      case 'renderskalierung':
        b.aufloesungsskala = Math.max(0.5, b.aufloesungsskala * 0.8);
        break;
      case 'nachbearbeitung':
        b.nachbearbeitung =
          b.nachbearbeitung === 'voll'
            ? 'reduziert'
            : b.nachbearbeitung === 'reduziert'
              ? 'minimal'
              : 'keine';
        break;
      case 'partikel':
        b.partikel = b.partikel * 0.4;
        break;
      case 'schatten':
        b.schatten = b.schatten === 'gross' ? 'klein' : 'aus';
        break;
      case 'lodDistanz':
        b.lodStart = Math.min(3, b.lodStart + 1) as Budget['lodStart'];
        // Eine gröbere LOD-Stufe heisst auch: die kleinere Modellfassung.
        // Sonst wird die feine Datei geladen und dann nicht benutzt.
        b.modellfassung =
          b.modellfassung === 'high'
            ? 'medium'
            : b.modellfassung === 'medium'
              ? 'low'
              : b.modellfassung;
        break;
    }
  }

  /**
   * Zuletzt die Leitung.
   *
   * Sie kommt nach den Stellschrauben und nicht davor: Was der Regler an der
   * Modellfassung schon gesenkt hat, soll nicht wieder angehoben werden. Und
   * sie greift NUR an der Modellfassung — alles andere in diesem Budget ist
   * Rechenaufwand, und der wird von einer schlechten Leitung nicht kleiner.
   */
  if (netz) b.modellfassung = modellfassungFuerLeitung(b.modellfassung, netz);

  return b;
}
