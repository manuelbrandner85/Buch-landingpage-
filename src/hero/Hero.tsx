'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { BEDARFSMUSTER } from '@/experience/bedarf';
import { useExperience } from '@/experience/useExperience';
import { weg } from '@/world/wege';
import './hero.css';

/**
 * Der Cinematic Hero.
 *
 * Die wichtigste Entscheidung steckt nicht in der Szene, sondern in der
 * Reihenfolge: Ueberschrift, Unterzeile und Handlungsaufruf sind gewoehnliches
 * HTML und stehen im ausgelieferten Dokument. Sie malen sofort, sie sind das
 * groesste Element im ersten Bildschirm — und damit ist der LCP fertig, BEVOR
 * irgendetwas Dreidimensionales geladen wird.
 *
 * Gemessen am 16.09.2026 auf einem gedrosselten Telefon lag der LCP der
 * laufenden Startseite bei 4168 ms gegen ein Budget von 2500. Eine filmische
 * Buehne obendrauf zu setzen, ohne das zu aendern, haette die Seite langsamer
 * gemacht statt hochwertiger. Deshalb: Text zuerst, Buehne danach, und die
 * Buehne kommt ueber einen eigenen Ladeweg, damit Three.js nicht im
 * Startbuendel liegt.
 *
 * Der Text kommt von aussen. Diese Datei kennt keine Reihe, keinen Band und
 * keine Adresse — sonst waere sie an eine Seite gebunden und muesste fuer die
 * naechste kopiert werden.
 */

const Buehne = dynamic(() => import('./Buehne').then((m) => m.Buehne), {
  ssr: false,
});

/**
 * Hat der Leser im Betriebssystem weniger Bewegung verlangt?
 *
 * Der Startwert ist `false`, und das ist kein Versehen: Auf dem Server gibt
 * es keine Medienabfrage. Wer hier `true` raet, liefert ein Dokument aus, das
 * nicht zu dem passt, was React im Browser daraus macht — und React baut den
 * ganzen Baum neu auf, mitten im ersten Bildschirm.
 *
 * Die Engine deckelt bei dieser Einstellung ohnehin auf OPTIMIERT. Hier geht
 * es weiter: Der Hero zeigt dann NUR das Standbild. Das ist kein Verlust —
 * das Standbild ist das erste Bild der Buehne, aus derselben Kamera
 * gerechnet. Es fehlt nichts ausser der Bewegung, und genau die war nicht
 * gewuenscht.
 */
function useWenigerBewegung(): boolean {
  const [wert, setWert] = useState(false);

  useEffect(() => {
    const abfrage = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!abfrage) return;
    setWert(abfrage.matches);
    const beiWechsel = (e: MediaQueryListEvent) => setWert(e.matches);
    abfrage.addEventListener('change', beiWechsel);
    return () => abfrage.removeEventListener('change', beiWechsel);
  }, []);

  return wert;
}

export interface Weg {
  text: string;
  nach: string;
  /** Der erste Weg ist der Hauptweg. Genau einer, nie zwei. */
  haupt?: boolean;
  /** Kleingedrucktes unter dem Text — Preis, Anzahl, Format. */
  zusatz?: string;
}

export interface HeroProps {
  /** Die Zeile ueber der Ueberschrift — Reihe und Bandzahl, kurz gehalten. */
  oben?: ReactNode;
  titel: ReactNode;
  unterzeile?: ReactNode;
  wege?: readonly Weg[];
  /** Fuer `aria-labelledby`; muss im Dokument eindeutig sein. */
  titelId?: string;
  /** Auf Unterseiten steht die Ueberschrift der Seite woanders. */
  alsUeberschrift?: boolean;
}

