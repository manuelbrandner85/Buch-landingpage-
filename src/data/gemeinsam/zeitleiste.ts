/**
 * Die Falt-Zeitleiste des Buches (Band 1, S. 205/206).
 * Drei Bänder mit je eigenem logarithmischem Maßstab – deshalb ist `position`
 * ein gestalterischer Wert, keine lineare Jahresangabe.
 */
export interface ZeitBand {
  name: string;
  marken: { jahr: string; was: string; position: number }[];
}

export const ZEITLEISTE: ZeitBand[] = [
  { name: 'Menschwerdung', marken: [
    { jahr: '7.000.000', was: 'Älteste Homininen', position: 2 },
    { jahr: '3.300.000', was: 'Erste Steinwerkzeuge', position: 33 },
    { jahr: '1.900.000', was: 'Homo erectus', position: 63 },
    { jahr: '800.000', was: 'Sicherer Feuergebrauch', position: 92 },
  ]},
  { name: 'Sesshaftigkeit', marken: [
    { jahr: '73.000', was: 'Gravierter Ocker, Blombos', position: 16 },
    { jahr: '45.000', was: 'Ausbreitung nach Europa', position: 47 },
  ]},
  { name: 'Städte und Imperien', marken: [
    { jahr: '5.400', was: 'Erste Stadtstaaten', position: 8 },
    { jahr: '5.100', was: 'Reichseinigung Ägypten', position: 24 },
    { jahr: '4.700', was: 'Schrift wird alltäglich', position: 44 },
    { jahr: '3.750', was: 'Stele Hammurabis', position: 76 },
  ]},
];
