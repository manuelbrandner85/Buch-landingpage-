# -*- coding: utf-8 -*-
"""
Das Buch ins Web bringen — in drei Fassungen.

Der entscheidende Punkt, der beim glTF-Export fast immer verlorengeht:

Die Goldpraegung entsteht in Blender aus einem Knotenbaum (Sattheit mal
Helligkeit, ueber eine Kennlinie auf Metallic und Rauheit). glTF kennt keine
Knotenbaeume. Wer einfach exportiert, bekommt ein Buch mit gleichmaessig
mattem Umschlag — die Folie, wegen der die ganze Szene gebaut wurde, ist weg,
und zwar lautlos.

Deshalb werden Metallic und Rauheit GEBACKEN und als Textur mitgegeben. glTF
erwartet sie gepackt in einem Bild: Gruen = Rauheit, Blau = Metallic. Genau so
wird hier gepackt.

Die drei Fassungen entsprechen der Modellfassung aus dem Budget der Engine:
  buch-high.glb    HIGH_END   volle Aufloesung, 2048er Texturen
  buch-medium.glb  OPTIMIERT  halbierte Geometrie, 1024er Texturen
  buch-low.glb     Rueckfall  stark reduziert, 512er Texturen

Aufruf ueber den MCP-Server oder:
    blender --background --python blender/web-export.py
"""

import bpy
import os
import importlib.util
import sys
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
ZIEL = os.path.join(PROJEKT, 'public', 'modelle')

# Name, Ausduennung des Einbands, ORM-Kante, Hoehe des Umschlagbogens,
# Anzahl der Blaetter im Buchblock.
#
# Zwei Regler, die frueher einer waren:
#
# Der Buchschnitt ist seit der Ueberarbeitung echte Geometrie — 64 einzelne
# Blaetter. Ein Ausduennmodifikator wuerde die zusammenklappen, und aus dem
# Papierstapel wuerde wieder ein Klotz. Deshalb wird die niedrigere Stufe
# nicht reduziert, sondern von vornherein mit weniger Blaettern gebaut. Das
# ist derselbe Gedanke wie bei einem LOD aus dem Werkzeug statt aus dem
# Reduzierer: Die Form bleibt richtig, nur die Aufloesung sinkt.
#
# Der Umschlag ist jetzt ein Bogen aus drei Teilen und damit rund 1,5 mal so
# breit wie hoch. Die alte Regel "Kante meint die lange Seite, Verhaeltnis
# 2:3" stimmt dafuer nicht mehr — die Hoehe wird direkt vorgegeben, die
# Breite ergibt sich aus den Bogenlaengen des Profils.
FASSUNGEN = [
    ('high',   1.00, 2048, 1797, 36),
    ('medium', 0.55, 1024,  900, 24),
    ('low',    0.22,  512,  460, 16),
]


def buch_modul():
    """Die Buchdatei nachladen, damit der Aufbau an einer Stelle steht."""
    pfad = os.path.join(HIER, 'buch.py')
    spec = importlib.util.spec_from_file_location('buch', pfad)
    modul = importlib.util.module_from_spec(spec)
    sys.modules['buch'] = modul
    spec.loader.exec_module(modul)
    return modul