export function Hero({
  oben,
  titel,
  unterzeile,
  wege = [],
  titelId = 'hero-titel',
  alsUeberschrift = true,
}: HeroProps) {
  const bedarf = useMemo(() => BEDARFSMUSTER.inszenierung('Cinematic Hero'), []);
  const experience = useExperience(bedarf);
  const wenigerBewegung = useWenigerBewegung();
  const [steht, setSteht] = useState(false);
  const [gescheitert, setGescheitert] = useState(false);

  const beiAusfall = useCallback(
    (grund: string) => {
      setGescheitert(true);
      experience.ausfallMelden(grund);
    },
    [experience],
  );

  const beiBereit = useCallback(() => setSteht(true), []);

  // Die Buehne laeuft nur, wenn die Engine sie erlaubt UND sie nicht schon
  // einmal gescheitert ist. Beides getrennt zu halten ist Absicht: Das eine
  // ist ein Urteil ueber das Geraet, das andere ein tatsaechlicher Ausfall.
  const bewegt =
    !experience.laedt &&
    !gescheitert &&
    !wenigerBewegung &&
    experience.stufe !== 'RUECKFALL' &&
    experience.stufe !== 'GESTREAMT';

  const Titel = alsUeberschrift ? 'h1' : 'p';

  return (
    <section className="hero" aria-labelledby={titelId}>
      {/* Das Standbild liegt IMMER darunter — auch waehrend die Buehne laedt.
          Eine schwarze Flaeche waehrend des Ladens liest sich als Defekt, und
          zwar genau in der Sekunde, in der der erste Eindruck entsteht. */}
      <div className="hero-grund" aria-hidden="true">
        {/*
          Kein `next/image`, sondern ein `picture` von Hand.
          Zwei Gruende, beide gemessen:

          1. Kunstrichtung. Quer- und Hochformat sind nicht dasselbe Bild in
             zwei Groessen, sondern zwei Bildausschnitte — im Hochformat steht
             das Buch weiter oben, damit der Text darunter passt. Das kann
             `sizes` nicht ausdruecken, `media` schon.
          2. Gewicht. Die Seite wird statisch ausgeliefert; dort reicht
             `next/image` das Bild unveraendert durch. Das waeren 661 KB PNG
             im ersten Bildschirm. Als AVIF sind es 21 KB — derselbe Inhalt,
             ein Dreissigstel. Erzeugt von `scripts/buch-poster-web.mjs`.

          Die Transparenz ist Absicht: Der dunkle Grund kommt aus dem CSS und
          hat dort denselben Wert wie in der Buehne. Zwei Quellen fuer
          dieselbe Farbe waeren zwei Farben, sobald eine sich aendert.
        */}
        {/* `weg()` und nicht der nackte Pfad.

            Unter der eigenen Domain liegt die Seite in der Wurzel und beides
            waere gleich. Auf dem Spiegel unter github.io liegt sie in einem
            Unterordner, und ein Pfad mit fuehrendem Schraegstrich zeigt dann
            an der Seite vorbei auf die Wurzel der Domain. `basePath` von
            Next.js hilft hier nicht: Es erreicht `next/link` und
            `next/image`, nicht das, was im Markup steht. */}
        <picture>
          <source
            media="(orientation: portrait)"
            type="image/avif"
            srcSet={`${weg('/modelle/buch-poster-hoch-720.avif')} 720w, ${weg('/modelle/buch-poster-hoch.avif')} 1080w`}
            sizes="100vw"
          />
          <source
            media="(orientation: portrait)"
            type="image/webp"
            srcSet={`${weg('/modelle/buch-poster-hoch-720.webp')} 720w, ${weg('/modelle/buch-poster-hoch.webp')} 1080w`}
            sizes="100vw"
          />
          <source
            type="image/avif"
            srcSet={`${weg('/modelle/buch-poster-quer-1000.avif')} 1000w, ${weg('/modelle/buch-poster-quer.avif')} 1600w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${weg('/modelle/buch-poster-quer-1000.webp')} 1000w, ${weg('/modelle/buch-poster-quer.webp')} 1600w`}
            sizes="100vw"
          />
          {/* Die letzte Stufe ist WebP, nicht PNG. Jeder Browser, der heute
              im Netz unterwegs ist, kann WebP; das PNG waere 661 KB fuer
              einen Fall, den es nicht gibt. Es bleibt trotzdem liegen — als
              Vorlage fuer die Umwandlung, nicht als Auslieferung. */}
          <img
            src={weg('/modelle/buch-poster-quer.webp')}
            alt=""
            width={1600}
            height={1000}
            fetchPriority="high"
            decoding="async"
            className={steht && bewegt ? 'hero-standbild hero-standbild--weg' : 'hero-standbild'}
          />
        </picture>
        {bewegt && (
          <Buehne
            budget={experience.budget}
            beiBild={experience.bildFertig}
            beiAusfall={beiAusfall}
            beiBereit={beiBereit}
          />
        )}
        <div className="hero-vignette" />
      </div>

      {/* Der Text. Echtes HTML, sofort da, ohne Einblendung.
          Eine Ueberschrift, die mit `opacity:0` auf ihre Animation wartet,
          verschiebt den LCP um genau die Wartezeit — auf dieser Seite hat
          das schon einmal 2,1 Sekunden gekostet. */}
      <div className="hero-text">
        {oben && <p className="hero-oben">{oben}</p>}
        <Titel id={titelId} className="hero-titel">{titel}</Titel>
        {unterzeile && <p className="hero-unterzeile">{unterzeile}</p>}
        {wege.length > 0 && (
          <div className="hero-wege">
            {wege.map((w) => (
              <a
                key={w.nach}
                className={w.haupt ? 'hero-weg hero-weg--haupt' : 'hero-weg'}
                href={w.nach}
              >
                {w.text}
                {w.zusatz && <small>{w.zusatz}</small>}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
