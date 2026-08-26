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
| `FTP_LOESCHEN` | `nein` – schaltet das Aufräumen ab (siehe unten). Ohne die Variable wird aufgeräumt |

### Das Zielverzeichnis findet der Bau selbst

Zweimal lief der Upload fehlerfrei durch und war trotzdem unsichtbar: Der
FTP-Zugang landet woanders als der Dokumentenstamm der Domain. **Ein grüner
Haken beim Hochladen sagt nur, dass die Dateien angekommen sind – nicht, dass
sie am richtigen Ort liegen.**

Deshalb wird das Ziel nicht mehr geraten, sondern nachgewiesen: Der Auftrag legt
eine winzige Datei mit einer einmaligen Kennung in jedes in Frage kommende
Verzeichnis und ruft sie über die Domain wieder ab. Wo sie auftaucht, ist der
Dokumentenstamm. Erst dann wird die Seite dorthin gespiegelt.

Geprüft werden der Reihe nach `/`, `/<domain>`, `/htdocs`,
`/htdocs/<domain>`, `/<konto>/<domain>` und `/www/htdocs/<konto>/<domain>`. Die
Wurzel steht zuerst, weil der FTP-Nutzer bei diesem Anbieter auf den
Dokumentenstamm der Domain festgelegt ist (*FTP-Nutzer → Pfad*, hier
`/trendonix-buecher.de/`); von der Verbindung aus gesehen ist der
Dokumentenstamm damit schlicht `/`. Wer den Weg kennt, kann ihn über die
Variable `FTP_ZIEL` oder hinten am Zugang vorgeben; dann wird nur dieser eine
geprüft.

Die Sonde ist ein Nachweis, keine Sperre. Eine fehlerhafte `.htaccess` im
Dokumentenstamm beantwortet jede Anfrage mit 500 – auch die nach der Sonde.
Dann bestätigt kein Kandidat, und ausgerechnet die Veröffentlichung, die den
Fehler behebt, käme nie durch: eine Sackgasse, aus der man sich nicht
herausveröffentlichen kann. Bestätigt keiner, wird deshalb der erste
beschreibbare Ordner genommen und gewarnt; das letzte Wort hat die Abfrage der
fertigen Seite.

Und danach fragt der Bau die Seite selbst ab – Startseite, `robots.txt`, eine
Bandwelt, eine Buchseite. Kommt dort nicht die neue Seite zurück, endet der
Auftrag rot. Lieber ein rotes Kreuz mit Grund als ein grüner Haken ohne Wirkung.

### Aufgeräumt wird von selbst

Ein Upload, der nur hinzufügt, sammelt an: das umbenannte Kapitel, das
ersetzte Bild, der ganze Ordner aus einem alten Bau. Nach einem halben Jahr
liegt auf dem Webspace mehr Vergangenheit als Gegenwart, und niemand weiß mehr,
was davon noch ausgeliefert wird.

Deshalb spiegelt der Upload wirklich: Was im Zielverzeichnis liegt und nicht
mehr zum Bau gehört, wird beim Hochladen entfernt. Drei Sicherungen hängen
daran:

- **Nur im nachgewiesenen Ziel.** Hat die Sonde den Dokumentenstamm nicht
  bestätigt, sondern wurde nur geraten, wird nichts gelöscht – dann wird
  hinzugefügt und gewarnt. Ein falsch geratenes Ziel mit `--delete` wäre der
  teuerste Fehler, den dieser Auftrag machen kann.
- **Was dem Server gehört, bleibt.** `.well-known` (dort liegen die
  Bescheinigungen für das Schloss in der Adresszeile), `cgi-bin`, `logs`,
  `stats`, `error_docs`, `.ftpquota`.
- **Abschaltbar.** Variable `FTP_LOESCHEN` auf `nein`, und es wird wieder nur
  hinzugefügt.

### Die Altlasten im Anmeldeverzeichnis

Die zwei Uploads, die danebengingen, liegen noch im Anmeldeverzeichnis über dem
Dokumentenstamm – rund 185 MB. Dort wird nichts gelöscht: In dieser Wurzel
liegen auch die anderen Ordner des Kontos, und ein Vertipper ist da nicht
zurückzuholen.

Stattdessen räumt der Auftrag beiseite. Was in der Wurzel Zeichen für Zeichen
so heißt wie etwas aus diesem Bau (`index.html`, `_next`, `buch`, `welt` …),
wandert nach `/_altlasten-<nummer>/` – **verschoben, nicht gelöscht**. In der
Zusammenfassung des Laufs steht, was wohin gewandert ist. Steht die Seite
danach, kann der Ordner im WebFTP mit einem Klick weg; das ist der einzige
Schritt, der von Hand bleibt. Beim nächsten Lauf findet der Schritt nichts mehr
und tut nichts.

### Die Platzhalterdatei

Auf dem Webspace lag eine Platzhalterseite als `index.htm`. Apache liefert aus,
was in `DirectoryIndex` zuerst steht – und das war die Platzhalterdatei. Die
hochgeladene `index.html` lag daneben und wurde nie ausgeliefert. Die
mitgelieferte `.htaccess` stellt `index.html` deshalb an die erste Stelle.

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
