'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Feedkapitel } from '@/data/gemeinsam/typen';
import { FEED, LESEORDNUNG } from '@/data/zufall/feed';
import { QR_VEROEFFENTLICHT, qrSchluessel, qrZielNach } from '@/data/gemeinsam/qr';
import { VERTEILER } from '@/data/gemeinsam/verteiler';
import { melden } from '@/data/gemeinsam/messung';
import { BASIS_PFAD, bewegt } from '@/world/bilder';
import { weg, wegBuch, wegImpressum, wegWelt } from '@/world/wege';
import { Hausmarke } from '@/ui/Hausmarke';
import { Startbildschirm } from './Startbildschirm';
import { FeedNetz } from './FeedNetz';

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
const EINTAUCHEN = 4;

/**
 * Der Ablauf des Eintauchens, als Anteil der Strecke.
 *
 * Fünf Schritte, und jeder hat einen Grund:
 *
 *  1. **Heranfahren.** Die Kamera geht auf das Gerät zu, bis es das Bild füllt
 *     — aber ganz. Man sieht das ganze Telefon, von der Oberkante bis zum
 *     Anschluss unten. Vorher fuhr die Kamera gleich in den Bildschirm; dann
 *     war das Gerät weg, bevor man es angesehen hatte.
 *  2. **Aufwachen.** Der Bildschirm geht an, der Startbildschirm liegt da.
 *  3. **Tippen.** Man sieht, worauf gedrückt wird: Ein Berührungspunkt legt
 *     sich auf die Trendonix-App, das Symbol geht unter dem Druck nach innen.
 *     So machen es Bildschirmaufnahmen, und deshalb liest man es sofort.
 *  4. **Öffnen.** Die App zieht sich aus ihrer Kachel über den ganzen Schirm.
 *  5. **Hinein.** Jetzt erst fährt die Kamera in den Bildschirm, bis Rahmen
 *     und Schiefer aus dem Bild sind und nur noch der Inhalt dasteht.
 */
const NAH = 0.26;         // bis hierher wird herangefahren
const WACH = 0.34;        // ab hier ist der Bildschirm an
const TIPP = 0.46;        // ab hier liegt der Finger auf der App
const OEFFNET = 0.58;     // ab hier wächst die App
const OFFEN = 0.72;       // ab hier ist sie ganz offen
const HINEIN = 0.76;      // ab hier fährt die Kamera in den Schirm
const DRIN = 0.98;        // ab hier ist nur noch der Feed da

/** Scrollstrecke je Beitrag. Eins heißt: ein Wisch, ein Beitrag. */
const JE_BEITRAG = 1;

const ordnung: Feedkapitel[] = LESEORDNUNG
  .map((nr) => FEED.find((k) => k.nr === nr))
  .filter((k): k is Feedkapitel => Boolean(k));

/**
 * Nach wie vielen Beiträgen der Zwischenruf steht.
 *
 * Am Ende steht eine Zahl: wie oft jemand nachgesehen hat. Bei fast allen ist
 * sie null, und das ist die Pointe. Nur kommt sie nach vierzig Bildschirmen so
 * spät, dass sie eine Behauptung über den Leser ist statt einer Beobachtung an
 * ihm. Zehn Beiträge sind früh genug, dass er sich noch erinnert, und spät
 * genug, dass die Zahl schon etwas heißt. Danach läuft der Feed weiter — der
 * Zwischenruf hält nicht auf, er stellt nur einmal fest.
 */
const ZWISCHENRUF_NACH = 10;

/** Eine Stelle auf der Strecke: ein Beitrag, der Zwischenruf oder der Schluss. */
type Stelle =
  | { art: 'beitrag'; kapitel: Feedkapitel }
  | { art: 'ruf' }
  | { art: 'schluss' };

/**
 * Die Strecke als eine einzige Liste.
 *
 * Vorher war der Schluss ein Sonderfall hinter dem Ende der Beiträge, und der
 * Zwischenruf hätte ein zweiter werden müssen. Als Liste ist beides dasselbe:
 * ein Bildschirm, der drankommt, wenn er dran ist. Alles, was zählt — Höhe der
 * Seite, laufender Index, Rastpunkte —, zählt diese Liste.
 */
const FOLGE: Stelle[] = [
  ...ordnung.slice(0, ZWISCHENRUF_NACH).map((kapitel): Stelle => ({ art: 'beitrag', kapitel })),
  { art: 'ruf' },
  ...ordnung.slice(ZWISCHENRUF_NACH).map((kapitel): Stelle => ({ art: 'beitrag', kapitel })),
  { art: 'schluss' },
];

/** Wie viele Beiträge bis hierher gezeigt wurden (der Zwischenruf zählt nicht mit). */
const beitraegeBis = (index: number) =>
  FOLGE.slice(0, index + 1).filter((s) => s.art === 'beitrag').length;

