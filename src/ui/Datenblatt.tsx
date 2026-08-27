/**
 * Ein Datenblatt für Suchmaschinen.
 *
 * Dieselbe Auskunft, die auf der Seite steht, noch einmal in der Form, die
 * Google, Bing und die anderen lesen. Mehrere Blätter je Seite sind erlaubt
 * und üblich – eines für den Inhalt, eines für den Pfad dorthin.
 */
export function Datenblatt({ daten }: { daten: unknown }) {
  return (
    <script type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(daten) }} />
  );
}
