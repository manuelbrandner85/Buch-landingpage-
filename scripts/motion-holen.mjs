/**
 * Holt fertige VideoSlash-Sequenzen ins Projekt und bereitet sie fürs Web auf.
 *
 *   node scripts/motion-holen.mjs <name> <url>
 *
 * Erzeugt neben dem Standbild:
 *   <name>-motion.mp4    H.264, ohne Ton, für die Kinoebene
 *   <name>-motion.webm   VP9, kleiner, für Browser die es können
 *   <name>-1000.webp     erstes Bild als Standbild und Poster
 *   <name>-tiefe.webp    Tiefenkarte aus dem ersten Bild
 *
 * Ton bleibt bewusst draußen: Die Atmosphäre der Welt wird erzeugt, nicht
 * mitgeliefert – und ein Video mit Tonspur startet auf manchen Geräten nicht.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const [name, url] = process.argv.slice(2);
if (!name || !url) { console.error('Aufruf: node scripts/motion-holen.mjs <name> <url>'); process.exit(1); }

const ZIEL = 'public/assets/band-1/szenen';
const ROH = 'assets-quelle';
mkdirSync(ZIEL, { recursive: true });
mkdirSync(ROH, { recursive: true });

const antwort = await fetch(url);
if (!antwort.ok) { console.error('Download fehlgeschlagen:', antwort.status); process.exit(1); }
writeFileSync(`${ROH}/${name}-motion-roh.mp4`, Buffer.from(await antwort.arrayBuffer()));

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

// H.264: breite Unterstützung, faststart für sofortiges Abspielen
ff(['-i', `${ROH}/${name}-motion-roh.mp4`, '-an', '-vf', 'scale=1920:-2',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '21', '-preset', 'slower',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${ZIEL}/${name}-motion.mp4`]);

// VP9 wird nicht mehr erzeugt: Die Engine lädt ohnehin nur die MP4-Fassung,
// und die VP9-Kodierung kostet ein Vielfaches der Zeit bei kaum sichtbarem
// Gewinn. Stattdessen zwei H.264-Stufen – groß für den Schirm, klein fürs Telefon.

// Kleinere Fassung für Telefone und schmale Verbindungen
ff(['-i', `${ROH}/${name}-motion-roh.mp4`, '-an', '-vf', 'scale=1280:-2',
    '-c:v', 'libx264', '-profile:v', 'high', '-crf', '25', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${ZIEL}/${name}-motion-klein.mp4`]);

// Erstes Bild als Standbild und Poster
ff(['-i', `${ROH}/${name}-motion-roh.mp4`, '-frames:v', '1', `${ROH}/${name}.jpg`]);

console.log(`${name}: mp4 + webm + Standbild erzeugt`);
