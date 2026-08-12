export interface KinoSzene {
  id: string;
  bild: string;
  tiefe?: string;
  grading: [number, number, number] | number[];
  uebergang?: 'aufloesen' | 'glut' | 'lichtschwenk' | 'wasser' | 'sediment';
  fahrt?: 'hinein' | 'durchfahrt' | 'heraus' | 'schwenkLinks' | 'schwenkRechts'
        | 'aufsteigen' | 'absenken';
  zoom?: number;
}
export interface KinoSteuerung {
  setzeFortschritt(wert: number): void;
  tempo(): number;
  anhalten(): void;
  fortsetzen(): void;
  zerstoeren(): void;
}
export function starteKino(
  canvas: HTMLCanvasElement,
  szenen: KinoSzene[],
  optionen?: { qualitaet?: number; zoom?: number; daempfung?: number },
): KinoSteuerung | null;
