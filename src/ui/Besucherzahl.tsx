'use client';

import { useEffect, useState } from 'react';
import { weg } from '@/world/wege';

/**
 * Die Zahl unter dem Copyright.
 *
 * Sie holt sich, was `zahl.php` neben der Seite liegen hat - eine Datei auf
 * demselben Server, kein fremder Dienst, kein Cookie, keine IP. Deshalb steht
 * hier auch kein Einwilligungsbanner davor: Es wird nichts auf dem Geraet
 * abgelegt oder ausgelesen.
 *
 * Bis die Antwort da ist, steht dort nichts - kein „laedt", kein Platzhalter,
 * keine Null. Eine Zahl, die erst falsch dasteht und dann springt, ist
 * schlimmer als eine, die einen Wimpernschlag spaeter kommt. Bleibt die
 * Antwort ganz aus (PHP abgeschaltet, Datei gesperrt, kein Netz), bleibt der
 * Absatz leer und faellt per CSS weg. Eine Fussleiste mit einer Fehlermeldung
 * darin waere die schlechtere Seite.
 *
 * Auf dem Bau-Spiegel unter github.io gibt es kein PHP. Dort wird gar nicht
 * erst gefragt.
 */
const SPIEGEL = process.env.NEXT_PUBLIC_SPIEGEL === '1';

export function Besucherzahl() {
  const [zahl, setZahl] = useState<{ gesamt: number; heute: number } | null>(null);

  useEffect(() => {
    if (SPIEGEL) return;
    let lebt = true;
    fetch(weg('/zahl.php'), { cache: 'no-store' })
      .then((antwort) => (antwort.ok ? antwort.json() : null))
      .then((daten) => {
        if (!lebt || !daten || typeof daten.gesamt !== 'number') return;
        setZahl({
          gesamt: daten.gesamt,
          heute: typeof daten.heute === 'number' ? daten.heute : 0,
        });
      })
      .catch(() => { /* Dann steht dort eben nichts. */ });
    return () => { lebt = false; };
  }, []);

  /* Der Absatz steht auch leer schon da: Er kommt sonst nachtraeglich in die
     Fussleiste und schiebt alles darunter um eine Zeile nach unten. */
  if (!zahl) return <p id="zaehler" className="feinschrift" />;

  return (
    <p id="zaehler" className="feinschrift">
      <b>{zahl.gesamt.toLocaleString('de-DE')}</b> Besuche
      {' · '}
      {zahl.heute.toLocaleString('de-DE')} heute
    </p>
  );
}
