import type { Metadata } from 'next';
import { Cormorant_Garamond, EB_Garamond } from 'next/font/google';
import '@/styles/global.css';

const display = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400', '500'],
  style: ['normal', 'italic'], variable: '--display', display: 'swap',
});
const body = EB_Garamond({
  subsets: ['latin'], weight: ['400', '500'],
  style: ['normal', 'italic'], variable: '--body', display: 'swap',
});

export const metadata: Metadata = {
  title: 'Die unsichtbaren Fäden – Die Welt der drei Bände',
  description:
    'Eine begehbare Welt zum Bildband „Die unsichtbaren Fäden – Band 1: Ursprung und Ordnung“. Vom ersten Feuer bis zu den ersten Reichen.',
  openGraph: {
    type: 'book',
    title: 'Die unsichtbaren Fäden – Band 1: Ursprung und Ordnung',
    description:
      'Sieben Millionen Jahre in einem Band – erzählt entlang der Frage, wer etwas aufschrieb und wem es nützte.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
