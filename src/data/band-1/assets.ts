import type { Asset } from '../gemeinsam/typen';

/**
 * Bildherkunft nach dem Bildnachweis des Bandes (S. 201):
 * Kein Motiv ist eine historische Fotografie; alle wurden eigens erzeugt.
 * `datei` ist der Basisname – scripts/assets.mjs erzeugt daraus AVIF/WebP
 * in mehreren Breiten unter /public/assets/band-1/szenen/.
 */
export const ASSETS_BAND_1: Asset[] = [
  { id: 'cover', datei: 'cover', breite: 1000, hoehe: 1520, herkunft: 'Eigene Darstellung',
    alt: 'Cover Band 1: eine goldene Linie steigt vom Feuer über Ährenfeld und Dorf zur Zikkurat und zu den Säulen von Persepolis.' },
  { id: 'graben', datei: 'graben', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Der Ostafrikanische Graben bei Morgendämmerung, Dunstschichten über einer weiten Ebene.' },
  { id: 'feuerkreis', datei: 'feuer', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine Gruppe sitzt nachts um ein Feuer unter einem Felsüberhang; darüber der Sternenhimmel.' },
  { id: 'catalhoeyuek-innen', datei: 'catal', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Innenraum eines Hauses in Çatalhöyük; Menschen bei einer Bestattung unter dem Boden.',
    referenzFuer: 'catalhoeyuek' },
  { id: 'wechselstation', datei: 'persien', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Pferdewechsel an einer Station der Königsstraße: der Reiter wechselt, die Nachricht läuft weiter.',
    referenzFuer: 'susa' },
  { id: 'roemische-strasse', datei: 'strasse', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine römische Straße läuft schnurgerade bis zum Horizont.', referenzFuer: 'rom' },
  { id: 'bibliothekshoehle', datei: 'dunhuang', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Bündel an Bündel bis zur Decke: die Bibliothekshöhle von Dunhuang.', referenzFuer: 'dunhuang' },
  { id: 'meeresgrund', datei: 'versunken', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Mauerreste auf dem Meeresgrund unter klarem Wasser.', referenzFuer: 'helike' },
  { id: 'kapitel-2-auftakt', datei: 'kap2', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Reifes Ährenfeld auf einem Hang im Abendlicht.' },
  { id: 'kapitel-3-auftakt', datei: 'kap3', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine Zikkurat mit breiter Treppe vor weitem Himmel.' },
  { id: 'kapitel-4-auftakt', datei: 'kap4', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein Torbau aus Säulen und Steinquadern auf einer Anhöhe.' },
  { id: 'kapitel-6-auftakt', datei: 'kap6', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Felsen im Nebel: die Umrisse bleiben unbestimmt.' },
  { id: 'kulturfeld', datei: 'feld', breite: 1920, hoehe: 1080, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein Kulturfeld heute, über der stillen Erhebung eines Siedlungshügels aus jener Zeit.' },
  { id: 'bibliothek', datei: 'bibliothek', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Regale voller Tontafeln in einer Kammer; eine Gestalt hebt eine Tafel ans Licht.',
    referenzFuer: 'ninive' },
  { id: 'baustelle', datei: 'baustelle', breite: 4096, hoehe: 2304, herkunft: 'Freie Rekonstruktion',
    alt: 'Die Großbäckerei für die Baustelle: Brot in Tausenden von Tonformen.',
    referenzFuer: 'gizeh' },
  { id: 'grabung', datei: 'grabung', breite: 1920, hoehe: 1080, herkunft: 'Gesicherter Befund',
    alt: 'Zwei Ausgräber legen einen Fund in geschichtetem Sediment frei, eingemessen mit Schnüren und Nadeln.' },
];
