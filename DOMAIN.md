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

### Einmalig im Repository

Settings → Secrets and variables → Actions:

**Variables**

| Name | Wert |
| --- | --- |
| `SEITEN_DOMAIN` | `www.trendonix-buecher.de` |
| `FTP_SERVER` | die Serveradresse aus der Anbieterverwaltung (`…kasserver.com`) |
| `FTP_BENUTZER` | der FTP-Benutzername aus „Manuelle Einrichtung“ |
| `FTP_ZIEL` | nur setzen, wenn das Ziel **nicht** `/` ist |
| `FTP_LOESCHEN` | `ja` — **nur**, wenn im Zielverzeichnis ausschließlich diese Seite liegt |

**Secrets**

| Name | Wert |
| --- | --- |
| `FTP_PASSWORT` | das FTP-Kennwort |

Server, Benutzer und Kennwort stehen absichtlich **nicht** im Repository: Es ist
öffentlich, und eine dort veröffentlichte FTP-Kennung ist eine Einladung.

Fehlt `FTP_SERVER`, läuft der Auftrag `webspace` gar nicht erst an — dann bleibt
alles beim Alten.

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
