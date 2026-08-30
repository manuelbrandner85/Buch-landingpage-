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
  | 'interaktion'
  // „Alles nur Zufall?“ spielt nicht in einer Landschaft, sondern in einem
  // Telefon. `eintauchen` ist der Weg hinein — die Kamera fährt in ein
  // ausgeschaltetes Gerät, bis der Bildschirm das Bild ist. `feed` ist, was
  // dann kommt: vierzig Behauptungen hintereinander, ohne Auflösung.
  | 'eintauchen' | 'feed';

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
  /**
   * Kaufen oder ausleihen. Ohne Angabe: kaufen.
   *
   * Eine Bibliothek ist kein Händler, und eine Ausleihe ist kein Angebot.
   * Der Unterschied ist nicht Wortklauberei: Ein `Offer` im Datenblatt sagt
   * Google, dass es hier etwas für Geld gibt. Bei einer Onleihe oder einem
   * Bibliotheksbestand stimmt das nicht, und eine falsche Auszeichnung kostet
   * die ganze Domain die Sonderdarstellung. Deshalb bekommt eine Ausleihe kein
   * Angebot, keinen Preis und auf der Seite ein anderes Wort.
   */
  art?: 'kauf' | 'ausleihe';
  /**
   * Die ISBN dieser Ausgabe – nicht des Buches: Taschenbuch und E-Book haben
   * je eine eigene. Solange ein Titel nur über Amazon läuft, gibt es sie
   * womöglich gar nicht (dort steht eine ASIN); dann bleibt das Feld leer.
   *
   * Sobald sie da ist, erscheint sie auf der Buchseite und im Datenblatt für
   * Suchmaschinen. Über die ISBN findet der Buchhandel den Titel – und Google
   * verbindet die Buchseite mit den Einträgen bei tolino, Thalia und allen
   * anderen.
   */
  isbn?: string;
  /** Preis in Euro, wenn er feststeht und überall derselbe ist. */
  preis?: number;
  /** Eine halbe Zeile, wenn der Weg eine Erklärung braucht. */
  hinweis?: string;
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
  /** Erscheinungsdatum, ISO. Steht im Datenblatt, sobald es feststeht. */
  erschienen?: string;
  coverAsset?: AssetId;
  klappentext: string;
  seiten?: number;
  /**
   * Wo ein noch nicht erschienener Band gerade steht.
   *
   * Hausregel 4 sagt: Angekündigt wird, was zu haben ist. Ein Datum steht
   * deshalb nirgends, solange keines feststeht — „demnächst“ ist ein
   * Versprechen, das niemand einlöst, und wer es dreimal liest, glaubt es
   * beim vierten Mal nicht mehr.
   *
   * Was stattdessen gesagt werden kann, ist die Wahrheit: wie weit der Band
   * ist. Das ist keine schwächere Auskunft, sondern eine stärkere — ein
   * fertig gesetzter Band, den es noch nicht zu kaufen gibt, ist
   * interessanter als ein „bald“. Und die Zeile bewegt sich, wenn die Arbeit
   * sich bewegt.
   *
   * `vom` ist Pflicht: Eine Standmeldung ohne Datum ist eine Behauptung.
   */
  stand?: Stand;
}

export interface Stand {
  /** Zwei bis vier Wörter, dort wo sonst der Kaufknopf steht. */
  kurz: string;
  /** Ein bis drei Sätze auf der Buchseite. Was fertig ist und was fehlt. */
  satz: string;
  /** Von wann die Auskunft ist, ISO. */
  vom: string;
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

// ——— „Alles nur Zufall?“ — der Feed —————————————————————————————————————

/**
 * Ein Kapitel des Buches, so weit die Welt davon zeigen darf.
 *
 * Die Grenze ist bewusst gezogen und sie ist eng: Was hier steht, ist der
 * Beitrag, mit dem ein Kapitel aufmacht — die Behauptung, so wie sie im Netz
 * steht. Was das Buch daraus macht, steht nicht hier. Kein Kapiteltext, keine
 * Kommentarspalte, kein Nachtrag, kein Steckbrief.
 *
 * Das ist keine Sparsamkeit, sondern der Sinn der Sache. Der Feed ist die
 * Behauptung ohne Auflösung; genau so trifft man sie auch sonst. Wer die
 * Auflösung will, hat zwei Wege: die Quellenseite unter /q/NN/, die ohnehin
 * öffentlich ist — oder das Buch.
 */
export interface Feedkapitel {
  nr: number;
  /** Die Kapitelüberschrift, wie im Inhaltsverzeichnis. */
  titel: string;
  unterzeile: string;
  /** Gedruckte Seite des Feed-Beitrags — die Rückbindung an die Quelle. */
  seite: number;
  /**
   * Das Konto. Mal mit Klammeraffe („@NoCurveHere"), mal ohne
   * („verborgene.welt.archiv") — das Buch setzt beide Formen, weil beide im
   * Netz vorkommen. Hier steht, was dort steht.
   */
  handle?: string;
  /** Die Bildunterschrift des Beitrags, im Wortlaut des Satzes. */
  caption: string;
  hashtags: string[];
  /**
   * Die Zahlen am rechten Rand, in der Reihenfolge des Satzes: Gefällt mir,
   * Kommentare, geteilt. Nicht jede Seite hat sie — dann bleibt die Liste
   * leer, und in der Welt steht dort nichts. Erfundene Zahlen zu erfundenen
   * Zahlen wären eine Lage zu viel.
   */
  zahlen: string[];
  /** Was hinter „Originalton —" steht: ein Konto, ein Geräusch, ein Spott. */
  ton?: string;
  /** „KI-generiert · Stimme synthetisch" — der Hinweis, den das Buch setzt. */
  kiHinweis?: boolean;
  /**
   * Sechs Zeilen aus der Kommentarspalte des Kapitels — nicht die Spalte.
   *
   * Sie ziehen in der Welt vorbei wie in einem Livestream. Dass sie erfunden
   * sind, sagt das Buch in seinem Vorwort und die Welt an sichtbarer Stelle:
   * „Die @-Konten gibt es nicht, die Kommentare sind von mir geschrieben, und
   * die Zahlen darunter sind ausgedacht."
   */
  kommentare?: { von: string; text: string }[];
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
