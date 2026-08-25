import type { BandId, ReiheId } from '@/data/gemeinsam/typen';
import { BASIS_PFAD } from './bilder';

/**
 * Adressen an einer Stelle.
 *
 * Zwei Gründe: Erstens liegt die Seite unter GitHub Pages in einem Unterordner,
 * unter einer eigenen Domain aber in der Wurzel – ein nacktes `href="/welt/…"`
 * geht dort ins Leere, weil `basePath` nur `next/link` erreicht, nicht das
 * gewöhnliche Anker-Element. Zweitens hängt die Adresse jetzt an der Reihe;
 * wo das Haus wächst, soll niemand Pfade zusammenkleben müssen.
 */
export const weg = (pfad: string) => `${BASIS_PFAD}${pfad}`;

export const wegHaus = () => weg('/');
export const wegReihe = (reihe: ReiheId) => weg(`/${reihe}/`);
/** Die Welt eines Bandes – dort steht nur, was diesem Band gehört. */
export const wegWelt = (reihe: ReiheId, band: BandId) => weg(`/${reihe}/${band}/`);
export const wegKapitel = (reihe: ReiheId, nummer: number) => weg(`/${reihe}/kapitel/${nummer}/`);
export const wegOrt = (reihe: ReiheId, id: string) => weg(`/${reihe}/ort/${id}/`);
export const wegBegriffe = (reihe: ReiheId) => weg(`/${reihe}/begriffe/`);
export const wegBuch = (band: BandId) => weg(`/buch/${band}/`);
export const wegUeber = () => weg('/ueber/');
export const wegLeseprobe = (datei: string) => weg(`/leseprobe/${datei}`);
export const wegImpressum = () => weg('/impressum/');

/**
 * Eine vollständige Adresse mit Schema und Hostnamen.
 *
 * Vorschaubilder für geteilte Links müssen absolut sein – ein Netzwerk, das
 * eine Vorschau baut, hat keinen Kontext, gegen den es einen relativen Pfad
 * auflösen könnte. Ohne Basis-URL gibt es kein Bild statt eines falschen.
 */
export const wegAbsolut = (pfad: string): string | undefined => {
  const basis = process.env.NEXT_PUBLIC_BASIS_URL;
  return basis ? `${basis.replace(/\/$/, '')}${weg(pfad)}` : undefined;
};

/** Das Vorschaubild einer Seite, wenn es eines gibt. */
export const wegVorschau = (name: string) => {
  const url = wegAbsolut(`/og/${name}.jpg`);
  return url ? [{ url, width: 1200, height: 630 }] : undefined;
};
