import type { Geraet, Stufe } from './typen';
import { rang } from './stufen';

/**
 * Was das Gerät kann — und was daraus folgt.
 *
 * Zwei Teile, bewusst getrennt: `geraetLesen()` fragt den Browser und ist
 * deshalb nur dort lauffähig. `punkteFuer()` und `startstufe()` rechnen mit
 * dem Ergebnis und sind reine Funktionen — nur deshalb lässt sich die ganze
 * Gerätematrix ohne ein einziges echtes Gerät prüfen.
 */

/** Kennungen, hinter denen keine Grafikkarte steckt, sondern der Hauptprozessor. */
const SOFTWARE_KENNUNGEN = [
  'swiftshader',
  'llvmpipe',
  'software',
  'microsoft basic render',
  'mesa offscreen',
];

function browserFamilie(ua: string): Geraet['browser'] {
  const s = ua.toLowerCase();
  if (s.includes('edg/')) return 'edge';
  if (s.includes('firefox')) return 'firefox';
  // Reihenfolge zählt: Chrome trägt "safari" in der Kennung mit.
  if (s.includes('chrome') || s.includes('chromium')) return 'chrome';
  if (s.includes('safari')) return 'safari';
  return 'andere';
}

/**
 * Das Gerät befragen. Nur im Browser aufrufbar.
 *
 * WebGPU wird nicht am Vorhandensein von `navigator.gpu` festgemacht, sondern
 * daran, dass sich tatsächlich ein Adapter anfordern lässt. Der Unterschied
 * ist kein Detail: Es gibt Aufbauten, in denen die Schnittstelle da ist und
 * die Anforderung dann `null` liefert — die Seite lädt dann den ganzen
 * WebGPU-Weg und scheitert beim ersten Bild.
 */
export async function geraetLesen(): Promise<Geraet> {
  const nav = globalThis.navigator as Navigator & {
    deviceMemory?: number;
    gpu?: { requestAdapter(): Promise<unknown | null> };
  };
  const win = globalThis.window;

  let webgpu = false;
  if (nav?.gpu) {
    try {
      webgpu = (await nav.gpu.requestAdapter()) !== null;
    } catch {
      webgpu = false;
    }
  }

  let webgl2 = false;
  let renderername: string | undefined;
  let maxTexturgroesse: number | undefined;
  try {
    const leinwand = document.createElement('canvas');
    const gl = leinwand.getContext('webgl2');
    if (gl) {
      webgl2 = true;
      maxTexturgroesse = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (info) {
        renderername = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
      }
      // Den Kontext sofort wieder hergeben: Browser begrenzen die Zahl
      // gleichzeitiger WebGL-Kontexte, und dieser hier wird nie wieder
      // gebraucht. Die Kinoebene holt sich ihren eigenen.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl2 = false;
  }

  const kennung = (renderername ?? '').toLowerCase();
  const softwareRenderer = SOFTWARE_KENNUNGEN.some((k) => kennung.includes(k));

  const zeigerGrob =
    typeof win?.matchMedia === 'function' &&
    win.matchMedia('(pointer: coarse)').matches;
  const wenigerBewegung =
    typeof win?.matchMedia === 'function' &&
    win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    webgpu,
    webgl2,
    ...(renderername !== undefined ? { renderername } : {}),
    softwareRenderer,
    ...(maxTexturgroesse !== undefined ? { maxTexturgroesse } : {}),
    ...(nav?.hardwareConcurrency !== undefined ? { kerne: nav.hardwareConcurrency } : {}),
    ...(nav?.deviceMemory !== undefined ? { speicherGB: nav.deviceMemory } : {}),
    mobil: zeigerGrob || /android|iphone|ipad|mobile/i.test(nav?.userAgent ?? ''),
    touch: (nav?.maxTouchPoints ?? 0) > 0,
    bildpunktdichte: win?.devicePixelRatio ?? 1,
    fensterBreite: win?.innerWidth ?? 1280,
    fensterHoehe: win?.innerHeight ?? 720,
    browser: browserFamilie(nav?.userAgent ?? ''),
    wenigerBewegung,
  };
}

