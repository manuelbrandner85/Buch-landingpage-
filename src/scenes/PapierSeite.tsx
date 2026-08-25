import type { Szene } from '@/data/gemeinsam/typen';
import { Quelle } from '@/ui/Quelle';
import { bandNummer } from '@/world/registry';

/**
 * Der Registerwechsel: außen die Fahrt, hier der Stillstand.
 * Die Faden-Bilanzen und der Epilog stehen auf einer dunklen, polierten Fläche
 * mit Gold – wie der Einband, nicht wie die Buchseite. Eine helle Vollfläche
 * riss die Nacht auf; diese hält sie und spiegelt den Satz.
 */
export function PapierSeite({ szene }: { szene: Szene }) {
  return (
    <section id={szene.id} className="papier">
      <div>
        <p className="eyebrow">
          {szene.kapitelId ? `Kapitel ${szene.kapitelId}` : 'Bilanz des Bandes'}
        </p>
        <h2 data-auf>{szene.titel}</h2>
        {szene.zitat && (
          <>
            <blockquote data-auf>{szene.zitat}</blockquote>
            {/* Die Spiegelung gehört zur Fläche, nicht zum Text – deshalb
                ausgeblendet für Vorlesewerkzeuge. */}
            <p className="spiegel" aria-hidden="true">{szene.zitat}</p>
          </>
        )}
        <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} label="Beleg" />
      </div>
    </section>
  );
}
