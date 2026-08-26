/**
 * Die Partner am Fuß der Seite.
 *
 * Wie bei den Kanälen: ein Ort für alle Adressen, und nichts steht hier, was
 * es nicht gibt. Wer ein Logo hat, bekommt sein Logo; wer keines hinterlegt
 * hat, steht als Schriftzug. Beides in derselben Größe und derselben Ruhe –
 * ein Partner ist ein Hinweis, keine Anzeige.
 */
export interface Partner {
  id: string;
  /** Der Name, wie er geschrieben wird. */
  name: string;
  /** Halbe Zeile darunter – wofür der Name steht. Freiwillig. */
  unterzeile?: string;
  /** Die Adresse in Anzeigeform, ohne Protokoll. */
  adresse: string;
  /** Das Ziel des Links. */
  ziel: string;
  /**
   * Dateiname des Logos unter `public/marke/`, ohne Endung. Erwartet werden
   * `.avif`, `.webp` und `.png`. Fehlt die Angabe, steht der Name als
   * Schriftzug – kein Platzhalter, kein nachgebautes fremdes Zeichen.
   */
  bild?: string;
  /** Beschreibung des Logos für alle, die es nicht sehen. */
  alt?: string;
  /** Seitenverhältnis des Logos, für den Platz vor dem Laden. */
  breite?: number;
  hoehe?: number;
}

export const PARTNER: Partner[] = [
  {
    id: 'vecom-design',
    name: 'VECOM Design',
    adresse: 'www.vecom-design.it',
    ziel: 'https://www.vecom-design.it',
    bild: 'vecom-design',
    alt: 'VECOM Design – Webdesign, Logo Design, Branding',
    breite: 660,
    hoehe: 517,
  },
  {
    id: 'jonika-venturis',
    name: 'Jonika Venturis',
    unterzeile: 'Autorin und Verlegerin',
    adresse: 'www.jonika-venturis.com',
    ziel: 'https://www.jonika-venturis.com',
  },
];
