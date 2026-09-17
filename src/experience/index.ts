/**
 * Die Adaptive Experience Engine von TRENDONIX BÜCHER.
 *
 * Sie entscheidet, welche Fassung einer Buchwelt ein Leser bekommt — und sie
 * rendert selbst nichts. Sie kennt weder die Kinoebene noch Three.js noch
 * Unreal. Genau deshalb ist sie auf jede Buchseite übertragbar: Landingpage,
 * Autorenseite, Buchserie, Storywelt, Verkaufsseite.
 *
 * Die Leitfrage ist nicht „kann dieses Gerät unsere Seite darstellen", sondern
 * „welche Fassung ist für dieses Gerät die beste".
 */

export type {
  Budget,
  Dienstlage,
  Entscheidung,
  Geraet,
  Leserwunsch,
  Messwerte,
  Netz,
  Stufe,
  Szenenbedarf,
} from './typen';
export { STUFEN } from './typen';

export {
  BUDGETS,
  OERTLICHE_STUFEN,
  budgetFuer,
  gedeckelt,
  hoeher,
  rang,
  tiefer,
} from './stufen';

export { geraetLesen, punkteFuer, startstufe } from './geraet';
export {
  netzLesen,
  netzMessen,
  netzTraegtStreaming,
  modellfassungFuerLeitung,
} from './netz';

export type { Lage } from './entscheidung';
export { entscheiden, naechsteStufe } from './entscheidung';

export { Bildzeiten, anlaufMessen, perzentilStelle } from './messung';

export type { Massnahme, Reglerregeln, Reglerstand, Stellschraube } from './regler';
export { REGELN, REIHENFOLGE, regeln, standErstellen, wirksamesBudget } from './regler';

export { BEDARFSMUSTER, bedarfErstellen } from './bedarf';

export type { Buchsteckbrief, Element, Empfehlung, Genre } from './buchanalyse';
export { empfehlung } from './buchanalyse';
