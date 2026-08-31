/**
 * Schreibt die .htaccess für den eigenen Webspace.
 *
 * GitHub Pages braucht so etwas nicht – dort regelt die Plattform 404-Seiten
 * und Zwischenspeicher. Auf einem Apache muss beides gesagt werden, sonst
 * liefert der Server bei einer falschen Adresse seine eigene Fehlerseite und
 * lädt bei jedem Besuch alle Schriften und Bilder neu.
 *
 * Seit dem 27.08.2026 steht hier auch die Umleitung auf eine einzige Adresse.
 * Vorher antwortete die Seite unter vier Adressen mit 200: mit und ohne www,
 * mit und ohne HTTPS. Für eine Suchmaschine sind das vier Kopien jeder Seite,
 * die sich gegenseitig die Kraft nehmen.
 *
 * Die frühere Vorsicht („Umleitungen gehören zum Anbieter, nicht in eine Datei,
 * die eine Schleife bauen kann") bleibt berechtigt – deshalb prüft die Regel
 * zwei Merkmale statt einem: `HTTPS=on` und `X-Forwarded-Proto`. Erst wenn
 * beide nein sagen, wird umgeleitet. Und die Veröffentlichung ruft danach die
 * Seite selbst ab; kommt nicht der neue Stand zurück, endet sie rot.
 *
 *   SEITEN_DOMAIN=www.trendonix-buecher.de node scripts/htaccess.mjs
 */
import { writeFileSync } from 'node:fs';

const DOMAIN = process.env.SEITEN_DOMAIN || 'www.trendonix-buecher.de';
const OHNE_WWW = DOMAIN.replace(/^www\./, '');

const inhalt = `# Erzeugt von scripts/htaccess.mjs – nicht von Hand ändern.
#
# Nur Anweisungen, die in einer .htaccess erlaubt sind.
#
# Der erste Entwurf enthielt <LocationMatch>. Das ist ausschließlich in der
# Serverkonfiguration zulässig; in einer .htaccess beantwortet Apache damit
# jede Anfrage mit 500. Die Seite war dadurch nicht kaputt – sie war weg.
# Dasselbe gilt für Options, wenn der Anbieter es nicht freigegeben hat;
# deshalb steht es hier gar nicht erst.

# Eine Adresse, nicht vier.
#
# https://www.<domain> ist die richtige. Alles andere – ohne www, ohne
# Verschlüsselung – wird dauerhaft (301) dorthin geschickt. Zwei Bedingungen
# vor der ersten Regel, damit keine Schleife entsteht, wenn die
# Verschlüsselung vor dem Server endet.
<IfModule mod_rewrite.c>
RewriteEngine On

RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^ https://${DOMAIN}%{REQUEST_URI} [R=301,L]

RewriteCond %{HTTP_HOST} !^${DOMAIN.replace(/\./g, '\\.')}$ [NC]
RewriteRule ^ https://${DOMAIN}%{REQUEST_URI} [R=301,L]
</IfModule>

# Die eigene Startseite zuerst.
#
# Auf dem Webspace lag eine Platzhalterseite als index.htm. Apache nimmt, was
# in DirectoryIndex zuerst steht – und das war die Platzhalterdatei. Die
# hochgeladene Seite lag daneben und wurde nie ausgeliefert.
DirectoryIndex index.html index.htm index.php

# Die eigene Fehlerseite statt der des Servers.
ErrorDocument 404 /404.html

# Der Zaehler darf nie aus dem Zwischenspeicher kommen.
#
# Weiter unten steht ExpiresDefault "access plus 1 hour". Das gilt auch fuer
# das, was z.php ausliefert - und mod_expires ueberschreibt dabei die
# Kopfzeilen, die das Skript selbst setzt. Der Browser holte das Pixel dann
# einmal und eine Stunde lang nicht wieder: Die Seite waere besucht, der
# Zaehler stuende still. Dasselbe fuer zahl.php, sonst zeigt die Fussleiste
# eine Zahl von vorgestern.
<FilesMatch "\\.php$">
  <IfModule mod_expires.c>
    ExpiresActive Off
  </IfModule>
  <IfModule mod_headers.c>
    Header always set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
  </IfModule>
</FilesMatch>

# Die Zaehldatei geht niemanden etwas an.
#
# Sie liegt im Dokumentenstamm, also waere sie ohne diese Regel unter
# https://<domain>/besuche.csv abrufbar. Es steht nichts Persoenliches darin -
# keine IP, keine Kennung -, aber wer wie viel Zulauf hat, ist trotzdem eine
# Geschaeftszahl und keine Auskunft fuer jedermann.
<Files "besuche.csv">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</Files>

# Next legt seine Bausteine unter Namen ab, die sich mit dem Inhalt ändern.
# Sie dürfen deshalb lange im Zwischenspeicher bleiben; die Seite selbst nie,
# sonst sieht niemand die neue Fassung nach einer Veröffentlichung.
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(avif|webp|jpg|jpeg|png|mp4|woff2|css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

# ── Kopfzeilen, die nichts kosten und einiges verhindern ──────────────────
#
# Bis zum 31.08.2026 schickte der Server keine einzige davon. Für eine
# Buchseite ohne Anmeldung ist das kein akutes Risiko — aber es sind vier
# Zeilen, und jede schließt eine Tür, die sonst offen steht.
#
# Strict-Transport-Security ist der Unterschied zwischen „die Verbindung ist
# verschlüsselt" und „sie kann gar nicht anders". Ohne sie genügt ein Klick auf
# http://…, um den ersten Aufruf unverschlüsselt zu machen; danach greift zwar
# die Umleitung, aber der erste ist gelaufen.
#
# Ohne includeSubDomains und ohne preload: Beides ist auf ein Jahr
# bindend und lässt sich nicht zurücknehmen: Wer später eine Unterdomain ohne
# Zertifikat braucht, kommt nicht mehr an sie heran. Für die Hauptdomain reicht
# die Zeile so, wie sie hier steht.
#
# Keine Content-Security-Policy: Sie müsste die Bausteine von Next.js und den
# bedingt geladenen Analysedienst treffen, und eine zu enge Regel macht die
# Seite weiß statt sicher. Eine falsche CSP ist schlechter als keine — sie
# gehört gemessen eingeführt, nicht nebenbei.
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000"
  # Kein Ratespiel über Dateitypen: Was als Bild ausgeliefert wird, darf der
  # Browser nicht als Skript ausführen.
  Header always set X-Content-Type-Options "nosniff"
  # Beim Klick nach außen geht die Domain mit, aber nicht der Pfad.
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  # Die Seite braucht weder Standort noch Mikrofon noch Kamera. Was sie nicht
  # braucht, soll sie auch nicht anfragen dürfen.
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
  # Die Seite gehört nicht in einen fremden Rahmen — so wird aus ihr keine
  # Kulisse für einen fremden Knopf.
  Header always set X-Frame-Options "SAMEORIGIN"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
  AddOutputFilterByType DEFLATE application/json image/svg+xml text/plain
</IfModule>

# AVIF und WebP kennt nicht jeder Apache von Haus aus.
<IfModule mod_mime.c>
  AddType image/avif .avif
  AddType image/webp .webp
  AddType font/woff2 .woff2
</IfModule>
`;

writeFileSync('out/.htaccess', inhalt);
console.log('out/.htaccess geschrieben.');
