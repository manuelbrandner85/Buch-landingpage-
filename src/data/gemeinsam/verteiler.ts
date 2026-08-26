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
  formular: '',
  titel: 'Wenn der nächste Band fertig ist',
  text:
    'Die Reihe wächst langsam. Wer wissen möchte, wann ein Band erscheint, '
    + 'trägt hier eine Adresse ein und hört ansonsten nichts von hier.',
  knopf: 'Eintragen',
  versprechen:
    'Höchstens eine Nachricht je erschienenem Band. Kein Weiterverkauf der '
    + 'Adresse, keine Werbung Dritter. Abmelden geht mit einem Klick in jeder '
    + 'Nachricht.',
};
