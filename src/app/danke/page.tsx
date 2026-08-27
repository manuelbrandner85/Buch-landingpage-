import type { Metadata } from 'next';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { wegHaus } from '@/world/wege';
import { VERTEILER } from '@/data/gemeinsam/verteiler';

export const metadata: Metadata = {
  title: 'Fast geschafft – Die Unsichtbaren Fäden',
  robots: { index: false },
};

/**
 * Die Seite nach dem Absenden des Verteiler-Formulars.
 *
 * Ohne sie schickt der Formulardienst den Leser auf eine nackte
 * JSON-Antwort — `{"success":true,...}` auf weißem Grund. Das sieht aus wie
 * ein Fehler, und wer glaubt, etwas sei schiefgegangen, klickt die Mail
 * hinterher nicht mehr an.
 *
 * Deshalb steht hier genau eine Sache: dass jetzt eine Mail kommt und dass
 * ohne den Klick darin nichts passiert. Das ist keine Höflichkeitsfloskel,
 * sondern die halbe Anmeldung — der zweite Schritt des Double Opt-in.
 */
export default function DankeSeite() {
  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">Verteiler</p>
      <h1>Fast geschafft</h1>

      <article>
        <p>
          Eine Mail ist unterwegs. In ihr steht ein Link — erst wenn du ihn
          anklickst, bist du eingetragen. Vorher wird nichts gespeichert.
        </p>
        <p>
          Sie kommt in aller Regel binnen einer Minute. Ist sie nach ein paar
          Minuten nicht da, liegt sie im Spam-Ordner; das passiert bei der
          allerersten Nachricht einer neuen Adresse häufiger, als einem lieb ist.
        </p>
        <p className="quelle">
          <b>Danach</b>{VERTEILER.versprechen}
        </p>
      </article>
    </main>
  );
}
