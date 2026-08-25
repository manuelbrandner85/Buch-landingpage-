'use client';

import { useState } from 'react';
import type { BandId, ReiheId, Szene } from '@/data/gemeinsam/typen';
import { useScrollKamera } from '@/camera/useScrollKamera';
import { KinoEbene } from './KinoEbene';
import { KinoWebGL } from './KinoWebGL';
import { Ankunft } from '@/scenes/Ankunft';
import { Auftakt } from '@/scenes/Auftakt';
import { Motiv } from '@/scenes/Motiv';
import { PapierSeite } from '@/scenes/PapierSeite';
import { Weltkarte } from '@/scenes/Weltkarte';
import { RingeSzene } from '@/scenes/RingeSzene';
import { DenarSzene } from '@/scenes/DenarSzene';
import { LaufzeitSzene } from '@/scenes/LaufzeitSzene';
import { PruefungSzene } from '@/scenes/PruefungSzene';
import { Buecher } from '@/scenes/Buecher';
import { Kopfzeile } from '@/ui/Kopfzeile';
import { Kapitelmarke } from '@/ui/Kapitelmarke';
import { EvidenzRegler } from '@/ui/EvidenzRegler';
import { Faden } from '@/ui/Faden';
import { Filmkorn } from '@/ui/Filmkorn';
import { Ausstieg } from '@/ui/Ausstieg';
import { FortschrittGeber } from '@/world/FortschrittKontext';

/**
 * Die Engine kennt sechs Szenentypen und rendert alles aus Daten.
 * Eine neue Szene ist ein neuer Datensatz – keine neue Komponente.
 */
export function SceneEngine(
  { szenen, reihe, band }: { szenen: Szene[]; reihe: ReiheId; band?: BandId }) {
  const [ruhig, setRuhig] = useState(false);
  const [rueckfall, setRueckfall] = useState(false);

  /**
   * GSAP nur noch dort, wo es gebraucht wird: in der DOM-Fassung.
   *
   * Vorher lief es immer mit. Trägt WebGL, sind die DOM-Bühnen gar nicht im
   * Baum – die Zeitachsen liefen also ins Leere –, und die Textauftritte
   * wurden doppelt bewegt, einmal von GSAP und einmal von der Kinoebene. Das
   * war reine Arbeit ohne Bild.
   *
   * Das Trägheitsscrollen ist ganz entfallen. Es fing das Mausrad ab und setzte
   * die Scrollhöhe sechzigmal je Sekunde selbst – dagegen kann der Browser
   * nichts optimieren: klebende Elemente, scrollgebundene Animationen und die
   * Kinoebene mussten in jedem Bild neu rechnen, und genau das war das Ruckeln.
   * Die Trägheit gibt es weiterhin, aber dort, wo sie hingehört: in der Kamera
   * der Kinoebene, die dem Scroll gedämpft folgt.
   */
  useScrollKamera(!ruhig && rueckfall);

  return (
    <FortschrittGeber>
    <div className={ruhig ? 'welt ruhig' : 'welt'}>
      <a className="sprungmarke" href="#karte">Zur Weltkarte springen</a>
      <Kopfzeile reihe={reihe} band={band} ruhig={ruhig} beiRuhe={() => setRuhig((r) => !r)} />
      {/* WebGL zuerst. Trägt es nicht – alter Browser, abgeschaltete
          Beschleunigung, „Bewegung reduzieren“ –, übernimmt die DOM-Fassung. */}
      {ruhig || rueckfall
        ? <KinoEbene szenen={szenen} />
        : <KinoWebGL szenen={szenen} beiRueckfall={() => setRueckfall(true)} />}
      <Filmkorn an={ruhig || rueckfall} />
      <Faden />
      <Kapitelmarke />
      <EvidenzRegler />
      <Ausstieg />
      <main>{szenen.map((s) => <Abschnitt key={s.id} szene={s} />)}</main>
    </div>
    </FortschrittGeber>
  );
}

function Abschnitt({ szene }: { szene: Szene }) {
  switch (szene.typ) {
    case 'ankunft': return <Ankunft szene={szene} />;
    case 'auftakt': return <Auftakt szene={szene} />;
    case 'motiv': return <Motiv szene={szene} />;
    case 'papier': return <PapierSeite szene={szene} />;
    case 'karte': return <Weltkarte szene={szene} />;
    case 'interaktion': {
      const module = {
        ringe: RingeSzene, denar: DenarSzene,
        laufzeit: LaufzeitSzene, pruefung: PruefungSzene,
      } as const;
      const Modul = module[szene.modul ?? 'ringe'];
      return <Modul szene={szene} />;
    }
    case 'buecher': return <Buecher szene={szene} />;
    default: return null;
  }
}
