'use client';

import { useMemo, useState } from 'react';
import { BEGRIFF_FORMEN, type Begriff } from '@/data/gemeinsam/begriffe';

/**
 * Im Buch stehen erklärte Fachbegriffe in Gold. Hier auch – nur lassen sie sich
 * antippen. Die Erklärung erscheint unter dem Absatz, nicht als Überlagerung:
 * Ein Kasten, der den Text verdeckt, unterbricht das Lesen.
 */
export function Begriffstext({ text }: { text: string }) {
  const [offen, setOffen] = useState<Begriff | null>(null);

  const teile = useMemo(() => zerlegen(text), [text]);

  return (
    <>
      <p className="fliess">
        {teile.map((t, i) =>
          typeof t === 'string' ? (
            <span key={i}>{t}</span>
          ) : (
            <button key={i} type="button" className="begriff"
              aria-expanded={offen?.id === t.begriff.id}
              onClick={() => setOffen((a) => (a?.id === t.begriff.id ? null : t.begriff))}>
              {t.form}
            </button>
          ))}
      </p>
      {offen && (
        <p className="begriff-erklaerung" aria-live="polite">
          <b>{offen.wort}</b>{offen.erklaerung}
          <span className="seite"> · Glossar, Band 1</span>
        </p>
      )}
    </>
  );
}

type Stueck = string | { form: string; begriff: Begriff };

/** Text an bekannten Begriffen zerlegen – nur an Wortgrenzen, nur beim ersten Treffer. */
function zerlegen(text: string): Stueck[] {
  const gefunden = new Set<string>();
  let stuecke: Stueck[] = [text];

  for (const { form, begriff } of BEGRIFF_FORMEN) {
    if (gefunden.has(begriff.id)) continue;
    const neu: Stueck[] = [];
    let getroffen = false;

    for (const s of stuecke) {
      if (typeof s !== 'string' || getroffen) { neu.push(s); continue; }
      const stelle = s.search(new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`));
      if (stelle < 0) { neu.push(s); continue; }
      getroffen = true;
      if (stelle > 0) neu.push(s.slice(0, stelle));
      neu.push({ form: s.slice(stelle, stelle + form.length), begriff });
      const rest = s.slice(stelle + form.length);
      if (rest) neu.push(rest);
    }
    if (getroffen) { gefunden.add(begriff.id); stuecke = neu; }
  }
  return stuecke;
}
