'use client';

import { useMemo, useState } from 'react';
import type { BandId, ReiheId, Szene } from '@/data/gemeinsam/typen';
import { BEDARFSMUSTER } from '@/experience/bedarf';
import { useExperience } from '@/experience/useExperience';
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
import { FeedWelt } from '@/scenes/FeedWelt';
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
  /**
   * Eine Welt, die in einem Telefon spielt, bekommt keine Kinoebene.
   *
   * Die Kinoebene legt Bildplatten hinter die Abschnitte und fährt eine Kamera
   * darüber — richtig für eine Landschaft, falsch für einen Feed. „Alles nur
   * Zufall?" hat deshalb eine eigene Bauform, und das ist die einzige Stelle,
   * an der das Haus davon weiß. Erkannt wird sie an den Daten, nicht am Namen
   * der Reihe: Wo eine Szene `feed` heißt, gilt die andere Bauform.
   *
   * Diese Weiche steht in einer eigenen Komponente, die selbst KEINEN Hook
   * aufruft — und das ist der ganze Zweck der Aufteilung.
   *
   * Vorher stand sie mitten in der Fädenwelt, zwischen `useExperience` und
   * `useScrollKamera`. Damit rief dieselbe Komponente je nach Daten
   * unterschiedlich viele Hooks auf, was React verbietet: Es merkt sich die
   * Hooks einer Komponente als LISTE und ordnet sie beim nächsten Durchlauf
   * über ihre Position zu. Aufgefallen wäre es erst, wenn ein Szenensatz
   * innerhalb desselben Mounts von „feed" auf etwas anderes wechselt — dann
   * bekäme der Zustand des einen Hooks den Wert eines anderen. Ein Fehler,
   * der nicht abstürzt, sondern falsch rechnet.
   *
   * Nebenbei spart die Aufteilung echte Arbeit: Die Feed-Welt startet so gar
   * nicht erst die Experience Engine samt Gerätemessung, die sie nie braucht.
   */
  if (szenen.some((s) => s.typ === 'feed')) return <FeedWelt />;
  return <Faedenwelt szenen={szenen} reihe={reihe} band={band} />;
}

function Faedenwelt(
  { szenen, reihe, band }: { szenen: Szene[]; reihe: ReiheId; band?: BandId }) {
  const [ruhig, setRuhig] = useState(false);
  const [rueckfall, setRueckfall] = useState(false);

  /**
   * Die Adaptive Experience Engine entscheidet, welche Fassung der Leser
   * bekommt.
   *
   * Vorher stand hier eine Vermutung: WebGL zuerst, und wenn es nicht trägt,
   * meldet sich die Kinoebene. Das erkennt nur den Totalausfall — nicht das
   * Telefon, das die Szene zwar startet und dann mit zwölf Bildern je Sekunde
   * durch die Welt ruckelt. Genau dieser Fall ist der häufige.
   *
   * Der Bedarf muss über Renderdurchläufe hinweg derselbe bleiben, sonst
   * startet die Engine bei jedem Neuaufbau von vorn.
   */
  const bedarf = useMemo(() => BEDARFSMUSTER.inszenierung(band ?? reihe), [reihe, band]);
  const experience = useExperience(bedarf);

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

  // Die Sprungmarke braucht die Adresse der Karte dieses Bandes – „#karte“ gab
  // es nur in Band 1 und lief in den Bandwelten ins Leere.
  const karte = szenen.find((s) => s.typ === 'karte');

  // Solange die Engine noch misst, gilt die ruhige Fassung. Sie steht sofort
  // und ist nie leer — ein leeres Feld liest sich als Defekt.
  const flach = ruhig || rueckfall || experience.laedt || experience.stufe === 'RUECKFALL';

  return (
    <FortschrittGeber>
    <div className={ruhig ? 'welt ruhig' : 'welt'}>
      {karte && <a className="sprungmarke" href={`#${karte.id}`}>Zur Weltkarte springen</a>}
      <Kopfzeile reihe={reihe} band={band} ruhig={ruhig} beiRuhe={() => setRuhig((r) => !r)} />
      {/* WebGL zuerst. Trägt es nicht – alter Browser, abgeschaltete
          Beschleunigung, „Bewegung reduzieren“ –, übernimmt die DOM-Fassung. */}
      {/* Die drei Wege, die zur DOM-Fassung führen, sind bewusst getrennt:
          „Ruhe" ist der Wunsch des Lesers, `rueckfall` der harte Ausfall der
          Kinoebene, und RUECKFALL das Urteil der Engine über Gerät und
          gemessene Bildrate. Jeder davon gilt für sich. */}
      {flach
        ? <KinoEbene szenen={szenen} />
        : <KinoWebGL
            szenen={szenen}
            beiRueckfall={() => {
              setRueckfall(true);
              // Auch der Engine sagen, dass diese Stufe ausgefallen ist —
              // sonst bietet der Regler sie gleich wieder an.
              experience.ausfallMelden('Kinoebene traegt nicht');
            }}
          />}
      <Filmkorn an={flach} />
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
