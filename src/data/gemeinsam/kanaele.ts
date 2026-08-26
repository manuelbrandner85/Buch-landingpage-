/**
 * Die Kanäle des Hauses.
 *
 * Ein Ort für alle Adressen – wie bei `anbieter.ts`. Wer einen Kanal umbenennt
 * oder aufgibt, ändert es hier, und die Seite folgt: Fußzeile, Startseite und
 * die Angabe für Suchmaschinen kommen aus derselben Liste.
 *
 * Zwei Regeln, dieselben wie überall in dieser Welt:
 *
 * 1. Hier steht nur, was es wirklich gibt. Jede Adresse ist ein Konto, das
 *    unter dem Namen Trendonix läuft und öffentlich erreichbar ist. Eine
 *    erfundene oder „bald folgende“ Adresse gehört nicht hierher – ein Link
 *    ins Leere kostet mehr Vertrauen, als ein fehlender Kanal je einbringt.
 * 2. Ein Kanal ohne `adresse` wird nicht angezeigt. Das ist der Weg, einen
 *    Auftritt vorzubereiten, ohne ihn zu behaupten.
 */
export type KanalId =
  | 'tiktok' | 'instagram' | 'facebook' | 'pinterest' | 'youtube' | 'bluesky';

export interface Kanal {
  id: KanalId;
  /** Wie die Plattform heißt. */
  name: string;
  /** Wie das Konto dort heißt – so, wie es dort geschrieben steht. */
  handle: string;
  /** Vollständige, öffentlich erreichbare Adresse. Leer = wird nicht gezeigt. */
  adresse: string;
  /** Ein halber Satz: was dort zu sehen ist. Keine Werbung, eine Auskunft. */
  wofuer: string;
}

export const KANAELE: Kanal[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@trendonix',
    adresse: 'https://www.tiktok.com/@trendonix',
    wofuer: 'Kurzfilme aus den Bänden – und Live',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@trendonix_',
    adresse: 'https://www.instagram.com/trendonix_/',
    wofuer: 'Motive, Reels, Zwischenstände',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Trendonix',
    adresse: 'https://www.facebook.com/profile.php?id=61560484831386',
    wofuer: 'Beiträge und Gespräche zur Reihe',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    handle: 'trendonixbuecher',
    adresse: 'https://www.pinterest.de/trendonixbuecher/',
    wofuer: 'Pinnwände zu Motiven und Orten',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Trendonixde',
    adresse: 'https://www.youtube.com/@Trendonixde',
    wofuer: 'Shorts und die langen Fassungen',
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    handle: '@trendonix-buecher.bsky.social',
    adresse: 'https://bsky.app/profile/trendonix-buecher.bsky.social',
    wofuer: 'Beiträge aus dem Journal',
  },
];

/** Nur die Kanäle, die tatsächlich eine Adresse haben. */
export const offeneKanaele = (): Kanal[] => KANAELE.filter((k) => k.adresse.trim() !== '');

/**
 * Für `sameAs` im strukturierten Datenblatt: Damit Suchmaschinen die Profile
 * demselben Haus zuordnen wie diese Seite – und nicht sechs Fremde daraus
 * machen.
 */
export const kanalAdressen = (): string[] => offeneKanaele().map((k) => k.adresse);
