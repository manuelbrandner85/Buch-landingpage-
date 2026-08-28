import type { ReactNode } from 'react';
import { weg } from '@/world/wege';

/**
 * Ein Absatz des Journals – mit Verweisen, aber nur nach innen.
 *
 * Im Journal steht Text, kein HTML. Ein Beitrag soll trotzdem auf die Orts-,
 * Kapitel- und Begriffsseiten zeigen können: Sie sind der Grund, warum diese
 * Seiten überhaupt gefunden werden. Ein Beitrag ohne Verweise ist eine Insel.
 *
 * Deshalb gibt es genau eine Auszeichnung, und sie sieht aus wie in Markdown:
 *
 *   [Wonderwerk](/faeden/ort/wonderwerk/)
 *
 * **Nur eigene Wege.** Das Ziel muss mit „/“ beginnen. Alles andere bleibt
 * stehen, wie es geschrieben ist – kein fremder Händler, keine fremde Seite,
 * kein `javascript:`. Das ist keine Vorsichtsmaßnahme gegen Angreifer (den
 * Text schreibt das Haus selbst), sondern gegen die eigene Unachtsamkeit:
 * Ein Verweis nach draußen gehört in die Kaufwege, nicht in einen Fließtext.
 *
 * Der Basispfad kommt aus `weg()`. Ein nacktes `href="/faeden/…"` ginge auf
 * dem github.io-Spiegel ins Leere, weil `basePath` nur `next/link` erreicht.
 * `scripts/pruefe-wege.mjs` schlägt Alarm, wenn ein Ziel nicht existiert –
 * ein falscher Verweis fällt damit im Bau auf, nicht beim Leser.
 */
const VERWEIS = /\[([^\]\n]+)\]\((\/[^)\s]*)\)/g;

export function Absatz({ text }: { text: string }) {
  const teile: ReactNode[] = [];
  let gelesen = 0;

  for (const treffer of text.matchAll(VERWEIS)) {
    const wort = treffer[1];
    const ziel = treffer[2];
    // Kann nicht eintreten, solange das Muster zwei Gruppen hat – aber der
    // strenge Modus weiss das nicht, und geraten wird hier nirgends.
    if (wort === undefined || ziel === undefined) continue;
    const ab = treffer.index ?? 0;
    if (ab > gelesen) teile.push(text.slice(gelesen, ab));
    teile.push(<a key={ab} href={weg(ziel)}>{wort}</a>);
    gelesen = ab + treffer[0].length;
  }

  if (gelesen < text.length) teile.push(text.slice(gelesen));
  return <p>{teile.length > 0 ? teile : text}</p>;
}
