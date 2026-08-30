import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ORTE, ortNach } from '@/data/gemeinsam/orte';
import { WELT, kapitelNach, reiheNach, REIHEN_MIT_KAPITELN } from '@/world/registry';
import {
  wegBegriffe, wegHaus, wegKapitel, wegOrt, wegReihe, wegVollstaendig,
} from '@/world/wege';
import { brotkrumen, ort as ortDatenblatt } from '@/world/schema';
import { Datenblatt } from '@/ui/Datenblatt';
import { Quelle } from '@/ui/Quelle';
import { Rueckweg } from '@/ui/Rueckweg';

/**
 * Ein Ort gehört der Welt, nicht einem Band – deshalb listet er alle Vorkommen.
 * Er gehört aber sehr wohl einer Reihe: Die Welt der Fäden ist nicht die Welt
 * der nächsten Reihe, und die Adresse sagt das.
 *
 * Diese Seiten waren bis zum 27.08.2026 sechsundfünfzig Wörter lang: Name, ein
 * Satz, eine Liste. Einundsechzig solcher Seiten sind zusammen kein Angebot,
 * sondern ein Verdacht – Suchmaschinen nennen so etwas dünn und behandeln den
 * Rest der Seite entsprechend.
 *
 * Was jetzt hier steht, ist nicht dazuerfunden, sondern gehoben: jede Szene des
 * Buches, die den Ort beim Namen nennt, mit ihrem Absatz, ihrer Zeile „Woher
 * wir das wissen“ und ihrer Buchseite. Dazu die Kapitel, die ihn brauchen, und
 * die Orte, die in denselben Kapiteln liegen. Alles aus dem Band.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return REIHEN_MIT_KAPITELN.flatMap((r) => ORTE.map((o) => ({ reihe: r.id, id: o.id })));
}

/** Der erste Teil eines Satzes – für den Titel, der bei etwa 60 Zeichen abreißt. */
// 30 Zeichen: Der Titel traegt schon den Ortsnamen und die angehaengte Marke;
// bei mehr riss Google mitten im Wort ab.
const anriss = (text: string, laenge = 30) => {
  const erster = text.split(/[–:;.]/)[0]?.trim() ?? text;
  return erster.length > laenge ? `${erster.slice(0, laenge - 1).trim()}…` : erster;
};

export async function generateMetadata(
  { params }: { params: Promise<{ reihe: string; id: string }> }): Promise<Metadata> {
  const { reihe, id } = await params;
  const r = reiheNach(reihe);
  const o = ortNach(id);
  if (!o || !r) return {};
  return {
    // Der Ortsname zuerst: Danach wird gesucht, nicht nach dem Reihentitel.
    title: `${o.name} – ${anriss(o.text)}`,
    description: o.text,
    alternates: { canonical: wegVollstaendig(wegOrt(r.id, o.id)) ?? wegOrt(r.id, o.id) },
  };
}

/** Grad in Himmelsrichtungen, wie auf einer Karte. */
const grad = (wert: number, achse: 'breite' | 'laenge') => {
  const richtung = achse === 'breite' ? (wert >= 0 ? 'N' : 'S') : (wert >= 0 ? 'O' : 'W');
  return `${Math.abs(wert).toFixed(2).replace('.', ',')}° ${richtung}`;
};