const klemmen = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/**
 * Weiche Kurve von 0 auf 1 — und ausdrücklich nur dort.
 *
 * `x²(3−2x)` fällt jenseits von 1 wieder ab. Genau das passierte am Ende der
 * Fahrt: Der Anteil lief bis 1,09, die Kurve gab 0,97 zurück, und der
 * Bildschirm blieb drei Pixel unter der Fensterhöhe stehen. Oben und unten
 * stand ein schwarzer Streifen. Deshalb wird hier geklemmt, nicht an jeder
 * Aufrufstelle einzeln.
 */
const glaetten = (x: number) => { const k = klemmen(x); return k * k * (3 - 2 * k); };

export function FeedWelt() {
  const [t, setT] = useState(0);          // 0 = Gerät liegt da, 1 = Bildschirm ist alles
  const [index, setIndex] = useState(0);
  const [bewegung, setBewegung] = useState(true);
  const [mass, setMass] = useState({ s: 1, b: 0, h: 0, foto: 0 });
  const [schmal, setSchmal] = useState(false);
  /**
   * Bleibt neben der Scheibe Platz? Dann ist es kein Telefon.
   *
   * Auf einem Laptop steht der Feed als hochkante Scheibe in der Mitte. Alles,
   * was auf dem Telefon am Fensterrand klebt — Bildunterschrift, Knöpfe,
   * Fortschritt —, muss dann an der Scheibe kleben und nicht am Browser, sonst
   * steht die Schrift einen halben Meter neben dem Bild.
   */
  const [breit, setBreit] = useState(false);
  /**
   * Die Scrollstrecke in Pixeln, nicht in `svh`.
   *
   * Auf dem Telefon ist `svh` die Höhe MIT eingeblendeter Adressleiste,
   * `window.innerHeight` die aktuelle. Beide auseinanderzuhalten wäre in
   * Ordnung — beide zu mischen ist es nicht: Die Seite war dann höher oder
   * niedriger als die Rechnung, und die letzten Beiträge blieben unerreichbar
   * oder der Schluss kam zu früh. Jetzt kommt beides aus derselben Zahl.
   */
  const [hoehe, setHoehe] = useState(0);
  /**
   * Wie oft jemand auf „Sieh selbst nach“ gedrückt hat.
   *
   * Diese Zahl ist der ganze Schluss. Sie steht nirgends unterwegs, sie wird
   * nur mitgeführt — und am Ende steht sie da. Bei fast allen wird sie null
   * sein, und genau davon handelt das Buch. Nichts davon verlässt das Gerät.
   */
  const [nachgesehen, setNachgesehen] = useState(0);
  /**
   * Welche Quelle gerade offen liegt — oder keine.
   *
   * „Sieh selbst nach“ führte bisher auf eine eigene Seite, und damit war der
   * Aufenthalt zu Ende. Das ist die falsche Belohnung: Wer wissen will, ob
   * etwas stimmt, soll nicht dafür bestraft werden, dass er nachsieht. Jetzt
   * fährt die Quelle als Blatt über den Feed und wieder weg; man steht danach
   * bei demselben Beitrag. Der Verweis bleibt trotzdem ein echter Link — ohne
   * Skript führt er auf die Seite, die es weiterhin gibt.
   */
  const [quelle, setQuelle] = useState<Feedkapitel | null>(null);
  const rahmen = useRef(0);

  /**
   * Die Fenstermaße, absichtlich eingefroren.
   *
   * Das war der Grund für die verkehrte Wischrichtung auf dem Telefon. Beim
   * Wischen nach vorn blendet sich die Adressleiste aus; `innerHeight` springt
   * dabei um bis zu ein Sechstel nach oben. Wurde damit gerechnet, wuchs die
   * Scrollstrecke genau in dem Moment, in dem man vorwärts wischte — und weil
   * der Fortschritt Weg durch Strecke ist, wurde er dabei KLEINER. Die Kamera
   * fuhr also zurück, während der Finger nach vorn ging. Genau so fühlt sich
   * „falschherum“ an.
   *
   * Deshalb zählt hier nur eine echte Änderung: andere Breite, oder ein
   * Höhensprung von mehr als einem Fünftel. Das ist Drehen oder ein neues
   * Fenster — nicht die Adressleiste.
   */
  const sicht = useRef({ b: 0, h: 0 });

  const messenSicht = useCallback(() => {
    const vb = window.innerWidth;
    const vh = window.innerHeight;
    const alt = sicht.current;
    if (alt.h !== 0 && alt.b === vb && Math.abs(vh - alt.h) <= alt.h * 0.2) return false;
    sicht.current = { b: vb, h: vh };
    return true;
  }, []);

  /**
   * Die Welt fängt immer vorn an.
   *
   * Browser merken sich die Scrollhöhe und stellen sie beim Zurückkommen
   * wieder her. Bei einer Seite, die 46 Bildschirme hoch ist, landet man
   * dadurch irgendwo mittendrin — und wer mitten in einem Feed aufwacht, hält
   * die Wischrichtung für verkehrt herum. Deshalb: Wiederherstellung aus, und
   * einmal nach oben.
   */
  useEffect(() => {
    const vorher = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    /* Es sei denn, der Link nennt ein Kapitel — dann ist „vorn“ dort, und der
       Sprung weiter unten erledigt es. */
    if (!/^#k\d{1,2}$/.test(window.location.hash)) {
      /* Ausdrücklich `instant`: In der Seite steht
         `html{scroll-behavior:smooth}`, und ohne diese Angabe würde der
         Browser vom wiederhergestellten Stand aus nach oben *fahren* —
         sichtbar, langsam, quer durch den halben Feed. */
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    return () => { history.scrollRestoration = vorher; };
  }, []);

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
    const vb = sicht.current.b;
    const vh = sicht.current.h;
    if (!vb || !vh) return;
    const y = window.scrollY;

    const eintauchenHoehe = EINTAUCHEN * vh;
    const fortschritt = klemmen(y / eintauchenHoehe);
    setT(fortschritt);
    const nachher = Math.max(0, y - eintauchenHoehe);
    setIndex(klemmen(Math.round(nachher / (JE_BEITRAG * vh)), 0, FOLGE.length - 1));

    // Das Foto liegt 3:4 im Bild und ist so groß, wie es ganz hineinpasst.
    const fotoB = Math.min(vb, vh * (BILD.b / BILD.h));
    const fotoH = fotoB * (BILD.h / BILD.b);
    const schirmB = fotoB * (SCHIRM.rechts - SCHIRM.links) / 100;
    const schirmH = fotoH * (SCHIRM.unten - SCHIRM.oben) / 100;

    /**
     * Zwei Ziele, nacheinander.
     *
     * `sNah` ist der Maßstab, bei dem das ganze Gerät das Bild füllt. Gemessen
     * vom Mittelpunkt der Scheibe aus, denn um den dreht sich alles: Nach oben
     * sind es bis zur Gerätekante 24,6 Prozent der Bildhöhe, nach unten 32,7,
     * zur Seite 19,7 der Breite. Der weiteste Weg bestimmt den Maßstab, und
     * sechs Prozent Luft bleiben, damit das Gerät nicht am Rand klebt.
     *
     * `sVoll` ist der Maßstab, bei dem die Scheibe allein das Bild füllt.
     * Dorthin geht es erst im letzten Schritt.
     */
    const sNah = Math.min(vh / (0.654 * fotoH), vb / (0.394 * fotoB)) * 0.94;
    /**
     * `sVoll` bemisst sich an der HÖHE, nie an der Breite.
     *
     * Vorher stand hier `Math.max(vb / schirmB, vh / schirmH)` — deckt das
     * Fenster in jedem Fall. Auf dem Telefon ist das dasselbe wie die Höhe
     * allein, weil ein Telefon schmaler ist als ein Hochkantvideo. Auf einem
     * Laptop nicht: Dort gewann die Breite, das Fenster wurde 1280 × 2144
     * Pixel, und vom Video sah man den mittleren Streifen — riesig und
     * beschnitten. Genau das ist ihm aufgefallen.
     *
     * An der Höhe gemessen entsteht auf breiten Schirmen eine hochkante
     * Scheibe in der Mitte, so wie ein solches Netz im Browser aussieht, und
     * auf schmalen ändert sich nichts: Ist das Fenster schmaler als 0,597
     * seiner Höhe, deckt die Höhenanpassung die Breite ohnehin mit.
     */
    const sVoll = vh / schirmH;

    const s = fortschritt < NAH
      ? 1 + glaetten(fortschritt / NAH) * (sNah - 1)
      : fortschritt < HINEIN
        ? sNah
        : sNah + glaetten((fortschritt - HINEIN) / (DRIN - HINEIN)) * (sVoll - sNah);

    setMass({ s, b: schirmB * s, h: schirmH * s, foto: fotoB });
    setSchmal(vb < 700);
    setBreit(schirmB * sVoll < vb - 1);
    setHoehe(vh * (EINTAUCHEN + FOLGE.length * JE_BEITRAG));
  }, []);

  useEffect(() => {
    const beiScroll = () => {
      cancelAnimationFrame(rahmen.current);
      rahmen.current = requestAnimationFrame(messen);
    };
    /* Nur bei einer echten Änderung neu rechnen — siehe `messenSicht`. */
    const beiGroesse = () => { if (messenSicht()) beiScroll(); };
    messenSicht();
    messen();
    window.addEventListener('scroll', beiScroll, { passive: true });
    window.addEventListener('resize', beiGroesse);
    window.addEventListener('orientationchange', beiGroesse);
    return () => {
      cancelAnimationFrame(rahmen.current);
      window.removeEventListener('scroll', beiScroll);
      window.removeEventListener('resize', beiGroesse);
      window.removeEventListener('orientationchange', beiGroesse);
    };
  }, [messen, messenSicht]);

  /**
   * Ein Link, der bei einem bestimmten Beitrag aufmacht.
   *
   * `…/zufall/zufall/#k23` landet nicht am Anfang, sondern bei Kapitel 23.
   * Das ist die Voraussetzung dafür, dass Teilen etwas taugt: Wer einen
   * Beitrag weitergibt, gibt diesen Beitrag weiter und nicht die Adresse einer
   * vierzig Bildschirme langen Seite. Der Sprung geschieht genau einmal und
   * erst, wenn die Seite ihre Höhe kennt — vorher gäbe es nichts, wohin man
   * springen könnte.
   */
  const gesprungen = useRef(false);
  useEffect(() => {
    if (gesprungen.current || hoehe <= 0) return;
    gesprungen.current = true;
    const treffer = /^#k(\d{1,2})$/.exec(window.location.hash);
    if (!treffer) return;
    const nr = Number(treffer[1]);
    const stelle = FOLGE.findIndex((s) => s.art === 'beitrag' && s.kapitel.nr === nr);
    if (stelle < 0) return;

    /**
     * Dreimal springen, und zwar mit Absicht.
     *
     * Der Router richtet nach dem Aufwachen die Scrollhöhe selbst ein: Findet
     * er zu `#k34` kein Element mit dieser Kennung — und es gibt keines, die
     * Beiträge sind Bildschirme, keine Anker —, setzt er die Seite nach oben.
     * Das passiert nach dieser Wirkung, nicht davor, und ist von hier aus
     * nicht abzustellen. Also wird nachgesetzt, solange die Seite noch ganz
     * oben steht. Sobald jemand selbst gescrollt hat, hört es auf; niemandem
     * wird die Seite unter der Hand weggezogen.
     *
     * `instant`, weil in der Seite `html{scroll-behavior:smooth}` steht: sonst
     * führte der Browser die ganze Strecke sichtbar ab — über das Eintauchen
     * und dreißig fremde Beiträge hinweg. Ein Link soll ankommen, nicht
     * vorführen.
     */
    const ziel = (EINTAUCHEN + stelle) * sicht.current.h;
    const springen = () => window.scrollTo({ top: ziel, behavior: 'instant' });
    springen();
    const uhren = [60, 220, 500].map((ms) => window.setTimeout(() => {
      if (window.scrollY < sicht.current.h / 2) springen();
    }, ms));
    return () => uhren.forEach(window.clearTimeout);
  }, [hoehe]);

  /**
   * Tasten für den Laptop.
   *
   * Am Telefon wischt man, am Rechner sitzt die Hand auf der Tastatur. Pfeil,
   * Bild-auf/ab und die Leertaste springen deshalb um genau einen Bildschirm —
   * so, wie das Rasten es beim Wischen tut. Escape schließt die Quelle.
   * Eingabefelder bleiben unangetastet: Im Schluss steht eines.
   */
  useEffect(() => {
    const zu = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (ziel.tagName === 'INPUT' || ziel.tagName === 'TEXTAREA'
        || ziel.isContentEditable)) return;
      if (quelle) {
        if (e.key === 'Escape') { e.preventDefault(); setQuelle(null); }
        return;
      }
      const vh = sicht.current.h;
      if (!vh) return;
      const runter = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ';
      const rauf = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!runter && !rauf) return;
      e.preventDefault();
      const jetzt = Math.round(window.scrollY / vh);
      const wohin = klemmen(jetzt + (runter ? 1 : -1), 0, EINTAUCHEN + FOLGE.length - 1);
      window.scrollTo({ top: wohin * vh, behavior: bewegung ? 'smooth' : 'auto' });
    };
    window.addEventListener('keydown', zu);
    return () => window.removeEventListener('keydown', zu);
  }, [quelle, bewegung]);

  /**
   * Vier Marken auf der Strecke — mehr nicht.
   *
   * Die Frage, die diese Welt beantworten muss, ist nicht „wie viele waren
   * da“, sondern „wie weit sind sie gekommen“. Vier Punkte genügen dafür, und
   * jeder wird höchstens einmal gemeldet. Gemessen wird nur mit Zustimmung;
   * darum kümmert sich `melden` selbst.
   */
  const gemeldet = useRef<Set<string>>(new Set());
  useEffect(() => {
    const stelle = FOLGE[index];
    if (!stelle || t < DRIN) return;
    const gesehen = beitraegeBis(index);
    const marke = stelle.art === 'schluss' ? 'feed_schluss'
      : gesehen >= 30 ? 'feed_dreissig'
        : gesehen >= 20 ? 'feed_zwanzig'
          : gesehen >= 10 ? 'feed_zehn'
            : 'feed_erster';
    if (gemeldet.current.has(marke)) return;
    gemeldet.current.add(marke);
    melden(marke, { welt: 'zufall', beitraege: gesehen });
  }, [index, t]);

  /** Wie weit die App aufgezogen ist: 0 = noch Kachel, 1 = ganzer Schirm. */
  const oeffnet = klemmen((t - OEFFNET) / (OFFEN - OEFFNET));
  const imFeed = t >= DRIN;
  const stelle = FOLGE[index];
  const aktuell = stelle?.art === 'beitrag' ? stelle.kapitel : undefined;
  const gesamt = EINTAUCHEN * 100 + FOLGE.length * JE_BEITRAG * 100;
  /** Ein Bildschirm in Pixeln — die Rastpunkte brauchen ihn. */
  const schritt = hoehe > 0 ? hoehe / (EINTAUCHEN + FOLGE.length) : 0;

  return (
    <div className={breit ? 'feedwelt fw-breit' : 'feedwelt'}
      style={{ height: hoehe > 0 ? `${hoehe}px` : `${gesamt}svh` }}>
      {/* Die Rastpunkte.
          Ein Feed springt von Beitrag zu Beitrag; frei scrollen kann man auf
          einer Textseite. Hier steht deshalb für jeden Bildschirm des Feeds
          ein unsichtbares Kästchen, an dem der Browser einrastet — erst ab dem
          Eintauchen, denn die Fahrt hinein soll fließen und nicht rucken.
          `proximity` statt `mandatory`: Wer bewusst dazwischen stehen bleiben
          will, darf das. */}
      {schritt > 0 && (
        <div className="fw-raster" aria-hidden="true"
          style={{ top: `${EINTAUCHEN * schritt}px` }}>
          {FOLGE.map((_, i) => <i key={i} style={{ height: `${schritt}px` }} />)}
        </div>
      )}

      {/* `--fw-scheibe` ist die Breite des Bildschirms in Pixeln. Die
          Oberfläche hängt sich daran, damit sie auf breiten Schirmen an der
          Scheibe klebt statt am Browserfenster. */}
      <div className="fw-buehne"
        style={{ '--fw-scheibe': mass.b ? `${mass.b}px` : '100%' } as React.CSSProperties}>
        {/* Der Grund neben der Scheibe.
            Auf einem Laptop steht der Feed als hochkante Fläche in der Mitte,
            und daneben war schwarzes Nichts. So sieht ein solches Netz im
            Browser nicht aus: Dort liegt das Bild selbst dahinter, weit
            unscharf und abgedunkelt. Das Standbild genügt dafür — ein zweites
            laufendes Video wäre doppelte Arbeit für etwas, das man ohnehin
            nicht erkennen soll. */}
        {breit && imFeed && aktuell && (
          <div className="fw-grund" aria-hidden="true" style={{
            backgroundImage: `url(${BASIS_PFAD}/assets/zufall/szenen/`
              + `kap${String(aktuell.nr).padStart(2, '0')}-640.webp)`,
          }} />
        )}

        {/*
          Kein Netz in der Ecke.
          Der erste Entwurf ließ es beim Lesen mitwachsen. Angesehen war klar,
          warum das nicht geht: Dieser Bildschirm ist mit Absicht voll —
          Aufnahme, Konto, Bildunterschrift, Hashtags, die Spalte mit den
          Zahlen. Es gibt keine freie Ecke, und ein Diagramm dazwischen ist ein
          Kommentar in einem Feed, der ohne Kommentar wirken soll. Das Netz
          steht deshalb nur am Ende — dort, wo es einen Satz dazu gibt.
        */}

        {/* Das Gerät verschwindet nicht — es wird zu groß fürs Bild. */}
        <div className="fw-geraet" style={{
          /* Dieselbe Zahl wie in `messen()`, nicht dieselbe Formel in CSS:
             `svh` und `innerHeight` sind auf dem Telefon zwei verschiedene
             Höhen. Das Foto wäre dann anders breit gewesen als die Rechnung,
             mit der das Fenster darauf gesetzt wird — der Bildschirm hätte
             neben seiner eigenen Scheibe gelegen. */
          width: mass.foto ? `${mass.foto}px` : `min(100vw, ${(BILD.b / BILD.h) * 100}svh)`,
          transform: `translate(-${(SCHIRM.links + SCHIRM.rechts) / 2}%, `
            + `-${(SCHIRM.oben + SCHIRM.unten) / 2}%) scale(${mass.s})`,
          transformOrigin: `${(SCHIRM.links + SCHIRM.rechts) / 2}% ${(SCHIRM.oben + SCHIRM.unten) / 2}%`,
          /* Das Gerät bleibt, bis die Kamera in den Schirm fährt. Erst dann
             tritt es zurück — vorher soll man es ja gerade ansehen. */
          opacity: klemmen(1 - (t - (HINEIN + 0.1)) / 0.1),
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
          /* Auf breiten Schirmen bleibt eine kleine Rundung stehen: Die
             Scheibe läuft dort nicht mehr aus dem Bild, sondern steht als
             Fläche darin — und eine Fläche mit scharfen Ecken auf schwarzem
             Grund sieht aus wie ein Loch, nicht wie ein Bildschirm. */
          borderRadius: `${Math.max(breit && t >= HINEIN ? 14 : 0,
            mass.b * 0.155 * klemmen(1 - t / 0.72))}px`,
        }}>
          {/* Solange die App nicht offen ist, liegt hinter dem Startbildschirm
              nichts — man sieht die echte, ausgeschaltete Scheibe des Fotos.
              Der Feed erscheint erst, wenn die App ihn aufzieht. */}
          <div className="fw-band" style={{
            transform: `translate3d(0, ${-index * 100}%, 0)`,
            /* Erst wenn die App den Schirm fast ganz bedeckt.
               Vorher lag der Feed schon hinter dem Startbildschirm, und
               dessen Grund ist beinahe durchsichtig — man sah das laufende
               Video zwischen den Symbolen durchscheinen. Ein Telefon zeigt
               nie beides gleichzeitig. Jetzt blendet der Feed hinter der
               undurchsichtigen App-Fläche ein, also unsichtbar; wenn sie
               verblasst, steht er längst da. Laufen tut er ohnehin schon —
               das hängt am Beitrag, nicht an dieser Deckkraft. */
            opacity: oeffnet >= 0.9 ? 1 : 0,
          }}>
            {FOLGE.map((s, i) => (
              s.art === 'beitrag' ? (
                <Beitrag key={`k${s.kapitel.nr}`} kapitel={s.kapitel}
                  nah={Math.abs(i - index) <= 2}
                  spielt={bewegung && i === index} schmal={schmal} />
              ) : s.art === 'ruf' ? (
                <Zwischenruf key="ruf" gesehen={ZWISCHENRUF_NACH} nachgesehen={nachgesehen} />
              ) : (
                <Schluss key="schluss" gesehen={ordnung.length} nachgesehen={nachgesehen} />
              )
            ))}
          </div>

          {/* Startbildschirm und App-Öffnung liegen im Fenster, nicht darüber:
              Sie gehören zum Gerät und wachsen mit ihm. */}
          {t >= WACH && t < OFFEN + 0.06 && (
            <Startbildschirm
              hell={klemmen((t - WACH) / 0.06)}
              tipp={klemmen((t - TIPP) / (OEFFNET - TIPP))}
              oeffnet={oeffnet} />
          )}

          {/* Der Glasglanz.
              Ein eingeschalteter Bildschirm hinter Glas spiegelt weiter — das
              Licht von links oben, das im Foto auf der Schieferplatte liegt,
              liegt auch auf der Scheibe. Ohne diese Ebene sieht der Bildschirm
              aus wie ein hineinkopiertes Rechteck. Sie verschwindet, sobald
              man drin ist: Wer im Bild steht, sieht keine Scheibe mehr. */}
          {t < DRIN && (
            <div className="fw-glas" aria-hidden="true"
              style={{ opacity: 1 - klemmen((t - HINEIN) / (DRIN - HINEIN)) }} />
          )}
        </div>

        {/* Die Oberfläche des laufenden Beitrags — und der Hinweis des Buches,
            sichtbar und nicht im Kleingedruckten. */}
        {imFeed && aktuell && (
          <Oberflaeche key={aktuell.nr} kapitel={aktuell}
            beiNachsehen={() => {
              setNachgesehen((n) => n + 1);
              melden('feed_nachgesehen', { kapitel: aktuell.nr });
              setQuelle(aktuell);
            }} />
        )}
        {imFeed && aktuell && (
          <p className="fw-erfunden">Konten und Zahlen sind erfunden. Die Quellen nicht.</p>
        )}

        {/* Der Anfangstext gehört zum dunklen Gerät. Sobald der Bildschirm
            angeht, ist er weg — sonst stünde er über dem Startbildschirm, und
            ein Telefon hat keine Bildunterschrift. */}
        {t < NAH && (
          <div className="fw-anfang" style={{ opacity: klemmen(1 - t / (NAH * 0.7)) }}>
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
        {imFeed && aktuell && (
          <p className="fw-staerke" aria-hidden="true">
            <span style={{ width: `${(beitraegeBis(index) / ordnung.length) * 100}%` }} />
          </p>
        )}

        {/* Die Quelle, aufgeschlagen im Gerät. */}
        {quelle && <Quellenblatt kapitel={quelle} beiZu={() => setQuelle(null)} />}
      </div>
    </div>
  );
}

/**
 * Die Quelle als Blatt über dem Feed.
 *
 * Dieselben Angaben wie auf /q/NN — dieselbe Datenquelle, nicht abgeschrieben.
 * Was hier NICHT steht, ist das Kapitel: Die Seite sagt, wo man nachsieht,
 * nicht was dabei herauskommt. Das steht im Buch.
 *
 * Die auswärtigen Verweise öffnen ein neues Fenster. Das ist hier keine
 * Geschmacksfrage: Wer eine Behörde aufruft und dann zurückwill, soll nicht
 * vierzig Bildschirme neu laden müssen.
 */
function Quellenblatt({ kapitel, beiZu }: { kapitel: Feedkapitel; beiZu: () => void }) {
  const nr = qrSchluessel(kapitel.nr);
  const ziel = qrZielNach(nr);
  return (
    <div className="fw-blatt" role="dialog" aria-modal="true"
      aria-label={`Quelle zu Kapitel ${kapitel.nr}`}>
      <div className="fw-blattinhalt">
        <button type="button" className="fw-blattzu" onClick={beiZu}>
          <span aria-hidden="true">×</span> Zurück in den Feed
        </button>
        <p className="eyebrow">Kapitel {kapitel.nr} · Buchseite {kapitel.seite}</p>
        <h2>{ziel?.kapitel ?? kapitel.titel}</h2>
        {ziel?.hinweis && <p className="fw-blatthinweis">{ziel.hinweis}</p>}

        {ziel && ziel.quellen.length > 0 ? (
          <ul className="fw-blattliste">
            {ziel.quellen.map((q) => (
              <li key={q.url}>
                <a href={q.url} target="_blank" rel="noopener noreferrer">{q.anbieter}</a>
                <span>{q.was}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fw-blatthinweis">
            Die Quelle zu diesem Kapitel wird eingetragen. Bis dahin gilt, was im
            Buch steht: Der Weg führt über die Suche der jeweiligen Einrichtung,
            nicht über eine Zusammenfassung.
          </p>
        )}

        <p className="fw-blattfein">
          Diese Adressen führen aus der Welt hinaus; für ihre Inhalte ist die
          jeweilige Einrichtung verantwortlich. Was dort steht, ist die eine
          Hälfte. Die andere — was daraus folgt — steht im Kapitel.
        </p>
        <p className="fw-blattfein">
          <a href={weg(`/q/${nr}/`)}>Dieselbe Seite zum Behalten und Teilen</a>
        </p>
      </div>
    </div>
  );
}

/**
 * Der Zwischenruf nach zehn Beiträgen.
 *
 * Er sieht aus wie ein Beitrag und ist keiner: kein Konto, keine Zahlen, kein
 * Ton. Genau der Bruch ist die Absicht. Er behauptet nichts über den Leser,
 * er zählt nur, was er selbst getan hat — und geht dann weg.
 */
function Zwischenruf({ gesehen, nachgesehen }: { gesehen: number; nachgesehen: number }) {
  return (
    <article className="fw-beitrag fw-ruf">
      <div className="fw-rufinhalt">
        <p className="eyebrow">Zwischendurch</p>
        <p className="fw-rufzahl">
          {gesehen} Behauptungen.
          <br />
          <span>Nachgesehen: {nachgesehen}.</span>
        </p>
        <p>
          {nachgesehen === 0
            ? 'Kein Vorwurf — nur die Zahl. Weiter geht es sowieso; genau das ist der Punkt.'
            : 'Das sind mehr als bei den meisten. Weiter geht es trotzdem.'}
        </p>
      </div>
    </article>
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
    if (!spielt) {
      v.pause();
      try { v.currentTime = 0; } catch { /* dito */ }
      return;
    }
    /**
     * Abspielen, auch wenn es beim ersten Versuch nicht klappt.
     *
     * Auf dem Telefon schlägt `play()` fehl, solange das Video noch keine
     * Daten hat — und dann bleibt das Standbild stehen, was aussieht wie ein
     * kaputtes Video. Deshalb wird es beim nächsten `canplay` noch einmal
     * versucht. `muted` und `playsInline` stehen am Element; ohne sie
     * verweigert iOS das Abspielen ganz oder reißt es auf Vollbild.
     */
    const anwerfen = () => {
      try { v.currentTime = 0; } catch { /* noch nicht ladbar, egal */ }
      const p = v.play();
      if (p) p.catch(() => {});
    };
    anwerfen();
    v.addEventListener('canplay', anwerfen, { once: true });
    v.addEventListener('loadeddata', anwerfen, { once: true });
    return () => {
      v.removeEventListener('canplay', anwerfen);
      v.removeEventListener('loadeddata', anwerfen);
    };
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
           ausgewählt und nicht dem Browser überlassen.

           `autoPlay` steht nur beim laufenden Beitrag: Die beiden Nachbarn
           werden im Voraus geladen, sollen aber nicht mitlaufen — vier stumme
           Videos im Hintergrund kosten auf dem Telefon Akku und Bandbreite
           und bringen nichts, weil sie niemand sieht. */
        <video ref={video} className="fw-clip" muted loop playsInline
          autoPlay={spielt} preload={spielt ? 'auto' : 'metadata'}
          src={bewegt(`kap${nr}-motion${schmal ? '-klein' : ''}.mp4`, 'zufall')}
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
          /* Ein echter Link, kein Knopf: Ohne Skript führt er auf /q/NN, und
             das ist die richtige Seite. Mit Skript bleibt man im Gerät. */
          <a className="fw-nachsehen" href={weg(`/q/${nr}/`)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              beiNachsehen();
            }}>
            <span className="fw-lupe" aria-hidden="true">⌕</span>
            Sieh selbst nach
          </a>
        )}
        <Zahl art="herz" wert={kapitel.zahlen[0]} was="Gefällt mir" />
        <Zahl art="rede" wert={kapitel.zahlen[1]} was="Kommentare" />
        <Teilen kapitel={kapitel} wert={kapitel.zahlen[2]} />
        <span className="fw-marke"><Hausmarke breite={34} hoehe={23} /></span>
      </div>
    </div>
  );
}

/**
 * Teilen — der einzige Knopf im Feed, der wirklich etwas tut.
 *
 * Herz und Kommentarzahl sind Kulisse; sie stehen im Buch und stehen hier.
 * Dieser hier gibt einen Link weiter, der bei genau diesem Beitrag aufmacht.
 * Auf dem Telefon übernimmt das Gerät, am Rechner geht die Adresse in die
 * Zwischenablage und der Knopf sagt es für zwei Sekunden.
 */
function Teilen({ kapitel, wert }: { kapitel: Feedkapitel; wert?: string }) {
  const [kopiert, setKopiert] = useState(false);

  const geben = async () => {
    const adresse = `${window.location.origin}${window.location.pathname}#k${kapitel.nr}`;
    melden('feed_teilen', { kapitel: kapitel.nr });
    const daten = {
      title: `Alles nur Zufall? — ${kapitel.titel}`,
      text: kapitel.caption,
      url: adresse,
    };
    try {
      if (navigator.share) { await navigator.share(daten); return; }
      await navigator.clipboard.writeText(adresse);
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 2000);
    } catch {
      /* Abgebrochen oder verboten — dann eben nicht. Kein Fehlerdialog. */
    }
  };

  return (
    <button type="button" className="fw-zahl fw-teilknopf" onClick={geben}>
      <span className="fw-sinnbild fw-teilen" aria-hidden="true">↗</span>
      <b>{kopiert ? 'kopiert' : wert ?? 'Teilen'}</b>
      <i>{kopiert ? 'Link kopiert' : 'Diesen Beitrag teilen'}</i>
    </button>
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

        {/*
          Der zweite Schluss, und er widerspricht dem ersten nicht, sondern
          ergänzt ihn: Sie haben nicht nachgesehen — und es gab auch nichts,
          was diese vierzig Behauptungen zusammengehalten hätte.
        */}
        <FeedNetz gesehen={40} gross />

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

        {/* Der Beleg, dass diese Welt keine Werbeidee ist.
            Seite 9 steht im Buch, lange bevor es diese Seite gab, und nennt
            genau die Reihenfolge, in der die vierzig Beiträge hier gelaufen
            sind. Sie verrät von keinem Kapitel etwas — sie erklärt nur, warum
            man sie so liest. Ein Satz darüber wäre eine Behauptung mehr; die
            Seite selbst ist keine. */}
        <figure className="fw-buchseite">
          <img
            src={`${BASIS_PFAD}/assets/zufall/buch/leseordnung-900.webp`}
            srcSet={`${BASIS_PFAD}/assets/zufall/buch/leseordnung-900.webp 900w, `
              + `${BASIS_PFAD}/assets/zufall/buch/leseordnung-1400.webp 1400w`}
            sizes="(max-width: 700px) 62vw, 20rem"
            width={900} height={1359} loading="lazy" decoding="async"
            alt="Seite 9 des Buches: „Die zweite Leseordnung – Lies das Buch wie
              einen Feed“, darunter die Reihenfolge 23 · 6 · 34 · 11 · 27 und so
              weiter." />
          <figcaption>
            Seite 9. Diese Reihenfolge ist die, in der Sie gerade gelesen haben.
          </figcaption>
        </figure>

        <p className="fw-fein">
          456 Seiten · vierzig Kapitel · vierzig Quellen, die jeder öffnen kann
        </p>

        {/* Der Verteiler steht hier und nicht zwei Klicks weiter.
            Vorher führte der Knopf auf die Buchseite, zum Abschnitt
            #verteiler. Nach vierzig Bildschirmen ist jeder weitere Klick einer
            zu viel — wer jetzt nicht schreibt, schreibt nicht mehr. */}
        {VERTEILER.formular && (
          <form className="fw-verteiler" action={VERTEILER.formular} method="POST">
            <p className="fw-verteilerwort">{VERTEILER.titel}</p>
            <label>
              <span className="nur-lesen">E-Mail-Adresse</span>
              <input type="email" name="EMAIL" autoComplete="email" required
                placeholder="name@beispiel.de" />
            </label>
            <label className="fw-haken">
              <input type="checkbox" name="OPT_IN" value="1" required />
              <span>
                Bescheid geben, wenn es zu haben ist. Die{' '}
                <a href={`${wegImpressum()}#datenschutz`}>Datenschutzhinweise</a>{' '}
                habe ich gelesen.
              </span>
            </label>
            {/* Fangfrage für Maschinen — für Menschen unsichtbar und leer. */}
            <div className="verteiler-falle" aria-hidden="true">
              <input type="text" name="email_address_check" defaultValue="" tabIndex={-1}
                autoComplete="off" />
            </div>
            <input type="hidden" name="locale" value="de" />
            <input type="hidden" name="html_type" value="simple" />
            <button type="submit">{VERTEILER.knopf}</button>
          </form>
        )}

        <div className="fw-wege">
          <a className="eintauchen" href={weg('/q/')}>Die vierzig Quellen — offen, kostenlos</a>
          <a className="eintauchen" href={`${wegWelt('zufall', 'zufall')}liste/`}>
            Alles zum Nachlesen, ohne Scrollen
          </a>
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
