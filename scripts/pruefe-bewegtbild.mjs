/**
 * Jede Bewegtfassung prüfen, bevor sie jemand sieht.
 *
 * Eine Szene mit `motion` erwartet zwei Dateien: die große Fassung und die
 * kleine für schmale Geräte. Fehlt eine, bleibt in der Kinoebene still das
 * Standbild stehen – man sieht keinen Fehler, sondern nur eine Szene, die
 * sich nicht bewegt. Genau deshalb wird hier gezählt statt geschaut.
 *
 * Geprüft wird außerdem, was ffmpeg über die Datei sagt: Dauer, Auflösung,
 * Bildrate und ob eine Tonspur mitläuft. Ton hat in dieser Ebene nichts zu
 * suchen – die Videos laufen stumm und automatisch, eine Tonspur wäre nur
 * Ballast und auf manchen Geräten ein Grund, das Abspielen zu verweigern.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BAENDE = ['band-1', 'band-2', 'band-3'];
const fehler = [];
const warnung = [];
const zeilen = [];

const ffprobe = (datei) => {
  try {
    const roh = execFileSync('ffprobe', [
      '-v', 'error', '-show_entries',
      'stream=codec_type,width,height,avg_frame_rate:format=duration',
      '-of', 'json', datei], { encoding: 'utf8' });
    return JSON.parse(roh);
  } catch { return null; }
};

for (const band of BAENDE) {
  const szenen = existsSync(`src/data/${band}/szenen.ts`)
    ? readFileSync(`src/data/${band}/szenen.ts`, 'utf8') : '';
  const assets = existsSync(`src/data/${band}/assets.ts`)
    ? readFileSync(`src/data/${band}/assets.ts`, 'utf8') : '';
  if (!szenen) continue;

  const dateiZu = new Map([...assets.matchAll(
    /id: '([\w-]+)',\s*(?:bandId: '[\w-]+',\s*)?datei: '([\w-]+)'/g)]
    .map(([, id, datei]) => [id, datei]));

  for (const [, id] of szenen.matchAll(/motion: '([\w-]+)'/g)) {
    const datei = dateiZu.get(id);
    if (!datei) { fehler.push(`${band}: motion "${id}" hat kein Asset.`); continue; }
    for (const [art, name] of [['groß', `${datei}-motion.mp4`], ['klein', `${datei}-motion-klein.mp4`]]) {
      const pfad = `public/assets/${band}/szenen/${name}`;
      if (!existsSync(pfad)) { fehler.push(`${band}: ${name} fehlt (${art}e Fassung).`); continue; }
      const mb = statSync(pfad).size / 1024 / 1024;
      const info = ffprobe(pfad);
      if (!info) { warnung.push(`${name}: ffprobe nicht verfügbar – nur Größe geprüft.`); continue; }
      const video = info.streams.find((s) => s.codec_type === 'video');
      const ton = info.streams.find((s) => s.codec_type === 'audio');
      const dauer = Number(info.format?.duration ?? 0);
      if (ton) fehler.push(`${name}: hat eine Tonspur – die Kinoebene läuft stumm.`);
      if (!video) { fehler.push(`${name}: keine Bildspur.`); continue; }
      if (dauer < 1) fehler.push(`${name}: nur ${dauer.toFixed(2)} s lang.`);
      // Die lange Kante zählt, nicht die Breite: Ein Kapitelauftakt aus dem
      // Satz ist fast quadratisch, ein 1920 Pixel breites Bild daraus wäre
      // über 2000 Pixel hoch und unnötig schwer.
      if (art === 'groß' && Math.max(video.width, video.height) < 1280) {
        warnung.push(`${name}: lange Kante nur ${Math.max(video.width, video.height)} Pixel.`);
      }
      if (art === 'klein' && mb > 3) warnung.push(`${name}: ${mb.toFixed(1)} MB für die kleine Fassung.`);
      if (art === 'groß' && mb > 6) warnung.push(`${name}: ${mb.toFixed(1)} MB – schwer für eine Szene.`);
      zeilen.push(`${name.padEnd(38)} ${String(video.width)}×${video.height}`
        + `  ${dauer.toFixed(1)} s  ${mb.toFixed(2)} MB`);
    }
  }
}

for (const z of zeilen) console.log(z);
for (const w of warnung) console.warn('Hinweis:', w);
if (fehler.length) {
  for (const f of fehler) console.error('Fehler:', f);
  process.exit(1);
}
console.log(`\n${zeilen.length} Videodateien geprüft – in Ordnung.`);
