import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SceneEngine } from '@/engine/SceneEngine';
import {
  OEFFENTLICHE_REIHEN, TRENDONIX, assetNach, bandNach,
  oeffentlicheBaendeVon, reiheNach, reiseBand,
} from '@/world/registry';
import { vorladen } from '@/world/bilder';
import { wegVollstaendig, wegVorschau, wegWelt } from '@/world/wege';

/**
 * Die Welt eines Bandes.
 *
 * Sie enthält ausschließlich Szenen dieses Bandes – seine Kapitel, seine
 * Karte, seinen Epilog, seinen Abschluss. Kein Motiv, kein Zitat und kein
 * Kaufweg eines anderen Bandes steht hier. Wer Band 3 betritt, ist in Band 3.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.flatMap((r) =>
    oeffentlicheBaendeVon(r).map((b) => ({ reihe: r.id, band: b.buch.id })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; band: string }> }): Promise<Metadata> {
  const { reihe, band } = await params;
  const r = reiheNach(reihe);
  const b = bandNach(band);
  if (!r || !b) return {};
  const titel = `${b.buch.titel} – ${r.titel}, Band ${b.buch.nummer}`;
  return {
    title: titel,
    description: b.buch.unterzeile ?? b.buch.klappentext.slice(0, 160),
    alternates: {
      canonical: wegVollstaendig(wegWelt(r.id, b.buch.id)) ?? wegWelt(r.id, b.buch.id),
    },
    openGraph: {
      type: 'book', title: titel, description: b.buch.klappentext,
      images: wegVorschau(b.buch.id),
    },
    twitter: { card: 'summary_large_image', images: wegVorschau(b.buch.id) },
  };
}

export default async function BandWelt(
  { params }: { params: Promise<{ reihe: string; band: string }> }) {
  const { reihe, band } = await params;
  const r = reiheNach(reihe);
  const b = bandNach(band);
  if (!r || !b || b.buch.reiheId !== r.id) notFound();

  const szenen = reiseBand(b);

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: `${r.titel} – Band ${b.buch.nummer}: ${b.buch.titel}`,
    bookEdition: `Band ${b.buch.nummer}`,
    inLanguage: 'de',
    numberOfPages: b.buch.seiten,
    description: b.buch.klappentext,
    publisher: { '@type': 'Organization', name: TRENDONIX.name },
    author: { '@type': 'Organization', name: TRENDONIX.name },
    hasPart: b.kapitel.map((k) => ({
      '@type': 'Chapter', position: k.id, name: k.titel, description: k.unterzeile,
    })),
  };

  const erstes = assetNach(b.buch.coverAsset);
  const vorschau = erstes ? vorladen(erstes) : null;

  return (
    <>
      {vorschau && (
        <link rel="preload" as="image" href={vorschau.href} type={vorschau.type} fetchPriority="high" />
      )}
      <SceneEngine szenen={szenen} reihe={r.id} band={b.buch.id} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </>
  );
}
