import type { Szene } from '@/data/gemeinsam/typen';
import { Quelle } from '@/ui/Quelle';
import { bandNummer } from '@/world/registry';

/**
 * Der Registerwechsel: außen die Nacht, innen das Papier.
 * Die Faden-Bilanzen und der Epilog stehen auf Papierweiß mit Weinrot –
 * so wie im Buch.
 */
export function PapierSeite({ szene }: { szene: Szene }) {
  return (
    <section id={szene.id} className="papier">
      <div>
        <p className="eyebrow">
          {szene.kapitelId ? `Kapitel ${szene.kapitelId}` : 'Bilanz des Bandes'}
        </p>
        <h2 data-auf>{szene.titel}</h2>
        {szene.zitat && <blockquote data-auf>{szene.zitat}</blockquote>}
        <Quelle text={szene.quelle} seite={szene.buchseite} band={bandNummer(szene.bandId)} label="Beleg" />
      </div>
    </section>
  );
}
