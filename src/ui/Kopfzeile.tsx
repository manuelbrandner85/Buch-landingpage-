'use client';

import { useEffect, useRef, useState } from 'react';
import { erzeugeAtmosphaere, type Atmosphaere } from '@/audio/atmosphaere';
import { Zeitleiste } from './Zeitleiste';
import { OEFFENTLICHE_BAENDE, szeneZuKapitel } from '@/world/registry';

/** Die Oberfläche bleibt unsichtbar, bis der Einstieg vorbei ist. */
export function Kopfzeile({ ruhig, beiRuhe }: { ruhig: boolean; beiRuhe: () => void }) {
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
  const baender = OEFFENTLICHE_BAENDE.map((b) => ({
    nummer: b.buch.nummer,
    titel: b.buch.titel,
    ziel: szeneZuKapitel(b.kapitel[0]?.id)?.id,
  })).filter((b) => b.ziel);

  return (
    <>
      <header className={sichtbar ? 'an' : ''}>
        <a className="marke" href="#ankunft">Die unsichtbaren Fäden</a>
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
          <a href="/ueber">Über</a>
          <button onClick={tonSchalten} aria-pressed={ton}>{ton ? 'Ton an' : 'Ton aus'}</button>
          <button onClick={beiRuhe} aria-pressed={ruhig}>Ruhig</button>
          <a className="kopf-kaufen" href="#buecher">Bücher</a>
        </nav>
      </header>
      {zeit && <Zeitleiste beiSchliessen={() => setZeit(false)} />}
    </>
  );
}
