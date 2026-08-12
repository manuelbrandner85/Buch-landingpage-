/**
 * Das Weltmodell. Diese Typen gelten für alle drei Bände.
 * Neue Bände fügen Daten hinzu – niemals neue Typen.
 */

export type BandId = 'band-1' | 'band-2' | 'band-3';

/** Evidenzstufen des Buches: A gesichert … G widerlegt. */
export const EVIDENZ = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type Evidenz = (typeof EVIDENZ)[number];

/** Herkunftsangaben aus dem Bildnachweis (Band 1, S. 201). Kein Motiv ist eine historische Fotografie. */
export type Herkunft =
  | 'Gesicherter Befund'
  | 'Freie Rekonstruktion'
  | 'Rekonstruktion auf Grundlage von Befunden'
  | 'Karte auf realer Geobasis'
  | 'Eigene Darstellung';

export type SzeneTyp =
  | 'ankunft' | 'cover' | 'auftakt' | 'motiv' | 'papier' | 'karte' | 'buecher'
  | 'interaktion';

/** Interaktive Module: Argumente, die man nur begreift, wenn man sie bedient. */
export type InteraktionsModul = 'ringe' | 'denar' | 'laufzeit' | 'pruefung';

export interface Buch {
  id: BandId;
  nummer: 1 | 2 | 3;
  titel: string;
  unterzeile?: string;
  status: 'erschienen' | 'in Arbeit';
  /** Platzhalter, bis die echte Produktseite vorliegt. Niemals erfundene URLs. */
  amazonUrl: string;
  coverAsset?: AssetId;
  klappentext: string;
  seiten?: number;
}

export interface Kapitel {
  id: number;
  bandId: BandId;
  titel: string;
  unterzeile: string;
  /** Seitenbereich im Buch – die Rückbindung an die Quelle. */
  seiten: [number, number];
}

/** Orte liegen bandübergreifend. Ein Ort aus Band 1 kann in Band 2 wiederkehren. */
export interface Ort {
  id: string;
  name: string;
  lat: number;
  lon: number;
  text: string;
  vorkommen: { bandId: BandId; kapitel: number; seiten: number[] }[];
  /** Zustände desselben Ortes im Zeitverlauf, z. B. frühe und späte Schicht. */
  zustaende?: string[];
}

export interface Objekt {
  id: string;
  name: string;
  bedeutung: string;
  vorkommen: { bandId: BandId; seiten: number[] }[];
}

export type AssetId = string;

export interface Asset {
  id: AssetId;
  /** Basisname ohne Endung; die Varianten erzeugt scripts/assets.mjs. */
  datei: string;
  breite: number;
  hoehe: number;
  alt: string;
  herkunft: Herkunft;
  /** Referenzbild für konsistente Nachgenerierungen desselben Ortes. */
  referenzFuer?: string;
}

/** Eine Tiefenebene eines 2.5D-Motivs: Bildausschnitt in Prozent der Bildhöhe. */
export interface Ebene {
  von: number;
  bis: number;
  /** Verschiebung relativ zur Scrollstrecke. 0 = unbewegt. */
  tempo: number;
  unschaerfe?: number;
}

export interface Kennzahl { wert: string; label: string; evidenz: Evidenz }
export interface Randnotiz { begriff: string; text: string; evidenz: Evidenz }

/** Eine Szene ist ein Datensatz, kein Bauteil. Die Engine rendert sie anhand von `typ`. */
export interface Szene {
  id: string;
  bandId: BandId;
  kapitelId?: number;
  unterkapitel?: string;
  typ: SzeneTyp;
  /** Quellseite im Buch. Pflicht bei allen Szenen mit Buchinhalt. */
  buchseite?: number;

  platte?: AssetId;
  ebenen?: Ebene[];
  /** Bewegtfassung des Motivs (VideoSlash). Das Standbild bleibt Poster und Rückfall. */
  motion?: AssetId;
  poster?: AssetId;

  /** Scrollhöhe des Abschnitts in svh. Steuert die Dauer der Kamerafahrt. */
  hoehe?: number;
  grading?: string;
  partikel?: 'funken' | 'staub';

  eyebrow?: string;
  titel?: string;
  unterzeile?: string;
  fliesstext?: string;
  zitat?: string;
  badge?: Herkunft;
  /** Die Zeile „Woher wir das wissen“ aus dem Buch. */
  quelle?: string;

  zahlen?: Kennzahl[];
  randnotizen?: Randnotiz[];

  /** Nur bei typ === 'interaktion'. */
  modul?: InteraktionsModul;

  ton?: 'feuer' | 'wasser' | 'wind';
  /** Übergang zur nächsten Szene – inhaltlich gewählt, nicht dekorativ. */
  /** Der Übergang gehört zur Szene, nicht zum System: Glut beim Feuer,
   *  Lichtschwenk in der Kammer, Brechung unter Wasser, Wischer im Sediment. */
  uebergang?: 'aufloesen' | 'glut' | 'lichtschwenk' | 'wasser' | 'sediment';
  /**
   * Kamerafahrt in dieser Szene. Sie folgt dem Inhalt: unter den Boden senkt sie
   * sich, über die Zikkurat steigt sie, in die Kammer fährt sie hinein.
   */
  fahrt?: 'hinein' | 'durchfahrt' | 'heraus' | 'schwenkLinks' | 'schwenkRechts'
        | 'aufsteigen' | 'absenken';
  /**
   * Kapitelschwelle. Der Eintritt in ein Kapitel ist ein Durchtritt, kein
   * Übergang: Die Kamera wird langsamer, das Nahe weicht stärker zur Seite,
   * und man sieht tiefer in das hinein, was dahinter liegt.
   */
  tor?: boolean;

  /** Aus den „IM ZUSAMMENHANG“-Kästen des Buches übernommen – nicht erfunden. */
  bezuege?: { vorher?: string; danach?: string; sieheAuch?: string[] };
}

export interface Band {
  buch: Buch;
  kapitel: Kapitel[];
  szenen: Szene[];
  assets: Asset[];
}
