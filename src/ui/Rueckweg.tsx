/** Der Weg zurück in die Welt. Auf jeder Leseseite oben und unten. */
export function Rueckweg({ nach = '/', text = 'Zurück in die Welt' }: { nach?: string; text?: string }) {
  const basis = process.env.NEXT_PUBLIC_BASIS_PFAD ?? '';
  return <a className="rueckweg" href={`${basis}${nach}`}>← {text}</a>;
}
