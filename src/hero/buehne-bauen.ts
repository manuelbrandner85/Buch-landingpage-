import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { Budget } from '@/experience/typen';
import { weg } from '@/world/wege';
import kamerawerte from './kamera.json';

/**
 * Die Buehne des Cinematic Hero.
 *
 * Sie kennt React nicht und wird nie von React getaktet. Sie bekommt eine
 * Leinwand und ein Budget, baut daraus eine Szene und laeuft in ihrer eigenen
 * Schleife daneben her.
 *
 * Die Dramaturgie folgt der Vorgabe: Dunkelheit, dann entsteht Licht, Staub
 * schwebt, das Buch erscheint, ein Streifen wandert ueber das Cover und laesst
 * die Goldpraegung anlaufen. Der Streifen ist kein Effekt — er ist der Grund,
 * warum hier ueberhaupt Geometrie steht statt eines Bildes: Die Folie wurde in
 * Blender als Metallic gebacken und reagiert deshalb anders als der matte
 * Druck daneben.
 */

export interface Buehnensteuerung {
  schritt(deltaMs: number, jetzt: number): void;
  groesseSetzen(breite: number, hoehe: number): void;
  budgetAnwenden(budget: Budget): void;
  /** 0 bis 1 — wie weit der Leser durch den Hero gescrollt ist. */
  fortschrittSetzen(wert: number): void;
  abbauen(): void;
}

/**
 * Die Kamerafuehrung kommt aus `kamera.json` — derselben Datei, aus der das
 * Blender-Skript die Standbilder rechnet. Ein Wert, der an zwei Stellen
 * gepflegt wird, weicht irgendwann ab; hier waere die Folge ein sichtbarer
 * Sprung in dem Moment, in dem das Standbild der Buehne weicht.
 */
interface Fuehrung {
  oeffnungswinkel: number;
  abstandFern: number;
  abstandNah: number;
  schwenk: number;
  neigung: number;
  versatzX: number;
  versatzY: number;
}

const FUEHRUNG: { quer: Fuehrung; hoch: Fuehrung } = {
  quer: kamerawerte.quer,
  hoch: kamerawerte.hoch,
};
const DREHUNG = kamerawerte.drehung;

/**
 * Kugelkoordinaten um das Buch statt drei Zahlen, die zufaellig zusammen
 * einen Abstand ergeben.
 *
 * Der erste Anlauf stand auf (0.30, 0.10, 0.95) — bei 30 Grad
 * Oeffnungswinkel sind das 0,51 sichtbare Hoehe fuer ein Buch der Hoehe 1.
 * Das Buch lag doppelt so hoch wie das Bild, und man haette es erst im
 * Browser gesehen. Mit Abstand, Schwenk und Neigung laesst sich der
 * Bildausschnitt vorher ausrechnen.
 */
function kameraOrt(f: Fuehrung, anteil: number, hinein: THREE.Vector3): void {
  const abstand = f.abstandFern + (f.abstandNah - f.abstandFern) * anteil;
  const waagerecht = Math.cos(f.neigung);
  hinein.set(
    abstand * Math.sin(f.schwenk) * waagerecht,
    abstand * Math.sin(f.neigung),
    abstand * Math.cos(f.schwenk) * waagerecht,
  );
}

/**
 * Die drei Fassungen des Modells.
 *
 * `weg()` und nicht der nackte Pfad: Unter der eigenen Domain liegt die Seite
 * in der Wurzel, auf dem Spiegel unter github.io in einem Unterordner. Ein
 * Pfad mit fuehrendem Schraegstrich zeigt dort an der Seite vorbei. `basePath`
 * von Next.js faengt das nicht ab — es erreicht `next/link` und `next/image`,
 * nicht einen Pfad, den ein Lader zur Laufzeit selbst zusammensetzt.
 */
const MODELL: Record<Budget['modellfassung'], string> = {
  high: weg('/modelle/buch-high.glb'),
  medium: weg('/modelle/buch-medium.glb'),
  low: weg('/modelle/buch-low.glb'),
  keine: weg('/modelle/buch-low.glb'),
};

