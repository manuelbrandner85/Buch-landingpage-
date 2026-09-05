/**
 * Der Zerfall.
 *
 * Wenn der Evidenzregler eine Angabe zurücktreten lässt, verblasste sie
 * bisher. Verblassen ist eine Behauptung über eine Behauptung: Da war etwas,
 * jetzt ist es schwächer. Was das Buch aber sagt, ist härter — die Angabe hält
 * der Prüfung nicht stand, sie löst sich auf. Also löst sie sich auf: Die
 * Fläche, auf der sie stand, zerfällt in Körner, und die Körner treiben nach
 * oben davon.
 *
 * Das ist kein Effekt zur Zierde. Es ist die These des Bandes, ausgeführt:
 * Auf der strengsten Stufe bleibt in manchen Abschnitten fast nichts stehen.
 * Wer den Regler zieht, sieht nicht eine Liste kürzer werden, sondern eine
 * Seite leerer.
 *
 * Warum eigenes WebGL und nicht Three.js: Gebraucht wird ein Punktehaufen mit
 * einer Bewegungsformel — kein Szenengraph, keine Kamera, kein Material, kein
 * Licht. Three.js kostet rund 150 KB gepackt; das hier sind zweihundert
 * Zeilen und ein Shader, und es fügt sich in den Motor, der ohnehin schon im
 * Haus ist.
 *
 * Was es nicht tut: laufen, wenn nichts zu tun ist. Ohne lebende Körner gibt
 * es keine Bildschleife — die Fläche kostet dann null.
 */

const VERTEX = `#version 300 es
precision highp float;
layout(location=0) in vec2 aStart;   // Ausgangspunkt in Bildpunkten
layout(location=1) in vec2 aTrieb;   // Grundrichtung
layout(location=2) in vec3 aWesen;   // Aussaat, Geburt, Lebensdauer
layout(location=3) in vec3 aFarbe;

uniform vec2 uFlaeche;
uniform float uZeit;

out vec3 vFarbe;
out float vLeben;

/* Ein billiger Wirbel: zwei versetzte Sinuswellen ergeben ein Feld, das
   aussieht wie aufsteigende Luft und keinen einzigen Texturzugriff kostet. */
vec2 wirbel(vec2 p, float t){
  return vec2(
    sin(p.y * 0.013 + t * 1.1 + p.x * 0.004),
    cos(p.x * 0.011 - t * 0.9 + p.y * 0.005) * 0.6 - 1.0);
}

void main(){
  float alter = uZeit - aWesen.y;
  float f = clamp(alter / aWesen.z, 0.0, 1.0);
  vLeben = 1.0 - f;

  /* Erst schnell auseinander, dann getragen: Die Wurzel vorn macht den
     Aufbruch, das Quadrat hinten das Davontreiben. */
  vec2 p = aStart
    + aTrieb * sqrt(f) * 46.0
    + wirbel(aStart, uZeit + aWesen.x * 6.28) * f * f * 120.0;

  vec2 n = (p / uFlaeche) * 2.0 - 1.0;
  gl_Position = vec4(n.x, -n.y, 0.0, 1.0);
  gl_PointSize = mix(3.0, 0.8, f * f) * (1.0 + aWesen.x * 0.8);
  vFarbe = aFarbe;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec3 vFarbe;
in float vLeben;
out vec4 farbe;
void main(){
  /* Runde Körner, weiche Kante — ein Quadrat sieht man sofort als Quadrat. */
  vec2 d = gl_PointCoord - 0.5;
  float rund = smoothstep(0.5, 0.14, length(d));
  /* Am Anfang hell, dann zurückgenommen: Das Aufbrechen soll man sehen,
     das Davontreiben nur noch ahnen.
     Der Abfall war zuerst quadratisch — davon blieb eine Drittelsekunde übrig,
     zu wenig, um als Zerfall gelesen zu werden. Jetzt flacher und länger.
     Gemessen an der Uhr des Motors: bei 1,2 s stehen noch gut zweitausend
     Bildpunkte, bei 2,1 s knapp zweihundert, bei 2,8 s nichts mehr. Der Zerfall
     ist also anderthalb Sekunden lang zu sehen und verliert sich dann.
     Achtung bei eigenen Messungen: Ein Auslesen der Fläche über getImageData
     kostet selbst hunderte Millisekunden. Wer die Proben nur nach Wunschzeit
     staffelt, misst eine Uhr, die zu schnell geht, und hält einen gesunden
     Zerfall für abgebrochen. Immer die Motorzeit mitschreiben. */
  float a = rund * pow(vLeben, 1.3) * 0.8;
  farbe = vec4(vFarbe * (0.5 + vLeben * 0.5), a);
}`;

const uebersetze = (gl, typ, quelle) => {
  const s = gl.createShader(typ);
  gl.shaderSource(s, quelle);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? 'Shader');
  }
  return s;
};

