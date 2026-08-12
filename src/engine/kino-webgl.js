/**
 * Die Kinoebene als ein einziger WebGL2-Durchgang.
 *
 * Vorher lagen sechzehn DOM-Bühnen übereinander, jede mit vier vollflächigen
 * Blendschichten, und die Übergänge liefen über Deckkraft. Zwei Vollbilder, die
 * sich gegenseitig ausblenden, summieren sich nie auf eins – dazwischen scheint
 * das Schwarz durch. Genau das war das Flackern.
 *
 * Jetzt gibt es eine Fläche. Zwei Motive, zwei Tiefenkarten, ein Übergang, eine
 * Farbstufe, ein Korn. Kein Stapel, kein Dip, keine Neurasterung beim Skalieren.
 *
 * Absichtlich ohne Three.js: Wir zeichnen ein Rechteck. Eine Szenengraph-
 * Bibliothek dafür zu laden, wäre 150 kB für nichts.
 *
 * @typedef {Object} KinoSzene
 * @property {string} id
 * @property {string} bild          Pfad zum Motiv (Standbild, immer nötig – es ist
 *                                  zugleich das Poster, solange kein Video läuft)
 * @property {string} [video]       Optionale Bewegtfassung (VideoSlash, mp4/webm)
 * @property {string} [tiefe]       Pfad zur Tiefenkarte
 * @property {number[]} grading     RGB 0..1
 * @property {string} [uebergang]   aufloesen | glut | lichtschwenk | wasser | sediment
 * @property {number} [zoom]        Kamerafahrt in dieser Szene, Standard 0.10
 */

const UEBERGAENGE = { aufloesen: 0, glut: 1, lichtschwenk: 2, wasser: 3, sediment: 4 };

