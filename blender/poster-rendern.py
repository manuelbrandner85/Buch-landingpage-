# -*- coding: utf-8 -*-
"""
Die Standbilder fuer den Hero — und zwar DECKUNGSGLEICH mit der Buehne.

Das Standbild liegt unter der Buehne und wird ausgeblendet, sobald diese
zeichnet. Genau darin liegt die Falle: Wenn Bildausschnitt, Brennweite oder
Drehung auch nur leicht abweichen, springt das Buch im Moment des Wechsels.
Ein Sprung an dieser Stelle ist schlimmer als gar kein Standbild, weil er
genau dann passiert, wenn der Besucher hinsieht.

Deshalb wird die Kamera hier nicht gestaltet, sondern GERECHNET — aus genau
der Datei, aus der auch die Buehne im Browser liest:

    src/hero/kamera.json

Dort stehen Abstand, Schwenk, Neigung und Oeffnungswinkel je Format sowie
die Grunddrehung des Buches. Das Modell ist in der Buehne auf Hoehe 1
normiert; hier ist es 0,239 m hoch.

Drei Umrechnungen stecken darin:

  1. Achsen. glTF wird mit `export_yup` geschrieben: Three-X ist Blender-X,
     Three-Y ist Blender-Z, Three-Z ist Blender-MINUS-Y.
  2. Massstab. In Three ist das Buch auf Hoehe 1 normiert, in Blender ist es
     0,239 m hoch. Alle Kameraabstaende werden mit der echten Hoehe
     multipliziert.
  3. Drehung. Three dreht das BUCH um -0,34; hier bleibt das Buch stehen und
     die KAMERA wandert um denselben Betrag zurueck. Das ist dasselbe Bild.

Zwei Dinge werden bewusst abgeschaltet, obwohl sie das Standbild schoener
machen wuerden: die Tiefenschaerfe und der Schattenfaenger. Beides hat die
Buehne im Browser nicht, und ein schoeneres Standbild, das beim Wechsel
verschwindet, ist ein Fehler und kein Gewinn.

Aufruf:
    blender --background --factory-startup --python blender/poster-rendern.py
"""

import bpy
import os
import sys
import json
import math
import time
import importlib.util
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
ZIEL = os.path.join(PROJEKT, 'public', 'modelle')

# Die Kamerafuehrung wird NICHT hier gepflegt, sondern gelesen — aus
# derselben Datei, aus der die Buehne im Browser sie liest.
WERTE = os.path.join(PROJEKT, 'src', 'hero', 'kamera.json')

ANSICHTEN = [
    # Datei, Schluessel in kamera.json, Breite, Hoehe
    ('buch-poster-quer', 'quer', 1600, 1000),
    ('buch-poster-hoch', 'hoch', 1080, 1620),
]


def buch_modul():
    pfad = os.path.join(HIER, 'buch.py')
    spec = importlib.util.spec_from_file_location('buch', pfad)
    modul = importlib.util.module_from_spec(spec)
    sys.modules['buch'] = modul
    spec.loader.exec_module(modul)
    return modul


def huelle(objekte):
    """Die Huelle ueber alle Objekte — MIT Modifikatoren."""
    tiefe = bpy.context.evaluated_depsgraph_get()
    punkte = []
    for o in objekte:
        aus = o.evaluated_get(tiefe)
        for ecke in aus.bound_box:
            punkte.append(o.matrix_world @ Vector(ecke))
    klein = Vector((min(p.x for p in punkte),
                    min(p.y for p in punkte),
                    min(p.z for p in punkte)))
    gross = Vector((max(p.x for p in punkte),
                    max(p.y for p in punkte),
                    max(p.z for p in punkte)))
    return (klein + gross) * 0.5, gross - klein


def kameraort_three(f, anteil=0.0):
    """
    Kugelkoordinaten in eine Three-Position — Zeile fuer Zeile dieselbe
    Rechnung wie `kameraOrt` in `src/hero/buehne.ts`.
    """
    abstand = f['abstandFern'] + (f['abstandNah'] - f['abstandFern']) * anteil
    waagerecht = math.cos(f['neigung'])
    return (
        abstand * math.sin(f['schwenk']) * waagerecht,
        abstand * math.sin(f['neigung']),
        abstand * math.cos(f['schwenk']) * waagerecht,
    )


