import { SceneEngine } from '@/engine/SceneEngine';
import { WELT, assetNach } from '@/world/registry';
import { vorladen } from '@/world/bilder';

/**
 * Serverkomponente: Text, Überschriften und Bildunterschriften stehen im HTML,
 * bevor JavaScript läuft. Die Immersion liegt darüber, nicht davor –
 * darum ist die Seite auch für Suchmaschinen und Screenreader vollständig.
 */
export default function Startseite() {
  const band1 = WELT['band-1'];
  const strukturierteDaten = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: `Die unsichtbaren Fäden – Band 1: ${band1.buch.titel}`,
    author: [
      { '@type': 'Person', name: 'Manuel' },
      { '@type': 'Person', name: 'Uwe' },
    ],
    bookEdition: 'Band 1',
    inLanguage: 'de',
    numberOfPages: band1.buch.seiten,
    description: band1.buch.klappentext,
    hasPart: band1.kapitel.map((k) => ({
      '@type': 'Chapter', position: k.id, name: k.titel, description: k.unterzeile,
    })),
  };

  const erstes = assetNach(band1.buch.coverAsset);
  const vorschau = erstes ? vorladen(erstes) : null;

  return (
    <>
      {vorschau && (
        <link rel="preload" as="image" href={vorschau.href} type={vorschau.type} fetchPriority="high" />
      )}
      <SceneEngine szenen={band1.szenen} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten) }} />
    </>
  );
}
