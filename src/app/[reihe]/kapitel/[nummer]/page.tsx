import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  HAUS, OEFFENTLICHE_REIHEN, WELT, oeffentlicheBaendeVon, reiheNach,
} from '@/world/registry';
import { ORTE } from '@/data/gemeinsam/orte';
import { wegBegriffe, wegOrt, wegReihe, wegUeber } from '@/world/wege';
import { Quelle } from '@/ui/Quelle';
import { Rueckweg } from '@/ui/Rueckweg';

/**
 * Eigene URL je Kapitel – damit Suchmaschinen die Welt verstehen.
 * Die Kapitelnummer gilt innerhalb der Reihe, deshalb steht die Reihe in der
 * Adresse: `/faeden/kapitel/7`. Nur Bände, die etwas sagen dürfen, bekommen
 * eine Seite; ein Band in Arbeit wird hier auch nicht angekündigt.
 */
export const dynamicParams = false;

const kapitelDerReihe = (reihe: string) =>
  (HAUS[reihe] ? oeffentlicheBaendeVon(HAUS[reihe]).flatMap((b) => b.kapitel) : []);

export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.flatMap((r) =>
    oeffentlicheBaendeVon(r).flatMap((b) =>
      b.kapitel.map((k) => ({ reihe: r.id, nummer: String(k.id) }))));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; nummer: string }> }): Promise<Metadata> {
  const { reihe, nummer } = await params;
  const r = reiheNach(reihe);
  const k = kapitelDerReihe(reihe).find((x) => x.id === Number(nummer));
  return k && r
    ? { title: `${k.titel} – ${r.titel}`, description: k.unterzeile }
    : {};
}

export default async function KapitelSeite(
  { params }: { params: Promise<{ reihe: string; nummer: string }> }) {
  const { reihe, nummer } = await params;
  const r = reiheNach(reihe);
  const kapitel = kapitelDerReihe(reihe).find((k) => k.id === Number(nummer));
  if (!r || !kapitel) notFound();

  const buch = WELT[kapitel.bandId]?.buch;
  const szenen = WELT[kapitel.bandId]?.szenen.filter((s) => s.kapitelId === kapitel.id) ?? [];
  const orte = ORTE.filter((o) => o.vorkommen.some((v) => v.kapitel === kapitel.id));

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
      <p className="eyebrow">
        Band {buch?.nummer} · {buch?.titel} · Kapitel {kapitel.id}
      </p>
      <h1>{kapitel.titel}</h1>
      <p className="unterzeile">{kapitel.unterzeile}</p>
      <p className="quelle"><b>Im Buch</b>Seiten {kapitel.seiten[0]}–{kapitel.seiten[1]}</p>

      {szenen.filter((s) => s.typ !== 'auftakt').map((s) => (
        <article key={s.id}>
          <h2>{s.titel}</h2>
          {s.zitat && <blockquote>{s.zitat}</blockquote>}
          {s.unterzeile && <p className="unterzeile">{s.unterzeile}</p>}
          {s.fliesstext && <p>{s.fliesstext}</p>}
          {s.zahlen?.map((z) => (
            <p key={z.wert}><strong>{z.wert}</strong> – {z.label} (Evidenz {z.evidenz})</p>
          ))}
          <Quelle text={s.quelle} seite={s.buchseite} band={buch?.nummer} />
        </article>
      ))}

      {orte.length > 0 && (
        <>
          <h2>Orte in diesem Kapitel</h2>
          <ul>
            {orte.map((o) => (
              <li key={o.id}><a href={wegOrt(r.id, o.id)}>{o.name}</a> – {o.text}</li>
            ))}
          </ul>
        </>
      )}
      <nav className="fusszeile">
        <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
        <a href={wegBegriffe(r.id)}>Begriffe</a>
        <a href={wegUeber()}>Über das Projekt</a>
      </nav>
    </main>
  );
}