const VERTEX = `#version 300 es
in vec2 lage;
out vec2 vUv;
void main(){ vUv = lage * 0.5 + 0.5; gl_Position = vec4(lage, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 farbe;

uniform sampler2D uBildA, uBildB, uTiefeA, uTiefeB;
uniform vec4 uFitA, uFitB;      // xy Skalierung, zw Versatz (Cover-Anpassung)
uniform vec3 uGradeA, uGradeB;
uniform vec2 uKameraA, uKameraB; // Versatz der Kamera in dieser Szene
uniform float uZoomA, uZoomB;
uniform float uT;                // Übergang 0..1
uniform int   uTyp;
uniform float uZeit, uTempo;     // Scrollgeschwindigkeit für Trägheitsunschärfe
uniform float uKorn, uVignette, uQualitaet;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float rauschen(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

/* Motiv bildfüllend, mit Tiefenversatz und Kamerafahrt. */
vec3 hole(sampler2D bild, sampler2D tiefe, vec4 fit, vec2 kamera, float zoom, out float tief){
  vec2 uv = (vUv - 0.5) / (1.0 + zoom) + 0.5;
  uv = uv * fit.xy + fit.zw;
  tief = texture(tiefe, uv).r;
  // Vordergrund bewegt sich stärker als Hintergrund – echte Verdeckung entsteht
  // durch mehrfaches Abtasten entlang des Versatzes.
  vec2 versatz = kamera * (tief - 0.5);
  vec2 abgetastet = uv + versatz;
  if (uQualitaet > 0.5) {
    for (int i = 0; i < 3; i++) {
      float t2 = texture(tiefe, abgetastet).r;
      abgetastet = uv + kamera * (t2 - 0.5);
    }
  }
  return texture(bild, abgetastet).rgb;
}

/* Weiche Farbstufe: hebt den Grundton an, ohne die Lichter zuzudrücken. */
vec3 stufe(vec3 c, vec3 ton){
  vec3 weich = mix(2.0 * c * ton, 1.0 - 2.0 * (1.0 - c) * (1.0 - ton), step(0.5, c));
  return mix(c, weich, 0.55);
}

void main(){
  float tA, tB;
  vec3 a = stufe(hole(uBildA, uTiefeA, uFitA, uKameraA, uZoomA, tA), uGradeA);
  vec3 b = stufe(hole(uBildB, uTiefeB, uFitB, uKameraB, uZoomB, tB), uGradeB);

  /* --- Übergänge. Jeder mischt Helligkeit, keiner blendet nach Schwarz. --- */
  float m;
  if (uTyp == 1) {
    // Glut: helle Stellen halten sich länger, alles zieht nach oben davon
    float leucht = dot(a, vec3(0.299, 0.587, 0.114));
    float n = rauschen(vUv * 26.0 + vec2(0.0, -uZeit * 0.25));
    m = smoothstep(0.0, 1.0, (uT * 1.9 - 0.45) + (n * 0.5 - leucht * 0.85));
    float funke = smoothstep(0.72, 1.0, n) * (1.0 - abs(uT - 0.5) * 2.0);
    a += vec3(1.0, 0.62, 0.24) * funke * 0.5;
  } else if (uTyp == 2) {
    // Lichtschwenk: ein Streifen wandert durch und legt das Nächste frei
    float band = vUv.x * 0.72 + vUv.y * 0.28;
    m = smoothstep(band - 0.22, band + 0.22, uT * 1.44 - 0.22);
    float saum = 1.0 - abs(band - (uT * 1.44 - 0.22)) * 5.4;
    a += vec3(1.0, 0.9, 0.72) * max(saum, 0.0) * 0.42;
  } else if (uTyp == 3) {
    // Wasser: Brechung nimmt zu, dann steht das Nächste da
    float w = sin(vUv.y * 24.0 + uZeit * 0.8) * cos(vUv.x * 17.0 - uZeit * 0.5);
    m = smoothstep(0.0, 1.0, uT + w * 0.14 * (1.0 - abs(uT - 0.5) * 2.0));
  } else if (uTyp == 4) {
    // Sediment: waagerechter Abtrag mit körnigem Rand
    float kante = vUv.y + rauschen(vUv * 40.0) * 0.09;
    m = smoothstep(kante - 0.14, kante + 0.14, uT * 1.28 - 0.14);
  } else {
    float n = rauschen(vUv * 8.0);
    m = smoothstep(0.0, 1.0, uT * 1.5 - 0.25 + n * 0.3 - 0.15);
  }

  vec3 c = mix(a, b, clamp(m, 0.0, 1.0));

  /* --- Trägheitsunschärfe: nur beim schnellen Scrollen, gerichtet --- */
  if (uQualitaet > 0.5 && abs(uTempo) > 0.001) {
    vec2 richtung = vec2(0.0, clamp(uTempo, -0.05, 0.05));
    vec3 s = c;
    for (int i = 1; i <= 4; i++) {
      float f = float(i) / 4.0;
      vec2 uv2 = clamp(vUv + richtung * f, 0.001, 0.999);
      float d;
      vec3 pa = hole(uBildA, uTiefeA, uFitA, uKameraA, uZoomA, d);
      vec3 pb = hole(uBildB, uTiefeB, uFitB, uKameraB, uZoomB, d);
      s += mix(pa, pb, clamp(m, 0.0, 1.0));
    }
    c = mix(c, s / 5.0, min(abs(uTempo) * 22.0, 0.85));
  }

  /* --- Halation: Licht blutet in die Umgebung, wie auf Film --- */
  if (uQualitaet > 0.5) {
    vec3 leuchten = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float w = float(i) * 1.0472;
      vec2 uv2 = vUv + vec2(cos(w), sin(w)) * 0.014;
      float d;
      leuchten += hole(uBildA, uTiefeA, uFitA, uKameraA, uZoomA, d);
    }
    leuchten /= 6.0;
    vec3 hell = max(leuchten - 0.62, 0.0);
    c += hell * vec3(1.0, 0.72, 0.42) * 0.34;
  }

  /* --- Minimale chromatische Aberration zum Rand hin --- */
  float rand = length(vUv - 0.5);
  c.r *= 1.0 + rand * 0.016;
  c.b *= 1.0 - rand * 0.012;

  /* --- Vignette und Korn: ein Durchgang statt zwei Blendschichten --- */
  c *= 1.0 - uVignette * smoothstep(0.34, 0.96, rand);
  float korn = hash(vUv * 1024.0 + fract(uZeit)) - 0.5;
  c += korn * uKorn;

  farbe = vec4(c, 1.0);
}`;


/**
 * Kamerafahrten.
 *
 * `phase` läuft von 0 (Szene tritt ein) bis 1 (Szene geht ab). Zurückgegeben
 * werden Versatz in x und y sowie der Zoom – zusammen ergibt das die Bewegung,
 * die der Shader dann mit der Tiefenkarte verrechnet: Was vorne liegt, wandert
 * stärker als der Hintergrund.
 *
 * Die Fahrt gehört zur Szene, nicht zum System. Unter den Boden von Çatalhöyük
 * senkt sich die Kamera, über die Zikkurat steigt sie, in die Bibliothekshöhle
 * fährt sie hinein, auf der römischen Straße hindurch.
 */
