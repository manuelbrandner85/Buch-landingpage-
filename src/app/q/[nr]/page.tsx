import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { weg, wegHaus, wegVollstaendig } from '@/world/wege';
import {
  QR_BUCH, QR_VEROEFFENTLICHT, QR_ZIELE, qrSchluessel, qrZielNach,
} from '@/data/gemeinsam/qr';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return QR_ZIELE.map((z) => ({ nr: qrSchluessel(z.nr) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ nr: string }> },
): Promise<Metadata> {
  const { nr } = await params;
  const ziel = qrZielNach(nr);
  if (!ziel) return { title: 'Nicht gefunden – Trendonix', robots: { index: false } };
  const pfad = weg(`/q/${qrSchluessel(ziel.nr)}/`);
  return {
    title: `${ziel.kapitel} – selbst nachsehen`,
    description: ziel.hinweis,
    // Vor dem Erscheinen des Buches steht hier nichts im Index. Eine Seite,
    // die den Titel nennt, wäre sonst die Ankündigung.
    robots: QR_VEROEFFENTLICHT ? undefined : { index: false, follow: false },
    alternates: { canonical: wegVollstaendig(pfad) ?? pfad },
  };
}

/**
 * Eine der vierzig Nachschlage-Seiten aus dem Buch.
 *
 * Der QR-Kasten im Kapitel führt hierher und nicht direkt zur Quelle: Gedrucktes
 * lässt sich nicht nachbessern, diese Seite schon. Zieht eine Behörde um, wird
 * hier eine Zeile getauscht — der Code im Buch bleibt richtig.
 */
export default async function QrSeite(
  { params }: { params: Promise<{ nr: string }> },
) {
  const { nr } = await params;
  const ziel = qrZielNach(nr);
  if (!ziel) notFound();

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">{QR_BUCH} · Kapitel {ziel.nr}</p>
      <h1>{ziel.kapitel}</h1>
      <p className="unterzeile">{ziel.hinweis}</p>

      <article>
        <h2>Sieh selbst nach</h2>
        {ziel.quellen.length === 0 ? (
          <p>
            Die Quelle zu diesem Kapitel wird hier eingetragen. Bis dahin gilt,
            was im Buch steht: Der Weg führt über die Suche der jeweiligen
            Behörde, nicht über eine Zusammenfassung.
          </p>
        ) : (
          <ul>
            {ziel.quellen.map((q) => (
              <li key={q.url}>
                <a href={q.url} target="_blank" rel="noopener noreferrer">
                  {q.anbieter}
                </a>
                <br />
                {q.was}
              </li>
            ))}
          </ul>
        )}
        <p className="quelle">
          <b>Hinweis</b>
          Diese Adressen führen aus dieser Seite hinaus. Für die Inhalte ist die
          jeweilige Einrichtung verantwortlich. Führt ein Weg ins Leere, wird er
          hier ersetzt — der Code im Buch bleibt derselbe.
        </p>
      </article>

      <div className="fusszeile">
        <a href={weg('/q/')}>Alle vierzig Nachschlage-Seiten</a>
        <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      </div>
    </main>
  );
}
