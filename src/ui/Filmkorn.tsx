/**
 * Feines Korn über allem – nimmt den Bildern das Digitale.
 *
 * Nur für die DOM-Fassung. Die Kinoebene rechnet ihr Korn im Shader, dort ist
 * es kostenlos. Diese Schicht liegt dagegen als ganzseitige Fläche mit
 * `mix-blend-mode` über dem Bild: Der Browser muss dafür in jedem Bild das
 * gesamte Fenster neu mischen – zweimal dasselbe Korn, und das teurere davon
 * für nichts.
 */
export function Filmkorn({ an }: { an: boolean }) {
  if (!an) return null;
  return <div className="korn" aria-hidden="true" />;
}
