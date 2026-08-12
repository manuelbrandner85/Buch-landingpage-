'use client';

import { useEffect, useRef, useState } from 'react';
import { erzeugeAtmosphaere, type Atmosphaere } from '@/audio/atmosphaere';
import { Zeitleiste } from './Zeitleiste';

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

  return (
    <>
      <header className={sichtbar ? 'an' : ''}>
        <a className="marke" href="#ankunft">Die unsichtbaren Fäden</a>
        <nav>
          <a href="#karte">Welt</a>
          <button onClick={() => setZeit(true)}>Zeitleiste</button>
          <a href="#buecher">Bücher</a>
          <a href="/ueber">Über</a>
          <button onClick={tonSchalten} aria-pressed={ton}>{ton ? 'Ton an' : 'Ton aus'}</button>
          <button onClick={beiRuhe} aria-pressed={ruhig}>Ruhig</button>
        </nav>
      </header>
      {zeit && <Zeitleiste beiSchliessen={() => setZeit(false)} />}
    </>
  );
}
