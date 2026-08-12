import type { Metadata } from 'next';
import { Rueckweg } from '@/ui/Rueckweg';

export const metadata: Metadata = {
  title: 'Impressum – Die unsichtbaren Fäden',
  robots: { index: false },
};

/**
 * Pflichtangaben nach § 5 DDG und Art. 13 DSGVO.
 * Die Platzhalter in Großbuchstaben müssen vor dem Livegang ersetzt werden –
 * erfundene Angaben wären hier besonders schädlich.
 */
export default function ImpressumSeite() {
  return (
    <main className="lesefassung">
      <Rueckweg />
      <p className="eyebrow">Pflichtangaben</p>
      <h1>Impressum</h1>

      <article>
        <h2>Anbieter</h2>
        <p>
          ANBIETER_NAME<br />
          ANBIETER_STRASSE<br />
          ANBIETER_PLZ_ORT<br />
          ANBIETER_LAND
        </p>
        <p>
          E-Mail: ANBIETER_EMAIL<br />
          Telefon: ANBIETER_TELEFON
        </p>
        <p className="quelle">
          <b>Hinweis</b>Platzhalter. Vor dem Livegang durch die tatsächlichen Angaben ersetzen.
        </p>
      </article>

      <article>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>ANBIETER_NAME, Anschrift wie oben.</p>
      </article>

      <article>
        <h2>Datenschutz</h2>
        <p>
          Diese Seite speichert im lokalen Browserspeicher, welche Szenen bereits
          gesehen wurden. Diese Angabe bleibt auf Ihrem Gerät und wird nicht übertragen.
          Es werden keine Konten geführt, keine Analysedienste eingebunden und keine
          Werbenetzwerke geladen.
        </p>
        <p>
          Beim Aufruf der Seite verarbeitet der Hoster HOSTER_NAME technisch notwendige
          Verbindungsdaten (unter anderem IP-Adresse, Zeitpunkt, abgerufene Datei) zur
          Auslieferung und Absicherung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <p>
          Die Schriften werden mit der Seite ausgeliefert, nicht von einem
          Drittanbieter nachgeladen. Der Kauflink führt zu Amazon; dort gelten
          die Datenschutzbestimmungen von Amazon.
        </p>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
          Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein
          Beschwerderecht bei einer Aufsichtsbehörde. Wenden Sie sich dafür an
          ANBIETER_EMAIL.
        </p>
        <p className="quelle">
          <b>Hinweis</b>Dieser Text ist ein Entwurf und keine Rechtsberatung.
          Vor dem Livegang rechtlich prüfen lassen.
        </p>
      </article>

      <nav className="fusszeile"><a href="/ueber">Über das Projekt</a>  <a href="/">Zurück in die Welt</a></nav>
    </main>
  );
}
