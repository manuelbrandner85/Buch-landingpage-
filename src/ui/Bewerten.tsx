import { BEWERTUNGSFORMULAR } from '@/data/gemeinsam/bewertung';
import type { Buch } from '@/data/gemeinsam/typen';
import { wegImpressum } from '@/world/wege';

/**
 * „Haben Sie das Buch gelesen?“ – das Formular unter den Stimmen.
 *
 * Gebaut wie der Verteiler, aus denselben Gründen: ein gewöhnliches Formular
 * ohne eine Zeile Skript, das im statischen Export funktioniert und keinen
 * Schlüssel im Quelltext braucht. Drei Dinge kommen dazu:
 *
 *  · **Nur bei erschienenen Büchern.** Wer einen Band bewerten will, den es
 *    nicht zu kaufen gibt, hat ihn nicht gelesen.
 *  · **Das Buch reist verborgen mit.** Ohne dieses Feld käme eine Bewertung
 *    ohne Zuordnung an, und bei vier Titeln ist „welches Buch war das noch?“
 *    keine rhetorische Frage.
 *  · **Die Sterne sind Auswahlknöpfe, kein Skript.** Fünf Radiofelder, das
 *    mittlere ohne Vorauswahl. Vorauszuwählen hieße, eine Note vorzuschlagen.
 *
 * Was ankommt, erscheint **nicht** von selbst. Es wird gelesen und dann in
 * `data/gemeinsam/stimmen.ts` eingetragen – mit `art: 'direkt'`, damit es im
 * eigenen Abschnitt steht und nicht in den Amazon-Schnitt läuft. Warum das so
 * sein muss, steht ausführlich in `data/gemeinsam/bewertung.ts`.
 */
export function Bewerten({ buch }: { buch: Buch }) {
  const f = BEWERTUNGSFORMULAR;
  if (!f.formular || buch.status !== 'erschienen') return null;

  return (
    <section className="bewerten" id="bewerten">
      <div className="kopf">
        <p className="eyebrow">Ihre Meinung</p>
        <h2>{f.titel}</h2>
        <p>{f.text}</p>
      </div>

      <form className="verteiler-feld" action={f.formular} method="POST">
        {/* Welches Buch – für den Absender unsichtbar, für die Zuordnung nötig. */}
        <input type="hidden" name="BUCH" value={`${buch.id} · ${buch.titel}`} />

        <fieldset className="bewerten-sterne">
          <legend className="verteiler-wort">Wie viele Sterne?</legend>
          {[5, 4, 3, 2, 1].map((n) => (
            <label className="verteiler-haken" key={n}>
              <input type="radio" name="STERNE" value={String(n)} required />
              <span>{n} {n === 1 ? 'Stern' : 'Sterne'}</span>
            </label>
          ))}
        </fieldset>

        <label className="verteiler-zeile">
          <span className="verteiler-wort">Ihre Bewertung</span>
          <textarea name="BEWERTUNG" rows={6} required maxLength={2000}
            placeholder="Was hat Ihnen gefallen, was nicht?" />
        </label>

        <label className="verteiler-zeile">
          <span className="verteiler-wort">Name, unter dem es stehen soll</span>
          <input type="text" name="NAME_OEFFENTLICH" required maxLength={60}
            placeholder="Vorname, Spitzname oder was Sie möchten" />
        </label>

        <label className="verteiler-zeile">
          <span className="verteiler-wort">E-Mail-Adresse – nur für Rückfragen</span>
          <input type="email" name="EMAIL" autoComplete="email" required
            placeholder="name@beispiel.de" />
        </label>

        <label className="verteiler-haken">
          <input type="checkbox" name="OPT_IN" value="1" required />
          <span>
            Meine Bewertung darf mit dem angegebenen Namen auf dieser Seite
            veröffentlicht werden. Die{' '}
            <a href={`${wegImpressum()}#datenschutz`}>Datenschutzhinweise</a> habe
            ich gelesen.
          </span>
        </label>

        {/* Fangfrage für Maschinen – bleibt für Menschen unsichtbar und leer. */}
        <div className="verteiler-falle" aria-hidden="true">
          <input type="text" name="email_address_check" defaultValue="" tabIndex={-1}
            autoComplete="off" />
        </div>
        <input type="hidden" name="locale" value="de" />
        <input type="hidden" name="html_type" value="simple" />

        <button type="submit">{f.knopf}</button>
      </form>

      <p className="feinschrift">{f.versprechen}</p>
    </section>
  );
}
