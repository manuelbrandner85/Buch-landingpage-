import type { Szene } from '../gemeinsam/typen';

/**
 * Band 3 als Daten.
 *
 * Die Auftaktmotive der Kapitel 12 bis 15 sind **die Bilder aus dem Satz des
 * Bandes** (`09_Produktion\Motive`, benannt nach ihrer Buchseite) – nicht
 * nachträglich erzeugte Entsprechungen. Für Kapitel 16 liegt das Motiv nicht
 * mehr vor; dort steht ein eigens erzeugtes Bild nach der Herkunftszeile des
 * Kapitels.
 * Titel, Leitfragen und Seitenbereiche sind gegen den gedruckten Umschlag des
 * Taschenbuchs geprüft und stimmen mit ihm überein.
 *
 * Alle fünf Kapitelbilanzen stammen aus dem Satz selbst, ebenso die
 * Herkunftszeilen der Auftakte. Die Seiten von Kapitel 14 und 15 trugen zwischen-
 * zeitlich den Inhalt von Band 2; nach dem Neubau der Druckdatei am 25.08.2026
 * sind sie nachgelesen und hier eingetragen (Seiten 82, 116, 117 und 151).
 */
export const SZENEN_BAND_3: Szene[] = [
  {
    id: 'kapitel-12', bandId: 'band-3', kapitelId: 12, typ: 'auftakt', tor: true,
    platte: 'b3-kap12-auftakt', motion: 'b3-kap12-auftakt',
    buchseite: 12, hoehe: 196, grading: '#4a425c',
    uebergang: 'aufloesen', fahrt: 'hinein',
    titel: 'Krieg, Maschine und\nMassengesellschaft',
    unterzeile: 'Was geschieht, wenn die Ordnung der Fabrik die Fabrik verlässt',
    quelle: 'Maschinenhalle mit Transmission. Freie Rekonstruktion.',
  },
  {
    id: 'der-mann-mit-der-stoppuhr', bandId: 'band-3', kapitelId: 12, unterkapitel: '12.1', typ: 'motiv',
    platte: 'b3-kap12-stoppuhr', buchseite: 16, hoehe: 268, grading: '#4a425c',
    uebergang: 'aufloesen', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Die Uhr verlässt die Fabrik',
    titel: 'Der Mann\nmit der Stoppuhr',
    unterzeile: 'Eine berühmte Geschichte und ihre Aktenlage',
    fliesstext:
      'Das berühmteste Beispiel darin handelt von einem Arbeiter, der Roheisen verlädt. Es wird bis heute in Lehrbüchern zitiert. Es ist auch nachgeprüft worden – und das Ergebnis der Prüfung steht seltener in den Lehrbüchern.',
    // Die Tabelle des Buches, Zeile für Zeile. `grad` ist das Wort, das im Satz
    // steht; `evidenz` ist nur die Stelle auf der Skala des Reglers.
    belege: [
      { aussage: 'Ein Arbeiter steigerte seine Leistung von 12,5 auf 47 Tonnen am Tag',
        beleglage: 'Taylors eigene Darstellung, keine unabhängige Messung',
        grad: 'Starke Indizien', evidenz: 'B' },
      { aussage: 'Sein Lohn stieg dabei um rund sechzig Prozent',
        beleglage: 'Taylors Angabe: von 1,15 auf 1,85 Dollar am Tag',
        grad: 'Starke Indizien', evidenz: 'B' },
      { aussage: 'Der Arbeiter hieß Schmidt',
        beleglage: 'Deckname; die Person ist unter anderem Namen belegt',
        grad: 'Widerlegt', evidenz: 'G' },
      { aussage: 'Die Versuche belegen Taylors allgemeine Grundsätze',
        beleglage: 'Prüfung von 1974: unzulässig verallgemeinert',
        grad: 'Umstritten', evidenz: 'E' },
      { aussage: 'Das Buch von 1911 prägte die Betriebsführung weltweit',
        beleglage: 'Übersetzungen, Lehrpläne, Betriebsanweisungen',
        grad: 'Gesicherter Befund', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Die Stoppuhr', text: 'Sie misst nicht, wie lange etwas dauert. Sie misst, wie lange es dauern darf.' },
    ],
    quelle: 'Seite 16, wörtlich: Taylors eigene Darstellung, 1974 nachgeprüft. Stoppuhr auf einem Schreibtisch, freie Rekonstruktion.',
  },
  {
    id: 'zweitausend-zuege', bandId: 'band-3', kapitelId: 12, unterkapitel: '12.2', typ: 'motiv',
    platte: 'b3-kap12-motiv', motion: 'b3-kap12-motiv', buchseite: 22, hoehe: 262, grading: '#4a425c',
    uebergang: 'aufloesen', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Der Fahrplan',
    titel: 'Zweitausendeinhundert-\nfünfzig Züge',
    unterzeile: 'Der Aufmarsch in Zahlen',
    fliesstext:
      'Solche Zahlen sind schwer vorstellbar, und genau darin liegt ihre Wirkung. Ein Zug alle zehn Minuten über eine Brücke ist keine militärische Leistung mehr, sondern eine betriebstechnische. Sie setzt voraus, dass jede Weiche, jeder Wasserkran und jede Ablösung im Voraus eingeplant ist.',
    zahlen: [
      { wert: '2.150', label: 'Züge überquerten zwischen dem 2. und 8. August eine einzige Rheinbrücke', evidenz: 'C' },
      { wert: 'rund 2 Mio.', label: 'Menschen wurden in denselben Tagen im Westen befördert', evidenz: 'C' },
      { wert: 'rund 400.000', label: 'Tonnen Gerät und Vorräte kamen hinzu', evidenz: 'C' },
      { wert: 'etwa 7', label: 'Tage brauchte ein Korps bis zur Einsatzbereitschaft', evidenz: 'C' },
    ],
    // Ohne Stufe: Der Band gibt für diese vier Punkte keine an, und eine zu
    // erfinden wäre schlimmer, als sie stehen zu lassen.
    randnotizen: [
      { begriff: 'Rechnen', text: 'Jeder Zug hat Strecke, Uhrzeit und Ziel.' },
      { begriff: 'Verketten', text: 'Jeder Zug blockiert die Strecke für den nächsten.' },
      { begriff: 'Auffüllen', text: 'Lücken lassen sich nicht nachträglich schließen.' },
      { begriff: 'Umstellen', text: 'Eine Änderung betrifft nicht einen Zug, sondern alle.' },
    ],
    quelle: 'Seite 22, wörtlich. Die Zahlen stammen aus der Aufmarschliteratur, eine amtliche oder archivalische Quelle war für das Buch nicht erreichbar – deshalb Stufe C und nicht B. Stellwerk an einer Bahnstrecke, freie Rekonstruktion.',
  },
  {
    id: 'faden-12', bandId: 'band-3', kapitelId: 12, typ: 'papier', buchseite: 46,
    titel: 'Der unsichtbare Faden in Kapitel 12',
    zitat: 'Was in der Fabrik erfunden wurde, um Arbeit zu messen, hat binnen dreißig Jahren gemessen, wer jemand ist.',
    quelle: 'Bilanz zu Kapitel 12: Zeitmessung, Meldewesen und Statistik – die Verwaltung lernt im Krieg, was sie danach behält.',
  },
  {
    id: 'kapitel-13', bandId: 'band-3', kapitelId: 13, typ: 'auftakt', tor: true,
    platte: 'b3-kap13-auftakt', motion: 'b3-kap13-auftakt',
    buchseite: 47, hoehe: 196, grading: '#603a38',
    uebergang: 'glut', fahrt: 'absenken',
    titel: 'Krise, Ideologie\nund Zusammenbruch',
    unterzeile: 'Warum eine Ordnung zusammenbricht, die auf dem Papier funktioniert',
    quelle: 'Leere Schalterhalle. Freie Rekonstruktion.',
  },
  {
    id: 'der-zettel-an-der-tuer', bandId: 'band-3', kapitelId: 13, typ: 'motiv',
    platte: 'b3-kap13-motiv', motion: 'b3-kap13-motiv', buchseite: 48, hoehe: 262, grading: '#603a38',
    uebergang: 'aufloesen', fahrt: 'hinein', partikel: 'staub',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Was Sie in diesem Kapitel erwartet',
    titel: 'Ein geschlossener Laden\nim Winter',
    unterzeile: 'Der Zettel an der Tür ist das Dokument dieses Kapitels',
    fliesstext:
      'Es erklärt nicht mit einer Ursache. Wo die Forschung streitet, steht der Streit im Buch und wird nicht aufgelöst. Und 13.3 behandelt einen Gegenstand, bei dem die Genauigkeit nicht Stilfrage ist, sondern Pflicht: Dort steht kein Satz ohne Beleg.',
    quelle: 'Kapitelvorschau auf Seite 48, wörtlich. Geschlossener Laden, freie Rekonstruktion.',
  },
  {
    id: 'faden-13', bandId: 'band-3', kapitelId: 13, typ: 'papier', buchseite: 81,
    titel: 'Der unsichtbare Faden in Kapitel 13',
    zitat: 'Keines der Werkzeuge dieses Kapitels wurde für das erfunden, wofür es gebraucht wurde. Genau das ist der Faden.',
    quelle: 'Bilanz zu Kapitel 13: Währungsordnung, Zustimmung und Verwaltung – geprüft an dem, was die Akten hergeben.',
  },
  {
    id: 'kapitel-14', bandId: 'band-3', kapitelId: 14, typ: 'auftakt', tor: true,
    platte: 'b3-kap14-auftakt', motion: 'b3-kap14-auftakt',
    buchseite: 82, hoehe: 196, grading: '#38545a',
    uebergang: 'aufloesen', fahrt: 'schwenkRechts',
    titel: 'Vertrag, Dollar\nund Blöcke',
    unterzeile: 'Wer schreibt die Regeln, wenn eine Welt neu geordnet wird',
    quelle: 'Leerer Konferenzsaal. Freie Rekonstruktion.',
  },
  {
    id: 'ein-hotel-in-new-hampshire', bandId: 'band-3', kapitelId: 14, unterkapitel: '14.1', typ: 'motiv',
    platte: 'b3-kap14-motiv', motion: 'b3-kap14-motiv', buchseite: 84, hoehe: 262, grading: '#38545a',
    uebergang: 'lichtschwenk', fahrt: 'heraus',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Ein Hotel in New Hampshire',
    titel: 'Wie der Dollar\nin die Mitte kam',
    unterzeile: 'Vierundvierzig Staaten, siebenhundertdreißig Delegierte, drei Wochen',
    fliesstext:
      'In diesen Wochen trafen sich im Mount Washington Hotel in Bretton Woods, New Hampshire, Delegationen aus vierundvierzig Staaten – siebenhundertdreißig Personen – zur Währungs- und Finanzkonferenz der Vereinten Nationen. Verhandelt wurde nicht über den Krieg, sondern über die Zeit danach: wie Geld zwischen Staaten fließen soll, wenn wieder Handel möglich ist.',
    zahlen: [
      { wert: '44', label: 'Staaten waren vertreten', evidenz: 'A' },
      { wert: '730', label: 'Delegierte kamen zusammen', evidenz: 'A' },
      { wert: '35 $', label: 'je Unze Gold – der Anker des Systems', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Parität', text: 'Der amtlich festgelegte Wert einer Währung gegenüber einer anderen. Er darf sich bewegen, aber nur innerhalb eines engen Bandes.' },
      { begriff: 'Konvertibilität', text: 'Die Zusage, eine Währung jederzeit in eine andere – oder in Gold – zu tauschen. Sie ist der Kern des ganzen Systems.' },
      { begriff: 'Bancor', text: 'Der Name für eine reine Verrechnungswährung, die keinem Staat gehören sollte. Sie blieb ein Entwurf.' },
    ],
    quelle: 'Seite 84, wörtlich. Konferenzunterlagen und Abkommenstext – der genaueste Belegtyp dieses Bandes. Das Ferienhotel in den Bergen: freie Rekonstruktion.',
  },
  {
    id: 'faden-14', bandId: 'band-3', kapitelId: 14, typ: 'papier', buchseite: 116,
    titel: 'Der unsichtbare Faden in Kapitel 14',
    zitat: 'Jede dieser vier Ordnungen wurde von denen geschrieben, die sie durchsetzen konnten. Genau das ist ihre Stärke und ihre Grenze.',
    quelle: 'Kapitelbilanz zu Kapitel 14: vier Ordnungen von 1944 und 1945, geprüft an Vertragstext, Charta und Abstimmungsverhalten.',
  },
  {
    id: 'kapitel-15', bandId: 'band-3', kapitelId: 15, typ: 'auftakt', tor: true,
    platte: 'b3-kap15-auftakt', motion: 'b3-kap15-auftakt',
    buchseite: 117, hoehe: 196, grading: '#564a2e',
    uebergang: 'aufloesen', fahrt: 'durchfahrt',
    titel: 'Öl, Container\nund Konzerne',
    unterzeile: 'Wem gehört eine Ordnung, die niemand beschlossen hat',
    quelle: 'Containerterminal. Freie Rekonstruktion.',
  },
  {
    id: 'portalkran-am-leeren-kai', bandId: 'band-3', kapitelId: 15, typ: 'motiv',
    platte: 'b3-kap15-motiv', motion: 'b3-kap15-motiv', buchseite: 118, hoehe: 262, grading: '#564a2e',
    uebergang: 'aufloesen', fahrt: 'hinein',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Was Sie in diesem Kapitel erwartet',
    titel: 'Ein Portalkran\nüber einem leeren Kai',
    unterzeile: 'Diese Ordnung ist nirgends beschlossen worden',
    fliesstext:
      'Kapitel 14 handelte von Ordnungen, die jemand unterschrieben hat. Dieses handelt von Ordnungen, die niemand beschlossen hat: ein Preis, ein Maß, eine Rechtsform. Sie sind deshalb nicht weniger verbindlich – im Gegenteil. Gegen einen Vertrag kann man stimmen. Gegen ein Maß, an das sich alle halten, kann man nur verlieren.',
    quelle: 'Kapitelvorschau auf Seite 118, wörtlich. Portalkran am Kai, freie Rekonstruktion.',
  },
  {
    id: 'faden-15', bandId: 'band-3', kapitelId: 15, typ: 'papier', buchseite: 151,
    titel: 'Der unsichtbare Faden in Kapitel 15',
    zitat: 'Über keine dieser fünf Ordnungen ist je abgestimmt worden. Vier davon gelten bis heute – und das ist der unbequemste Befund dieses Bandes.',
    quelle: 'Kapitelbilanz zu Kapitel 15: fünf Ordnungen von 1961 bis 1991, geprüft an Normen, Notenbankdarstellung und Verfahrenszahlen.',
  },
  {
    id: 'kapitel-16', bandId: 'band-3', kapitelId: 16, typ: 'auftakt', tor: true,
    platte: 'b3-kap16-auftakt', motion: 'b3-kap16-auftakt',
    buchseite: 152, hoehe: 196, grading: '#304668',
    uebergang: 'wasser', fahrt: 'hinein',
    titel: 'Kabel, Daten\nund Abhängigkeit',
    unterzeile: 'Das Netz ist kein Ort. Es ist ein Bauwerk mit sehr wenigen Engstellen',
    quelle: 'Kabelregister und Betreiberangaben. Kabelanlandung an einer Nordküste, freie Rekonstruktion.',
  },
  {
    id: 'gasse-zwischen-schraenken', bandId: 'band-3', kapitelId: 16, typ: 'motiv',
    platte: 'b3-kap16-motiv', motion: 'b3-kap16-motiv', buchseite: 153, hoehe: 236, grading: '#304668',
    uebergang: 'wasser', fahrt: 'durchfahrt',
    badge: 'Freie Rekonstruktion',
    eyebrow: 'Was Sie in diesem Kapitel erwartet',
    titel: 'Eine Gasse zwischen\nzwei Reihen Schränken',
    unterzeile: 'Was hier steht, gehört selten dem, der es benutzt',
    fliesstext:
      'Wissen ist überall in Sekunden erreichbar, eine Nachricht kostet nichts mehr, Waren finden ihren Weg ohne Umweg. Nötig dafür sind ein Bauwerk aus Kabeln, Strom und Kühlung, Regeln, die wenige schreiben und viele befolgen – und die Annahme, dass nichts davon ausfällt.',
    quelle: 'Kapitelvorschau auf Seite 153. Rechenzentrum, Innenansicht, freie Rekonstruktion.',
  },
  {
    id: 'faden-16', bandId: 'band-3', kapitelId: 16, typ: 'papier', buchseite: 186,
    titel: 'Der unsichtbare Faden in Kapitel 16',
    zitat: 'Was global wirkt, ist örtlich gebaut. Und wo etwas gebaut ist, gibt es eine Stelle, an der es eng wird.',
    quelle: 'Bilanz zu Kapitel 16 und Schluss der Reihe: fünf Erleichterungen aus zwölftausend Jahren – Vorrat, Schrift, Geld, Fabrik, Netz.',
  },
  // --------------------------------------------------------------- Karte
  {
    id: 'karte-band-3', bandId: 'band-3', typ: 'karte',
    titel: 'Die Welt dieses Bandes',
    fliesstext:
      'Jeder Punkt ist ein Ort, an dem dieser Band etwas belegt – von der Magellanstraße bis zur Luzonstraße. Am Ende stehen die Engstellen: fünf Meerengen, durch die der Welthandel passt.',
  },

  // Der Abschluss dieser Welt zeigt diesen Band – und nur ihn.
  { id: 'abschluss-band-3', bandId: 'band-3', typ: 'buecher' },
];
