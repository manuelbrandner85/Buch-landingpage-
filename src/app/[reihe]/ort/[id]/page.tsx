import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ORTE, ortNach } from '@/data/gemeinsam/orte';
import { OEFFENTLICHE_REIHEN, kapitelNach, reiheNach } from '@/world/registry';
import { wegBegriffe, wegKapitel, wegReihe } from '@/world/wege';
import { Rueckweg } from '@/ui/Rueckweg';

/**
 * Ein Ort gehört der Welt, nicht einem Band – deshalb listet er alle Vorkommen.
 * Er gehört aber sehr wohl einer Reihe: Die Welt der Fäden ist nicht die Welt
 * der nächsten Reihe, und die Adresse sagt das.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.flatMap((r) => ORTE.map((o) => ({ reihe: r.id, id: o.id })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; id: string }> }): Promise<Metadata> {
  const { reihe, id } = await params;
  const r = reiheNach(reihe);
  const o = ortNach(id);
  return o && r ? { title: `${o.name} – ${r.titel}`, description: o.text } : {};
}

export default async function OrtSeite(
  { params }: { params: Promise<{ reihe: string; id: string }> }) {
  const { reihe, id } = await params;
  const r = reiheNach(reihe);
  const ort = ortNach(id);
  if (!r || !ort) notFound();

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
      <p className="eyebrow">Ort</p>
      <h1>{ort.name}</h1>
      <p>{ort.text}</p>
      <h2>Vorkommen</h2>
      <ul>
        {ort.vorkommen.map((v, i) => (
          <li key={i}>
            <a href={wegKapitel(r.id, v.kapitel)}>
              Kapitel {v.kapitel} – {kapitelNach(v.kapitel, v.bandId)?.titel}
            </a>
            {' · Seiten '}{v.seiten.join(', ')}
          </li>
        ))}
      </ul>
      <p className="quelle">
        <b>Hinweis</b>Die Koordinaten dienen der Verortung, nicht der Vermessung.
      </p>
      <nav className="fusszeile">
        <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
        <a href={wegBegriffe(r.id)}>Begriffe</a>
      </nav>
    </main>
  );
}