def nach_blender(drei, drehung, mitte, hoehe_m):
    """
    Einen Punkt der Three-Welt in die Blender-Szene umrechnen.

    In Three steht das Buch gedreht (um `drehung`) und verschoben (um
    `versatz`) in der Welt; die Kamera blickt auf den Ursprung. In Blender
    steht das Buch fest am Ursprung. Der Wechsel zwischen beiden Sichten ist
    die Umkehrung der Buchtransformation, angewandt auf Kamera und
    Blickpunkt:

        lokal = R^-1 * (welt - versatz)

    Diese Funktion macht den R^-1-Teil und den Achsentausch. Das Abziehen
    des Versatzes passiert beim Aufruf — es ist der Grund, warum auch der
    Blickpunkt nicht mehr in der Buchmitte liegt.
    """
    x, y, z = drei
    # Three dreht um +Y:
    #     x' = x cos a + z sin a
    #     z' = -x sin a + z cos a
    a = -drehung
    x2 = x * math.cos(a) + z * math.sin(a)
    z2 = -x * math.sin(a) + z * math.cos(a)
    # Three -> Blender: (X, Y, Z) wird zu (X, -Z, Y).
    return mitte + Vector((x2, -z2, y)) * hoehe_m


def brennweite(oeffnungswinkel_grad, sensorhoehe=24.0):
    """Senkrechter Oeffnungswinkel in Brennweite — nicht umgekehrt geraten."""
    return (sensorhoehe * 0.5) / math.tan(math.radians(oeffnungswinkel_grad) * 0.5)


def main():
    os.makedirs(ZIEL, exist_ok=True)
    modul = buch_modul()
    teile = modul.bauen()

    mitte, masse = huelle([teile['block'], teile['deckel'], teile['band']])
    print('HUELLE Mitte %.4f %.4f %.4f  Hoehe %.4f m' % (
        mitte.x, mitte.y, mitte.z, masse.z))

    szene = bpy.context.scene
    szene.cycles.samples = 384
    szene.render.image_settings.file_format = 'PNG'
    szene.render.image_settings.color_mode = 'RGBA'
    szene.render.image_settings.compression = 92
    # Durchsichtiger Hintergrund. Die Dunkelheit kommt aus dem CSS und ist
    # dort exakt dieselbe Farbe wie in der Buehne — ein mitgerendertes
    # Schwarz waere eine zweite Quelle fuer denselben Wert und irgendwann
    # eine Abweichung.
    szene.render.film_transparent = True

    boden = bpy.data.objects.get('Boden')
    if boden:
        boden.hide_render = True

    kam = bpy.data.objects['Kamera']
    ziel = bpy.data.objects['Blickpunkt']
    ziel.location = mitte
    kam.data.dof.use_dof = False
    kam.data.sensor_fit = 'VERTICAL'
    kam.data.sensor_height = 24.0

    with open(WERTE, 'r', encoding='utf-8') as f:
        werte = json.load(f)
    drehung = werte['drehung']

    for datei, schluessel, breite, hoehe in ANSICHTEN:
        f = werte[schluessel]
        drei = kameraort_three(f, 0.0)
        versatz = (f['versatzX'], f['versatzY'], 0.0)
        ohne = tuple(drei[i] - versatz[i] for i in range(3))
        kam.location = nach_blender(ohne, drehung, mitte, masse.z)
        ziel.location = nach_blender(
            tuple(-v for v in versatz), drehung, mitte, masse.z)
        kam.data.lens = brennweite(f['oeffnungswinkel'])
        szene.render.resolution_x = breite
        szene.render.resolution_y = hoehe
        szene.render.filepath = os.path.join(ZIEL, datei + '.png')
        bpy.context.view_layer.update()
        t = time.time()
        bpy.ops.render.render(write_still=True)
        # Abstand zum BUCH, nicht zum Weltursprung — seit das Buch versetzt
        # steht, sind das zwei verschiedene Zahlen.
        sicht = 2.0 * math.hypot(*ohne) * math.tan(math.radians(f['oeffnungswinkel']) * 0.5)
        print('POSTER %-18s %4dx%-4d  %.1f mm  Buch fuellt %.0f %% der Hoehe  %.1fs' % (
            datei, breite, hoehe, kam.data.lens, 100.0 / sicht, time.time() - t))


main()
