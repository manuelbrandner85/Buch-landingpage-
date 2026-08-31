import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SceneEngine } from '@/engine/SceneEngine';
import {
  TRENDONIX, assetNach, bandNach, bandzeile, istEinzeltitel, reiheNach, reiseBand,
  REIHEN_MIT_WELT, begehbareBaendeVon,
} from '@/world/registry';
import { vorladen } from '@/world/bilder';
import { wegVollstaendig, wegVorschau, wegWelt } from '@/world/wege';
import { ausgaben } from '@/world/schema';
import { og } from '@/world/og';

/**
 * Die Welt eines Bandes.
 *
 * Sie enthält ausschließlich Szenen dieses Bandes – seine Kapitel, seine
 * Karte, seinen Epilog, seinen Abschluss. Kein Motiv, kein Zitat und kein
 * Kaufweg eines anderen Bandes steht hier. Wer Band 3 betritt, ist in Band 3.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return REIHEN_MIT_WELT.flatMap((r) =>
    begehbareBaendeVon(r).map((b) => ({ reihe: r.id, band: b.buch.id })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; band: string }> }): Promise<Metadata> {
  const { reihe, band } = await params;
  const r = reiheNach(reihe);
  const b = bandNach(band);
  if (!r || !b) return {};
  // Kurz genug, dass Google ihn ganz zeigt – und eigen genug, dass er sich von
  // der Buchseite unterscheidet: Hier geht man hinein, dort kauft man.
  const titel = `${b.buch.titel}: die begehbare Welt`;
  // Die Beschreibung folgt dem, was der Band ist. „Band 2 der Unsichtbaren
  // Fäden mit 5 Kapiteln als Stationen“ stimmte, solange es nur eine Reihe
  // gab; bei einem Einzeltitel ohne Kapitelseiten wäre es dreimal falsch.
  const beschreibung = istEinzeltitel(r)
    ? 'Vierzig Behauptungen, wie sie im Feed stehen — die Motive des Buches in '
      + 'Bewegung, und zu jeder die Quelle, mit der man selbst nachsehen kann.'
    : `Band ${b.buch.nummer} der ${r.titel} zum Durchschreiten: `
      + `${b.kapitel.length} Kapitel als Stationen, Motive in Bewegung, zu jeder `
      + 'Aussage die Angabe, wie gut sie belegt ist.';
  return {
    title: titel,
    description: beschreibung,
    alternates: {
      canonical: wegVollstaendig(wegWelt(r.id, b.buch.id)) ?? wegWelt(r.id, b.buch.id),
    },
    openGraph: og({
      type: 'book', title: titel, description: b.buch.klappentext,
      images: wegVorschau(b.buch.id),
    }, wegVollstaendig(wegWelt(r.id, b.buch.id))),
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
    ...(b.buch.erschienen ? { datePublished: b.buch.erschienen } : {}),
    ...(b.buch.kaufwege.length ? { workExample: ausgaben(b.buch.kaufwege) } : {}),
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
      {/* Die Welt beginnt mit einer Szene, nicht mit einer Überschrift – für
          das Auge richtig, für Suchmaschinen und Vorleseprogramme ein Loch:
          Diese Seiten hatten gar keine erste Überschrift. Sie steht jetzt da,
          nur nicht im Bild. */}
      <h1 className="nur-lesen">
        {b.buch.titel}
        {bandzeile(b.buch) ? ` – ${bandzeile(b.buch)}` : ''}: die begehbare Welt
      </h1>
      {/* Der Weg zur stillen Fassung.
          Eine Feed-Welt besteht aus Bildschirmen, die erst beim Wischen
          entstehen; im ausgelieferten HTML steht davon nichts. Ohne diesen
          Verweis wäre die Liste nur über die Sitemap zu finden — und ein
          Vorleseprogramm käme gar nicht auf sie. Er steht nicht im Bild, aber
          er steht da, und das ist der Unterschied. */}
      {b.szenen.some((s) => s.typ === 'feed') && (
        <p className="nur-lesen">
          <a href={`${wegWelt(r.id, b.buch.id)}liste/`}>
            Alle vierzig Beiträge zum Nachlesen, ohne Bewegung
          </a>
        </p>
      )}
      <SceneEngine szenen={szenen} reihe={r.id} band={b.buch.id} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </>
  );
}
