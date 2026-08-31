import type { Metadata } from 'next';
import { OEFFENTLICHE_REIHEN, TRENDONIX, istEinzeltitel, oeffentlicheBaendeVon } from '@/world/registry';
import { wegHaus, wegJournal, wegReihe, wegUeber, wegWelt } from '@/world/wege';
import { Rueckweg } from '@/ui/Rueckweg';
import { Kanaele } from '@/ui/Kanaele';

/**
 * Die Seite, die es nicht gibt.
 *
 * Bis zum 31.08.2026 stand hier die Standardseite des Baukastens: „404: This
 * page could not be found." Englisch, auf einer durchweg deutschen Seite, ohne
 * einen einzigen Weg zurück. Das ist die eine Stelle, an der ein Besucher
 * merkt, dass unter allem ein Werkzeug liegt — und ausgerechnet die trifft
 * jeden, der einem alten Link folgt oder sich vertippt hat.
 *
 * Drei Entscheidungen:
 *
 *  · **Keine Entschuldigung, eine Auskunft.** „Ups!" hilft niemandem. Was
 *    hilft, ist zu sagen, was passiert ist und wohin es weitergeht.
 *  · **Wege statt Suchfeld.** Eine Suche über 217 Seiten wäre ein eigenes
 *    Bauteil und würde hier selten benutzt. Vier Ziele, die immer stimmen,
 *    sind mehr wert — und sie kommen aus dem Verzeichnis, nicht von Hand:
 *    Kommt eine Reihe dazu, steht sie hier von selbst.
 *  · **Nicht indexiert.** Eine Fehlerseite gehört nicht in die Suche. Die
 *    Verweise darauf dürfen Suchmaschinen trotzdem folgen — sie führen ja
 *    genau dorthin, wo etwas steht.
 */
export const metadata: Metadata = {
  // Ohne Hausnamen: Den hängt die Titelvorlage aus dem Layout ohnehin an.
  // Steht er hier noch einmal, liest der Reiter „… – Trendonix · Trendonix".
  title: 'Diese Seite gibt es nicht',
  description:
    'Die aufgerufene Adresse führt ins Leere. Hier stehen die Wege zurück: '
    + 'ins Regal, in die Welten und ins Journal.',
  robots: { index: false, follow: true },
};

export default function NichtGefunden() {
  // Aus dem Verzeichnis, nicht von Hand: Eine Liste, die hier veraltet,
  // schickt Menschen von einer Sackgasse in die nächste.
  const welten = OEFFENTLICHE_REIHEN.map((r) => {
    const baende = oeffentlicheBaendeVon(r);
    const erster = baende[0];
    return {
      id: r.id,
      titel: r.titel,
      weg: erster && istEinzeltitel(r) ? wegWelt(r.id, erster.buch.id) : wegReihe(r.id),
      zahl: baende.length,
    };
  });

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">Fehler 404</p>
      <h1>Diese Seite gibt es nicht</h1>
      <p className="unterzeile">
        Die Adresse führt ins Leere – vertippt, veraltet oder von woanders
        falsch verlinkt.
      </p>

      <article>
        <p>
          Verschwunden ist hier nichts: Was einmal stand, steht weiter, und was
          gerade entsteht, ist noch nicht da. Wahrscheinlich fehlt nur ein
          Zeichen in der Adresse.
        </p>
        <p>Von hier aus geht es weiter:</p>
        <ul>
          <li>
            <a href={`${wegHaus()}#buecher`}>Ins Regal</a>
            <span className="seite"> · alle Bücher des Hauses mit Kaufweg</span>
          </li>
          {welten.map((w) => (
            <li key={w.id}>
              <a href={w.weg}>In die Welt von {w.titel}</a>
              <span className="seite">
                {' · '}{w.zahl === 1 ? 'begehbar' : `${w.zahl} Bände, begehbar`}
              </span>
            </li>
          ))}
          <li>
            <a href={wegJournal()}>Ins Journal</a>
            <span className="seite"> · woran gerade gearbeitet wird</span>
          </li>
          <li>
            <a href={wegUeber()}>Über das Projekt</a>
            <span className="seite"> · wer das hier macht und warum</span>
          </li>
        </ul>
        <p className="quelle">
          <b>Hinweis</b>Wenn Sie diesem Link von einer anderen Seite aus
          gefolgt sind, ist er dort falsch eingetragen. Eine kurze Nachricht
          über das Impressum genügt, dann wird er hier abgefangen.
        </p>
      </article>

      <Kanaele />
    </main>
  );
}
