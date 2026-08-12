import type { MetadataRoute } from 'next';

// Beim statischen Export muss die Route zur Bauzeit feststehen.
export const dynamic = 'force-static';

const BASIS = process.env.NEXT_PUBLIC_BASIS_URL ?? 'https://example.invalid';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASIS}/sitemap.xml`,
  };
}
