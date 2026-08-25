import type { BandId } from './typen';

/**
 * Die Leseprobe.
 *
 * Ein Bildband verkauft sich über die Seite, nicht über den Klappentext. Der
 * Blick ins Buch zeigt vier Seiten im Browser; die Leseprobe gibt dieselbe
 * Auskunft zum Mitnehmen – gesetzt, gedruckt, ohne Konto und ohne E-Mail.
 *
 * Die Datei ist aus der Druckdatei des Bandes gebaut: Umschlag und
 * Inhaltsverzeichnis, dann der erste Kapitelbogen bis zur Zwischenbilanz.
 * Nichts daran ist für die Seite umgeschrieben worden.
 */
export interface Leseprobe {
  /** Der Dateiname unter `public/leseprobe/`. */
  datei: string;
  /** Wie viele Seiten die Datei hat. */
  seiten: number;
  /** Wie groß die Datei ist – wer auf Mobilfunk lädt, will das vorher wissen. */
  groesse: string;
  /** Was darin steht, in einem Satz. */
  inhalt: string;
}

export const LESEPROBEN: Record<BandId, Leseprobe> = {
  'band-1': {
    datei: 'die-unsichtbaren-faeden-band-1-leseprobe.pdf',
    seiten: 13,
    groesse: '1,6 MB',
    inhalt:
      'Umschlag, das vollständige Inhaltsverzeichnis aller sechs Kapitel und '
      + 'der erste Bogen aus Kapitel 1 – Kapitelvorschau, vier Doppelseiten '
      + 'und die Zwischenbilanz.',
  },
};

export const leseprobeVon = (band: BandId): Leseprobe | undefined => LESEPROBEN[band];
