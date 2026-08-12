/**
 * Erzeugt eine einzelne, offline lauffähige HTML-Vorschau aus den echten
 * Weltdaten und dem echten Stylesheet – damit man die Welt ansehen kann,
 * ohne einen Server zu starten.
 *
 *   npm run vorschau   →   vorschau/welt.html
 *
 * Die Vorschau ist kein zweiter Codepfad: Daten und CSS stammen aus denselben
 * Dateien wie die Anwendung. Nachgebaut wird nur das Rendern, in Vanilla-JS.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const TEMP = '.vorschau-tmp';
mkdirSync(TEMP, { recursive: true });
mkdirSync('vorschau', { recursive: true });

/** TypeScript-Datei in ein importierbares Modul verwandeln: Typen weg, Werte bleiben. */
async function daten(datei, name) {
  const roh = readFileSync(datei, 'utf8');
  const js = roh
    .split('\n')
    .filter((z) => !/^\s*import\s/.test(z))
    .join('\n')
    .replace(/export interface [\s\S]*?\n\}\n/g, '')
    .replace(/^export const (\w+)\s*:\s*[^=]+=/gm, 'export const $1 =')
    .replace(/\s+as const/g, '')
    .replace(/export const \w+ = \([^)]*\)\s*:[^=]*=>[^;]*;/g, '');
  const ziel = path.join(TEMP, `${name}.mjs`);
  writeFileSync(ziel, js);
  return import(pathToFileURL(path.resolve(ziel)).href);
}

const { BUCH_BAND_1, KAPITEL_BAND_1, STIMMUNG } = await daten('src/data/band-1/band.ts', 'band');
const { SZENEN_BAND_1 } = await daten('src/data/band-1/szenen.ts', 'szenen');
const { ASSETS_BAND_1 } = await daten('src/data/band-1/assets.ts', 'assets');
const { RINGE, DENAR, KOENIGSSTRASSE, PRUEFUNG } = await daten('src/data/band-1/interaktionen.ts', 'interaktionen');
const { ORTE } = await daten('src/data/gemeinsam/orte.ts', 'orte');
const { BEGRIFFE } = await daten('src/data/gemeinsam/begriffe.ts', 'begriffe');
const { ZEITLEISTE } = await daten('src/data/gemeinsam/zeitleiste.ts', 'zeitleiste');

/** Bilder einbetten, damit die Datei allein funktioniert. */
const bilder = {};
const tiefen = {};
const videos = {};
for (const a of ASSETS_BAND_1) {
  const pfad = `public/assets/band-1/szenen/${a.datei}-1000.webp`;
  bilder[a.id] = `data:image/webp;base64,${readFileSync(pfad).toString('base64')}`;
  try {
    const t = `public/assets/band-1/szenen/${a.datei}-tiefe.webp`;
    tiefen[a.id] = `data:image/webp;base64,${readFileSync(t).toString('base64')}`;
  } catch { /* ohne Tiefenkarte bleibt die Ebene flach */ }
  // Bewegtfassung, falls vorhanden – für die Vorschau kleiner kodiert
  try {
    videos[a.id] = `data:video/mp4;base64,${readFileSync(`/tmp/${a.datei}-vorschau.mp4`).toString('base64')}`;
  } catch { /* diese Szene bleibt ein Standbild */ }
}

const css = readFileSync('src/styles/global.css', 'utf8');
const daten_js = JSON.stringify({
  buch: BUCH_BAND_1, kapitel: KAPITEL_BAND_1, szenen: SZENEN_BAND_1,
  assets: ASSETS_BAND_1, orte: ORTE, begriffe: BEGRIFFE, zeitleiste: ZEITLEISTE, ringe: RINGE, denar: DENAR, koenigsstrasse: KOENIGSSTRASSE, pruefung: PRUEFUNG,
  bilder, tiefen, videos, stimmung: STIMMUNG,
});

// Dieselben Dateien wie in der Anwendung – nur das Modulschlüsselwort fällt weg.
const alsSkript = (datei) => readFileSync(datei, 'utf8').replace(/^export /gm, '');
const engine = alsSkript('src/engine/kino-webgl.js') + '\n' + alsSkript('src/engine/zeilen.js');
const runtime = readFileSync('scripts/vorschau-runtime.js', 'utf8');

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${BUCH_BAND_1.titel} – Vorschau der Welt</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
:root{--display:"Cormorant Garamond";--body:"EB Garamond"}
${css}
</style>
</head>
<body>
<script id="welt-daten" type="application/json">${daten_js}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>${engine}\n${runtime}</script>
</body>
</html>`;

writeFileSync('vorschau/welt.html', html);
const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log(`vorschau/welt.html erzeugt: ${SZENEN_BAND_1.length} Szenen, ${ASSETS_BAND_1.length} Bilder, ${kb} kB`);
