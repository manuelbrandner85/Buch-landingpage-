import type { Band, BandId, Buch, Kapitel, Reihe, ReiheId, Szene } from '@/data/gemeinsam/typen';
import { REIHE_FAEDEN, STIMMUNG_FAEDEN } from '@/data/faeden';
import { ORTE } from '@/data/gemeinsam/orte';

export { TRENDONIX } from '@/data/gemeinsam/haus';

/**
 * Das Haus ist die Summe seiner Reihen. Eine neue Reihe wird hier eingehängt –
 * sonst nirgends. Die Engine, die Kopfzeile, die Sitemap und die Kapitelseiten
 * fragen bei diesem Modul nach und wissen von keiner einzelnen Reihe etwas.
 */
export const REIHEN: Reihe[] = [REIHE_FAEDEN];

export const HAUS: Record<ReiheId, Reihe> =
  Object.fromEntries(REIHEN.map((r) => [r.id, r]));

/** Die Reihe, mit der das Haus empfängt: die, aus der zuletzt etwas erschienen ist. */
export const LEITREIHE: Reihe = REIHEN[0]!;

export const reiheNach = (id?: ReiheId): Reihe | undefined => (id ? HAUS[id] : undefined);

/** Die Lichtstimmung je Reihe. Kapitelnummern gelten nur innerhalb einer Reihe. */
const STIMMUNGEN: Record<ReiheId, Record<number, [number, number, number]>> = {
  faeden: STIMMUNG_FAEDEN,
};

// ——— Bände ———————————————————————————————————————————————————————————————

export const BAENDE: Band[] = REIHEN.flatMap((r) => r.baende);

/** Nachschlagewerk über alle Reihen hinweg: Band-Kurzname → Band. */
export const WELT: Record<BandId, Band> =
  Object.fromEntries(BAENDE.map((b) => [b.buch.id, b]));

export const reiheZuBand = (id?: BandId): Reihe | undefined =>
  id ? REIHEN.find((r) => r.baende.some((b) => b.buch.id === id)) : undefined;

/**
 * Was das Haus öffentlich zeigt.
 *
 * Ein Band ist vollständig in den Daten, lange bevor er erscheinen darf:
 * Band 3 der Fäden trägt in seiner Buch-DNA die Regel „öffentlich nicht
 * erwähnen, auch nicht andeuten“. Deshalb entscheidet `status` – nicht das
 * Vorhandensein von Daten –, ob Kapitelseiten gebaut werden, ob der Band in
 * der Sitemap steht und ob sein Titel irgendwo auftaucht.
 *
 * „erscheint“ ist offen, aber nicht käuflich: Die Welt lässt sich begehen, es
 * gibt keinen Kaufweg. Aus „in Arbeit“ wird „erscheint“ und daraus
 * „erschienen“; ein anderer Eingriff ist nicht nötig.
 */
export const istOeffentlich = (buch: Buch) => buch.status !== 'in Arbeit';

export const OEFFENTLICHE_BAENDE: Band[] = BAENDE.filter((b) => istOeffentlich(b.buch));
export const OEFFENTLICHE_KAPITEL: Kapitel[] = OEFFENTLICHE_BAENDE.flatMap((b) => b.kapitel);
export const ALLE_KAPITEL: Kapitel[] = BAENDE.flatMap((b) => b.kapitel);
export const REISE: Szene[] = BAENDE.flatMap((b) => b.szenen);

/** Reihen, von denen überhaupt etwas gezeigt werden darf. */
export const OEFFENTLICHE_REIHEN: Reihe[] =
  REIHEN.filter((r) => r.baende.some((b) => istOeffentlich(b.buch)));

export const oeffentlicheBaendeVon = (r: Reihe): Band[] =>
  r.baende.filter((b) => istOeffentlich(b.buch));

/**
 * Das Buch, mit dem das Haus wirbt: das zuletzt erschienene. Solange nichts
 * erschienen ist, das, was als Nächstes erscheint. Nie eines, das schweigt.
 */
export const LEITBUCH: Buch | undefined = (() => {
  const buecher = BAENDE.map((b) => b.buch).filter(istOeffentlich);
  return buecher.filter((b) => b.status === 'erschienen').at(-1) ?? buecher[0];
})();

