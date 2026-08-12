/* Vanilla-Nachbau der Scene Engine für die Vorschau. Gleiche Daten, gleiches CSS. */
(function () {
  const W = JSON.parse(document.getElementById('welt-daten').textContent);
  const EVIDENZ = ['A','B','C','D','E','F','G'];
  const KAPITEL = Object.fromEntries(W.kapitel.map(k => [k.id, k]));
  const ASSET = Object.fromEntries(W.assets.map(a => [a.id, a]));
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const bild = id => W.bilder[id];

  /* ---------- Fortschritt ---------- */
  const KEY = 'faeden.fortschritt.v1';
  const laden = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { szenen: [] }; }
                        catch { return { szenen: [] }; } };
  let stand = laden();
  const kennt = id => stand.szenen.includes(id);
  const merken = id => {
    if (stand.szenen.includes(id)) return;
    stand = { szenen: [...stand.szenen, id], letzterBesuch: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch {}
    document.querySelectorAll('.ort').forEach(g => {
      const k = Number(g.dataset.kapitel);
      const s = W.szenen.find(x => x.kapitelId === k && (x.typ === 'motiv' || x.typ === 'interaktion'));
      g.querySelector('circle').classList.toggle('besucht', Boolean(s && kennt(s.id)));
    });
  };
  const warSchonDa = stand.szenen.length > 2;

  /* ---------- Quellenzeile ---------- */
  const quelle = (s, label) => s.quelle
    ? `<p class="quelle"><b>${label || 'Woher wir das wissen'}</b>${esc(s.quelle)}` +
      (s.buchseite ? `<span class="seite"> · Band 1, Seite ${s.buchseite}</span>` : '') + `</p>`
    : '';


  /* Erklärte Begriffe: erstes Vorkommen wird antippbar */
  const FORMEN = (W.begriffe || []).flatMap(b => [b.wort, ...(b.formen || [])].map(f => ({ f, b })))
    .sort((a, b) => b.f.length - a.f.length);
  function begriffstext(text) {
    let rest = esc(text), aus = '', benutzt = new Set();
    for (const { f, b } of FORMEN) {
      if (benutzt.has(b.id)) continue;
      const re = new RegExp('\\b' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
      const m = rest.match(re);
      if (!m) continue;
      benutzt.add(b.id);
      rest = rest.replace(re, `<button type="button" class="begriff" data-begriff="${b.id}" aria-expanded="false">${m[0]}</button>`);
    }
    aus = `<p class="fliess">${rest}</p><p class="begriff-erklaerung" data-erklaerung hidden></p>`;
    return aus;
  }

  /* ---------- Szenentypen ---------- */
  const bau = {
    ankunft: s => `<section id="${s.id}" class="ankunft">
      <div class="funke"></div><p>${esc(s.fliesstext)}</p>
      ${warSchonDa
        ? `<p class="hinweis wiederkehr"><a href="#karte">Zur Welt</a><span> · </span><a href="#cover">oder weiterscrollen</a></p>`
        : `<p class="hinweis">Scrollen</p>`}</section>`,

    cover: s => `<section id="${s.id}" class="szene" data-abschnitt="${s.id}"
        style="--hoehe:${s.hoehe || 180}"><h1 class="nur-lesen">Die unsichtbaren Fäden – Band 1: ${esc(W.buch.titel)}</h1></section>`,

    auftakt: s => `<section id="${s.id}" class="szene" data-abschnitt="${s.id}" data-kapitel="${s.kapitelId}"
        style="--hoehe:${s.hoehe || 150}"><div class="block"><div class="kapitelband">
        <div class="ziffer">${s.kapitelId}</div><div>
        <p class="eyebrow">Kapitel ${s.kapitelId}</p>
        <h2 data-auf>${esc(s.titel).replace(/\n/g, '<br>')}</h2>
        <p class="unterzeile" data-auf>${esc(s.unterzeile)}</p>${quelle(s)}
        </div></div></div></section>`,

    motiv: s => `<section id="${s.id}" class="szene" data-abschnitt="${s.id}" data-kapitel="${s.kapitelId}"
        data-motiv="1" style="--hoehe:${s.hoehe || 200}"><div class="block"><div class="raster">
        <div class="text">
          <p class="eyebrow">${esc(s.unterkapitel)} · ${esc(s.eyebrow)}</p>
          <h2 data-auf>${esc(s.titel)}</h2>
          <p class="unterzeile" data-auf>${esc(s.unterzeile)}</p>
          <div data-auf>${begriffstext(s.fliesstext)}</div>
          <div class="zahlen">${(s.zahlen || []).map(z =>
            `<div class="zahl" data-evidenz="${z.evidenz}" data-auf>${esc(z.wert)}<span>${esc(z.label)}</span></div>`).join('')}</div>
          ${quelle(s)}
        </div>
        <div class="marginal-spalte">${s.badge ? `<p class="badge">${esc(s.badge)}</p>` : ''}
          <dl class="marginal">${(s.randnotizen || []).map(r =>
            `<div data-evidenz="${r.evidenz}"><dt>${esc(r.begriff)}</dt><dd>${esc(r.text)}</dd></div>`).join('')}
          </dl></div></div></div></section>`,

    papier: s => `<section id="${s.id}" class="papier"><div>
        <p class="eyebrow">${s.kapitelId ? 'Kapitel ' + s.kapitelId : 'Bilanz des Bandes'}</p>
        <h2 data-auf>${esc(s.titel)}</h2>
        <blockquote data-auf>${esc(s.zitat)}</blockquote>
        ${quelle(s, 'Beleg')}</div></section>`,

    interaktion: s => ({ ringe: ringeHtml, denar: denarHtml, laufzeit: laufzeitHtml, pruefung: pruefungHtml })[s.modul](s),

    karte: s => `<section id="${s.id}" class="karte"><div class="karte-huelle">
        <p class="eyebrow">Die Welt</p><h2>${esc(s.titel)}</h2>
        <p class="fliess">${esc(s.fliesstext)}</p>
        <div id="karte-svg"></div>
        <div class="ort-info" id="ort-info"><strong>Einen Punkt wählen</strong>Jeder Ort führt zurück in das Kapitel, das ihn belegt.</div>
      </div></section>`,

    buecher: () => `<section id="buecher" class="buecher"><div class="buch-raster">
        <img class="buch-cover" src="${bild(W.buch.coverAsset)}" alt="${esc(ASSET[W.buch.coverAsset].alt)}">
        <div><p class="eyebrow">Band ${W.buch.nummer} · ${W.buch.status}</p>
          <h2>${esc(W.buch.titel)}</h2><p class="unterzeile">${esc(W.buch.unterzeile)}</p>
          <p class="fliess">${esc(W.buch.klappentext)}</p>
          <a class="kaufen" href="${W.buch.amazonUrl}" target="_blank" rel="noopener noreferrer">Band 1 auf Amazon ansehen</a>
          <p class="quelle"><b>Hinweis</b>Platzhalter, bis die Amazon-Produktseite vorliegt.</p></div>
      </div>
      <div class="spaeter">
        <div><h3>Band 2</h3><p>Der Faden läuft weiter. Dieser Bereich der Welt öffnet sich mit dem Erscheinen.</p></div>
        <div><h3>Band 3</h3><p>Noch nicht begehbar.</p></div>
      </div></section>
      <footer>Manuel &amp; Uwe · Die Welt der drei Bände · Alle Motive stammen aus dem Buch und wurden eigens dafür erzeugt.</footer>`
  };

  function ringeHtml(s) {
    return `<section id="${s.id}" class="papier interaktion"><div>
      <p class="eyebrow">${esc(s.unterkapitel)} · Geheimnisse der Herrscher</p>
      <h2>${esc(s.titel)}</h2><p class="unterzeile">${esc(s.unterzeile)}</p>
      <div class="ringe" data-ringe>${W.ringe.map((r, i) =>
        `<button type="button" class="ring${i === 0 ? ' offen' : ''}" data-i="${i}" data-evidenz="${r.evidenz}">
          <span class="ring-stufe">${esc(r.stufe)}</span>
          <span class="ring-kontrolle">${i === 0 ? esc(r.kontrolle) : 'kennt nur den nächsten Ring nach innen'}</span>
        </button>`).join('')}</div>
      <p class="ringe-stand" data-stand>Ring 1 von ${W.ringe.length}. Jede Stufe kann die Nachricht verändern oder aufhalten.</p>
      <p class="fliess">${esc(s.fliesstext)}</p>${quelle(s)}</div></section>`;
  }

  function denarHtml(s) {
    const p = W.denar[0];
    return `<section id="${s.id}" class="papier interaktion"><div>
      <p class="eyebrow">${esc(s.unterkapitel)} · Geld und Vertrauen</p>
      <h2>${esc(s.titel)}</h2><p class="unterzeile">${esc(s.unterzeile)}</p>
      <div class="denar-buehne">
        <div class="muenze"><span>DENARIVS</span></div>
        <div class="denar-werte">
          <p class="denar-anteil"><b data-anteil>${p.anteil} %</b> Silberanteil</p>
          <p class="denar-jahr" data-jahr>27 v. Chr. · ${esc(p.marke)}</p>
        </div>
      </div>
      <label class="denar-regler">Zeitpunkt wählen
        <input type="range" min="0" max="${W.denar.length - 1}" step="1" value="0" data-denar aria-label="Zeitpunkt der Münzprägung"></label>
      <p class="fliess">${esc(s.fliesstext)}</p>${quelle(s)}</div></section>`;
  }


  function laufzeitHtml(s) {
    const K = W.koenigsstrasse;
    return `<section id="${s.id}" class="papier interaktion"><div>
      <p class="eyebrow">${esc(s.unterkapitel)} · Persien und Griechenland</p>
      <h2>${esc(s.titel)}</h2><p class="unterzeile">${esc(s.unterzeile)}</p>
      <div class="strecke">
        <div class="strecke-namen"><span>${esc(K.von)}</span><span>${esc(K.nach)}</span></div>
        <div class="bahn">
          <div class="stationen">${Array.from({length: K.stationen}, (_, i) =>
            `<i style="left:${(i / (K.stationen - 1)) * 100}%"></i>`).join('')}</div>
          <div class="marke bote" data-bote style="left:0%"><span>Reiterstafette</span></div>
          <div class="marke laeufer" data-laeufer style="left:0%"><span>zu Fuß</span></div>
        </div>
        <p class="strecke-stand" data-stand-strecke>Tag 0. Beide brechen in ${esc(K.von)} auf. ${K.kilometer.toLocaleString('de-DE')} Kilometer, ${K.stationen} Stationen.</p>
      </div>
      <label class="denar-regler">Tag <span data-tag>0</span> von ${K.zuFuss}
        <input type="range" min="0" max="${K.zuFuss}" value="0" data-laufzeit aria-label="Tag der Reise"></label>
      <p class="fliess">${esc(s.fliesstext)}</p>
      <p class="kernsatz">${esc(K.kern)}</p>${quelle(s)}</div></section>`;
  }

  function pruefungHtml(s) {
    const P = W.pruefung;
    return `<section id="${s.id}" class="papier interaktion"><div>
      <p class="eyebrow">${esc(s.unterkapitel)} · Am Rand des Belegten</p>
      <h2>${esc(s.titel)}</h2><p class="unterzeile">${esc(s.unterzeile)}</p>
      <ol class="pruefung" data-pruefung>${P.fragen.map(f =>
        `<li><span class="pruef-frage">${esc(f.frage)}</span><span class="pruef-befund" data-befund="${esc(f.befund)}">—</span></li>`).join('')}</ol>
      <button type="button" class="pruef-knopf" data-pruef-knopf>Prüfung beginnen</button>
      <div class="pruef-ergebnis" data-pruef-ergebnis hidden>
        <div class="zahlen">${P.zahlen.map(z =>
          `<div class="zahl">${esc(z.wert)}<span>${esc(z.label)}</span></div>`).join('')}</div>
        <p class="fliess">${esc(P.ergebnis)}</p>
        <p class="kernsatz">${esc(s.fliesstext)}</p>
      </div>${quelle(s)}</div></section>`;
  }

  /* ---------- Aufbau ---------- */
  document.body.insertAdjacentHTML('beforeend', `
    <a class="sprungmarke" href="#karte">Zur Weltkarte springen</a>
    <header id="kopf"><a class="marke" href="#ankunft">Die unsichtbaren Fäden</a>
      <nav><a href="#karte">Welt</a><button id="btn-zeit">Zeitleiste</button>
        <a href="#buecher">Bücher</a>
        <button id="btn-ton" aria-pressed="false">Ton aus</button>
        <button id="btn-ruhe" aria-pressed="false">Ruhig</button></nav></header>
    <div class="kino" id="kino"></div><div class="korn"></div>
    <svg class="faden" id="faden" preserveAspectRatio="none"><path id="faden-pfad"></path>
      <circle id="faden-perle" r="2.8" cx="-10" cy="-10"></circle></svg>
    <div class="kapitelmarke" id="kapitelmarke" aria-live="polite"></div>
    <div class="regler" id="regler">
      <label for="evidenz">Evidenzstufe <b id="ev-wert">G</b></label>
      <input id="evidenz" type="range" min="0" max="6" value="6">
      <p>Was schwächer belegt ist als die gewählte Stufe, tritt zurück.</p></div>
    <main id="welt"></main>`);

  document.getElementById('welt').innerHTML = W.szenen.map(s => bau[s.typ](s)).join('');

  /* ---------- Kinoebene: ein WebGL-Durchgang statt sechzehn DOM-Bühnen ---------- */
  const kino = document.getElementById('kino');
  const bildSzenen = W.szenen.filter(s => s.platte);
  let webgl = null;

  if (!reduziert && typeof starteKino === 'function') {
    const leinwand = document.createElement('canvas');
    leinwand.className = 'kino-flaeche';
    kino.appendChild(leinwand);
    try {
      webgl = starteKino(leinwand, bildSzenen.map(s => ({
        id: s.id,
        bild: W.bilder[s.platte],
        tiefe: W.tiefen[s.platte],
        video: W.videos[s.platte],
        grading: hexZuRgb(s.grading || '#1a2540'),
        uebergang: s.uebergang || 'aufloesen',
        fahrt: s.fahrt || 'hinein',
        stimmung: (W.stimmung && W.stimmung[s.kapitelId]) || [1, 1, 1],
        tor: Boolean(s.tor),
      })));
    } catch (e) { console.warn('WebGL nicht verfügbar:', e.message); webgl = null; }
    if (!webgl) leinwand.remove();
    else { document.body.classList.add('webgl'); window.__kino = webgl; }
  }

  function hexZuRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  /* Fortschritt aus der tatsächlichen Lage der Abschnitte – so bleibt der
     Übergang genau dort, wo im Text die nächste Szene beginnt. */
  if (webgl) {
    const abschnitte = () => bildSzenen.map(s => document.getElementById(s.id)).filter(Boolean);
    let liste = abschnitte();
    const messen = () => { liste = abschnitte(); };
    addEventListener('resize', messen);
    const rechnen = () => {
      if (!liste.length) return;
      const y = scrollY + innerHeight * 0.5;
      // Verankert an der Überschrift: Steht der Titel in der Bildmitte, steht auch
      // sein Motiv. Gemessen, nicht geschätzt – die Titel sitzen je nach Textlänge
      // bei 61 bis 84 Prozent der Abschnittshöhe.
      const oben = liste.map(el => {
        const titel = el.querySelector('h2, h1');
        const r = titel ? titel.getBoundingClientRect() : el.getBoundingClientRect();
        return (titel ? r.top + r.height / 2 : r.top + el.offsetHeight * 0.72) + scrollY;
      });
      let i = 0;
      while (i < oben.length - 1 && y >= oben[i + 1]) i++;
      const a = oben[i], b = oben[i + 1] ?? (a + innerHeight);
      const t = Math.max(0, Math.min(1, (y - a) / Math.max(1, b - a)));
      webgl.setzeFortschritt((i + t) / Math.max(1, liste.length - 1));
      requestAnimationFrame(rechnen);
    };
    requestAnimationFrame(rechnen);
  }

  /* ---------- Trägheitsscrollen: der Scroll rastet nicht, er schwingt aus ---------- */
  if (webgl && !matchMedia('(pointer: coarse)').matches) {
    let ziel = scrollY, jetzt = scrollY;
    const grenze = () => document.body.scrollHeight - innerHeight;
    addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      e.preventDefault();
      ziel = Math.max(0, Math.min(grenze(), ziel + e.deltaY));
    }, { passive: false });
    addEventListener('hashchange', () => { ziel = jetzt = scrollY; });
    let letzterWert = -1;
    (function gleiten() {
      // Fremde Scrollbewegungen übernehmen statt gegen sie anzulaufen:
      // Ankerlinks, „In die Szene“, Zurück-Navigation, Tastatur.
      if (letzterWert >= 0 && Math.abs(scrollY - letzterWert) > 2) { ziel = jetzt = scrollY; }
      jetzt += (ziel - jetzt) * 0.09;
      if (Math.abs(ziel - jetzt) < 0.4) jetzt = ziel;
      scrollTo(0, jetzt);
      letzterWert = Math.round(scrollY);
      requestAnimationFrame(gleiten);
    })();
  }

  /* Zeilenmasken für Überschriften */
  if (webgl && typeof zeilenAufdecken === 'function') zeilenAufdecken('[data-auf]');

  if (!webgl) W.szenen.filter(s => s.platte).forEach((s, i) => {
    const a = ASSET[s.platte];
    const b = document.createElement('div');
    b.className = s.typ === 'cover' ? 'buehne cover-buehne' : 'buehne';
    b.id = 'buehne-' + s.id; b.style.zIndex = i;
    b.innerHTML = s.typ === 'cover'
      ? `<div class="platte grund" style="background-image:url(${bild(s.platte)})"></div>` +
        (s.ebenen || []).map((e, j) => `<div class="ebene" data-tempo="${e.tempo}" data-von="${e.von}" data-bis="${e.bis}"
           style="background-image:url(${bild(s.platte)});-webkit-mask-image:linear-gradient(to bottom,transparent,#000 ${j ? 14 : 0}%,#000);mask-image:linear-gradient(to bottom,transparent,#000 ${j ? 14 : 0}%,#000)"></div>`).join('')
      : `<div class="platte" data-platte style="background-image:url(${bild(s.platte)})"></div>`;
    b.insertAdjacentHTML('beforeend',
      `<div class="grading" style="background:${s.grading || '#1a2540'}"></div>
       <div class="dunst"></div><div class="vignette"></div>` +
      (s.partikel ? `<canvas class="partikel" data-art="${s.partikel}"></canvas>` : ''));
    b.dataset.asset = s.platte;
    kino.appendChild(b);
  });

  /* Cover-Ebenen bildfüllend */
  function coverLayout() {
    const b = document.getElementById('buehne-cover'); if (!b) return;
    const a = ASSET[b.dataset.asset];
    const w = b.clientWidth, h = b.clientHeight;
    const k = Math.max(w / a.breite, h / a.hoehe) * 1.08;
    const B = a.breite * k, H = a.hoehe * k, L = (w - B) / 2, O = (h - H) / 2;
    b.querySelectorAll('.ebene').forEach(e => {
      const von = +e.dataset.von / 100, bis = +e.dataset.bis / 100;
      Object.assign(e.style, { left: L + 'px', width: B + 'px', top: (O + von * H) + 'px',
        height: ((bis - von) * H) + 'px', backgroundSize: B + 'px ' + H + 'px',
        backgroundPosition: '0 ' + (-von * H) + 'px' });
    });
  }
  if (!webgl) { coverLayout(); addEventListener('resize', coverLayout); }

  /* ---------- Kamera ---------- */
  if (!reduziert && window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (!webgl) document.querySelectorAll('[data-abschnitt]').forEach(sec => {
      const b = document.getElementById('buehne-' + sec.dataset.abschnitt); if (!b) return;
      const bereich = { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: .6 };
      gsap.timeline({ scrollTrigger: bereich })
        .fromTo(b, { opacity: 0 }, { opacity: 1, duration: .16, ease: 'none' })
        .to(b, { opacity: 1, duration: .66, ease: 'none' })
        .to(b, { opacity: 0, duration: .18, ease: 'none' });
      const platte = b.querySelector('[data-platte]');
      if (platte) gsap.fromTo(platte, { scale: 1.16, yPercent: -2 },
        { scale: 1.02, yPercent: 2, ease: 'none', scrollTrigger: bereich });
      b.querySelectorAll('[data-tempo]').forEach(e => gsap.to(e, {
        yPercent: -(+e.dataset.tempo) * 100, scale: 1 + (+e.dataset.tempo) * .1,
        ease: 'none', scrollTrigger: bereich }));
    });
    document.querySelectorAll('[data-auf]').forEach(n => gsap.fromTo(n,
      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: n, start: 'top 90%' } }));
  }

  /* ---------- Faden ---------- */
  (function () {
    if (reduziert) return;
    const svg = document.getElementById('faden'), p = document.getElementById('faden-pfad'),
          perle = document.getElementById('faden-perle');
    let len = 0;
    const zeichne = () => {
      const max = document.body.scrollHeight - innerHeight;
      const f = max > 0 ? Math.min(1, scrollY / max) : 0;
      p.style.strokeDashoffset = len * (1 - f);
      const pt = p.getPointAtLength(len * f);
      perle.setAttribute('cx', pt.x); perle.setAttribute('cy', pt.y);
      svg.style.opacity = f > .03 && f < .985 ? .85 : 0;
    };
    const kurve = () => {
      const w = innerWidth, h = innerHeight, x = w * .5;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      p.setAttribute('d', `M ${x} ${h} C ${x - w * .15} ${h * .78}, ${x + w * .14} ${h * .6}, ${x - w * .02} ${h * .44}
        C ${x - w * .13} ${h * .28}, ${x + w * .1} ${h * .16}, ${x + w * .01} 0`);
      len = p.getTotalLength(); p.style.strokeDasharray = len; zeichne();
    };
    addEventListener('resize', kurve); addEventListener('scroll', zeichne, { passive: true }); kurve();
  })();

  /* ---------- Partikel ---------- */
  document.querySelectorAll('.partikel').forEach(c => {
    if (reduziert || webgl) return;
    const ctx = c.getContext('2d'), art = c.dataset.art;
    const mobil = matchMedia('(max-width:900px)').matches;
    const max = (art === 'funken' ? 60 : 70) * (mobil ? .5 : 1);
    const farbe = art === 'funken' ? '240,196,120' : '226,214,190';
    let t = [], laeuft = false;
    const mass = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    const neu = () => art === 'funken'
      ? { x: c.width * (.44 + Math.random() * .13), y: c.height * (.72 + Math.random() * .08),
          r: Math.random() * 1.2 + .4, v: Math.random() * .5 + .25, d: (Math.random() - .5) * .3, l: 1 }
      : { x: Math.random() * c.width, y: Math.random() * c.height,
          r: Math.random() * 1.1 + .3, v: (Math.random() - .5) * .12, d: (Math.random() - .5) * .16, l: 1 };
    const tick = () => {
      if (!laeuft) return;
      ctx.clearRect(0, 0, c.width, c.height);
      if (t.length < max && Math.random() < .6) t.push(neu());
      const zerfall = art === 'funken' ? .0045 : .0022;
      t = t.filter(p => (p.y -= p.v, p.x += p.d, (p.l -= zerfall) > 0));
      const deckung = art === 'funken' ? .85 : .35;
      t.forEach(p => { ctx.beginPath();
        ctx.fillStyle = `rgba(${farbe},${p.l * deckung})`;
        ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); });
      requestAnimationFrame(tick);
    };
    mass(); addEventListener('resize', mass);
    new IntersectionObserver(([e]) => { laeuft = e.isIntersecting; if (laeuft) tick(); }).observe(c.parentElement);
  });

  /* ---------- Kapitelmarke, Regler, Fortschritt ---------- */
  const marke = document.getElementById('kapitelmarke'), regler = document.getElementById('regler');
  const kapitelBeobachter = new IntersectionObserver(es => {
    const oben = es.filter(e => e.isIntersecting)
                   .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!oben) return;
    const k = oben.target.dataset.kapitel;
    if (k) { marke.innerHTML = `<b>Kapitel ${k}</b> ${esc(KAPITEL[k].titel)}`; marke.classList.add('an'); }
    regler.classList.toggle('an', oben.target.dataset.motiv === '1');
  }, { threshold: [.2, .5, .8] });
  document.querySelectorAll('main section[id]').forEach(s => kapitelBeobachter.observe(s));

  const ev = document.getElementById('evidenz');
  ev.addEventListener('input', () => {
    const g = +ev.value;
    document.getElementById('ev-wert').textContent = EVIDENZ[g];
    document.querySelectorAll('[data-evidenz]').forEach(n =>
      n.classList.toggle('verblasst', EVIDENZ.indexOf(n.dataset.evidenz) > g));
  });

  const besuchBeobachter = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.target.id) merken(e.target.id);
  }), { threshold: .5 });
  document.querySelectorAll('main section[id]').forEach(s => besuchBeobachter.observe(s));

  new IntersectionObserver(([e]) =>
    document.getElementById('kopf').classList.toggle('an', !e.isIntersecting),
    { threshold: .5 }).observe(document.querySelector('.ankunft'));

  /* ---------- Interaktionen ---------- */
  const ringe = document.querySelector('[data-ringe]');
  if (ringe) {
    let erreicht = 0;
    ringe.addEventListener('click', e => {
      const b = e.target.closest('.ring'); if (!b) return;
      const i = +b.dataset.i;
      if (i !== erreicht + 1) return;
      erreicht = i;
      ringe.querySelectorAll('.ring').forEach((r, j) => {
        r.classList.toggle('offen', j <= erreicht);
        if (j <= erreicht) r.querySelector('.ring-kontrolle').textContent = W.ringe[j].kontrolle;
      });
      const stand = document.querySelector('[data-stand]');
      stand.textContent = erreicht >= W.ringe.length - 1
        ? 'Angekommen. Vier Stellen haben unterwegs entschieden, ob die Nachricht weitergeht.'
        : `Ring ${erreicht + 1} von ${W.ringe.length}. Jede Stufe kann die Nachricht verändern oder aufhalten.`;
    });
  }

  const denar = document.querySelector('[data-denar]');
  if (denar) denar.addEventListener('input', () => {
    const p = W.denar[+denar.value];
    document.querySelector('[data-anteil]').textContent = p.anteil + ' %';
    document.querySelector('[data-jahr]').textContent =
      (p.jahr < 0 ? Math.abs(p.jahr) + ' v. Chr.' : p.jahr + ' n. Chr.') + ' · ' + p.marke;
  });


  const laufzeit = document.querySelector('[data-laufzeit]');
  if (laufzeit) {
    const K = W.koenigsstrasse;
    const bote = document.querySelector('[data-bote]'), laeufer = document.querySelector('[data-laeufer]');
    const stand = document.querySelector('[data-stand-strecke]'), tagAus = document.querySelector('[data-tag]');
    laufzeit.addEventListener('input', () => {
      const tag = +laufzeit.value;
      const a = d => Math.min(1, tag / d), km = d => Math.round(a(d) * K.kilometer);
      bote.style.left = a(K.stafette) * 100 + '%';
      laeufer.style.left = a(K.zuFuss) * 100 + '%';
      tagAus.textContent = tag;
      stand.textContent = tag === 0
        ? `Tag 0. Beide brechen in ${K.von} auf. ${K.kilometer.toLocaleString('de-DE')} Kilometer, ${K.stationen} Stationen.`
        : a(K.stafette) >= 1
          ? `Tag ${tag}. Die Nachricht ist seit ${tag - K.stafette} Tagen in ${K.nach}. Der Läufer hat ${km(K.zuFuss).toLocaleString('de-DE')} von ${K.kilometer.toLocaleString('de-DE')} Kilometern geschafft.`
          : `Tag ${tag}. Die Nachricht ist bei Kilometer ${km(K.stafette).toLocaleString('de-DE')}, der Läufer bei ${km(K.zuFuss).toLocaleString('de-DE')}.`;
    });
  }

  const pruefKnopf = document.querySelector('[data-pruef-knopf]');
  if (pruefKnopf) {
    let offen = 0;
    const zeilen = [...document.querySelectorAll('[data-pruefung] li')];
    pruefKnopf.addEventListener('click', () => {
      const z = zeilen[offen];
      z.classList.add('geprueft');
      z.querySelector('.pruef-befund').textContent = z.querySelector('.pruef-befund').dataset.befund;
      offen++;
      if (offen >= zeilen.length) {
        pruefKnopf.hidden = true;
        document.querySelector('[data-pruef-ergebnis]').hidden = false;
      } else {
        pruefKnopf.textContent = `Frage ${offen + 1} prüfen`;
      }
    });
  }


  document.addEventListener('click', e => {
    const k = e.target.closest('.begriff'); if (!k) return;
    const b = W.begriffe.find(x => x.id === k.dataset.begriff);
    const feld = k.closest('div').querySelector('[data-erklaerung]');
    const offen = k.getAttribute('aria-expanded') === 'true';
    k.closest('div').querySelectorAll('.begriff').forEach(x => x.setAttribute('aria-expanded', 'false'));
    k.setAttribute('aria-expanded', String(!offen));
    if (offen) { feld.hidden = true; return; }
    feld.innerHTML = `<b>${esc(b.wort)}</b>${esc(b.erklaerung)}<span class="seite"> · Glossar, Band 1</span>`;
    feld.hidden = false;
  });

  /* ---------- Weltkarte ---------- */
  (function () {
    const halter = document.getElementById('karte-svg'); if (!halter) return;
    const LON = [-12, 115], LAT = [-38, 58], BR = 1000;
    const HO = Math.round(BR * (LAT[1] - LAT[0]) / (LON[1] - LON[0]));
    const X = l => (l - LON[0]) / (LON[1] - LON[0]) * BR;
    const Y = b => (LAT[1] - b) / (LAT[1] - LAT[0]) * HO;
    const orte = [...W.orte].sort((a, b) => a.vorkommen[0].kapitel - b.vorkommen[0].kapitel);
    const netz = [];
    for (let l = -10; l <= 110; l += 20) netz.push(`M ${X(l)} 0 L ${X(l)} ${HO}`);
    for (let b = -30; b <= 50; b += 20) netz.push(`M 0 ${Y(b)} L ${BR} ${Y(b)}`);
    const faden = orte.map((o, i) => `${i ? 'L' : 'M'} ${X(o.lon).toFixed(1)} ${Y(o.lat).toFixed(1)}`).join(' ');
    halter.innerHTML = `<svg viewBox="0 0 ${BR} ${HO}" role="group" aria-label="Karte der Fundorte">
      <path class="karte-netz" d="${netz.join(' ')}"></path>
      <path class="karte-faden" d="${faden}"></path>
      ${orte.map(o => {
        const s = W.szenen.find(x => x.kapitelId === o.vorkommen[0].kapitel && (x.typ === 'motiv' || x.typ === 'interaktion'));
        return `<g class="ort" tabindex="0" role="button" data-id="${o.id}" data-kapitel="${o.vorkommen[0].kapitel}" aria-label="${esc(o.name)}">
          <circle cx="${X(o.lon).toFixed(1)}" cy="${Y(o.lat).toFixed(1)}" r="3.4"${s && kennt(s.id) ? ' class="besucht"' : ''}></circle>
          <text x="${(X(o.lon) + 8).toFixed(1)}" y="${(Y(o.lat) + 4).toFixed(1)}">${esc(o.name)}</text></g>`;
      }).join('')}</svg>`;
    const info = document.getElementById('ort-info');
    const zeigen = id => {
      const o = W.orte.find(x => x.id === id);
      const k = o.vorkommen[0].kapitel;
      const s = W.szenen.find(x => x.kapitelId === k && (x.typ === 'motiv' || x.typ === 'interaktion'));
      info.innerHTML = `<strong>${esc(o.name)}</strong>${esc(o.text)}
        <span class="verweis">Band 1 · Kapitel ${k} – ${esc(KAPITEL[k].titel)} · Seiten ${o.vorkommen[0].seiten.join(', ')}</span>
        ${s ? `<a class="sprung" href="#${s.id}">In die Szene · ${esc(s.titel)}</a>` : ''}`;
      halter.querySelectorAll('.ort').forEach(g => g.setAttribute('aria-current', String(g.dataset.id === id)));
    };
    halter.querySelectorAll('.ort').forEach(g => {
      g.addEventListener('click', () => zeigen(g.dataset.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeigen(g.dataset.id); } });
    });
  })();

  /* ---------- Zeitleiste ---------- */
  document.getElementById('btn-zeit').onclick = () => {
    const alt = document.querySelector('.zeitleiste');
    if (alt) { alt.remove(); return; }
    const el = document.createElement('section');
    el.className = 'zeitleiste'; el.setAttribute('role', 'dialog');
    el.innerHTML = `<div><p class="eyebrow">Zeitleiste · Band 1</p>
      <h2>Drei Bänder, drei Maßstäbe</h2>
      ${W.zeitleiste.map(b => `<div class="band"><h3>${esc(b.name)}</h3>
        <div class="bandlinie">${b.marken.map(m =>
          `<div class="marke" style="left:${m.position}%"><span><b>${esc(m.jahr)}</b>${esc(m.was)}</span></div>`).join('')}
        </div></div>`).join('')}
      <p class="quelle"><b>Hinweis</b>Jedes Band hat einen eigenen logarithmischen Maßstab – wie im Buch.</p>
      <nav><button id="zeit-zu">Schließen</button></nav></div>`;
    document.body.appendChild(el);
    el.querySelector('#zeit-zu').onclick = () => el.remove();
  };
  addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelector('.zeitleiste')?.remove(); });

  /* ---------- Ton und ruhige Fassung ---------- */
  (function () {
    const k = document.getElementById('btn-ton');
    let A = null, gain = null, an = false;
    k.onclick = () => {
      if (!A) {
        A = new (window.AudioContext || window.webkitAudioContext)();
        const n = A.sampleRate * 4, puf = A.createBuffer(1, n, A.sampleRate), d = puf.getChannelData(0);
        let l = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; l = (l + .02 * w) / 1.02; d[i] = l * 3.2; }
        const q = A.createBufferSource(); q.buffer = puf; q.loop = true;
        const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480;
        gain = A.createGain(); gain.gain.value = 0;
        q.connect(f).connect(gain).connect(A.destination); q.start();
        const lfo = A.createOscillator(); lfo.frequency.value = .21;
        const lg = A.createGain(); lg.gain.value = .016; lfo.connect(lg).connect(gain.gain); lfo.start();
      }
      an = !an; A.resume();
      gain.gain.linearRampToValueAtTime(an ? .05 : 0, A.currentTime + 1.2);
      k.setAttribute('aria-pressed', String(an)); k.textContent = an ? 'Ton an' : 'Ton aus';
    };
  })();

  document.getElementById('btn-ruhe').onclick = function () {
    const an = document.body.classList.toggle('ruhig');
    this.setAttribute('aria-pressed', String(an));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
})();
