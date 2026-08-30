/**
 * Der Verteiler.
 *
 * Bewusst nur eine Adresse und ein Schalter. Die Seite wird statisch
 * exportiert – es gibt keinen Server, der eine Anmeldung entgegennehmen
 * könnte, und ein Schlüssel im Code wäre öffentlich. Deshalb nimmt ein
 * gehostetes Formular die Adresse entgegen; hier steht nur, wohin es geht.
 *
 * Solange `formular` leer ist, zeigt die Seite den Abschnitt gar nicht an.
 * Ein Anmeldefeld, das ins Leere läuft, ist schlimmer als keines: Wer sich
 * einträgt und nie etwas hört, kommt nicht wieder.
 *
 * **Was hier versprochen wird, ist eine Verpflichtung.** Wer das ändert,
 * ändert ein Versprechen, das Menschen mit ihrer Adresse bezahlt haben.
 *
 * Stand 30.08.2026 (Uwe): Es gibt **kein Leseexemplar** mehr. Eintragen kann
 * man sich für zwei Dinge, einzeln wählbar:
 *   1. Bucherscheinung – eine kurze Nachricht, wenn ein Band erschienen ist.
 *   2. Newsletter – etwa monatlich, über die Arbeit an den nächsten Bänden.
 * Die frühere Zusage „nächster Band zuerst als Leseexemplar" ist damit
 * aufgehoben. Sie stand vom 28.08. bis 30.08.2026 auf der Seite; in dieser
 * Zeit haben sich zwei Adressen eingetragen, beide dem Haus bekannt.
 *
 * Ein Titel oder Datum eines noch nicht erschienenen Bandes steht hier
 * weiterhin bewusst *nicht* – Hausregel 4: angekündigt wird, was zu haben ist.
 */
export type Verteiler = {
  /** Vollständige Adresse des gehosteten Formulars (POST-Ziel). Leer = aus. */
  formular: string;
  /** Überschrift des Abschnitts. */
  titel: string;
  /** Zwei Sätze darunter. Kein Werbeton, keine Ausrufezeichen. */
  text: string;
  /** Was auf dem Knopf steht. */
  knopf: string;
  /** Was tatsächlich verschickt wird – ehrlich, nicht schöngeredet. */
  versprechen: string;
};

export const VERTEILER: Verteiler = {
  formular:
    'https://fc625fea.sibforms.com/serve/MUIFAJpcYPlvHXtS_Kis1MiiXqABz4Yv_WejEh3rHJEYh6tsrWOFpmsq0qwpXXOUuKFFW8q8UiuviVfVJXm4kmPfYPbrutLPBl3EZKIiFduqeRRv998z8fKCvrrl4qGGjldgX82FwMVl5Dnof-s0D1mChU0jTTW_IR2WpYNSUu6NRj7t0yHS7ct4BceXYIhAxzXTjfK2CUTvHFORiw==',
  titel: 'Erfahren, wenn ein neues Buch da ist',
  text:
    'Die Reihe wächst langsam. Wer hier steht, erfährt es, sobald ein neuer '
    + 'Band erschienen ist – und kann zusätzlich den Newsletter dazunehmen, '
    + 'in dem steht, woran gerade gearbeitet wird.',
  knopf: 'Eintragen',
  versprechen:
    'Zwei Dinge zur Auswahl: eine kurze Nachricht, wenn ein Buch erschienen '
    + 'ist – höchstens eine je Band. Und der Newsletter, etwa einmal im Monat, '
    + 'über die Arbeit an den nächsten Bänden. Beides einzeln an- und '
    + 'abwählbar. Kein Weiterverkauf der Adresse, keine Werbung Dritter. '
    + 'Abmelden geht mit einem Klick in jeder Nachricht.',
};
