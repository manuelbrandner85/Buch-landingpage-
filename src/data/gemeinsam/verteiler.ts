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
 * **Was hier versprochen wird, ist eine Verpflichtung.** Seit dem 28.08.2026
 * steht hier, dass der nächste Band zuerst an diese Liste geht – als
 * Leseexemplar, vor dem Erscheinen. Wer das ändert, ändert ein Versprechen,
 * das Menschen mit ihrer Adresse bezahlt haben. Der Ablauf dazu steht in
 * `AUTOPILOT/VERTRIEBSWEGE.md`, Abschnitt 9.
 *
 * Zwei Dinge stehen bewusst *nicht* dort: kein Titel und kein Datum des
 * nächsten Bandes (Hausregel 4 – angekündigt wird, was zu haben ist), und
 * keine Gegenleistung. Ein Leseexemplar gegen eine Bewertung wäre bei Amazon
 * ein Verstoß und hier eine Unehrlichkeit.
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
  titel: 'Den nächsten Band vor allen anderen lesen',
  text:
    'Die Reihe wächst langsam. Ist der nächste Band fertig, geht er zuerst an '
    + 'diese Liste – als Leseexemplar, bevor er erscheint. Wer keines möchte, '
    + 'erfährt hier trotzdem als Erstes, dass es ihn gibt.',
  knopf: 'Eintragen',
  versprechen:
    'Höchstens eine Nachricht je Band, dazu die eine Frage, ob ein '
    + 'Leseexemplar erwünscht ist. Daran hängt keine Bedingung – keine '
    + 'Bewertung als Gegenleistung, keine Verpflichtung zu irgendetwas. Kein '
    + 'Weiterverkauf der Adresse, keine Werbung Dritter. Abmelden geht mit '
    + 'einem Klick in jeder Nachricht.',
};
