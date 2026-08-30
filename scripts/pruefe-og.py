# -*- coding: utf-8 -*-
import os, re
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "out")
mit, ohne_indexierbar = [], []
for w, _, ds in os.walk(OUT):
    for d in ds:
        if not d.endswith(".html"):
            continue
        p = os.path.join(w, d)
        t = open(p, encoding="utf-8", errors="replace").read()
        weg = p.replace(OUT, "").replace("\\index.html", "/").replace("\\", "/")
        hat = 'property="og:image"' in t
        noindex = "noindex" in t
        if hat:
            mit.append(weg)
        elif not noindex:
            ohne_indexierbar.append(weg)
print("MIT og:image:", len(mit))
for m in sorted(mit):
    print("   ", m)
print("\nOHNE og:image, aber indexierbar:", len(ohne_indexierbar))
for o in sorted(ohne_indexierbar)[:30]:
    print("   ", o)
