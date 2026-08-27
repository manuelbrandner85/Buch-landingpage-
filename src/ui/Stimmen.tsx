import type { BandId } from '@/data/gemeinsam/typen';
import {
  bewertungenVon, gesamturteil, stimmenVon,
  type Leserstimme,
} from '@/data/gemeinsam/stimmen';

/**
 * Die Sterne und die Sätze.
 *
 * Alles hier zeigt sich nur, wenn es etwas zu zeigen gibt. Solange keine
 * Rezension vorliegt, gibt jedes Bauteil `null` zurück und die Seite sieht aus
 * wie vorher – kein leerer Kasten, kein „noch keine Bewertungen“.
 */

const STERN = 'M12 2.4l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.46 '
  + '6.12 20.51l1.12-6.55L2.48 9.32l6.58-.96z';

/** Fünf Sterne, der Anteil davon gefüllt. Zwei Reihen übereinander, die obere beschnitten. */
function Sterne({ wert, skala = 5 }: { wert: number; skala?: number }) {
  const anteil = Math.max(0, Math.min(1, wert / skala));
  const reihe = (klasse: string) => (
    <span className={klasse}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d={STERN} />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="sterne" aria-hidden="true">
      {reihe('sterne-grund')}
      <span className="sterne-voll" style={{ width: `${(anteil * 100).toFixed(1)}%` }}>
        {reihe('sterne-reihe')}
      </span>
    </span>
  );
}

const zahl = (n: number) => n.toFixed(1).replace('.', ',');
const datum = (iso: string) => {
  const [j, m, t] = iso.split('-');
  return t && m && j ? `${Number(t)}.${Number(m)}.${j}` : iso;
};

/**
 * Die eine Zeile neben dem Kaufweg: Sterne, Schnitt, Anzahl.
 *
 * Sie steht dort, wo die Entscheidung fällt – nicht unten, wo sie niemand
 * mehr sieht. Der Link führt zu den Stimmen weiter unten auf derselben Seite,
 * nicht weg von ihr.
 */
export function Sternzeile({ bandId, nach = '#stimmen' }: { bandId: BandId; nach?: string }) {
  const urteil = gesamturteil(bandId);
  if (!urteil) return null;
  const text = `${zahl(urteil.schnitt)} von 5 Sternen aus `
    + `${urteil.anzahl} ${urteil.anzahl === 1 ? 'Bewertung' : 'Bewertungen'}`;
  return (
    <p className="sternzeile">
      <Sterne wert={urteil.schnitt} />
      <a href={nach}>
        <b>{zahl(urteil.schnitt)}</b>
        <span className="nur-lesen">{text}</span>
        <span aria-hidden="true">
          {' · '}{urteil.anzahl} {urteil.anzahl === 1 ? 'Bewertung' : 'Bewertungen'}
        </span>
      </a>
    </p>
  );
}

/**
 * Die Auswahl fürs Haus: die stärksten Sätze über alle Bände hinweg.
 *
 * Auf der Startseite steht kein Bewertungsspiegel – dort entscheidet niemand
 * über einen einzelnen Titel. Dort wirkt nur, dass überhaupt jemand gelesen
 * und etwas dazu gesagt hat. Deshalb höchstens drei Sätze, und nur, wenn es
 * sie gibt.
 */
export function Stimmenwand({ baende, hoechstens = 3 }:
{ baende: BandId[]; hoechstens?: number }) {
  const auswahl = baende.flatMap((b) => stimmenVon(b)).slice(0, hoechstens);
  if (auswahl.length === 0) return null;
  return (
    <div className="stimmenreihe">
      {auswahl.map((s, i) => <Stimme key={`${s.bandId}-${s.quelle}-${i}`} stimme={s} />)}
    </div>
  );
}

/** Ein Zitat mit Herkunft. */
function Stimme({ stimme }: { stimme: Leserstimme }) {
  return (
    <figure className="stimme">
      {stimme.sterne !== undefined && (
        <Sterne wert={stimme.sterne} skala={stimme.skala} />
      )}
      <blockquote>{stimme.text}</blockquote>
      <figcaption>
        {stimme.autor ?? 'Leserstimme'}
        {' · '}
        {stimme.url
          ? <a href={stimme.url} target="_blank" rel="noopener noreferrer">{stimme.quelle}</a>
          : stimme.quelle}
        {stimme.datum && <span className="seite">{' · '}{datum(stimme.datum)}</span>}
      </figcaption>
    </figure>
  );
}

/**
 * Der ganze Abschnitt für die Buchseite: Zitate, darunter die Zahlen je
 * Händler mit Stand und Link zum Nachzählen.
 */
export function Leserstimmen({ bandId, titel = 'Was Leser sagen' }:
{ bandId: BandId; titel?: string }) {
  const stimmen = stimmenVon(bandId);
  const zahlen = bewertungenVon(bandId);
  if (stimmen.length === 0 && zahlen.length === 0) return null;
  return (
    <section className="stimmen" id="stimmen">
      <h2>{titel}</h2>
      {stimmen.length > 0 && (
        <div className="stimmenreihe">
          {stimmen.map((s, i) => <Stimme key={`${s.quelle}-${i}`} stimme={s} />)}
        </div>
      )}
      {zahlen.length > 0 && (
        <ul className="bewertungsliste">
          {zahlen.map((b) => (
            <li key={`${b.quelle}-${b.url}`}>
              <Sterne wert={b.schnitt} skala={b.skala} />
              <a href={b.url} target="_blank" rel="noopener noreferrer">
                {zahl(b.schnitt)} von {b.skala ?? 5} bei {b.quelle}
              </a>
              <span className="seite">
                {' · '}{b.anzahl} {b.anzahl === 1 ? 'Bewertung' : 'Bewertungen'}
                {' · Stand '}{datum(b.stand)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="quelle">
        <b>Hinweis</b>Alle Stimmen stehen öffentlich bei den genannten Händlern
        und sind hier wörtlich zitiert, gekürzt höchstens am Anfang oder Ende.
        Die Sternzahlen sind abgelesen, nicht gerundet, und tragen den Tag, an
        dem sie abgelesen wurden.
      </p>
    </section>
  );
}
