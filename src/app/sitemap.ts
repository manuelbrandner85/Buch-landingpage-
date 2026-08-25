import type { MetadataRoute } from 'next';
import { OEFFENTLICHE_KAPITEL } from '@/world/registry';
import { ORTE } from '@/data/gemeinsam/orte';

// Beim statischen Export muss die Route zur Bauzeit feststehen.
export const dynamic = 'force-static';

const BASIS = process.env.NEXT_PUBLIC_BASIS_URL ?? 'https://example.invalid';

/** Auch eine immersive Welt braucht auffindbare Inhalte. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASIS, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASIS}/ueber`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASIS}/welt/begriffe`, changeFrequency: 'yearly', priority: 0.5 },
    ...OEFFENTLICHE_KAPITEL.map((k) => ({
      url: `${BASIS}/welt/kapitel/${k.id}`, changeFrequency: 'yearly' as const, priority: 0.8,
    })),
    ...ORTE.map((o) => ({
      url: `${BASIS}/welt/ort/${o.id}`, changeFrequency: 'yearly' as const, priority: 0.6,
    })),
  ];
}
