# -*- coding: utf-8 -*-
"""Liest den fertigen Export und meldet, was fuer Auffindbarkeit,
Geschwindigkeit und Zugaenglichkeit zaehlt. Aendert nichts."""
import os, re, json, collections

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out")

seiten = []
for wurzel, _, dateien in os.walk(OUT):
    for d in dateien:
        if d.endswith(".html"):
            seiten.append(os.path.join(wurzel, d))

titel = collections.Counter()
beschr = collections.Counter()
ohne_beschr, ohne_og, ohne_jsonld, ohne_canonical = [], [], [], []
h1zahl = collections.Counter()

for p in seiten:
    t = open(p, encoding="utf-8", errors="replace").read()
    weg = p.replace(OUT, "").replace("\\index.html", "/").replace("\\", "/")
    m = re.search(r"<title[^>]*>(.*?)</title>", t, re.S)
    titel[(m.group(1).strip() if m else "(kein Titel)")] += 1
    m = re.search(r'<meta name="description" content="([^"]*)"', t)
    if m:
        beschr[m.group(1)[:60]] += 1
    else:
        ohne_beschr.append(weg)
    if 'property="og:image"' not in t:
        ohne_og.append(weg)
    if "application/ld+json" not in t:
        ohne_jsonld.append(weg)
    if 'rel="canonical"' not in t:
        ohne_canonical.append(weg)
    h1zahl[len(re.findall(r"<h1[\s>]", t))] += 1

print("Seiten gesamt:", len(seiten))
print("\n-- doppelte Titel (Top 6) --")
for k, v in titel.most_common(6):
    if v > 1:
        print(f"  {v:>3}x  {k[:90]}")
print("\n-- doppelte Beschreibungen (Top 6) --")
for k, v in beschr.most_common(6):
    if v > 1:
        print(f"  {v:>3}x  {k}")
print("\nohne meta description :", len(ohne_beschr), ohne_beschr[:5])
print("ohne og:image         :", len(ohne_og), ohne_og[:5])
print("ohne JSON-LD          :", len(ohne_jsonld), ohne_jsonld[:5])
print("ohne canonical        :", len(ohne_canonical), ohne_canonical[:5])
print("h1 je Seite           :", dict(h1zahl))

for f in ("sitemap.xml", "robots.txt", "feed.xml", "rss.xml"):
    print(f"{f:<14}", "da" if os.path.exists(os.path.join(OUT, f)) else "FEHLT")

bilder = collections.Counter()
gross = []
for wurzel, _, dateien in os.walk(OUT):
    for d in dateien:
        e = os.path.splitext(d)[1].lower()
        if e in (".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".mp4", ".webm"):
            g = os.path.getsize(os.path.join(wurzel, d))
            bilder[e] += 1
            if g > 400_000 and e in (".jpg", ".jpeg", ".png"):
                gross.append((g, os.path.join(wurzel, d).replace(OUT, "")))
print("\n-- Medien --")
for e, n in bilder.most_common():
    print(f"  {e:<6} {n}")
gross.sort(reverse=True)
print(f"  Bilder ueber 400 KB: {len(gross)}")
for g, w in gross[:8]:
    print(f"    {g/1024:>7.0f} KB  {w}")
