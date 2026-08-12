/** Die Zeile „Woher wir das wissen“ – im Buch steht sie auf jeder Seite. */
export function Quelle({ text, seite, label = 'Woher wir das wissen' }:
  { text?: string; seite?: number; label?: string }) {
  if (!text) return null;
  return (
    <p className="quelle">
      <b>{label}</b>{text}
      {seite && <span className="seite"> · Band 1, Seite {seite}</span>}
    </p>
  );
}