/**
 * Punkte statt Sonderfallkette.
 *
 * Der Grund ist Haltbarkeit: Eine Liste bekannter Grafikkarten ist in einem
 * halben Jahr falsch, ein Punktesystem altert langsamer. Und `undefined`
 * bleibt hier ohne Wirkung — ein Browser, der `deviceMemory` verschweigt,
 * bekommt keinen Abzug für eine Angabe, die er nur nicht macht.
 */
export function punkteFuer(g: Geraet): number {
  let p = 0;

  if (g.webgpu) p += 3;
  if (g.webgl2) p += 2;

  if (g.kerne !== undefined) {
    if (g.kerne >= 8) p += 2;
    else if (g.kerne >= 4) p += 1;
  }

  if (g.speicherGB !== undefined) {
    if (g.speicherGB >= 8) p += 2;
    else if (g.speicherGB >= 4) p += 1;
  }

  if (!g.mobil) p += 2;

  // Der einzige harte Abzug. Ein Software-Renderer rechnet auf dem
  // Hauptprozessor und bricht bei jeder ernsthaften Szene ein, egal wie viele
  // Kerne die Maschine hat.
  if (g.softwareRenderer) p -= 5;

  return p;
}

/**
 * Die Startstufe ist eine Vermutung.
 *
 * Sie hält nur die ersten Sekunden; danach entscheiden gemessene Bildraten.
 * Ein Gerät mit starker Grafikkarte und überlastetem Browser bekäme sonst eine
 * Stufe, die es nicht halten kann.
 */
export function startstufe(g: Geraet): Stufe {
  // RUECKFALL ist fuer Geraete, die wirklich NICHT rendern koennen — nicht
  // fuer schwache. Das ist im Vier-Stufen-Modell leicht zu verwechseln: Es
  // gibt keine Stufe zwischen "optimiertes 3D" und "gar kein 3D", also
  // landete ein guenstiges Telefon mit WebGL2 sonst sofort beim Standbild,
  // obwohl es die reduzierte Fassung tragen wuerde.
  //
  // Zwei Faelle koennen es nicht:
  //   · gar keine Rendermoeglichkeit
  //   · ein Software-Renderer — er rendert zwar, aber auf dem Hauptprozessor
  //     und mit vier Bildern je Sekunde
  //
  // Alles andere bekommt mindestens OPTIMIERT und wird binnen Sekunden vom
  // Regler heruntergenommen, falls es doch nicht traegt. Nach unten zu raten
  // ist hier teurer als nach oben: Wer faelschlich das Standbild bekommt,
  // sieht es fuer den ganzen Besuch.
  if (!g.webgl2 && !g.webgpu) return 'RUECKFALL';
  if (g.softwareRenderer) return 'RUECKFALL';

  const aus: Stufe = punkteFuer(g) >= 9 ? 'HIGH_END' : 'OPTIMIERT';

  // Mobile Geräte starten nie auf HIGH_END — auch das stärkste Telefon nicht.
  //
  // Zwei Gründe, die beide nichts mit Rechenleistung zu tun haben:
  //
  //   Wärme. Ein Telefon liefert dreissig Sekunden lang Bilder wie ein
  //   Spielerechner und drosselt danach hart. Die Startstufe hielte also
  //   genau so lange, wie der Leser braucht, um sich an sie zu gewöhnen.
  //
  //   Bildpunktdichte. Bei einem Wert von 3 entsteht ein Bildpuffer mit der
  //   neunfachen Pixelzahl eines Desktop-Bildes. Das bricht zusammen, bevor
  //   der Regler je misst.
  //
  // Nach unten zu raten ist hier die sichere Richtung: Hält das Gerät die
  // Stufe zehn Sekunden lang mühelos, hebt der Regler sie von allein an.
  if (g.mobil && rang(aus) < rang('OPTIMIERT')) return 'OPTIMIERT';

  return aus;
}