/** Alle zeigbaren Bücher, jüngste Reihe zuerst – für Bücherwand und Sitemap. */
export const OEFFENTLICHE_BUECHER: Buch[] = OEFFENTLICHE_BAENDE.map((b) => b.buch);

export const buchNach = (id?: BandId): Buch | undefined => (id ? WELT[id]?.buch : undefined);

// ——— Die begehbare Reise ————————————————————————————————————————————————

/**
 * Drei Szenen gehören nicht einem Band, sondern der Welt der Reihe, und stehen
 * deshalb immer am Ende: die Karte, auf der alles zusammenkommt, der Epilog mit
 * dem Leitsatz und der Bücherbereich. Ohne diesen Griff läge der Schluss von
 * Band 1 mitten in der Reise. Eine Reihe ohne diese Szenen hat sie einfach nicht.
 */
const SCHLUSS = ['karte', 'epilog', 'buecher'];

export function reiseVon(reihe: Reihe): Szene[] {
  const alle = reihe.baende.flatMap((b) => b.szenen);
  const offen = oeffentlicheBaendeVon(reihe).flatMap((b) => b.szenen);
  return [
    ...offen.filter((s) => !SCHLUSS.includes(s.id)),
    ...SCHLUSS.map((id) => alle.find((s) => s.id === id)).filter((s): s is Szene => Boolean(s)),
  ];
}

/** Die Reise der Leitreihe – das, was unter `/faeden` begehbar ist. */
export const REISE_OEFFENTLICH: Szene[] = reiseVon(LEITREIHE);

// ——— Nachschlagen ————————————————————————————————————————————————————————

/**
 * Kapitelnummern sind innerhalb einer Reihe eindeutig, nicht darüber hinaus:
 * Auch das erste Kapitel einer zweiten Reihe trägt die Eins. Wer den Band kennt,
 * gibt ihn mit – dann wird nur in dessen Reihe gesucht. Ohne Bandangabe gewinnt
 * die erste Reihe, in der die Nummer vorkommt.
 */
export function kapitelNach(id?: number, bandId?: BandId): Kapitel | undefined {
  if (id === undefined) return undefined;
  const reihe = reiheZuBand(bandId);
  const suchraum = reihe ? reihe.baende.flatMap((b) => b.kapitel) : ALLE_KAPITEL;
  return suchraum.find((k) => k.id === id);
}

/** Die Bandnummer zu einer BandId – für die Seitenangabe „Band 2, Seite 116“. */
export const bandNummer = (id?: BandId) => (id ? WELT[id]?.buch.nummer ?? 1 : 1);

export const bandZuKapitel = (id?: number, bandId?: BandId): Buch | undefined => {
  const k = kapitelNach(id, bandId);
  return k ? WELT[k.bandId]?.buch : undefined;
};

export const assetNach = (id?: string) =>
  id ? BAENDE.flatMap((b) => b.assets).find((a) => a.id === id) : undefined;

/**
 * Die Kinoebene fragt hier nach, sonst bekäme jedes Kapitel jenseits der ersten
 * Reihe stumpf [1, 1, 1].
 */
export const stimmungFuer = (kapitel?: number, bandId?: BandId): [number, number, number] => {
  const reihe = reiheZuBand(bandId) ?? LEITREIHE;
  return STIMMUNGEN[reihe.id]?.[kapitel ?? 1] ?? [1, 1, 1];
};

/** Orte, die in mehr als einem Band vorkommen – die Klammer zwischen den Bänden. */
export const wiederkehrendeOrte = () =>
  ORTE.filter((o) => new Set(o.vorkommen.map((v) => v.bandId)).size > 1);

/** Die erste begehbare Szene eines Kapitels – das Ziel, wenn man von der Karte springt. */
export const szeneZuKapitel = (kapitel?: number, bandId?: BandId): Szene | undefined => {
  if (kapitel === undefined) return undefined;
  const reihe = reiheZuBand(bandId);
  const raum = reihe ? reihe.baende.flatMap((b) => b.szenen) : REISE;
  return raum.find((s) => s.kapitelId === kapitel && (s.typ === 'motiv' || s.typ === 'interaktion'))
    ?? raum.find((s) => s.kapitelId === kapitel);
};
