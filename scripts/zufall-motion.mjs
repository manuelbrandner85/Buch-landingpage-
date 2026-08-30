/**
 * Die Kapitelclips fürs Web.
 *
 *   node scripts/zufall-motion.mjs [erste] [letzte]
 *
 * Aus `assets-quelle/zufall/motion/kapNN.mp4` (roh von kie.ai) wird:
 *   public/assets/zufall/szenen/kapNN-motion.mp4        H.264, 1280 hoch
 *   public/assets/zufall/szenen/kapNN-motion-klein.mp4  H.264, 854 hoch
 *   public/assets/zufall/szenen/kapNN-1000.webp/.avif   Standbild und Poster
 *
 * Zwei Eigenheiten gegenüber `motion-holen.mjs`:
 *
 * Hochkant. Der Feed ist ein Telefon, kein Kino — skaliert wird über die Höhe,
 * sonst käme ein 1920 breites, 3400 hohes Ungetüm heraus.
 *
 * Pendel. Der Clip läuft vorwärts und wieder zurück. Ein Feed-Beitrag läuft in
 * Schleife, und eine Schleife mit Schnittkante sieht man sofort — bei einer so
 * langsamen Bewegung sieht man den Rückwärtslauf dagegen nicht.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync } from 'node:fs';

const ROH = 'assets-quelle/zufall/motion';
const ZIEL = 'public/assets/zufall/szenen';
mkdirSync(ZIEL, { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'pipe' });
const von = Number(process.argv[2] ?? 1);
const bis = Number(process.argv[3] ?? 40);

for (let n = von; n <= bis; n++) {
  const name = `kap${String(n).padStart(2, '0')}`;
  const roh = `${ROH}/${name}.mp4`;
  if (!existsSync(roh)) { console.log(`${name}: roh fehlt`); continue; }
  // Fertig ist erst, wenn Bewegtfassung UND Standbild liegen. Vorher genügte
  // die mp4 — brach der Lauf zwischen beiden ab, fehlte das Poster für immer.
  if (existsSync(`${ZIEL}/${name}-motion.mp4`) && existsSync(`${ZIEL}/${name}-1000.webp`)) {
    console.log(`${name}: steht`); continue;
  }

  const pendel = '[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]';

  ff(['-i', roh, '-filter_complex', `${pendel};[v]scale=-2:1280[o]`, '-map', '[o]', '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '27', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${ZIEL}/${name}-motion.mp4`]);

  ff(['-i', roh, '-filter_complex', `${pendel};[v]scale=-2:854[o]`, '-map', '[o]', '-an',
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '29', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${ZIEL}/${name}-motion-klein.mp4`]);

  // Standbild: das erste Bild des Clips, damit Poster und Bewegtfassung
  // nahtlos ineinander übergehen. Nur WebP — AV1 als Standbild zu kodieren
  // dauert je Bild länger als der ganze Clip und spart hier nichts.
  for (const [breite, kuerzel] of [[720, '1000'], [480, '640']]) {
    ff(['-i', roh, '-frames:v', '1', '-vf', `scale=${breite}:-2`, '-q:v', '82',
        `${ZIEL}/${name}-${kuerzel}.webp`]);
  }

  const kb = (p) => Math.round(statSync(p).size / 1024);
  console.log(`${name}: ${kb(`${ZIEL}/${name}-motion.mp4`)} kB / ` +
    `${kb(`${ZIEL}/${name}-motion-klein.mp4`)} kB klein`);
}
