# -*- coding: utf-8 -*-
"""
Eine Frage, ein Bild: In welche Richtung laeuft `Geometry.Incoming` im
Welt-Shader?

Der Verlauf des Nachthimmels soll unten warm und oben kalt sein. Zweimal
geraten, zweimal falsch herum — deshalb einmal gemessen statt ein drittes
Mal vermutet. Der Himmel bekommt oben Rot, unten Blau, die Kamera schaut
mit einem sehr weiten Winkel geradeaus. Danach steht die Richtung fest.

Aufruf:
    blender --background --factory-startup --python blender/welt-richtung.py
"""

import bpy
import os

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, 'probe', 'welt-richtung.png')


def main():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    welt = bpy.data.worlds.new('Test')
    bpy.context.scene.world = welt
    welt.use_nodes = True
    n, v = welt.node_tree.nodes, welt.node_tree.links
    n.clear()
    hg = n.new('ShaderNodeBackground')
    aus = n.new('ShaderNodeOutputWorld')
    v.new(hg.outputs['Background'], aus.inputs['Surface'])
    hg.inputs['Strength'].default_value = 1.0

    geo = n.new('ShaderNodeNewGeometry')
    trenn = n.new('ShaderNodeSeparateXYZ')
    v.new(geo.outputs['Incoming'], trenn.inputs['Vector'])

    kenn = n.new('ShaderNodeMapRange')
    kenn.inputs['From Min'].default_value = -1.0
    kenn.inputs['From Max'].default_value = 1.0
    v.new(trenn.outputs['Z'], kenn.inputs['Value'])

    rampe = n.new('ShaderNodeValToRGB')
    rampe.color_ramp.elements[0].color = (1.0, 0.0, 0.0, 1.0)   # Fac 0 = ROT
    rampe.color_ramp.elements[-1].color = (0.0, 0.0, 1.0, 1.0)  # Fac 1 = BLAU
    v.new(kenn.outputs['Result'], rampe.inputs['Fac'])
    v.new(rampe.outputs['Color'], hg.inputs['Color'])

    daten = bpy.data.cameras.new('K')
    daten.lens = 12.0
    kam = bpy.data.objects.new('K', daten)
    bpy.context.collection.objects.link(kam)
    bpy.context.scene.camera = kam
    kam.location = (0, -1, 0)
    kam.rotation_euler = (1.5707963, 0, 0)   # geradeaus, Horizont in der Mitte

    szene = bpy.context.scene
    szene.render.engine = 'CYCLES'
    szene.cycles.samples = 4
    szene.render.resolution_x = 200
    szene.render.resolution_y = 200
    szene.view_settings.view_transform = 'Standard'
    szene.view_settings.exposure = 0.0
    szene.render.filepath = ZIEL
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True)
    bpy.ops.render.render(write_still=True)

    bild = bpy.data.images.load(ZIEL)
    breite, hoehe = bild.size
    p = list(bild.pixels)

    def farbe(x, y):
        i = (y * breite + x) * 4
        return p[i], p[i + 1], p[i + 2]

    # Blender legt Zeile 0 UNTEN ab.
    unten = farbe(breite // 2, 6)
    oben = farbe(breite // 2, hoehe - 7)
    print('UNTEN im Bild  R %.2f G %.2f B %.2f' % unten)
    print('OBEN  im Bild  R %.2f G %.2f B %.2f' % oben)
    print('Fac 0 ist ROT. Wo Rot liegt, liegt Fac 0.')
    print('ERGEBNIS: Fac 0 liegt', 'UNTEN' if unten[0] > oben[0] else 'OBEN')


main()
