import type { ReactNode } from 'react';
import type { KanalId } from '@/data/gemeinsam/kanaele';
import { offeneKanaele } from '@/data/gemeinsam/kanaele';

/**
 * Die Kanäle als Zeichen.
 *
 * Fremde Markenlogos sind hier bewusst nicht eingebettet: Sechs bunte
 * Vollflächen auf einer Seite, die sonst nur Gold und Nacht kennt, sehen aus
 * wie ein Werbeblock am Ende eines Films. Stattdessen ist jedes Zeichen als
 * Strichzeichnung im selben Duktus gebaut – gleiche Fläche, gleiche
 * Strichstärke, gleiche Farbe wie der Faden. Erkennbar bleibt es trotzdem:
 * Die Form ist die Form, nur die Farbe gehört der Seite.
 *
 * Alles auf einem Raster von 24 × 24, Linien statt Flächen, damit die Zeichen
 * bei 20 px genauso sauber stehen wie bei 40.
 */
const ZEICHEN: Record<KanalId, ReactNode> = {
  tiktok: (
    <>
      <circle cx="9.2" cy="16.2" r="3.6" />
      <path d="M12.8 16.2V4.3c.5 2.7 2.5 4.6 5.1 4.8" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="16.9" cy="7.1" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M14.7 8.2h-1.4a1.9 1.9 0 0 0-1.9 1.9v10.5" />
      <path d="M10 12.7h4.7" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M10.4 18.9V7.8h2.9a3 3 0 0 1 0 6h-2.9" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.7" y="6.2" width="18.6" height="11.6" rx="3.4" />
      <path d="M10.4 9.7 15.6 12l-5.2 2.3z" fill="currentColor" stroke="none" />
    </>
  ),
  bluesky: (
    <>
      <path d="M12 11.4C10.6 8.6 7.8 5.6 5.5 4.8c-2-.7-3 .4-3 2.1 0 1.6.9 5.2 1.5 6.2.9 1.4 2.5 1.9 4.1 1.6-2.5.5-3.1 2-1.7 3.4 1.4 1.4 3.3.5 4.3-1.4.5-1 .9-2 1.3-3.3" />
      <path d="M12 11.4c1.4-2.8 4.2-5.8 6.5-6.6 2-.7 3 .4 3 2.1 0 1.6-.9 5.2-1.5 6.2-.9 1.4-2.5 1.9-4.1 1.6 2.5.5 3.1 2 1.7 3.4-1.4 1.4-3.3.5-4.3-1.4-.5-1-.9-2-1.3-3.3" />
    </>
  ),
};

function Zeichen({ id }: { id: KanalId }) {
  return (
    <svg className="kanalzeichen" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill="none" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      {ZEICHEN[id]}
    </svg>
  );
}

/**
 * Zwei Auftritte, ein Datensatz.
 *
 * `band` ist die stille Fassung für die Fußzeile: nur die Zeichen, in einer
 * Reihe, so groß wie eine Fingerkuppe. `wand` ist die Fassung für das Haus:
 * Zeichen, Name, Handle und ein halber Satz, was dort zu sehen ist – damit
 * niemand blind klicken muss.
 *
 * Der Glanz läuft nur, wenn jemand hinsieht: kein Dauerflimmern am Seitenrand.
 */
export function Kanaele({ variante = 'band' }: { variante?: 'band' | 'wand' }) {
  const kanaele = offeneKanaele();
  if (kanaele.length === 0) return null;

  if (variante === 'band') {
    return (
      <nav className="kanalband" aria-label="Trendonix in den sozialen Netzen">
        {kanaele.map((k) => (
          <a key={k.id} className="kanalmal" href={k.adresse}
            target="_blank" rel="me noopener noreferrer">
            <Zeichen id={k.id} />
            <span className="nur-lesen">{`${k.name}: ${k.handle}`}</span>
          </a>
        ))}
      </nav>
    );
  }

  return (
    <ul className="kanalwand">
      {kanaele.map((k) => (
        <li key={k.id}>
          <a className="kanalkarte" href={k.adresse}
            target="_blank" rel="me noopener noreferrer">
            <Zeichen id={k.id} />
            <span className="kanaltext">
              <b>{k.name}</b>
              <em>{k.handle}</em>
              <small>{k.wofuer}</small>
            </span>
            <span className="kanalglanz" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
