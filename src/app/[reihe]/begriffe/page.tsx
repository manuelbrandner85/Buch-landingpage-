import type { Metadata } from 'next';
import { BEGRIFFE } from '@/data/gemeinsam/begriffe';
import { OEFFENTLICHE_REIHEN } from '@/world/registry';
import { Rueckweg } from '@/ui/Rueckweg';

/** Die Begriffe gehören der Welt einer Reihe – deshalb liegen sie unter ihr. */
export const dynamicParams = false;
export function generateStaticParams() {
  return OEFFENTLICHE_REIHEN.map((r) => ({ reihe: r.id }));
}

export const metadata: Metadata = {
  title: 'Begriffe – Die unsichtbaren Fäden',
  description: 'Fachbegriffe des Bandes, erklärt: von in situ über Satrapie bis Höhle 17.',
};

export default function BegriffeSeite() {
  const sortiert = [...BEGRIFFE].sort((a, b) => a.wort.localeCompare(b.wort, 'de'));
  return (
    <main className="lesefassung">
      <Rueckweg />
      <p className="eyebrow">Anhang</p>
      <h1>Begriffe</h1>
      <p className="unterzeile">Was im Buch in Gold steht, wird hier erklärt.</p>

      <dl className="begriffsliste">
        {sortiert.map((b) => (
          <div key={b.id} id={b.id}>
            <dt>{b.wort}</dt>
            <dd>{b.erklaerung}<span className="seite"> · Band 1, Seite {b.seite}</span></dd>
          </div>
        ))}
      </dl>

      <p className="quelle">
        <b>Hinweis</b>Das Glossar des Bandes umfasst mehr Einträge. Aufgenommen ist hier,
        was wörtlich aus dem Buch übernommen werden konnte.
      </p>
      <nav className="fusszeile"><a href="/ueber">Über das Projekt</a>  <a href="/">Zurück in die Welt</a></nav>
    </main>
  );
}
