#!/usr/bin/env node
/**
 * Die Texturen der Buchmodelle neu kodieren.
 *
 * Gemessen an buch-high.glb, bevor dieses Skript existierte:
 *
 *   Geometrie                                 12,8 KB
 *   Umschlagbogen  2568x1797  JPEG 88        665,1 KB
 *   ORM            2048x2048  PNG            499,4 KB
 *
 * Das Modell ist zu 98,6 % Textur. Jede Minute, die in die Geometrie
 * gesteckt wird, um Bytes zu sparen, ist an der falschen Stelle.
 *
 * An den beiden Bildern ist dagegen etwas zu holen, ohne dass irgendjemand
 * es sieht:
 *
 *   ORM als PNG, wie Blender es schreibt      499,4 KB
 *   ORM als PNG, hoechste Packstufe           222,1 KB   gleiche Pixel
 *   ORM als WebP verlustfrei                  207,0 KB   gleiche Pixel
 *   Umschlag als WebP q90                     416,4 KB   statt JPEG 88
 *
 * Beim ORM ist verlustfrei Bedingung, nicht Vorsicht. Der Blaukanal traegt
 * die Kanten der Goldpraegung; die Buchstaben sind dort unter einem Zehntel
 * Millimeter breit. Eine verlustbehaftete Kodierung legt um jede Kante
 * einen Ring, und dieser Ring ist Metall, das auf Papier liegt. Beim
 * Umschlag ist genau das umgekehrt richtig: Er ist ein Foto, und WebP q90
 * traegt mehr Bild als das JPEG, das es ersetzt.
 *
 * Aufruf:  node scripts/glb-texturen.mjs [datei ...]
 * Ohne Angabe: alle drei Fassungen unter public/modelle.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import sharp from 'sharp';

const JSON_CHUNK = 0x4e4f534a; // 'JSON'
const BIN_CHUNK = 0x004e4942; // 'BIN\0'

const VORGABE = [
  'public/modelle/buch-high.glb',
  'public/modelle/buch-medium.glb',
  'public/modelle/buch-low.glb',
];

/** Ein GLB in seine drei Teile zerlegen. */
function zerlegen(roh) {
  if (roh.readUInt32LE(0) !== 0x46546c67) throw new Error('Keine GLB-Datei');
  let zeiger = 12;
  let json = null;
  let bin = Buffer.alloc(0);
  while (zeiger < roh.length) {
    const laenge = roh.readUInt32LE(zeiger);
    const art = roh.readUInt32LE(zeiger + 4);
    const daten = roh.subarray(zeiger + 8, zeiger + 8 + laenge);
    if (art === JSON_CHUNK) json = JSON.parse(daten.toString('utf8'));
    else if (art === BIN_CHUNK) bin = daten;
    zeiger += 8 + laenge + ((4 - (laenge % 4)) % 4);
  }
  if (!json) throw new Error('Kein JSON-Abschnitt');
  return { json, bin };
}

/** Und wieder zusammensetzen. Beide Abschnitte auf vier Byte aufgefuellt. */
function zusammensetzen(json, bin) {
  const jsonRoh = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonFuell = (4 - (jsonRoh.length % 4)) % 4;
  const binFuell = (4 - (bin.length % 4)) % 4;

  const teile = [];
  const kopf = Buffer.alloc(12);
  kopf.writeUInt32LE(0x46546c67, 0);
  kopf.writeUInt32LE(2, 4);
  teile.push(kopf);

  const jsonKopf = Buffer.alloc(8);
  jsonKopf.writeUInt32LE(jsonRoh.length + jsonFuell, 0);
  jsonKopf.writeUInt32LE(JSON_CHUNK, 4);
  teile.push(jsonKopf, jsonRoh, Buffer.alloc(jsonFuell, 0x20));

  if (bin.length > 0) {
    const binKopf = Buffer.alloc(8);
    binKopf.writeUInt32LE(bin.length + binFuell, 0);
    binKopf.writeUInt32LE(BIN_CHUNK, 4);
    teile.push(binKopf, bin, Buffer.alloc(binFuell, 0));
  }

  const alles = Buffer.concat(teile);
  alles.writeUInt32LE(alles.length, 8);
  return alles;
}

/**
 * Ein Bild neu kodieren.
 *
 * Der Weg ueber die Rohdaten ist Absicht: Aus einem PNG wieder ein PNG zu
 * machen, ohne es zu entpacken, waere ein Neuverpacken derselben Fehler.
 */
