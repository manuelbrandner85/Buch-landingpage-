import type { Metadata } from 'next';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { wegHaus, wegUeber } from '@/world/wege';
import { ANBIETER, impressumVollstaendig } from '@/data/gemeinsam/anbieter';
import { zaehlerLaeuft } from '@/ui/Zaehler';
import { Kanaele } from '@/ui/Kanaele';

export const metadata: Metadata = {
  title: 'Impressum – Die Unsichtbaren Fäden',
  robots: { index: false },
};

/**
 * Pflichtangaben nach § 5 DDG und Art. 13 DSGVO.
 *
 * Der Inhalt steht nicht hier, sondern in `src/data/gemeinsam/anbieter.ts` –
 * eine Datei, ein Ausfüllen, und die Angaben stimmen überall auf der Seite.
 * Was dort leer ist, bleibt hier sichtbar leer: Ein erfundenes Impressum wäre
 * die teuerste Zeile der ganzen Seite.
 */
function Zeile({ wert, was }: { wert: string; was: string }) {
  if (wert.trim()) return <>{wert}<br /></>;
  return <><i className="fehlt">{was} fehlt</i><br /></>;
}

export default function ImpressumSeite() {
  const fertig = impressumVollstaendig();
  const zaehlt = zaehlerLaeuft();

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">Pflichtangaben</p>
      <h1>Impressum</h1>

      {!fertig && (
        <p className="quelle warnung">
          <b>Entwurf</b>Diese Seite ist noch nicht ausgefüllt. Die Angaben stehen in
          einer einzigen Datei des Projekts (<code>src/data/gemeinsam/anbieter.ts</code>);
          erfunden werden dürfen sie nicht.
        </p>
      )}

      <article>
        <h2>Anbieter</h2>
        <p>
          <Zeile wert={ANBIETER.name} was="Name" />
          <Zeile wert={ANBIETER.strasse} was="Straße" />
          <Zeile wert={ANBIETER.plzOrt} was="PLZ und Ort" />
          <Zeile wert={ANBIETER.land} was="Land" />
        </p>
        <p>
          E-Mail:{' '}
          {ANBIETER.email
            ? <a href={`mailto:${ANBIETER.email}`}>{ANBIETER.email}</a>
            : <i className="fehlt">E-Mail-Adresse fehlt</i>}
          <br />
          {ANBIETER.telefon && <>Telefon: {ANBIETER.telefon}<br /></>}
          {ANBIETER.ustId && <>USt-IdNr.: {ANBIETER.ustId}</>}
        </p>
      </article>

      <article>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          <Zeile wert={ANBIETER.name} was="Name" />
          Anschrift wie oben.
        </p>
      </article>

      <article>
        <h2 id="datenschutz">Datenschutz</h2>
        <p>
          Diese Seite speichert im lokalen Browserspeicher, welche Szenen bereits
          gesehen wurden. Diese Angabe bleibt auf Ihrem Gerät und wird nicht übertragen.
          Es werden keine Konten geführt und keine Werbenetzwerke geladen. Es gibt
          keine Cookies und keine Einwilligungsabfrage, weil es nichts gibt, worin
          eingewilligt werden müsste.
        </p>
        {zaehlt ? (
          <p>
            Zur Reichweitenmessung wird gezählt, wie oft eine Seite aufgerufen wird.
            Der Zähler setzt keinen Cookie, vergibt keine wiedererkennbare Kennung und
            speichert keine IP-Adresse; gezählt wird der Aufruf, nicht die Person. Ein
            Personenbezug entsteht dabei nicht. Rechtsgrundlage für die Reichweiten­messung
            ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>
        ) : (
          <p>Es ist kein Analysedienst und kein Besucherzähler eingebunden.</p>
        )}
        <p>
          Beim Aufruf der Seite verarbeitet der Hoster {ANBIETER.hoster} technisch
          notwendige Verbindungsdaten (unter anderem IP-Adresse, Zeitpunkt, abgerufene
          Datei) zur Auslieferung und Absicherung. Rechtsgrundlage ist
          Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Die Schriften werden mit der Seite ausgeliefert, nicht von einem
          Drittanbieter nachgeladen. Die Leseprobe liegt auf demselben Server wie
          die Seite. Der Kauflink führt zu Amazon; dort gelten die
          Datenschutzbestimmungen von Amazon.
        </p>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein
          Beschwerderecht bei einer Aufsichtsbehörde. Wenden Sie sich dafür an{' '}
          {ANBIETER.email
            ? <a href={`mailto:${ANBIETER.email}`}>{ANBIETER.email}</a>
            : <i className="fehlt">die noch einzutragende E-Mail-Adresse</i>}.
        </p>
        <p className="quelle">
          <b>Hinweis</b>Dieser Text ist ein Entwurf und keine Rechtsberatung.
          Vor dem Livegang rechtlich prüfen lassen.
        </p>
      </article>

      <nav className="fusszeile">
        <a href={wegUeber()}>Über das Projekt</a>
        <a href={wegHaus()}>Zurück zu {TRENDONIX.name}</a>
      </nav>
      <Kanaele />
    </main>
  );
}
