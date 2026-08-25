/**
 * Das Haus über den Reihen.
 *
 * Trendonix ist der Name, unter dem veröffentlicht wird – er steht auf den
 * gedruckten Umschlägen und auf allen Kanälen. Er ist damit das einzige, was
 * über alle Themen hinweg trägt: Eine Reihe endet, ein Haus nicht.
 *
 * Was hier steht, ist Haltung, keine Ankündigung. Kein Titel, der noch nicht
 * erschienen ist, wird hier erwähnt – auch nicht angedeutet.
 */
export interface Haus {
  name: string;
  /** Der eine Satz über der Startseite. */
  versprechen: string;
  /** Das Verfahren, das alle Bücher teilen – unabhängig vom Thema. */
  arbeitsweise: string;
}

export const TRENDONIX: Haus = {
  name: 'Trendonix',
  versprechen: 'Bücher über das, was zwischen den Dingen liegt.',
  arbeitsweise:
    'Jeder Band beginnt bei etwas Sichtbarem – einem Feuer, einer Münze, einer Maschine – '
    + 'und fragt, welcher unsichtbare Faden daran hängt. Behauptet wird nichts, was sich '
    + 'nicht prüfen lässt: Jede Seite nennt, woher sie es weiß.',
};

/**
 * Warum hier keine Namen stehen.
 *
 * Die Bände tragen im Druck Trendonix in der Verlagszeile, und alle Kanäle
 * laufen unter diesem Namen. Eine Website, die daneben zwei Vornamen führt,
 * baut eine zweite Marke auf, die niemand kennt – und schwächt die eine, die
 * es schon gibt. Wer wirklich dahintersteht, gehört ins Impressum: dort ist es
 * Pflicht, dort ist es richtig, und dort sucht man es auch.
 */