/**
 * @param {HTMLCanvasElement} leinwand
 * @param {{hoechstens?: number}} [optionen]
 */
export function zerfallFlaeche(leinwand, optionen = {}) {
  const gl = leinwand.getContext('webgl2', {
    alpha: true, antialias: false, premultipliedAlpha: false, depth: false,
  });
  if (!gl) return null;

  const HOECHSTENS = optionen.hoechstens ?? 6000;
  const prog = gl.createProgram();
  gl.attachShader(prog, uebersetze(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(prog, uebersetze(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const uFlaeche = gl.getUniformLocation(prog, 'uFlaeche');
  const uZeit = gl.getUniformLocation(prog, 'uZeit');

  // Ein Feld je Eigenschaft, alle in einem Puffer — bei sechstausend Körnern
  // ist das ein Bruchteil eines Megabytes und wird einmal je Bild geschickt.
  const start = new Float32Array(HOECHSTENS * 2);
  const trieb = new Float32Array(HOECHSTENS * 2);
  const wesen = new Float32Array(HOECHSTENS * 3);
  const farbe = new Float32Array(HOECHSTENS * 3);
  let anzahl = 0;

  const puffer = [start, trieb, wesen, farbe].map((feld, i) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, feld.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, [2, 2, 3, 3][i], gl.FLOAT, false, 0, 0);
    return b;
  });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  let laeuft = false;
  let dpr = 1;
  const beginn = performance.now();

  function messen() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    leinwand.width = Math.round(leinwand.clientWidth * dpr);
    leinwand.height = Math.round(leinwand.clientHeight * dpr);
    gl.viewport(0, 0, leinwand.width, leinwand.height);
    gl.uniform2f(uFlaeche, leinwand.clientWidth, leinwand.clientHeight);
  }

  function zeichne() {
    if (!laeuft) return;
    const t = (performance.now() - beginn) / 1000;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Verbrauchte Körner fallen vorn heraus: Das Feld bleibt dicht, ohne dass
    // je etwas sortiert werden müsste.
    let ziel = 0;
    for (let i = 0; i < anzahl; i += 1) {
      if (t - wesen[i * 3 + 1] < wesen[i * 3 + 2]) {
        if (ziel !== i) {
          start.copyWithin(ziel * 2, i * 2, i * 2 + 2);
          trieb.copyWithin(ziel * 2, i * 2, i * 2 + 2);
          wesen.copyWithin(ziel * 3, i * 3, i * 3 + 3);
          farbe.copyWithin(ziel * 3, i * 3, i * 3 + 3);
        }
        ziel += 1;
      }
    }
    anzahl = ziel;

    if (anzahl === 0) { laeuft = false; return; }

    gl.uniform1f(uZeit, t);
    const felder = [start, trieb, wesen, farbe];
    const breiten = [2, 2, 3, 3];
    for (let i = 0; i < 4; i += 1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, puffer[i]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, felder[i].subarray(0, anzahl * breiten[i]));
    }
    gl.drawArrays(gl.POINTS, 0, anzahl);
    requestAnimationFrame(zeichne);
  }

  return {
    messen,
    /**
     * Eine Fläche zerfällt.
     * @param {DOMRect} rechteck in Bildpunkten des Fensters
     * @param {[number,number,number]} ton 0..1
     */
    streue(rechteck, ton) {
      const t = (performance.now() - beginn) / 1000;
      // Die Zahl folgt der Fläche, nicht der Laune: eine lange Zeile
      // zerfällt in mehr Körner als ein Wort.
      const wieviele = Math.min(900,
        Math.max(40, Math.round((rechteck.width * rechteck.height) / 26)));
      for (let i = 0; i < wieviele && anzahl < HOECHSTENS; i += 1) {
        const k = anzahl;
        start[k * 2] = rechteck.left + Math.random() * rechteck.width;
        start[k * 2 + 1] = rechteck.top + Math.random() * rechteck.height;
        const w = Math.random() * Math.PI * 2;
        trieb[k * 2] = Math.cos(w) * (0.3 + Math.random() * 0.7);
        trieb[k * 2 + 1] = Math.sin(w) * (0.3 + Math.random() * 0.7) - 0.5;
        wesen[k * 3] = Math.random();
        wesen[k * 3 + 1] = t + Math.random() * 0.12;
        wesen[k * 3 + 2] = 2.6 + Math.random() * 0.9;
        farbe[k * 3] = ton[0]; farbe[k * 3 + 1] = ton[1]; farbe[k * 3 + 2] = ton[2];
        anzahl += 1;
      }
      if (!laeuft) { laeuft = true; requestAnimationFrame(zeichne); }
    },
    zerstoeren() {
      laeuft = false;
      puffer.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
      const verlust = gl.getExtension('WEBGL_lose_context');
      if (verlust) { try { verlust.loseContext(); } catch { /* egal */ } }
    },
  };
}
