import type { Messwerte } from './typen';

/**
 * Was im Betrieb tatsächlich herauskommt.
 *
 * Eine Vermutung aus dem Gerätepunktestand ist eine Vermutung. Erst die
 * gemessene Bildrate sagt, ob sie stimmt. Die Messung läuft deshalb im
 * laufenden Bild mit — sie hält nichts an und rechnet nichts zusätzlich.
 *
 * Der Mittelwert allein genügt nicht: Eine Szene mit 58 Bildern je Sekunde im
 * Mittel und 120 ms im 95. Perzentil ruckelt sichtbar. Deshalb wird beides
 * geführt.
 */

/** Index des Perzentils in einer aufsteigend sortierten Reihe. */
export function perzentilStelle(anzahl: number, anteil: number): number {
  return Math.min(anzahl - 1, Math.max(0, Math.ceil(anteil * anzahl) - 1));
}

/** Ein Ringpuffer fester Länge — keine Allokation im Bild. */
export class Bildzeiten {
  private readonly puffer: Float64Array;
  private schreibstelle = 0;
  private gefuellt = 0;

  constructor(laenge = 120) {
    this.puffer = new Float64Array(laenge);
  }

  hinzu(ms: number): void {
    // Ausreisser nach oben abschneiden: Ein Tabwechsel oder ein Lauf der
    // Speicherbereinigung erzeugt Bildzeiten von mehreren hundert
    // Millisekunden. Die sind echt, sagen aber nichts über die Szene aus —
    // und ein einziger solcher Wert verschiebt das Perzentil so weit, dass
    // die Stufe grundlos fällt.
    this.puffer[this.schreibstelle] = ms > 500 ? 500 : ms;
    this.schreibstelle = (this.schreibstelle + 1) % this.puffer.length;
    if (this.gefuellt < this.puffer.length) this.gefuellt++;
  }

  get proben(): number {
    return this.gefuellt;
  }

  leeren(): void {
    this.schreibstelle = 0;
    this.gefuellt = 0;
  }

  /** Auswertung. Ohne Proben kommt `undefined` zurück — nicht geraten. */
  auswerten(): Messwerte | undefined {
    if (this.gefuellt === 0) return undefined;

    let summe = 0;
    for (let i = 0; i < this.gefuellt; i++) summe += this.puffer[i]!;
    const mittel = summe / this.gefuellt;

    const sortiert = Array.from(this.puffer.subarray(0, this.gefuellt)).sort(
      (a, b) => a - b,
    );

    return {
      bilderJeSekunde: mittel > 0 ? 1000 / mittel : 0,
      bildzeitMittel: mittel,
      bildzeitP95: sortiert[perzentilStelle(this.gefuellt, 0.95)]!,
      proben: this.gefuellt,
    };
  }
}

/**
 * Ein kurzer Anlauf, bevor die Szene steht.
 *
 * Er misst nicht die Grafikkarte, sondern das Zusammenspiel aus Browser,
 * Bildschirmtakt und dem, was sonst noch auf dem Gerät läuft. Deshalb ist er
 * absichtlich kurz: Ein Anlauf, den der Leser bemerkt, hat seinen Zweck
 * verfehlt — er soll ja gerade verhindern, dass etwas stockt.
 *
 * Die ersten Bilder werden verworfen. In ihnen stecken Shaderübersetzung,
 * erste Texturübertragung und Layout — Kosten, die nur einmal anfallen und
 * die Messung sonst um den Faktor drei verfälschen.
 */
export async function anlaufMessen(
  bilder = 40,
  verwerfen = 8,
): Promise<Messwerte | undefined> {
  const raf = globalThis.requestAnimationFrame;
  if (typeof raf !== 'function') return undefined;

  const zeiten = new Bildzeiten(bilder);

  return new Promise<Messwerte | undefined>((fertig) => {
    let zaehler = 0;
    let vorher = globalThis.performance?.now?.() ?? Date.now();

    const schritt = (): void => {
      const jetzt = globalThis.performance?.now?.() ?? Date.now();
      const dauer = jetzt - vorher;
      vorher = jetzt;
      zaehler++;

      if (zaehler > verwerfen) zeiten.hinzu(dauer);
      if (zaehler >= bilder + verwerfen) {
        fertig(zeiten.auswerten());
        return;
      }
      raf(schritt);
    };

    raf(schritt);
  });
}
