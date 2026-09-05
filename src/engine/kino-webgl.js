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
uniform sampler2D uBildC, uTiefeC;   // die übernächste Szene, in der Tiefe dahinter
uniform vec4 uFitA, uFitB, uFitC; // xy Skalierung, zw Versatz (Cover-Anpassung)
uniform vec3 uGradeA, uGradeB, uGradeC;
uniform vec2 uKameraA, uKameraB, uKameraC;
uniform float uZoomA, uZoomB, uZoomC;
uniform float uTor;              // 1 = diese Schwelle ist ein Kapitelzugang
uniform float uT;                // Übergang 0..1
uniform int   uTyp;
uniform float uZeit, uTempo;     // Scrollgeschwindigkeit für Trägheitsunschärfe
uniform float uKorn, uVignette, uQualitaet;
uniform vec3  uFokus;     // x Schärfeebene A, y Schärfeebene B, z Stärke
uniform vec3  uStimmung;  // Lichtstimmung des Kapitels

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

/**
 * Motiv mit Schärfeverlagerung.
 *
 * Beim Hineinfahren wandert die Schärfe von hinten nach vorne, wie beim
 * Objektiv: Zuerst steht der Horizont, am Ende der Vordergrund. Der
 * Unschärfekreis wächst mit dem Abstand zur Schärfeebene – nicht gleichmäßig
 * über das Bild, sondern nach der Tiefenkarte.
 */
/**
 * Motiv mit Schärfeverlagerung.
 *
 * Beim Hineinfahren wandert die Schärfe von hinten nach vorne, wie beim
 * Objektiv: Zuerst steht der Horizont, am Ende der Vordergrund. Der
 * Unschärfekreis wächst mit dem Abstand zur Schärfeebene – nicht gleichmäßig
 * über das Bild, sondern nach der Tiefenkarte.
 */
vec3 holeMitSchaerfe(sampler2D bild, sampler2D tiefe, vec4 fit, vec2 kamera,
                     float zoom, float fokus, float staerke, out float tief){
  vec2 uv = (vUv - 0.5) / (1.0 + zoom) + 0.5;
  uv = uv * fit.xy + fit.zw;
  tief = texture(tiefe, uv).r;
  vec2 abgetastet = uv + kamera * (tief - 0.5);
  if (uQualitaet > 0.5) {
    for (int i = 0; i < 3; i++) {
      float t2 = texture(tiefe, abgetastet).r;
      abgetastet = uv + kamera * (t2 - 0.5);
    }
  }

  vec3 scharf = texture(bild, abgetastet).rgb;
  if (uQualitaet < 0.5 || staerke < 0.002) return scharf;

  // Sehr eng dosiert. Eine Schärfeverlagerung, die man bemerkt, ist zu stark –
  // sie soll nur den Rand der Tiefe weich halten, nie das Hauptmotiv.
  float weite = smoothstep(0.22, 0.85, abs(tief - fokus));
  float kreis = clamp(weite * staerke, 0.0, 0.0016);
  if (kreis < 0.00035) return scharf;

  // Vier Abtastungen auf einem kleinen Kreuz – genug für Objektivcharakter,
  // billig genug für jedes Bild in jedem Einzelbild.
  vec3 summe = scharf
    + texture(bild, abgetastet + vec2( kreis, 0.0)).rgb
    + texture(bild, abgetastet + vec2(-kreis, 0.0)).rgb
    + texture(bild, abgetastet + vec2(0.0,  kreis)).rgb
    + texture(bild, abgetastet + vec2(0.0, -kreis)).rgb;
  return summe * 0.2;
}

/* Weiche Farbstufe: hebt den Grundton an, ohne die Lichter zuzudrücken. */
vec3 stufe(vec3 c, vec3 ton){
  vec3 weich = mix(2.0 * c * ton, 1.0 - 2.0 * (1.0 - c) * (1.0 - ton), step(0.5, c));
  return mix(c, weich, 0.55);
}

