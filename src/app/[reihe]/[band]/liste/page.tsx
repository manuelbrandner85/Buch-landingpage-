import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Rueckweg } from '@/ui/Rueckweg';
import { FEED, LESEORDNUNG } from '@/data/zufall/feed';
import type { Feedkapitel } from '@/data/gemeinsam/typen';
import { QR_VEROEFFENTLICHT, qrSchluessel } from '@/data/gemeinsam/qr';
import { bandNach, reiheNach, REIHEN_MIT_WELT, begehbareBaendeVon } from '@/world/registry';
import { BASIS_PFAD } from '@/world/bilder';
import { weg, wegBuch, wegVollstaendig, wegWelt } from '@/world/wege';

/**
 * Die stille Fassung der Welt.
 *
 * Die begehbare Welt ist sechsundvierzig Bildschirme hoch und laeuft erst,
 * wenn jemand wischt. Fuer einen Menschen ist das genau richtig. Fuer alles
 * andere ist es eine leere Seite: Suchmaschinen scrollen nicht,
 * Vorleseprogramme auch nicht, und wer Bewegung abgestellt hat, will gar nicht.
 *
 * Deshalb dasselbe noch einmal, ruhig: vierzig Beitraege in der Leseordnung
 * des Buches, mit Standbild, Konto, Bildunterschrift, Buchseite und dem Weg
 * zur Quelle. Es steht hier nichts, was in der Welt nicht auch steht - und
 * beide verschweigen dasselbe: das Kapitel. Was aus einer Behauptung wird,
 * steht im Buch, nicht auf dieser Seite.
 */
export const dynamicParams = false;

/**
 * Nur Baende, deren Welt ein Feed ist.
 *
 * Ein Weg durch eine Landschaft hat keine Liste von Beitraegen; fuer die
 * Faeden gaebe diese Seite nichts her. Die Bedingung steht deshalb an den
 * Daten und nicht an einem Namen: Wer eine Feed-Szene hat, bekommt die Liste.
 */
export function generateStaticParams() {
  return REIHEN_MIT_WELT.flatMap((r) =>
    begehbareBaendeVon(r)
      .filter((b) => b.szenen.some((s) => s.typ === 'feed'))
      .map((b) => ({ reihe: r.id, band: b.buch.id })));
}

const ordnung: Feedkapitel[] = LESEORDNUNG
  .map((nr) => FEED.find((k) => k.nr === nr))
  .filter((k): k is Feedkapitel => Boolean(k));

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; band: string }> },
): Promise<Metadata> {
  const { reihe, band } = await params;
  const r = reiheNach(reihe);
  const b = bandNach(band);
  if (!r || !b) return {};
  const pfad = `${wegWelt(r.id, b.buch.id)}liste/`;
  return {
    title: 'Die vierzig Beiträge zum Nachlesen',
    description: 'Alle vierzig Behauptungen aus „Alles nur Zufall?“ in der '
      + 'Leseordnung des Buches — ruhig, ohne Bewegung, mit Buchseite und dem '
      + 'Weg zur Quelle. Die Auflösung steht im Buch.',
    alternates: { canonical: wegVollstaendig(pfad) ?? pfad },
  };
}

export default async function FeedListe(
  { params }: { params: Promise<{ reihe: string; band: string }> },
) {
  const { reihe, band } = await params;
  const r = reiheNach(reihe);
  const b = bandNach(band);
  if (!r || !b || b.buch.reiheId !== r.id) notFound();
  const welt = wegWelt(r.id, b.buch.id);

  return (
    <main className="lesefassung feedliste">
      <Rueckweg nach={welt} text="Zurück in die Welt" />
      <p className="eyebrow">{b.buch.titel} · die stille Fassung</p>
      <h1>Die vierzig Beiträge zum Nachlesen</h1>
      <p className="unterzeile">
        Dieselben vierzig Behauptungen wie in der begehbaren Welt, in derselben
        Reihenfolge — der zweiten Leseordnung des Buches. Ohne Bewegung, ohne
        Ton, zum Anhalten. Die Konten und die Zahlen sind erfunden; das steht so
        im Vorwort. Die Quellen dahinter sind es nicht.
      </p>

      <ol className="feedliste-liste">
        {ordnung.map((k, i) => {
          const nr = qrSchluessel(k.nr);
          return (
            <li key={k.nr} id={`k${k.nr}`}>
              <span className="feedliste-platz" aria-hidden="true">{i + 1}</span>
              {/* 480 × 850 sind die echten Maße der Datei — die 640 im Namen
                  ist die Stufe, nicht die Breite. Mit falschen Zahlen springt
                  die Zeile beim Laden. */}
              <img className="feedliste-bild" loading="lazy" decoding="async"
                src={`${BASIS_PFAD}/assets/zufall/szenen/kap${nr}-640.webp`}
                width={480} height={850}
                alt={`Standbild zu Kapitel ${k.nr}: ${k.titel}`} />
              <div className="feedliste-text">
                <h2><a href={`${welt}#k${k.nr}`}>{k.titel}</a></h2>
                {k.unterzeile && <p className="feedliste-unterzeile">{k.unterzeile}</p>}
                {k.handle && <p className="feedliste-konto">{k.handle}</p>}
                <p className="feedliste-wort">{k.caption}</p>
                <p className="feedliste-marken">
                  {k.hashtags.map((h) => <span key={h}>#{h}</span>)}
                </p>
                <p className="feedliste-fein">
                  Kapitel {k.nr} · Buchseite {k.seite}
                  {k.kiHinweis ? ' · im Buch als KI-Clip gesetzt' : ''}
                  {QR_VEROEFFENTLICHT && ' · '}
                  {QR_VEROEFFENTLICHT && <a href={weg(`/q/${nr}/`)}>Quelle nachschlagen</a>}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="fusszeile">
        <a href={welt}>Dasselbe als begehbare Welt</a>
        <a href={wegBuch(b.buch.id)}>Zum Buch</a>
        <Rueckweg nach={welt} text="Zurück in die Welt" />
      </div>
    </main>
  );
}
