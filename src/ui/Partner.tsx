import { BASIS_PFAD } from '@/world/bilder';

/**
 * Die Partnermarke.
 *
 * Ein fremdes Zeichen auf einer Seite, die sonst nur Gold und Nacht kennt, ist
 * eine heikle Sache: Zu laut, und es wirbt gegen das Buch; zu leise, und es
 * sieht aus wie vergessen. Deshalb liegt es im Ruhezustand bei halber Deckkraft
 * und in der Papierfarbe der Seite – nur das V behält sein Blau – und tritt
 * erst hervor, wenn jemand hinsieht.
 *
 * Der Glanz ist kein Effekt über dem Bild, sondern durch das Bild: Die
 * Bewegtmaske hat die Form des Logos, sodass das Licht die Buchstaben entlang
 * läuft und nicht über ein Rechteck. Er läuft selten (alle neun Sekunden ein
 * Mal) und hält sich still, wo die Seite still sein soll – im Ruhig-Modus und
 * bei „Bewegung reduzieren“.
 */
export function Partner({ zeile = 'Partner' }: { zeile?: string }) {
  const bild = `${BASIS_PFAD}/marke/vecom-design.png`;
  return (
    <a className="partner" href="https://www.vecom-design.it"
      target="_blank" rel="noopener noreferrer">
      <span className="partner-wort">{zeile}</span>
      <span className="partner-mal" style={{ ['--marke' as string]: `url(${bild})` }}>
        <picture>
          <source srcSet={`${BASIS_PFAD}/marke/vecom-design.avif`} type="image/avif" />
          <source srcSet={`${BASIS_PFAD}/marke/vecom-design.webp`} type="image/webp" />
          <img src={bild} alt="VECOM Design – Webdesign, Logo Design, Branding"
            width={660} height={517} loading="lazy" decoding="async" />
        </picture>
        <span className="partner-glanz" aria-hidden="true" />
      </span>
      <span className="partner-adresse">www.vecom-design.it</span>
    </a>
  );
}
