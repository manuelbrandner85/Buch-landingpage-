import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LEITBUCH, TRENDONIX, buchNach } from '@/world/registry';
import { beitragNach, sichtbareBeitraege } from '@/world/journal';
import { wegBuch, wegJournal, wegVorschau } from '@/world/wege';
import { Rueckweg } from '@/ui/Rueckweg';
import { Kanaele } from '@/ui/Kanaele';
import { Unterschrift } from '@/ui/Unterschrift';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return sichtbareBeitraege().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const b = beitragNach(slug);
  if (!b) return { title: 'Nicht gefunden – Trendonix' };
  return {
    title: `${b.titel} – Trendonix`,
    description: b.auszug,
    openGraph: { title: b.titel, description: b.auszug, images: wegVorschau('haus') },
  };
}

const datum = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

/**
 * Ein einzelner Beitrag.
 *
 * Am Ende steht der Kaufweg des Bandes, aus dem der Stoff kommt — aber nur,
 * wenn es einen gibt. Ein Beitrag, der auf ein Buch zeigt, das man nicht
 * kaufen kann, wäre eine Sackgasse.
 */
export default async function BeitragSeite(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const beitrag = beitragNach(slug);
  if (!beitrag) notFound();

  const buch = buchNach(beitrag.bandId) ?? LEITBUCH;
  const kaufbar = buch !== undefined && buch.kaufwege.length > 0;

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegJournal()} text="Zurück zum Journal" />
      <p className="eyebrow">Journal · {datum(beitrag.datum)}</p>
      <h1>{beitrag.titel}</h1>
      <p className="unterzeile">{beitrag.auszug}</p>

      <article>
        {beitrag.absaetze.map((a, i) =>
          a.startsWith('## ')
            ? <h2 key={i}>{a.slice(3)}</h2>
            : <p key={i}>{a}</p>,
        )}
      </article>

      {buch && (
        <article>
          <h2>Das Buch dazu</h2>
          <p>
            <strong>{buch.titel}</strong>
            {buch.unterzeile ? ` – ${buch.unterzeile}` : ''}
            {buch.seiten ? `, ${buch.seiten} Seiten` : ''}. {buch.klappentext}
          </p>
          <p>
            <a href={wegBuch(buch.id)}>
              {kaufbar ? `${buch.titel} ansehen →` : `Mehr zu ${buch.titel} →`}
            </a>
          </p>
        </article>
      )}

      <Unterschrift />
      <Rueckweg nach={wegJournal()} text="Zurück zum Journal" />
      <Kanaele />
      <p className="unterzeile">{TRENDONIX.name}</p>
    </main>
  );
}
