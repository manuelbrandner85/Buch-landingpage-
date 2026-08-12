import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ORTE, ortNach } from '@/data/gemeinsam/orte';
import { kapitelNach } from '@/world/registry';

/** Ein Ort gehört der Welt, nicht einem Band – deshalb listet er alle Vorkommen. */
export function generateStaticParams() {
  return ORTE.map((o) => ({ id: o.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const o = ortNach(id);
  return o ? { title: `${o.name} – Die unsichtbaren Fäden`, description: o.text } : {};
}

export default async function OrtSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ort = ortNach(id);
  if (!ort) notFound();

  return (
    <main className="lesefassung">
      <p className="eyebrow">Ort</p>
      <h1>{ort.name}</h1>
      <p>{ort.text}</p>
      <h2>Vorkommen</h2>
      <ul>
        {ort.vorkommen.map((v, i) => (
          <li key={i}>
            <a href={`/welt/kapitel/${v.kapitel}`}>
              Kapitel {v.kapitel} – {kapitelNach(v.kapitel)?.titel}
            </a>
            {' · Seiten '}{v.seiten.join(', ')}
          </li>
        ))}
      </ul>
      <p className="quelle">
        <b>Hinweis</b>Die Koordinaten dienen der Verortung, nicht der Vermessung.
      </p>
    </main>
  );
}
