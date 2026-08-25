import type { Szene } from '../gemeinsam/typen';

/**
 * Die Reise durch Band 1. Reihenfolge = Dramaturgie.
 * Jede Szene nennt ihre Buchseite; `bezuege` stammt aus den
 * „IM ZUSAMMENHANG“-Kästen des Buches und ist nicht erfunden.
 */
export const SZENEN_BAND_1: Szene[] = [
  {
    // Die Schwelle.
    //
    // Hier stand bis zuletzt der abfotografierte Umschlag über die volle Fläche.
    // Ein Bild eines Buches ist aber kein Buch – und der gebundene Band steht
    // eine Szene weiter ohnehin als Körper im Raum, von allen Seiten. Was den
    // Eintritt trägt, ist Dunkelheit, ein Lichtpunkt und der Name.
    id: 'ankunft', bandId: 'band-1', typ: 'ankunft',
    titel: 'Die Unsichtbaren Fäden',
    unterzeile: 'Ursprung und Ordnung',
    fliesstext: 'Vom ersten Feuer bis zu den ersten Reichen.',
  },
  {
    // Die Wahl steht vor der Reise: Wer nur einen Band will, muss ihn nicht suchen.
    // Derselbe Bauteil wie am Schluss, nur mit anderem Auftritt.
    id: 'welten', bandId: 'band-1', typ: 'buecher',
  },
  {
    id: 'kapitel-1', bandId: 'band-1', kapitelId: 1, typ: 'auftakt', tor: true,
    platte: 'graben', motion: 'graben', buchseite: 12, hoehe: 202, grading: '#3d2f2a',
    uebergang: 'aufloesen', fahrt: 'hinein',
    titel: 'Feuer, Sprache\nund Wanderung',
    unterzeile: 'Wie Kooperation zum Überlebensvorteil wurde',
    quelle: 'Landschaftsaufnahme des Ostafrikanischen Grabens, des geologischen Rahmens dieses Kapitels.',
  },
  {
    id: 'grabung', bandId: 'band-1', kapitelId: 1, unterkapitel: '1.1', typ: 'motiv',
    platte: 'grabung', motion: 'grabung', buchseite: 15, hoehe: 270, grading: '#4a3a24',
    uebergang: 'sediment', fahrt: 'hinein',
    partikel: 'staub', badge: 'Gesicherter Befund',
    eyebrow: 'Eine lange Menschwerdung',
    titel: 'Woher die Zahlen kommen',
    unterzeile: 'Wie ein Fund sein Alter bekommt',
    fliesstext:
      'Kein Knochen trägt sein Alter in sich. Datiert wird meist nicht der Fund selbst, sondern das Gestein um ihn herum – und das funktioniert nur, wenn er ungestört in seiner Schicht lag. Deshalb ist die Fundlage oft wichtiger als der Fund.',
    zahlen: [
      { wert: '50.000', label: 'Jahre reicht die Radiokarbonmethode zurück – für die Menschwerdung viel zu wenig', evidenz: 'A' },
      { wert: '3', label: 'Verfahren im Vergleich: Radiokarbon, Argon-Argon, Paläomagnetik', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'In situ', text: 'Lateinisch für „an Ort und Stelle“. Ein Fund, der unverlagert in seiner Schicht liegt, ist datierbar.', evidenz: 'A' },
      { begriff: 'Stratigrafie', text: 'Die Abfolge der Erdschichten. Was unten liegt, ist in der Regel älter als das darüber.', evidenz: 'A' },
      { begriff: 'Einzelnes Streufundstück', text: 'Alter praktisch nicht bestimmbar.', evidenz: 'G' },
    ],
    quelle: 'Grabungsdokumentation und physikalische Messverfahren an Gestein und organischem Material.',
  },
  {
    id: 'feuerkreis', bandId: 'band-1', kapitelId: 1, unterkapitel: '1.3', typ: 'motiv',
    platte: 'feuerkreis', motion: 'feuerkreis', buchseite: 27, hoehe: 284, grading: '#2a1a10',
    uebergang: 'glut', fahrt: 'hinein',
    partikel: 'funken', ton: 'feuer', badge: 'Freie Rekonstruktion',
    eyebrow: 'Das Feuer als sozialer Mittelpunkt',
    titel: 'Ein Kreis aus Licht',
    unterzeile: 'Was sich ändert, wenn die Nacht nicht mehr leer ist',
    fliesstext:
      'Am Feuer entsteht etwas, das es vorher nicht gab: eine Zeit ohne Aufgabe. Was Menschen in diesen Stunden taten, lässt sich nicht ausgraben – dass sie sie hatten, schon.',
    zahlen: [
      { wert: '400.000', label: 'Jahre vor heute gilt regelmäßiger Feuergebrauch als gesichert', evidenz: 'A' },
      { wert: '4–5', label: 'Stunden Tageslicht gewinnt eine Gruppe durch Feuer', evidenz: 'B' },
      { wert: '700 °C', label: 'erreicht ein offenes Holzfeuer', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Zeit', text: 'Der nutzbare Tag verlängert sich um mehrere Stunden. Sie sind nicht zum Arbeiten geeignet, aber zum Reden.', evidenz: 'B' },
      { begriff: 'Sicherheit', text: 'Raubtiere meiden offenes Feuer. Der Schlafplatz muss nicht mehr in engen Spalten liegen.', evidenz: 'B' },
      { begriff: 'Wonderwerk', text: 'Feuerbelege aus rund einer Million Jahren – fachlich umstritten.', evidenz: 'E' },
    ],
    quelle: 'Datierte Fundplätze mit Feuerbelegen, nach Belegdichte gestaffelt.',
    bezuege: { vorher: 'werkzeug-und-planung', danach: 'sprache-und-vertrauen' },
  },
  {
    id: 'faden-1', bandId: 'band-1', kapitelId: 1, typ: 'papier', buchseite: 39,
    titel: 'Der unsichtbare Faden in Kapitel 1',
    zitat: 'Was am Ende durchsetzungsfähig war, saß nicht im Schädel eines Einzelnen, sondern zwischen den Menschen.',
    quelle: 'Bilanz zu Kapitel 1: Kooperation als Fähigkeit, nicht als Tugend.',
  },
  {
    id: 'kapitel-2', bandId: 'band-1', kapitelId: 2, typ: 'auftakt', tor: true,
    platte: 'kapitel-2-auftakt', motion: 'kapitel-2-auftakt', buchseite: 40, hoehe: 196, grading: '#332a20',
    uebergang: 'aufloesen', fahrt: 'schwenkRechts',
    titel: 'Saat, Besitz\nund Hierarchie',
    unterzeile: 'Wie aus Vorrat die Frage nach Eigentum wurde',
    quelle: 'Kapitelauftakt: reifes Getreide auf einem Hang – der Ausgangspunkt der Sesshaftigkeit.',
  },
  {
    id: 'kulturfeld', bandId: 'band-1', kapitelId: 2, unterkapitel: '2.1', typ: 'motiv',
    platte: 'kulturfeld', motion: 'kulturfeld', buchseite: 50, hoehe: 256, grading: '#4a3a1e',
    uebergang: 'aufloesen', fahrt: 'aufsteigen',
    badge: 'Freie Rekonstruktion', eyebrow: 'Sesshaftigkeit und Landwirtschaft',
    titel: 'Vom Sammeln zur bewussten Pflege',
    unterzeile: 'Ein Kulturfeld heute, über der stillen Erhebung eines Siedlungshügels aus jener Zeit',
    fliesstext:
      'Sesshaftigkeit ging dem Ackerbau vielerorts voraus: Zuerst standen die Speicher, dann kamen die Felder. Die acht Gründerkulturen breiteten sich danach als Paket aus.',
    zahlen: [
      { wert: '8', label: 'domestizierte Gründerkulturen breiteten sich gemeinsam aus', evidenz: 'A' },
      { wert: '13.200', label: 'Jahre vor heute: früheste Anbauversuche – umstritten', evidenz: 'E' },
      { wert: '9.500', label: 'Jahre vor heute: Landwirtschaft als gesicherte Grundlage', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Domestikation', text: 'Genetisch nachweisbar und datierbar – anders als die Frage nach dem Warum.', evidenz: 'A' },
      { begriff: 'Reihenfolge', text: 'Die ersten Speicher stehen vor den ersten Feldern.', evidenz: 'B' },
    ],
    quelle: 'Vergleich von Baubefunden aus mehreren Jahrtausenden an verschiedenen Fundplätzen.',
  },
  {
    id: 'unter-dem-boden', bandId: 'band-1', kapitelId: 2, unterkapitel: '2.4', typ: 'motiv',
    platte: 'catalhoeyuek-innen', motion: 'catalhoeyuek-innen', buchseite: 66, hoehe: 256, grading: '#3a2a1c',
    uebergang: 'lichtschwenk', fahrt: 'absenken',
    badge: 'Freie Rekonstruktion', eyebrow: 'Stadtentstehung und soziale Schichtung',
    titel: 'Unter dem Boden',
    unterzeile: 'Das Leben eines Hauses, von der Gründung bis zur Aufgabe',
    fliesstext:
      'Die Toten kommen unter den Boden: Erwachsene unter die Plattformen im Norden, Kleinkinder im Süden bei Herd und Ofen. Nach sechzig bis neunzig Jahren wird das Haus ausgeräumt, verfällt und planiert. Darüber beginnt das nächste.',
    zahlen: [
      { wert: '62', label: 'Tote fanden sich in Haus 1 – der höchste bekannte Wert', evidenz: 'A' },
      { wert: '60–90', label: 'Jahre dauerte der Lebenslauf eines Hauses', evidenz: 'B' },
    ],
    randnotizen: [
      { begriff: 'Geschichtshaus', text: 'Hodders Begriff für Häuser mit auffällig vielen Bestattungen und reicher Ausstattung.', evidenz: 'C' },
      { begriff: 'Der unsichtbare Faden', text: 'Die gemeinsam Bestatteten waren häufig nicht miteinander verwandt. Die erste Ungleichheit war keine des Besitzes, sondern der Zugehörigkeit.', evidenz: 'B' },
    ],
    quelle: 'Grabungsbefunde aus Çatalhöyük, Bestattungen je Haus.',
  },
  {
    id: 'faden-2', bandId: 'band-1', kapitelId: 2, typ: 'papier', buchseite: 70,
    titel: 'Der unsichtbare Faden in Kapitel 2',
    zitat: 'Nicht der Überschuss schuf die Herrschaft, sondern die Frage, wer über ihn verfügt.',
    quelle: 'Bilanz zu Kapitel 2: Aus Überschuss wird Speicher, aus Speicher werden Regeln, aus Regeln wird Verwaltung.',
  },
  {
    id: 'kapitel-3', bandId: 'band-1', kapitelId: 3, typ: 'auftakt', tor: true,
    platte: 'kapitel-3-auftakt', motion: 'kapitel-3-auftakt', buchseite: 72, hoehe: 196, grading: '#332a20',
    uebergang: 'aufloesen', fahrt: 'aufsteigen',
    titel: 'Reiche, Glaube\nund Macht',
    unterzeile: 'Wie Herrschaft sich auf das Unprüfbare berief',
    quelle: 'Kapitelauftakt: eine Zikkurat – der baulich abgegrenzte Raum vor dem Herrscher.',
  },
  {
    id: 'bibliothek', bandId: 'band-1', kapitelId: 3, unterkapitel: '3.3', typ: 'motiv',
    platte: 'bibliothek', motion: 'bibliothek', buchseite: 91, hoehe: 270, grading: '#2f2415',
    uebergang: 'lichtschwenk', fahrt: 'schwenkLinks',
    partikel: 'staub', badge: 'Freie Rekonstruktion',
    eyebrow: 'Schrift und Wissen als Machtinstrument',
    titel: 'Die erste geordnete Bibliothek',
    unterzeile: 'Gesammeltes Wissen und wer es lesen durfte',
    fliesstext:
      'Assurbanipal ließ Keilschrifttexte aus dem gesamten Reich zusammentragen und in Ninive systematisch ordnen – die erste planmäßig angelegte Bibliothek des Alten Orients und zugleich ein Machtinstrument. Wer das Wissen an einem Ort versammelt, entscheidet, wer Zugang dazu hat.',
    zahlen: [
      { wert: '612 v. Chr.', label: 'brannte die Bibliothek beim Untergang Ninives – die Tontafeln wurden dadurch hart gebrannt und haltbar', evidenz: 'A' },
      { wert: '1850', label: 'begann die Ausgrabung der Bibliothek', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Assurbanipal', text: 'Assyrischer König. Einer von zwei Herrschern, für die Schreibkundigkeit belegt ist.', evidenz: 'B' },
      { begriff: 'Was der Brand bewahrte', text: 'Ein erheblicher Teil dessen, was wir über Mesopotamien wissen, verdankt sich diesem Untergang.', evidenz: 'A' },
    ],
    quelle: 'Grabungsbefunde aus Ninive und die dort geborgenen Tafelbestände.',
  },
  {
    id: 'faden-3', bandId: 'band-1', kapitelId: 3, typ: 'papier', buchseite: 98,
    titel: 'Der unsichtbare Faden in Kapitel 3',
    zitat: 'Alle drei verknüpfen Menschen über eine Distanz hinweg, die persönliche Kontrolle unmöglich macht.',
    quelle: 'Bilanz zu Kapitel 3: eine Begründung, die niemand prüfen kann, eine Schrift, die nur wenige lesen, ein Handelsnetz, das kein Einzelner überblickt.',
  },
  {
    id: 'kapitel-4', bandId: 'band-1', kapitelId: 4, typ: 'auftakt', tor: true,
    platte: 'kapitel-4-auftakt', motion: 'kapitel-4-auftakt', buchseite: 99, hoehe: 196, grading: '#332a20',
    uebergang: 'aufloesen', fahrt: 'hinein',
    titel: 'Krieg, Könige\nund Geheimbünde',
    unterzeile: 'Ein Reich ist größer als der Blick eines Menschen',
    quelle: 'Kapitelauftakt: Torbau und Säulen – ein Reich zeigt sich selbst.',
  },
  {
    id: 'koenigsstrasse', bandId: 'band-1', kapitelId: 4, unterkapitel: '4.1', typ: 'motiv',
    platte: 'wechselstation', motion: 'wechselstation', buchseite: 101, hoehe: 270, grading: '#4a3418',
    uebergang: 'aufloesen', fahrt: 'schwenkRechts',
    badge: 'Freie Rekonstruktion', eyebrow: 'Persien und Griechenland',
    titel: 'Neun Tage statt neunzig',
    unterzeile: 'Die Königsstraße als Nachrichtensystem',
    fliesstext:
      'Das Perserreich reichte vom Indus bis an die Ägäis. Kein Herrscher konnte es bereisen, kein Bote es in einem Menschenleben mehrfach durchqueren. Wer es zusammenhalten wollte, brauchte etwas, das schneller war als ein Mensch.',
    zahlen: [
      { wert: '2.700', label: 'Kilometer maß die Königsstraße zwischen Susa und Sardes', evidenz: 'B' },
      { wert: '9', label: 'Tage brauchte eine Reiterstafette – zu Fuß waren es neunzig', evidenz: 'B' },
    ],
    randnotizen: [
      { begriff: 'Satrapie', text: 'Provinz unter einem königlichen Statthalter. Steuern und Truppen kamen aus ihr, Befehle gingen in sie hinein.', evidenz: 'A' },
      { begriff: 'Die Quellenlage', text: 'Fast alles, was wir über Persien wissen, stammt von Griechen, die gegen Persien Krieg führten. Beide Seiten sind Parteien, keine Beobachter.', evidenz: 'E' },
    ],
    quelle: 'Streckenangaben Herodots, umgerechnet und auf reales Gelände übertragen.',
    bezuege: { vorher: 'handel-ueber-distanz', danach: 'geheimnisse-der-herrscher', sieheAuch: ['recht'] },
  },
  {
    id: 'laufzeit', bandId: 'band-1', kapitelId: 4, unterkapitel: '4.1', typ: 'interaktion',
    modul: 'laufzeit', buchseite: 104,
    titel: 'Neun Tage statt neunzig',
    unterzeile: 'Die Königsstraße als Nachrichtensystem',
    fliesstext:
      'Ein Aufstand am Rand des Reiches wurde in Susa nach neun Tagen bekannt, nicht nach drei Monaten. Damit ließ sich reagieren, solange die Lage noch beweglich war. Geschwindigkeit war hier kein Komfort, sondern Herrschaft.',
    quelle: 'Herodot zur Reisedauer der persischen Reiterstafette; Trassenverlauf rekonstruiert, im Einzelnen unsicher.',
  },
  {
    id: 'ringe', bandId: 'band-1', kapitelId: 4, unterkapitel: '4.2', typ: 'interaktion',
    modul: 'ringe', buchseite: 109,
    titel: 'Fünf Ringe um einen Menschen',
    unterzeile: 'Wie Zugang gestaffelt wurde',
    fliesstext:
      'Zwischen dem einfachen Untertanen und dem Herrscher lagen nicht ein, sondern mehrere Filter. Wer eine Nachricht nach oben geben wollte, musste sie durch jede einzelne hindurchreichen – und jede konnte sie verändern oder aufhalten.',
    quelle: 'Zugangsregeln aus Hofordnungen, schematisch zusammengefasst.',
  },
  {
    id: 'faden-4', bandId: 'band-1', kapitelId: 4, typ: 'papier', buchseite: 128,
    titel: 'Der unsichtbare Faden in Kapitel 4',
    zitat: 'Wer schneller weiß, entscheidet früher – und was verborgen bleibt, wird von anderen gefüllt.',
    quelle: 'Bilanz zu Kapitel 4: Herrschaft über Entfernung braucht Stellvertreter, und jeder Stellvertreter gewinnt dabei eigene Macht.',
  },
  {
    id: 'kapitel-5', bandId: 'band-1', kapitelId: 5, typ: 'auftakt', tor: true,
    platte: 'roemische-strasse', motion: 'roemische-strasse', buchseite: 130, hoehe: 189, grading: '#3b3524',
    uebergang: 'aufloesen', fahrt: 'durchfahrt',
    titel: 'Gesetz, Geld\nund Imperium',
    unterzeile: 'Wie Herrschaft unabhängig von der Person wurde',
    quelle: 'Römische Straße: gebaut, um Regeln über Entfernungen zu tragen.',
  },
  {
    id: 'denar', bandId: 'band-1', kapitelId: 5, unterkapitel: '5.2', typ: 'interaktion',
    modul: 'denar', buchseite: 138,
    titel: 'Dreihundert Jahre Verdünnung',
    unterzeile: 'Was Metallanalysen zeigen',
    fliesstext:
      'Über drei Jahrhunderte sank der Silberanteil von 96 auf wenige Prozent – der Nennwert blieb dabei formal derselbe. Die Römer tarnten die Verdünnung durch eine Oberflächenbehandlung: Die Münze sah außen silbriger aus, als sie innen war. Wer sie in der Hand hielt, konnte es nicht erkennen.',
    quelle: 'Metallanalysen an tausenden erhaltenen Stücken; Angaben verschiedener Untersuchungen als Spanne.',
  },
  {
    id: 'kammer', bandId: 'band-1', kapitelId: 5, unterkapitel: '5.5', typ: 'motiv',
    platte: 'bibliothekshoehle', motion: 'bibliothekshoehle', buchseite: 159, hoehe: 297, grading: '#2b1f14',
    uebergang: 'lichtschwenk', fahrt: 'durchfahrt',
    partikel: 'staub', badge: 'Freie Rekonstruktion',
    eyebrow: 'Seidenstraßen und verlorene Archive',
    titel: 'Fünfzigtausend Handschriften',
    unterzeile: 'Die Bibliothekshöhle von Dunhuang',
    fliesstext:
      'Die trockene Wüstenluft hat bewahrt, was anderswo längst zerfallen wäre: buddhistische Texte, aber auch Verträge, Rechnungen, Briefe und Schulhefte. Gerade das Alltägliche macht den Fund so wertvoll – solche Papiere wurden sonst nirgends aufgehoben.',
    zahlen: [
      { wert: '17', label: 'Sprachen sind unter den Funden nachgewiesen', evidenz: 'A' },
      { wert: '868', label: 'Aus diesem Jahr stammt das älteste datierte gedruckte Buch der Welt', evidenz: 'A' },
      { wert: '900', label: 'Jahre blieb die Kammer hinter einer bemalten Wand verborgen', evidenz: 'A' },
    ],
    randnotizen: [
      { begriff: 'Höhle 17', text: 'Eine Kammer von wenigen Metern, um 1002 zugemauert, 1900 wiederentdeckt.', evidenz: 'A' },
      { begriff: 'Ursprüngliche Ordnung', text: 'Durch frühe Entnahmen zerstört.', evidenz: 'B' },
    ],
    quelle: 'Über 50.000 Handschriften aus der Bibliothekshöhle von Dunhuang.',
  },
  {
    id: 'faden-5', bandId: 'band-1', kapitelId: 5, typ: 'papier', buchseite: 162,
    titel: 'Der unsichtbare Faden in Kapitel 5',
    zitat: 'Alle drei Werkzeuge verlagern Macht von Menschen auf Verfahren. Das schützt vor Willkür – und verbirgt zugleich, wer die Verfahren festlegt.',
    quelle: 'Bilanz zu Kapitel 5: Ein Gesetz gilt ohne den Gesetzgeber, eine Münze ohne den Prägenden, eine Akte ohne den Beamten.',
  },
  {
    id: 'kapitel-6', bandId: 'band-1', kapitelId: 6, typ: 'auftakt', tor: true,
    platte: 'kapitel-6-auftakt', motion: 'kapitel-6-auftakt', buchseite: 163, hoehe: 196, grading: '#332a20',
    uebergang: 'aufloesen', fahrt: 'heraus',
    titel: 'Am Rand\ndes Belegten',
    unterzeile: 'Nicht die Deutung entscheidet, sondern ob sie sich prüfen lässt',
    quelle: 'Kapitelauftakt: Felsen im Nebel – die Umrisse bleiben unbestimmt.',
  },
  {
    id: 'pruefung', bandId: 'band-1', kapitelId: 6, unterkapitel: '6.2', typ: 'interaktion',
    modul: 'pruefung', buchseite: 173,
    titel: 'Die Prüfung',
    unterzeile: 'Fünf Fragen, auf eine Erzählung angewendet',
    fliesstext:
      'Nicht die Deutung entscheidet, sondern ob sie sich prüfen lässt. Eine Erklärung, die stärker wird, wenn man ihr widersprechende Belege vorlegt, ist kein gutes Zeichen – das ist das entscheidende Warnsignal.',
    quelle: 'Die fünf Fragen von Seite 168, angewendet auf die Erzählung von Atlantis.',
  },
  {
    id: 'versunken', bandId: 'band-1', kapitelId: 6, unterkapitel: '6.2', typ: 'motiv',
    platte: 'meeresgrund', motion: 'meeresgrund', buchseite: 174, hoehe: 256, grading: '#123044',
    uebergang: 'wasser', fahrt: 'schwenkLinks',
    ton: 'wasser', badge: 'Freie Rekonstruktion', eyebrow: 'Am Rand des Belegten',
    titel: 'Städte, die wirklich versanken',
    unterzeile: 'Was Platon gekannt haben dürfte',
    fliesstext:
      'Es ist gut denkbar, dass Platon reale Katastrophen als Baustoff verwendete – so wie jeder Erzähler das tut. Das macht die Erzählung aber nicht zu einem Bericht. Ein Gebäude aus echten Ziegeln steht deshalb noch lange nicht dort, wo die Ziegel herkamen.',
    zahlen: [
      { wert: '373 v. Chr.', label: 'versank Helike an der Nordküste der Peloponnes in einer einzigen Nacht', evidenz: 'A' },
      { wert: '50', label: 'Jahre alt war Platon damals ungefähr; das Ereignis war in ganz Griechenland bekannt', evidenz: 'B' },
    ],
    randnotizen: [
      { begriff: 'Prüfbarkeit', text: 'Eine Erklärung, die durch keinen denkbaren Fund widerlegt werden kann, ist nicht besonders stark – sie steht außerhalb der Frage nach Belegen.', evidenz: 'A' },
      { begriff: 'Verschollene Hochkultur', text: 'Für die Erzählung selbst gibt es keinen Befund.', evidenz: 'G' },
    ],
    quelle: 'Mauerreste auf dem Meeresgrund: keine Hochkultur, aber ein Ort, an dem Menschen lebten.',
  },
  {
    id: 'baustelle', bandId: 'band-1', kapitelId: 6, unterkapitel: '6.3', typ: 'motiv',
    platte: 'baustelle', motion: 'baustelle', buchseite: 182, hoehe: 256, grading: '#3d2412',
    uebergang: 'lichtschwenk', fahrt: 'hinein',
    partikel: 'funken', badge: 'Freie Rekonstruktion', eyebrow: 'Die Frage nach dem Können',
    titel: 'Wer die Steine bewegte',
    unterzeile: 'Was die Grabungen an der Baustelle zeigen',
    fliesstext:
      'Südlich der Pyramiden liegt eine ganze Siedlung: Bäckereien mit Reihen von Brotformen, Brauereien, Speicher, Werkstätten und Unterkünfte. Die Skelette aus den zugehörigen Gräbern zeigen schwere Arbeit – aber auch medizinische Versorgung und ordentliche Bestattung.',
    zahlen: [
      { wert: '4.500', label: 'Jahre alt ist das 2013 gefundene Schichtbuch des Merer', evidenz: 'A' },
      { wert: '0', label: 'Hinweise auf ein Sklavenheer – die Befunde zeigen eine verwaltete, verpflegte und bezahlte Arbeitsorganisation', evidenz: 'B' },
    ],
    randnotizen: [
      { begriff: 'Was die Knochen zeigen', text: 'Verheilte Brüche und abgenutzte Wirbelsäulen – und zugleich Versorgung und Bestattung.', evidenz: 'A' },
      { begriff: 'Die Lücke', text: 'Aus einer Lücke im Wissen folgt nichts als die Lücke.', evidenz: 'A' },
    ],
    quelle: 'Grabungen der Arbeitersiedlung südlich der Pyramiden sowie Merers Aufzeichnungen.',
  },
  {
    id: 'faden-6', bandId: 'band-1', kapitelId: 6, typ: 'papier', buchseite: 193,
    titel: 'Der unsichtbare Faden in Kapitel 6',
    zitat: 'Eine Erklärung, die durch keinen denkbaren Fund widerlegt werden kann, ist nicht besonders stark – sie steht außerhalb der Frage nach Belegen.',
    quelle: 'Bilanz zu Kapitel 6: Nicht die Deutung entscheidet, sondern ob sie sich prüfen lässt.',
  },
  {
    id: 'karte', bandId: 'band-1', typ: 'karte',
    titel: 'Die Welt der Fäden',
    fliesstext:
      'Jeder Punkt ist ein Ort, an dem Band 1 etwas belegt. Der Faden verbindet sie in der Reihenfolge der Kapitel. Die Orte von Band 2 sind noch nicht eingetragen – sie kommen in dieselbe Karte und greifen auf bestehende Punkte zurück.',
  },
  {
    id: 'epilog', bandId: 'band-1', typ: 'papier', buchseite: 195,
    titel: 'Der unsichtbare Faden',
    zitat: 'Jede Erleichterung erzeugt eine neue Abhängigkeit – und diejenigen, die das Werkzeug verwalten, fallen dabei am wenigsten auf.',
    quelle: 'Epilog, Band 1.',
  },
  { id: 'buecher', bandId: 'band-1', typ: 'buecher' },
];
