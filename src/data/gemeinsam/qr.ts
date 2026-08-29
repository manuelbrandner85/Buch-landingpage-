/**
 * Die Nachschlage-Seiten zum Buch „Alles nur Zufall?“.
 *
 * In jedem der vierzig Kapitel steht am Ende ein QR-Kasten mit der Zeile
 * „Sieh selbst nach“. Er zeigt auf `/q/01` bis `/q/40` — also hierher, nicht
 * direkt auf die fremde Quelle. Das hat einen handfesten Grund: Ein Link, der
 * gedruckt ist, lässt sich nicht mehr ändern. Eine Behörde, die ihre Seite
 * umbaut, würde sonst vierzigtausend tote Codes hinterlassen. Zeigt der Code
 * auf die eigene Seite, wird aus dem toten Link eine Zeile, die man hier
 * austauscht.
 *
 * Zweiter Grund: Der Leser landet zuerst bei uns und sieht, worum es geht,
 * bevor er in eine Datenbank fällt, die ihn nicht erwartet.
 *
 * Solange `QR_VEROEFFENTLICHT` falsch ist, existieren die Seiten zwar, stehen
 * aber auf `noindex` und in keiner Sitemap. Das Buch ist noch nicht
 * erschienen; eine Seite, die es beim Namen nennt, wäre eine Ankündigung.
 */

export type QrQuelle = {
  /** Die vollständige Adresse. Sie wurde beim Eintragen geprüft. */
  url: string;
  /** Wer dahintersteht — Behörde, Archiv, Hochschule, Betreiber. */
  anbieter: string;
  /** Was man dort tut, in einem Satz. */
  was: string;
};

export type QrZiel = {
  /** Kapitelnummer, 1 bis 40. Sie ist zugleich die Adresse: /q/07 */
  nr: number;
  /** Die Kapitelüberschrift aus dem Buch. */
  kapitel: string;
  /** Der Satz, der im Buch neben dem QR-Kasten steht. */
  hinweis: string;
  /** Eine, selten zwei Quellen. Leer heißt: hier fehlt noch etwas. */
  quellen: QrQuelle[];
};

/** Umschalter für den Erscheinungstag. Vorher: unsichtbar für Suchmaschinen. */
export const QR_VEROEFFENTLICHT = false;

export const QR_BUCH = 'Alles nur Zufall?';