async function neuKodieren(daten, name) {
  const datenkarte = /orm/i.test(name);
  const bild = sharp(daten);
  const { width, height, channels } = await bild.metadata();
  const roh = await bild.raw().toBuffer();
  const eingabe = { raw: { width, height, channels } };
  const aus = datenkarte
    ? await sharp(roh, eingabe).webp({ lossless: true, effort: 6 }).toBuffer()
    : await sharp(roh, eingabe).webp({ quality: 90, effort: 6 }).toBuffer();
  return { aus, width, height, verlustfrei: datenkarte };
}

async function datei(pfad) {
  const roh = readFileSync(pfad);
  const { json, bin } = zerlegen(roh);
  const bilder = json.images ?? [];
  if (bilder.length === 0) {
    console.log('%s: keine eingebetteten Bilder', basename(pfad));
    return;
  }

  console.log('\n%s', basename(pfad));

  // Die neuen Bilddaten besorgen, bevor irgendetwas umgebaut wird.
  const neu = new Map();
  for (const [i, b] of bilder.entries()) {
    if (b.bufferView === undefined) continue;
    if (b.mimeType === 'image/webp') continue; // schon geschehen
    const s = json.bufferViews[b.bufferView];
    const alt = bin.subarray(s.byteOffset ?? 0, (s.byteOffset ?? 0) + s.byteLength);
    const { aus, width, height, verlustfrei } = await neuKodieren(alt, b.name ?? '');
    neu.set(b.bufferView, aus);
    console.log(
      '  %s  %dx%d  %s KB %s -> %s KB WebP %s',
      (b.name ?? '-').padEnd(22),
      width,
      height,
      (alt.length / 1024).toFixed(1),
      b.mimeType.replace('image/', ''),
      (aus.length / 1024).toFixed(1),
      verlustfrei ? 'verlustfrei' : 'q90',
    );
    b.mimeType = 'image/webp';
  }
  if (neu.size === 0) {
    console.log('  nichts zu tun');
    return;
  }

  /**
   * Den Binaerteil neu aufbauen.
   *
   * Die Bildabschnitte liegen zwischen den Geometrieabschnitten, nicht
   * hinter ihnen. Wird ein Bild kuerzer, verschiebt sich alles danach —
   * deshalb werden alle Versaetze neu vergeben und nicht einzelne
   * nachgerechnet. Ein uebersehener Versatz waere ein Modell, das laedt
   * und falsche Dreiecke zeigt.
   */
  const stuecke = [];
  let versatz = 0;
  for (const [i, s] of json.bufferViews.entries()) {
    const inhalt =
      neu.get(i) ?? bin.subarray(s.byteOffset ?? 0, (s.byteOffset ?? 0) + s.byteLength);
    const fuell = (4 - (versatz % 4)) % 4;
    if (fuell > 0) {
      stuecke.push(Buffer.alloc(fuell, 0));
      versatz += fuell;
    }
    stuecke.push(inhalt);
    s.byteOffset = versatz;
    s.byteLength = inhalt.length;
    versatz += inhalt.length;
  }
  const binNeu = Buffer.concat(stuecke);
  json.buffers[0].byteLength = binNeu.length;

  // EXT_texture_webp anmelden. three.js kennt die Erweiterung; ohne sie
  // waere die Datei fuer einen strengen Leser nicht lesbar, und genau das
  // soll er auch merken, statt ein leeres Buch zu zeigen.
  const noetig = new Set(json.extensionsRequired ?? []);
  const benutzt = new Set(json.extensionsUsed ?? []);
  noetig.add('EXT_texture_webp');
  benutzt.add('EXT_texture_webp');
  json.extensionsRequired = [...noetig];
  json.extensionsUsed = [...benutzt];
  for (const t of json.textures ?? []) {
    if (t.source === undefined) continue;
    t.extensions = { ...(t.extensions ?? {}), EXT_texture_webp: { source: t.source } };
    delete t.source;
  }

  const fertig = zusammensetzen(json, binNeu);
  writeFileSync(pfad, fertig);
  console.log(
    '  Datei %s KB -> %s KB  (%s %%)',
    (roh.length / 1024).toFixed(1),
    (fertig.length / 1024).toFixed(1),
    (((fertig.length - roh.length) / roh.length) * 100).toFixed(0),
  );
}

const dateien = process.argv.slice(2);
for (const p of dateien.length > 0 ? dateien : VORGABE) {
  await datei(p);
}
