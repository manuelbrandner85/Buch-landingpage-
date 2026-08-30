# -*- coding: utf-8 -*-
import os, re, collections
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out")
gleich, jsonld_typen, ohne = [], collections.Counter(), []
for w, _, ds in os.walk(OUT):
    for d in ds:
        if not d.endswith(".html"):
            continue
        p = os.path.join(w, d)
        t = open(p, encoding="utf-8", errors="replace").read()
        weg = p.replace(OUT, "").replace("\\index.html", "/").replace("\\", "/")
        m = re.search(r"<title[^>]*>(.*?)</title>", t, re.S)
        if m and m.group(1).strip() == "Trendonix – Bücher über das, was zwischen den Dingen liegt.":
            gleich.append(weg)
        for j in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S):
            for typ in re.findall(r'"@type"\s*:\s*"([^"]+)"', j):
                jsonld_typen[typ] += 1
        if "application/ld+json" not in t:
            ohne.append(weg)
print("Seiten mit dem Standardtitel:", len(gleich))
for g in sorted(gleich)[:24]:
    print("   ", g)
print("\nJSON-LD Typen im ganzen Export:")
for k, v in jsonld_typen.most_common():
    print(f"   {k:<22} {v}")
print("\nOhne JSON-LD, Beispiele:")
for o in sorted(ohne)[:18]:
    print("   ", o)