const FAHRTEN = {
  // [x-Versatz Anfang→Ende, y-Versatz Anfang→Ende, Zoom Anfang→Ende]
  hinein:      [[0, 0], [0.012, -0.010], [0.15, 0.01]],
  durchfahrt:  [[0, 0], [0.006, -0.006], [0.24, 0.00]],
  heraus:      [[0, 0], [-0.008, 0.008], [0.01, 0.16]],
  schwenkLinks:  [[0.030, -0.026], [0.004, -0.004], [0.09, 0.05]],
  schwenkRechts: [[-0.030, 0.026], [0.004, -0.004], [0.09, 0.05]],
  aufsteigen:  [[0.004, -0.004], [0.034, -0.030], [0.12, 0.04]],
  absenken:    [[0.004, -0.004], [-0.030, 0.034], [0.04, 0.12]],
};

function fahrt(szene, phase) {
  const f = FAHRTEN[szene?.fahrt] ?? FAHRTEN.hinein;
  // Weich ein- und ausblenden, damit die Bewegung nicht an den Rändern anreißt
  const p = Math.max(0, Math.min(1, phase));
  const w = p * p * (3 - 2 * p);
  const zw = (paar) => paar[0] + (paar[1] - paar[0]) * w;
  return [zw(f[0]), zw(f[1]), zw(f[2])];
}

