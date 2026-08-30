import type { Metadata } from 'next';
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google';
import '@/styles/global.css';
import { TRENDONIX } from '@/data/gemeinsam/haus';
import { Zaehler } from '@/ui/Zaehler';
import { Zustimmung } from '@/ui/Zustimmung';

// Nur die Schnitte, die tatsächlich vorkommen. Jeder zusätzliche Schnitt ist
// eine eigene Datei: Vorher wurden vier Schriftdateien geladen, obwohl die
// Halbfetten nirgends gesetzt sind.
const display = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400'],
  style: ['normal', 'italic'], variable: '--display', display: 'swap',
});
const body = EB_Garamond({
  subsets: ['latin'], weight: ['400'],
  style: ['normal', 'italic'], variable: '--body', display: 'swap',
});

/**
 * Der Rahmen gehört dem Haus, nicht einem Titel: Jede Seite ergänzt ihren
 * eigenen Titel, und was hier steht, gilt für alle – auch für die Reihen, die
 * noch nicht geschrieben sind.
 */
export const metadata: Metadata = {
  title: {
    default: `${TRENDONIX.name} – ${TRENDONIX.versprechen}`,
    template: `%s · ${TRENDONIX.name}`,
  },
  description: TRENDONIX.kurzfassung,
  applicationName: TRENDONIX.name,
  ...(process.env.NEXT_PUBLIC_BASIS_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_BASIS_URL) }
    : {}),
  // Der Bau-Spiegel unter github.io hält sich aus den Suchergebnissen heraus.
  ...(process.env.NEXT_PUBLIC_SPIEGEL === '1'
    ? { robots: { index: false, follow: false } }
    : {
      /**
       * Der Nachweis, dass diese Domain uns gehört — für Pinterest.
       *
       * Ohne ihn ordnet Pinterest die Pins niemandem zu: kein Name und kein
       * Logo am Pin, keine Rich Pins, keine Klickzahlen je Domain — und wer
       * ein Bild von der Seite weiterpinnt, hängt seinen eigenen Link daran.
       * Der Nachweis kostet nichts als diese eine Zeile.
       *
       * Es ist eine tote Zeichenkette, kein Skript: Sie lädt nichts nach,
       * setzt kein Cookie und stellt keine Verbindung zu Pinterest her. Das
       * ist der Unterschied zum „Pinterest-Tag", den der Business Hub
       * daneben anbietet — der ist ein Besucherverfolger mit Cookie und
       * kommt hier nicht auf die Seite.
       *
       * Nur auf der eigenen Domain. Ein Nachweis für trendonix-buecher.de
       * hat auf github.io nichts zu suchen.
       */
      verification: { other: { 'p:domain_verify': 'f79d235806383d1a9cbeefd14f2082ef' } },
    }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body>{children}<Zaehler /><Zustimmung /></body>
    </html>
  );
}
