import type { Buch, Szene } from '@/data/gemeinsam/typen';
import { BAENDE, TRENDONIX, assetNach, reiheZuBand } from '@/world/registry';
import { wegLeseprobe, wegWelt } from '@/world/wege';
import { BASIS_PFAD } from '@/world/bilder';
import { mailAn } from '@/data/gemeinsam/anbieter';
import { VERTEILER } from '@/data/gemeinsam/verteiler';
import { leseprobeVon } from '@/data/gemeinsam/leseprobe';
import { Kanaele } from '@/ui/Kanaele';
import { Partner } from '@/ui/Partner';
import { Buch3D } from './Buch3D';
import { Hausmarke } from '@/ui/Hausmarke';

/**
 * Die drei Welten — und der Weg zum Buch.
 *
 * Der Bereich ist kein Shop, aber er verschweigt auch nicht, dass es die Bände
 * zu kaufen gibt: Jedes Tor führt an zwei Stellen weiter, in die Welt und zum
 * Buch. Der Kaufweg steht dabei zuerst.
 *
 * Ein Band, der noch nicht erschienen ist, bekommt ein versiegeltes Tor —
 * ohne Titel, ohne Klappentext, ohne Umschlag. Er liegt vollständig in den
 * Daten; sichtbar wird er, sobald `buch.status` auf „erschienen“ steht.
 */

/**
 * Was auf dem Knopf steht, hängt am Zustand des Bandes – nicht am Wunsch.
 *
 * Der erste Kaufweg ist der Hauptweg und trägt den Knopf; weitere Ausgaben
 * stehen als schmale Zeile darunter, damit die Entscheidung eine bleibt.
 * Ohne Kaufweg wird nichts verlinkt: erfundene Adressen gibt es hier nicht.
 */
