import type { Metadata } from 'next';
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google';
import '@/styles/global.css';
import { TRENDONIX } from '@/data/gemeinsam/haus';
import { weg, wegVorschau } from '@/world/wege';
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
    // Der Treffer der Startseite trägt den Namen und das Fach, nicht das
    // Motto: Nach „was zwischen den Dingen liegt“ sucht niemand, nach
    // „Trendonix“ und nach „Sachbuch“ schon.
    default: TRENDONIX.suchzeile,
    template: `%s · ${TRENDONIX.name}`,
  },
  description: TRENDONIX.kurzfassung,
  applicationName: TRENDONIX.name,
  /**
   * Ein Vorschaubild für jede Seite, die keines mitbringt.
   *
   * Bis zum 30.08.2026 hatten dreizehn von zweihundertzwanzig Seiten eines.
   * Alle anderen — Kapitel, Orte, Begriffe, Über, Impressum — wurden beim
   * Teilen als graues Rechteck mit Adresszeile angezeigt. Ein Link ohne Bild
   * wird auf jeder Plattform seltener angeklickt als einer mit; das ist kein
   * Geschmack, sondern die Fläche, die er im Verlauf einnimmt.
   *
   * Was hier steht, gilt als Rückfallweg: Next ersetzt den ganzen Block,
   * sobald eine Seite ihren eigenen `openGraph` setzt. Kapitel- und Ortsseiten
   * tun das mit ihrem eigenen Motiv — der Rest erbt das Haus.
   */
  openGraph: {
    type: 'website',
    siteName: TRENDONIX.name,
    locale: 'de_DE',
    images: wegVorschau('haus'),
  },
  // Ohne diese Zeile zeigt X den Link als schmale Zeile mit Daumennagel statt
  // als Bild. Es kostet nichts und gilt für jede Seite.
  twitter: { card: 'summary_large_image' },
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
      <head>
        {/*
          Der Feed des Journals – die einzige Stelle, an der er auffindbar ist.

          Ein Atom-Feed steht nicht im Text, er steht im Kopf: Leseprogramme,
          Sammeldienste und ein Teil der Automatisierungen suchen genau diese
          Zeile und finden sonst nichts. Sie gehört bewusst nicht in die
          Metadaten-Schnittstelle: Dort läge sie unter `alternates`, und jede
          Seite, die dort ihre kanonische Adresse einträgt, würde sie wieder
          löschen. Hier steht sie auf jeder der zweihundertzwanzig Seiten.
        */}
        <link rel="alternate" type="application/atom+xml"
          title={`${TRENDONIX.name} – Journal`} href={weg('/feed.xml')} />
        {/*
          Die nächste Seite ist schon da, bevor der Finger sie berührt.

          Diese Seiten sind statisch erzeugt und komplett ohne Datenbank – die
          einzige Zeit, die zwischen Klick und Bild vergeht, ist Netz. Genau die
          nimmt der Browser hier vorweg: Sobald der Zeiger 200 Millisekunden auf
          einem Link ruht oder die Maustaste heruntergeht, holt er die Seite.
          Wer wirklich klickt, sieht sie ohne Ladeschritt; wer nur darüberfährt,
          hat nichts verloren.

          Bewusst `prefetch` und nicht `prerender`: Prefetch holt das Dokument,
          Prerender baut es vollständig auf – mit Skripten, Bildern und Videos.
          Auf einer Seite mit bewegten Gründen wäre das eine ganze zweite Seite
          im Hintergrund, für einen Klick, der vielleicht nie kommt.

          `eagerness: moderate` ist der Mittelweg: nicht bei jedem Blick, aber
          früh genug. Browser, die den Standard nicht kennen, überlesen den
          Block – er ist ein Zugewinn, keine Bedingung.
        */}
        <script type="speculationrules"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            prefetch: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }],
          }) }} />
      </head>
      <body>{children}<Zaehler /><Zustimmung /></body>
    </html>
  );
}
