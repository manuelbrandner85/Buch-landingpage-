import type { MetadataRoute } from 'next';
import { OEFFENTLICHE_BUECHER, OEFFENTLICHE_REIHEN, oeffentlicheBaendeVon } from '@/world/registry';
import { ORTE } from '@/data/gemeinsam/orte';
import { sichtbareBeitraege } from '@/world/journal';
import { STAND } from '@/data/gemeinsam/stand';

// Beim statischen Export muss die Route zur Bauzeit feststehen.
export const dynamic = 'force-static';

const BASIS = process.env.NEXT_PUBLIC_BASIS_URL ?? 'https://example.invalid';

/**
 * Auch eine immersive Welt braucht auffindbare Inhalte.
 * Aufgenommen wird nur, was gezeigt werden darf: Die Sitemap ist der Ort, an
 * dem ein unveröffentlichter Band am ehesten durchrutscht.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASIS}/`, changeFrequency: 'monthly', priority: 1, lastModified: STAND },
    { url: `${BASIS}/ueber/`, changeFrequency: 'yearly', priority: 0.5, lastModified: STAND },
    { url: `${BASIS}/blog/`, changeFrequency: 'weekly', priority: 0.7, lastModified: STAND },
    // Ein Beitrag bringt sein eigenes Datum mit – das ist das ehrlichste, das
    // es hier gibt.
    ...sichtbareBeitraege().map((b) => ({
      url: `${BASIS}/blog/${b.slug}/`, changeFrequency: 'yearly' as const,
      priority: 0.6, lastModified: b.datum,
    })),
    ...OEFFENTLICHE_BUECHER.map((b) => ({
      url: `${BASIS}/buch/${b.id}/`, changeFrequency: 'monthly' as const,
      priority: 0.9, lastModified: STAND,
    })),
    ...OEFFENTLICHE_REIHEN.flatMap((r) => [
      { url: `${BASIS}/${r.id}/`, changeFrequency: 'monthly' as const,
        priority: 0.9, lastModified: STAND },
      { url: `${BASIS}/${r.id}/begriffe/`, changeFrequency: 'yearly' as const,
        priority: 0.4, lastModified: STAND },
      // Die Bandwelten fehlten hier – ausgerechnet die inhaltsreichsten Seiten
      // der ganzen Seite (1200 bis 2400 Wörter) standen in keiner Sitemap.
      ...oeffentlicheBaendeVon(r).map((b) => ({
        url: `${BASIS}/${r.id}/${b.buch.id}/`,
        changeFrequency: 'monthly' as const, priority: 0.9, lastModified: STAND,
      })),
      ...oeffentlicheBaendeVon(r).flatMap((b) => b.kapitel).map((k) => ({
        url: `${BASIS}/${r.id}/kapitel/${k.id}/`,
        changeFrequency: 'yearly' as const, priority: 0.8, lastModified: STAND,
      })),
      ...ORTE.map((o) => ({
        url: `${BASIS}/${r.id}/ort/${o.id}/`,
        changeFrequency: 'yearly' as const, priority: 0.6, lastModified: STAND,
      })),
    ]),
  ];
}
