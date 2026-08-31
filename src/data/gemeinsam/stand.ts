/**
 * Der Stand des Inhalts.
 *
 * Die Sitemap nennt Suchmaschinen zu jeder Seite ein Datum. Das darf nicht
 * jeden Tag das heutige sein: Wer täglich behauptet, alles sei neu, wird nach
 * kurzer Zeit nicht mehr geglaubt – und Google liest die Angabe dann gar nicht
 * mehr. Deshalb steht hier ein Datum, das nur mitwandert, wenn sich am Inhalt
 * wirklich etwas ändert. Journalbeiträge bringen ihr eigenes Datum mit.
 */
export const STAND = '2026-08-31';

/**
 * Von wann die Preise auf der Buchseite sind.
 *
 * Preise stehen bei Amazon, nicht hier – hier steht eine Abschrift. Eine
 * Abschrift ohne Datum ist eine Behauptung; mit Datum ist sie eine Auskunft.
 * Ändert sich ein Preis, wandert dieses Datum mit.
 */
export const PREISSTAND = '31. August 2026';
