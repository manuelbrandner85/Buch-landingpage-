import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SceneEngine } from '@/engine/SceneEngine';
import {
  OEFFENTLICHE_REIHEN, TRENDONIX, assetNach, buchNach,
  oeffentlicheBaendeVon, reiheNach, reiseVon,
} from '@/world/registry';
import { vorladen } from '@/world/bilder';
import { weg } from '@/world/wege';

/**
 * Eine Welt, von vorn bis hinten begehbar.
 *
 * Serverkomponente: Text, Überschriften und Bildunterschriften stehen im HTML,
 * bevor JavaScript läuft. Die Immersion liegt darüber, nicht davor – darum ist
 * die Seite auch für Suchmaschinen und Screenreader vollständig.
 *
 * Die Reise umfasst alle zeigbaren Bände dieser Reihe in einem Durchgang. Ein
 * Band, der noch nicht erscheinen darf, liegt vollständig in den Daten, ist
 * hier aber nicht dabei – siehe `reiseVon`.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.map((r) => ({ reihe: r.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string }> }): Promise<Metadata> {
  const r = reiheNach((await params).reihe);
  if (!r) return {};
  const titel = `${r.titel} – die begehbare Welt`;
  return {
    title: titel,
    description: r.einladung,
    alternates: { canonical: weg(`/${r.id}/`) },
    openGraph: { type: 'book', title: titel, description: r.einladung },
  };
}

export default async function WeltSeite({ params }: { params: Promise<{ reihe: string }> }) {
  const r = reiheNach((await params).reihe);
  if (!r) notFound();

  const szenen = reiseVon(r);
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
      hasPart: b.kapitel.map((k) => ({
        '@type': 'Chapter', position: k.id, name: k.titel, description: k.unterzeile,
      })),
    })),
  };

  const erstesBuch = buchNach(baende[0]?.buch.id);
  const erstes = assetNach(erstesBuch?.coverAsset);
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