export function Kaufwege({ buch }: { buch: Buch }) {
  if (buch.status === 'erscheint') {
    // Seit dem 27.08.2026 fuehrt der Hinweis in den Verteiler, nicht mehr ins
    // E-Mail-Programm. Grund: Ein mailto-Link oeffnet auf dem Handy haeufig gar
    // nichts, und wer eine Mail schreibt, landet auf keiner Liste - beim
    // naechsten Band muesste er sich selbst erinnern.
    //
    // Der Rueckfallweg bleibt: Steht in `VERTEILER.formular` keine Adresse,
    // zeigt der Verteiler sich ohnehin nicht, und dann ist die Mail besser als
    // ein Anker, der ins Leere springt.
    const bescheid = VERTEILER.formular
      ? '#verteiler'
      : mailAn(
          `Bescheid geben: Band ${buch.nummer}`,
          `Bitte einmal melden, sobald Band ${buch.nummer} zu haben ist.`,
        );
    return (
      <span className="kaufblock">
        <span className="kaufen wartet">Erscheint in Kürze</span>
        {bescheid && (
          <span className="auch">
            <a href={bescheid}>Bescheid geben lassen</a>
          </span>
        )}
      </span>
    );
  }
  const [erster, ...weitere] = buch.kaufwege;
  if (!erster) return <span className="kaufen wartet">Produktseite folgt</span>;
  return (
    <span className="kaufblock">
      <a className="kaufen" href={erster.url} target="_blank" rel="noopener noreferrer">
        Band {buch.nummer} kaufen
        <small>{erster.form} · {erster.haendler}</small>
      </a>
      {weitere.length > 0 && (
        <span className="auch">
          auch als{' '}
          {weitere.map((w, i) => (
            <span key={w.url}>
              {i > 0 && ', '}
              <a href={w.url} target="_blank" rel="noopener noreferrer">{w.form}</a>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

function Tor({ buch }: { buch: Buch }) {
  // Offen ist alles, was nicht mehr in Arbeit ist – auch ein Band, der erst
  // erscheint. Seine Welt ist begehbar, nur zu kaufen gibt es ihn noch nicht.
  const offen = buch.status !== 'in Arbeit';
  const cover = assetNach(buch.coverAsset);
  const reihe = reiheZuBand(buch.id);
  const probe = leseprobeVon(buch.id);

  if (!offen) {
    return (
      <div className="tor versiegelt">
        <p className="band-nr">Band {buch.nummer}</p>
        <div className="siegelplatte"><span className="siegel">Noch verschlossen</span></div>
        <h3>Der dritte Band</h3>
        <p className="klappe">
          Der Faden läuft weiter. Dieser Teil der Welt öffnet sich mit dem Erscheinen.
        </p>
      </div>
    );
  }

  return (
    <div className="tor">
      <p className="band-nr">
        Band {buch.nummer} · {buch.seiten} Seiten
        {buch.status === 'erscheint' && <> · erscheint</>}
      </p>
      {cover && <Buch3D cover={cover} band={buch.id} />}
      <h3>{buch.titel}</h3>
      {buch.unterzeile && <p className="unterzeile">{buch.unterzeile}</p>}
      <p className="klappe">{buch.klappentext}</p>
      <div className="wege">
        <Kaufwege buch={buch} />
        {reihe && (
          <a className="eintauchen" href={wegWelt(reihe.id, buch.id)}>
            In die Welt von Band {buch.nummer}
          </a>
        )}
        {probe && (
          <a className="probe" href={wegLeseprobe(probe.datei)}
            download={probe.datei} type="application/pdf">
            Leseprobe · {probe.seiten} Seiten, PDF
          </a>
        )}
      </div>
    </div>
  );
}

export function Buecher({ szene }: { szene?: Szene }) {
  // Zwei Auftritte, zwei Umfänge.
  //
  // Auf der Schwelle der Reihe steht die Wahl: alle Bände nebeneinander. Am
  // Ende einer Bandwelt steht nur dieser eine Band – dort wäre jedes andere
  // Buch ein Fremdkörper und würde von dem ablenken, wofür man gerade zwei
  // Stunden Lesezeit investiert hat.
  const amAnfang = szene?.id === 'welten';
  const buecher = amAnfang
    ? BAENDE.map((b) => b.buch)
    : BAENDE.map((b) => b.buch).filter((b) => b.id === szene?.bandId);
  const wartend = buecher.filter((b) => b.status === 'erschienen' && b.kaufwege.length === 0);

  return (
    <>
      <section id={amAnfang ? 'welten' : 'buecher'}
        className={amAnfang ? 'buecher tor-eingang' : 'buecher abschluss'}>
        <div className="kopf">
          <p className="eyebrow">{amAnfang ? 'Die Welten' : 'Am Ende dieser Welt'}</p>
          <h2>{amAnfang ? 'Wo willst du hinein?' : 'Dieser Band'}</h2>
          <p>
            {amAnfang
              ? 'Jeder Band ist eine eigene Welt und lässt sich einzeln betreten. In jeder steht nur, was zu ihrem Band gehört.'
              : 'Zu jeder Aussage weist dieser Band aus, wie gut sie belegt ist — von gesichertem Befund bis zur offenen Frage.'}
          </p>
        </div>

        <div className="tore">
          {buecher.map((b) => <Tor key={b.id} buch={b} />)}
        </div>

        {!amAnfang && wartend.length > 0 && (
          <p className="hinweis-zeile">
            Die Produktseite {wartend.length === 1 ? 'zu diesem Band ist' : 'zu diesen Bänden sind'}
            {' '}noch nicht eingetragen. Hier steht ein Platzhalter statt eines Links —
            erfundene Adressen gibt es in dieser Welt nicht.
          </p>
        )}
        {amAnfang && (
          <p className="hinweis-zeile weiter">
            Jede Welt führt an ihrem Ende zurück hierher.
          </p>
        )}
      </section>
      {!amAnfang && (
        <footer>
          <a href={`${BASIS_PFAD}/`} aria-label={TRENDONIX.name}>
            <Hausmarke klasse="fussmarke" breite={120} hoehe={80} />
          </a>
          <span className="fusslinks">
            <a href={`${BASIS_PFAD}/ueber`}>Über</a>
            <span aria-hidden="true">·</span>
            <a href={`${BASIS_PFAD}/impressum`}>Impressum</a>
          </span>
          <span className="feinschrift">
            Alle Motive stammen aus dem Buch und wurden eigens dafür erzeugt.
          </span>
          <Kanaele />
          <Partner />
        </footer>
      )}
    </>
  );
}
