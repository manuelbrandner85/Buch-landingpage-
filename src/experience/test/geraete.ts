import type { Geraet, Netz } from '../typen';

/**
 * Die Gerätematrix.
 *
 * Kein einziges dieser Geräte steht hier im Raum — und genau darum geht es.
 * Weil die Entscheidungsstelle rein ist, lässt sich die ganze Bandbreite vom
 * Spielerechner bis zum Behördenrechner mit abgeschalteter Grafik in
 * Millisekunden durchrechnen. Ein Fehler in der Einstufung fällt hier auf und
 * nicht beim Leser.
 */

const GRUND: Geraet = {
  webgpu: false,
  webgl2: true,
  softwareRenderer: false,
  mobil: false,
  touch: false,
  bildpunktdichte: 1,
  fensterBreite: 1920,
  fensterHoehe: 1080,
  browser: 'chrome',
  wenigerBewegung: false,
};

export function geraet(teile: Partial<Geraet> = {}): Geraet {
  return { ...GRUND, ...teile };
}

export const GERAETE = {
  spielerechner: geraet({
    webgpu: true,
    kerne: 16,
    speicherGB: 8,
    renderername: 'NVIDIA GeForce RTX 5070',
  }),
  buero: geraet({ kerne: 8, speicherGB: 8 }),
  notebook: geraet({ webgpu: true, kerne: 4, speicherGB: 8, bildpunktdichte: 2 }),
  telefonNeu: geraet({
    webgpu: true,
    kerne: 8,
    speicherGB: 8,
    mobil: true,
    touch: true,
    bildpunktdichte: 3,
    fensterBreite: 430,
    fensterHoehe: 932,
    browser: 'safari',
  }),
  telefonAlt: geraet({
    kerne: 4,
    speicherGB: 4,
    mobil: true,
    touch: true,
    bildpunktdichte: 2.6,
    fensterBreite: 393,
    fensterHoehe: 851,
  }),
  telefonEinfach: geraet({ kerne: 4, speicherGB: 2, mobil: true, touch: true, bildpunktdichte: 2 }),
  softwareRenderer: geraet({
    softwareRenderer: true,
    renderername: 'Google SwiftShader',
    kerne: 8,
    speicherGB: 8,
  }),
  ohneWebGL: geraet({ webgl2: false, kerne: 2, speicherGB: 2 }),
  safariVerschwiegen: geraet({ webgpu: true, browser: 'safari' }),
  wenigerBewegung: geraet({ webgpu: true, kerne: 16, speicherGB: 8, wenigerBewegung: true }),
} as const;

export const NETZE = {
  glasfaser: { bandbreite: 200, laufzeit: 12, art: '4g', datensparen: false } as Netz,
  dsl: { bandbreite: 25, laufzeit: 40, art: '4g', datensparen: false } as Netz,
  mobilfunkGut: { bandbreite: 30, laufzeit: 60, art: '4g', datensparen: false } as Netz,
  mobilfunkSchwach: { bandbreite: 3, laufzeit: 180, art: '3g', datensparen: false } as Netz,
  datensparen: { bandbreite: 50, laufzeit: 30, art: '4g', datensparen: true } as Netz,
  unbekannt: { datensparen: false } as Netz,
  weiteStrecke: { bandbreite: 100, laufzeit: 240, art: '4g', datensparen: false } as Netz,
} as const;
