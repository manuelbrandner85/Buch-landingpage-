/**
 * Die Pflichtangaben – an genau einer Stelle.
 *
 * § 5 DDG verlangt Name, Anschrift und einen Weg, auf dem man den Anbieter
 * schnell erreicht. Diese Angaben dürfen nicht erfunden werden; sie stehen
 * deshalb hier als Platzhalter und nirgends sonst im Quelltext.
 *
 * Wer die Seite live schaltet, füllt diese Datei aus – Impressum, Datenschutz
 * und jeder Kontaktweg der Seite ziehen ihre Angaben von hier. Solange ein
 * Feld leer ist, zeigt die Seite an der Stelle nichts Erfundenes, sondern
 * lässt den Kontaktweg weg und weist das Impressum als unvollständig aus.
 */
export interface Anbieter {
  /** Vor- und Nachname oder Firma, wie im Handelsregister/Personalausweis. */
  name: string;
  strasse: string;
  plzOrt: string;
  land: string;
  /** Die E-Mail, unter der die Seite erreichbar ist. */
  email: string;
  /** Telefon – nach § 5 DDG nicht zwingend, wenn die E-Mail schnell beantwortet wird. */
  telefon: string;
  /** Umsatzsteuer-Identifikationsnummer, falls vorhanden. */
  ustId: string;
  /** Wer die Seite ausliefert – gehört in die Datenschutzerklärung. */
  hoster: string;
}

export const ANBIETER: Anbieter = {
  name: '',
  strasse: '',
  plzOrt: '',
  land: 'Deutschland',
  email: '',
  telefon: '',
  ustId: '',
  hoster: 'GitHub Pages, GitHub Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA',
};

/** Steht genug im Impressum, um die Seite live zu schalten? */
export const impressumVollstaendig = (): boolean =>
  [ANBIETER.name, ANBIETER.strasse, ANBIETER.plzOrt, ANBIETER.land, ANBIETER.email]
    .every((f) => f.trim().length > 0);

/**
 * Ein Kontaktweg per E-Mail – oder keiner.
 *
 * Ein Formular bräuchte einen Server; die Seite hat keinen. Ein mailto-Link
 * braucht keinen, verlangt keine Einwilligung und speichert nichts. Solange
 * keine Adresse eingetragen ist, gibt es hier nichts – ein toter Knopf ist
 * schlimmer als kein Knopf.
 */
export const mailAn = (betreff: string, text?: string): string | undefined => {
  if (!ANBIETER.email.trim()) return undefined;
  const p = new URLSearchParams({ subject: betreff, ...(text ? { body: text } : {}) });
  return `mailto:${ANBIETER.email}?${p.toString().replace(/\+/g, '%20')}`;
};
