'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Feedkapitel } from '@/data/gemeinsam/typen';
import { FEED, LESEORDNUNG } from '@/data/zufall/feed';
import { QR_VEROEFFENTLICHT, qrSchluessel, qrZielNach } from '@/data/gemeinsam/qr';
import { BASIS_PFAD } from '@/world/bilder';
import { weg, wegBuch } from '@/world/wege';
import { Hausmarke } from '@/ui/Hausmarke';
import { Startbildschirm } from './Startbildschirm';

/**
 * Die Welt von „Alles nur Zufall?“.
 *
 * Sie ist kein Weg durch eine Landschaft, sondern ein Aufenthalt in einem
 * Gerät. Das ist keine Spielerei: Das Buch handelt davon, wie Behauptungen im
 * Feed wirken — dicht an dicht, ohne Zeit dazwischen, jede für sich
 * überzeugend. Wer das lesen will, muss es einmal erlebt haben.
 *
 * Zwei Bewegungen, eine Scrollstrecke:
 *
 *  1. **Eintauchen.** Ein ausgeschaltetes Telefon liegt auf Schiefer. Beim
 *     Scrollen fährt die Kamera hinein; der Bildschirm wacht auf, wächst, und
 *     seine Ränder laufen aus dem Bild. Ab da gibt es kein Außen mehr.
 *  2. **Der Feed.** Vierzig Beiträge, einer je Bildschirm, in der zweiten
 *     Leseordnung des Buches — unsortiert, nie zweimal Ähnliches
 *     hintereinander.
 *
 * Was hier NICHT steht: der Kapiteltext, die Kommentarspalte, der Nachtrag.
 * Der Feed zeigt die Behauptung. Die Auflösung steht im Buch — und die Quelle,
 * mit der man sie selbst prüfen kann, unter /q/01 bis /q/40.
 */

/** Maße des Bühnenfotos. */
const BILD = { b: 1728, h: 2304 };
/**
 * Wo die Scheibe im Foto liegt, in Prozent der Bildfläche.
 *
 * Gemessen, nicht geschätzt — und zwar im entzerrten Foto. Die Aufnahme selbst
 * hat Perspektive: Die Scheibe ist unten 715 Pixel breit und oben 623, weil
 * das Gerät flach liegt und der untere Rand näher an der Linse ist. In ein
 * Trapez passt kein Rechteck; deshalb wurde das Foto einmal geradegezogen und
 * diese vier Zahlen stammen aus dem geraden Bild.
 */
const SCHIRM = { links: 30.85, rechts: 68.90, oben: 22.4, unten: 70.2 };

/** Scrollstrecke des Eintauchens, in Bildschirmhöhen. */
const EINTAUCHEN = 3;

/**
 * Was auf dem Weg hinein wann passiert, als Anteil der Strecke.
 *
 * Erst liegt das Gerät nur da. Dann geht der Bildschirm an und zeigt einen
 * Startbildschirm — mit einer App darauf. Die öffnet sich, wie sich eine App
 * öffnet: Das Symbol wächst über den ganzen Schirm, und darunter läuft schon,
 * was danach kommt.
 */
const WACH = 0.26;        // ab hier ist der Bildschirm an
const OEFFNET = 0.60;     // ab hier wächst das App-Symbol
const DRIN = 0.90;        // ab hier ist nur noch der Feed da
/** Scrollstrecke je Beitrag. Eins heißt: ein Wisch, ein Beitrag. */
const JE_BEITRAG = 1;

const ordnung: Feedkapitel[] = LESEORDNUNG
  .map((nr) => FEED.find((k) => k.nr === nr))
  .filter((k): k is Feedkapitel => Boolean(k));

