import type { Metadata } from 'next';
import { WELT } from '@/world/registry';
import { ORTE } from '@/data/gemeinsam/orte';
import { Rueckweg } from '@/ui/Rueckweg';

export const metadata: Metadata = {
  title: 'Über das Projekt – Die unsichtbaren Fäden',
  description:
    'Wie diese Welt entstanden ist: Bildherkunft, Evidenzstufen, Kartengrundlagen und was die Seite über ihre Besucher speichert.',
};

/**
 * Die Seite, die erklärt, wie die Welt gemacht ist.
 * Ein Buch, das zu jeder Aussage die Beleglage ausweist, kann sich keine
 * Website leisten, die über ihre eigenen Grundlagen schweigt.
 */
export default function UeberSeite() {
  const band1 = WELT['band-1'];
  const motive = band1.assets.length;

  return (
    <main className="lesefassung">
      <Rueckweg />
      <p className="eyebrow">Über das Projekt</p>
      <h1>Wie diese Welt gemacht ist</h1>
      <p className="unterzeile">
        Was hier steht, steht im Buch. Was hier bewegt wird, ist Inszenierung.
      </p>

      <article>
        <h2>Die Motive</h2>
        <p>
          Kein Motiv dieser Welt ist eine historische Fotografie. Alle {motive} Bilder
          wurden eigens für den Band erzeugt und tragen dieselbe Herkunftsangabe wie
          im Buch: gesicherter Befund, freie Rekonstruktion oder Rekonstruktion auf
          Grundlage von Befunden. Die Angabe steht bei jedem Motiv, nicht im Kleingedruckten.
        </p>
      </article>

      <article>
        <h2>Die Evidenzstufen</h2>
        <p>
          Jede Zahl und jede Randnotiz trägt eine Stufe von A bis G – von gesichertem
          Befund bis widerlegt. Der Regler in den Motivszenen blendet aus, was schwächer
          belegt ist als die gewählte Stufe. Bei A bleibt erstaunlich wenig stehen.
          Das ist kein Effekt, sondern die Aussage des Bandes.
        </p>
      </article>

      <article>
        <h2>Die Karte</h2>
        <p>
          Die {ORTE.length} Orte tragen ihre tatsächlichen Koordinaten; sie dienen der
          Verortung, nicht der Vermessung. Die Kartengrundlagen sind dieselben wie im
          Buch: Satellitenaufnahmen der NASA (Blue Marble Next Generation),
          Geländemodelle des GMRT, Küstenlinien von Natural Earth. Der Faden verbindet
          die Orte in der Reihenfolge der Kapitel, nicht der Geografie.
        </p>
      </article>

      <article>
        <h2>Was gespeichert wird</h2>
        <p>
          Diese Seite merkt sich im Browser, welche Szenen Sie schon gesehen haben –
          damit besuchte Orte auf der Karte leuchten und Sie den Einstieg beim zweiten
          Besuch überspringen können. Diese Angabe verlässt Ihr Gerät nicht. Es gibt
          keine Konten, keine Anmeldung und keine Weitergabe an Dritte. Wer den
          Browserspeicher löscht, beginnt wieder von vorn.
        </p>
      </article>

      <article>
        <h2>Der Kauf</h2>
        <p>
          Die Bücher werden über Amazon verkauft. Diese Seite wickelt keine Zahlungen ab
          und erhebt dafür keine Daten; der Kauflink öffnet sich in einem neuen Tab.
        </p>
      </article>

      <article>
        <h2>Barrierefreiheit</h2>
        <p>
          Ist im Betriebssystem „Bewegung reduzieren“ gesetzt, zeigt die Seite eine
          ruhige Fassung mit denselben Inhalten – keine Notversion, sondern eine
          gleichwertige Lesefassung. Dieselbe Fassung lässt sich jederzeit über
          „Ruhig“ im Menü einschalten. Ton ist grundsätzlich aus und muss aktiv
          eingeschaltet werden.
        </p>
      </article>

      <p className="quelle">
        <b>Bildnachweis</b>Alle Angaben folgen dem Bildnachweis des Bandes, Seite 201.
      </p>
      <nav className="fusszeile"><a href="/welt/begriffe">Begriffe</a>  <a href="/impressum">Impressum und Datenschutz</a>  <a href="/">Zurück in die Welt</a></nav>
    </main>
  );
}
