/**
 * Die Begriffe der Experience Engine.
 *
 * Zwei Entscheidungen, die bewusst getrennt bleiben:
 *
 *   STUFE   — WO und in welcher Grundform gerechnet wird
 *   BUDGET  — WIE VIEL innerhalb dieser Stufe ausgegeben werden darf
 *
 * Das ist keine Erbsenzählerei. Ein schwaches Telefon an Glasfaser kann eine
 * Unreal-Buchwelt in voller Pracht bekommen; ein starker Rechner an einer
 * schlechten Leitung bekommt dieselbe Welt lokal gerechnet. Wer beides in eine
 * einzige Zahl presst, verliert genau die Fälle, für die diese Engine gebaut
 * ist.
 */

/** Die vier Ausbaustufen. */
export type Stufe =
  /** Level 1 — WebGPU, volle Qualität, örtlich gerechnet. */
  | 'HIGH_END'
  /** Level 2 — WebGL2, reduziert, örtlich gerechnet. */
  | 'OPTIMIERT'
  /** Level 3 — Unreal im Rechenzentrum, Bild über WebRTC. */
  | 'GESTREAMT'
  /** Level 4 — vorgerendert: Video, Bildfolge, CSS. Kein Echtzeit-3D. */
  | 'RUECKFALL';

/** Von oben nach unten, nach Aufwand auf dem Gerät des Lesers. */
export const STUFEN: readonly Stufe[] = [
  'HIGH_END',
  'OPTIMIERT',
  'GESTREAMT',
  'RUECKFALL',
];

/**
 * Was das Gerät kann.
 *
 * Nichts hiervon ist personenbezogen: keine Kennung, kein Standort. Was der
 * Browser nicht hergibt, bleibt `undefined` — und `undefined` heißt
 * „unbekannt", niemals „schlecht". Safari und neuere Firefox-Fassungen
 * verweigern die Renderer-Kennung; eine Einstufung, die darauf beruht, wäre
 * dort blind.
 */
export interface Geraet {
  webgpu: boolean;
  webgl2: boolean;
  /** Kennung der Grafikeinheit, soweit der Browser sie herausgibt. */
  renderername?: string;
  /** SwiftShader, llvmpipe, ANGLE auf der CPU — kein echter Beschleuniger. */
  softwareRenderer: boolean;
  maxTexturgroesse?: number;
  kerne?: number;
  /** Grober Arbeitsspeicher in GB, nur wo der Browser ihn nennt. */
  speicherGB?: number;
  mobil: boolean;
  touch: boolean;
  bildpunktdichte: number;
  fensterBreite: number;
  fensterHoehe: number;
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'andere';
  /** Der Leser hat im Betriebssystem weniger Bewegung verlangt. */
  wenigerBewegung: boolean;
}

/** Was die Leitung kann. */
export interface Netz {
  /** Einstufung des Browsers: 'slow-2g' | '2g' | '3g' | '4g'. */
  art?: string;
  /** Geschätzte Bandbreite in Mbit/s, soweit gemeldet. */
  bandbreite?: number;
  /** Geschätzte Rundlaufzeit in ms, soweit gemeldet. */
  laufzeit?: number;
  /** Der Leser hat Datensparen eingeschaltet. */
  datensparen: boolean;
  /** Gemessene Ladezeit einer kleinen Datei in ms — korrigiert die Schätzung. */
  gemesseneLadezeit?: number;
}

/**
 * Was im Betrieb gemessen wurde.
 *
 * Der Mittelwert allein versteckt Ruckler, deshalb steht das 95. Perzentil der
 * Bildzeit daneben: Eine Szene mit 58 Bildern je Sekunde im Mittel und 120 ms
 * im Perzentil ruckelt sichtbar, obwohl der Mittelwert einwandfrei aussieht.
 */
export interface Messwerte {
  bilderJeSekunde: number;
  bildzeitMittel: number;
  bildzeitP95: number;
  /** Wie viele Bilder in die Messung eingegangen sind. */
  proben: number;
}

/**
 * Was eine bestimmte Buchszene braucht.
 *
 * Diese Angaben kommen aus dem Datensatz der Szene, nicht aus einer Vermutung
 * der Engine. Eine Produktdrehung und eine begehbare Stadt sehen für den Code
 * gleich aus — nur die Szene selbst weiß, was sie ist.
 */
export interface Szenenbedarf {
  name: string;
  /** Unterhalb dieser Stufe ergibt die Szene keinen Sinn mehr. */
  mindestens: Stufe;
  /** Diese Szene rechtfertigt eine Grafikkarte im Rechenzentrum. */
  unrealMoeglich: boolean;
  /** Es gibt vorgerendertes Material: Video, Bildfolge, Standbild. */
  rueckfallVorhanden: boolean;
  /** Grobe Schwere, 1 = leicht, 5 = extrem. */
  schwere: 1 | 2 | 3 | 4 | 5;
}

/** Der Wunsch des Lesers, falls er einen geäußert hat. */
export interface Leserwunsch {
  /** 'AUTO' oder eine fest gewählte Stufe. */
  stufe: 'AUTO' | Stufe;
  /** Er hat die große Fassung ausdrücklich angefordert („Welt betreten"). */
  grosseFassungGewuenscht: boolean;
  /** Er will Daten sparen, unabhängig vom Browserhinweis. */
  datensparen: boolean;
}

/** Was draußen verfügbar ist. */
export interface Dienstlage {
  /** Eine Grafikkarte im Rechenzentrum ist frei. */
  gpuFrei: boolean;
  /** Gemessene Rundlaufzeit zum Signalserver in ms. */
  laufzeitZumServer?: number;
}

/** Das Ergebnis: welche Stufe, und warum. */
export interface Entscheidung {
  stufe: Stufe;
  /**
   * Jeder Grund in Klartext. Nicht Zierde: Ohne diese Liste ist eine
   * Fehleinstufung auf dem Telefon eines Lesers nicht nachvollziehbar — und
   * genau dort passieren sie. Auf dem eigenen Rechner ist immer alles gut.
   */
  gruende: string[];
}

/** Was die Szene aus einer Stufe an Zahlen ableitet. */
export interface Budget {
  /** Skalierung des Bildpuffers gegenüber CSS-Pixeln. */
  aufloesungsskala: number;
  /** Obergrenze für die Bildpunktdichte. */
  dichteDeckel: number;
  /** Anteil des vollen Partikelhaushalts, 0 bis 1. */
  partikel: number;
  /** Längste Kante einer Textur in Pixeln. */
  texturKante: number;
  schatten: 'aus' | 'klein' | 'gross';
  licht: 'vorgerendert' | 'gebacken' | 'gemischt' | 'dynamisch';
  nachbearbeitung: 'keine' | 'minimal' | 'reduziert' | 'voll';
  animation: 'video' | 'einfach' | 'reduziert' | 'voll';
  /** Höchste LOD-Stufe, die geladen wird (0 = feinste). */
  lodStart: 0 | 1 | 2 | 3;
  reflexionen: boolean;
  /** Welche Modellfassung geladen wird: model-high/-medium/-low.glb */
  modellfassung: 'high' | 'medium' | 'low' | 'keine';
}
