/**
 * Ein Faden, der hängt.
 *
 * Auf der Karte lag der Faden bisher als gezeichneter Bogen da: richtig
 * verlegt, aber ein Bild von einem Faden. Das Buch heißt „Die unsichtbaren
 * Fäden“ — der Faden ist die These, nicht die Verzierung. Also soll er sich
 * anfühlen wie einer: Er hängt zwischen den Orten durch, er schwingt nach,
 * wenn die Kamera kippt, und wenn man ihn anzupft, schwingt er aus.
 *
 * Warum keine Physikbibliothek: Gebraucht wird eine Kette aus rund
 * hundertvierzig Punkten mit Feder, Dämpfung und Schwerkraft — das sind
 * vierzig Zeilen. Rapier und Cannon bringen Kollision, Reibung, Körper und
 * Gelenke mit, wovon hier nichts vorkommt, und kosten gepackt mehr als die
 * ganze übrige Seite.
 *
 * Warum Federn zur Ruhelage und kein freies Seil: Die Ruhelage ist der Bogen,
 * den `faden()` legt — je Abschnitt seitlich ausgelenkt, damit es aussieht wie
 * ein Faden über einer Kugel. Ein frei hängendes Seil würde diese Form
 * verlieren und zu einer Kettenlinie durchfallen; die Orte lägen dann nicht
 * mehr auf ihm. Die Feder hält die Form, die Trägheit macht die Bewegung.
 *
 * Was es nicht tut: rechnen, wenn nichts mehr schwingt. Unterschreitet die
 * Bewegung aller Punkte eine Schwelle, meldet `ruht` das, und der Aufrufer
 * hält seine Bildschleife an. Ein stiller Faden kostet nichts.
 */

const FEDER = 0.055;      // Zug zur Ruhelage. Höher = steifer, tote Saite.
const DAEMPFUNG = 0.945;  // Was von der Geschwindigkeit je Bild übrig bleibt.
const SCHWERE = 0.10;     // Durchhang in Kartenpunkten je Bild.
const GLATT = 2;          // Durchgänge, die Knicke aus der Kette bügeln.
const RUHE = 0.02;        // Groesste Bewegung eines Punktes, ab der es Stillstand heißt.
                          // Bei der naechsten Kameraeinstellung sind das rund vier
                          // Hundertstel eines Bildpunktes - nichts, was ein Auge sieht.
const GEDULD = 180;       /* Bilder ohne neuen Anstoss, nach denen Schluss ist.
                           * Drei Sekunden. Gemessen ist ein Zupfer nach zwei
                           * Sekunden auf ein Zehntel einer Karteneinheit
                           * herunter - bei der naechsten Kameraeinstellung ist
                           * das ein Fuenftel Bildpunkt. Was danach noch
                           * uebrig bleibt, ist Rundungsrauschen und kein
                           * Grund, eine Bildschleife weiterlaufen zu lassen. */

/**
 * @param {{x:number,y:number}[]} ruhelage Punkte des gezeichneten Fadens.
 * @param {number[]} anker Indizes, die festhalten – die Orte.
 */
