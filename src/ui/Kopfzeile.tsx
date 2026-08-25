'use client';

import { useEffect, useRef, useState } from 'react';
import { erzeugeAtmosphaere, type Atmosphaere } from '@/audio/atmosphaere';
import { Zeitleiste } from './Zeitleiste';
import type { ReiheId } from '@/data/gemeinsam/typen';
import {
  LEITBUCH, TRENDONIX, oeffentlicheBaendeVon, reiheNach, szeneZuKapitel,
} from '@/world/registry';
import { wegHaus, wegUeber } from '@/world/wege';

/** Die Oberfläche bleibt unsichtbar, bis der Einstieg vorbei ist. */
export function Kopfzeile(
  { reihe, ruhig, beiRuhe }: { reihe: ReiheId; ruhig: boolean; beiRuhe: () => void }) {
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
  const baender = (dieseReihe ? oeffentlicheBaendeVon(dieseReihe) : []).map((b) => ({
    nummer: b.buch.nummer,
    titel: b.buch.titel,
    ziel: szeneZuKapitel(b.kapitel[0]?.id, b.buch.id)?.id,
  })).filter((b) => b.ziel);

  // Der Kaufweg steht in der Kopfzeile und führt direkt zum Buch – nicht zu
  // einem Abschnitt, der davon erzählt. Gibt es keinen, führt er zur Bücherwand.
  const kauf = LEITBUCH?.kaufwege[0];

  return (
    <>
      <header className={sichtbar ? 'an' : ''}>
        <a className="marke" href="#ankunft">{dieseReihe?.titel ?? TRENDONIX.name}</a>
        <nav>
          <span className="baender">
            {baender.map((b) => (
              <a key={b.nummer} href={`#${b.ziel}`} title={b.titel}>
                <b>{b.nummer}</b>
              </a>
            ))}
          </span>
          <a href="#karte">Welt</a>
          <button onClick={() => setZeit(true)}>Zeitleiste</button>
          <a href={wegHaus()}>{TRENDONIX.name}</a>
          <a href={wegUeber()}>Über</a>
          <button onClick={tonSchalten} aria-pressed={ton}>{ton ? 'Ton an' : 'Ton aus'}</button>
          <button onClick={beiRuhe} aria-pressed={ruhig}>Ruhig</button>
          {kauf
            ? (
              <a className="kopf-kaufen" href={kauf.url}
                target="_blank" rel="noopener noreferrer">
                Buch kaufen
              </a>
            )
            : <a className="kopf-kaufen" href="#buecher">Bücher</a>}
        </nav>
      </header>
      {zeit && <Zeitleiste beiSchliessen={() => setZeit(false)} />}
    </>
  );
}