export const QR_ZIELE: QrZiel[] = [
  {
    nr: 1, kapitel: 'Flache Erde',
    hinweis: 'Die Krümmung selbst messen. Augenhöhe eingeben und nachsehen, wie viel vom Schiff hinter dem Horizont verschwindet.',
    quellen: [{
      url: 'https://www.omnicalculator.com/de/physik/erdkruemmung-rechner',
      anbieter: 'Freier Online-Rechner (Omni Calculator, deutsch)',
      was: 'Augenhöhe und Entfernung eintragen und ablesen, wie viele Meter verdeckt sind.',
    }],
  },
  {
    nr: 2, kapitel: 'Die Mondlandung ist ein Hollywood-Fake',
    hinweis: 'Die Spiegel liegen noch oben. Wer sie anfunkt, wie oft, und was dabei herauskommt.',
    quellen: [
      {
        url: 'https://www.ife.uni-hannover.de/llr',
        anbieter: 'Institut für Erdmessung, Leibniz Universität Hannover',
        was: 'Nachlesen, wie Laserpulse an den Reflektoren von Apollo und Lunochod gemessen werden.',
      },
      {
        url: 'https://tmurphy.physics.ucsd.edu/apollo/apollo.html',
        anbieter: 'APOLLO-Projekt, University of California San Diego',
        was: 'Die Programmseite des Observatoriums mit allen vier Reflektoren und den Messreihen.',
      },
    ],
  },
  {
    nr: 3, kapitel: 'Chemtrails',
    hinweis: 'Was gerade wirklich über dir fliegt. Rufzeichen, Höhe, Startflughafen. Dauert vier Minuten und beendet die meisten Diskussionen.',
    quellen: [{
      url: 'https://globe.adsbexchange.com/',
      anbieter: 'ADS-B Exchange (offene, ungefilterte Flugdaten)',
      was: 'Ein Flugzeug am Himmel anklicken und Rufzeichen, Höhe, Typ und Route ablesen.',
    }],
  },
  {
    nr: 4, kapitel: 'Reptiloide Herrscher',
    hinweis: 'Warum digitale Videos Gesichter verziehen — die Erklärung der Kompression, mit Beispielbildern.',
    quellen: [{
      url: 'https://www.tu-braunschweig.de/fileadmin/Redaktionsgruppen/Institute_Fakultaet_5/IFN/praktikum/nt/Skripte/Videocodierung.pdf',
      anbieter: 'Institut für Nachrichtentechnik, TU Braunschweig',
      was: 'Nachlesen, wie Blocktransformation und Quantisierung genau die Artefakte erzeugen, die für Augenlider gehalten werden.',
    }],
  },
  {
    nr: 5, kapitel: 'Illuminaten und die Neue Weltordnung',
    hinweis: 'Die beschlagnahmten Akten des Ordens von 1785, digitalisiert. Mitgliederlisten, Ordensregeln, Briefe.',
    quellen: [{
      url: 'https://www.digitale-sammlungen.de/de/view/bsb10381793',
      anbieter: 'Münchener DigitalisierungsZentrum der Bayerischen Staatsbibliothek',
      was: 'Die Originalschriften des Illuminatenordens Seite für Seite durchblättern.',
    }],
  },
  {
    nr: 6, kapitel: 'HAARP',
    hinweis: 'Der Sendeplan der Anlage. Wann sie lief, wann nicht, auf welcher Frequenz. Vergleiche das mit dem Datum deines Unwetters.',
    quellen: [{
      url: 'https://haarp.gi.alaska.edu/transmissions',
      anbieter: 'HAARP, Geophysical Institute der University of Alaska Fairbanks',
      was: 'Die amtlichen Sendeankündigungen mit Datum, Uhrzeit und Frequenz einsehen.',
    }],
  },
  {
    nr: 7, kapitel: 'Die Antarktis und die Eiswand',
    hinweis: 'Der Antarktis-Marathon. Startgeld, Termine, Anmeldung. Für alle, die glauben, da komme niemand hin.',
    quellen: [{
      url: 'https://icemarathon.com/',
      anbieter: 'Antarctic Ice Marathon, Union Glacier',
      was: 'Termin, Startgeld und Anmeldebedingungen nachschlagen.',
    }],
  },
  {
    nr: 8, kapitel: 'Area 51 und die UFO-Verschwörung',
    hinweis: 'Die freigegebene CIA-Akte zum U-2-Programm von 2013 — die, in der der Ort zum ersten Mal beim Namen genannt wird. Mit Karte.',
    quellen: [{
      url: 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB434/',
      anbieter: 'National Security Archive, George Washington University',
      was: 'Die freigegebene CIA-Geschichte kapitelweise als PDF öffnen, samt der Karte mit Groom Lake.',
    }],
  },
  {
    nr: 9, kapitel: 'Die 5G-Verschwörung',
    hinweis: 'Das Standortverzeichnis der Bundesnetzagentur. Gib deine Straße ein und sieh, wie viele Masten schon seit den Neunzigern dort stehen.',
    quellen: [{
      url: 'https://www.bundesnetzagentur.de/DE/Vportal/TK/Funktechnik/EMF/start.html',
      anbieter: 'Bundesnetzagentur, EMF-Datenbank',
      was: 'Über die Karte die Funkanlagen an der eigenen Adresse abfragen, kostenfrei.',
    }],
  },
  {
    nr: 10, kapitel: 'Bigfoot und andere Kryptiden',
    hinweis: 'Die Genanalyse von dreißig eingereichten Haarproben. Was dabei herauskam: Bär, Wolf, Kuh, Waschbär, Pferd, Mensch.',
    quellen: [{
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4100498/',
      anbieter: 'Sykes u. a. 2014, Proceedings of the Royal Society B (Volltext bei PubMed Central)',
      was: 'Den vollständigen Bericht der DNA-Analyse aller dreißig Proben lesen.',
    }],
  },
  {
    nr: 11, kapitel: 'Zeitreisen und alternative Realitäten',
    hinweis: 'Die Party für Zeitreisende von 2009. Einladung, Koordinaten, Fotos vom leeren Raum.',
    quellen: [{
      url: 'https://collection.sciencemuseumgroup.org.uk/objects/co8863710/time-travellers-invitation',
      anbieter: 'Science Museum Group, London',
      was: 'Hawkings Einladungskarte im Sammlungsbestand ansehen — verschickt wurde sie erst nach der Party.',
    }],
  },
  {
    nr: 12, kapitel: 'Deep State: Die geheime Weltregierung',
    hinweis: 'Der Haushaltsplan deiner Stadt. Jede Position, jeder Beschluss, jedes Protokoll. Such dir fünf Zeilen aus.',
    quellen: [{
      url: 'https://www.stadt-koeln.de/artikel/60791/index.html',
      anbieter: 'Stadt Köln, Kämmerei — als Beispiel; jede Stadt veröffentlicht ihren eigenen',
      was: 'Den vollständigen Haushaltsplan öffnen und fünf Positionen bis zum Ratsbeschluss zurückverfolgen.',
    }],
  },
  {
    nr: 13, kapitel: 'Die Federal Reserve kontrolliert die Welt',
    hinweis: 'Die Wortabschriften der Sitzungen, fünf Jahre nach jedem Termin veröffentlicht. Jedes gesprochene Wort, mit Namen.',
    quellen: [{
      url: 'https://www.federalreserve.gov/monetarypolicy/fomc_historical_year.htm',
      anbieter: 'Board of Governors of the Federal Reserve System',
      was: 'Jahr für Jahr die wörtlichen Sitzungsprotokolle öffnen.',
    }],
  },
  {
    nr: 14, kapitel: 'Die Erde ist hohl',
    hinweis: 'Der Flugverkehr über dem Nordpol in Echtzeit. Schieb die Karte nach oben und schau, wer da gerade fliegt.',
    quellen: [
      {
        url: 'https://globe.adsbexchange.com/',
        anbieter: 'ADS-B Exchange (ohne Anmeldung)',
        was: 'Die Globusansicht über den Pol schwenken und die Polarrouten verfolgen.',
      },
      {
        url: 'https://www.flightradar24.com/',
        anbieter: 'Flightradar24',
        was: 'Dasselbe auf der bekannteren Karte, mit mehr Zusatzangaben je Maschine.',
      },
    ],
  },
  {
    nr: 15, kapitel: 'Die Wahrheit über JFKs Ermordung',
    hinweis: 'Millionen freigegebener Seiten im Nationalarchiv, durchsuchbar. Fang mit dem Mexiko-Vorgang an.',
    quellen: [{
      url: 'https://www.archives.gov/research/jfk',
      anbieter: 'National Archives and Records Administration (USA)',
      was: 'Die Aktensammlung durchsuchen und einzelne Vorgänge als PDF öffnen.',
    }],
  },
  {
    nr: 16, kapitel: 'Prinzessin Dianas Tod',
    hinweis: 'Der britische Untersuchungsbericht, über achthundert Seiten. Punkt für Punkt, auch dort, wo Behörden schlecht wegkommen.',
    quellen: [{
      url: 'https://onlinebooks.library.upenn.edu/webbin/book/lookupid?key=olbp78476',
      anbieter: 'Online Books Page, University of Pennsylvania Libraries',
      was: 'Den vollständigen Operation-Paget-Bericht der Metropolitan Police als PDF öffnen.',
    }],
  },
  {
    nr: 17, kapitel: 'Die Titanic war ein Versicherungsbetrug',
    hinweis: 'Die Datenbank aller Menschen an Bord. Name, Klasse, Kabine, Rettungsboot, Schicksal. Such dir einen aus.',
    quellen: [{
      url: 'https://www.encyclopedia-titanica.org/titanic-passengers-and-crew/',
      anbieter: 'Encyclopedia Titanica',
      was: 'Passagiere und Besatzung durchsuchen — mit Alter, Klasse, Zustiegshafen und Schicksal.',
    }],
  },
  {
    nr: 18, kapitel: 'Pizzagate',
    hinweis: 'Das Gebäuderegister der Stadt Washington. Baujahr, Geschosse, Unterkellerung. Dauert acht Minuten.',
    quellen: [
      {
        url: 'https://otr.cfo.dc.gov/page/real-property-tax-database-search',
        anbieter: 'District of Columbia, Office of Tax and Revenue',
        was: 'Eine Adresse eingeben und den amtlichen Grundstücksdatensatz aufrufen.',
      },
      {
        url: 'https://opendata.dc.gov/datasets/DCGIS::computer-assisted-mass-appraisal-residential/about',
        anbieter: 'Open Data DC, Stadtverwaltung Washington',
        was: 'Den offenen Bewertungsdatensatz herunterladen und Baujahr, Bauweise und Geschosszahl selbst nachsehen.',
      },
    ],
  },
  {
    nr: 19, kapitel: 'Mikrochips durch Impfungen',
    hinweis: 'Die Zulassungsunterlage mit der vollständigen Zusammensetzung. Wirkstoff, Salze, Zucker, Fett, Wasser.',
    quellen: [{
      url: 'https://www.ema.europa.eu/en/medicines/human/EPAR/comirnaty',
      anbieter: 'Europäische Arzneimittel-Agentur (EMA)',
      was: 'Die amtliche Produktinformation auf Deutsch laden und in Abschnitt 6.1 alle Bestandteile lesen.',
    }],
  },
  {
    nr: 20, kapitel: 'Die globale Erwärmung ist ein Mythos',
    hinweis: 'Die langen Reihen zum Selberrechnen: Weinlesetermine seit 1354 und Seegefrierdaten seit dem Mittelalter.',
    quellen: [
      {
        url: 'https://www.ncei.noaa.gov/pub/data/paleo/historical/europe/europe2012ghd.txt',
        anbieter: 'NOAA, World Data Service for Paleoclimatology',
        was: 'Die Weinlesetermine aus 27 europäischen Anbaugebieten von 1354 bis 2007 als Rohdatei laden.',
      },
      {
        url: 'https://nsidc.org/data/g01377',
        anbieter: 'National Snow and Ice Data Center, University of Colorado',
        was: 'Zufrier- und Aufbruchdaten von 865 Seen und Flüssen ab dem Jahr 874 auswerten.',
      },
    ],
  },
  {
    nr: 21, kapitel: 'Der Mandela-Effekt',
    hinweis: 'Der Wortlisten-Versuch zum Selbermachen. Lies ihn jemandem vor und schau, welches Wort er erfindet.',
    quellen: [{
      url: 'https://psychnet.wustl.edu/memory/wp-content/uploads/2018/04/Stadler-et-al-1999_MemCog.pdf',
      anbieter: 'Memory Lab, Washington University in St. Louis',
      was: 'Im Anhang stehen alle 36 Wortlisten, darunter die mit dem Wort, das niemand vorgelesen bekommt.',
    }],
  },
  {
    nr: 22, kapitel: 'Roswell und die UFO-Geheimnisse',
    hinweis: 'Der Mogul-Bericht der Luftwaffe von 1994, vollständig. Mit den Bauplänen der Ballonketten und der Herkunft des Klebebands.',
    quellen: [{
      url: 'https://apps.dtic.mil/sti/html/tr/ADA326148/index.html',
      anbieter: 'Defense Technical Information Center, US-Verteidigungsministerium',
      was: 'Den Bericht „Fact versus Fiction in the New Mexico Desert“ im Volltext öffnen.',
    }],
  },
  {
    nr: 23, kapitel: 'Paul McCartney ist tot',
    hinweis: 'Der Artikel aus der Studentenzeitung von 1969, der alles ausgelöst hat. Geschrieben an einem Abend, weil eine Seite zu füllen war.',
    quellen: [{
      url: 'https://content.library.drake.edu/digital/collection/p15183coll1/id/701/',
      anbieter: 'Cowles Library, Drake University',
      was: 'Die Ausgabe vom 17. September 1969 digitalisiert durchblättern und den Artikel vergrößern.',
    }],
  },
  {
    nr: 24, kapitel: 'Geheime Technologien von Tesla und Edison',
    hinweis: 'Teslas Nachlass in Belgrad, digitalisiert. Berechnungen, Skizzen, Briefe, Rechnungen.',
    quellen: [{
      url: 'https://tesla-museum.org/en/legacy/archive/',
      anbieter: 'Nikola-Tesla-Museum Belgrad (UNESCO-Weltdokumentenerbe)',
      was: 'Die Bestandsübersicht des vollständig digitalisierten Nachlasses aufrufen und darin suchen.',
    }],
  },
  {
    nr: 25, kapitel: 'Das Philadelphia-Experiment',
    hinweis: 'Was die Marine selbst dazu sagt — und wo die Fahrtenbücher der Eldridge liegen.',
    quellen: [{
      url: 'https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/p/philadelphia-experiment/philadelphia-experiment-onr-info-sheet.html',
      anbieter: 'Naval History and Heritage Command, US Navy',
      was: 'Das amtliche Informationsblatt lesen: Entmagnetisierungsversuche, Fahrtenbücher, Herkunft der Legende.',
    }],
  },
  {
    nr: 26, kapitel: 'Das Bermuda-Dreieck',
    hinweis: 'Die Unfalldatenbank der Seebehörde. Zeichne dein eigenes Dreieck über ein beliebiges Meer und zähl nach.',
    quellen: [{
      url: 'https://www.dco.uscg.mil/Our-Organization/Assistant-Commandant-for-Prevention-Policy-CG-5P/Inspections-Compliance-CG-5PC-/Office-of-Investigations-Casualty-Analysis/Marine-Casualty-and-Pollution-Data-for-Researchers/',
      anbieter: 'United States Coast Guard, Office of Investigations & Casualty Analysis',
      was: 'Die amtliche Havariedatenbank herunterladen und Schiffsverluste nach Ort und Zeitraum auszählen.',
    }],
  },
  {
    nr: 27, kapitel: 'Elvis lebt!',
    hinweis: 'Das öffentliche Sterberegister der Vereinigten Staaten. Millionen Einträge, frei durchsuchbar. Gib einen Namen ein.',
    quellen: [{
      url: 'https://aad.archives.gov/aad/series-description.jsp?s=5057',
      anbieter: 'National Archives (NARA), Access to Archival Databases',
      was: 'Ohne Anmeldung in den Sterbedateien der Sozialversicherung nach einem Namen suchen.',
    }],
  },
  {
    nr: 28, kapitel: 'COVID-19 ist eine Lüge',
    hinweis: 'Die Sterbefallzahlen des Statistischen Bundesamtes, wöchentlich, als Tabelle. Mal die Jahre untereinander.',
    quellen: [{
      url: 'https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Sterbefaelle-Lebenserwartung/Tabellen/sonderauswertung-sterbefaelle.html',
      anbieter: 'Statistisches Bundesamt (Destatis)',
      was: 'Die Tabelle nach Tagen, Kalenderwochen und Monaten herunterladen und die Jahre selbst vergleichen.',
    }],
  },
  {
    nr: 29, kapitel: 'Der Vatikan und seine Geheimnisse',
    hinweis: 'Die Findbücher des Apostolischen Archivs. Was da wirklich steht: Nuntiaturberichte, Eheprozesse, Streit um Pfründe.',
    quellen: [{
      url: 'https://www.archivioapostolicovaticano.va/content/dam/aav/documenti/Indice%20dei%20Fondi%20e%20relativi%20mezzi%20di%20descrizione%20e%20di%20ricerca.pdf',
      anbieter: 'Archivio Apostolico Vaticano',
      was: 'Das amtliche Verzeichnis aller Bestände öffnen — samt Kennzeichnung dessen, was gesperrt ist.',
    }],
  },
  {
    nr: 30, kapitel: 'Die globale Chipkrise ist geplant',
    hinweis: 'Wer die Chips wirklich baut. Marktanteile, Standorte, Maschinenhersteller — alles aus offenen Berichten.',
    quellen: [{
      url: 'https://www.semiconductors.org/wp-content/uploads/2025/05/2025-SIA-Factbook-FINAL.pdf',
      anbieter: 'Semiconductor Industry Association, Washington',
      was: 'Die Branchenzahlen zu Weltmarktanteilen und zur Verteilung der Fertigung nachlesen.',
    }],
  },
  {
    nr: 31, kapitel: 'Disney und versteckte Botschaften',
    hinweis: 'Wie das Gehirn in Zufallsmustern Gesichter und Schrift findet. Der Effekt, der dieses Kapitel erklärt.',
    quellen: [
      {
        url: 'https://www.nature.com/articles/s41467-020-18325-8',
        anbieter: 'Nature Communications, frei zugänglich',
        was: 'Die Untersuchung lesen, warum das Gehirn Gesichter erkennt, wo keine sind.',
      },
      {
        url: 'https://idw-online.de/de/news848252',
        anbieter: 'Justus-Liebig-Universität Gießen',
        was: 'Die deutsche Kurzfassung dazu — „Gesichter im Kaffeeschaum“.',
      },
    ],
  },
  {
    nr: 32, kapitel: 'Adolf Hitler lebt in Argentinien',
    hinweis: 'Die freigegebenen Hinweisakten, samt der Vermerke der Bearbeiter.',
    quellen: [{
      url: 'https://vault.fbi.gov/adolf-hitler',
      anbieter: 'FBI Records: The Vault',
      was: 'Die vier freigegebenen Aktenteile öffnen und die Meldungen aus Südamerika im Original lesen.',
    }],
  },
  {
    nr: 33, kapitel: 'Die Mondbasis der Nazis',
    hinweis: 'Die Rückseite des Mondes, Krater für Krater, in wenigen Metern Auflösung. Kostenlos.',
    quellen: [{
      url: 'https://quickmap.lroc.im-ldi.com/',
      anbieter: 'LROC QuickMap, Arizona State University für die NASA',
      was: 'Die Karte auf die Rückseite drehen und in die Originalaufnahmen hineinzoomen.',
    }],
  },
  {
    nr: 34, kapitel: 'Die gefälschte Geschichte der Menschheit',
    hinweis: 'Die Arbeitersiedlung von Gizeh: Bäckerei, Brauerei, Friedhof, Knochenbefunde.',
    quellen: [{
      url: 'https://aeraweb.org/projects/lost-city/',
      anbieter: 'Ancient Egypt Research Associates, Grabung Heit el-Ghurab',
      was: 'Die Grabungsberichte zur Siedlung der Pyramidenbauer ansehen.',
    }],
  },
  {
    nr: 35, kapitel: 'Flugzeuge verschwinden wegen Zeitportalen',
    hinweis: 'Der amtliche Abschlussbericht zur Suche nach MH370 — und der Flugverkehr über dem Nordpazifik in Echtzeit.',
    quellen: [
      {
        url: 'https://www.atsb.gov.au/sites/default/files/media/5773565/operational-search-for-mh370_final_3oct2017.pdf',
        anbieter: 'Australian Transport Safety Bureau',
        was: 'Den Bericht über die Unterwassersuche als PDF laden — wie groß das Meer ist, steht auf jeder Seite.',
      },
      {
        url: 'https://globe.adsbexchange.com/',
        anbieter: 'ADS-B Exchange',
        was: 'Die Karte auf den Nordpazifik schieben und zusehen, wie Maschinen an der Küste verschwinden.',
      },
    ],
  },
  {
    nr: 36, kapitel: 'Die Echtheit von Dinosauriern wird angezweifelt',
    hinweis: 'Öffentliche Fundstellen, an denen du selbst suchen darfst. Mit Preisen, Öffnungszeiten und dem, was du behalten darfst.',
    quellen: [{
      url: 'https://www.solnhofen.de/Hobbybruch-Solnhofen.n185.html',
      anbieter: 'Gemeinde Solnhofen, Hobbysteinbruch im Altmühltal',
      was: 'Öffnungszeiten und Preise nachsehen — und was man mitnehmen darf, wenn man etwas findet.',
    }],
  },
  {
    nr: 37, kapitel: 'Hollywood als Kontrollinstrument',
    hinweis: 'Die Dienstvorschrift, nach der das Pentagon Filme unterstützt. Welche Bedingungen, welche Drehbuchprüfung.',
    quellen: [{
      url: 'https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/541016p.pdf',
      anbieter: 'US Department of Defense, Directives Division',
      was: 'Die amtliche Vorschrift 5410.16 lesen — der Vorgang ist keine Enthüllung, sondern ein Formular.',
    }],
  },
  {
    nr: 38, kapitel: 'Der Denver International Airport',
    hinweis: 'Die Rechnungshofberichte zum Flughafen. Kosten, Nachträge, die berühmte Gepäckanlage.',
    quellen: [{
      url: 'https://www.gao.gov/products/rced-95-241fs',
      anbieter: 'U.S. Government Accountability Office, Bericht von 1995',
      was: 'Den Prüfbericht als PDF laden und Baukosten, Vergaben und Verzögerungen nachlesen.',
    }],
  },
  {
    nr: 39, kapitel: 'Der Tod von Epstein und die Wahrheit dahinter',
    hinweis: 'Der Bericht des Generalinspekteurs von 2023. Was in dieser Nacht schiefging, von der Behörde selbst aufgeschrieben.',
    quellen: [{
      url: 'https://oig.justice.gov/sites/default/files/2023-06/6-27-2023.pdf',
      anbieter: 'U.S. Department of Justice, Office of the Inspector General',
      was: 'Den vollständigen Bericht lesen: Nachtschicht, Kameras, Personalversagen, Zeitangaben.',
    }],
  },
  {
    nr: 40, kapitel: 'Künstliche Intelligenz übernimmt die Welt',
    hinweis: 'Der Text der europäischen KI-Verordnung. Wer entscheidet, was ein Modell antworten darf.',
    quellen: [{
      url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=OJ:L_202401689',
      anbieter: 'EUR-Lex, Amt für Veröffentlichungen der Europäischen Union',
      was: 'Den amtlichen deutschen Volltext der Verordnung (EU) 2024/1689 lesen.',
    }],
  },
];

/** Zweistellig, wie im Buch gedruckt: /q/07 */
export const qrSchluessel = (nr: number) => String(nr).padStart(2, '0');

export const qrZielNach = (schluessel: string): QrZiel | undefined =>
  QR_ZIELE.find((z) => qrSchluessel(z.nr) === schluessel);