const glaetten = (x: number) => x * x * (3 - 2 * x);
const klemmen = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function FeedWelt() {
  const [t, setT] = useState(0);          // 0 = Gerät liegt da, 1 = Bildschirm ist alles
  const [index, setIndex] = useState(0);
  const [bewegung, setBewegung] = useState(true);
  const [mass, setMass] = useState({ s: 1, b: 0, h: 0 });
  const [schmal, setSchmal] = useState(false);
  /**
   * Wie oft jemand auf „Sieh selbst nach“ gedrückt hat.
   *
   * Diese Zahl ist der ganze Schluss. Sie steht nirgends unterwegs, sie wird
   * nur mitgeführt — und am Ende steht sie da. Bei fast allen wird sie null
   * sein, und genau davon handelt das Buch. Nichts davon verlässt das Gerät.
   */
  const [nachgesehen, setNachgesehen] = useState(0);
  const rahmen = useRef(0);

  useEffect(() => {
    const wenigerBewegung = window.matchMedia('(prefers-reduced-motion: reduce)');
    const zu = () => setBewegung(!wenigerBewegung.matches);
    zu();
    wenigerBewegung.addEventListener('change', zu);
    return () => wenigerBewegung.removeEventListener('change', zu);
  }, []);

  /**
   * Ein Maßstab für beides.
   *
   * Das Fenster ist am Anfang genau der Bildschirm im Foto und am Ende der
   * ganze Schirm. Damit der Rand des Geräts die ganze Fahrt über am Fenster
   * klebt, wird nicht zweimal gerechnet, sondern einmal: `s` vergrößert das
   * Foto und das Fenster gleichzeitig.
   */
  const messen = useCallback(() => {
    const vb = window.innerWidth;
    const vh = window.innerHeight;
    const y = window.scrollY;

    const eintauchenHoehe = EINTAUCHEN * vh;
    const fortschritt = klemmen(y / eintauchenHoehe);
    setT(fortschritt);
    const nachher = Math.max(0, y - eintauchenHoehe);
    setIndex(klemmen(Math.round(nachher / (JE_BEITRAG * vh)), 0, ordnung.length));

    // Das Foto liegt 3:4 im Bild und ist so groß, wie es ganz hineinpasst.
    const fotoB = Math.min(vb, vh * (BILD.b / BILD.h));
    const fotoH = fotoB * (BILD.h / BILD.b);
    const schirmB = fotoB * (SCHIRM.rechts - SCHIRM.links) / 100;
    const schirmH = fotoH * (SCHIRM.unten - SCHIRM.oben) / 100;
    const nötig = Math.max(vb / schirmB, vh / schirmH);
    const s = 1 + glaetten(klemmen(fortschritt / 0.94)) * (nötig - 1);
    setMass({ s, b: schirmB * s, h: schirmH * s });
    setSchmal(vb < 700);
  }, []);

  useEffect(() => {
    const beiScroll = () => {
      cancelAnimationFrame(rahmen.current);
      rahmen.current = requestAnimationFrame(messen);
    };
    messen();
    window.addEventListener('scroll', beiScroll, { passive: true });
    window.addEventListener('resize', beiScroll);
    return () => {
      cancelAnimationFrame(rahmen.current);
      window.removeEventListener('scroll', beiScroll);
      window.removeEventListener('resize', beiScroll);
    };
  }, [messen]);

  const imFeed = t >= DRIN;
  const amEnde = index >= ordnung.length;
  const aktuell = ordnung[index];
  const gesamt = EINTAUCHEN * 100 + (ordnung.length + 1) * JE_BEITRAG * 100;

  return (
    <div className="feedwelt" style={{ height: `${gesamt}svh` }}>
      <div className="fw-buehne">
        {/* Das Gerät verschwindet nicht — es wird zu groß fürs Bild. */}
        <div className="fw-geraet" style={{
          width: `min(100vw, ${(BILD.b / BILD.h) * 100}svh)`,
          transform: `translate(-${(SCHIRM.links + SCHIRM.rechts) / 2}%, `
            + `-${(SCHIRM.oben + SCHIRM.unten) / 2}%) scale(${mass.s})`,
          transformOrigin: `${(SCHIRM.links + SCHIRM.rechts) / 2}% ${(SCHIRM.oben + SCHIRM.unten) / 2}%`,
          opacity: klemmen(1 - (t - 0.84) / 0.12),
        }}>
          <picture>
            <source srcSet={`${BASIS_PFAD}/assets/zufall/szenen/buehne-handy-1600.webp`}
              media="(min-width: 800px)" />
            <img src={`${BASIS_PFAD}/assets/zufall/szenen/buehne-handy-1000.webp`}
              alt="Ein ausgeschaltetes Telefon liegt auf einer dunklen Schieferplatte."
              width={BILD.b} height={BILD.h} fetchPriority="high" />
          </picture>
        </div>

        {/* Das Fenster: erst der Bildschirm im Foto, am Ende der ganze Schirm.
            Was darin liegt, wechselt: aus, Startbildschirm, App, Feed. */}
        <div className="fw-fenster" style={{
          width: mass.b ? `${mass.b}px` : `${SCHIRM.rechts - SCHIRM.links}%`,
          height: mass.h ? `${mass.h}px` : `${SCHIRM.unten - SCHIRM.oben}%`,
          /* Die Ecken sind so rund wie die Scheibe im Foto: Der Bogen läuft
             über 139 der 680 Pixel Gerätebreite, also gut fünfzehn Prozent —
             nicht neun, wie ich zuerst annahm. Bei neun schnitt die Ecke über
             den Gehäuserand, und genau das stand oben rechts heraus. */
          borderRadius: `${mass.b * 0.155 * klemmen(1 - t / 0.72)}px`,
        }}>
          {/* Solange die App nicht offen ist, liegt hinter dem Startbildschirm
              nichts — man sieht die echte, ausgeschaltete Scheibe des Fotos.
              Der Feed erscheint erst, wenn die App ihn aufzieht. */}
          <div className="fw-band" style={{
            transform: `translate3d(0, ${-index * 100}%, 0)`,
            opacity: t >= OEFFNET ? 1 : 0,
          }}>
            {ordnung.map((k, i) => (
              <Beitrag key={k.nr} kapitel={k} nah={Math.abs(i - index) <= 2}
                spielt={bewegung && i === index} schmal={schmal} />
            ))}
            <Schluss gesehen={ordnung.length} nachgesehen={nachgesehen} />
          </div>

          {/* Startbildschirm und App-Öffnung liegen im Fenster, nicht darüber:
              Sie gehören zum Gerät und wachsen mit ihm. */}
          {t >= WACH && t < DRIN && (
            <Startbildschirm
              hell={klemmen((t - WACH) / 0.1)}
              oeffnet={klemmen((t - OEFFNET) / (DRIN - OEFFNET))} />
          )}

          {/* Der Glasglanz.
              Ein eingeschalteter Bildschirm hinter Glas spiegelt weiter — das
              Licht von links oben, das im Foto auf der Schieferplatte liegt,
              liegt auch auf der Scheibe. Ohne diese Ebene sieht der Bildschirm
              aus wie ein hineinkopiertes Rechteck. Sie verschwindet, sobald
              man drin ist: Wer im Bild steht, sieht keine Scheibe mehr. */}
          {t < DRIN && (
            <div className="fw-glas" aria-hidden="true"
              style={{ opacity: 1 - klemmen((t - 0.55) / (DRIN - 0.55)) }} />
          )}
        </div>

        {/* Die Oberfläche des laufenden Beitrags — und der Hinweis des Buches,
            sichtbar und nicht im Kleingedruckten. */}
        {imFeed && !amEnde && aktuell && (
          <Oberflaeche key={aktuell.nr} kapitel={aktuell}
            beiNachsehen={() => setNachgesehen((n) => n + 1)} />
        )}
        {imFeed && !amEnde && (
          <p className="fw-erfunden">Konten und Zahlen sind erfunden. Die Quellen nicht.</p>
        )}

        {/* Der Anfangstext gehört zum dunklen Gerät. Sobald der Bildschirm
            angeht, ist er weg — sonst stünde er über dem Startbildschirm, und
            ein Telefon hat keine Bildunterschrift. */}
        {t < WACH && (
          <div className="fw-anfang" style={{ opacity: klemmen(1 - t / (WACH * 0.8)) }}>
            <p className="eyebrow">Alles nur Zufall?</p>
            <p className="fw-satz">Vierzig Theorien, die die Welt erklären. Angeblich.</p>
            <p className="fw-wink">Scrollen</p>
          </div>
        )}

        {imFeed && (
          <a className="fw-raus" href={wegBuch('zufall')}>
            <span aria-hidden="true">×</span> Raus hier
          </a>
        )}
        {imFeed && !amEnde && (
          <p className="fw-staerke" aria-hidden="true">
            <span style={{ width: `${((index + 1) / ordnung.length) * 100}%` }} />
          </p>
        )}
      </div>
    </div>
  );
}

