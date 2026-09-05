export interface Zerfallflaeche {
  messen(): void;
  streue(rechteck: DOMRect, ton: [number, number, number]): void;
  zerstoeren(): void;
}
export function zerfallFlaeche(
  leinwand: HTMLCanvasElement, optionen?: { hoechstens?: number },
): Zerfallflaeche | null;
