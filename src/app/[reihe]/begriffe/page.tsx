import type { Metadata } from 'next';
import { BEGRIFFE } from '@/data/gemeinsam/begriffe';
import { TRENDONIX, REIHEN_MIT_WELT } from '@/world/registry';
import { wegBegriffe, wegHaus, wegReihe, wegUeber, wegVollstaendig } from '@/world/wege';
import { begriffssammlung, brotkrumen } from '@/world/schema';
import { Datenblatt } from '@/ui/Datenblatt';
import { LEITREIHE, WELT } from '@/world/registry';
import { wegKapitel } from '@/world/wege';
import { Rueckweg } from '@/ui/Rueckweg';

/** Die Begriffe gehören der Welt einer Reihe – deshalb liegen sie unter ihr. */
export const dynamicParams = false;
export function generateStaticParams() {
  return REIHEN_MIT_WELT.map((r) => ({ reihe: r.id }));
}

export const metadata: Metadata = {
  title: 'Begriffe – Die Unsichtbaren Fäden',
  description: 'Fachbegriffe des Bandes, erklärt: von in situ über Satrapie bis Höhle 17.',
  alternates: {
    canonical: wegVollstaendig(wegBegriffe(LEITREIHE.id)) ?? wegBegriffe(LEITREIHE.id),
  },
};

/**
 * Elf Begriffe, elf eigene Seiten? Nein.
 *
 * Der Plan war, jedem Begriff eine eigene Adresse zu geben – mehr Seiten, mehr
 * Treffer. Bei vierzig Wörtern Erklärung wären das elf dünne Seiten geworden,
 * genau der Fehler, den die Ortsseiten gerade hinter sich haben. Eine
 * vollständige Seite mit Sprungmarken (`/begriffe/#satrapie`) ist für
 * Suchmaschinen dasselbe Ziel und für Lesende die bessere Liste.
 *
 * Was der Seite gefehlt hat, ist der Weg weiter: Zu jedem Begriff steht jetzt
 * das Kapitel, in dem er vorkommt – gefunden über die Buchseite, nicht von
 * Hand zugeordnet.
 */
const kapitelZurSeite = (seite: number) =>
  (WELT['band-1']?.kapitel ?? []).find((k) => seite >= k.seiten[0] && seite <= k.seiten[1]);

export default function BegriffeSeite() {
  const sortiert = [...BEGRIFFE].sort((a, b) => a.wort.localeCompare(b.wort, 'de'));
  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">Anhang</p>
      <h1>Begriffe</h1>
      <p className="unterzeile">Was im Buch in Gold steht, wird hier erklärt.</p>

      <dl className="begriffsliste">
        {sortiert.map((b) => (
          <div key={b.id} id={b.id}>
            <dt>{b.wort}</dt>
            <dd>
              {b.erklaerung}
              <span className="seite">
                {' · Band 1, Seite '}{b.seite}
                {(() => {
                  const k = kapitelZurSeite(b.seite);
                  return k ? (
                    <>
                      {' · '}
                      <a href={wegKapitel(LEITREIHE.id, k.id)}>
                        Kapitel {k.id}: {k.titel}
                      </a>
                    </>
                  ) : null;
                })()}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="quelle">
        <b>Hinweis</b>Das Glossar des Bandes umfasst mehr Einträge. Aufgenommen ist hier,
        was wörtlich aus dem Buch übernommen werden konnte.
      </p>
      <Datenblatt daten={begriffssammlung({
        titel: 'Begriffe der Unsichtbaren Fäden',
        weg: wegBegriffe(LEITREIHE.id),
        eintraege: sortiert.map((b) => ({
          wort: b.wort, erklaerung: b.erklaerung,
          weg: `${wegBegriffe(LEITREIHE.id)}#${b.id}`,
        })),
      })} />
      <Datenblatt daten={brotkrumen([
        { name: 'Start', weg: wegHaus() },
        { name: LEITREIHE.titel, weg: wegReihe(LEITREIHE.id) },
        { name: 'Begriffe', weg: wegBegriffe(LEITREIHE.id) },
      ])} />
      <nav className="fusszeile">
        <a href={wegUeber()}>Über das Projekt</a>
        <a href={wegHaus()}>Zurück zu {TRENDONIX.name}</a>
      </nav>
    </main>
  );
}
