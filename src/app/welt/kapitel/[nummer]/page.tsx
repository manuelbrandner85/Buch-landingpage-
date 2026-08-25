import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { WELT, OEFFENTLICHE_KAPITEL, bandZuKapitel } from '@/world/registry';
import { ORTE } from '@/data/gemeinsam/orte';
import { Quelle } from '@/ui/Quelle';
import { Rueckweg } from '@/ui/Rueckweg';

/**
 * Eigene URL je Kapitel – damit Suchmaschinen die Welt verstehen.
 * Nur erschienene Bände bekommen eine Seite: Ein Kapitel, das es im Handel
 * noch nicht gibt, wird hier auch nicht angekündigt.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_KAPITEL.map((k) => ({ nummer: String(k.id) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ nummer: string }> }): Promise<Metadata> {
  const { nummer } = await params;
  const k = OEFFENTLICHE_KAPITEL.find((x) => x.id === Number(nummer));
  return k
    ? { title: `${k.titel} – Die unsichtbaren Fäden`, description: k.unterzeile }
    : {};
}

export default async function KapitelSeite({ params }: { params: Promise<{ nummer: string }> }) {
  const { nummer } = await params;
  const kapitel = OEFFENTLICHE_KAPITEL.find((k) => k.id === Number(nummer));
  if (!kapitel) notFound();

  const buch = bandZuKapitel(kapitel.id);
  const szenen = WELT[kapitel.bandId].szenen.filter((s) => s.kapitelId === kapitel.id);
  const orte = ORTE.filter((o) => o.vorkommen.some((v) => v.kapitel === kapitel.id));

  return (
    <main className="lesefassung">
      <Rueckweg />
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
              <li key={o.id}><a href={`/welt/ort/${o.id}`}>{o.name}</a> – {o.text}</li>
            ))}
          </ul>
        </>
      )}
      <nav className="fusszeile">
        <Rueckweg />
        <a href="/welt/begriffe">Begriffe</a>
        <a href="/ueber">Über das Projekt</a>
      </nav>
    </main>
  );
}
