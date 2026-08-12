import type { Band, BandId, Kapitel, Szene } from '@/data/gemeinsam/typen';
import { BUCH_BAND_1, KAPITEL_BAND_1 } from '@/data/band-1/band';
import { SZENEN_BAND_1 } from '@/data/band-1/szenen';
import { ASSETS_BAND_1 } from '@/data/band-1/assets';
import { BAND_2 } from '@/data/band-2';
import { ORTE } from '@/data/gemeinsam/orte';

const BAND_1: Band = {
  buch: BUCH_BAND_1, kapitel: KAPITEL_BAND_1,
  szenen: SZENEN_BAND_1, assets: ASSETS_BAND_1,
};

const BAND_3: Band = {
  buch: {
    id: 'band-3', nummer: 3, titel: 'Band 3', status: 'in Arbeit',
    amazonUrl: 'AMAZON_BAND_3_URL', klappentext: 'Noch nicht begehbar.',
  },
  kapitel: [], szenen: [], assets: [],
};

/** Die Welt ist die Summe der Bände. Ein neuer Band wird hier eingehängt – sonst nirgends. */
export const WELT: Record<BandId, Band> = {
  'band-1': BAND_1, 'band-2': BAND_2, 'band-3': BAND_3,
};

export const BAENDE = Object.values(WELT);
export const REISE: Szene[] = BAENDE.flatMap((b) => b.szenen);
export const ALLE_KAPITEL: Kapitel[] = BAENDE.flatMap((b) => b.kapitel);

export const kapitelNach = (id?: number): Kapitel | undefined =>
  ALLE_KAPITEL.find((k) => k.id === id);

export const assetNach = (id?: string) =>
  id ? BAENDE.flatMap((b) => b.assets).find((a) => a.id === id) : undefined;

/** Orte, die in mehr als einem Band vorkommen – die Klammer zwischen den Bänden. */
export const wiederkehrendeOrte = () =>
  ORTE.filter((o) => new Set(o.vorkommen.map((v) => v.bandId)).size > 1);

/** Die erste Motivszene eines Kapitels – das Ziel, wenn man von der Karte springt. */
export const szeneZuKapitel = (kapitel?: number): Szene | undefined =>
  kapitel === undefined
    ? undefined
    : REISE.find((s) => s.kapitelId === kapitel && (s.typ === 'motiv' || s.typ === 'interaktion'));