/**
 * Der Staub.
 *
 * Nicht als Partikelsystem mit tausend Objekten, sondern als EIN Punktnetz.
 * Das ist der Unterschied zwischen einem Draw Call und tausend. Die Bewegung
 * liegt im Shader, damit die Hauptschleife nichts zu rechnen hat — ein
 * Staubkorn, das die CPU je Bild bewegt, ist ein Staubkorn zu viel.
 */
function staub(anzahl: number): THREE.Points {
  const orte = new Float32Array(anzahl * 3);
  const saat = new Float32Array(anzahl);

  // Fester Zufall: Bei jedem Stufenwechsel wird die Buehne neu gebaut. Mit
  // `Math.random()` springt der Staub dabei sichtbar um.
  let s = 20260916;
  const zufall = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s % 100000) / 100000;
  };

  // Die Ausdehnung haengt am Bildausschnitt, nicht am Geschmack.
  //
  // Bei 30 Grad und 3,05 Abstand ist das Bild 1,63 hoch und im Querformat
  // rund 2,9 breit. Eine Staubwolke, die kleiner ist als das, sitzt als
  // Fleck hinter dem Buch statt in der Luft davor — beim ersten Anlauf war
  // sie auf einen Abstand von 0,95 ausgelegt und damit dreimal zu klein.
  for (let i = 0; i < anzahl; i++) {
    orte[i * 3] = (zufall() - 0.5) * 3.5;
    orte[i * 3 + 1] = (zufall() - 0.5) * 2.2;
    orte[i * 3 + 2] = (zufall() - 0.5) * 2.0;
    saat[i] = zufall();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(orte, 3));
  geo.setAttribute('saat', new THREE.BufferAttribute(saat, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      zeit: { value: 0 },
      staerke: { value: 1.0 },
      dichte: { value: 1.0 },
    },
    vertexShader: `
      attribute float saat;
      uniform float zeit;
      uniform float dichte;
      varying float vSaat;
      void main() {
        vSaat = saat;
        vec3 p = position;
        // Langsames Steigen und leichtes Treiben — Staub in einem Lichtkegel
        // faellt nicht, er haengt.
        p.y += sin(zeit * 0.12 + saat * 31.4) * 0.11;
        p.x += cos(zeit * 0.09 + saat * 17.7) * 0.09;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        // Der Vorfaktor gilt fuer den Abstand der Kamera aus kamera.json.
        // Punktgroesse faellt mit dem Abstand; bei 5,7 statt 0,95 waeren aus
        // drei bis sechs Pixeln unsichtbare 0,4 geworden. Der Faktor wandert
        // mit, wenn der Abstand sich aendert.
        gl_PointSize = (14.4 + saat * 19.1) * dichte / max(0.2, -mv.z);
      }
    `,
    fragmentShader: `
      uniform float staerke;
      varying float vSaat;
      void main() {
        // Runde, weiche Koerner. Ein quadratisches Punktsprite verraet sich
        // sofort als Rechteck.
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = dot(d, d);
        if (r > 0.25) discard;
        float a = smoothstep(0.25, 0.0, r) * (0.10 + vSaat * 0.22) * staerke;
        gl_FragColor = vec4(1.0, 0.86, 0.66, a);
      }
    `,
  });

  return new THREE.Points(geo, mat);
}

/**
 * Die Umgebung, die das Gold spiegelt.
 *
 * Ohne sie war die Goldpraegung im Browser dunkelgrau. Das ist kein
 * Schoenheitsfehler, sondern die Definition von Metall: Ein metallisches
 * Material hat keine eigene diffuse Farbe, es zeigt ausschliesslich seine
 * Umgebung. Wo nichts ist, ist auch nichts zu sehen.
 *
 * Der Fehler war besonders leise, weil die Buehne `envMapIntensity` gesetzt
 * hat — ein Wert, der ohne `scene.environment` nichts bewirkt. Es sah aus,
 * als sei daran gedacht worden.
 *
 * Gebaut wird dieselbe Umgebung wie in Blender: ein dunkler Verlauf mit
 * einem etwas helleren Band knapp unter der Horizontalen, dazu zwei weiche
 * Flaechen als Gegenstueck zu Streiflicht und Schnittaufheller. Alles sehr
 * dunkel — die Nacht bleibt Nacht; es geht allein darum, dass die Folie
 * etwas zu spiegeln hat.
 */
