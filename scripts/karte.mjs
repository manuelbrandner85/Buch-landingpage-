/**
 * Erzeugt die Kartengrundlage aus Natural Earth.
 *
 * Das Buch nennt seine Kartengrundlagen beim Namen: Küstenlinien von Natural
 * Earth. Die Seite hatte bisher nur ein Gradnetz – Punkte im Nichts. Damit sie
 * dieselbe Grundlage benutzt wie der Druck, holt dieses Skript die Umrisse aus
 * dem Natural-Earth-Datensatz (über das npm-Paket `world-atlas`, das nichts
 * anderes ist als Natural Earth in TopoJSON) und schreibt sie als Pfade in
 * `src/data/gemeinsam/karte-pfade.ts`.
 *
 * Projektion: rein lineare Zuordnung von Länge und Breite auf x und y
 * (Plattkarte). Nicht, weil sie die schönste wäre, sondern weil die Orte in
 * `orte.ts` echte Koordinaten tragen: In der Plattkarte liegt ein Ort genau
 * dort, wo seine Zahlen ihn hinsetzen, ohne Zwischenrechnung.
 *
 * Einheiten: zehn pro Grad. Länge −180…180 wird zu x 0…3600, Breite 90…−90 zu
 * y 0…1800.
 *
 *   node scripts/karte.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature, mesh } from 'topojson-client';
import { geoPath, geoEquirectangular, geoGraticule } from 'd3-geo';

const lies = (name) =>
  JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/${name}`, import.meta.url)));

// scale = 10/(180/π): d3 rechnet in Radiant, wir wollen zehn Einheiten je Grad.
const projektion = geoEquirectangular()
  .scale(1800 / Math.PI)
  .translate([1800, 900]);

const pfad = geoPath(projektion);

/** Nachkommastellen kürzen: Ein Zehntel Grad ist rund elf Kilometer – genug. */
const kuerzen = (d) => d.replace(/(\d+\.\d)\d+/g, '$1');

import { presimplify, simplify } from 'topojson-simplify';

const landTopo = simplify(presimplify(lies('land-50m.json')), 0.05);
const laenderTopo = lies('countries-110m.json');

const land = kuerzen(pfad(feature(landTopo, landTopo.objects.land)));
const grenzen = kuerzen(pfad(mesh(laenderTopo, laenderTopo.objects.countries, (a, b) => a !== b)));
const netz = kuerzen(pfad(geoGraticule().step([20, 20])()));

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(0)} kB`;
console.log('Land   ', kb(land));
console.log('Grenzen', kb(grenzen));
console.log('Netz   ', kb(netz));

const datei = `// Erzeugt von scripts/karte.mjs – nicht von Hand ändern.
//
// Küstenlinien und Staatsgrenzen aus Natural Earth (1:50 Mio.), über das
// npm-Paket world-atlas. Plattkarte, zehn Einheiten je Grad:
// Länge −180…180 → x 0…3600, Breite 90…−90 → y 0…1800.

/** Breite und Höhe der ganzen Welt in Karteneinheiten. */
export const KARTE_BREITE = 3600;
export const KARTE_HOEHE = 1800;

/** Ein Ort in Karteneinheiten. */
export const kx = (lon: number) => (lon + 180) * 10;
export const ky = (lat: number) => (90 - lat) * 10;

export const LAND_PFAD = ${JSON.stringify(land)};

export const GRENZEN_PFAD = ${JSON.stringify(grenzen)};

export const NETZ_PFAD = ${JSON.stringify(netz)};
`;

writeFileSync(new URL('../src/data/gemeinsam/karte-pfade.ts', import.meta.url), datei);
console.log('src/data/gemeinsam/karte-pfade.ts geschrieben.');
