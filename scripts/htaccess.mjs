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

# Die eigene Fehlerseite statt der des Servers.
ErrorDocument 404 /404.html

# Next legt seine Bausteine unter Namen ab, die sich mit dem Inhalt ändern.
# Sie dürfen deshalb lange im Zwischenspeicher bleiben; alles andere kurz.
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
  <FilesMatch "\\.(avif|webp|jpg|jpeg|png|mp4|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <LocationMatch "^/_next/static/">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </LocationMatch>
  # Die Seite selbst soll nie aus dem Zwischenspeicher kommen, sonst sieht
  # niemand die neue Fassung nach einer Veröffentlichung.
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

# Verzeichnisse zeigen ihren Inhalt nicht.
Options -Indexes
`;

writeFileSync('out/.htaccess', inhalt);
console.log('out/.htaccess geschrieben.');
