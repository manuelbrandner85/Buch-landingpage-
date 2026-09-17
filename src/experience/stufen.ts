import type { Budget, Stufe } from './typen';

/**
 * Die vier Stufen als Zahlen.
 *
 * Alle vier tragen dieselbe Komposition, dieselbe Farbwelt und dieselbe
 * Wirkung. Was sich ändert, ist ausschliesslich der Aufwand. RUECKFALL ist
 * deshalb kein Fehlerbild, sondern eine eigene Fassung mit vorgerechnetem
 * Material — sie muss so aussehen, als sei sie so gemeint.
 *
 * GESTREAMT hat absichtlich die Zahlen von HIGH_END: Dort rechnet eine echte
 * Grafikkarte im Rechenzentrum. Was das Gerät des Lesers kann, spielt für die
 * Bildqualität dann keine Rolle mehr — nur noch für die Bedienbarkeit, und die
 * hängt an der Leitung.
 */
export const BUDGETS: Readonly<Record<Stufe, Budget>> = Object.freeze({
  HIGH_END: {
    aufloesungsskala: 1.0,
    dichteDeckel: 2.0,
    partikel: 1.0,
    texturKante: 4096,
    schatten: 'gross',
    licht: 'dynamisch',
    nachbearbeitung: 'voll',
    animation: 'voll',
    lodStart: 0,
    reflexionen: true,
    modellfassung: 'high',
  },
  OPTIMIERT: {
    aufloesungsskala: 0.85,
    // Der wirksamste einzelne Hebel auf Telefonen: von 3,0 auf 1,5 viertelt
    // die Pixelzahl, und man sieht es kaum.
    dichteDeckel: 1.5,
    partikel: 0.3,
    texturKante: 1024,
    schatten: 'klein',
    licht: 'gemischt',
    nachbearbeitung: 'minimal',
    animation: 'reduziert',
    lodStart: 1,
    reflexionen: false,
    modellfassung: 'medium',
  },
  GESTREAMT: {
    aufloesungsskala: 1.0,
    dichteDeckel: 2.0,
    partikel: 1.0,
    texturKante: 4096,
    schatten: 'gross',
    licht: 'dynamisch',
    nachbearbeitung: 'voll',
    animation: 'voll',
    lodStart: 0,
    reflexionen: true,
    // Nichts wird lokal geladen — das Bild kommt als Video.
    modellfassung: 'keine',
  },
  RUECKFALL: {
    aufloesungsskala: 1.0,
    dichteDeckel: 1.0,
    partikel: 0,
    texturKante: 1600,
    schatten: 'aus',
    licht: 'vorgerendert',
    nachbearbeitung: 'keine',
    animation: 'video',
    lodStart: 3,
    reflexionen: false,
    modellfassung: 'keine',
  },
});

/**
 * Die Leiter, auf der der Regler auf- und absteigt.
 *
 * GESTREAMT steht absichtlich NICHT darauf. Es ist keine Zwischenstufe
 * zwischen örtlich und gar nicht, sondern eine andere Achse: Dort kostet das
 * Gerät des Lesers fast nichts, weil es nur ein Video dekodiert. Eine
 * einbrechende Bildrate darf deshalb niemals dorthin führen — das würde bei
 * jedem Ruckler eine Grafikkarte im Rechenzentrum anmieten.
 *
 * Betreten und verlassen wird GESTREAMT ausschliesslich durch die
 * Entscheidungsstelle und durch einen Ausfall.
 */
export const OERTLICHE_STUFEN: readonly Stufe[] = [
  'HIGH_END',
  'OPTIMIERT',
  'RUECKFALL',
];

/** Rang auf der örtlichen Leiter. -1, wenn die Stufe nicht darauf steht. */
export function rang(stufe: Stufe): number {
  return OERTLICHE_STUFEN.indexOf(stufe);
}

/** Eine Stufe tiefer. RUECKFALL bleibt RUECKFALL. */
export function tiefer(stufe: Stufe, schritte = 1): Stufe {
  const i = rang(stufe);
  if (i < 0) return stufe;
  return OERTLICHE_STUFEN[Math.min(OERTLICHE_STUFEN.length - 1, i + schritte)]!;
}

/** Eine Stufe höher. HIGH_END bleibt HIGH_END. */
export function hoeher(stufe: Stufe, schritte = 1): Stufe {
  const i = rang(stufe);
  if (i < 0) return stufe;
  return OERTLICHE_STUFEN[Math.max(0, i - schritte)]!;
}

/** Die niedrigere zweier örtlicher Stufen — der Deckel gewinnt. */
export function gedeckelt(stufe: Stufe, deckel: Stufe): Stufe {
  const a = rang(stufe);
  const b = rang(deckel);
  if (a < 0 || b < 0) return stufe;
  return a > b ? stufe : deckel;
}

export function budgetFuer(stufe: Stufe): Budget {
  return BUDGETS[stufe];
}
