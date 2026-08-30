# Prueft nach dem Bau: Vorschaubild je Seite, Feed vorhanden, Zaehler im Kopf weg.
import os, re, sys
sys.stdout.reconfigure(encoding="utf-8")
wurzel = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(wurzel, "out")

feed = os.path.join(out, "feed.xml")
print("feed.xml:", "da, %d Bytes" % os.path.getsize(feed) if os.path.isfile(feed) else "FEHLT")
if os.path.isdir(os.path.join(out, "feed.xml")):
    print("  ACHTUNG: feed.xml ist ein Ordner:", os.listdir(os.path.join(out, "feed.xml")))

ohne, mit, noindex = [], 0, 0
for ordner, _, dateien in os.walk(out):
    for d in dateien:
        if not d.endswith(".html"):
            continue
        p = os.path.join(ordner, d)
        t = open(p, encoding="utf-8", errors="ignore").read()
        rel = os.path.relpath(p, out).replace("\\", "/")
        if 'name="robots" content="noindex' in t:
            noindex += 1
            continue
        if 'property="og:image"' in t:
            mit += 1
        else:
            ohne.append(rel)
print("Seiten mit og:image:", mit)
print("Seiten ohne og:image:", len(ohne))
for r in ohne[:20]:
    print("   ohne:", r)
print("noindex-Seiten (nicht gewertet):", noindex)

start = os.path.join(out, "index.html")
s = open(start, encoding="utf-8", errors="ignore").read()
print("hauszaehler auf der Startseite:", "noch da" if "hauszaehler" in s else "weg")
print("Feed im Kopf verlinkt:", "ja" if "application/atom+xml" in s else "NEIN")
print("Signalrot c41e1a irgendwo:", "ja" if "c41e1a" in s else "nein")

kap = os.path.join(out, "faeden", "kapitel", "7", "index.html")
if os.path.isfile(kap):
    k = open(kap, encoding="utf-8", errors="ignore").read()
    m = re.search(r'og:image"\s+content="([^"]+)"', k)
    print("Kapitel 7 og:image:", m.group(1) if m else "FEHLT")
ort = os.path.join(out, "faeden", "ort", "laetoli", "index.html")
if os.path.isfile(ort):
    o = open(ort, encoding="utf-8", errors="ignore").read()
    m = re.search(r'og:image"\s+content="([^"]+)"', o)
    print("Ort laetoli og:image:", m.group(1) if m else "FEHLT")
