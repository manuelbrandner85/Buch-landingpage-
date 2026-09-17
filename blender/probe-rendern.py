# -*- coding: utf-8 -*-
"""
Drei Probebilder und eine Arbeitsdatei.

Warum eigenstaendig statt in der laufenden Blender-Sitzung: Dort liegt
gerade die Vecom-Villa. Ein Aufbauskript, das mit `select_all` + `delete`
anfaengt, hat in einer fremden Datei nichts verloren — auch nicht fuer
dreissig Sekunden.

Ergebnis:
    blender/probe/vorn.png     die Heldenansicht
    blender/probe/hinten.png   Rueckseite und Ruecken
    blender/probe/schnitt.png  Nahaufnahme der Blattkanten
    blender/buch.blend         zum Nachsehen in der Oberflaeche

Aufruf:
    blender --background --factory-startup --python blender/probe-rendern.py
"""

import bpy
import os
import sys
import time
import importlib.util

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
PROBE = os.path.join(HIER, 'probe')


def buch_modul():
    pfad = os.path.join(HIER, 'buch.py')
    spec = importlib.util.spec_from_file_location('buch', pfad)
    modul = importlib.util.module_from_spec(spec)
    sys.modules['buch'] = modul
    spec.loader.exec_module(modul)
    return modul


ANSICHTEN = [
    # Name, Kameraposition, Brennweite, Blickpunkt
    ('vorn',    (0.46, -1.10, 0.34), 85.0, (0.00, 0.0, 0.01)),
    ('hinten',  (0.72,  1.02, 0.30), 85.0, (0.00, 0.0, 0.01)),
    ('schnitt', (0.52, -0.34, 0.11), 85.0, (0.07, 0.0, 0.02)),
    ('ruecken', (-1.02, -0.52, 0.26), 85.0, (-0.08, 0.0, 0.01)),
    # Der Kopf des Ruecken — dort sitzt das Kapitalband. Ohne diese Ansicht
    # laesst sich nicht pruefen, ob es da ist: In der Heldenansicht ist die
    # Oberkante nur wenige Pixel hoch.
    ('kopf', (-0.20, -0.30, 0.32), 100.0, (-0.072, 0.0, 0.114)),
]


def main():
    os.makedirs(PROBE, exist_ok=True)
    modul = buch_modul()
    t0 = time.time()
    teile = modul.bauen()
    print('AUFBAU %.1fs  Block %d Flaechen  Einband %d  Kapitalband %d  Atlas %dx%d' % (
        time.time() - t0,
        len(teile['block'].data.polygons),
        len(teile['deckel'].data.polygons),
        len(teile['band'].data.polygons),
        teile['atlas'].size[0], teile['atlas'].size[1],
    ))

    # Den Bogen selbst ablegen. Ein Umschlag, der falsch sitzt, ist im
    # gerenderten Bild schwer zu deuten — im flach ausgebreiteten Bogen
    # sieht man sofort, ob Rueckseite, Ruecken und Vorderseite stimmen.
    atlas = teile['atlas']
    atlas.filepath_raw = os.path.join(PROBE, 'umschlag-bogen.png')
    atlas.file_format = 'PNG'
    atlas.save()

    szene = bpy.context.scene
    szene.cycles.samples = 160
    szene.render.resolution_x = 1400
    szene.render.resolution_y = 900
    szene.render.image_settings.file_format = 'PNG'

    kam = bpy.data.objects['Kamera']
    ziel = bpy.data.objects['Blickpunkt']

    for name, ort, brennweite, blick in ANSICHTEN:
        kam.location = ort
        kam.data.lens = brennweite
        ziel.location = blick
        bpy.context.view_layer.update()
        szene.render.filepath = os.path.join(PROBE, name + '.png')
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print('BILD %-8s %.1fs -> %s' % (name, time.time() - t, szene.render.filepath))

    # Zurueck auf die Heldenansicht, dann sichern.
    kam.location = ANSICHTEN[0][1]
    kam.data.lens = ANSICHTEN[0][2]
    ziel.location = ANSICHTEN[0][3]
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HIER, 'buch.blend'))
    print('GESICHERT', os.path.join(HIER, 'buch.blend'))


main()
