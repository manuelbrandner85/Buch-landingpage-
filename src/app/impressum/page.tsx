import type { Metadata } from 'next';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { wegHaus, wegUeber } from '@/world/wege';
import { ANBIETER, impressumVollstaendig } from '@/data/gemeinsam/anbieter';
import { zaehlerLaeuft } from '@/ui/Zaehler';
import { ZustimmungAendern } from '@/ui/Zustimmung';
import { messungLaeuft } from '@/data/gemeinsam/messung';
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
  const misst = messungLaeuft();

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
          Es werden keine Konten geführt und keine Werbenetzwerke geladen.
          {misst
            ? ' Für die Reichweitenmessung wird einmalig um Einwilligung gebeten; ohne sie wird kein Cookie gesetzt.'
            : ' Es gibt keine Cookies und keine Einwilligungsabfrage, weil es nichts gibt, worin eingewilligt werden müsste.'}
        </p>
        {misst && (
          <>
            <p>
              <b>Google Analytics 4.</b> Um zu erfahren, wie viele Menschen diese Seite
              lesen und über welchen Weg sie herkommen, ist Google Analytics 4
              eingebunden (Google Ireland Limited, Gordon House, Barrow Street,
              Dublin 4, Irland). Erhoben werden dabei unter anderem aufgerufene Seiten,
              Verweildauer, ungefährer Standort, Gerätetyp und die verweisende Adresse.
              Google setzt dafür Cookies und vergibt eine Kennung, mit der wiederkehrende
              Besuche als solche erkannt werden.
            </p>
            <p>
              <b>Nur mit Ihrer Einwilligung.</b> Das Skript von Google wird erst geladen,
              nachdem Sie im Hinweis am unteren Rand auf „Einverstanden“ geklickt haben.
              Vorher besteht keine Verbindung zu Google, und es wird kein Cookie gesetzt.
              Rechtsgrundlage ist Ihre Einwilligung nach § 25 Abs. 1 TDDDG und
              Art. 6 Abs. 1 lit. a DSGVO. Sie können sie jederzeit mit Wirkung für die
              Zukunft widerrufen; die bis dahin erfolgte Verarbeitung bleibt rechtmäßig.
            </p>
            <p>
              Die IP-Adresse wird gekürzt verarbeitet, Werbefunktionen und die
              Verknüpfung mit Google-Konten sind abgeschaltet. Eine Übermittlung in die
              USA lässt sich dabei nicht ausschließen; Google stützt sich hierfür auf das
              EU-US Data Privacy Framework. Einzelheiten und die Widerspruchsmöglichkeit
              gegenüber Google:{' '}
              <a href="https://policies.google.com/privacy" rel="noopener nofollow">
                policies.google.com/privacy
              </a>
            </p>
            <ZustimmungAendern />
          </>
        )}
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
          <b>Der Verteiler.</b> Wer sich einträgt, gibt eine E-Mail-Adresse an. Sie
          wird verwendet, um über einen neuen Band zu informieren und zu fragen, ob
          ein Leseexemplar erwünscht ist – mehr nicht. Rechtsgrundlage ist Ihre
          Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Die Eintragung erfolgt im
          Doppelbestätigungsverfahren: Ohne den Klick in der Bestätigungsmail wird
          niemand aufgenommen. Sie können die Einwilligung jederzeit mit Wirkung für
          die Zukunft widerrufen – über den Abmeldelink in jeder Nachricht oder
          formlos an die oben genannte Adresse. Danach wird die Adresse gelöscht.
        </p>
        <p>
          Versand und Verwaltung der Liste übernimmt Brevo als Auftragsverarbeiter
          nach Art. 28 DSGVO. Das Anmeldeformular auf dieser Seite wird bei Brevo
          gehostet; mit dem Absenden werden die eingegebene Adresse und technische
          Verbindungsdaten dorthin übertragen. Brevo gibt für die Verarbeitung einen
          Serverstandort in der EU an. Einzelheiten:{' '}
          <a href="https://www.brevo.com/de/legal/privacypolicy/"
            rel="noopener nofollow">brevo.com/de/legal/privacypolicy</a>
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
