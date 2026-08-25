/**
 * Schreibt die .htaccess für den eigenen Webspace.
 *
 * GitHub Pages braucht so etwas nicht – dort regelt die Plattform 404-Seiten
 * und Zwischenspeicher. Auf einem Apache muss beides gesagt werden, sonst
 * liefert der Server bei einer falschen Adresse seine eigene Fehlerseite und
 * lädt bei jedem Besuch alle Schriften und Bilder neu.
 *
 * Bewusst ohne Umleitungen: Ob die Seite unter www und über HTTPS erreichbar
 * ist, gehört in die Domainverwaltung des Anbieters und nicht in eine Datei,
 * die niemand mehr findet, wenn sie einmal eine Schleife baut.
 *
 *   node scripts/htaccess.mjs
 */
import { writeFileSync } from 'node:fs';

const inhalt = `# Erzeugt von scripts/htaccess.mjs – nicht von Hand ändern.
#
# Nur Anweisungen, die in einer .htaccess erlaubt sind.
#
# Der erste Entwurf enthielt <LocationMatch>. Das ist ausschließlich in der
# Serverkonfiguration zulässig; in einer .htaccess beantwortet Apache damit
# jede Anfrage mit 500. Die Seite war dadurch nicht kaputt – sie war weg.
# Dasselbe gilt für Options, wenn der Anbieter es nicht freigegeben hat;
# deshalb steht es hier gar nicht erst.

# Die eigene Startseite zuerst.
#
# Auf dem Webspace lag eine Platzhalterseite als index.htm. Apache nimmt, was
# in DirectoryIndex zuerst steht – und das war die Platzhalterdatei. Die
# hochgeladene Seite lag daneben und wurde nie ausgeliefert.
DirectoryIndex index.html index.htm index.php

# Die eigene Fehlerseite statt der des Servers.
ErrorDocument 404 /404.html

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
