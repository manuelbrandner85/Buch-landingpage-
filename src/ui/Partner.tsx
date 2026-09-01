import type { Partner as PartnerDaten } from '@/data/gemeinsam/partner';
import { PARTNER } from '@/data/gemeinsam/partner';
import { BASIS_PFAD } from '@/world/bilder';

/**
 * Die Partnermarken.
 *
 * Fremde Zeichen auf einer Seite, die sonst nur Gold und Nacht kennt, sind
 * eine heikle Sache: Zu laut, und sie werben gegen das Buch; zu leise, und sie
 * sehen aus wie vergessen. Deshalb liegen sie im Ruhezustand bei halber
 * Deckkraft und treten erst hervor, wenn jemand hinsieht.
 *
 * Wer ein Logo hinterlegt hat, steht mit seinem Logo. Der Glanz ist dann kein
 * Effekt über dem Bild, sondern durch das Bild: Die Bewegtmaske hat die Form
 * des Zeichens, sodass das Licht die Buchstaben entlangläuft und nicht über
 * ein Rechteck. Er läuft selten und hält sich still, wo die Seite still sein
 * soll – im Ruhig-Modus und bei „Bewegung reduzieren“.
 *
 * Wer keines hinterlegt hat, steht als Schriftzug in der Schrift des Hauses.
 * Ein fremdes Logo wird hier nicht nachgebaut: Lieber ein ehrlicher Name als
 * ein falsches Zeichen.
 */
function Marke({ partner }: { partner: PartnerDaten }) {
  const bild = partner.bild ? `${BASIS_PFAD}/marke/${partner.bild}.png` : undefined;
  // Dieselbe Sache wie bei der Hausmarke: Die Maske braucht nur die Form.
  // Über `--marke` auf das volle PNG zu zeigen hieß, das Partnerlogo (57 KB)
  // schon auf dem ersten Bildschirm zu laden, obwohl es ganz unten steht und
  // das <img> daneben brav `loading="lazy"` trägt — ein CSS-Bild wartet nicht.
  const maske = partner.bild
    ? `${BASIS_PFAD}/marke/${partner.bild}-maske.png` : undefined;
  return (
    <a className={`partner-marke${bild ? '' : ' partner-nurschrift'}`} href={partner.ziel}
      target="_blank" rel="noopener noreferrer">
      {bild ? (
        <span className="partner-mal" style={{ ['--marke' as string]: `url(${maske})` }}>
          <picture>
            <source srcSet={`${BASIS_PFAD}/marke/${partner.bild}.avif`} type="image/avif" />
            <source srcSet={`${BASIS_PFAD}/marke/${partner.bild}.webp`} type="image/webp" />
            <img src={bild} alt={partner.alt ?? partner.name}
              width={partner.breite ?? 660} height={partner.hoehe ?? 517}
              loading="lazy" decoding="async" />
          </picture>
          <span className="partner-glanz" aria-hidden="true" />
        </span>
      ) : (
        <span className="partner-name">
          <b>{partner.name}</b>
          {partner.unterzeile && <em>{partner.unterzeile}</em>}
        </span>
      )}
      <span className="partner-adresse">{partner.adresse}</span>
    </a>
  );
}

export function Partner({ zeile = 'Partner' }: { zeile?: string }) {
  if (PARTNER.length === 0) return null;
  return (
    <div className="partner">
      <span className="partner-wort">{PARTNER.length > 1 ? 'Partner' : zeile}</span>
      <div className="partner-reihe">
        {PARTNER.map((p) => <Marke key={p.id} partner={p} />)}
      </div>
    </div>
  );
}