def modifikatoren_anwenden(objekt):
    """Ohne das exportiert glTF das unveraenderte Grundnetz."""
    bpy.context.view_layer.objects.active = objekt
    objekt.select_set(True)
    for m in list(objekt.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            objekt.modifiers.remove(m)
    objekt.select_set(False)


def backbild(name, kante, farbe=(0.0, 0.0, 0.0, 1.0), daten=True):
    """Ein leeres Bild als Backziel."""
    if name in bpy.data.images:
        bpy.data.images.remove(bpy.data.images[name])
    bild = bpy.data.images.new(name, kante, kante, alpha=False, float_buffer=False)
    bild.generated_color = farbe
    if daten:
        # Rauheit und Metallic sind Messwerte, keine Farben. Wer sie als
        # sRGB ablegt, bekommt eine Gammakurve obendrauf — das Gold wird
        # dann zu hell und die Rauheit zu niedrig.
        bild.colorspace_settings.name = 'Non-Color'
    return bild


def wert_backen(objekt, mat, quell_ausgang, zielbild):
    """
    Einen beliebigen Knotenausgang in ein Bild backen.

    Blender kann Rauheit direkt backen, Metallic aber nicht — es gibt keinen
    Backdurchgang dafuer. Der Weg darum herum ist immer derselbe: den
    gesuchten Wert voruebergehend an einen Emissionsschattierer haengen und
    `EMIT` backen. Damit laesst sich jeder Zwischenwert eines Knotenbaums
    herausholen, nicht nur die, fuer die es einen fertigen Durchgang gibt.
    """
    baum = mat.node_tree
    n = baum.nodes
    v = baum.links

    aus = next(k for k in n if k.type == 'OUTPUT_MATERIAL')
    vorher = aus.inputs['Surface'].links[0].from_socket if aus.inputs['Surface'].links else None

    emit = n.new('ShaderNodeEmission')
    emit.location = (700, 400)
    v.new(quell_ausgang, emit.inputs['Color'])
    v.new(emit.outputs['Emission'], aus.inputs['Surface'])

    ziel = n.new('ShaderNodeTexImage')
    ziel.location = (700, 700)
    ziel.image = zielbild
    n.active = ziel
    ziel.select = True

    bpy.ops.object.select_all(action='DESELECT')
    objekt.select_set(True)
    bpy.context.view_layer.objects.active = objekt

    szene = bpy.context.scene
    alt_art, alt_samples = szene.cycles.bake_type, szene.cycles.samples
    szene.cycles.bake_type = 'EMIT'
    szene.cycles.samples = 8          # ein flacher Wert braucht keine Strahlen
    szene.render.bake.use_clear = True
    bpy.ops.object.bake(type='EMIT')
    szene.cycles.bake_type, szene.cycles.samples = alt_art, alt_samples

    n.remove(ziel)
    n.remove(emit)
    if vorher:
        v.new(vorher, aus.inputs['Surface'])


def orm_packen(rauheit_bild, metallic_bild, kante, name):
    """
    Rauheit und Metallic in EIN Bild packen, wie glTF es erwartet.

    Der Standard legt fest: Rot = Verdeckung, Gruen = Rauheit, Blau =
    Metallic. Wer die Kanaele vertauscht, bekommt ein Buch, dessen Umschlag
    metallisch glaenzt und dessen Titel matt ist — also genau verkehrt herum,
    und es sieht auf den ersten Blick nur "irgendwie falsch" aus.
    """
    # Kanalweise mit numpy statt Pixel fuer Pixel in Python: Bei 2048er
    # Kante sind das 16,8 Millionen Fliesskommazahlen je Bild. Die
    # Schleife darueber brauchte im ersten Lauf laenger als der Backvorgang
    # selbst.
    n = kante * kante
    rp = np.empty(n * 4, dtype=np.float32)
    mp = np.empty(n * 4, dtype=np.float32)
    rauheit_bild.pixels.foreach_get(rp)
    metallic_bild.pixels.foreach_get(mp)

    gepackt = np.empty((n, 4), dtype=np.float32)
    gepackt[:, 0] = 1.0                       # Verdeckung: hier ungenutzt
    gepackt[:, 1] = rp.reshape(n, 4)[:, 0]    # Rauheit
    gepackt[:, 2] = mp.reshape(n, 4)[:, 0]    # Metallic
    gepackt[:, 3] = 1.0

    if name in bpy.data.images:
        bpy.data.images.remove(bpy.data.images[name])
    bild = bpy.data.images.new(name, kante, kante, alpha=False)
    bild.colorspace_settings.name = 'Non-Color'
    bild.pixels.foreach_set(gepackt.reshape(-1))
    bild.update()
    return bild


def glanzwerte_finden(mat):
    """Die Ausgaenge fuer Metallic und Rauheit im Knotenbaum aufspueren."""
    bsdf = next(k for k in mat.node_tree.nodes if k.type == 'BSDF_PRINCIPLED')
    m = bsdf.inputs['Metallic'].links[0].from_socket if bsdf.inputs['Metallic'].links else None
    r = bsdf.inputs['Roughness'].links[0].from_socket if bsdf.inputs['Roughness'].links else None
    return bsdf, m, r


def umschlag_web_tauglich(deckel, kante):
    """
    Den Knotenbaum des Umschlags durch etwas ersetzen, das glTF versteht.

    Vorher: Bild → HSV → Rechnung → Metallic/Rauheit.
    Nachher: Bild → Basisfarbe, gebackene ORM-Textur → Metallic/Rauheit.

    Das Ergebnis sieht gleich aus; der Unterschied ist, dass es den Export
    ueberlebt.
    """
    mat = deckel.data.materials[0]
    bsdf, m_aus, r_aus = glanzwerte_finden(mat)
    if m_aus is None or r_aus is None:
        return None

    # Das Coverbild wird hier NICHT mehr verkleinert.
    #
    # Beim ersten Lauf galt die Texturkante nur fuer die gebackene ORM-Karte,
    # waehrend cover.jpg in allen drei Fassungen mit voller Aufloesung
    # einging — die niedrigste Fassung wog 741 KB bei 652 Flaechen, das
    # Gewicht lag praktisch vollstaendig in einer Textur, die fuer diese
    # Stufe gar nicht gebraucht wird. Nachtraeglich zu skalieren war die
    # Notloesung dafuer.
    #
    # Jetzt wird der Umschlagbogen gleich in der richtigen Groesse gebaut
    # (`bauen(atlas_hoehe=...)`). Das ist nicht nur kuerzer, es ist auch
    # besser: Der Bogen wird EINMAL aus den Quellbildern abgetastet statt
    # erst auf volle Groesse gebracht und dann wieder heruntergerechnet.
    metall = backbild('buch-metallic', kante)
    rauheit = backbild('buch-rauheit', kante)

    wert_backen(deckel, mat, m_aus, metall)
    wert_backen(deckel, mat, r_aus, rauheit)

    orm = orm_packen(rauheit, metall, kante, 'buch-orm')

    n = mat.node_tree.nodes
    v = mat.node_tree.links

    # Die alte Rechnung abklemmen — nicht loeschen: Beim naechsten Bauen wird
    # sie in Blender wieder gebraucht, und die Datei soll fuer beides taugen.
    for eingang in ('Metallic', 'Roughness'):
        for verbindung in list(bsdf.inputs[eingang].links):
            v.remove(verbindung)

    orm_knoten = n.new('ShaderNodeTexImage')
    orm_knoten.location = (0, -700)
    orm_knoten.image = orm
    orm_knoten.label = 'ORM'

    trenn = n.new('ShaderNodeSeparateColor')
    trenn.location = (260, -700)
    v.new(orm_knoten.outputs['Color'], trenn.inputs['Color'])
    v.new(trenn.outputs[1], bsdf.inputs['Roughness'])   # Gruen
    v.new(trenn.outputs[2], bsdf.inputs['Metallic'])    # Blau

    return orm


def ausduennen(objekt, anteil):
    """Geometrie reduzieren — und den Modifikator auch anwenden."""
    if anteil >= 0.999:
        return
    mod = objekt.modifiers.new('Ausduennen', 'DECIMATE')
    mod.ratio = anteil
    bpy.context.view_layer.objects.active = objekt
    bpy.ops.object.modifier_apply(modifier=mod.name)


def exportieren(objekte, datei, draco=True):
    """Als GLB schreiben."""
    os.makedirs(ZIEL, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objekte:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objekte[0]

    bpy.ops.export_scene.gltf(
        filepath=os.path.join(ZIEL, datei),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_draco_mesh_compression_enable=draco,
        export_draco_mesh_compression_level=6,
        export_image_format='AUTO',
        export_yup=True,
        export_cameras=False,
        export_lights=False,
    )
    pfad = os.path.join(ZIEL, datei)
    return os.path.getsize(pfad) if os.path.exists(pfad) else 0


def alles_exportieren():
    """Die drei Fassungen bauen und schreiben."""
    modul = buch_modul()
    ergebnisse = []

    for name, anteil, kante, bogenhoehe, blaetter in FASSUNGEN:
        # Jede Fassung frisch aufbauen. Nacheinander auszuduennen wuerde die
        # Reduktionen stapeln: low waere dann nicht 22 Prozent des Originals,
        # sondern 22 Prozent von 55 Prozent.
        teile = modul.bauen(blaetter=blaetter, atlas_hoehe=bogenhoehe)
        block, deckel, band = teile['block'], teile['deckel'], teile['band']

        modifikatoren_anwenden(block)
        modifikatoren_anwenden(deckel)
        modifikatoren_anwenden(band)

        orm = umschlag_web_tauglich(deckel, kante)

        # NUR der Einband wird ausgeduennt.
        #
        # Der Buchblock besteht aus einzelnen Blaettern. Ein Reduzierer
        # sucht sich flache Nachbarn und klappt sie zusammen — bei einem
        # Stapel duenner Kaesten sind das genau die Fugen zwischen den
        # Blaettern. Das Ergebnis waere wieder der Klotz, den der Umbau
        # gerade beseitigt hat. Die Stufe steckt stattdessen in `blaetter`.
        ausduennen(deckel, anteil)

        groesse = exportieren([deckel, block, band], f'buch-{name}.glb')
        ergebnisse.append({
            'fassung': name,
            'kb': round(groesse / 1024, 1),
            'flaechen': (len(block.data.polygons) + len(deckel.data.polygons)
                         + len(band.data.polygons)),
            'blaetter': blaetter,
            'orm': bool(orm),
            'ormkante': kante,
            'bogen': '%dx%d' % (teile['atlas'].size[0], teile['atlas'].size[1]),
        })

    return ergebnisse


if __name__ == '__main__':
    for z in alles_exportieren():
        print(z)
