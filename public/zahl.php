<?php
/**
 * Die Zahl unter dem Copyright.
 *
 * Gibt zurueck: {"gesamt": <alle Zeilen>, "heute": <Zeilen von heute>}
 *
 * Gelesen wird Zeile fuer Zeile statt in einem Stueck. Der Unterschied faellt
 * heute nicht auf, in zwei Jahren schon: Eine Datei mit einer halben Million
 * Zeilen passt nicht mehr bequem in den Speicher, die Schleife hier braucht
 * davon immer nur eine.
 *
 * Das Datum steht am Zeilenanfang, zehn Zeichen lang. Deshalb genuegt ein
 * Vergleich der ersten zehn Zeichen - kein Zerlegen, kein Suchen.
 */
declare(strict_types=1);

ini_set('display_errors', '0');

$datei = __DIR__ . '/besuche.csv';

header('Content-Type: application/json; charset=utf-8');
// Eine Zahl, die eine Stunde alt ist, ist keine Zahl.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$gesamt = 0;
$heute = 0;
$heutigesDatum = date('Y-m-d');

// Gibt es die Datei noch nicht, sind es null und null - kein Fehler, sondern
// der richtige Anfangswert. Deshalb das @ und kein Abbruch.
$hand = @fopen($datei, 'rb');
if ($hand !== false) {
    while (($zeile = fgets($hand)) !== false) {
        if (trim($zeile) === '') {
            continue;
        }
        $gesamt++;
        if (strncmp($zeile, $heutigesDatum, 10) === 0) {
            $heute++;
        }
    }
    fclose($hand);
}

echo json_encode(['gesamt' => $gesamt, 'heute' => $heute]);
