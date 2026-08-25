/**
 * Der Besucherzähler – ohne Cookie, ohne Kennung, ohne Einwilligung.
 *
 * Eine statisch ausgelieferte Seite kann nicht selbst zählen; irgendwo muss
 * ein Zähler stehen. Damit die Datenschutzerklärung wahr bleibt, gilt hier
 * eine Bedingung: Es wird nichts geladen, solange keine Adresse eingetragen
 * ist. Ohne `NEXT_PUBLIC_ZAEHLER` erscheint im Quelltext der Seite kein
 * einziges fremdes Skript – nicht auskommentiert, nicht vorbereitet, gar nicht.
 *
 * Erwartet wird die Zähl-Adresse eines cookiefreien Dienstes, etwa
 * `https://<konto>.goatcounter.com/count`. Solche Dienste setzen keinen
 * Cookie, vergeben keine dauerhafte Kennung und speichern keine IP-Adresse;
 * gezählt wird der Aufruf, nicht der Mensch. Wer das einträgt, ergänzt im
 * Impressum den Absatz zum Zähler – die Vorlage steht dort schon.
 *
 * `defer` statt `async`: Der Zähler darf niemals vor dem Bild da sein.
 */
export function Zaehler() {
  const ziel = process.env.NEXT_PUBLIC_ZAEHLER?.trim();
  if (!ziel) return null;
  return (
    <script
      data-goatcounter={ziel}
      src="//gc.zgo.at/count.js"
      defer
    />
  );
}

/** Läuft überhaupt ein Zähler? Das Impressum muss es wissen. */
export const zaehlerLaeuft = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_ZAEHLER?.trim());
