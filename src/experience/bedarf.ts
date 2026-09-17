import type { Szenenbedarf } from './typen';

/**
 * Was eine Szene braucht — als Angabe der Szene, nicht als Vermutung der
 * Engine.
 *
 * Ein 3D-Cover läuft auf jedem Telefon. Eine begehbare mittelalterliche Stadt
 * mit Lichtberechnung tut das nicht, und wenn sie es versucht, bekommt der
 * Leser vier Bilder je Sekunde statt einer Entscheidung. Diese Datei ist die
 * Stelle, an der eine Szene sagt: unterhalb von X ergebe ich keinen Sinn mehr.
 */

export function bedarfErstellen(
  name: string,
  teile: Partial<Omit<Szenenbedarf, 'name'>> = {},
): Szenenbedarf {
  return {
    name,
    mindestens: teile.mindestens ?? 'RUECKFALL',
    // Standardmäßig aus. Eine Grafikkarte im Rechenzentrum kostet Geld,
    // solange sie läuft — das wird ausdrücklich eingeschaltet, nie geerbt.
    unrealMoeglich: teile.unrealMoeglich ?? false,
    rueckfallVorhanden: teile.rueckfallVorhanden ?? false,
    schwere: teile.schwere ?? 2,
  };
}

/**
 * Fünf Zuschnitte, die auf Buchseiten immer wieder vorkommen.
 *
 * Sie sind Startpunkte, keine Vorschrift: `bedarfErstellen` mit eigenen Werten
 * ist genauso richtig.
 */
export const BEDARFSMUSTER = Object.freeze({
  /** Cover, Portraet, Standbild mit leichter Bewegung. Laeuft ueberall. */
  stimmung: (name: string): Szenenbedarf =>
    bedarfErstellen(name, { mindestens: 'RUECKFALL', rueckfallVorhanden: true, schwere: 1 }),

  /** Ein 3D-Buch, drehbar, gutes Licht. Der haeufigste Fall. */
  buchobjekt: (name: string): Szenenbedarf =>
    bedarfErstellen(name, { mindestens: 'OPTIMIERT', rueckfallVorhanden: true, schwere: 2 }),

  /** Karte, Zeitleiste, Datenbild. Braucht Genauigkeit, nicht Rechenkraft. */
  karte: (name: string): Szenenbedarf =>
    bedarfErstellen(name, { mindestens: 'OPTIMIERT', rueckfallVorhanden: true, schwere: 2 }),

  /** Scrollgefuehrte Szene mit Partikeln und Kamerafahrt. */
  inszenierung: (name: string): Szenenbedarf =>
    bedarfErstellen(name, { mindestens: 'OPTIMIERT', rueckfallVorhanden: true, schwere: 3 }),

  /** Begehbarer Schauplatz, Lichtberechnung, Nanite. Der Unreal-Fall. */
  schauplatz: (name: string): Szenenbedarf =>
    bedarfErstellen(name, {
      mindestens: 'HIGH_END',
      unrealMoeglich: true,
      rueckfallVorhanden: true,
      schwere: 5,
    }),
});