function umgebung(renderer: THREE.WebGLRenderer): THREE.Texture {
  const raum = new THREE.Scene();

  const himmel = new THREE.Mesh(
    new THREE.SphereGeometry(12, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vRichtung;
        void main() {
          vRichtung = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vRichtung;
        void main() {
          // -1 unten, +1 oben. Das helle Band sitzt bei etwa -0,1.
          float h = vRichtung.y;
          vec3 unten = vec3(0.055, 0.043, 0.030);
          vec3 band  = vec3(0.145, 0.158, 0.196);
          vec3 oben  = vec3(0.018, 0.025, 0.048);
          vec3 farbe = h < -0.1
            ? mix(unten, band, smoothstep(-1.0, -0.1, h))
            : mix(band, oben, smoothstep(-0.1, 0.8, h));
          gl_FragColor = vec4(farbe, 1.0);
        }
      `,
    }),
  );
  raum.add(himmel);

  // Die weichen Flaechen. Ihre Richtungen entsprechen den Lampen, damit der
  // breite Reflex und das harte Glanzlicht von derselben Seite kommen —
  // zwei Lichtquellen, die sich widersprechen, sieht man sofort.
  const flaeche = (
    farbe: number, staerke: number,
    breite: number, hoehe: number,
    ort: [number, number, number],
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(breite, hoehe),
      new THREE.MeshBasicMaterial({ color: farbe, side: THREE.DoubleSide }),
    );
    m.material.color.multiplyScalar(staerke);
    m.position.set(...ort);
    m.lookAt(0, 0, 0);
    raum.add(m);
    return m;
  };

  flaeche(0xffe4b8, 2.6, 7, 3, [-5.4, 5.4, 6.6]);   // Streiflicht
  flaeche(0x94b8ff, 0.5, 4, 5, [-2.3, 1.0, -2.1]);  // kalte Kante
  flaeche(0xffeed6, 0.55, 2, 4, [3.6, 0.4, 1.6]);   // Schnittaufheller

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const ziel = pmrem.fromScene(raum, 0.04);
  pmrem.dispose();

  himmel.geometry.dispose();
  (himmel.material as THREE.Material).dispose();
  for (const k of raum.children) {
    const m = k as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material)?.dispose();
  }

  return ziel.texture;
}

export async function buehneStarten(
  leinwand: HTMLCanvasElement,
  budget: Budget,
): Promise<Buehnensteuerung> {
  const renderer = new THREE.WebGLRenderer({
    canvas: leinwand,
    antialias: budget.nachbearbeitung === 'keine',
    alpha: true,
    powerPreference: 'high-performance',
    // Der Tiefenpuffer wird gebraucht, das Stencil nie — und es kostet auf
    // mobilen Kachel-Renderern spuerbar Bandbreite.
    stencil: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Die Belichtung ist ausgemessen, nicht uebernommen.
  //
  // Blender und Three rechnen mit verschiedenen Lichteinheiten und
  // verschiedenen Kennlinien (AgX gegen ACES). Eine Zahl aus dem einen in
  // das andere zu uebertragen ergibt nichts — verglichen werden muss das
  // fertige Bild. Gemessen wurde die Leuchtdichte im Buchbereich, Standbild
  // gegen Buehne bei gleicher Groesse: 0,195 gegen 0,122 im Median. Ein
  // Viertel dunkler, und genau dieser Sprung waere beim Ueberblenden zu
  // sehen gewesen.
  //
  // Zurueckgerechnet durch die ACES-Kennlinie sind das 1,7. Wer den Wert
  // aendert, misst nach: `node scripts/hero-ansehen.mjs` liefert die
  // Aufnahme, der Vergleich steht in `scripts/uebergang-messen.mjs`.
  renderer.toneMappingExposure = 1.7;

  const szene = new THREE.Scene();
  // Nur als Spiegelung, nicht als Hintergrund: `environment` beleuchtet und
  // spiegelt, `background` wuerde die Leinwand fuellen. Der Grund kommt aus
  // dem CSS und hat dort denselben Wert wie im Standbild.
  const umgebungskarte = umgebung(renderer);
  szene.environment = umgebungskarte;

  const kamera = new THREE.PerspectiveCamera(FUEHRUNG.quer.oeffnungswinkel, 1, 0.1, 40);
  kameraOrt(FUEHRUNG.quer, 0, kamera.position);

  // ------------------------------------------------------------ Licht
  //
  // Dieselbe Anordnung wie in Blender, damit das Buch im Browser nicht
  // ploetzlich anders aussieht als im gerenderten Standbild daneben: ein
  // warmes Streiflicht von vorne links, eine kalte Kante hinten, eine
  // schwache warme Aufhellung auf der Schnittseite.
  const streif = new THREE.DirectionalLight(0xffe4b8, 3.4);
  streif.position.set(-1.35, 1.35, 1.65);
  szene.add(streif);

  const kalt = new THREE.DirectionalLight(0x94b8ff, 0.5);
  kalt.position.set(-0.58, 0.26, -0.52);
  szene.add(kalt);

  const schnitt = new THREE.DirectionalLight(0xffeed6, 0.35);
  schnitt.position.set(0.9, 0.1, 0.4);
  szene.add(schnitt);

  szene.add(new THREE.AmbientLight(0x1a2435, 0.6));

  // ------------------------------------------------------------ Staub
  const koerner = staub(Math.max(0, Math.round(900 * budget.partikel)));
  szene.add(koerner);

  // ------------------------------------------------------------ Buch
  const lader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(weg('/draco/'));
  lader.setDRACOLoader(draco);

  const buch = new THREE.Group();
  szene.add(buch);

  let geladen = false;
  try {
    const glb = await lader.loadAsync(MODELL[budget.modellfassung]);
    glb.scene.traverse((k) => {
      const netz = k as THREE.Mesh;
      if (!netz.isMesh) return;
      const mat = netz.material as THREE.MeshStandardMaterial;
      // 1.0, nicht 0.35: Die Umgebung ist bereits auf die Helligkeit
      // gerechnet, die sie haben soll. Sie danach noch einmal zu daempfen,
      // waere derselbe Wert an zwei Stellen — und einer davon wuerde
      // irgendwann vergessen.
      if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = 1.0;
    });
    // Das Modell steht in Metern und ist 0,24 m hoch. Auf eine Hoehe von 1
    // normieren, damit Kameraabstaende unabhaengig von der Buchgroesse
    // gelten — sonst muss jede Kamerafahrt nachgerechnet werden, sobald sich
    // ein Mass in Blender aendert.
    const huelle = new THREE.Box3().setFromObject(glb.scene);
    const groesse = new THREE.Vector3();
    huelle.getSize(groesse);
    const mitte = new THREE.Vector3();
    huelle.getCenter(mitte);
    glb.scene.position.sub(mitte);
    glb.scene.scale.setScalar(1 / Math.max(0.001, groesse.y));
    buch.add(glb.scene);
    geladen = true;
  } catch {
    // Kein Modell — kein Fehlerbild. Die Grenze darueber zeigt dann das
    // vorgerechnete Standbild, und der Leser merkt nichts.
    geladen = false;
  }
  draco.dispose();

  // ------------------------------------------------- Zustand der Schleife
  let fortschritt = 0;      // 0..1, vom Scroll
  let zeit = 0;
  let breite = 1;
  let hoehe = 1;
  let hochformat = false;
  let laeuft = true;

  const kamZiel = new THREE.Vector3();
  kameraOrt(FUEHRUNG.quer, 0, kamZiel);
  const kamIst = kamZiel.clone();
  const blick = new THREE.Vector3(0, 0, 0);

  const steuerung: Buehnensteuerung = {
    schritt(deltaMs, _jetzt) {
      if (!laeuft) return;
      zeit += deltaMs / 1000;

      // --- Kamerafahrt ------------------------------------------------
      //
      // Eine Fahrt heran, nicht ein Zoom: Die Kamera bewegt sich im Raum,
      // die Brennweite bleibt. Ein Zoom staucht die Perspektive und wirkt
      // sofort billig.
      const fuehrung = hochformat ? FUEHRUNG.hoch : FUEHRUNG.quer;
      kameraOrt(fuehrung, fortschritt, kamZiel);

      // Das Buch sitzt nicht in der Bildmitte. Im Querformat steht es
      // rechts, damit links die Ueberschrift Platz hat; im Hochformat
      // weiter oben, damit sie darunter passt. Verschoben wird das Objekt,
      // nicht die Kamera — sonst haengt der Blickwinkel auf den Umschlag
      // davon ab, wie viel Text daneben steht.
      buch.position.set(fuehrung.versatzX, fuehrung.versatzY, 0);

      // Gedaempft folgen, zeitkorrigiert. Ein fester Faktor je Bild macht
      // aus derselben Fahrt auf 144 Hz eine mehr als doppelt so schnelle.
      const t = 1 - Math.pow(1 - 0.08, deltaMs / 16.667);
      kamIst.lerp(kamZiel, t);
      kamera.position.copy(kamIst);
      kamera.lookAt(blick);

      // --- Das Buch dreht sich leicht ins Licht -----------------------
      // Der Grundwinkel steht in `kamera.json` und ist derselbe, mit dem das
      // Standbild gerechnet wurde. Beim Fortschritt 0 und der Zeit 0 muss
      // hier genau DREHUNG herauskommen — sonst springt das Buch beim
      // Wechsel vom Standbild zur Buehne.
      buch.rotation.y = DREHUNG + fortschritt * 0.26 + Math.sin(zeit * 0.18) * 0.012;
      buch.rotation.x = Math.sin(zeit * 0.13) * 0.008;

      // --- Der Streifen wandert ueber das Cover -----------------------
      //
      // Das ist der eigentliche Grund fuer die Geometrie. Das Licht faehrt
      // langsam von links nach rechts; die gebackene Goldfolie laeuft dabei
      // an, der matte Druck daneben nicht.
      const wandern = Math.sin(zeit * 0.22) * 1.5;
      streif.position.set(-1.35 + wandern, 1.35, 1.65);

      const stoff = koerner.material as THREE.ShaderMaterial;
      stoff.uniforms['zeit']!.value = zeit;

      renderer.render(szene, kamera);
    },

    groesseSetzen(b, h) {
      breite = Math.max(1, b);
      hoehe = Math.max(1, h);
      hochformat = hoehe > breite;

      kamera.aspect = breite / hoehe;
      // Hochformat ist keine schmalere Querformatansicht: Three haelt den
      // senkrechten Oeffnungswinkel fest, also faellt das Buch auf dem
      // Telefon sonst seitlich aus dem Bild. Der Winkel wird deshalb
      // ausgeglichen, statt die Szene nur zu skalieren.
      kamera.fov = (hochformat ? FUEHRUNG.hoch : FUEHRUNG.quer).oeffnungswinkel;
      kamera.updateProjectionMatrix();

      renderer.setSize(breite, hoehe, false);
    },

    budgetAnwenden(neu) {
      renderer.setPixelRatio(
        Math.max(0.5, Math.min(neu.dichteDeckel, window.devicePixelRatio || 1) * neu.aufloesungsskala),
      );
      const stoff = koerner.material as THREE.ShaderMaterial;
      stoff.uniforms['dichte']!.value = neu.partikel > 0 ? 1.0 : 0.0;
      koerner.visible = neu.partikel > 0.01;
    },

    fortschrittSetzen(wert) {
      fortschritt = Math.max(0, Math.min(1, wert));
    },

    abbauen() {
      laeuft = false;
      // Der Baum muss durchlaufen werden. `scene.remove()` gibt nichts frei;
      // Geometrie, Material und Texturen bleiben sonst auf der Grafikkarte
      // liegen, und nach ein paar Stufenwechseln ist der Speicher voll.
      szene.traverse((k) => {
        const netz = k as THREE.Mesh;
        if (!netz.isMesh) return;
        netz.geometry?.dispose();
        const mats = Array.isArray(netz.material) ? netz.material : [netz.material];
        for (const m of mats) {
          if (!m) continue;
          for (const wert of Object.values(m)) {
            if (wert && (wert as THREE.Texture).isTexture) (wert as THREE.Texture).dispose();
          }
          m.dispose();
        }
      });
      koerner.geometry.dispose();
      (koerner.material as THREE.Material).dispose();
      // Die Umgebungskarte liegt als Cubemap auf der Grafikkarte und haengt
      // an keinem Netz — `szene.traverse` findet sie nicht. Ohne diese Zeile
      // bleibt sie bei jedem Stufenwechsel liegen.
      szene.environment = null;
      umgebungskarte.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };

  steuerung.budgetAnwenden(budget);
  if (!geladen) throw new Error('Modell nicht ladbar');
  return steuerung;
}
