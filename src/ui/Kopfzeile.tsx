'use client';

import { useEffect, useRef, useState } from 'react';
import { erzeugeAtmosphaere, type Atmosphaere } from '@/audio/atmosphaere';
import { Zeitleiste } from './Zeitleiste';
import type { BandId, ReiheId } from '@/data/gemeinsam/typen';
import {
  TRENDONIX, bandNach, oeffentlicheBaendeVon, reiheNach,
} from '@/world/registry';
import { wegHaus, wegUeber, wegWelt } from '@/world/wege';
import { Hausmarke } from '@/ui/Hausmarke';

/** Die Oberfläche bleibt unsichtbar, bis der Einstieg vorbei ist. */
export function Kopfzeile(
  { reihe, band, ruhig, beiRuhe }:
  { reihe: ReiheId; band?: BandId; ruhig: boolean; beiRuhe: () => void }) {
  const [sichtbar, setSichtbar] = useState(false);
  const [ton, setTon] = useState(false);
  const [zeit, setZeit] = useState(false);
  const atmo = useRef<Atmosphaere | null>(null);

  useEffect(() => {
    const ankunft = document.querySelector('.ankunft');
    if (!ankunft) { setSichtbar(true); return; }
    const b = new IntersectionObserver(([e]) => setSichtbar(!e?.isIntersecting), { threshold: 0.5 });
    b.observe(ankunft);
    return () => b.disconnect();
  }, []);

  useEffect(() => () => atmo.current?.frei(), []);

  const tonSchalten = () => {
    atmo.current ??= erzeugeAtmosphaere();
    ton ? atmo.current.aus() : atmo.current.an();
    setTon(!ton);
  };

  // Ein Sprung je Band: Wer nur den zweiten Band lesen will, muss nicht durch
  // den ersten scrollen. Nicht erschienene Bände stehen hier nicht.
  const dieseReihe = reiheNach(reihe);
  const dieserBand = bandNach(band);

  // Die Bandziffern wechseln jetzt die Welt, statt innerhalb einer einzigen
  // Reise zu springen: Jeder Band hat seine eigene Adresse.
  const baender = (dieseReihe ? oeffentlicheBaendeVon(dieseReihe) : []).map((b) => ({
    id: b.buch.id,
    nummer: b.buch.nummer,
    titel: b.buch.titel,
    hier: b.buch.id === band,
  }));

  // Der Kaufweg gehört dem Band, in dessen Welt man steht – nicht dem
  // meistverkauften. Auf der Schwelle steht keiner: Dort ist noch nicht
  // entschieden, um welches Buch es geht.
  const kauf = dieserBand?.buch.kaufwege[0];
  const karte = dieserBand?.szenen.find((s) => s.typ === 'karte');

  return (
    <>
      <header className={sichtbar ? 'an' : ''}>
        <a className="marke" href={wegHaus()} aria-label={`${TRENDONIX.name} – Startseite`}>
          <Hausmarke breite={46} hoehe={31} />
          <span className="reihenname">
            {dieserBand ? `${dieseReihe?.titel} · Band ${dieserBand.buch.nummer}` : dieseReihe?.titel}
          </span>
        </a>
        <nav>
          <span className="baender">
            {dieseReihe && baender.map((b) => (
              <a key={b.id} href={wegWelt(dieseReihe.id, b.id)} title={b.titel}
                aria-current={b.hier ? 'page' : undefined}
                className={b.hier ? 'hier' : undefined}>
                <b>{b.nummer}</b>
              </a>
            ))}
          </span>
          {karte && <a href={`#${karte.id}`}>Welt</a>}
          <button onClick={() => setZeit(true)}>Zeitleiste</button>
          <a href={wegUeber()}>Über</a>
        </nav>
        {/*
          Ton und Ruhe stehen außerhalb der Leiste.

          Sie lagen bis zum 08.09.2026 als vierter und fünfter Eintrag darin.
          Auf einem Telefon ist die Leiste aber schmaler als ihr Inhalt – 192
          Pixel für 399 – und schiebbar; sichtbar blieben „Welt" und ein Teil
          von „Zeitleiste". Wer den Ton abstellen wollte, musste erst erraten,
          dass sich die Leiste wischen lässt. Ausgerechnet die beiden Schalter,
          die über Ton und Bewegung entscheiden, waren die am schwersten
          erreichbaren der Seite.

          Auf breiten Schirmen stehen sie unverändert als Wort, auf schmalen
          als Zeichen – die Beschriftung bleibt in jedem Fall am Knopf.
        */}
        <span className="kopf-schalter">
          <button onClick={tonSchalten} aria-pressed={ton}
            aria-label={ton ? 'Ton ausschalten' : 'Ton einschalten'}
            title={ton ? 'Ton ausschalten' : 'Ton einschalten'}>
            <TonZeichen an={ton} />
            <span className="wort">{ton ? 'Ton an' : 'Ton aus'}</span>
          </button>
          <button onClick={beiRuhe} aria-pressed={ruhig}
            aria-label={ruhig ? 'Bewegte Fassung zeigen' : 'Ruhige Fassung zeigen'}
            title={ruhig ? 'Bewegte Fassung zeigen' : 'Ruhige Fassung zeigen'}>
            <RuheZeichen ruhig={ruhig} />
            <span className="wort">Ruhig</span>
          </button>
        </span>
        {/* Außerhalb der Leiste: Sie lässt sich auf schmalen Geräten schieben,
            der Kaufweg soll dabei nicht unter die anderen Einträge geraten. */}
        {kauf && (
          <a className="kopf-kaufen" href={kauf.url}
            target="_blank" rel="noopener noreferrer"
            aria-label={`Band ${dieserBand?.buch.nummer} kaufen`}>
            {/* Auf dem Telefon nur „Kaufen": Der Band steht links in der Leiste
                als Ziffer, und die 120 Pixel, die „Band 1 kaufen" belegt, waren
                genau die, die der Leiste danach fehlten. */}
            <span className="lang">Band {dieserBand?.buch.nummer} kaufen</span>
            <span className="kurz">Kaufen</span>
          </a>
        )}
      </header>
      {zeit && <Zeitleiste beiSchliessen={() => setZeit(false)} />}
    </>
  );
}

/**
 * Die beiden Zeichen für Ton und Ruhe.
 *
 * Bewusst als Strichzeichnung in derselben Haarlinie wie die Hausmarke, nicht
 * als Symbolschrift: Eine Zeichensatz-Ikone bringt ihre eigene Strichstärke
 * mit und fällt neben der Garamond immer auf.
 *
 * `currentColor` – damit sie den Zustand der Leiste teilen, hell wie blass.
 */
function TonZeichen({ an }: { an: boolean }) {
  return (
    <svg className="zeichen" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h2.6L10 5v10L6.6 12H4z" />
      {an
        ? <><path d="M13 7.6a3.4 3.4 0 0 1 0 4.8" /><path d="M15.2 5.4a6.6 6.6 0 0 1 0 9.2" /></>
        : <><path d="M13.2 7.8l4 4.4" /><path d="M17.2 7.8l-4 4.4" /></>}
    </svg>
  );
}

function RuheZeichen({ ruhig }: { ruhig: boolean }) {
  return (
    <svg className="zeichen" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round">
      {ruhig
        // Steht die ruhige Fassung, zeigt das Zeichen die Welle: das ist der
        // Weg zurück in die Bewegung.
        ? <path d="M2 10c2.7-4.4 5.3-4.4 8 0s5.3 4.4 8 0" />
        : <path d="M2 10h16" />}
    </svg>
  );
}
