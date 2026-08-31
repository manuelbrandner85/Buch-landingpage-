import type { Metadata } from 'next';
import { TRENDONIX } from '@/world/registry';

/**
 * Die Hausangaben für geteilte Links — an einer Stelle.
 *
 * ── Die Falle, die das hier nötig macht ──────────────────────────────────
 *
 * Next.js führt `metadata` von Layout und Seite **nicht** feldweise zusammen.
 * Definiert eine Seite `openGraph`, ersetzt ihr Block den des Layouts
 * vollständig — auch die Felder, die sie gar nicht anfasst. Am 31.08.2026
 * fehlten deshalb auf der Startseite `og:site_name`, `og:locale` und
 * `og:url`, obwohl sie im Layout stehen: Nicht überschrieben, sondern
 * weggefallen.
 *
 * Das sieht man der Seite nicht an. Sichtbar wird es erst, wenn jemand einen
 * Link teilt und die Vorschau ohne Absender dasteht — und dann ist der
 * Beitrag schon draußen.
 *
 * Deshalb baut jede Seite ihren Block über diese Funktion. Was das Haus immer
 * mitgibt, steht hier; was die Seite eigenes hat, kommt dazu und gewinnt.
 *
 *   openGraph: og({ type: 'article', title: …, images: … }, wegBeitrag(slug)),
 */
type OG = NonNullable<Metadata['openGraph']>;

export function og(eigenes: OG, adresse?: string): OG {
  return {
    siteName: TRENDONIX.name,
    locale: 'de_DE',
    // Ohne `url` schreibt die geteilte Vorschau die Adresse der Seite zu, von
    // der aus geteilt wurde — nicht die eigene.
    ...(adresse ? { url: adresse } : {}),
    ...eigenes,
  } as OG;
}