export default async function OrtSeite(
  { params }: { params: Promise<{ reihe: string; id: string }> }) {
  const { reihe, id } = await params;
  const r = reiheNach(reihe);
  const ort = ortNach(id);
  if (!r || !ort) notFound();

  // Die Stellen im Buch, an denen der Ort vorkommt: Szenen seiner Kapitel, in
  // deren Text sein Name steht. Bewusst nicht das ganze Buch durchsucht – ein
  // Name wie „Rom“ stünde sonst auch dort, wo dieser Ort nicht gemeint ist.
  const stellen = ort.vorkommen.flatMap((v) => {
    const szenen = WELT[v.bandId]?.szenen ?? [];
    return szenen
      .filter((s) => s.kapitelId === v.kapitel)
      .filter((s) => [s.fliesstext, s.zitat, s.titel, s.unterzeile]
        .some((t) => t?.includes(ort.name)))
      .map((s) => ({ szene: s, kapitel: v.kapitel }));
  });

  // Nachbarn: Orte aus denselben Kapiteln. Wer hier liest, liest meist weiter –
  // und für Suchmaschinen ist es der Faden von Seite zu Seite.
  const kapitelnummern = [...new Set(ort.vorkommen.map((v) => v.kapitel))];
  const nachbarn = ORTE.filter((o) => o.id !== ort.id
    && o.vorkommen.some((v) => kapitelnummern.includes(v.kapitel)));

  const seiten = [...new Set(ort.vorkommen.flatMap((v) => v.seiten))].sort((a, b) => a - b);

  return (
    <main className="lesefassung">
      <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
      <p className="eyebrow">Ort in {r.titel}</p>
      <h1>{ort.name}</h1>
      <p className="unterzeile">{ort.text}</p>

      <dl className="ortdaten">
        <div>
          <dt>Lage</dt>
          <dd>{grad(ort.lat, 'breite')} · {grad(ort.lon, 'laenge')}</dd>
        </div>
        <div>
          <dt>Im Buch</dt>
          <dd>
            {kapitelnummern.length === 1 ? 'Kapitel ' : 'Kapitel '}
            {kapitelnummern.join(', ')} · {seiten.length === 1 ? 'Seite ' : 'Seiten '}
            {seiten.join(', ')}
          </dd>
        </div>
        {ort.zustaende && ort.zustaende.length > 0 && (
          <div>
            <dt>Schichten</dt>
            <dd>{ort.zustaende.join(' · ')}</dd>
          </div>
        )}
      </dl>

      {stellen.length > 0 && (
        <>
          <h2>Was im Buch darüber steht</h2>
          {stellen.map(({ szene, kapitel }) => (
            <article key={szene.id}>
              {szene.titel && <h3>{szene.titel}</h3>}
              {szene.fliesstext && <p>{szene.fliesstext}</p>}
              {szene.zitat && <blockquote>{szene.zitat}</blockquote>}
              {szene.zahlen && szene.zahlen.length > 0 && (
                <ul className="ortzahlen">
                  {szene.zahlen.map((z, i) => (
                    <li key={i}><b>{z.wert}</b> {z.label}</li>
                  ))}
                </ul>
              )}
              {szene.quelle && (
                <Quelle text={szene.quelle} seite={szene.buchseite}
                  band={WELT[szene.bandId]?.buch.nummer} />
              )}
              <p className="seite">
                <a href={wegKapitel(r.id, kapitel)}>
                  Weiter in Kapitel {kapitel} – {kapitelNach(kapitel, szene.bandId)?.titel}
                </a>
              </p>
            </article>
          ))}
        </>
      )}

      <h2>Vorkommen</h2>
      <ul>
        {ort.vorkommen.map((v, i) => (
          <li key={i}>
            <a href={wegKapitel(r.id, v.kapitel)}>
              Kapitel {v.kapitel} – {kapitelNach(v.kapitel, v.bandId)?.titel}
            </a>
            {' · Seiten '}{v.seiten.join(', ')}
          </li>
        ))}
      </ul>

      {nachbarn.length > 0 && (
        <>
          <h2>Orte in denselben Kapiteln</h2>
          <ul>
            {nachbarn.map((o) => (
              <li key={o.id}>
                <a href={wegOrt(r.id, o.id)}>{o.name}</a> – {o.text}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="quelle">
        <b>Hinweis</b>Die Koordinaten dienen der Verortung, nicht der Vermessung.
        Alle Angaben auf dieser Seite stammen aus dem Band; die Seitenzahlen stehen dabei.
      </p>
      <Datenblatt daten={ortDatenblatt({
        name: ort.name, beschreibung: ort.text,
        lat: ort.lat, lon: ort.lon, weg: wegOrt(r.id, ort.id),
      })} />
      <Datenblatt daten={brotkrumen([
        { name: 'Start', weg: wegHaus() },
        { name: r.titel, weg: wegReihe(r.id) },
        { name: ort.name, weg: wegOrt(r.id, ort.id) },
      ])} />
      <nav className="fusszeile">
        <Rueckweg nach={wegReihe(r.id)} text={`Zurück in ${r.titel}`} />
        <a href={wegBegriffe(r.id)}>Begriffe</a>
      </nav>
    </main>
  );
}
