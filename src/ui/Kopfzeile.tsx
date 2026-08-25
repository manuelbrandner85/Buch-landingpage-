'use client';

import { useEffect, useRef, useState } from 'react';
import { erzeugeAtmosphaere, type Atmosphaere } from '@/audio/atmosphaere';
import { Zeitleiste } from './Zeitleiste';
import type { BandId, ReiheId } from '@/data/gemeinsam/typen';
import {
  TRENDONIX, bandNach, oeffentlicheBaendeVon, reiheNach,
} from '@/world/registry';
import { wegHaus, wegUeber, wegWelt } from '@/world/wege';
import { BASIS_PFAD } from '@/world/bilder';

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
          <img src={`${BASIS_PFAD}/marke/trendonix-tx.png`} alt=""
            width={46} height={31} loading="lazy" decoding="async" />
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
          <button onClick={tonSchalten} aria-pressed={ton}>{ton ? 'Ton an' : 'Ton aus'}</button>
          <button onClick={beiRuhe} aria-pressed={ruhig}>Ruhig</button>
        </nav>
        {/* Außerhalb der Leiste: Sie lässt sich auf schmalen Geräten schieben,
            der Kaufweg soll dabei nicht unter die anderen Einträge geraten. */}
        {kauf && (
          <a className="kopf-kaufen" href={kauf.url}
            target="_blank" rel="noopener noreferrer">
            Band {dieserBand?.buch.nummer} kaufen
          </a>
        )}
      </header>
      {zeit && <Zeitleiste beiSchliessen={() => setZeit(false)} />}
    </>
  );
}