void main(){
  float tA, tB;
  vec3 a = stufe(holeMitSchaerfe(uBildA, uTiefeA, uFitA, uKameraA, uZoomA,
                                 uFokus.x, uFokus.z, tA), uGradeA);
  vec3 b = stufe(holeMitSchaerfe(uBildB, uTiefeB, uFitB, uKameraB, uZoomB,
                                 uFokus.y, uFokus.z, tB), uGradeB);

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

  /* --- Durchfahrt ---------------------------------------------------------
     Der eigentliche Unterschied zwischen „weiter" und „hinein": Bei einer
     Blende verschwinden beide Bilder gleichmäßig. Hier weicht zuerst, was nah
     ist – der Fels am Bildrand, der Türrahmen, die Wasseroberfläche –, während
     der ferne Bildteil noch steht. Man fährt durch die Szene hindurch, statt
     sie auszublenden. Die Tiefenkarte entscheidet, was nah ist.

     An Kapitelschwellen (uTor) fällt das stärker aus: Dort ist der Durchtritt
     ein Ereignis, nicht ein Übergang. */
  float naehe = clamp(tA, 0.0, 1.0);
  float weicht = smoothstep(0.0, 1.0, uT * (1.35 + uTor * 0.55) - (1.0 - naehe) * (0.85 + uTor * 0.3));
  m = max(m, weicht);

  /* --- Dritte Ebene -------------------------------------------------------
     Hinter der nächsten Szene liegt die übernächste, kleiner und dunkler.
     Sie wird nur sichtbar, wo die nächste schon geöffnet ist – dadurch sieht
     man in die Tiefe der Welt statt auf eine Blende. */
  float tC;
  vec3 cc = stufe(holeMitSchaerfe(uBildC, uTiefeC, uFitC, uKameraC, uZoomC,
                                  0.5, 0.0, tC), uGradeC) * 0.62;
  float tiefer = smoothstep(0.55, 1.0, uT) * (0.35 + uTor * 0.3);
  vec3 b2 = mix(b, cc, tiefer * (1.0 - smoothstep(0.0, 0.45, tB)));

  vec3 c = mix(a, b2, clamp(m, 0.0, 1.0));

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

  /* --- Lichtstimmung des Kapitels ---
     Eine Kurve über den ganzen Band, nicht je Szene gesetzt: Kapitel 1 kalt und
     nachtblau, Kapitel 5 warm und staubig, Kapitel 6 entsättigt und neblig.
     Zurückhaltend dosiert – die Motive sollen getönt werden, nicht eingefärbt. */
  float grau = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, mix(vec3(grau), c * uStimmung, 0.86), 0.30);

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

/**
 * Zeitkurve der Kamera.
 *
 * Eine Kamera hat Masse. Sie fährt nicht gleichmäßig an und steht nicht
 * schlagartig, sie schwingt aus und wippt einmal leicht nach. Genau das macht
 * diese Kurve: träges Anfahren, langes Ausrollen, eine kleine gedämpfte
 * Schwingung am Ende. Ein reines Smoothstep sah sauber aus und fühlte sich
 * an wie ein geschobenes Bild.
 */
function masse(p) {
  const x = Math.max(0, Math.min(1, p));
  const aus = 1 - Math.pow(1 - x, 3.2);                 // langes Ausrollen
  const wippe = Math.sin(x * Math.PI * 2.4) * Math.pow(1 - x, 2.6) * 0.055;
  const an = x * x * (3 - 2 * x);                       // träges Anfahren
  return Math.max(0, Math.min(1.03, an * 0.35 + aus * 0.65 + wippe));
}

function fahrt(szene, phase) {
  const f = FAHRTEN[szene?.fahrt] ?? FAHRTEN.hinein;
  const w = masse(phase);
  const zw = (paar) => paar[0] + (paar[1] - paar[0]) * w;
  return [zw(f[0]), zw(f[1]), zw(f[2])];
}

