/**
 * Zeilenmasken für Überschriften.
 *
 * Eine Überschrift, die als Block einblendet, wirkt wie ein Dia. Zeilenweise
 * hinter einer Maske aufzusteigen, wirkt wie Film. Dafür müssen die Zeilen erst
 * gefunden werden – der Browser bricht den Text, nicht wir.
 */
export function zerlegeZeilen(el) {
  if (!el || el.dataset.zerlegt === '1') return;
  // `textContent` verschluckt harte Umbrüche: Aus „Sprache<br>und“ würde
  // „Spracheund“. Deshalb werden <br> vorher zu Leerzeichen – die Zeilen
  // ergeben sich ohnehin aus dem Umbruch des Browsers, nicht aus dem Markup.
  const text = (el.innerHTML ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ');
  if (!text.trim()) return;

  // Jedes Wort einzeln, um die Zeilenumbrüche messen zu können.
  el.innerHTML = text.split(/\s+/).filter(Boolean)
    .map((w) => `<span class="wort">${w}</span>`).join(' ');

  const woerter = [...el.querySelectorAll('.wort')];
  const zeilen = [];
  let letzteHoehe = null;
  for (const w of woerter) {
    const oben = Math.round(w.offsetTop);
    if (oben !== letzteHoehe) { zeilen.push([]); letzteHoehe = oben; }
    zeilen[zeilen.length - 1].push(w.textContent);
  }

  el.innerHTML = zeilen
    .map((z, i) => `<span class="zeile"><span class="zeile-innen" style="--verzug:${i * 0.09}s">${z.join(' ')}</span></span>`)
    .join(' ');
  el.dataset.zerlegt = '1';
}

/** Alle Überschriften einer Seite vorbereiten und beim Erreichen aufdecken. */
export function zeilenAufdecken(auswahl = '[data-auf] , h2[data-auf]') {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ziele = [...document.querySelectorAll(auswahl)]
    .filter((e) => /^(H1|H2|BLOCKQUOTE)$/.test(e.tagName));
  ziele.forEach(zerlegeZeilen);

  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (e.isIntersecting) { e.target.classList.add('zeilen-offen'); beobachter.unobserve(e.target); }
    }
  }, { threshold: 0.25 });
  ziele.forEach((z) => beobachter.observe(z));
  return () => beobachter.disconnect();
}
