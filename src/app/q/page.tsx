import type { Metadata } from 'next';
import { Rueckweg } from '@/ui/Rueckweg';
import { TRENDONIX } from '@/world/registry';
import { weg, wegHaus, wegVollstaendig } from '@/world/wege';
import {
  QR_BUCH, QR_VEROEFFENTLICHT, QR_ZIELE, qrSchluessel,
} from '@/data/gemeinsam/qr';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: `Selbst nachsehen – ${QR_BUCH}`,
  description:
    'Die vierzig Quellen aus dem Buch, jede öffentlich und kostenlos. '
    + 'Berichte, Logbücher, Bauakten, Tabellen — Kapitel für Kapitel.',
  robots: QR_VEROEFFENTLICHT ? undefined : { index: false, follow: false },
  alternates: {
    canonical: wegVollstaendig(weg('/q/')) ?? weg('/q/'),
  },
};

/**
 * Das Verzeichnis aller vierzig Nachschlage-Seiten.
 *
 * Im Buch führt jeder QR-Code auf genau eine davon. Wer keinen Code scannen
 * will, findet hier dieselbe Liste — und wer prüfen möchte, ob noch alle Wege
 * offen sind, hat sie auf einer Seite beisammen.
 */
export default function QrVerzeichnis() {
  return (
    <main className="lesefassung">
      <Rueckweg nach={wegHaus()} text={`Zurück zu ${TRENDONIX.name}`} />
      <p className="eyebrow">{QR_BUCH}</p>
      <h1>Selbst nachsehen</h1>
      <p className="unterzeile">
        Vierzig Kapitel, vierzig Quellen. Nichts davon ist verschlossen, das
        meiste kostenlos, und fast niemand hat hineingesehen.
      </p>

      <article>
        <ul>
          {QR_ZIELE.map((z) => (
            <li key={z.nr}>
              <a href={weg(`/q/${qrSchluessel(z.nr)}/`)}>
                {z.nr} · {z.kapitel}
              </a>
              <br />
              {z.hinweis}
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
