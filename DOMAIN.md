# Die Domain

Die Seite lief bisher unter `https://manuelbrandner85.github.io/Buch-landingpage-/`.
Unter einer eigenen Domain liegt sie in der Wurzel statt in einem Unterordner —
technisch ist das eine Variable, organisatorisch sind es vier Schritte.

## Was zu registrieren ist

Gewünscht: **`www.trendonix-bücher.de`**.

Der Umlaut ist erlaubt, aber er ist nie die einzige Adresse, unter der eine Seite
stehen sollte: In der Zwischenablage, in E-Mail-Programmen und in älteren
Eingabefeldern wird `ü` zu `xn--`-Kauderwelsch, und wer den Namen am Telefon
weitergibt, muss den Umlaut erklären. Deshalb:

| Domain | Rolle |
| --- | --- |
| `trendonix-buecher.de` | die eigentliche Adresse — überall verlinkt, in Bio und Impressum |
| `trendonix-bücher.de` | zusätzlich registriert, leitet dauerhaft auf die obere weiter |

Beide beim selben Registrar, damit die Weiterleitung dort in zwei Minuten
eingerichtet ist. Punycode-Form der Umlautvariante:
`xn--trendonix-bcher-9vb.de` — so und nicht anders wird sie überall eingetragen,
wo keine Umlaute erlaubt sind.

Stand der Prüfung am 25.08.2026: Beide Namen lösten nicht auf, sahen also frei
aus. Das ist ein Indiz, kein Beweis — verbindlich ist erst die Auskunft des
Registrars.

## Was einzustellen ist

**1. DNS beim Registrar** (für `trendonix-buecher.de`):

```
@     A      185.199.108.153
@     A      185.199.109.153
@     A      185.199.110.153
@     A      185.199.111.153
@     AAAA   2606:50c0:8000::153
@     AAAA   2606:50c0:8001::153
@     AAAA   2606:50c0:8002::153
@     AAAA   2606:50c0:8003::153
www   CNAME  manuelbrandner85.github.io.
```

**2. GitHub**: Settings → Pages → Custom domain → `www.trendonix-buecher.de`,
danach „Enforce HTTPS“ ankreuzen, sobald das Zertifikat ausgestellt ist (das
dauert nach dem Eintragen bis zu einer Stunde).

**3. Diese Anwendung**: Settings → Secrets and variables → Actions → Variables →
`SEITEN_DOMAIN` = `www.trendonix-buecher.de`. Damit fällt der Basispfad weg, alle
Links und Bildpfade rücken in die Wurzel, und der Bau legt die Datei `CNAME` in
die Veröffentlichung. Ohne diese Variable bleibt alles wie bisher — die
Umstellung ist also jederzeit zurücknehmbar.

**4. Nachziehen**: Link in der TikTok-Bio, Instagram, Facebook, Pinterest und im
Impressum. Die alte github.io-Adresse bleibt erreichbar und leitet weiter.

## Warum eine Domain für alle Reihen

Eine Domain pro Buch teilt die Bekanntheit auf und lässt jedes neue Buch bei null
anfangen. Deshalb steht hier das Haus in der Wurzel, und jede Reihe bekommt einen
Weg darunter:

```
/                      Trendonix — das aktuelle Buch, die Welten, das Regal
/faeden/               Die unsichtbaren Fäden, begehbar
/faeden/kapitel/7/     ein Kapitel als Leseseite
/buch/band-1/          die Buchseite für Suchmaschinen und zum Weiterschicken
```

Eine zweite Reihe ist damit `/<name>/` und erbt alles: Kopfzeile, Kinoebene,
Weltenwahl, Sitemap. Anzulegen ist eine Datei unter `src/data/`, einzuhängen ist
sie in `src/world/registry.ts` — sonst nirgends.
