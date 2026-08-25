import { SceneEngine } from '@/engine/SceneEngine';
import { WELT, OEFFENTLICHE_BAENDE, REISE_OEFFENTLICH, assetNach } from '@/world/registry';
import { vorladen } from '@/world/bilder';

/**
 * Serverkomponente: Text, Überschriften und Bildunterschriften stehen im HTML,
 * bevor JavaScript läuft. Die Immersion liegt darüber, nicht davor –
 * darum ist die Seite auch für Suchmaschinen und Screenreader vollständig.
 *
 * Die Reise umfasst alle erschienenen Bände in einem Durchgang. Ein Band, der
 * noch nicht erschienen ist, liegt vollständig in den Daten, ist hier aber
 * nicht dabei – siehe `OEFFENTLICHE_BAENDE`.
 */
export default function Startseite() {
  const band1 = WELT['band-1'];

  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'BookSeries',
    name: 'Die unsichtbaren Fäden',
    inLanguage: 'de',
    author: [
      { '@type': 'Person', name: 'Manuel' },
      { '@type': 'Person', name: 'Uwe' },
    ],
    hasPart: OEFFENTLICHE_BAENDE.map((b) => ({
      '@type': 'Book',
      name: `Die unsichtbaren Fäden – Band ${b.buch.nummer}: ${b.buch.titel}`,
      bookEdition: `Band ${b.buch.nummer}`,
      inLanguage: 'de',
      numberOfPages: b.buch.seiten,
      description: b.buch.klappentext,
      hasPart: b.kapitel.map((k) => ({
        '@type': 'Chapter', position: k.id, name: k.titel, description: k.unterzeile,
      })),
    })),
  };

  const erstes = assetNach(band1.buch.coverAsset);
  const vorschau = erstes ? vorladen(erstes) : null;

  return (
    <>
      {vorschau && (
        <link rel="preload" as="image" href={vorschau.href} type={vorschau.type} fetchPriority="high" />
      )}
      <SceneEngine szenen={REISE_OEFFENTLICH} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </>
  );
}