export function seil(ruhelage, anker = []) {
  const n = ruhelage.length;
  const rx = new Float32Array(n);
  const ry = new Float32Array(n);
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const ax = new Float32Array(n);   // vorherige Lage, daraus kommt die Geschwindigkeit
  const ay = new Float32Array(n);
  const fest = new Uint8Array(n);

  for (let i = 0; i < n; i += 1) {
    rx[i] = x[i] = ax[i] = ruhelage[i].x;
    ry[i] = y[i] = ay[i] = ruhelage[i].y;
  }
  // Die Enden halten immer: Ein Faden, dessen Anfang wegfliegt, ist ein Riss.
  fest[0] = 1; fest[n - 1] = 1;
  for (const i of anker) if (i >= 0 && i < n) fest[i] = 1;

  let griff = -1;          // Punkt, den gerade jemand hält
  let ruht = true;
  let bewegung = 0;
  let seitStoss = 0;

  /** Ein Stoß auf die ganze Kette – so wirkt die Kamerafahrt auf den Faden. */
  function stossen(dx, dy) {
    if (!dx && !dy) return;
    for (let i = 0; i < n; i += 1) {
      if (fest[i]) continue;
      // In der Mitte zwischen zwei Ankern wirkt der Stoß am stärksten.
      ax[i] -= dx; ay[i] -= dy;
    }
    ruht = false; seitStoss = 0;
  }

  function schritt() {
    if (ruht && griff < 0) return false;
    bewegung = 0;
    seitStoss += 1;
    for (let i = 0; i < n; i += 1) {
      if (fest[i] || i === griff) {
        if (fest[i]) { x[i] = rx[i]; y[i] = ry[i]; }
        ax[i] = x[i]; ay[i] = y[i]; continue;
      }
      const vx = (x[i] - ax[i]) * DAEMPFUNG;
      const vy = (y[i] - ay[i]) * DAEMPFUNG;
      ax[i] = x[i]; ay[i] = y[i];
      x[i] += vx + (rx[i] - x[i]) * FEDER;
      y[i] += vy + (ry[i] - y[i]) * FEDER + SCHWERE * 0.06;
      const b = Math.abs(vx) + Math.abs(vy);
      if (b > bewegung) bewegung = b;
    }
    /*
     * Knicke ausbügeln — aber an der Auslenkung, nicht an der Lage.
     *
     * Der erste Versuch glättete die Punkte selbst. Das sieht richtig aus und
     * ist es nicht: Die Glättung will eine Gerade, die Feder will den Bogen,
     * und die beiden schieben sich in jedem Bild gegeneinander. Gemessen
     * zitterte der Faden dadurch auch nach sieben Sekunden noch mit zwei
     * Zehnteln, die Bildschleife hielt nie an und kostete Akku für etwas,
     * das man nicht sieht.
     *
     * Geglättet wird deshalb die Abweichung von der Ruhelage. Liegt der Faden
     * ruhig, ist die Abweichung überall null, und die Glättung tut nichts —
     * ein echter Festpunkt statt eines Waffenstillstands.
     */
    for (let d = 0; d < GLATT; d += 1) {
      for (let i = 1; i < n - 1; i += 1) {
        if (fest[i] || i === griff) continue;
        const zx = ((x[i - 1] - rx[i - 1]) + (x[i + 1] - rx[i + 1])) * 0.5 - (x[i] - rx[i]);
        const zy = ((y[i - 1] - ry[i - 1]) + (y[i + 1] - ry[i + 1])) * 0.5 - (y[i] - ry[i]);
        x[i] += zx * 0.28; ax[i] += zx * 0.28;
        y[i] += zy * 0.28; ay[i] += zy * 0.28;
      }
    }
    ruht = griff < 0 && (bewegung < RUHE || seitStoss > GEDULD);
    return true;
  }

  /** Nächster Punkt zu einer Stelle – und wie weit er weg ist. */
  function naechster(px, py) {
    let beste = -1; let mass = Infinity;
    for (let i = 1; i < n - 1; i += 1) {
      const d = (x[i] - px) ** 2 + (y[i] - py) ** 2;
      if (d < mass) { mass = d; beste = i; }
    }
    return { i: beste, abstand: Math.sqrt(mass) };
  }

  return {
    get ruht() { return ruht; },
    get anzahl() { return n; },
    stossen,
    schritt,
    naechster,
    /** Anfassen. Gibt zurück, ob überhaupt etwas in Reichweite lag. */
    greifen(px, py, reichweite) {
      const { i, abstand } = naechster(px, py);
      if (abstand > reichweite) return false;
      griff = i; ruht = false; seitStoss = 0; return true;
    },
    /**
     * Ziehen – aber nur so weit, wie ein Faden sich ziehen lässt.
     *
     * Ohne Grenze folgt der gegriffene Punkt dem Zeiger bis ans Fensterende,
     * und aus dem Faden wird eine lange spitze Zunge: Das sieht aus wie ein
     * Gummiband in einer Kralle, nicht wie etwas Gespanntes. Also gibt es eine
     * Reichweite. Wer darüber hinauszieht, dem entgleitet der Faden – genau
     * wie in der Hand. Das ist keine Einschränkung, sondern die Rückmeldung:
     * Er ist gespannt, und irgendwann gibt er nicht mehr nach, sondern los.
     *
     * @returns die Auslenkung, wenn er entglitten ist, sonst null.
     */
    ziehen(px, py, hoechstens) {
      if (griff < 0) return null;
      const i = griff;
      const dx = px - rx[i];
      const dy = py - ry[i];
      const l = Math.hypot(dx, dy);
      if (l > hoechstens * 1.7) {
        // Entglitten: mit der ganzen aufgestauten Spannung.
        x[i] = rx[i] + (dx / l) * hoechstens;
        y[i] = ry[i] + (dy / l) * hoechstens;
        griff = -1; ruht = false; seitStoss = 0;
        return { punkt: i, anteil: i / (n - 1), weite: hoechstens };
      }
      const f = l > hoechstens ? hoechstens / l : 1;
      x[i] = rx[i] + dx * f; y[i] = ry[i] + dy * f;
      ax[i] = x[i]; ay[i] = y[i];
      return null;
    },
    /** Loslassen. Liefert die Auslenkung – daraus wird die Lautstärke. */
    loslassen() {
      if (griff < 0) return null;
      const i = griff;
      const weite = Math.hypot(x[i] - rx[i], y[i] - ry[i]);
      griff = -1; ruht = false; seitStoss = 0;
      return { punkt: i, anteil: i / (n - 1), weite };
    },
    /** Ein Zupfer ohne Ziehen – für Berührung, wo Ziehen scrollt. */
    anzupfen(px, py, reichweite, kraft) {
      const { i, abstand } = naechster(px, py);
      if (abstand > reichweite) return null;
      const dx = x[i] - px; const dy = y[i] - py;
      const l = Math.hypot(dx, dy) || 1;
      ax[i] -= (dx / l) * kraft; ay[i] -= (dy / l) * kraft;
      ruht = false; seitStoss = 0;
      return { punkt: i, anteil: i / (n - 1), weite: kraft };
    },
    /** Der gezeichnete Weg – über Mittelpunkte geglättet, sonst sieht man die Kette. */
    pfad() {
      let d = `M ${x[0].toFixed(1)} ${y[0].toFixed(1)}`;
      for (let i = 1; i < n - 1; i += 1) {
        const mx = (x[i] + x[i + 1]) * 0.5;
        const my = (y[i] + y[i + 1]) * 0.5;
        d += ` Q ${x[i].toFixed(1)} ${y[i].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      d += ` L ${x[n - 1].toFixed(1)} ${y[n - 1].toFixed(1)}`;
      return d;
    },
  };
}
