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

        <label className="verteiler-haken">
          <input type="checkbox" name="OPT_IN" value="1" required />
          <span>
            Ich möchte benachrichtigt werden, wenn ein neuer Band erscheint, und
            habe die <a href={`${wegImpressum()}#datenschutz`}>Datenschutzhinweise</a> gelesen.
          </span>
        </label>

        {/* Fangfrage für Maschinen – bleibt für Menschen unsichtbar und leer. */}
        <div className="verteiler-falle" aria-hidden="true">
          <input type="text" name="email_address_check" defaultValue="" tabIndex={-1}
            autoComplete="off" />
        </div>
        <input type="hidden" name="locale" value="de" />

        <button type="submit">{VERTEILER.knopf}</button>
      </form>

      <p className="feinschrift">{VERTEILER.versprechen}</p>
    </section>
  );
}
