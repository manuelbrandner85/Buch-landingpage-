# Die Domain

Die Seite lief bisher unter `https://manuelbrandner85.github.io/Buch-landingpage-/`.
Unter einer eigenen Domain liegt sie in der Wurzel statt in einem Unterordner —
technisch ist das eine Variable, organisatorisch sind es vier Schritte.

## Was registriert ist

**`trendonix-buecher.de`** — registriert, beim Anbieter ALL-INKL, und dort liegt
auch das Postfach `Info@trendonix-buecher.de`. Verlinkt und im Impressum genannt
wird die Schreibweise mit `ue`; sie überlebt Zwischenablage, E-Mail-Programme
und das Diktieren am Telefon.

Die Adresse der Seite ist **`www.trendonix-buecher.de`**.

## Was einzustellen ist

Die Domain **`trendonix-buecher.de` ist registriert** und liegt beim Anbieter
ALL-INKL; dort liegt auch das Postfach `Info@trendonix-buecher.de`. Sie zeigt
also nicht auf GitHub Pages, sondern auf den eigenen Webspace.

Deshalb wird die Domain **nicht umgehängt**, sondern beliefert: Der Bau lädt die
fertige Seite per FTP auf den Webspace. Am Mailversand ändert sich dadurch
nichts — MX-Einträge bleiben unberührt —, und ein Push auf `main` erneuert die
Seite genauso wie bisher.

### Einmalig im Repository: ein Eintrag

Settings → Secrets and variables → Actions → **New repository secret**

| Name | Wert |
| --- | --- |
| `FTP_ZUGANG` | `benutzer:kennwort@server` |

Also zum Beispiel `f018ae3e:MEINKENNWORT@w021fb9a.kasserver.com`. Liegt die
Seite nicht im Wurzelverzeichnis des FTP-Zugangs, kommt das Verzeichnis hinten
dran: `…@server/unterordner`.

Benutzer und Server stehen absichtlich **mit im Secret** und nicht offen als
Variablen: Das Repository ist öffentlich, und eine dort veröffentlichte
FTP-Kennung ist eine Einladung. Im Secret maskiert GitHub alle drei Teile in
den Protokollen.

Ein Klammeraffe oder ein Schrägstrich im Kennwort ist kein Problem – der
Benutzer wird vor dem ersten Doppelpunkt abgeschnitten, der Server hinter dem
letzten Klammeraffen.

Ohne das Secret bricht nichts: Der Auftrag `webspace` steigt nach wenigen
Sekunden mit einem Hinweis wieder aus, und die Seite bleibt auf github.io.

Zwei Dinge sind freiwillig, beide als **Variables**:

| Name | Wirkung |
| --- | --- |
| `SEITEN_DOMAIN` | andere Adresse als `www.trendonix-buecher.de` |
| `FTP_ZIEL` | anderer Zielordner als `/trendonix-buecher.de` |
| `FTP_LOESCHEN` | `ja` – räumt im Zielverzeichnis auf. **Nur** setzen, wenn dort ausschließlich diese Seite liegt |

### Das Zielverzeichnis

Der FTP-Zugang landet im Wurzelverzeichnis des Webspace – der Dokumentenstamm
der Domain liegt eine Ebene tiefer. In der Anbieterverwaltung steht er unter
*Domain → Stammverzeichnis*, hier `/www/htdocs/w021fb9a/trendonix-buecher.de/`;
vom FTP-Zugang aus gesehen ist das `/trendonix-buecher.de`. Genau das ist die
Vorgabe im Auftrag.

Das ist der Fehler, der beim ersten Mal passiert ist: Der Upload lief
fehlerfrei durch und war trotzdem unsichtbar – 185 MB neben der Tür. Ein
grüner Haken beim Hochladen heißt nur, dass die Dateien angekommen sind, nicht
dass sie am richtigen Ort liegen. Deshalb wird nach jeder Veröffentlichung die
Startseite selbst abgerufen.

### Einmalig beim Anbieter

- Die Domain auf das Verzeichnis zeigen lassen, in das hochgeladen wird
  (in der Anbieterverwaltung: Domain → Dokumentenstamm).
- SSL-Zertifikat für `trendonix-buecher.de` **und** `www.trendonix-buecher.de`
  ausstellen lassen; beides ist bei ALL-INKL kostenlos.
- Weiterleitung von `trendonix-buecher.de` auf `www.trendonix-buecher.de` und
  von HTTP auf HTTPS dort einschalten. Absichtlich nicht in der `.htaccess`:
  Eine Umleitungsschleife in einer Datei, die niemand mehr findet, nimmt die
  Seite vom Netz.

### Was der Bau mitschickt

`scripts/htaccess.mjs` legt eine `.htaccess` bei: eigene 404-Seite,
Zwischenspeicher-Regeln (Bilder und Videos ein Jahr, HTML nie), Komprimierung,
die Dateitypen `avif`, `webp` und `woff2`, und keine Verzeichnislisten.

### Der Spiegel auf github.io

`https://manuelbrandner85.github.io/Buch-landingpage-/` wird weiter gebaut, aber
sobald `SEITEN_DOMAIN` gesetzt ist, sperrt er sich selbst für Suchmaschinen aus
(`robots.txt` und `noindex`). Zwei Adressen mit demselben Text schaden beiden.
Der Spiegel bleibt nützlich: Er zeigt sofort, ob ein Bau durchgelaufen ist, auch
wenn der FTP-Upload klemmt.

## Die Umlautvariante


`trendonix-bücher.de` (Punycode `xn--trendonix-bcher-9vb.de`) ist Stand
25.08.2026 **nicht** registriert und löst nicht auf. Wer den Umlaut zusätzlich
sichern will, registriert ihn beim selben Anbieter und richtet dort eine
dauerhafte Weiterleitung auf `www.trendonix-buecher.de` ein. Verlinkt wird
weiterhin nur die Schreibweise mit `ue`: Sie überlebt Zwischenablage,
E-Mail-Programme und das Diktieren am Telefon.
