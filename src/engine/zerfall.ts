'use client';

import { zerfallFlaeche, type Zerfallflaeche } from './zerfall-gl';

/**
 * Eine Angabe, die der Prüfung nicht standhält, zerfällt.
 *
 * Die Fläche dafür entsteht erst, wenn sie zum ersten Mal gebraucht wird, und
 * sie liegt über allem, ohne etwas abzufangen. Wer „Bewegung reduzieren“
 * gesetzt hat oder kein WebGL2 hat, bekommt sie nie zu sehen — dort bleibt es
 * beim Verblassen, und die Aussage steht trotzdem: Die Angabe tritt zurück.
 */
let flaeche: Zerfallflaeche | null = null;
let leinwand: HTMLCanvasElement | null = null;
let versucht = false;

function ton(el: HTMLElement): [number, number, number] {
  const f = getComputedStyle(el).color.match(/\d+(\.\d+)?/g);
  if (!f) return [0.89, 0.78, 0.55];
  return [Number(f[0]) / 255, Number(f[1]) / 255, Number(f[2]) / 255];
}

function bereit(): Zerfallflaeche | null {
  if (flaeche || versucht) return flaeche;
  versucht = true;
  if (typeof window === 'undefined') return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  leinwand = document.createElement('canvas');
  leinwand.className = 'zerfall';
  leinwand.setAttribute('aria-hidden', 'true');
  document.body.appendChild(leinwand);

  // Auf schmalen Geräten weniger Körner. Nicht aus Vorsicht, sondern aus
  // Rechnung: Die Fläche ist dort kleiner, die Körner wären dichter, und der
  // Aufbruch sähe nach Nebel aus statt nach Zerfall.
  const schmal = window.matchMedia('(max-width: 760px)').matches;
  flaeche = zerfallFlaeche(leinwand, { hoechstens: schmal ? 2600 : 6000 });
  if (!flaeche) { leinwand.remove(); leinwand = null; return null; }

  flaeche.messen();
  window.addEventListener('resize', () => flaeche?.messen(), { passive: true });
  return flaeche;
}

/** Diese Angabe tritt zurück – und zwar sichtbar. */
export function laessZerfallen(el: HTMLElement): void {
  const f = bereit();
  if (!f) return;
  const r = el.getBoundingClientRect();
  // Was nicht im Bild ist, zerfällt auch nicht: Körner am oberen Rand, die
  // niemand kommen sah, sehen nach Fehler aus.
  if (r.bottom < 0 || r.top > window.innerHeight || r.width < 4) return;
  f.streue(r, ton(el));
}