export function starteKino(canvas, szenen, optionen = {}) {
  if (!szenen?.length) return null;   // ohne Motive gibt es nichts zu zeichnen
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  const mobil = matchMedia('(max-width: 900px)').matches;

  /**
   * Wie fein gezeichnet wird, entscheidet nicht die Fensterbreite, sondern das
   * Gerät – und das sagt es erst, wenn es arbeitet.
   *
   * Vorher hing beides an einer einzigen Vermutung: schmales Fenster gleich
   * schwaches Gerät. Ein neues Telefon bekam dadurch grundlos die grobe
   * Fassung, ein zehn Jahre alter Rechner am großen Schirm die feine – und
   * ruckelte. Jetzt gibt es drei Stufen, und die Fahrt misst selbst mit:
   *
   *   2 – volle Fassung: Tiefenunschärfe, feines Korn, volle Auflösung
   *   1 – ohne Tiefenunschärfe (der teuerste Posten im Shader)
   *   0 – zusätzlich drei Viertel der Auflösung
   *
   * Heruntergeschaltet wird nach einer schlechten Strecke sofort, hochgeschaltet
   * nur einmal und erst nach einer langen guten – eine Fläche, die zwischen zwei
   * Stufen pendelt, fällt mehr auf als eine, die eine Stufe zu grob bleibt.
   */
  const START_STUFE = optionen.qualitaet !== undefined
    ? (optionen.qualitaet ? 2 : 1)
    : (mobil ? 1 : 2);
  let stufe = START_STUFE;
  let qualitaet = stufe >= 2 ? 1 : 0;
  const dprBasis = Math.min(devicePixelRatio || 1, mobil ? 1.5 : 2);
  let dpr = stufe >= 1 ? dprBasis : dprBasis * 0.75;

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
    bildA: u('uBildA'), bildB: u('uBildB'), bildC: u('uBildC'),
    tiefeA: u('uTiefeA'), tiefeB: u('uTiefeB'), tiefeC: u('uTiefeC'),
    fitA: u('uFitA'), fitB: u('uFitB'), fitC: u('uFitC'),
    gradeA: u('uGradeA'), gradeB: u('uGradeB'), gradeC: u('uGradeC'),
    kameraA: u('uKameraA'), kameraB: u('uKameraB'), kameraC: u('uKameraC'),
    zoomA: u('uZoomA'), zoomB: u('uZoomB'), zoomC: u('uZoomC'), tor: u('uTor'),
    t: u('uT'), typ: u('uTyp'), zeit: u('uZeit'), tempo: u('uTempo'),
    korn: u('uKorn'), vignette: u('uVignette'), qualitaet: u('uQualitaet'),
    fokus: u('uFokus'), stimmung: u('uStimmung'),
  };
  gl.uniform1i(U.bildA, 0); gl.uniform1i(U.bildB, 1); gl.uniform1i(U.bildC, 4);
  gl.uniform1i(U.tiefeA, 2); gl.uniform1i(U.tiefeB, 3); gl.uniform1i(U.tiefeC, 5);
  gl.uniform1f(U.korn, qualitaet ? 0.045 : 0.03);
  gl.uniform1f(U.vignette, 0.55);
  gl.uniform1f(U.qualitaet, qualitaet);

  /* --- Texturen: erst ein Platzhalter, dann progressiv nachladen --- */
  const bewegtErlaubt = bewegtPruefen();
  const platzhalter = einfarbig(gl, [10, 16, 30]);
  const flach = einfarbig(gl, [128, 128, 128]);
  const geladen = szenen.map(() => ({ bild: platzhalter, tiefe: flach, seite: 1.5, bereit: false }));

  /**
   * Geladen wird nur, was in Reichweite ist.
   *
   * Vorher zog die Engine beim Start alle sechzehn Motive gleichzeitig – über
   * ein Megabyte, von dem der Besucher genau eines sah. Jetzt liegt ein Fenster
   * um die aktuelle Position: die Szene selbst, die vorige und die nächsten zwei.
   * Wer nach unten scrollt, hat das nächste Bild längst da, bevor es gebraucht wird.
   */
  // Drei Ebenen brauchen drei Motive – und was hinter dem nächsten Tor liegt,
