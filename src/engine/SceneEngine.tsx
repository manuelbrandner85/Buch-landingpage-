'use client';

import { useState } from 'react';
import type { Szene } from '@/data/gemeinsam/typen';
import { useScrollKamera } from '@/camera/useScrollKamera';
import { KinoEbene } from './KinoEbene';
import { KinoWebGL } from './KinoWebGL';
import { useSanftesScrollen } from '@/camera/useSanftesScrollen';
import { Ankunft } from '@/scenes/Ankunft';
import { CoverSzene } from '@/scenes/CoverSzene';
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
 * Die Engine kennt sieben Szenentypen und rendert alles aus Daten.
 * Eine neue Szene ist ein neuer Datensatz – keine neue Komponente.
 */
export function SceneEngine({ szenen }: { szenen: Szene[] }) {
  const [ruhig, setRuhig] = useState(false);
  const [rueckfall, setRueckfall] = useState(false);
  // Die Kamera bewegt jetzt der Shader. GSAP bleibt für die Textauftritte.
  useScrollKamera(!ruhig);
  useSanftesScrollen(!ruhig);

  return (
    <FortschrittGeber>
    <div className={ruhig ? 'welt ruhig' : 'welt'}>
      <a className="sprungmarke" href="#karte">Zur Weltkarte springen</a>
      <Kopfzeile ruhig={ruhig} beiRuhe={() => setRuhig((r) => !r)} />
      {/* WebGL zuerst. Trägt es nicht – alter Browser, abgeschaltete
          Beschleunigung, „Bewegung reduzieren“ –, übernimmt die DOM-Fassung. */}
      {ruhig || rueckfall
        ? <KinoEbene szenen={szenen} />
        : <KinoWebGL szenen={szenen} beiRueckfall={() => setRueckfall(true)} />}
      <Filmkorn />
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
    case 'cover': return <CoverSzene szene={szene} />;
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
    case 'buecher': return <Buecher />;
    default: return null;
  }
}
