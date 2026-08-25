import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SceneEngine } from '@/engine/SceneEngine';
import {
  OEFFENTLICHE_REIHEN, TRENDONIX, assetNach, oeffentlicheBaendeVon,
  reiheNach, schwelleVon,
} from '@/world/registry';
import { vorladen } from '@/world/bilder';
import { weg, wegVorschau } from '@/world/wege';

/**
 * Die Schwelle einer Reihe.
 *
 * Hier wird angekommen und gewählt – mehr nicht. Die Welten selbst liegen je
 * Band eine Ebene tiefer (`/faeden/band-2/`), weil eine Welt ihrem Band gehört:
 * Wer Band 3 betreten will, soll nicht zuerst durch Band 1 müssen.
 *
 * Serverkomponente: Text, Überschriften und Bildunterschriften stehen im HTML,
 * bevor JavaScript läuft.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.map((r) => ({ reihe: r.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string }> }): Promise<Metadata> {
  const r = reiheNach((await params).reihe);
  if (!r) return {};
  const titel = `${r.titel} – die begehbaren Welten`;
  return {
    title: titel,
    description: r.einladung,
    alternates: { canonical: weg(`/${r.id}/`) },
    openGraph: {
      type: 'book', title: titel, description: r.einladung,
      images: wegVorschau(`welt-${r.id}`),
    },
    twitter: { card: 'summary_large_image', images: wegVorschau(`welt-${r.id}`) },
  };
}

export default async function SchwellenSeite({ params }: { params: Promise<{ reihe: string }> }) {
  const r = reiheNach((await params).reihe);
  if (!r) notFound();

  const szenen = schwelleVon(r);
  const baende = oeffentlicheBaendeVon(r);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'BookSeries',
    name: r.titel,
    inLanguage: 'de',
    publisher: { '@type': 'Organization', name: TRENDONIX.name },
    author: { '@type': 'Organization', name: TRENDONIX.name },
    hasPart: baende.map((b) => ({
      '@type': 'Book',
      name: `${r.titel} – Band ${b.buch.nummer}: ${b.buch.titel}`,
      bookEdition: `Band ${b.buch.nummer}`,
      inLanguage: 'de',
      numberOfPages: b.buch.seiten,
      description: b.buch.klappentext,
      url: weg(`/buch/${b.buch.id}/`),
    })),
  };

  const erstes = assetNach(baende[0]?.buch.coverAsset);
  const vorschau = erstes ? vorladen(erstes) : null;

  return (
    <>
      {vorschau && (
        <link rel="preload" as="image" href={vorschau.href} type={vorschau.type} fetchPriority="high" />
      )}
      <SceneEngine szenen={szenen} reihe={r.id} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </>
  );
}
