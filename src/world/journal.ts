import { BEITRAEGE, type Beitrag } from '@/data/gemeinsam/beitraege';
import { buchNach, istOeffentlich } from '@/world/registry';

/**
 * Welche Beiträge das Haus zeigt.
 *
 * Zwei Bedingungen, beide aus denselben Gründen wie beim Rest der Welt:
 *  · Der Band, aus dessen Stoff der Beitrag kommt, muss öffentlich sein.
 *    Ein Beitrag über einen schweigenden Band würde ihn verraten.
 *  · Das Datum darf nicht in der Zukunft liegen. So lässt sich ein Vorrat
 *    anlegen, der sich von selbst veröffentlicht, ohne dass jemand
 *    zur richtigen Stunde am Rechner sitzen muss.
 */
export function sichtbareBeitraege(heute: Date = new Date()): Beitrag[] {
  const tag = heute.toISOString().slice(0, 10);
  return BEITRAEGE
    .filter((b) => {
      const buch = buchNach(b.bandId);
      return buch !== undefined && istOeffentlich(buch) && b.datum <= tag;
    })
    .sort((a, b) => (a.datum < b.datum ? 1 : -1));
}

export const beitragNach = (slug: string, heute?: Date): Beitrag | undefined =>
  sichtbareBeitraege(heute).find((b) => b.slug === slug);