function Beitrag({ kapitel, nah, spielt, schmal }: {
  kapitel: Feedkapitel; nah: boolean; spielt: boolean; schmal: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const nr = String(kapitel.nr).padStart(2, '0');

  /**
   * Jeder Beitrag fängt von vorn an.
   *
   * Ein Video, das im Hintergrund weiterläuft, ist beim Zurückscrollen mitten
   * im Bild — und die Bewegung dieser Clips ist so langsam, dass man dann gar
   * keine mehr sieht. Also: beim Hereinkommen auf null und abspielen, beim
   * Hinausgehen anhalten und zurückstellen.
   */
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (spielt) {
      try { v.currentTime = 0; } catch { /* noch nicht ladbar, egal */ }
      const p = v.play();
      if (p) p.catch(() => {});
    } else {
      v.pause();
      try { v.currentTime = 0; } catch { /* dito */ }
    }
  }, [spielt]);

  return (
    /* Ohne Beschriftung hört ein Vorleseprogramm hier einundvierzigmal
       „Artikel“ und sonst nichts. Der Text des Beitrags steht in der
       Oberfläche darüber; das Bild braucht trotzdem einen Namen. */
    <article className="fw-beitrag" aria-label={`Kapitel ${kapitel.nr}: ${kapitel.titel}`}>
      {nah ? (
        /* Ein <source media="…"> wirkt bei <video> nicht: Der Browser nimmt
           die erste Quelle, die er abspielen kann, und das wäre auf jedem
           Telefon die große Datei gewesen. Deshalb wird die Fassung hier
           ausgewählt und nicht dem Browser überlassen. */
        <video ref={video} className="fw-clip" muted loop playsInline preload="metadata"
          src={`${BASIS_PFAD}/assets/zufall/szenen/kap${nr}-motion${schmal ? '-klein' : ''}.mp4`}
          poster={`${BASIS_PFAD}/assets/zufall/szenen/kap${nr}-1000.webp`} />
      ) : (
        <img className="fw-clip" loading="lazy" alt=""
          src={`${BASIS_PFAD}/assets/zufall/szenen/kap${nr}-640.webp`} />
      )}
    </article>
  );
}

