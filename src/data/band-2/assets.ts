import type { Asset } from '../gemeinsam/typen';

/**
 * Motive für Band 2.
 *
 * Wie in Band 1 gilt: Diese Bilder sind **eigens für die Website erzeugt** und
 * nicht die Abbildungen aus dem Buch. Sie folgen den Szenen des Bandes und
 * tragen dieselbe Herkunftsangabe wie dort – „Freie Rekonstruktion“ –, aber wer
 * Buch und Website nebeneinanderlegt, sieht zwei verschiedene Bilder derselben
 * Szene. Erzeugt über kie.ai (nano-banana-2), Querformat 16:9, 2K.
 *
 * Die Tiefenkarten stammen aus Depth Anything V2
 * (`npm run tiefenkarten -- --band=band-2`) und tragen die Parallaxe der
 * Kinoebene: Was vorne liegt, wandert beim Fahren stärker als der Hintergrund.
 *
 * Die Einträge stehen bewusst ausgeschrieben und nicht über eine Hilfsfunktion –
 * `scripts/pruefe-welt.mjs` liest diese Datei als Text und prüft, ob zu jedem
 * Motiv die Bilddateien tatsächlich vorliegen.
 */
export const ASSETS_BAND_2: Asset[] = [
  { id: 'b2-kap07-auftakt', bandId: 'band-2', datei: 'b2-kap07-auftakt',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Innenraum einer spätantiken Kuppelbasilika, Goldmosaik in der Kuppel, herabgestürztes Mauerwerk am Boden.' },
  { id: 'b2-kap07-motiv', bandId: 'band-2', datei: 'b2-kap07-motiv',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Ein Schreibpult mit ungebundenen Lagen Pergament, Feder und Öllampe; der übrige Raum liegt im Dunkeln.' },
  { id: 'b2-kap08-auftakt', bandId: 'band-2', datei: 'b2-kap08-auftakt',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Romanisches Kirchenschiff bei Nacht, schwere Rundpfeiler, ein fernes kerzenbeleuchtetes Altarhaus.' },
  { id: 'b2-kap08-motiv', bandId: 'band-2', datei: 'b2-kap08-motiv',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine schwere Tür mit drei eisernen Schlössern in einer Bruchsteinwand, daneben eine beschlagene Truhe.' },
  { id: 'b2-kap09-auftakt', bandId: 'band-2', datei: 'b2-kap09-auftakt',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Hafenanlagen des Mittelmeers vor Sonnenaufgang, vertäute Handelsgaleeren, Arkaden eines Lagerhofs.' },
  { id: 'b2-kap09-motiv', bandId: 'band-2', datei: 'b2-kap09-motiv',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine Reihe eisenbeschlagener Truhen in einem Gewölbe, eine davon offen und leer, daneben ein aufgeschlagenes Buch.' },
  { id: 'b2-kap10-auftakt', bandId: 'band-2', datei: 'b2-kap10-auftakt',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Werkstatt eines Kartenmachers im 16. Jahrhundert, Zeichentisch mit Zirkel, dahinter Schiffe im dunklen Hafen.' },
  { id: 'b2-kap10-motiv', bandId: 'band-2', datei: 'b2-kap10-motiv',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Nahsicht auf eine Karte: eine gerade gezogene Linie quer über einen unvermessenen Ozean, Zirkel und Beschwerer.' },
  { id: 'b2-kap11-auftakt', bandId: 'band-2', datei: 'b2-kap11-auftakt',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Fabrikbauten an einem Kanal in der Dämmerung, Ziegelschlote, schwarzes Wasser mit wenigen erleuchteten Fenstern.' },
  { id: 'b2-kap11-motiv', bandId: 'band-2', datei: 'b2-kap11-motiv',
    breite: 2752, hoehe: 1536, herkunft: 'Freie Rekonstruktion',
    alt: 'Eine hölzerne Handpresse in einer kleinen Werkstatt, frisch gedruckte Bogen auf Leinen darüber.' },
  { id: 'welt-ankunft', bandId: 'band-2', datei: 'welt-ankunft',
    breite: 2752, hoehe: 1536, herkunft: 'Eigene Darstellung',
    alt: 'Ein einzelner goldener Lichtfaden, der sich durch einen tiefblauen Raum zieht.' },
  { id: 'welt-karte', bandId: 'band-2', datei: 'welt-karte',
    breite: 2752, hoehe: 1536, herkunft: 'Eigene Darstellung',
    alt: 'Sehr dunkler Nachthimmel über einem kaum sichtbaren Geländerelief, ein Anflug von Gold an einem Grat.' },
];
