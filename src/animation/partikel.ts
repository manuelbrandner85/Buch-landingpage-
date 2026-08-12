'use client';

/**
 * Funken über dem Feuer, Staub in der Kammer.
 * Läuft nur, solange die Szene sichtbar ist – auf Mobilgeräten mit halber Dichte.
 */
export type PartikelArt = 'funken' | 'staub';

interface Teilchen { x: number; y: number; r: number; v: number; d: number; leben: number }

export function startePartikel(canvas: HTMLCanvasElement, art: PartikelArt): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const mobil = window.matchMedia('(max-width: 900px)').matches;
  const max = (art === 'funken' ? 60 : 70) * (mobil ? 0.5 : 1);
  const farbe = art === 'funken' ? '240,196,120' : '226,214,190';

  let teilchen: Teilchen[] = [];
  let laeuft = false;
  let frame = 0;

  const mass = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };

  const neu = (): Teilchen => art === 'funken'
    ? { x: canvas.width * (0.44 + Math.random() * 0.13), y: canvas.height * (0.72 + Math.random() * 0.08),
        r: Math.random() * 1.2 + 0.4, v: Math.random() * 0.5 + 0.25, d: (Math.random() - 0.5) * 0.3, leben: 1 }
    : { x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.3, v: (Math.random() - 0.5) * 0.12, d: (Math.random() - 0.5) * 0.16, leben: 1 };

  const tick = () => {
    if (!laeuft) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (teilchen.length < max && Math.random() < 0.6) teilchen.push(neu());
    const zerfall = art === 'funken' ? 0.0045 : 0.0022;
    teilchen = teilchen.filter((t) => (t.y -= t.v, t.x += t.d, (t.leben -= zerfall) > 0));
    const deckung = art === 'funken' ? 0.85 : 0.35;
    for (const t of teilchen) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${farbe},${t.leben * deckung})`;
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
    }
    frame = requestAnimationFrame(tick);
  };

  mass();
  window.addEventListener('resize', mass);
  const beobachter = new IntersectionObserver(([e]) => {
    laeuft = Boolean(e?.isIntersecting);
    if (laeuft) tick();
  });
  beobachter.observe(canvas.parentElement ?? canvas);

  return () => {
    laeuft = false;
    cancelAnimationFrame(frame);
    beobachter.disconnect();
    window.removeEventListener('resize', mass);
  };
}