/**
 * Die Bedienoberfläche liegt über dem Bildschirm, nicht im Fenster.
 *
 * Das Fenster ist am Ende der Fahrt größer als der Bildschirm — es füllt ihn
 * in der Breite und läuft oben und unten hinaus, sonst gäbe es Ränder. Was
 * darin steckt, steckt also teilweise außerhalb des Sichtbaren. Schrift, die
 * daran hinge, stünde je nach Fensterform unten ab. Deshalb hängt sie am
 * Bildschirm und zeigt immer den Beitrag, der gerade dran ist.
 */
function Oberflaeche({ kapitel, beiNachsehen }: {
  kapitel: Feedkapitel; beiNachsehen: () => void;
}) {
  const nr = String(kapitel.nr).padStart(2, '0');
  const ziel = qrZielNach(qrSchluessel(kapitel.nr));

  /**
   * Der Kommentarstrom.
   *
   * In einer Kommentarspalte steht alles nebeneinander und wartet. In einem
   * Livestream zieht es vorbei: Eine Zeile kommt unten dazu, schiebt die
   * anderen nach oben, und oben ist sie weg. Das ist der Unterschied zwischen
   * Lesen und Danebenstehen — und es ist der Grund, warum im Buch niemand
   * dazwischenkommt.
   *
   * Sechs Zeilen je Kapitel, in Schleife. Mehr steht nicht in den Daten.
   */
  const zeilen = kapitel.kommentare ?? [];
  const [strom, setStrom] = useState(0);
  useEffect(() => {
    if (zeilen.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const uhr = window.setInterval(() => setStrom((n) => n + 1), 2800);
    return () => window.clearInterval(uhr);
  }, [zeilen.length]);

  const sichtbar = zeilen.length === 0 ? [] : Array.from({ length: 4 }, (_, k) => {
    const nummer = strom - (3 - k);
    return nummer < 0 ? null : { nummer, zeile: zeilen[nummer % zeilen.length]! };
  }).filter((e): e is { nummer: number; zeile: { von: string; text: string } } => e !== null);

  return (
    <div className="fw-oberflaeche">
      <div className="fw-schleier" />



      <p className="fw-fussnote">
        Kapitel {kapitel.nr} · {kapitel.titel} · Buchseite {kapitel.seite}
      </p>

      {/* Acht der vierzig Beiträge sind im Buch als KI-Clip gesetzt: großer
          Satz in Versalien, darunter der Hinweis, den solche Videos tragen.
          Die Welt setzt sie genauso — der Hinweis ist die Pointe, nicht das
          Kleingedruckte. */}
      {kapitel.kiHinweis && (
        <p className="fw-kiruf">{kapitel.caption}</p>
      )}

      {/* Strom und Bildunterschrift stehen in einer Spalte, nicht übereinander:
          Getrennt verankert überlappten sie sich, sobald eine Unterschrift drei
          Zeilen lang wurde. */}
      <div className="fw-unten">
        {sichtbar.length > 0 && (
          <div className="fw-strom" aria-hidden="true">
            {sichtbar.map(({ nummer, zeile }) => (
              <p key={nummer} className="fw-zeile">
                <span className="fw-kopf">{zeile.von.replace('@', '').charAt(0)}</span>
                <span className="fw-wort"><b>{zeile.von}</b> {zeile.text}</span>
              </p>
            ))}
          </div>
        )}

      <div className="fw-text">
        {kapitel.handle && <p className="fw-konto">{kapitel.handle}</p>}
        {kapitel.kiHinweis
          ? <p className="fw-kihinweis">KI-generiert · Stimme synthetisch</p>
          : <p className="fw-unterschrift">{kapitel.caption}</p>}
        <p className="fw-marken">{kapitel.hashtags.map((h) => <span key={h}>#{h}</span>)}</p>
        <p className="fw-ton">
          <span className="fw-note" aria-hidden="true">♪</span>
          Originalton — {kapitel.ton ?? kapitel.handle ?? 'Trendonix'}
        </p>
      </div>
      </div>

      <div className="fw-leiste">
        {QR_VEROEFFENTLICHT && ziel && (
          <a className="fw-nachsehen" href={weg(`/q/${nr}/`)} onClick={beiNachsehen}>
            <span className="fw-lupe" aria-hidden="true">⌕</span>
            Sieh selbst nach
          </a>
        )}
        <Zahl art="herz" wert={kapitel.zahlen[0]} was="Gefällt mir" />
        <Zahl art="rede" wert={kapitel.zahlen[1]} was="Kommentare" />
        <Zahl art="teilen" wert={kapitel.zahlen[2]} was="geteilt" />
        <span className="fw-marke"><Hausmarke breite={34} hoehe={23} /></span>
      </div>
    </div>
  );
}

function Zahl({ art, wert, was }: { art: 'herz' | 'rede' | 'teilen'; wert?: string; was: string }) {
  if (!wert) return null;
  const zeichen = art === 'herz' ? '♥' : art === 'rede' ? '💬' : '↗';
  return (
    <span className="fw-zahl">
      <span className={`fw-sinnbild fw-${art}`} aria-hidden="true">{zeichen}</span>
      <b>{wert}</b>
      <i>{was}</i>
    </span>
  );
}

/**
 * Was am Ende des Feeds steht.
 *
 * Im Netz steht dort nichts — man scrollt weiter. Hier steht das Buch, und die
 * Frage ist, wie. Ein Kaufknopf am Ende von vierzig Behauptungen wäre die
 * vierzigste Behauptung.
 *
 * Deshalb steht dort zuerst eine Zahl, die der Besucher selbst erzeugt hat:
 * wie oft er nachgesehen hat. Bei den meisten ist sie null, und das ist keine
 * Anklage, sondern genau der Vorgang, den das Buch beschreibt — man hat es
 * eben selbst getan. Wer das an sich bemerkt, braucht kein Verkaufsargument
 * mehr; er hat eins.
 *
 * Danach zwei Sätze aus dem Vorwort, die belegen, was das Buch verspricht: In
 * fast jedem Kapitel ist die belegte Geschichte seltsamer als die erfundene.
 * Beide sind wahr und beide stehen im Buch.
 *
 * Und zuletzt das, was es heute wirklich zu holen gibt. Einen Kaufweg gibt es
 * noch nicht — hier einen hinzuschreiben wäre gelogen. Es gibt die vierzig
 * Quellenseiten, kostenlos und dauerhaft, und die Möglichkeit, Bescheid zu
 * bekommen. Wer zuerst gibt, muss nicht drängen.
 */
function Schluss({ gesehen, nachgesehen }: { gesehen: number; nachgesehen: number }) {
  const keinmal = nachgesehen === 0;
  return (
    <article className="fw-beitrag fw-schluss">
      <div className="fw-schlussinhalt">
        <p className="eyebrow">Ende des Feeds</p>
        <h2>
          {gesehen} Behauptungen.
          <br />
          <span className="fw-zaehler">Nachgesehen: {nachgesehen}.</span>
        </h2>

        {keinmal ? (
          <p className="fw-fuehrt">
            Das ist kein Vorwurf. Es ist der Vorgang, um den es geht — und Sie
            haben ihn eben an sich selbst beobachtet. Zwischen zwei
            Behauptungen liegt nie genug Zeit, um eine davon zu prüfen. Genau
            deshalb wirkt es.
          </p>
        ) : (
          <p className="fw-fuehrt">
            {nachgesehen === 1 ? 'Einmal nachgesehen.' : `${nachgesehen}-mal nachgesehen.`}{' '}
            Das sind mehr als bei den meisten — und mehr, als die Leute
            nachsehen, die dieselben Behauptungen für widerlegt halten.
          </p>
        )}

        <p>
          Vierzig Theorien stehen in diesem Buch, und neben jeder steht, was
          tatsächlich dokumentiert ist. Dabei passiert fast überall dasselbe:
          Die belegte Geschichte ist seltsamer als die erfundene.
        </p>
        <p className="fw-zwei">
          Die geheimste Organisation der Weltgeschichte flog auf, weil ein
          Kurier im Gewitter spazieren ging. Die Titanic hatte keine Ferngläser
          im Ausguck, weil ein Offizier den Schlüssel zum Schrank in der Tasche
          mitnahm.
        </p>
        <p className="fw-fein">
          456 Seiten · vierzig Kapitel · vierzig Quellen, die jeder öffnen kann
        </p>

        <div className="fw-wege">
          <a className="kaufen" href={`${wegBuch('zufall')}#verteiler`}>
            Bescheid geben lassen
            <small>wenn es zu haben ist</small>
          </a>
          <a className="eintauchen" href={weg('/q/')}>Die vierzig Quellen — offen, kostenlos</a>
          <a className="eintauchen" href={wegBuch('zufall')}>Zum Buch</a>
        </div>

        <p className="fw-klein">
          Die Konten in diesem Feed gibt es nicht, die Kommentare sind
          geschrieben und die Zahlen ausgedacht. Das steht so im Vorwort des
          Buches, und es steht hier aus demselben Grund: damit es jemand liest.
          Die Quellen dahinter sind echt und stehen offen.
        </p>
      </div>
    </article>
  );
}
