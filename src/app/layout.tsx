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
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body>{children}<Zaehler /><Zustimmung /></body>
    </html>
  );
}
