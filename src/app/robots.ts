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
    // Das Cockpit ist die Innenansicht des Hauses: Verkaufszahlen, offene
    // Punkte, Kanalzahlen. Es steht auf demselben Webspace, weil es dort ohne
    // eigenen Server auskommt – gefunden werden soll es aber nicht. Die Adresse
    // traegt deshalb eine unratbare Kennung, die Seite selbst ein `noindex`,
    // und hier steht die dritte Sperre.
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cockpit-eb4e3e9d63d6/',
        // Die beiden Zählpunkte sind keine Seiten, sondern Endpunkte: `z.php`
        // schreibt bei jedem Abruf eine Zeile, `zahl.php` gibt sie zurück. Ein
        // Sucher, der sie abruft, zählt sich selbst mit — die Besuchszahl unter
        // dem Copyright wäre dann die Zahl der Suchmaschinenbesuche.
        '/z.php',
        '/zahl.php',
      ],
    },
    sitemap: `${BASIS}/sitemap.xml`,
  };
}
