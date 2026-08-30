'use client';

import { useEffect, useState } from 'react';
import { weg } from '@/world/wege';

type Stand = { gesamt: number; heute: number };

const SPIEGEL = process.env.NEXT_PUBLIC_SPIEGEL === '1';

/**
 * Einmal fragen, zweimal zeigen.
 *
 * Die Zahl steht jetzt oben im Bild und unten in der Fusszeile. Zwei
 * Bauteile, aber nur eine Frage an den Server: Sonst kaeme es vor, dass oben
 * 1.234 steht und unten 1.235, weil zwischen den beiden Anfragen jemand die
 * Seite geoeffnet hat. Eine Seite, die sich selbst widerspricht, ist
 * schlimmer als eine, die eine Sekunde spaeter Bescheid weiss.
 */
let laeuft: Promise<Stand | null> | null = null;

function holen(): Promise<Stand | null> {
  laeuft ??= fetch(weg('/zahl.php'), { cache: 'no-store' })
    .then((antwort) => (antwort.ok ? antwort.json() : null))
    .then((daten) => (daten && typeof daten.gesamt === 'number'
      ? { gesamt: daten.gesamt, heute: typeof daten.heute === 'number' ? daten.heute : 0 }
      : null))
    .catch(() => null);
  return laeuft;
}

/**
 * Die Besucherzahl - oben im Bild und unten in der Fusszeile.
 *
 * Gezaehlt wird auf demselben Server (siehe public/z.php): kein fremder
 * Dienst, kein Cookie, keine IP. Deshalb steht hier kein Einwilligungsbanner
 * davor - es wird nichts auf dem Geraet abgelegt oder ausgelesen.
 *
 * Bis die Antwort da ist, steht dort nichts - kein „laedt", kein Platzhalter,
 * keine Null. Eine Zahl, die erst falsch dasteht und dann springt, ist
 * schlimmer als eine, die einen Wimpernschlag spaeter kommt. Bleibt die
 * Antwort ganz aus (PHP abgeschaltet, Datei gesperrt, kein Netz), bleibt der
 * Absatz leer und faellt per CSS weg. Eine Seite mit einer Fehlermeldung in
 * der Fussleiste waere die schlechtere Seite.
 *
 * Auf dem Bau-Spiegel unter github.io gibt es kein PHP. Dort wird gar nicht
 * erst gefragt.
 */
export function Besucherzahl({ stelle = 'fuss' }: { stelle?: 'kopf' | 'fuss' }) {
  const [zahl, setZahl] = useState<Stand | null>(null);

  useEffect(() => {
    if (SPIEGEL) return;
    let lebt = true;
    holen().then((daten) => { if (lebt && daten) setZahl(daten); });
    return () => { lebt = false; };
  }, []);

  /* Oben eine Klasse, unten die Kennung: Zweimal dieselbe `id` waere
     ungueltiges HTML, und `#zaehler` ist die, die in der Fusszeile steht. */
  const eigenschaften = stelle === 'kopf'
    ? { className: 'hauszaehler' }
    : { id: 'zaehler', className: 'feinschrift' };

  /* Der Absatz steht auch leer schon da: Er kommt sonst nachtraeglich dazu
     und schiebt alles darunter um eine Zeile. */
  if (!zahl) return <p {...eigenschaften} />;

  return (
    <p {...eigenschaften}>
      <b>{zahl.gesamt.toLocaleString('de-DE')}</b> Besuche
      {' · '}
      {zahl.heute.toLocaleString('de-DE')} heute
    </p>
  );
}
