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
  return (
    <span className="hausmal" style={{ ['--marke' as string]: `url(${bild})` }}>
      <img className={klasse} src={bild} alt={alt} width={breite} height={hoehe}
        {...(zuerst
          ? { fetchPriority: 'high' as const }
          : { loading: 'lazy' as const })}
        decoding="async" />
      <span className="hausglanz" aria-hidden="true" />
    </span>
  );
}
