import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { weg, wegHaus, wegVollstaendig } from '@/world/wege';
import {
  QR_BUCH, QR_VEROEFFENTLICHT, QR_ZIELE, qrSchluessel, qrZielNach,
} from '@/data/gemeinsam/qr';
import { aufsatz, brotkrumen, suchbeschreibung } from '@/world/schema';

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
    // Das Layout hängt an jeden Titel „ · Trendonix“ – zwölf Zeichen, die
    // mitzählen. Für den Zusatz „– selbst nachsehen“ bleiben damit 53; wo ein
    // Kapitelname länger ist, trägt er den Titel allein. Google schneidet
    // sonst mitten im Wort ab, und abgeschnitten steht dort nicht die
    // Aufforderung, sondern ein Wortfragment.
    // Die Behauptung in Anführungszeichen, nicht nackt: „Adolf Hitler lebt in
    // Argentinien“ als Titel eines Suchtreffers liest sich sonst wie eine
    // Aussage dieser Seite. Sie ist das Gegenteil — hier steht, wo man
    // nachsieht. Die Zeichen kosten zwei Stellen und retten den Sinn.
    title: (() => {
      const voll = `„${ziel.kapitel}“ – selbst nachsehen`;
      return voll.length <= 53 ? voll : `„${ziel.kapitel}“`;
    })(),
    // Der Hinweis allein ist ein halber Satz. Dahinter gehört, wo man
    // nachsieht — das ist der Zweck dieser Seite und zugleich das, was sie
    // von den anderen neununddreißig unterscheidet.
    description: suchbeschreibung([
      ziel.hinweis,
      ziel.quellen.length
        ? `Nachzusehen bei ${ziel.quellen.map((q) => q.anbieter).join(', ')}`
        : undefined,
      `Kapitel ${ziel.nr} aus „${QR_BUCH}“`,
    ]),
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

  const pfad = weg(`/q/${qrSchluessel(ziel.nr)}/`);

  return (
    <main className="lesefassung">
      {/*
        Vierzig Nachschlage-Seiten ohne ein einziges Datenblatt: Google sah
        hier bis zum 03.09.2026 vierzig kurze Texte ohne Verfasser, ohne Haus
        und ohne Weg dorthin. Der Pfad ist das, was im Treffer über der Zeile
        steht — ohne ihn steht dort die nackte Adresse mit /q/07/ darin.
      */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brotkrumen([
          { name: TRENDONIX.name, weg: wegHaus() },
          { name: QR_BUCH, weg: weg('/q/') },
          { name: ziel.kapitel, weg: pfad },
        ])) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aufsatz({
          titel: `${ziel.kapitel} – selbst nachsehen`,
          beschreibung: ziel.hinweis,
          weg: pfad,
        })) }} />
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
