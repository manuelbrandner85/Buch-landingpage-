import { BASIS_PFAD } from '@/world/bilder';

/**
 * Die Marke des Hauses – mit Licht darin.
 *
 * Das TX-Zeichen ist gedrucktes Gold: ein Farbverlauf, aber ein stehender.
 * Echtes Gold steht nie still, es antwortet auf Licht. Deshalb liegt über dem
 * Zeichen eine Maske in seiner eigenen Form, durch die alle acht Sekunden ein
 * schmaler heller Streifen läuft – nicht über ein Rechteck, sondern die
 * Buchstaben entlang. Dazu ein sehr langsames Atmen des Schimmers ringsum.
 *
 * Beides ist absichtlich knapp unter der Aufmerksamkeitsschwelle: Man sieht
 * es, wenn man hinsieht, und übersieht es beim Lesen. Im Ruhig-Modus und bei
 * „Bewegung reduzieren“ steht es still.
 */
export function Hausmarke({
  datei = 'trendonix-tx',
  klasse,
  breite,
  hoehe,
  alt = '',
  zuerst = false,
}: {
  datei?: string;
  klasse?: string;
  breite: number;
  hoehe: number;
  alt?: string;
  zuerst?: boolean;
}) {
  const bild = `${BASIS_PFAD}/marke/${datei}.png`;
  // Die Maske ist nicht das Bild.
  //
  // `--marke` lag bis zum 01.09.2026 auf derselben PNG-Datei wie das sichtbare
  // Zeichen. Eine Maske benutzt aber nur den Alphakanal — Farbe, Verlauf und
  // Glanz darin werden verworfen. Das Zeichen wurde damit zweimal geladen,
  // beim zweiten Mal für nichts: gemessen 83 KB auf dem ersten Bildschirm.
  // Jetzt zeigt `--marke` auf eine reine Formdatei von rund fünf Kilobyte.
  const maske = `${BASIS_PFAD}/marke/${datei}-maske.png`;
  return (
    <span className="hausmal" style={{ ['--marke' as string]: `url(${maske})` }}>
      <picture>
        <source srcSet={`${BASIS_PFAD}/marke/${datei}.avif`} type="image/avif" />
        {/* `zuerst` heißt seit dem 01.09.2026 nur noch „nicht lazy" — nicht
            mehr `fetchPriority="high"`.
            Aus dem hohen Rang machte React im Kopf der Seite automatisch ein
            <link rel="preload" as="image" href=".../trendonix-tx.png">. Das
            hatte zwei Wirkungen, beide schlecht: Es lud die PNG-Fassung, die
            der Browser wegen der AVIF-Quelle darüber gar nicht benutzt (84 KB
            umsonst), und es drängelte sich vor das Bild, an dem die Ladezeit
            wirklich gemessen wird — den Grund dahinter. Ein neun Kilobyte
            großes Zeichen braucht keinen Vorrang. */}
        <img className={klasse} src={bild} alt={alt} width={breite} height={hoehe}
          {...(zuerst ? {} : { loading: 'lazy' as const })}
          decoding="async" />
      </picture>
      <span className="hausglanz" aria-hidden="true" />
    </span>
  );
}
