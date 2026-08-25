import type { Metadata } from 'next';
import { wegVollstaendig } from '@/world/wege';

/**
 * Eine alte Adresse, die höflich weiterzeigt.
 *
 * Die Welt lag zuerst unter `/welt/…`, bevor über den Reihen ein Haus stand.
 * Beim statischen Export gibt es keinen Server, der umleiten könnte – also tut
 * es die Seite selbst: `refresh` für den Browser, `canonical` für die
 * Suchmaschine, ein sichtbarer Link für den Fall, dass beides nicht greift.
 */
export const weiterleitungsKopf = (ziel: string): Metadata => ({
  robots: { index: false, follow: true },
  // Absolut, nicht relativ: Next löst einen relativen `canonical` gegen die
  // Basis-URL auf – und die trägt den Unterordner schon.
  alternates: { canonical: wegVollstaendig(ziel) ?? ziel },
  other: { refresh: `0; url=${ziel}` },
});

export function Weiterleitung({ ziel }: { ziel: string }) {
  return (
    <main className="lesefassung">
      <h1>Diese Seite ist umgezogen</h1>
      <p>Sie liegt jetzt unter <a href={ziel}>{ziel}</a>.</p>
    </main>
  );
}
