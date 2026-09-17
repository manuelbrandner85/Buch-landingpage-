# -*- coding: utf-8 -*-
"""
Die drei GLB-Fassungen zurueckladen und nachsehen, was wirklich drinsteht.

Ein Export, der ohne Fehlermeldung durchlaeuft, ist noch kein Ergebnis. Bei
diesem Modell sind drei Dinge schon einmal lautlos verlorengegangen:

  * Die Goldpraegung. Sie entsteht in Blender aus einem Knotenbaum; glTF
    kennt keine Knotenbaeume. Ohne den Backvorgang exportiert alles sauber
    und der Umschlag ist danach gleichmaessig matt.
  * Die Blattkanten. Frueher waren sie eine gerechnete Streifung im
    Material — auch die ueberlebt den Export nicht.
  * Draco. Ist der Decoder nicht dabei oder passt die Fassung nicht, laedt
    der Browser eine Datei, die er nicht auspacken kann.

Dieses Skript prueft deshalb nicht "hat der Export geklappt", sondern:
liegt Metallik als Textur an, sind die Blaetter als Geometrie da, und
laesst sich die Datei ueberhaupt wieder lesen.

Aufruf:
    blender --background --factory-startup --python blender/glb-pruefen.py
"""

import bpy
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
ORDNER = os.path.join(PROJEKT, 'public', 'modelle')

# Untergrenzen je Fassung: Flaechen des Buchblocks. Der Block besteht aus
# Blaettern zu je sechs Flaechen — weniger als das Vierfache der erwarteten
# Blattzahl heisst, dass etwas sie zusammengeklappt hat.
ERWARTET = {
    'buch-high.glb': 36,
    'buch-medium.glb': 24,
    'buch-low.glb': 16,
}


def leeren():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for s in (bpy.data.meshes, bpy.data.materials, bpy.data.images):
        for b in list(s):
            if b.users == 0:
                s.remove(b)


def pruefen(datei, blaetter):
    pfad = os.path.join(ORDNER, datei)
    if not os.path.exists(pfad):
        return [f'{datei}: FEHLT']

    leeren()
    bpy.ops.import_scene.gltf(filepath=pfad)

    netze = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    flaechen = sum(len(o.data.polygons) for o in netze)
    dreiecke = sum(len(o.data.loop_triangles) for o in netze)
    for o in netze:
        o.data.calc_loop_triangles()
    dreiecke = sum(len(o.data.loop_triangles) for o in netze)

    fehler = []
    if not netze:
        return [f'{datei}: kein Netz — Draco vermutlich nicht entpackt']

    # Der Buchblock heisst nach dem Import weiterhin so.
    block = next((o for o in netze if o.name.startswith('Buchblock')), None)
    deckel = next((o for o in netze if o.name.startswith('Einband')), None)
    if not any(o.name.startswith('Kapitalband') for o in netze):
        fehler.append(f'{datei}: Kapitalband fehlt')

    if block is None:
        fehler.append(f'{datei}: Buchblock fehlt')
    else:
        soll = blaetter * 4
        ist = len(block.data.polygons)
        if ist < soll:
            fehler.append(
                f'{datei}: Buchblock hat {ist} Flaechen, erwartet mindestens '
                f'{soll} fuer {blaetter} Blaetter')

    bilder = []
    if deckel is None:
        fehler.append(f'{datei}: Einband fehlt')
    else:
        mat = deckel.data.materials[0] if deckel.data.materials else None
        if mat is None or not mat.use_nodes:
            fehler.append(f'{datei}: Einband ohne Material')
        else:
            bsdf = next((k for k in mat.node_tree.nodes
                         if k.type == 'BSDF_PRINCIPLED'), None)
            if bsdf is None:
                fehler.append(f'{datei}: kein Principled-Knoten')
            else:
                for eingang in ('Base Color', 'Metallic', 'Roughness'):
                    if not bsdf.inputs[eingang].links:
                        fehler.append(
                            f'{datei}: {eingang} haengt an keiner Textur — '
                            f'der Backvorgang ist nicht angekommen')
            bilder = [k.image for k in mat.node_tree.nodes
                      if k.type == 'TEX_IMAGE' and k.image]

    kb = os.path.getsize(pfad) / 1024
    print('%-16s %6.1f KB  Netze %d  Flaechen %5d  Dreiecke %5d  Texturen %s' % (
        datei, kb, len(netze), flaechen, dreiecke,
        ', '.join('%dx%d' % tuple(b.size) for b in bilder) or 'keine'))
    return fehler


def main():
    alle = []
    for datei, blaetter in ERWARTET.items():
        alle.extend(pruefen(datei, blaetter))

    if alle:
        print('\nFEHLER:')
        for f in alle:
            print('  ·', f)
        sys.exit(1)
    print('\nAlle drei Fassungen tragen Geometrie, Material und Texturen.')


main()
