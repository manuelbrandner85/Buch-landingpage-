import type { Metadata } from 'next';
import { TRENDONIX } from '@/world/registry';
import { sichtbareBeitraege } from '@/world/journal';
import { wegBeitrag, wegHaus, wegJournal, wegVollstaendig, wegVorschau } from '@/world/wege';
import { brotkrumen } from '@/world/schema';
import { Datenblatt } from '@/ui/Datenblatt';
import { Rueckweg } from '@/ui/Rueckweg';
import { Kanaele } from '@/ui/Kanaele';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Journal: wie die Quellen geprüft werden',
  description:
    'Texte zum Stoff der Bücher: wie die Quellen geprüft werden, was ein unsichtbarer Faden ist, und was in den Bänden dahintersteckt.',
  alternates: { canonical: wegVollstaendig(wegJournal()) ?? wegJournal() },
  openGraph: { images: wegVorschau('haus') },
};

const datum = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

/**
 * Das Journal des Hauses.
 *
 * Der einzige Kanal, der niemandem sonst gehört. Beiträge erscheinen von
 * selbst, sobald ihr Datum erreicht ist — und nur, solange der Band, aus dem
 * sie stammen, öffentlich ist.
 */
export default function JournalSeite() {
  const beitraege = sichtbareBeitraege();

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">Journal</p>
      <h1>Was hinter den Büchern steht</h1>
      <p className="unterzeile">
        Kein Blog über den Betrieb, sondern über den Stoff: Methode, Belege,
        und die Fäden selbst.
      </p>

      {beitraege.length === 0 ? (
        <article>
          <p>Hier erscheint bald der erste Beitrag.</p>
        </article>
      ) : (
        beitraege.map((b) => (
          <article key={b.slug}>
            <h2><a href={wegBeitrag(b.slug)}>{b.titel}</a></h2>
            <p className="unterzeile">{datum(b.datum)}</p>
            <p>{b.auszug}</p>
            <p><a href={wegBeitrag(b.slug)}>Weiterlesen →</a></p>
          </article>
        ))
      )}

      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <Kanaele />
      <Datenblatt daten={brotkrumen([
        { name: 'Start', weg: wegHaus() },
        { name: 'Journal', weg: wegJournal() },
      ])} />
    </main>
  );
}
