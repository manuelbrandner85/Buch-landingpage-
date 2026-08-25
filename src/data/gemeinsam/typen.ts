/**
 * Das Weltmodell.
 *
 * Es beschreibt ein Haus, keine Reihe: Über den Bänden steht die `Reihe`, über
 * den Reihen steht Trendonix. Ein neues Buch fügt Daten hinzu – niemals neue
 * Typen. Eine neue Reihe fügt eine Reihe hinzu und wird in `world/registry.ts`
 * eingehängt; die Engine merkt davon nichts.
 */

/**
 * Der Kurzname einer Reihe, wie er in der Adresse steht: `/faeden/kapitel/7`.
 * Bewusst offen und nicht als Union geschlossen – sonst wäre jede neue Reihe
 * eine Typänderung, und genau das soll sie nicht sein.
 */
export type ReiheId = string;

/**
 * Der Kurzname eines Bandes. Die drei Bände der Fäden heißen aus historischen
 * Gründen `band-1` bis `band-3` – so heißen ihre Bild- und Videoordner unter
 * `public/assets/`. Neue Reihen benennen ihre Bände nach sich selbst
 * (`symbole-1`), damit die Ordner eindeutig bleiben.
 */
export type BandId = string;

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

/**
 * Sechs Typen. Ein siebter hieß `cover` und legte den abfotografierten Umschlag
 * über die volle Fläche – überflüssig, seit der Band als Körper im Raum steht.
 */
export type SzeneTyp =
  | 'ankunft' | 'auftakt' | 'motiv' | 'papier' | 'karte' | 'buecher'
  | 'interaktion';

/** Interaktive Module: Argumente, die man nur begreift, wenn man sie bedient. */
export type InteraktionsModul = 'ringe' | 'denar' | 'laufzeit' | 'pruefung';

/**
 * Ein Weg, das Buch zu kaufen. Mehrzahl, weil ein Titel selten nur einen hat:
 * Taschenbuch und E-Book liegen bei verschiedenen Händlern, und der Buchhandel
 * kommt später dazu. Eine leere Liste heißt: es gibt noch nichts zu kaufen –
 * niemals einen erfundenen Link.
 */
export interface Kaufweg {
  haendler: string;
  form: 'Taschenbuch' | 'Gebunden' | 'E-Book' | 'Hörbuch';
  url: string;
}

export interface Buch {
  id: BandId;
  /** Zu welcher Reihe der Band gehört. */
  reiheId: ReiheId;
  /** Die Zählung innerhalb der Reihe, nicht im Haus. */
  nummer: number;
  titel: string;
  unterzeile?: string;
  /**
   * Drei Zustände, weil die Reihe drei hat:
   *  · `erschienen` – im Handel, die Welt ist offen, es gibt etwas zu kaufen
   *  · `erscheint`  – fertig gesetzt, die Welt ist offen, aber noch kein Kauf
   *  · `in Arbeit`  – nicht öffentlich; der Band steht in den Daten und schweigt
   */
  status: 'erschienen' | 'erscheint' | 'in Arbeit';
  /** Leer, solange keine Produktseite existiert. Niemals erfundene URLs. */
  kaufwege: Kaufweg[];
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
  /** Ohne Angabe Band 1 – die Motive liegen unter public/assets/<band>/szenen/. */
  bandId?: BandId;
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

/**
 * `evidenz` ist freiwillig: Nur wo das Buch einen Grad angibt, steht hier einer.
 * Eine Angabe ohne Grad wird vom Regler nicht angefasst – sie zurücktreten zu
 * lassen, weil man ihre Beleglage nicht kennt, wäre eine Behauptung für sich.
 */
export interface Kennzahl { wert: string; label: string; evidenz?: Evidenz }
export interface Randnotiz { begriff: string; text: string; evidenz?: Evidenz }

/**
 * Eine Zeile aus einer Belegtabelle des Buches.
 *
 * Die Bände prüfen berühmte Aussagen zeilenweise und schreiben den Grad dazu –
 * mit Worten, nicht mit Buchstaben: „Gesicherter Befund“, „Starke Indizien“,
 * „Umstritten“, „Widerlegt“. Genau diese Worte stehen hier in `grad`; sie sind
 * die Angabe des Buches und werden auch so angezeigt.
 *
 * `evidenz` ist etwas anderes: die Position auf der Skala des Reglers. Sie ist
 * eine Einordnung dieser Seite, keine Angabe des Buches – deshalb steht sie
 * daneben und nicht anstelle von `grad`.
 */
export interface Beleg {
  aussage: string;
  beleglage: string;
  grad: string;
  evidenz?: Evidenz;
}

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
  /** Eine Belegtabelle aus dem Buch: Aussage, Beleglage, Grad. */
  belege?: Beleg[];

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

/**
 * Eine Reihe ist eine Welt, die man betreten kann – und die Einheit, in der
 * gezählt wird. Kapitelnummern gelten innerhalb einer Reihe, nicht darüber
 * hinaus: Auch das erste Kapitel einer zweiten Reihe darf die Eins tragen.
 *
 * Was eine Reihe nicht vorschreibt, ist ihr Aufbau. Die Fäden haben eine
 * Weltkarte, weil sie Orte haben. Eine Reihe über Zeichen hätte keine – sie
 * hätte dann einfach keine `karte`-Szene. Szenen sind Daten; ein Aufbau, der
 * fehlt, ist kein Sonderfall, sondern eine Zeile weniger.
 */
export interface Reihe {
  id: ReiheId;
  /** Der Reihentitel ohne Bandangabe: „Die Unsichtbaren Fäden“. */
  titel: string;
  unterzeile?: string;
  /** Der Satz an der Schwelle, der zum Eintreten bewegt. Aus dem Buch, nicht erfunden. */
  einladung: string;
  /** Die Leitfarbe der Reihe – das, was sie im Haus unterscheidbar macht. */
  signatur: string;
  /** Das Motiv, mit dem die Reihe im Haus auftritt. Bewegtfassung, wenn vorhanden. */
  hausmotiv?: AssetId;
  baende: Band[];
}
