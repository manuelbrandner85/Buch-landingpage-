'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Der Film über das Haus, gleich unter dem Empfang.
 *
 * ── Warum er nicht einfach mit Ton startet ──────────────────────────────
 *
 * Chrome, Safari und Firefox lassen einen Film **mit Ton** nur dann von
 * selbst anlaufen, wenn eine von zwei Bedingungen erfüllt ist: Der Besucher
 * hat auf dieser Seite schon einmal etwas angetippt oder geklickt, oder der
 * Browser hat sich gemerkt, dass hier regelmäßig Medien laufen (bei Chrome
 * heißt das Media Engagement Index). Trifft beides nicht zu, wird das
 * `play()` mit Ton abgelehnt — nicht stumm geschaltet, sondern abgelehnt:
 * Ohne Rückfall stünde das Bild still.
 *
 * Deshalb macht diese Komponente drei Dinge in genau dieser Reihenfolge:
 *
 *  1. Sie versucht es **mit Ton**. Bei einem wiederkehrenden Besucher, der
 *     hier schon einmal einen Film gesehen hat, klappt das — dann läuft er
 *     tatsächlich von allein mit Stimme an.
 *  2. Wird abgelehnt, läuft er **stumm weiter** und wartet auf die erste
 *     Berührung irgendwo auf der Seite — ein Klick, ein Tippen, eine Taste.
 *     In dieser Sekunde wird der Ton nachgeholt, ohne dass jemand einen Knopf
 *     suchen muss. Auf einer Seite, auf der man ohnehin scrollt und klickt,
 *     sind das meist wenige Sekunden.
 *  3. Der Knopf bleibt trotzdem sichtbar. Ein Film, der unangekündigt laut
 *     wird, ohne dass man ihn wieder leise bekommt, ist eine Zumutung — und
 *     wer einmal stumm gestellt hat, bekommt beim nächsten Besuch keinen Ton
 *     mehr aufgedrängt. Das merkt sich der Browser hier auf dem Gerät.
 *
 * ── Und warum er anhält ─────────────────────────────────────────────────
 *
 * Sobald der Film aus dem Bild scrollt, hält er an. Ein Ton, der aus einem
 * Abschnitt weiterläuft, den man längst verlassen hat, ist das Nervigste, was
 * eine Seite tun kann — und er kostet Datenvolumen für ein Bild, das niemand
 * mehr sieht. Kommt der Abschnitt zurück ins Bild, läuft er weiter.
 *
 * Wer „Bewegung reduzieren“ eingestellt hat, bekommt das Standbild mit einem
 * Abspielknopf und sonst nichts. Geladen wird der Film erst, wenn er gebraucht
 * wird: Bis dahin steht nur das Poster, und die Startseite bleibt so schnell,
 * wie sie ohne ihn wäre.
 */
const MERKER = 'trendonix-film-ton';

export function Hausfilm(
  { film, filmKlein, poster, titel, text, laenge }:
  { film: string; filmKlein?: string; poster: string; titel: string;
    text: string[]; laenge?: string }) {
  const kasten = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLVideoElement>(null);
  const [quelle, setQuelle] = useState<string | null>(null);
  const [ton, setTon] = useState(false);
  const [ruhig, setRuhig] = useState(false);
  const gefragt = useRef(false);

  /** Ton an — und wenn der Browser nein sagt, stumm weiterlaufen. */
  const tonVersuchen = useCallback(async () => {
    const v = band.current;
    if (!v) return false;
    if (window.localStorage?.getItem(MERKER) === 'aus') return false;
    v.muted = false;
    try {
      await v.play();
      setTon(true);
      return true;
    } catch {
      v.muted = true;
      setTon(false);
      void v.play().catch(() => {});
      return false;
    }
  }, []);

  useEffect(() => {
    const stille = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRuhig(stille.matches);
    // Welche Fassung — erst im Browser entschieden, damit nicht beide laden.
    const schmal = window.matchMedia('(max-width: 900px)');
    const passend = () => (schmal.matches && filmKlein ? filmKlein : film);
    if (stille.matches) return;

    const el = kasten.current;
    if (!el) return;

    const beobachter = new IntersectionObserver(async (eintraege) => {
      for (const e of eintraege) {
        const v = band.current;
        if (e.isIntersecting && e.intersectionRatio > 0.45) {
          setQuelle((vorher) => vorher ?? passend());
          if (!v) continue;
          const klappte = await tonVersuchen();
          if (!klappte && !gefragt.current) {
            // Auf die erste Berührung warten und den Ton dann nachholen.
            gefragt.current = true;
            const abbruch = new AbortController();
            const nachholen = () => {
              abbruch.abort();
              void tonVersuchen();
            };
            for (const art of ['pointerdown', 'keydown', 'touchend'] as const) {
              document.addEventListener(art, nachholen,
                { signal: abbruch.signal, passive: true });
            }
          }
        } else if (v && !v.paused) {
          v.pause();
        }
      }
    }, { threshold: [0, 0.45, 0.8] });

    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, [tonVersuchen, film, filmKlein]);

  const umschalten = () => {
    const v = band.current;
    if (!v) return;
    const neu = !ton;
    v.muted = !neu;
    setTon(neu);
    try { window.localStorage?.setItem(MERKER, neu ? 'an' : 'aus'); } catch { /* egal */ }
    if (neu) void v.play().catch(() => {});
  };

  return (
    <section className="hausfilm" ref={kasten} aria-label={titel}>
      <figure>
        <div className="hausfilm-rahmen">
          {/* `playsInline` ist auf dem iPhone die Bedingung dafür, dass der
              Film überhaupt in der Seite läuft statt den Bildschirm zu
              übernehmen. Ohne das Attribut springt Safari in den Vollbild-
              modus — mitten im Scrollen. */}
          <video ref={band} poster={poster} muted playsInline loop
            preload={quelle ? 'auto' : 'none'}
            src={quelle ?? undefined}
            onClick={umschalten}
            aria-label={titel} />
          {!ruhig && (
            <button type="button" className="hausfilm-ton" onClick={umschalten}
              aria-pressed={ton}>
              {ton ? 'Ton aus' : 'Ton an'}
            </button>
          )}
          {ruhig && (
            <button type="button" className="hausfilm-start"
              onClick={() => {
                setQuelle((v) => v ?? (window.matchMedia('(max-width: 900px)').matches
                  && filmKlein ? filmKlein : film));
                setTimeout(() => { void tonVersuchen(); }, 80);
              }}>
              Film abspielen{laenge ? ` · ${laenge}` : ''}
            </button>
          )}
        </div>
        {/* Der gesprochene Text steht auch als Text da – für Vorleseprogramme,
            für Suchmaschinen und für jeden, der lieber liest als sieht. */}
        <figcaption className="nur-lesen">
          {titel}. {text.join(' ')}
        </figcaption>
      </figure>
    </section>
  );
}
