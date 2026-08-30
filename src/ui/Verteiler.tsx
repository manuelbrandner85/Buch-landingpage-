import { VERTEILER } from '@/data/gemeinsam/verteiler';
import { wegImpressum } from '@/world/wege';

/**
 * Das Anmeldefeld für den Verteiler.
 *
 * Drei Entscheidungen, die hier festhängen:
 *
 *  · **Es verschwindet, wenn es nicht funktioniert.** Steht in
 *    `VERTEILER.formular` keine Adresse, gibt die Komponente `null` zurück.
 *    Lieber kein Feld als eines, das Adressen ins Nichts schickt.
 *  · **Kein JavaScript.** Ein gewöhnliches Formular, das abschickt und zur
 *    Bestätigungsseite des Dienstes führt. Das funktioniert im statischen
 *    Export, ohne Schlüssel im Code und auch dann, wenn Skripte blockiert sind.
 *  · **Die Einwilligung steht als Kästchen da, nicht im Kleingedruckten.**
 *    Ohne Häkchen kein Absenden – das erledigt `required`, nicht eine Zeile
 *    Skript. Die eigentliche Bestätigung läuft danach über die Mail des
 *    Dienstes (Double Opt-in); ohne diesen zweiten Schritt wird niemand
 *    eingetragen.
 *
 * Das versteckte Feld `email_address_check` ist die Fangfrage für Maschinen:
 * Es liegt außerhalb des Sichtfelds, ein Mensch füllt es nie aus, ein
 * einfacher Formular-Bot schon.
 */
export function Verteiler() {
  if (!VERTEILER.formular) return null;

  return (
    <section className="verteiler" id="verteiler">
      <div className="kopf">
        <p className="eyebrow">Verteiler</p>
        <h2>{VERTEILER.titel}</h2>
        <p>{VERTEILER.text}</p>
      </div>

      <form className="verteiler-feld" action={VERTEILER.formular} method="POST">
        <label className="verteiler-zeile">
          <span className="verteiler-wort">E-Mail-Adresse</span>
          <input type="email" name="EMAIL" autoComplete="email" required
            placeholder="name@beispiel.de" />
        </label>

        {/* Die Feldnamen stammen aus dem Brevo-Formular selbst (Einfaches HTML,
            Stand 30.08.2026): `lists_25[]` mit 4 = Bucherscheinungen und
            5 = Newsletter. Andere Namen wirft Brevo stillschweigend weg -
            deshalb nicht raten, sondern dort nachsehen, wenn sich etwas
            aendert. Bucherscheinung ist vorausgewaehlt, weil genau das die
            Ueberschrift dieses Abschnitts verspricht; der Newsletter ist der
            freiwillige Zusatz und bleibt leer. */}
        <fieldset className="verteiler-wahl">
          <legend className="verteiler-wort">Was möchten Sie bekommen?</legend>
          <label className="verteiler-haken">
            <input type="checkbox" name="lists_25[]" value="4" defaultChecked />
            <span>
              <strong>Bucherscheinungen</strong> – eine kurze Nachricht, wenn ein
              Band erschienen ist. Höchstens eine je Band.
            </span>
          </label>
          <label className="verteiler-haken">
            <input type="checkbox" name="lists_25[]" value="5" />
            <span>
              <strong>Newsletter</strong> – etwa einmal im Monat, über die Arbeit
              an den nächsten Bänden.
            </span>
          </label>
        </fieldset>

        <label className="verteiler-haken">
          <input type="checkbox" name="OPT_IN" value="1" required />
          <span>
            Ich möchte die oben gewählten Nachrichten erhalten. Die{' '}
            <a href={`${wegImpressum()}#datenschutz`}>Datenschutzhinweise</a> habe ich gelesen.
          </span>
        </label>

        {/* Fangfrage für Maschinen – bleibt für Menschen unsichtbar und leer. */}
        <div className="verteiler-falle" aria-hidden="true">
          <input type="text" name="email_address_check" defaultValue="" tabIndex={-1}
            autoComplete="off" />
        </div>
        <input type="hidden" name="locale" value="de" />
        {/* Ohne `html_type` antwortet der Dienst mit nacktem JSON statt mit
            einer Weiterleitung. Der Leser sieht dann `{"success":true,...}`
            und haelt es fuer einen Fehler. */}
        <input type="hidden" name="html_type" value="simple" />

        <button type="submit">{VERTEILER.knopf}</button>
      </form>

      <p className="feinschrift">{VERTEILER.versprechen}</p>
    </section>
  );
}
