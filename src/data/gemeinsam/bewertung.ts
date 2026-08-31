/**
 * Das Bewertungsformular auf der Buchseite.
 *
 * Bewertungen bei Amazon verkaufen Bücher. Eine Bewertung auf der eigenen
 * Seite tut das kaum — sie überzeugt nur jemanden, der ohnehin schon hier ist.
 * Ihr Wert liegt woanders: Sie kommt von Menschen, die das Buch nicht bei
 * Amazon gekauft haben, sie steht auch dann noch da, wenn Amazon eine
 * Rezension löscht, und sie gehört dem Haus.
 *
 * Vier Entscheidungen hängen hier fest:
 *
 *  1. **Nichts erscheint ohne Freigabe.** Das Formular schickt an einen
 *     Dienst, nicht auf diese Seite. Was ankommt, wandert erst dann nach
 *     `stimmen.ts`, wenn es jemand gelesen und freigegeben hat. Wer ohne
 *     Freigabe veröffentlichen lässt, veröffentlicht irgendwann Spam unter
 *     der eigenen Domain — und haftet dafür, sobald er davon weiß.
 *  2. **Freigeben heißt nicht aussuchen.** Rechtschreibfehler, Spam und
 *     Beleidigungen dürfen weg. Eine ehrliche schlechte Bewertung nicht.
 *     Nur die guten zu zeigen ist keine Geschmacksfrage, sondern eine
 *     unlautere geschäftliche Handlung (Anhang zu § 3 Abs. 3 UWG Nr. 23b).
 *  3. **Es wird gesagt, dass nicht geprüft wird.** Wer Verbraucher-
 *     bewertungen zeigt, muss nach § 5b Abs. 3 UWG angeben, ob und wie er
 *     sicherstellt, dass sie von echten Käufern stammen. Bei einem Formular
 *     auf der eigenen Seite lautet die ehrliche Antwort: gar nicht. Genau das
 *     steht dann auch da — und zwar dort, wo die Bewertungen stehen, nicht im
 *     Impressum.
 *  4. **Getrennt von Amazon.** Eine Stimme von hier fließt nicht in den
 *     Amazon-Schnitt ein. Sonst stünde neben „5,0 aus 2 Bewertungen“ eine
 *     Zahl, die bei Amazon niemand nachzählen kann — und die Angabe wäre
 *     falsch, obwohl jede einzelne Stimme echt ist.
 *
 * Solange `formular` leer ist, zeigt die Seite den Abschnitt gar nicht an —
 * dieselbe Regel wie beim Verteiler. Lieber kein Feld als eines, das ins
 * Nichts schickt.
 *
 * ── Was noch einzurichten ist ────────────────────────────────────────────
 * Bei Brevo ein zweites Formular anlegen (nicht das des Verteilers ändern),
 * mit diesen Feldern, und die „Einfaches HTML“-Adresse hier eintragen:
 *
 *   EMAIL            E-Mail (Pflicht, dient der Rückfrage, wird nie gezeigt)
 *   BUCH             Text — die Seite füllt es verborgen mit der Band-Kennung
 *   STERNE           Zahl 1–5
 *   NAME_OEFFENTLICH Text — der Name, unter dem die Stimme stehen soll
 *   BEWERTUNG        Mehrzeiliger Text
 *
 * Dazu bei Brevo eine eigene Liste „Bewertungen“ (nicht die des Verteilers)
 * und die Benachrichtigung je Einsendung einschalten: Diese Mail ist der
 * Beleg, auch wenn ein zweiter Eintrag desselben Absenders die Felder im
 * Kontakt überschreibt.
 */
export interface Bewertungsformular {
  /** Die „Einfaches HTML“-Adresse des Brevo-Formulars. Leer = kein Abschnitt. */
  formular: string;
  titel: string;
  text: string;
  knopf: string;
  /** Die Pflichtangabe nach § 5b Abs. 3 UWG, in einem Satz. */
  pruefung: string;
  /** Was mit den Angaben geschieht – ehrlich, nicht schöngeredet. */
  versprechen: string;
}

export const BEWERTUNGSFORMULAR: Bewertungsformular = {
  formular: '',
  titel: 'Haben Sie das Buch gelesen?',
  text:
    'Dann interessiert, was Sie davon halten – auch, wenn es Ihnen nicht '
    + 'gefallen hat. Ihre Zeilen erscheinen nicht sofort: Sie werden gelesen '
    + 'und dann so veröffentlicht, wie sie geschrieben wurden.',
  knopf: 'Bewertung absenden',
  pruefung:
    'Bewertungen, die über dieses Formular kommen, werden nicht daraufhin '
    + 'geprüft, ob der Absender das Buch gekauft hat – das lässt sich hier '
    + 'nicht feststellen. Geprüft wird nur, ob es sich um Spam handelt. '
    + 'Sternzahlen von Händlern stehen getrennt davon und tragen dort den '
    + 'Vermerk der Plattform.',
  versprechen:
    'Die E-Mail-Adresse dient allein der Rückfrage und erscheint nirgends. '
    + 'Veröffentlicht wird nur, was Sie in „Bewertung“ schreiben, dazu der '
    + 'Name, den Sie angeben, und die Sterne. Sie können jederzeit verlangen, '
    + 'dass Ihre Bewertung wieder verschwindet – eine formlose Nachricht '
    + 'genügt. Kein Newsletter, keine Weitergabe der Adresse.',
};
