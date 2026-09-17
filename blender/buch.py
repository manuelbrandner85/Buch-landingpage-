# -*- coding: utf-8 -*-
"""
Das gebundene Buch als 3D-Objekt — die Hauptrolle im Cinematic Hero.

Warum ueberhaupt Geometrie und nicht ein gerendertes Bild: Das Licht soll
ueber das Cover wandern und die Goldpraegung anders zuruecklaufen lassen als
den matten Druck. Das ist der Unterschied zwischen "ein Foto eines Buches"
und "ein Buch".

Gebaut wird ein Hardcover, nicht ein Quader mit Bild drauf. Was ein Buch als
Buch lesbar macht, sind fuenf Dinge, die fast nie modelliert werden:

  1. Der Ueberstand. Die Deckel sind rundum etwas groesser als der
     Buchblock — ohne ihn sieht es aus wie ein Ziegel.
  2. Die Falznut. Zwischen Deckel und Ruecken laeuft eine Rille; dort
     klappt der Deckel auf. Sie faengt eine dunkle Linie ein, und genau
     diese Linie erkennt das Auge.
  3. Der gerundete Ruecken. Ein gebundenes Buch hat keinen flachen Ruecken.
  4. Der Schnitt. Die Vorderkante zeigt einzelne Blaetter.
  5. Der ganze Umschlag: Rueckseite, Ruecken UND Vorderseite.

Zwei Fehler der ersten Fassung sind hier behoben, beide vom Auftraggeber am
Bild erkannt:

  a) Der Bezug war an der Vorderkante ZUGEMAUERT. Zwischen vorderem und
     hinterem Deckel lief eine geschlossene Wand — das Buch sah an der
     rechten Seite aus wie ein versiegelter Block, und der Buchblock lag
     dahinter im Dunkeln. Diese Wand gibt es an einem echten Buch nicht:
     Dort liegt der Schnitt frei. Die Flaeche ist ersatzlos entfallen.

  b) Der Schnitt war ein glatter Quader mit einer aufgemalten Streifung.
     Im Blender-Bild ging das gerade noch durch, den glTF-Export hat die
     Streifung nicht ueberlebt — im Web war die Kante einfarbig. Jetzt sind
     es echte Blaetter als Geometrie. Sie kosten 384 Flaechen und
     ueberleben jeden Export, weil Form nicht verlorengeht.

  c) Rueckseite und Ruecken trugen einen dunklen Randstreifen des
     Vordercovers. Jetzt liegt der echte Umschlag an: Rueckseite, Ruecken
     und Vorderseite werden zu einem Bogen zusammengesetzt und ueber die
     Bogenlaenge des Profils abgewickelt — also genau so, wie ein Bezug in
     der Buchbinderei um die Pappen gelegt wird.

Aufruf:
    blender --background --factory-startup --python blender/buch.py
oder ueber den MCP-Server in der laufenden Fassung.
"""

import bpy
import bmesh
import math
import os
import random
import numpy as np
from mathutils import Matrix, Vector

# ---------------------------------------------------------------- Masse
# Der Umschlag liegt als 1200x1797 vor, also 2:3. Das Buch folgt dem.
# Die Breite ist NICHT frei waehlbar: Der Deckel muss dasselbe
# Seitenverhaeltnis haben wie das Coverbild, sonst wird der Titel gestaucht.
# Rueckwaerts gerechnet:
#   Deckelhoehe  = 0,231 + 2*0,004 = 0,239
#   Deckelbreite = 0,239 * 2/3     = 0,1593
#   Blockbreite  = Deckelbreite - Ueberstand - Falz = 0,147
BLOCK_BREITE = 0.147   # Buchblock, ohne Deckel
BLOCK_HOEHE = 0.231

# Die Dicke ist gerechnet, nicht geschaetzt.
#
# Vorher standen hier 26 mm mit dem Vermerk "206 Seiten, gebunden". Das sind
# 0,25 mm je Blatt — Karton, nicht Papier. 206 Seiten sind 103 Blatt; bei
# 0,128 mm Werkdruckpapier ergibt das 13,2 mm.
#
# Es geht dabei nicht um Genauigkeit um ihrer selbst willen: Der gedruckte
# Ruecken von Band 1 misst 12,35 mm. Ueber den gerundeten Ruecken eines
# Hardcovers laeuft der Bogen zwangslaeufig laenger — aber mit 26 mm Block
# war es das Zweieinhalbfache, und die Aufschrift stand als schmaler
# Streifen in der Mitte einer breiten Flaeche. Mit 13,2 mm sind es knapp
# 19 mm, und der Ruecken sieht aus wie der des Buches, das es gibt.
BLOCK_TIEFE = 0.0132
UEBERSTAND = 0.004     # wie weit der Deckel uebersteht
# 2,4 mm: Graupappe 2 mm plus Bezug. 2,8 mm waren Buchbinderpappe fuer ein
# Buch dieser Groesse eine Nummer zu stark.
DECKEL_DICKE = 0.0024
FALZ = 0.008           # Abstand Ruecken zu Deckelkante
# Die Rundung eines geklopften Ruecken liegt bei etwa einem Achtel der
# Ruckentiefe. Bei 18 mm sind das gut 2 mm — 6 mm waren der Rundruecken
# eines Folianten.
RUECKEN_RUNDUNG = 0.0026

# Der Deckel ist so breit wie der Block PLUS der Ueberstand vorn PLUS die
# Falznut hinten. Wer nur den Ueberstand addiert, bekommt einen Block, der
# vorne aus dem Deckel herausragt — und genau daran erkennt man ein
# schlecht modelliertes Buch sofort.
DECKEL_BREITE = BLOCK_BREITE + UEBERSTAND + FALZ
DECKEL_HOEHE = BLOCK_HOEHE + 2 * UEBERSTAND
RUECKEN_TIEFE = BLOCK_TIEFE + 2 * DECKEL_DICKE

# ------------------------------------------------------------ Der Schnitt
# Echte Blaetter, nicht gemalte.
#
# 206 Seiten sind 103 Blatt. So viele einzeln zu bauen waere Verschwendung:
# Im Hero ist der Schnitt rund 20 Pixel breit — mehr als etwa drei Dutzend
# Linien loest dort niemand mehr auf, und feiner gestellt fangen sie an zu
# flimmern, sobald sich die Kamera bewegt. Die Zahl haengt an der Dicke des
# Blocks: 36 Blaetter auf 13,2 mm sind 2,7 Linien je Millimeter, also
# derselbe Strichabstand, der bei 26 mm 64 Blaetter gebraucht haette.
BLAETTER_STANDARD = 36
LAGE = 6               # alle sechs Blaetter eine Lage — die Falz sitzt tiefer
SCHNITT_HOHL = 0.0009  # der hohle Schnitt eines rundgeklopften Ruecken
BLATT_LUFT = 0.14      # Anteil der Teilung, der als Fuge offen bleibt

HIER = os.path.dirname(os.path.abspath(__file__))
PROJEKT = os.path.dirname(HIER)
SZENEN = os.path.join(PROJEKT, 'public', 'assets', 'band-1', 'szenen')
# Zwischenstaende. Gehoert nicht ins Repository — steht in .gitignore.
ARBEIT = os.path.join(HIER, 'arbeit')

COVER_VORN = os.path.join(PROJEKT, 'assets-quelle', 'cover.jpg')
COVER_HINTEN = os.path.join(SZENEN, 'cover-rueckseite.webp')
COVER_RUECKEN = os.path.join(SZENEN, 'cover-ruecken.webp')

# Wo im Profil ein Abschnitt aufhoert. Siehe `einband()`.
IDX_VORN_ENDE = 3      # Vorderdeckel inkl. Falznut
IDX_RUECKEN_ENDE = 16  # gerundeter Ruecken


