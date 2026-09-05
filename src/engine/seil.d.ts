export interface Seil {
  readonly ruht: boolean;
  readonly anzahl: number;
  stossen(dx: number, dy: number): void;
  schritt(): boolean;
  naechster(px: number, py: number): { i: number; abstand: number };
  greifen(px: number, py: number, reichweite: number): boolean;
  ziehen(px: number, py: number, hoechstens: number):
    { punkt: number; anteil: number; weite: number } | null;
  loslassen(): { punkt: number; anteil: number; weite: number } | null;
  anzupfen(px: number, py: number, reichweite: number, kraft: number):
    { punkt: number; anteil: number; weite: number } | null;
  pfad(): string;
}
export function seil(
  ruhelage: { x: number; y: number }[], anker?: number[]): Seil;
