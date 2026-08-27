/**
 * Der Dienst im Hintergrund.
 *
 * Zwei Aufgaben, mehr nicht: Die Hülle der App (Seite, Schriften, Icons) liegt
 * im Zwischenspeicher, damit sie ohne Netz startet. Die Daten dagegen werden
 * immer zuerst aus dem Netz geholt - eine Kennzahl von gestern, die aussieht
 * wie von heute, ist schlimmer als gar keine. Erst wenn das Netz schweigt,
 * kommt die letzte bekannte Fassung aus dem Speicher, und die App schreibt
 * sichtbar dazu, von wann sie ist.
 */
const LAGER = 'trendonix-cockpit-v1';
const HUELLE = ['./', './index.html', './app.webmanifest', './icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(LAGER).then((c) => c.addAll(HUELLE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((n) => Promise.all(n.filter((x) => x !== LAGER).map((x) => caches.delete(x))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const adresse = new URL(e.request.url);
  if (adresse.origin !== location.origin) return;

  // Daten: Netz zuerst, Speicher als Rückfall.
  if (adresse.pathname.endsWith('cockpit.json')) {
    e.respondWith(
      fetch(e.request)
        .then((antwort) => {
          const kopie = antwort.clone();
          caches.open(LAGER).then((c) => c.put(e.request, kopie));
          return antwort;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Hülle: Speicher zuerst, damit die App sofort dasteht.
  e.respondWith(caches.match(e.request).then((t) => t || fetch(e.request)));
});
