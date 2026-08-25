import type { MetadataRoute } from 'next';

// Beim statischen Export muss die Route zur Bauzeit feststehen.
export const dynamic = 'force-static';

const BASIS = process.env.NEXT_PUBLIC_BASIS_URL ?? 'https://example.invalid';

/**
 * Der Spiegel auf github.io soll nicht mitindexiert werden.
 *
 * Seit die Seite unter eigener Domain liegt, gibt es sie zweimal: einmal echt
 * und einmal als Bau-Spiegel unter github.io. Zwei Adressen mit demselben Text
 * schaden beiden – deshalb sperrt der Spiegel sich selbst aus. Gesteuert über
 * NEXT_PUBLIC_SPIEGEL, gesetzt nur im Pages-Auftrag.
 */
const SPIEGEL = process.env.NEXT_PUBLIC_SPIEGEL === '1';

export default function robots(): MetadataRoute.Robots {
  if (SPIEGEL) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASIS}/sitemap.xml`,
  };
}
