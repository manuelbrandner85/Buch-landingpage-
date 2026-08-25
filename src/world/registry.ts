import type { Band, BandId, Kapitel, Szene } from '@/data/gemeinsam/typen';
import { BUCH_BAND_1, KAPITEL_BAND_1, STIMMUNG } from '@/data/band-1/band';
import { SZENEN_BAND_1 } from '@/data/band-1/szenen';
import { ASSETS_BAND_1 } from '@/data/band-1/assets';
import { BAND_2, STIMMUNG_BAND_2 } from '@/data/band-2';
import { BAND_3, STIMMUNG_BAND_3 } from '@/data/band-3';
import { ORTE } from '@/data/gemeinsam/orte';

const BAND_1: Band = {
  buch: BUCH_BAND_1, kapitel: KAPITEL_BAND_1,
  szenen: SZENEN_BAND_1, assets: ASSETS_BAND_1,
};

/** Die Welt ist die Summe der Bände. Ein neuer Band wird hier eingehängt – sonst nirgends. */
export const WELT: Record<BandId, Band> = {
  'band-1': BAND_1, 'band-2': BAND_2, 'band-3': BAND_3,
};

export const BAENDE = Object.values(WELT);

/**
 * Was die Welt öffentlich zeigt.
 *
 * Ein Band ist vollständig in den Daten, lange bevor er erscheinen darf:
 * Band 3 trägt in seiner Buch-DNA die Regel „öffentlich nicht erwähnen, auch
 * nicht andeuten“. Deshalb entscheidet `status` – nicht das Vorhandensein von
 * Daten –, ob Kapitelseiten gebaut werden, ob der Band in der Sitemap steht
 * und ob sein Titel im Bücherbereich auftaucht. Aus „in Arbeit“ wird
 * „erschienen“, und der Band ist da; ein anderer Eingriff ist nicht nötig.
 */
export const OEFFENTLICHE_BAENDE = BAENDE.filter((b) => b.buch.status === 'erschienen');
export const OEFFENTLICHE_KAPITEL: Kapitel[] = OEFFENTLICHE_BAENDE.flatMap((b) => b.kapitel);
export const REISE: Szene[] = BAENDE.flatMap((b) => b.szenen);
export const ALLE_KAPITEL: Kapitel[] = BAENDE.flatMap((b) => b.kapitel);

export const kapitelNach = (id?: number): Kapitel | undefined =>
  ALLE_KAPITEL.find((k) => k.id === id);

/** Die Bandnummer zu einer BandId – für die Seitenangabe „Band 2, Seite 116“. */
export const bandNummer = (id?: BandId) => (id ? WELT[id].buch.nummer : 1);

export const bandZuKapitel = (id?: number) => {
  const k = kapitelNach(id);
  return k ? WELT[k.bandId].buch : undefined;
};

export const assetNach = (id?: string) =>
  id ? BAENDE.flatMap((b) => b.assets).find((a) => a.id === id) : undefined;

/**
 * Die Lichtstimmung ist eine Kurve über die ganze Reihe, nicht über einen Band:
 * Band 1 läuft von nachtblau zu staubig, Band 2 von Weinrot zu Blau, Band 3
 * kühl und metallisch. Die Kinoebene fragt hier nach – sonst bekäme jedes
 * Kapitel jenseits von Band 1 stumpf [1, 1, 1].
 */
const STIMMUNGEN: Record<number, [number, number, number]> = {
  ...STIMMUNG, ...STIMMUNG_BAND_2, ...STIMMUNG_BAND_3,
};

export const stimmungFuer = (kapitel?: number): [number, number, number] =>
  STIMMUNGEN[kapitel ?? 1] ?? [1, 1, 1];

/** Orte, die in mehr als einem Band vorkommen – die Klammer zwischen den Bänden. */
export const wiederkehrendeOrte = () =>
  ORTE.filter((o) => new Set(o.vorkommen.map((v) => v.bandId)).size > 1);

/** Die erste begehbare Szene eines Kapitels – das Ziel, wenn man von der Karte springt. */
export const szeneZuKapitel = (kapitel?: number): Szene | undefined =>
  kapitel === undefined
    ? undefined
    : REISE.find((s) => s.kapitelId === kapitel && (s.typ === 'motiv' || s.typ === 'interaktion'))
      ?? REISE.find((s) => s.kapitelId === kapitel);