def aufraeumen():
    """Leere Buehne. Auch die Datenbloecke, sonst wachsen sie bei jedem Lauf."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for sammlung in (bpy.data.meshes, bpy.data.materials, bpy.data.images,
                     bpy.data.curves, bpy.data.lights, bpy.data.cameras):
        for block in list(sammlung):
            if block.users == 0:
                sammlung.remove(block)


def kasten(bm, x0, x1, y0, y1, z0, z1):
    """Ein achsparalleler Quader in ein bestehendes bmesh legen."""
    p = [
        bm.verts.new((x0, y0, z0)), bm.verts.new((x1, y0, z0)),
        bm.verts.new((x1, y1, z0)), bm.verts.new((x0, y1, z0)),
        bm.verts.new((x0, y0, z1)), bm.verts.new((x1, y0, z1)),
        bm.verts.new((x1, y1, z1)), bm.verts.new((x0, y1, z1)),
    ]
    for a, b, c, d in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                       (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        bm.faces.new((p[a], p[b], p[c], p[d]))


def buchblock(blaetter=BLAETTER_STANDARD):
    """
    Die Seiten — als einzelne Blaetter.

    Die erste Fassung war ein Quader mit einer Streifung im Material. Das
    hatte zwei Fehler: Im Web war die Streifung weg (glTF kennt keine
    Wellenknoten), und selbst in Blender blieb der Schnitt eine Flaeche mit
    Muster statt eines Stapels mit Tiefe.

    Jetzt liegt jedes Blatt als eigener Koerper da. Drei Dinge machen aus
    einem Kamm einen Buchschnitt:

      * Der hohle Schnitt. Ein rundgeklopfter Ruecken zieht die Blaetter in
        der Stapelmitte zurueck; aussen stehen sie vor. Der Schnitt ist
        deshalb konkav, nicht gerade.
      * Die Lagen. Ein gebundenes Buch besteht aus Bogen zu je acht Blatt.
        An jeder Lagenfalz sitzt die Kante minimal tiefer — das sind die
        groeberen Linien, die man ueber die feinen hinweg sieht.
      * Streuung. Voellig gleiche Abstaende lesen sich als Lamelle. Ein
        Zehntelmillimeter Zufall pro Blatt macht daraus Papier. Der
        Zufallsgeber ist festgesetzt, damit zwei Laeufe dasselbe Buch
        ergeben.
    """
    x0 = -DECKEL_BREITE / 2 + FALZ
    x1 = x0 + BLOCK_BREITE

    netz = bpy.data.meshes.new('Buchblock')
    objekt = bpy.data.objects.new('Buchblock', netz)
    bpy.context.collection.objects.link(objekt)

    rnd = random.Random(20260916)
    bm = bmesh.new()

    teilung = BLOCK_TIEFE / blaetter
    dicke = teilung * (1.0 - BLATT_LUFT)
    # Die Lagenfalz skaliert mit der Teilung: Bei 22 Blaettern steht ein
    # Blatt fuer fuenf, dann darf die Kerbe nicht gleich tief bleiben.
    lagentiefe = min(0.00026, teilung * 0.55)

    for i in range(blaetter):
        y0 = -BLOCK_TIEFE / 2 + i * teilung
        y1 = y0 + dicke
        mitte = (y0 + y1) * 0.5

        rel = mitte / (BLOCK_TIEFE * 0.5)
        hohl = SCHNITT_HOHL * (1.0 - rel * rel)
        kerbe = lagentiefe if (i % LAGE) == 0 else 0.0
        vorn = x1 - hohl - kerbe - rnd.uniform(0.0, 0.00016)

        # Kopf- und Fussschnitt streuen eigenstaendig. Ein Stapel, dessen
        # Blaetter oben exakt buendig sind, sieht aus wie gefraest.
        oben = BLOCK_HOEHE * 0.5 - rnd.uniform(0.0, 0.00010)
        unten = -BLOCK_HOEHE * 0.5 + rnd.uniform(0.0, 0.00010)

        kasten(bm, x0, vorn, y0, y1, unten, oben)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(netz)
    bm.free()

    return objekt


def kapitalband(streifen=13):
    """
    Das Kapitalband — oben und unten am Ruecken.

    Es stand seit dem ersten Entwurf als Punkt 5 in der Liste dessen, was ein
    Buch als Buch lesbar macht, und war als einziges nie gebaut. Beim
    Nachsehen an einem echten gebundenen Buch ist es genau das Teil, das im
    Hero am meisten fehlt: Die Kamera blickt leicht von oben, dort endet der
    Buchblock — und bei einem Hardcover endet er nicht mit einer Kante,
    sondern mit einem gewebten Band, das zwischen Block und Deckel
    hervorschaut. Zwei Millimeter Geometrie, an der das Auge ein gebundenes
    Buch von einem Quader unterscheidet.

    Gebaut als flacher Zylinder laengs des Ruecken; die untere Haelfte steckt
    im Block. Das ist billiger als ein Halbzylinder und sieht gleich aus —
    was drinsteckt, sieht ohnehin niemand.
    """
    x0 = -DECKEL_BREITE / 2 + FALZ
    radius = 0.0011
    # Der Block reicht bis BLOCK_HOEHE/2; das Band sitzt auf seiner Kante und
    # schaut um etwa einen halben Radius darueber hinaus.
    z_oben = BLOCK_HOEHE * 0.5 + radius * 0.35

    netz = bpy.data.meshes.new('Kapitalband')
    objekt = bpy.data.objects.new('Kapitalband', netz)
    bpy.context.collection.objects.link(objekt)

    bm = bmesh.new()
    schicht = bm.faces.layers.int.new('streifen')
    teilung = BLOCK_TIEFE / streifen

    for zeichen in (1.0, -1.0):
        for i in range(streifen):
            y = -BLOCK_TIEFE * 0.5 + (i + 0.5) * teilung
            vorher = set(bm.faces)
            bmesh.ops.create_cone(
                bm,
                cap_ends=True, cap_tris=False, segments=8,
                radius1=radius, radius2=radius, depth=teilung * 1.02,
                matrix=(
                    Matrix.Translation((x0 + radius * 0.6, y, zeichen * z_oben))
                    @ Matrix.Rotation(math.radians(90.0), 4, 'X')
                ),
            )
            for f in bm.faces:
                if f not in vorher:
                    f[schicht] = i % 2

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(netz)
    bm.free()

    # Die Streifen sind Geometrie, nicht Shader — aus demselben Grund wie
    # beim Buchschnitt: Ein gerechneter Streifen ueberlebt den glTF-Export
    # nicht, ein zweiter Materialplatz schon.
    for flaeche, wert in zip(netz.polygons, _streifenwerte(netz, streifen)):
        flaeche.material_index = wert

    return objekt


def _streifenwerte(netz, streifen):
    """
    Welcher Streifen zu welcher Flaeche gehoert — aus der Y-Lage gelesen.

    Das Attribut aus dem bmesh ueberlebt `to_mesh` nicht als Materialindex;
    es aus der Mitte jeder Flaeche zurueckzurechnen ist kuerzer als es
    durchzureichen und kann nicht auseinanderlaufen.
    """
    teilung = BLOCK_TIEFE / streifen
    for flaeche in netz.polygons:
        y = flaeche.center.y + BLOCK_TIEFE * 0.5
        yield int(min(streifen - 1, max(0, int(y / teilung)))) % 2


def materialien_kapitalband():
    """
    Zwei schlichte Materialien — Gold und gebrochenes Weiss.

    Beide ohne Textur und ohne Knotenrechnung. Das ist Absicht: Die Streifen
    stecken in der Geometrie (siehe `kapitalband`), und damit ueberleben sie
    den glTF-Export. Genau an dieser Stelle ist das Projekt schon einmal
    hereingefallen — die Streifung des Buchschnitts war ein Wellenknoten und
    im Browser lautlos verschwunden.

    Rauheit 0,72 liegt im Bereich, den die Tabelle fuer Stoff und Gewebe
    nennt (0,80–1,00 waeren mattes Gewebe; ein Kapitalband ist aus
    merzerisierter Baumwolle und damit eine Spur glaenzender). Kein Metallic:
    Das Gold eines Kapitalbandes ist gefaerbtes Garn, keine Folie.
    """
    werte = (
        ('Kapitalband Gold', (0.42, 0.31, 0.13, 1.0), 0.66),
        ('Kapitalband Hell', (0.70, 0.66, 0.58, 1.0), 0.78),
    )
    fertig = []
    for name, farbe, rauheit in werte:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = next(k for k in mat.node_tree.nodes if k.type == 'BSDF_PRINCIPLED')
        bsdf.inputs['Base Color'].default_value = farbe
        bsdf.inputs['Roughness'].default_value = rauheit
        fertig.append(mat)
    return fertig


def _material_kapitalband_alt():
    """
    Gewebtes Band, zweifarbig gestreift — die Knotenfassung.

    Bleibt als Nachschlagewerk stehen: Sie sieht in Blender besser aus als
    die zwei schlichten Materialien, weil die Webrillen als Normale
    dazukommen. Fuer den Export ist sie unbrauchbar, deshalb wird sie nicht
    verwendet.

    Warum gestreift und nicht einfarbig: Ein einfarbiges Band liest sich als
    Gummidichtung. Die Streifung ist das, was daran textil aussieht — sie
    entsteht beim Weben aus zwei Kettfaeden und ist an fast jedem gebundenen
    Buch zu finden. Teilung rund ein Millimeter, also etwa dreizehn Streifen
    ueber die Ruckentiefe.
    """
    mat = bpy.data.materials.new('Kapitalband')
    mat.use_nodes = True
    n = mat.node_tree.nodes
    v = mat.node_tree.links
    n.clear()

    aus = n.new('ShaderNodeOutputMaterial')
    aus.location = (600, 0)
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (360, 0)
    bsdf.inputs['Roughness'].default_value = 0.72
    v.new(bsdf.outputs['BSDF'], aus.inputs['Surface'])

    koord = n.new('ShaderNodeTexCoord')
    koord.location = (-600, 0)
    trenn = n.new('ShaderNodeSeparateXYZ')
    trenn.location = (-420, 0)
    v.new(koord.outputs['Object'], trenn.inputs['Vector'])

    # 2*pi / 0,002 m ≈ 3140 — eine Streifenteilung von einem Millimeter.
    takt = n.new('ShaderNodeMath')
    takt.operation = 'MULTIPLY'
    takt.inputs[1].default_value = 3140.0
    takt.location = (-240, 0)
    v.new(trenn.outputs['Y'], takt.inputs[0])

    sinus = n.new('ShaderNodeMath')
    sinus.operation = 'SINE'
    sinus.location = (-80, 0)
    v.new(takt.outputs[0], sinus.inputs[0])

    kante = n.new('ShaderNodeMapRange')
    kante.location = (80, 0)
    kante.interpolation_type = 'SMOOTHSTEP'
    kante.inputs['From Min'].default_value = -0.25
    kante.inputs['From Max'].default_value = 0.25
    v.new(sinus.outputs[0], kante.inputs['Value'])

    misch = n.new('ShaderNodeMixRGB')
    misch.location = (200, 120)
    misch.inputs['Color1'].default_value = (0.58, 0.44, 0.19, 1.0)   # Gold
    misch.inputs['Color2'].default_value = (0.80, 0.76, 0.68, 1.0)   # gebrochenes Weiss
    v.new(kante.outputs['Result'], misch.inputs['Fac'])
    v.new(misch.outputs['Color'], bsdf.inputs['Base Color'])

    # Gewebe ist nie glatt. Die Rillen zwischen den Faeden fangen das
    # Streiflicht und machen aus der Farbe ein Material.
    tiefe = n.new('ShaderNodeBump')
    tiefe.location = (200, -220)
    tiefe.inputs['Strength'].default_value = 0.45
    tiefe.inputs['Distance'].default_value = 0.00012
    v.new(kante.outputs['Result'], tiefe.inputs['Height'])
    v.new(tiefe.outputs['Normal'], bsdf.inputs['Normal'])

    return mat


def einband():
    """
    Das Profil des Bezugs in der Draufsicht (XY).

    Ein Hardcover ist nicht "zwei Deckel und ein Ruecken", sondern ein Bezug
    ueber drei Pappen. Modelliert man drei getrennte Teile, sieht man an den
    Stossstellen durch — und die Falznut, das wichtigste Erkennungsmerkmal,
    entsteht gar nicht erst.

    Die Reihenfolge der Punkte ist gleichzeitig die Abwicklung des Bezugs.
    Das ist kein Zufall, sondern der Grund, warum die UV spaeter einfach die
    Bogenlaenge ist: Punkt 0 ist die Vorderkante des Vorderdeckels, Punkt 19
    die Vorderkante des Hinterdeckels. Wer dazwischen entlanglaeuft, laeuft
    ueber genau den Bogen, der in der Buchbinderei flach auf dem Tisch liegt.
    """
    w = DECKEL_BREITE / 2
    t = RUECKEN_TIEFE / 2
    r = RUECKEN_RUNDUNG

    aussen = []

    # 0..1  Vorderer Deckel: von der Vorderkante zum Falz.
    aussen.append((w, -t))
    aussen.append((-w + FALZ * 0.35, -t))

    # 2..3  Die Falznut — eine schmale Kerbe nach innen. Sie ist der Grund,
    #       warum ein Buch an dieser Stelle eine dunkle Linie hat.
    aussen.append((-w + FALZ * 0.16, -t + 0.0022))
    aussen.append((-w + FALZ * 0.02, -t + 0.0006))

    # 4..15 Der gerundete Ruecken als Halbkreisbogen.
    for i in range(1, 13):
        winkel = math.pi * (i / 13.0)
        aussen.append((
            -w - r * math.sin(winkel),
            -t * math.cos(winkel),
        ))

    # 16..19 Spiegelbildlich zurueck ueber den hinteren Deckel.
    aussen.append((-w + FALZ * 0.02, t - 0.0006))
    aussen.append((-w + FALZ * 0.16, t - 0.0022))
    aussen.append((-w + FALZ * 0.35, t))
    aussen.append((w, t))

    return aussen


def einband_bauen():
    """
    Das Profil in die Hoehe ziehen — und vorne OFFEN lassen.

    Hier lag der Fehler, den man am Bild sofort sieht: Frueher schloss eine
    Flaeche von der Vorderkante des einen Deckels zur Vorderkante des
    anderen. Damit war das Buch an der rechten Seite zugemauert und der
    Schnitt verschwand dahinter.

    Ein Bezug hat dort nichts. Der Dickenmodifikator legt die Pappe nach
    innen und schliesst die offenen Raender von selbst mit einer Kante von
    Deckeldicke — genau das, was man an einem echten Buch an der
    Vorderkante sieht.
    """
    profil = einband()

    netz = bpy.data.meshes.new('Einband')
    objekt = bpy.data.objects.new('Einband', netz)
    bpy.context.collection.objects.link(objekt)

    bm = bmesh.new()
    z = DECKEL_HOEHE / 2

    unten = [bm.verts.new((x, y, -z)) for x, y in profil]
    oben = [bm.verts.new((x, y, z)) for x, y in profil]
    bm.verts.ensure_lookup_table()

    for i in range(len(profil) - 1):
        bm.faces.new((unten[i], unten[i + 1], oben[i + 1], oben[i]))

    # KEINE schliessende Flaeche zwischen Punkt 0 und Punkt 19.

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

    # Bei einem offenen Streifen legt `recalc_face_normals` die Normalen
    # zwar einheitlich, aber die Richtung ist beliebig — und davon haengt
    # ab, ob die Pappe nach innen oder nach aussen waechst. Also nachsehen:
    # Die erste Flaeche gehoert zum Vorderdeckel und muss nach -Y zeigen.
    bm.faces.ensure_lookup_table()
    if bm.faces[0].normal.y > 0.0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])

    bm.to_mesh(netz)
    bm.free()

    # Dicke nach innen: Der Bezug liegt aussen, die Pappe darunter.
    dicke = objekt.modifiers.new('Pappe', 'SOLIDIFY')
    dicke.thickness = DECKEL_DICKE
    dicke.offset = 1.0
    # Der Rand wird geschlossen — sonst ist der Deckel an der Vorderkante
    # ein Blatt Papier ohne Dicke.
    dicke.use_rim = True
    dicke.use_rim_only = False

    fase = objekt.modifiers.new('Kante', 'BEVEL')
    fase.width = 0.0006
    fase.segments = 2
    fase.limit_method = 'ANGLE'
    fase.angle_limit = math.radians(50)

    glatt = objekt.modifiers.new('Glaetten', 'SUBSURF')
    glatt.levels = 1
    glatt.render_levels = 2
    # Ohne diese Zeile zieht die Unterteilung den jetzt offenen Rand nach
    # innen und der Deckel wird an der Vorderkante duenner als er ist.
    glatt.boundary_smooth = 'PRESERVE_CORNERS'

    return objekt, profil


def bild_laden(pfad):
    if not os.path.exists(pfad):
        return None
    name = os.path.basename(pfad)
    if name in bpy.data.images:
        return bpy.data.images[name]
    return bpy.data.images.load(pfad)


def bild_als_feld(bild, breite, hoehe):
    """Ein Bild auf eine Groesse bringen und als (hoehe, breite, 4) lesen."""
    kopie = bild.copy()
    kopie.name = bild.name + '-arbeit'
    kopie.scale(breite, hoehe)
    puffer = np.empty(breite * hoehe * 4, dtype=np.float32)
    kopie.pixels.foreach_get(puffer)
    bpy.data.images.remove(kopie)
    return puffer.reshape(hoehe, breite, 4)


def bogenlaengen(profil):
    """Kumulierte Bogenlaenge entlang des Profils."""
    laengen = [0.0]
    for i in range(1, len(profil)):
        dx = profil[i][0] - profil[i - 1][0]
        dy = profil[i][1] - profil[i - 1][1]
        laengen.append(laengen[-1] + math.hypot(dx, dy))
    return laengen


def umschlag_atlas(profil, hoehe=1797, name='cover-umschlag'):
    """
    Rueckseite, Ruecken und Vorderseite zu EINEM Bogen zusammensetzen.

    So wird ein Bezug tatsaechlich gedruckt: ein Stueck Papier, auf dem von
    links nach rechts Rueckseite, Ruecken und Vorderseite liegen. Genau
    dieses Stueck wird hier gebaut — und weil die Breiten aus den
    Bogenlaengen des Profils kommen, sitzt spaeter jede Kante auf dem
    Millimeter, ohne dass irgendwo etwas gestaucht wird.

    Ein Bild statt drei Materialien ist Absicht: Der Export backt Metallic
    und Rauheit in eine Textur, und drei Materialien waeren drei Backlaeufe,
    drei Texturen und drei Zeichenaufrufe im Browser — fuer dieselbe
    Oberflaeche.
    """
    laengen = bogenlaengen(profil)
    gesamt = laengen[-1]
    l_vorn = laengen[IDX_VORN_ENDE]
    l_ruecken = laengen[IDX_RUECKEN_ENDE] - l_vorn
    l_hinten = gesamt - laengen[IDX_RUECKEN_ENDE]

    px = hoehe / DECKEL_HOEHE
    b_hinten = max(8, int(round(l_hinten * px)))
    b_ruecken = max(8, int(round(l_ruecken * px)))
    b_vorn = max(8, int(round(l_vorn * px)))
    breite = b_hinten + b_ruecken + b_vorn

    feld = np.zeros((hoehe, breite, 4), dtype=np.float32)
    feld[:, :, 3] = 1.0

    vorn = bild_laden(COVER_VORN)
    hinten = bild_laden(COVER_HINTEN) or vorn
    ruecken = bild_laden(COVER_RUECKEN)

    if hinten is not None:
        feld[:, 0:b_hinten, :] = bild_als_feld(hinten, b_hinten, hoehe)
    if vorn is not None:
        feld[:, b_hinten + b_ruecken:breite, :] = bild_als_feld(vorn, b_vorn, hoehe)

    # Der Ruecken: NICHT dehnen.
    #
    # Das Original ist der gedruckte Ruecken des Taschenbuchs, rund 12 mm
    # breit. Der gerundete Ruecken dieses Hardcovers misst ueber den Bogen
    # gut das Doppelte. Wer die Datei einfach breitzieht, bekommt eine
    # Schrift, die in einer Richtung fett und in der anderen normal ist —
    # das faellt sofort auf. Stattdessen steht die Aufschrift mittig in
    # richtiger Groesse, und links und rechts wird zur Nachbarseite hin
    # ueberblendet. Dort liegt ohnehin nur dunkler Rahmen auf dunklem Grund.
    if ruecken is not None:
        eigen = int(round(ruecken.size[0] / ruecken.size[1] * hoehe))
        eigen = max(4, min(eigen, b_ruecken))
        streifen = bild_als_feld(ruecken, eigen, hoehe)
        links = b_hinten + (b_ruecken - eigen) // 2
        rechts = links + eigen
        feld[:, links:rechts, :] = streifen

        # Die Luecken werden ueberblendet, nicht wiederholt.
        #
        # Beim ersten Versuch stand dort die aeusserste Bildspalte des
        # Ruecken-Originals. Die ist an manchen Zeilen heller als der Rest —
        # im Bild sah man oben und unten am Ruecken zwei graue Kaestchen.
        # Eine lineare Ueberblendung von der Nachbarseite zum Ruecken hat
        # an beiden Enden denselben Wert wie das, woran sie stoesst; damit
        # ist dort keine Kante mehr, die man finden koennte.
        if links > b_hinten:
            a = feld[:, b_hinten - 1:b_hinten, :]
            b = streifen[:, 0:1, :]
            n = links - b_hinten
            t = np.linspace(0.0, 1.0, n, dtype=np.float32).reshape(1, n, 1)
            feld[:, b_hinten:links, :] = a * (1.0 - t) + b * t
        grenze = b_hinten + b_ruecken
        if rechts < grenze:
            a = streifen[:, -1:, :]
            b = feld[:, grenze:grenze + 1, :]
            n = grenze - rechts
            t = np.linspace(0.0, 1.0, n, dtype=np.float32).reshape(1, n, 1)
            feld[:, rechts:grenze, :] = a * (1.0 - t) + b * t

    roh_name = name + '-roh'
    for alt in (name, roh_name):
        if alt in bpy.data.images:
            bpy.data.images.remove(bpy.data.images[alt])
    roh = bpy.data.images.new(roh_name, breite, hoehe, alpha=False)
    roh.pixels.foreach_set(np.ascontiguousarray(feld).reshape(-1))
    roh.update()

    # Ueber eine JPEG-Datei gehen, nicht im Speicher bleiben.
    #
    # Der glTF-Export uebernimmt das Dateiformat des Bildes. Ein erzeugtes
    # Bild hat keines und wird als PNG eingebettet: Der Bogen wog damit
    # allein 3,6 MB und die hohe Fassung sprang von 1,0 auf 4,1 MB — fuer
    # ein Foto mit lauter Farbverlaeufen, bei dem verlustfreie Kompression
    # nichts einspart, weil es keine flachen Flaechen gibt. `file_format`
    # am erzeugten Bild zu setzen genuegt nicht; erst eine echte Datei
    # aendert, was der Exporter einbettet.
    #
    # Die ORM-Karte bleibt bewusst PNG: Sie ist ein Messwert, kein Bild, und
    # JPEG-Ringe um die Goldbuchstaben wuerden die Folie ausfransen lassen.
    os.makedirs(ARBEIT, exist_ok=True)
    datei = os.path.join(ARBEIT, 'umschlag-bogen-%d.jpg' % hoehe)
    alt_q = bpy.context.scene.render.image_settings.quality
    bpy.context.scene.render.image_settings.quality = 88
    roh.filepath_raw = datei
    roh.file_format = 'JPEG'
    roh.save()
    bpy.context.scene.render.image_settings.quality = alt_q
    bpy.data.images.remove(roh)

    atlas = bpy.data.images.load(datei)
    atlas.name = name
    return atlas


def material_umschlag(atlas):
    """
    Der Bezug — mit echter Goldpraegung.

    Der Trick, der den Unterschied macht: Die Goldflaechen stecken bereits im
    Coverbild, aber sie sind dort nur Farbe. Gedruckt ist Gold jedoch eine
    Folie — sie ist metallisch und glatt, waehrend der Rest matt ist. Deshalb
    wird die Metallik NICHT gemalt, sondern aus dem Bild abgeleitet: Was warm
    und hell genug ist, gilt als Folie.

    Weil jetzt der ganze Bogen im Bild liegt, gilt das auch fuer die
    Aufschrift auf dem Ruecken und die Goldelemente der Rueckseite — ohne
    eine einzige zusaetzliche Zeile.
    """
    mat = bpy.data.materials.new('Umschlag')
    mat.use_nodes = True
    n = mat.node_tree.nodes
    v = mat.node_tree.links
    n.clear()

    aus = n.new('ShaderNodeOutputMaterial')
    aus.location = (900, 0)
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (600, 0)
    v.new(bsdf.outputs['BSDF'], aus.inputs['Surface'])

    uv = n.new('ShaderNodeTexCoord')
    uv.location = (-800, 0)

    bild = n.new('ShaderNodeTexImage')
    bild.location = (-560, 100)
    bild.image = atlas
    # Der Bogen endet an seinen Raendern. Wiederholung wuerde an der
    # Vorderkante die Rueckseite anschneiden.
    bild.extension = 'EXTEND'
    v.new(uv.outputs['UV'], bild.inputs['Vector'])
    # Die Basisfarbe wird weiter unten gesetzt: Wo Folie liegt, ist sie nicht
    # die Druckfarbe, sondern die Reflexionsfarbe des Goldes.

    # --- Goldfolie aus dem Bild ableiten -----------------------------
    #
    # Gold ist auf diesem Umschlag das einzige, was gleichzeitig hell UND
    # warm ist. Der Nachthimmel ist dunkel und kalt, die Zikkurat warm aber
    # gedaempft. Sattheit mal Helligkeit trennt beides sauber.
    hsv = n.new('ShaderNodeSeparateColor')
    hsv.mode = 'HSV'
    hsv.location = (-300, -220)
    v.new(bild.outputs['Color'], hsv.inputs['Color'])

    warm = n.new('ShaderNodeMath')     # Sattheit
    warm.operation = 'MULTIPLY'
    warm.location = (-100, -220)
    v.new(hsv.outputs[1], warm.inputs[0])
    v.new(hsv.outputs[2], warm.inputs[1])   # mal Helligkeit

    # Metallic ist binaer — der Uebergang ist nur Kantenglaettung.
    #
    # Vorher lief die Kennlinie ueber 0,12 bis 0,34 und lieferte damit fuer
    # den halben Umschlag Zwischenwerte. Ein Wert wie 0,4 beschreibt kein
    # Material: Etwas ist Metall oder es ist keines, und was dazwischen
    # liegt, ist eine Mischung aus beidem auf kleinem Raum (Folie mit
    # Fehlstellen). Ein flaechiger Zwischenwert sieht aus wie Kunststoff mit
    # Metallicpigment.
    #
    # Das Band ist deshalb schmal: 0,19 bis 0,25 trennt Folie von Druck und
    # laesst genau so viel Uebergang, dass die Buchstabenraender nicht
    # zacken.
    schwelle = n.new('ShaderNodeMapRange')
    schwelle.location = (100, -220)
    schwelle.interpolation_type = 'SMOOTHSTEP'
    schwelle.inputs['From Min'].default_value = 0.19
    schwelle.inputs['From Max'].default_value = 0.25
    schwelle.inputs['To Min'].default_value = 0.0
    schwelle.inputs['To Max'].default_value = 1.0
    v.new(warm.outputs[0], schwelle.inputs['Value'])

    v.new(schwelle.outputs['Result'], bsdf.inputs['Metallic'])

    # --- Die Basisfarbe der Folie ist NICHT die Druckfarbe ------------
    #
    # Bei einem Metall ist die Basisfarbe die Reflexionsfarbe F0, nicht die
    # Farbe, die man auf dem Papier sieht. Fuer Gold steht sie mit
    # 1,00 / 0,77 / 0,34 (linear) fest.
    #
    # Genau hier lag der Fehler: Die gedruckte Goldfarbe im Coverbild liegt
    # bei etwa 0,45 / 0,33 / 0,13 — also weniger als der halbe Wert. Metall
    # mit halber Reflexion ist kein Gold, sondern angelaufene Bronze, und
    # genau so sah die Praegung aus. Dass sie ueberhaupt glaenzte, hat den
    # Fehler verdeckt.
    #
    # Der Druck daneben behaelt seine Farbe. Gemischt wird ueber dieselbe
    # Maske, die auch das Metallic schaltet — damit kann Farbe und
    # Metallizitaet nicht auseinanderlaufen.
    gold = n.new('ShaderNodeMixRGB')
    gold.location = (320, 100)
    gold.inputs['Color2'].default_value = (1.0, 0.77, 0.34, 1.0)
    v.new(schwelle.outputs['Result'], gold.inputs['Fac'])
    v.new(bild.outputs['Color'], gold.inputs['Color1'])
    v.new(gold.outputs['Color'], bsdf.inputs['Base Color'])

    # Folie ist glatt (0,18), Leinen ist rau (0,72).
    rau = n.new('ShaderNodeMapRange')
    rau.location = (320, -220)
    rau.inputs['To Min'].default_value = 0.72
    rau.inputs['To Max'].default_value = 0.18
    v.new(schwelle.outputs[0], rau.inputs['Value'])

    # --- Rauheit mit Variation ----------------------------------------
    #
    # Eine Flaeche mit ueberall demselben Rauheitswert sieht aus wie
    # Kunststoff, auch wenn die Farbe stimmt — das ist nach dem Licht der
    # staerkste Hebel ueberhaupt. Die Ursache in der Wirklichkeit: Der
    # Karton nimmt den Lack nicht ueberall gleich an, und ein Buch, das
    # jemand in der Hand hatte, ist an den Griffstellen eine Spur glatter.
    #
    # Weltkoordinaten, nicht UV: So laeuft die Variation ueber die Naht am
    # Falz hinweg, statt dort abzureissen.
    rauschen = n.new('ShaderNodeTexNoise')
    rauschen.location = (100, -460)
    rauschen.inputs['Scale'].default_value = 14.0
    rauschen.inputs['Detail'].default_value = 3.0
    rauschen.inputs['Roughness'].default_value = 0.55
    v.new(uv.outputs['Object'], rauschen.inputs['Vector'])

    streuung = n.new('ShaderNodeMapRange')
    streuung.location = (320, -460)
    streuung.inputs['To Min'].default_value = -0.07
    streuung.inputs['To Max'].default_value = 0.07
    v.new(rauschen.outputs['Fac'], streuung.inputs['Value'])

    rau_gesamt = n.new('ShaderNodeMath')
    rau_gesamt.operation = 'ADD'
    rau_gesamt.use_clamp = True
    rau_gesamt.location = (480, -340)
    v.new(rau.outputs['Result'], rau_gesamt.inputs[0])
    v.new(streuung.outputs['Result'], rau_gesamt.inputs[1])
    v.new(rau_gesamt.outputs[0], bsdf.inputs['Roughness'])

    # --- Leinenstruktur ----------------------------------------------
    # Eine feine Webung, nur als Normale. Sie ist im Standbild kaum zu
    # sehen und im Streiflicht sofort.
    leinen = n.new('ShaderNodeTexNoise')
    leinen.location = (-300, -520)
    leinen.inputs['Scale'].default_value = 900.0
    leinen.inputs['Detail'].default_value = 2.0
    v.new(uv.outputs['UV'], leinen.inputs['Vector'])

    # Die Pappe ist nicht plan.
    #
    # Ein Buchdeckel ist eine kaschierte Graupappe; sie zieht sich beim
    # Trocknen des Leims minimal und ist danach nie wieder eben. Deshalb
    # eine sehr grosse, sehr flache Welle UNTER der Leinenstruktur: Sie ist
    # als Form unsichtbar und sorgt dafuer, dass der Glanzstreifen beim
    # Wandern atmet, statt als gerader Balken ueber eine Planke zu ziehen.
    welle = n.new('ShaderNodeTexNoise')
    welle.location = (-300, -760)
    welle.inputs['Scale'].default_value = 3.2
    welle.inputs['Detail'].default_value = 1.0
    v.new(uv.outputs['Object'], welle.inputs['Vector'])

    wellenform = n.new('ShaderNodeBump')
    wellenform.location = (-60, -760)
    wellenform.inputs['Strength'].default_value = 0.08
    wellenform.inputs['Distance'].default_value = 0.0022
    v.new(welle.outputs['Fac'], wellenform.inputs['Height'])

    hoehe = n.new('ShaderNodeBump')
    hoehe.location = (320, -520)
    hoehe.inputs['Strength'].default_value = 0.12
    hoehe.inputs['Distance'].default_value = 0.0004
    v.new(leinen.outputs['Fac'], hoehe.inputs['Height'])
    # Zwei Ebenen: Die grosse Welle liegt unter der feinen Webung. Ein Bump,
    # dessen Normale in den naechsten Bump geht, addiert die Ebenen richtig —
    # zwei getrennte Bumps in denselben Eingang wuerden einander ersetzen.
    v.new(wellenform.outputs['Normal'], hoehe.inputs['Normal'])
    v.new(hoehe.outputs['Normal'], bsdf.inputs['Normal'])

    return mat


def material_papier():
    """
    Der Buchblock.

    Frueher stand hier eine gerechnete Streifung, die die Blattkanten
    vortaeuschte. Die ist ersatzlos entfallen: Die Kanten sind jetzt
    Geometrie, und eine zweite, aufgemalte Kantenreihe daneben wuerde sich
    mit der echten ueberlagern und flimmern.

    Was bleibt, ist Papier: warm, matt, fast ohne Spiegelung, mit einer sehr
    feinen Narbung. Die Tiefe zwischen den Blaettern macht das Licht, nicht
    das Material.
    """
    mat = bpy.data.materials.new('Papier')
    mat.use_nodes = True
    n = mat.node_tree.nodes
    v = mat.node_tree.links
    n.clear()

    aus = n.new('ShaderNodeOutputMaterial')
    aus.location = (700, 0)
    bsdf = n.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (400, 0)
    # Werkdruckpapier, nicht Kopierpapier.
    #
    # 0,88 lag ueber dem, was ein Dielektrikum zurueckwirft — die Tabelle
    # gibt fuer weisse Farbe 0,70 bis 0,85, und ein cremefarbenes Buchpapier
    # liegt im unteren Drittel davon. Zu hohe Albedo ist der Grund, warum
    # Papier in Renderings oft leuchtet statt hell zu sein.
    bsdf.inputs['Base Color'].default_value = (0.80, 0.765, 0.695, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.95
    # Papier hat fast keine Spiegelung. Ohne diese Zeile faengt die
    # Vorderkante das Kantenlicht wie Kunststoff und der ganze Block glaenzt.
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.16
    elif 'Specular' in bsdf.inputs:
        bsdf.inputs['Specular'].default_value = 0.16
    v.new(bsdf.outputs['BSDF'], aus.inputs['Surface'])

    koord = n.new('ShaderNodeTexCoord')
    koord.location = (-500, -200)

    narbe = n.new('ShaderNodeTexNoise')
    narbe.location = (-280, -200)
    narbe.inputs['Scale'].default_value = 1600.0
    narbe.inputs['Detail'].default_value = 2.0
    narbe.inputs['Roughness'].default_value = 0.6
    v.new(koord.outputs['Object'], narbe.inputs['Vector'])

    tiefe = n.new('ShaderNodeBump')
    tiefe.location = (100, -200)
    tiefe.inputs['Strength'].default_value = 0.22
    tiefe.inputs['Distance'].default_value = 0.00005
    v.new(narbe.outputs['Fac'], tiefe.inputs['Height'])
    v.new(tiefe.outputs['Normal'], bsdf.inputs['Normal'])

    # --- Rauheit mit Variation ----------------------------------------
    #
    # Derselbe Grund wie beim Umschlag: Ein ueber die ganze Flaeche
    # identischer Rauheitswert liest sich als Kunststoff. Bei Papier ist die
    # Ursache die Faserlage — sie ist nie gleichmaessig, und an den
    # Schnittkanten ist sie durch das Messer eine Spur geschlossener als auf
    # der Blattflaeche.
    streuung = n.new('ShaderNodeTexNoise')
    streuung.location = (-280, -480)
    streuung.inputs['Scale'].default_value = 60.0
    streuung.inputs['Detail'].default_value = 2.0
    v.new(koord.outputs['Object'], streuung.inputs['Vector'])

    spanne = n.new('ShaderNodeMapRange')
    spanne.location = (-80, -480)
    spanne.inputs['To Min'].default_value = 0.88
    spanne.inputs['To Max'].default_value = 0.99
    v.new(streuung.outputs['Fac'], spanne.inputs['Value'])
    v.new(spanne.outputs['Result'], bsdf.inputs['Roughness'])

    # --- Der Stapel wird zum Ruecken hin dunkler ----------------------
    #
    # Ursache aus der Wirklichkeit, nicht Geschmack: Zum Bund hin kommt
    # weniger Licht zwischen die Blaetter, und dort sitzt der Leim. Der
    # Verlauf laeuft ueber X, also von der Ruckenseite zum Schnitt.
    ort = n.new('ShaderNodeSeparateXYZ')
    ort.location = (-280, 200)
    v.new(koord.outputs['Object'], ort.inputs['Vector'])

    verlauf = n.new('ShaderNodeMapRange')
    verlauf.location = (-80, 200)
    verlauf.inputs['From Min'].default_value = -DECKEL_BREITE * 0.5
    verlauf.inputs['From Max'].default_value = DECKEL_BREITE * 0.5
    verlauf.inputs['To Min'].default_value = 0.0
    verlauf.inputs['To Max'].default_value = 1.0
    verlauf.clamp = True
    v.new(ort.outputs['X'], verlauf.inputs['Value'])

    bund = n.new('ShaderNodeMixRGB')
    bund.location = (120, 200)
    bund.inputs['Color1'].default_value = (0.54, 0.50, 0.44, 1.0)   # am Bund
    bund.inputs['Color2'].default_value = (0.80, 0.765, 0.695, 1.0)  # am Schnitt
    v.new(verlauf.outputs['Result'], bund.inputs['Fac'])
    v.new(bund.outputs['Color'], bsdf.inputs['Base Color'])

    return mat


def uv_fuer_einband(objekt, profil):
    """
    Die Abwicklung des Bezugs — als Bogenlaenge, nicht als Schaetzung.

    Jeder Punkt des Grundnetzes liegt auf genau einem Punkt des Profils.
    Dessen Bogenlaenge, geteilt durch die Gesamtlaenge, IST die UV. Damit
    sitzt der Umschlag ohne eine einzige Sonderregel richtig: Vorderseite
    vorn, Ruecken auf dem Ruecken, Rueckseite hinten, alles im richtigen
    Massstab und ohne Stauchung in der Falznut.

    Gelaufen wird von der Vorderkante des Vorderdeckels (u = 1) ueber den
    Ruecken zur Vorderkante des Hinterdeckels (u = 0) — so herum, weil der
    Bogen im Atlas von links nach rechts Rueckseite, Ruecken, Vorderseite
    traegt.
    """
    netz = objekt.data
    if not netz.uv_layers:
        netz.uv_layers.new(name='UVMap')
    schicht = netz.uv_layers.active

    laengen = bogenlaengen(profil)
    gesamt = laengen[-1]
    tabelle = {
        (round(x, 6), round(y, 6)): 1.0 - laengen[i] / gesamt
        for i, (x, y) in enumerate(profil)
    }

    h = DECKEL_HOEHE
    for flaeche in netz.polygons:
        for schleife in flaeche.loop_indices:
            p = netz.vertices[netz.loops[schleife].vertex_index].co
            u = tabelle.get((round(p.x, 6), round(p.y, 6)))
            if u is None:
                u = 0.0 if p.y > 0.0 else 1.0
            schicht.data[schleife].uv = (u, (p.z + h / 2) / h)


def buehne():
    """
    Licht, Kamera, Welt — das Vorbild fuer den Cinematic Hero.

    Die Vorgabe lautet: Dunkelheit, dann wandert Licht ueber das Cover.
    Genau das wird hier aufgebaut — ein streifendes Hauptlicht, das die
    Goldpraegung zum Aufleuchten bringt, eine kalte Gegenaufhellung fuer die
    Nachtblauseite, und ein dunkler Grund. Kein Studio-Weiss.
    """
    welt = bpy.data.worlds.new('Nacht')
    bpy.context.scene.world = welt
    welt.use_nodes = True
    # Die Knoten selbst anlegen statt einen Namen zu erwarten: Eine frisch
    # erzeugte Welt bringt in Blender 5 keinen Knoten "Background" mit, und
    # der Name ist ohnehin sprachabhaengig.
    wn = welt.node_tree.nodes
    wv = welt.node_tree.links
    wn.clear()
    hg = wn.new('ShaderNodeBackground')
    hg.location = (0, 0)
    w_aus = wn.new('ShaderNodeOutputWorld')
    w_aus.location = (240, 0)
    wv.new(hg.outputs['Background'], w_aus.inputs['Surface'])
    # Staerke 14, nicht 1 — gemessen, nicht gewaehlt.
    #
    # Beim ersten Anlauf stand hier 1,0, und der Verlauf war damit wirkungslos:
    # Die Belichtung liegt bei -4,5 Blenden, also Faktor 0,044. Aus dem
    # Horizontband mit 0,058 wurden 0,0026 — im Bild gemessen 0,000 bis 0,004.
    # Das Gold hatte weiterhin nichts zu spiegeln; was es besser aussehen
    # liess, war allein die richtige Reflexionsfarbe.
    #
    # Der Faktor hebt die Umgebung auf dieselbe Ebene wie die Lampen. Matte
    # dunkle Flaechen merken davon fast nichts (Albedo 0,03 mal 0,03 ist
    # nichts), die Folie dagegen spiegelt zu etwa 100 Prozent — genau die
    # Trennung, um die es geht.
    hg.inputs['Strength'].default_value = 14.0

    # --- Die Welt ist ein Verlauf, keine Flaeche ----------------------
    #
    # Vorher stand hier eine einzelne fast schwarze Farbe. Fuer alles Matte
    # macht das keinen Unterschied — fuer die Goldpraegung schon: Metall hat
    # keine eigene Farbe, es zeigt seine Umgebung. Vor einer gleichmaessig
    # schwarzen Umgebung ist gebackenes Metallic dunkelgrau, und der Titel
    # sieht aus wie mit Bronzefarbe gemalt statt wie Folie.
    #
    # Ein Verlauf mit einem etwas helleren Band auf Augenhoehe gibt der Folie
    # eine Kante zum Spiegeln. Der Wert bleibt winzig (0,075 gegen 0,012),
    # die Nacht bleibt Nacht — aber das Gold bekommt einen Verlauf statt
    # eines Tons.
    # Die Blickrichtung, nicht die "Generated"-Koordinate.
    #
    # Gemessen: Mit `TexCoord.Generated` kam an jeder Stelle derselbe Wert
    # heraus — oben, unten und an der Seite exakt 0,044. Der Verlauf war ein
    # Ton. In einem Welt-Shader ist die Groesse, die sich mit der Richtung
    # aendert, `Geometry.Incoming`; das ist der Vektor vom Betrachter in die
    # Szene, und seine Z-Komponente laeuft sauber von -1 (unten) bis +1
    # (oben).
    w_richtung = wn.new('ShaderNodeNewGeometry')
    w_richtung.location = (-800, 0)
    w_trenn = wn.new('ShaderNodeSeparateXYZ')
    w_trenn.location = (-600, 0)
    wv.new(w_richtung.outputs['Incoming'], w_trenn.inputs['Vector'])

    w_kennlinie = wn.new('ShaderNodeMapRange')
    w_kennlinie.location = (-400, 0)
    # Das Band liegt knapp unter der Horizontalen — dorthin, wo ein
    # aufrecht stehendes Buch mit seiner Folie hinschaut.
    #
    # Die Spanne laeuft rueckwaerts, und das ist kein Tippfehler.
    #
    # `Incoming` zeigt von der Flaeche ZUM Betrachter, fuer einen
    # Hintergrundstrahl also entgegen der Blickrichtung. Welches Vorzeichen
    # daraus oben und welches unten wird, war zweimal geraten und zweimal
    # falsch. Gemessen hat es `blender/welt-richtung.py`: Himmel oben rot,
    # unten blau, ein Bild, Antwort eindeutig — bei der Spanne -1 bis +1
    # liegt Fac 0 OBEN. Mit der hier umgekehrten Spanne liegt Fac 0 unten,
    # und damit der warme Bodenanteil dort, wo ein Boden ist.
    #
    # Der sichtbare Bildausschnitt deckt davon nur ein schmales Stueck ab
    # (85 mm sind rund 16 Grad): Das Bild zeigt den Bereich knapp unter dem
    # hellen Band, oben 0,154 und unten 0,098. Das ist kein Fehler, sondern
    # der Ausschnitt.
    w_kennlinie.inputs['From Min'].default_value = 0.55
    w_kennlinie.inputs['From Max'].default_value = -0.40
    wv.new(w_trenn.outputs['Z'], w_kennlinie.inputs['Value'])

    w_band = wn.new('ShaderNodeValToRGB')
    w_band.location = (-200, 0)
    # unten: warmer Rueckwurf vom Boden
    w_band.color_ramp.elements[0].position = 0.0
    w_band.color_ramp.elements[0].color = (0.022, 0.017, 0.012, 1.0)
    # Horizont: das Band, das die Folie einfaengt
    mitte = w_band.color_ramp.elements.new(0.46)
    mitte.color = (0.058, 0.063, 0.078, 1.0)
    # oben: kalte Nacht
    w_band.color_ramp.elements[-1].position = 1.0
    w_band.color_ramp.elements[-1].color = (0.007, 0.010, 0.019, 1.0)
    wv.new(w_kennlinie.outputs['Result'], w_band.inputs['Fac'])
    wv.new(w_band.outputs['Color'], hg.inputs['Color'])

    # Hauptlicht: streifend von links oben, warm. Es laeuft spaeter ueber
    # das Cover — deshalb ein Flaechenlicht, kein Punkt: nur eine Flaeche
    # erzeugt den langen, weichen Glanzstreifen auf der Folie.
    haupt_daten = bpy.data.lights.new('Streiflicht', type='AREA')
    haupt_daten.shape = 'RECTANGLE'
    # Gross und WEIT WEG, nicht klein und nah.
    #
    # Gemessen: Bei 0,8 m Abstand liegt der Helligkeitsabfall ueber die
    # Coverhoehe bei 1,08, bei 2,5 m bei 1,09 — die Naehe war also nicht das
    # Problem, das ich zuerst vermutet hatte. Der Abstand bleibt trotzdem:
    # Eine grosse Quelle weiter weg zeichnet die Goldpraegung als langen
    # weichen Streifen statt als hellen Fleck.
    haupt_daten.size = 1.8
    haupt_daten.size_y = 0.6
    haupt_daten.energy = 405.0
    haupt_daten.color = (1.0, 0.89, 0.72)
    haupt = bpy.data.objects.new('Streiflicht', haupt_daten)
    bpy.context.collection.objects.link(haupt)
    haupt.location = (-1.35, -1.65, 1.35)
    haupt.rotation_euler = (math.radians(52), 0.0, math.radians(-38))

    # Gegenlicht: kalt, schwach, von rechts hinten. Es zieht die Kante des
    # Deckels nach und trennt das Buch vom Grund.
    kante_daten = bpy.data.lights.new('Kantenlicht', type='AREA')
    kante_daten.shape = 'RECTANGLE'
    kante_daten.size = 0.6
    kante_daten.size_y = 0.9
    # 14 W von schraeg hinten haben die ganze Vorderseite mit aufgehellt —
    # der Nachthimmel auf dem Cover wurde milchig. Ein Kantenlicht soll die
    # KANTE zeichnen, nicht die Flaeche. Also schwaecher und weiter hinten.
    kante_daten.energy = 2.6
    kante_daten.color = (0.58, 0.72, 1.0)
    kante = bpy.data.objects.new('Kantenlicht', kante_daten)
    bpy.context.collection.objects.link(kante)
    # Auf die RUECKENSEITE, nicht auf die Schnittseite.
    kante.location = (-0.58, 0.52, 0.26)
    kante.rotation_euler = (math.radians(80), 0.0, math.radians(-146))

    # Aufhellung auf der Schnittseite.
    #
    # Das Hauptlicht kommt von vorne links, damit der Glanzstreifen ueber den
    # Titel wandert. Damit liegt die Schnittseite rechts vollstaendig im
    # Schatten — und zweihundert Blattkanten, die man nicht sieht, sind
    # keine. Seit die Vorderkante offen ist und dort echte Blaetter stehen,
    # ist diese Lampe die wichtigste nach dem Hauptlicht: Sie zeichnet die
    # Fugen zwischen den Blaettern, ohne eine zweite Lichtrichtung zu
    # behaupten.
    fuell_daten = bpy.data.lights.new('Schnittaufheller', type='AREA')
    fuell_daten.shape = 'RECTANGLE'
    fuell_daten.size = 0.20
    fuell_daten.size_y = 0.42
    # Gemessen, nicht geschaetzt: Bei 3,4 W kam der Schnitt im Standbild auf
    # eine Spitzenhelligkeit von 0,34 gegen 0,25 im Mittel auf dem Umschlag.
    # Papier mit einem Rueckstrahlwert von 0,88 neben fast schwarzem Leinen
    # darf nicht gleich hell sein — sonst sieht man die Blaetter nur, wenn
    # man weiss, dass sie da sind.
    fuell_daten.energy = 7.5
    fuell_daten.color = (1.0, 0.93, 0.83)
    fuell = bpy.data.objects.new('Schnittaufheller', fuell_daten)
    bpy.context.collection.objects.link(fuell)
    fuell.location = (0.46, -0.20, 0.06)
    fuell.rotation_euler = (math.radians(90), 0.0, math.radians(74))

    # Streuwinkel begrenzen — das Gegenstueck zur Wabe vor der Softbox.
    # Massvoll: Ein enger Streuwinkel buendelt und macht damit HELLER. Mit 24
    # Grad war das Cover ausgebrannt.
    haupt_daten.spread = math.radians(72)
    fuell_daten.spread = math.radians(60)
    kante_daten.spread = math.radians(66)

    # Keine der Lampen darf selbst im Bild auftauchen.
    for objekt in (haupt, kante, fuell):
        objekt.visible_camera = False

    # Der Boden — als SCHATTENFAENGER, nicht als Flaeche.
    #
    # Zwei Anlaeufe mit einer normal gerenderten Platte sind gescheitert:
    # erst ein graues Studiotuch, dann ein harter heller Keil quer durchs
    # Bild. Ein Schattenfaenger ist unsichtbar und traegt nur den Schatten
    # bei, den das Buch auf ihn wirft.
    boden_netz = bpy.data.meshes.new('Boden')
    boden = bpy.data.objects.new('Boden', boden_netz)
    bpy.context.collection.objects.link(boden)
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=3.0)
    bm.to_mesh(boden_netz)
    bm.free()
    boden.location = (0.0, 0.0, -DECKEL_HOEHE / 2)
    boden.is_shadow_catcher = True

    return haupt, kante, fuell, boden


def kamera():
    """
    Eine Kamera in Brennweiten, nicht in Oeffnungswinkeln.

    85 mm staucht die Tiefe und laesst das Buch als Objekt stehen statt als
    perspektivisch verzogenen Keil. Die leichte Blende gibt Tiefenschaerfe,
    damit die Vorderkante scharf ist und der Ruecken weich ausblendet.
    """
    daten = bpy.data.cameras.new('Kamera')
    daten.lens = 85.0
    daten.sensor_width = 36.0
    daten.dof.use_dof = True
    daten.dof.aperture_fstop = 4.0

    objekt = bpy.data.objects.new('Kamera', daten)
    bpy.context.collection.objects.link(objekt)
    bpy.context.scene.camera = objekt

    # Abstand aus der Brennweite gerechnet, nicht geraten.
    objekt.location = (0.46, -1.10, 0.34)

    ziel = bpy.data.objects.new('Blickpunkt', None)
    bpy.context.collection.objects.link(ziel)
    ziel.location = (0.0, 0.0, 0.01)
    folgen = objekt.constraints.new('TRACK_TO')
    folgen.target = ziel
    folgen.track_axis = 'TRACK_NEGATIVE_Z'
    folgen.up_axis = 'UP_Y'
    daten.dof.focus_object = ziel

    return objekt


def renderer_einstellen():
    """Cycles auf der Grafikkarte. OptiX, wenn vorhanden."""
    szene = bpy.context.scene
    szene.render.engine = 'CYCLES'
    szene.cycles.device = 'GPU'
    szene.cycles.samples = 128
    szene.cycles.use_denoising = True

    # Lichtwege hoch genug fuer indirektes Licht.
    #
    # Die Voreinstellung deckelt Glossy bei 4 und Diffuse bei 4. Auf einer
    # Goldflaeche, die eine Papierflaeche spiegelt, die wiederum den Deckel
    # spiegelt, ist das genau ein Sprung zu wenig — die Folie wird an der
    # Schnittseite zu dunkel. Richtwerte fuer eine Endfassung: gesamt 12,
    # diffus und glaenzend je 6.
    szene.cycles.max_bounces = 12
    szene.cycles.diffuse_bounces = 6
    szene.cycles.glossy_bounces = 6
    szene.cycles.transmission_bounces = 12
    # Kein Clamping auf indirektem Licht: Es waescht genau die Reflexe weg,
    # wegen derer die Umgebung ueberhaupt aufgebaut wurde. Rauschen nimmt
    # stattdessen der Denoiser.
    szene.cycles.sample_clamp_indirect = 0.0

    vor = bpy.context.preferences.addons.get('cycles')
    if vor:
        cp = vor.preferences
        for art in ('OPTIX', 'CUDA'):
            try:
                cp.compute_device_type = art
                cp.get_devices()
                if any(d.type == art for d in cp.devices):
                    for d in cp.devices:
                        d.use = (d.type == art)
                    break
            except Exception:
                continue

    szene.view_settings.view_transform = 'AgX'
    for kennlinie in ('AgX - Medium High Contrast', 'AgX - Base Contrast', 'None'):
        try:
            szene.view_settings.look = kennlinie
            break
        except TypeError:
            continue
    # Belichtung abgetastet, nicht geraten: Erst bei -4,5 liegt der
    # Nachthimmel bei rund 0,18 und die Coverflaeche bei 0,30.
    szene.view_settings.exposure = -4.5

    szene.render.resolution_x = 1600
    szene.render.resolution_y = 1000
    szene.render.film_transparent = False


def bauen(blaetter=BLAETTER_STANDARD, atlas_hoehe=1797):
    """
    Alles zusammensetzen. Gibt die angelegten Objekte zurueck.

    `blaetter` ist der Regler fuer die Ausbaustufe: Der Schnitt ist jetzt
    Geometrie, und Geometrie laesst sich nicht ausduennen, ohne die Blaetter
    zu verlieren. Statt hinterher zu reduzieren, wird von vornherein mit
    weniger Blaettern gebaut.
    """
    aufraeumen()

    block = buchblock(blaetter)
    block.data.materials.append(material_papier())

    band = kapitalband(streifen=max(4, round(BLOCK_TIEFE / 0.001)))
    for mat in materialien_kapitalband():
        band.data.materials.append(mat)

    deckel, profil = einband_bauen()
    uv_fuer_einband(deckel, profil)
    atlas = umschlag_atlas(profil, hoehe=atlas_hoehe)
    deckel.data.materials.append(material_umschlag(atlas))

    # Nur der Einband wird geglaettet. Der Buchblock bleibt flach
    # schattiert: Papier knickt, es rundet nicht — weiche Blattkanten
    # verschmieren sofort zu einem Wulst.
    #
    # (`use_auto_smooth` gibt es seit Blender 4.1 nicht mehr; die Kantenlogik
    #  liegt jetzt in Modifiern und Attributen.)
    for p in deckel.data.polygons:
        p.use_smooth = True
    for p in block.data.polygons:
        p.use_smooth = False
    # Das Kapitalband ist gewebt und rund — es wird geglaettet, sonst sieht
    # man bei zehn Segmenten die Kanten des Zylinders.
    for p in band.data.polygons:
        p.use_smooth = True

    buehne()
    kam = kamera()
    renderer_einstellen()

    return {'block': block, 'deckel': deckel, 'band': band,
            'kamera': kam, 'atlas': atlas}


if __name__ == '__main__':
    teile = bauen()
    print('Gebaut:', ', '.join(sorted(teile)))
