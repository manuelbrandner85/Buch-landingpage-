import { wegHaus } from '@/world/wege';

/**
 * Der Weg zurück. Auf jeder Leseseite oben und unten.
 *
 * `nach` ist eine fertige Adresse – am besten aus `world/wege`. Diese
 * Komponente stellt **nichts** mehr davor: Vorher hängte sie selbst den
 * Basispfad an, und seit die Aufrufer ihre Adressen über `wege` bilden, stand
 * er zweimal da: `/Buch-landingpage-/Buch-landingpage-/faeden/`. Der Knopf sah
 * richtig aus und führte ins Leere.
 */
export function Rueckweg({ nach, text = 'Zurück' }: { nach?: string; text?: string }) {
  return <a className="rueckweg" href={nach ?? wegHaus()}>← {text}</a>;
}
