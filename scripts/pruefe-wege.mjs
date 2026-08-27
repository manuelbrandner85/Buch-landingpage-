/**
 * Jeden internen Link im gebauten Export nachschlagen.
 *
 * Ein statischer Export hat keinen Server, der einen Tippfehler noch abfängt:
 * Was nicht als Datei liegt, ist eine tote Seite. Und weil die Seite unter
 * GitHub Pages in einem Unterordner liegt, unter eigener Domain aber in der
 * Wurzel, sind gerade die Pfade die Stelle, an der es schiefgeht.
 *
 *   NEXT_EXPORT=1 npm run build && npm run pruefe:wege
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';

const WURZEL = 'out';
const BASIS = (process.env.NEXT_PUBLIC_BASIS_PFAD ?? '').replace(/\/$/, '');

if (!existsSync(WURZEL)) {
  console.error('Kein Export gefunden. Zuerst: NEXT_EXPORT=1 npm run build');
  process.exit(1);
}

const seiten = [];
(function sammeln(ordner) {
  for (const e of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) sammeln(pfad);
    else if (e.name.endsWith('.html')) seiten.push(pfad);
  }
})(WURZEL);

const fehler = [];
let geprueft = 0;

/**
 * Liegt unter diesem Pfad etwas, das ein Browser ausliefern kann?
 * Prozentzeichen zuerst auflösen – `[reihe]` steht in der Adresse als
 * `%5Breihe%5D`, im Dateibaum aber mit eckigen Klammern.
 */
const vorhanden = (pfad) => {
  let entschluesselt = pfad;
  try { entschluesselt = decodeURIComponent(pfad); } catch { /* bleibt roh */ }
  const p = join(WURZEL, entschluesselt);
  if (existsSync(p) && statSync(p).isFile()) return true;
  if (existsSync(join(p, 'index.html'))) return true;
  if (existsSync(`${p}.html`)) return true;
  return false;
};

for (const seite of seiten) {
  const html = readFileSync(seite, 'utf8');
  // Windows trennt Pfade mit Rueckstrich, Adressen tun das nie. Ohne diese
  // Zeile loest `posix.dirname` einen Seitenpfad wie `ordner\index.html` nicht
  // auf, jeder relative Verweis wird gegen die Wurzel geprueft und meldet
  // faelschlich „fuehrt ins Leere“ — auf dem Server war alles in Ordnung.
  const woher = seite.slice(WURZEL.length + 1).split('\\').join('/');
  for (const [, roh] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(roh)) continue;
    const ohneAnker = roh.split('#')[0].split('?')[0];
    if (!ohneAnker) continue;
    const absolut = ohneAnker.startsWith('/')
      ? ohneAnker
      : posix.join('/', posix.dirname('/' + woher), ohneAnker);
    geprueft++;
    // Der Basispfad gehört zur Adresse, nicht zum Dateibaum.
    if (BASIS && !absolut.startsWith(BASIS + '/') && absolut !== BASIS) {
      fehler.push(`${woher}: "${roh}" liegt außerhalb des Basispfads ${BASIS}`);
      continue;
    }
    const imBaum = BASIS ? absolut.slice(BASIS.length) : absolut;
    if (!vorhanden(imBaum)) fehler.push(`${woher}: "${roh}" führt ins Leere`);
  }
}

/**
 * Der Unterordner darf nirgends doppelt stehen.
 *
 * Diese Falle hat zweimal zugeschlagen: einmal bei den Zurück-Knöpfen, einmal
 * bei den Vorschaubildern für geteilte Links. Beide Male sah die Seite richtig
 * aus, und beide Male führte der Weg ins Leere. Ein doppelter Basispfad ist
 * immer ein Fehler – im href wie im Metadaten-Kopf.
 */
if (BASIS) {
  const doppelt = BASIS + BASIS;
  for (const seite of seiten) {
    const inhalt = readFileSync(seite, 'utf8');
    if (inhalt.includes(doppelt)) {
      fehler.push(`${seite}: Basispfad steht doppelt (${doppelt})`);
    }
  }
}

console.log(`${seiten.length} Seiten, ${geprueft} interne Verweise geprüft.`);
if (fehler.length) {
  for (const f of [...new Set(fehler)]) console.error('Fehler:', f);
  process.exit(1);
}
console.log('Alle Wege führen irgendwohin.');