// wird geladen, während man sich ihm nähert. Sonst steht man im Durchgang
// vor Schwarz.
const VORAUS = 3, ZURUECK = 1;

  function sichere(mitte) {
    const von = Math.max(0, Math.floor(mitte) - ZURUECK);
    const bis = Math.min(szenen.length - 1, Math.ceil(mitte) + VORAUS);
    for (let i = von; i <= bis; i++) {
      const e = geladen[i];
      if (e.angefordert) continue;
      e.angefordert = true;
      const s = szenen[i];
      lade(s.bild).then((img) => {
        e.bild = textur(gl, img);
        e.seite = img.width / img.height;
        e.bereit = true;
      }).catch(() => { e.angefordert = false; });
      if (s.tiefe) {
        lade(s.tiefe).then((img) => { e.tiefe = textur(gl, img); }).catch(() => undefined);
      }
      if (s.video && bewegtErlaubt) e.quelle = videoQuelle(waehleVideo(s));
    }
  }

  /** Auf schmalen Verbindungen und kleinen Geräten die kleinere Fassung. */
  function waehleVideo(s) {
    const netz = navigator.connection;
    const schmal = mobil || netz?.saveData || /2g|3g/.test(netz?.effectiveType ?? '');
    return (schmal && s.videoKlein) ? s.videoKlein : s.video;
  }

  // Die ersten beiden Szenen sofort, damit der Einstieg ohne Warten steht.
  sichere(0);

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
    v.disablePictureInPicture = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.setAttribute('disableremoteplayback', '');
    const q = { el: v, textur: null, laeuft: false, geweckt: false, laedt: false,
      neu: false, stand: -1, breite: 0, hoehe: 0 };
    // Wo der Browser es anbietet, meldet er selbst, wenn ein neues Videobild
    // bereitliegt. Das ist genauer und billiger als jedes Nachfragen.
    if (typeof v.requestVideoFrameCallback === 'function') {
      const melden = () => {
        q.neu = true;
        if (q.geweckt) v.requestVideoFrameCallback(melden);
      };
      q.anmelden = () => v.requestVideoFrameCallback(melden);
    }
    return q;
  }

  /** Nachbarschaft wecken, Ferne schlafen legen – höchstens zwei Videos laufen. */
  /**
   * Videos wecken und schlafen legen.
   *
   * Der Abstand wird an der gleitenden Position gemessen, nicht an der ganzen
   * Zahl. Vorher galt die Nachbarszene ab dem ersten Bild als „nah“ – dadurch
   * lud die Seite beim Start ein Video von über einem Megabyte, während der
   * Besucher noch auf dem schwarzen Einstieg stand. Jetzt beginnt das Laden
   * erst kurz bevor die Szene an der Reihe ist.
   */
  function videosSteuern(stelle) {
    if (schlummert) return;
    geladen.forEach((e, j) => {
      const q = e.quelle; if (!q) return;
      const abstand = Math.abs(j - stelle);

      // Zwei Schwellen statt einer.
      //
      // Vorher begann das Laden erst, wenn die Szene fast an der Reihe war –
      // eine Datei von zwei, drei Megabyte war dann noch unterwegs, während
      // ihre Szene schon im Bild stand. Man sah das Standbild, dann sprang das
      // Video hinein. Jetzt wird eine Szene früher geladen und erst spät
      // abgespielt: Das Laden kostet Bandbreite, das Abspielen kostet Rechenzeit,
      // und nur das Zweite muss knapp gehalten werden.
      if (abstand < 1.7 && !q.laedt) {
        q.laedt = true; q.el.preload = 'auto'; q.el.load();
      }
      if (abstand < 0.9 && !q.geweckt) {
        q.geweckt = true;
        q.el.play().then(() => { q.laeuft = true; q.anmelden?.(); })
          .catch(() => { q.laeuft = false; });
      } else if (q.geweckt && abstand > 1.35) {
        // Nur anhalten, nicht vergessen: Der Puffer bleibt, bis die Szene ganz
        // aus der Nachbarschaft fällt.
        q.geweckt = false; q.laeuft = false; q.neu = false;
        try { q.el.pause(); } catch { /* egal */ }
      }
      if (q.laedt && abstand > 2.4) schlafen(q);
    });
  }

  /**
   * Ein Video, das außer Reichweite gerät, hört nicht nur auf zu laufen: Seine
   * Textur wird freigegeben. Ein Bild von 1920 mal 1080 belegt als RGBA rund
   * acht Megabyte Grafikspeicher – auf einem älteren Handy ist das der
   * Unterschied zwischen einer flüssigen Fahrt und einem Neustart der Fläche.
   */
  function schlafen(q) {
    if (!q) return;
    q.geweckt = false; q.laeuft = false; q.neu = false; q.stand = -1; q.laedt = false;
    try { q.el.pause(); } catch { /* egal */ }
    q.el.preload = 'none';
    if (q.textur) { gl.deleteTexture(q.textur); q.textur = null; }
  }

  /**
   * Im Hintergrund ruht alles.
   *
   * Ein Video dekodiert weiter, auch wenn der Tab nicht sichtbar ist – der
   * Browser hält nur das Zeichnen an. Auf dem Handy heißt das: Akku für ein
   * Bild, das niemand sieht. Beim Zurückkommen läuft es von selbst wieder an,
   * sobald die Fahrt die Szene erreicht.
   */
  let schlummert = false;
  function sichtbarkeit() {
    schlummert = document.hidden;
    if (schlummert) geladen.forEach((e) => schlafen(e.quelle));
  }
  document.addEventListener('visibilitychange', sichtbarkeit);

  /** Laufendes Videobild in die Textur schreiben. Fällt es aus, bleibt das Standbild. */
  function videoBild(e) {
    const q = e.quelle;
    if (!q || !q.laeuft || q.el.readyState < 2) return null;

    // Nur hochladen, wenn tatsächlich ein neues Bild anliegt.
    //
    // Ein Video läuft mit 24 bis 30 Bildern je Sekunde, die Fläche zeichnet mit
    // 60 oder 120. Vorher wurde in jedem gezeichneten Bild ein volles
    // Videobild in die Grafikkarte geschoben – bei zwei laufenden Videos also
    // bis zu viermal so oft wie nötig. Das war der zweitteuerste Posten der
    // Fahrt und auf schwachen Geräten deutlich als Stocken zu sehen.
    const neu = q.anmelden ? q.neu : q.el.currentTime !== q.stand;
    if (q.textur && !neu) return q.textur;
    q.neu = false; q.stand = q.el.currentTime;

    // Speicher einmal anlegen, danach nur noch überschreiben.
    //
    // `texImage2D` legt die Textur jedes Mal neu an: Bei 1920 mal 1080 sind das
    // acht Megabyte Grafikspeicher, die je Bild angefordert und wieder
    // freigegeben werden. `texSubImage2D` schreibt in denselben Speicher. Auf
    // schwachen Geräten ist das der Unterschied zwischen einer Fahrt und einem
    // Ruckeln, und der Treiber muss nicht ständig aufräumen.
    const b = q.el.videoWidth, h = q.el.videoHeight;
    if (!b || !h) return q.textur;
    if (!q.textur) {
      q.textur = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, q.textur);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      q.breite = 0; q.hoehe = 0;
    }
    gl.bindTexture(gl.TEXTURE_2D, q.textur);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (q.breite !== b || q.hoehe !== h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, q.el);
      q.breite = b; q.hoehe = h;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, q.el);
    }
    return q.textur;
  }

  /* --- Zustand --- */
  let breite = 0, hoehe = 0;
  let fortschritt = 0, gedaempft = 0, tempo = 0, laeuft = true, letzteZeit = 0;
  let zustand = { fortschritt: 0, gedaempft: 0 };
  const zoomStaerke = optionen.zoom ?? 0.1;

  /** Stufe wechseln: Auflösung und Shaderaufwand in einem Zug nachziehen. */
  function stufeSetzen(neu) {
    const begrenzt = Math.max(0, Math.min(START_STUFE, neu));
    if (begrenzt === stufe) return;
    stufe = begrenzt;
    qualitaet = stufe >= 2 ? 1 : 0;
    dpr = stufe >= 1 ? dprBasis : dprBasis * 0.75;
    gl.uniform1f(U.qualitaet, qualitaet);
    gl.uniform1f(U.korn, qualitaet ? 0.045 : 0.03);
    messen();
  }

  // Bildzeiten der jüngsten Strecke. Beurteilt wird der Median, nicht der
  // Mittelwert: ein einzelnes langes Bild – ein nachgeladenes Motiv – ist kein
  // Urteil über das Gerät.
  //
  // Gezählt wird in Sekunden, nicht in Bildern. Das ist der Punkt: Auf einem
  // Gerät, das nur fünf Bilder je Sekunde schafft, wäre ein Fenster von
  // fünfundvierzig Bildern neun Sekunden lang – die Fläche würde also gerade
  // dort am längsten ruckeln, wo sie am schnellsten nachgeben müsste. So
  // entscheidet sie nach gut einer Sekunde, egal wie langsam das Gerät ist.
  const zeiten = [];
  let fenster = 0;          // vergangene Zeit im laufenden Fenster, Sekunden
  let anlauf = 1.5;         // die erste Sekunde zählt nicht: da wird geladen
  let gutStrecke = 0;
  function regeln(dt) {
    if (anlauf > 0) { anlauf -= dt; return; }
    zeiten.push(dt * 1000);
    fenster += dt;
    if (fenster < 1.0 || zeiten.length < 4) return;
    const sortiert = [...zeiten].sort((a, b) => a - b);
    const median = sortiert[Math.floor(sortiert.length / 2)];
    zeiten.length = 0; fenster = 0;
    if (median > 24 && stufe > 0) { stufeSetzen(stufe - 1); gutStrecke = 0; return; }
    if (median < 13.5) { gutStrecke++; if (gutStrecke >= 6) { stufeSetzen(stufe + 1); gutStrecke = 0; } }
    else gutStrecke = 0;
  }

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
    regeln(dt);
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
    sichere(stelle);
    const A = geladen[i], B = geladen[i + 1] ?? geladen[i];
    const sA = szenen[i], sB = szenen[i + 1] ?? szenen[i];

    videosSteuern(stelle);
    const C = geladen[i + 2] ?? B;
    const sC = szenen[i + 2] ?? sB;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, videoBild(A) ?? A.bild);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, videoBild(B) ?? B.bild);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, C.bild ?? platzhalter);
    gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, C.tiefe ?? platzhalter);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, A.tiefe);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, B.tiefe);

    gl.uniform4fv(U.fitA, fit(A.seite));
    gl.uniform4fv(U.fitB, fit(B.seite));
    gl.uniform4fv(U.fitC, fit(C.seite));
    gl.uniform3fv(U.gradeC, sC.grading ?? sB.grading);
    // Die übernächste Szene steht weiter hinten: kleiner Ausschnitt, kaum Fahrt.
    gl.uniform2f(U.kameraC, 0, 0);
    gl.uniform1f(U.zoomC, 0.0);
    // Ein Kapitelanfang ist eine Schwelle, kein Übergang.
    gl.uniform1f(U.tor, sB.tor ? 1 : 0);
    gl.uniform3fv(U.gradeA, sA.grading);
    gl.uniform3fv(U.gradeB, sB.grading);
    // Jede Szene hat ihre eigene Kamerafahrt. Der Wert `phase` ist der Fortschritt
    // dieser einen Szene: 0 beim Eintreten, 1 beim Verlassen. Szene A ist bei t
    // unterwegs, Szene B kommt gerade herein und steht deshalb bei t - 1.
    // Schnitt auf Bewegung: Die eintretende Szene beginnt nicht bei null, sondern
    // dort, wo die abgehende gerade steht. Dadurch bricht die Fahrt am Übergang
    // nicht ab – die Kamera läuft durch, nur das Bild wechselt.
    const fA = fahrt(sA, t);
    const fB = fahrt(sB, (t - 1.0) + uebergang * 0.34);
    gl.uniform2f(U.kameraA, fA[0], fA[1]);
    gl.uniform2f(U.kameraB, fB[0], fB[1]);
    gl.uniform1f(U.zoomA, fA[2]);
    gl.uniform1f(U.zoomB, fB[2]);

    // Schärfeverlagerung: Beim Hineinfahren wandert die Schärfe von hinten
    // (Horizont) nach vorne (Vordergrund), beim Herausfahren umgekehrt.
    const zieht = (sz) => (sz?.fahrt === 'heraus' ? -1 : 1);
    const ebene = (sz, phase) => 0.5 + zieht(sz) * (masse(Math.max(0, Math.min(1, phase))) - 0.5) * 0.34;
    gl.uniform3f(U.fokus, ebene(sA, t), ebene(sB, (t - 1.0) + uebergang * 0.34),
      qualitaet ? 0.0030 : 0.0);

    // Lichtstimmung des Kapitels, zwischen den Szenen weich überblendet
    const stA = sA?.stimmung ?? [1, 1, 1];
    const stB = sB?.stimmung ?? [1, 1, 1];
    gl.uniform3f(U.stimmung,
      stA[0] + (stB[0] - stA[0]) * uebergang,
      stA[1] + (stB[1] - stA[1]) * uebergang,
      stA[2] + (stB[2] - stA[2]) * uebergang);

    // Bewegtbild an den Scroll koppeln: Wer schnell scrollt, treibt die Szene an;
    // wer stehen bleibt, sieht sie fast still weiterlaufen. Das verbindet Hand
    // und Bild, ohne dass ruckelnd gesucht werden muss.
    const takt = Math.min(2.0, Math.max(0.45, 0.6 + Math.abs(tempo) * 260));
    for (const e of [A, B]) {
      const q = e?.quelle;
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
    /** Aktuelle Zeichenstufe – für Messungen und zur Fehlersuche. */
    stufe: () => stufe,
    anhalten() { laeuft = false; },
    fortsetzen() { if (!laeuft) { laeuft = true; requestAnimationFrame(zeichne); } },
    zerstoeren() {
      laeuft = false;
      removeEventListener('resize', messen);
      document.removeEventListener('visibilitychange', sichtbarkeit);
      // Videos anhalten und ihre Texturen freigeben, sonst hängen sie beim
      // Seitenwechsel im Speicher und dekodieren weiter.
      geladen.forEach((e) => {
        schlafen(e.quelle);
        if (e.quelle) { e.quelle.el.removeAttribute('src'); e.quelle.el.load(); }
      });
      /*
       * Und alles andere hinterher.
       *
       * Bis zum 05.09.2026 gab diese Fläche nur die Videotexturen frei. Die
       * Standbilder blieben liegen: je Szene ein Motiv und eine Tiefenkarte,
       * als RGBA rund acht Megabyte für ein 1920er Bild. Beim Wechsel von
       * einer Welt in die nächste legte der Browser die neue Fläche daneben,
       * und die alte gab ihren Grafikspeicher erst frei, wenn er das Blatt
       * irgendwann einsammelte — auf einem älteren Telefon nach zwei, drei
       * Wechseln der Punkt, an dem die Fläche schwarz wird.
       *
       * Der Kontextverlust am Schluss ist die einzige Anweisung, die dem
       * Treiber wirklich sagt: fertig, alles zurück.
       */
      geladen.forEach((e) => {
        if (e.bild && e.bild !== platzhalter) gl.deleteTexture(e.bild);
        if (e.tiefe && e.tiefe !== platzhalter) gl.deleteTexture(e.tiefe);
        e.bild = null; e.tiefe = null;
      });
      if (platzhalter) gl.deleteTexture(platzhalter);
      if (puffer) gl.deleteBuffer(puffer);
      if (prog) gl.deleteProgram(prog);
      const verlust = gl.getExtension('WEBGL_lose_context');
      if (verlust) { try { verlust.loseContext(); } catch { /* egal */ } }
    },
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