export function starteKino(canvas, szenen, optionen = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const mobil = matchMedia('(max-width: 900px)').matches;
  const qualitaet = optionen.qualitaet ?? (mobil ? 0 : 1);
  const dpr = Math.min(devicePixelRatio || 1, mobil ? 1.5 : 2);

  const prog = programm(gl, VERTEX, FRAGMENT);
  gl.useProgram(prog);
  const puffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, puffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lage = gl.getAttribLocation(prog, 'lage');
  gl.enableVertexAttribArray(lage);
  gl.vertexAttribPointer(lage, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(prog, name);
  const U = {
    bildA: u('uBildA'), bildB: u('uBildB'), tiefeA: u('uTiefeA'), tiefeB: u('uTiefeB'),
    fitA: u('uFitA'), fitB: u('uFitB'), gradeA: u('uGradeA'), gradeB: u('uGradeB'),
    kameraA: u('uKameraA'), kameraB: u('uKameraB'), zoomA: u('uZoomA'), zoomB: u('uZoomB'),
    t: u('uT'), typ: u('uTyp'), zeit: u('uZeit'), tempo: u('uTempo'),
    korn: u('uKorn'), vignette: u('uVignette'), qualitaet: u('uQualitaet'),
  };
  gl.uniform1i(U.bildA, 0); gl.uniform1i(U.bildB, 1);
  gl.uniform1i(U.tiefeA, 2); gl.uniform1i(U.tiefeB, 3);
  gl.uniform1f(U.korn, qualitaet ? 0.045 : 0.03);
  gl.uniform1f(U.vignette, 0.55);
  gl.uniform1f(U.qualitaet, qualitaet);

  /* --- Texturen: erst ein Platzhalter, dann progressiv nachladen --- */
  const bewegtErlaubt = bewegtPruefen();
  const platzhalter = einfarbig(gl, [10, 16, 30]);
  const flach = einfarbig(gl, [128, 128, 128]);
  const geladen = szenen.map(() => ({ bild: platzhalter, tiefe: flach, seite: 1.5, bereit: false }));

  szenen.forEach((s, i) => {
    lade(s.bild).then((img) => {
      geladen[i].bild = textur(gl, img);
      geladen[i].seite = img.width / img.height;
      geladen[i].bereit = true;
    }).catch(() => undefined);
    if (s.tiefe) {
      lade(s.tiefe).then((img) => { geladen[i].tiefe = textur(gl, img); }).catch(() => undefined);
    }
    if (s.video && bewegtErlaubt) geladen[i].quelle = videoQuelle(s.video);
  });

  /**
   * Bewegtbild nur, wenn es vertretbar ist: nicht bei „Bewegung reduzieren“,
   * nicht im Datensparmodus, nicht über eine langsame Verbindung. Sonst bleibt
   * das Standbild stehen – dieselbe Szene, nur ruhig.
   */
  function bewegtPruefen() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const netz = navigator.connection;
    if (netz?.saveData) return false;
    if (netz?.effectiveType && /2g/.test(netz.effectiveType)) return false;
    return true;
  }

  /** Ein Video wird erst geladen, wenn seine Szene in Reichweite ist. */
  function videoQuelle(url) {
    const v = document.createElement('video');
    v.src = url; v.loop = true; v.muted = true; v.playsInline = true;
    v.preload = 'none'; v.crossOrigin = 'anonymous';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    return { el: v, textur: null, laeuft: false, geweckt: false };
  }

  /** Nachbarschaft wecken, Ferne schlafen legen – höchstens zwei Videos laufen. */
  function videosSteuern(i) {
    geladen.forEach((e, j) => {
      const q = e.quelle; if (!q) return;
      const nah = Math.abs(j - i) <= 1;
      if (nah && !q.geweckt) {
        q.geweckt = true; q.el.preload = 'auto'; q.el.load();
        q.el.play().then(() => { q.laeuft = true; }).catch(() => { q.laeuft = false; });
      } else if (!nah && q.geweckt && Math.abs(j - i) > 2) {
        q.geweckt = false; q.laeuft = false; q.el.pause();
      }
    });
  }

  /** Laufendes Videobild in die Textur schreiben. Fällt es aus, bleibt das Standbild. */
  function videoBild(e) {
    const q = e.quelle;
    if (!q || !q.laeuft || q.el.readyState < 2) return null;
    if (!q.textur) {
      q.textur = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, q.textur);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.bindTexture(gl.TEXTURE_2D, q.textur);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, q.el);
    return q.textur;
  }

  /* --- Zustand --- */
  let breite = 0, hoehe = 0;
  let fortschritt = 0, gedaempft = 0, tempo = 0, laeuft = true, letzteZeit = 0;
  let zustand = { fortschritt: 0, gedaempft: 0 };
  const zoomStaerke = optionen.zoom ?? 0.1;

  function messen() {
    breite = canvas.clientWidth; hoehe = canvas.clientHeight;
    canvas.width = Math.round(breite * dpr);
    canvas.height = Math.round(hoehe * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  messen();
  addEventListener('resize', messen);

  /** Cover-Anpassung: Motiv füllt die Fläche, ohne zu verzerren. */
  function fit(seite) {
    const flaeche = breite / hoehe;
    return seite > flaeche
      ? [flaeche / seite, 1, (1 - flaeche / seite) * 0.5, 0]
      : [1, seite / flaeche, 0, (1 - seite / flaeche) * 0.5];
  }

  function zeichne(zeit) {
    if (!laeuft) return;
    // Gedämpfte Kamera: der Scroll rastet nicht, er schwingt aus.
    // Zeitbasiert, damit die Dämpfung bei 30 wie bei 120 Bildern je Sekunde gleich wirkt.
    // Die Obergrenze war mit 0,05 s zu eng: Auf einem Gerät mit zwanzig Bildern
    // je Sekunde wurde nur ein Bruchteil der tatsächlich vergangenen Zeit
    // verrechnet – die Kamera blieb dauerhaft eine halbe Szene zurück und stand
    // im Übergang, obwohl der Titel längst mittig stand. 0,25 s deckt auch
    // schwache Geräte ab, ohne nach einem Tabwechsel zu springen.
    const dt = Math.min(0.25, letzteZeit ? (zeit - letzteZeit) / 1000 : 0.016);
    letzteZeit = zeit;
    const vorher = gedaempft;
    const abstand = Math.abs(fortschritt - gedaempft);
    // Nach einem Sprung – etwa „In die Szene“ von der Karte – wird schnell
    // aufgeholt. Sonst reist die Kamera minutenlang durch alle Zwischenszenen.
    const sprung = abstand > 1.5 / Math.max(1, szenen.length - 1);
    const rate = sprung
      ? 1 - Math.pow(1 - 0.35, dt * 60)
      : 1 - Math.pow(1 - (optionen.daempfung ?? 0.085), dt * 60);
    gedaempft += (fortschritt - gedaempft) * rate;
    // Einrasten, sobald der Rest unter einem Tausendstel Szene liegt. Ohne das
    // bleibt die Kamera dauerhaft ein paar Prozent zurück – und steht dann in
    // der Übergangszone, obwohl der Titel längst mittig steht.
    if (Math.abs(fortschritt - gedaempft) < 0.0012) gedaempft = fortschritt;
    tempo = gedaempft - vorher;
    zustand = { fortschritt, gedaempft };

    const gesamt = szenen.length - 1;
    const stelle = Math.max(0, Math.min(gesamt, gedaempft * gesamt));
    const i = Math.min(gesamt - 1, Math.floor(stelle));
    const t = stelle - i;
    // Eine Szene steht die meiste Zeit still und geht erst am Rand über.
    // Sonst wäre man in der Mitte jeder Szene schon zur Hälfte in der nächsten.
    const roh = Math.max(0, Math.min(1, (t - 0.72) / 0.28));
    const uebergang = roh * roh * (3 - 2 * roh);
    const A = geladen[i], B = geladen[i + 1] ?? geladen[i];
    const sA = szenen[i], sB = szenen[i + 1] ?? szenen[i];

    videosSteuern(i);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, videoBild(A) ?? A.bild);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, videoBild(B) ?? B.bild);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, A.tiefe);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, B.tiefe);

    gl.uniform4fv(U.fitA, fit(A.seite));
    gl.uniform4fv(U.fitB, fit(B.seite));
    gl.uniform3fv(U.gradeA, sA.grading);
    gl.uniform3fv(U.gradeB, sB.grading);
    // Jede Szene hat ihre eigene Kamerafahrt. Der Wert `phase` ist der Fortschritt
    // dieser einen Szene: 0 beim Eintreten, 1 beim Verlassen. Szene A ist bei t
    // unterwegs, Szene B kommt gerade herein und steht deshalb bei t - 1.
    const fA = fahrt(sA, t);
    const fB = fahrt(sB, t - 1.0);
    gl.uniform2f(U.kameraA, fA[0], fA[1]);
    gl.uniform2f(U.kameraB, fB[0], fB[1]);
    gl.uniform1f(U.zoomA, fA[2]);
    gl.uniform1f(U.zoomB, fB[2]);

    // Bewegtbild an den Scroll koppeln: Wer schnell scrollt, treibt die Szene an;
    // wer stehen bleibt, sieht sie fast still weiterlaufen. Das verbindet Hand
    // und Bild, ohne dass ruckelnd gesucht werden muss.
    const takt = Math.min(2.0, Math.max(0.45, 0.6 + Math.abs(tempo) * 260));
    for (const e of [A, B]) {
      const q = e.quelle;
      if (q?.laeuft && Math.abs(q.el.playbackRate - takt) > 0.05) {
        try { q.el.playbackRate = takt; } catch { /* manche Browser begrenzen das */ }
      }
    }
    gl.uniform1f(U.t, uebergang);
    gl.uniform1i(U.typ, UEBERGAENGE[sB.uebergang ?? 'aufloesen'] ?? 0);
    gl.uniform1f(U.zeit, zeit * 0.001);
    gl.uniform1f(U.tempo, tempo);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(zeichne);
  }
  requestAnimationFrame(zeichne);

  return {
    /** @param {number} wert 0..1 über die gesamte Bildstrecke */
    setzeFortschritt(wert) { fortschritt = Math.max(0, Math.min(1, wert)); },
    tempo: () => tempo,
    stand: () => zustand,
    anhalten() { laeuft = false; },
    fortsetzen() { if (!laeuft) { laeuft = true; requestAnimationFrame(zeichne); } },
    zerstoeren() { laeuft = false; removeEventListener('resize', messen); },
  };
}

/* --- Kleinkram --- */
function programm(gl, vs, fs) {
  const bau = (typ, quelle) => {
    const s = gl.createShader(typ);
    gl.shaderSource(s, quelle); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shaderfehler');
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, bau(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, bau(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'Linkfehler');
  return p;
}

function textur(gl, quelle) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  // WebGL zählt die Bildzeilen von unten – ohne das steht die Welt auf dem Kopf.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, quelle);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

function einfarbig(gl, rgb) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([rgb[0], rgb[1], rgb[2], 255]));
  return t;
}

function lade(pfad) {
  return new Promise((ja, nein) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => ja(img);
    img.onerror = () => nein(new Error('Bild fehlt: ' + pfad));
    img.src = pfad;
  });
}
