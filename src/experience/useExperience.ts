'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Budget, Entscheidung, Stufe, Szenenbedarf } from './typen';
import { geraetLesen } from './geraet';
import { netzLesen, netzMessen } from './netz';
import { entscheiden, naechsteStufe } from './entscheidung';
import { Bildzeiten } from './messung';
import { REGELN, regeln, standErstellen, wirksamesBudget, type Reglerstand } from './regler';

/**
 * Die Brücke zwischen React und der Engine.
 *
 * Bewusst schmal. React erfährt drei Dinge: welche Stufe gilt, welches Budget
 * daraus folgt, und ob schon entschieden ist. Was NIE über diese Brücke läuft:
 * Werte, die sich je Bild ändern. Ein `setState` je Bild bedeutet sechzig
 * Neuaufbauten des halben Komponentenbaums je Sekunde — und die Messung misst
 * dann vor allem React.
 *
 * Deshalb liegen Bildzeiten und Reglerstand in Refs, nicht im Zustand.
 */

export interface Experience {
  /** Noch am Ermitteln? Solange zeigt die Seite den Platzhalter. */
  laedt: boolean;
  stufe: Stufe;
  budget: Budget;
  entscheidung?: Entscheidung;
  /** Aus der Renderschleife je Bild aufzurufen. Absichtlich billig. */
  bildFertig(zeitstempel: number): void;
  /** Eine Stufe ist ausgefallen — die nächste Sicherung greift. */
  ausfallMelden(grund: string): void;
  /** Der Leser hat „Welt betreten" gedrückt. */
  grosseFassungAnfordern(): void;
  /** Feste Wahl oder zurück auf AUTO. */
  stufeWaehlen(wahl: Stufe | 'AUTO'): void;
  /** Klartext für das Entwicklerfenster. */
  bericht(): string[];
}

export function useExperience(bedarf: Szenenbedarf, messdatei?: string): Experience {
  const [laedt, setLaedt] = useState(true);
  const [stufe, setStufe] = useState<Stufe>('OPTIMIERT');
  const [budget, setBudget] = useState<Budget>(() => wirksamesBudget(standErstellen('OPTIMIERT')));
  const [entscheidung, setEntscheidung] = useState<Entscheidung | undefined>();

  const geraet = useRef<Awaited<ReturnType<typeof geraetLesen>> | undefined>(undefined);
  const zeiten = useRef(new Bildzeiten(120));
  const stand = useRef<Reglerstand>(standErstellen('OPTIMIERT'));
  const seitRegelung = useRef(0);
  const vorheriges = useRef<number | undefined>(undefined);
  const wunsch = useRef({ stufe: 'AUTO' as Stufe | 'AUTO', gross: false });

  const uebernehmen = useCallback((e: Entscheidung) => {
    stand.current = standErstellen(e.stufe);
    zeiten.current.leeren();
    vorheriges.current = undefined;
    setEntscheidung(e);
    setStufe(e.stufe);
    setBudget(wirksamesBudget(stand.current));
  }, []);

  const neuEntscheiden = useCallback(() => {
    if (!geraet.current) return;
    uebernehmen(
      entscheiden({
        geraet: geraet.current,
        netz: netzLesen(),
        bedarf,
        wunsch: {
          stufe: wunsch.current.stufe,
          grosseFassungGewuenscht: wunsch.current.gross,
          datensparen: false,
        },
        // Ohne Signalserver gibt es keine freie Grafikkarte. Das ist kein
        // Versaeumnis, sondern der ehrliche Stand: Level 3 wird erst
        // gemeldet, wenn es ihn wirklich gibt.
        dienste: { gpuFrei: false },
        ...(zeiten.current.auswerten() ? { messwerte: zeiten.current.auswerten()! } : {}),
      }),
    );
  }, [bedarf, uebernehmen]);

  // Einmal beim Start: Geraet und Leitung befragen, dann entscheiden.
  useEffect(() => {
    let abgebrochen = false;

    void (async () => {
      const g = await geraetLesen();
      if (abgebrochen) return;
      geraet.current = g;

      let netz = netzLesen();
      // Die Leitung wird nur gemessen, wenn die Szene ueberhaupt in die
      // Cloud koennte. Sonst waere es eine Anfrage, deren Ergebnis niemand
      // liest — auf einem Mobilfunkvertrag mit Volumengrenze eine, die Geld
      // kostet.
      if (messdatei && bedarf.unrealMoeglich) netz = await netzMessen(messdatei, netz);
      if (abgebrochen) return;

      uebernehmen(
        entscheiden({
          geraet: g,
          netz,
          bedarf,
          wunsch: { stufe: 'AUTO', grosseFassungGewuenscht: false, datensparen: false },
          dienste: { gpuFrei: false },
        }),
      );
      setLaedt(false);
    })();

    return () => {
      abgebrochen = true;
    };
  }, [bedarf, messdatei, uebernehmen]);

  // Im Hintergrund-Tab nicht messen: Der Browser drosselt dort auf etwa ein
  // Bild je Sekunde. Wer weitermisst, meldet 1 fps und schaltet die Seite auf
  // RUECKFALL — der Leser kommt zurueck und findet sie verstuemmelt vor, ohne
  // dass je etwas langsam war.
  useEffect(() => {
    const dok = globalThis.document;
    if (!dok) return;
    const beiWechsel = () => {
      zeiten.current.leeren();
      vorheriges.current = undefined;
    };
    dok.addEventListener('visibilitychange', beiWechsel);
    return () => dok.removeEventListener('visibilitychange', beiWechsel);
  }, []);

  const bildFertig = useCallback((zeitstempel: number) => {
    if (globalThis.document?.hidden) return;

    if (vorheriges.current !== undefined) {
      zeiten.current.hinzu(zeitstempel - vorheriges.current);
    }
    vorheriges.current = zeitstempel;

    // Der Regeldurchgang laeuft nur alle 30 Bilder. Die Auswertung sortiert
    // 120 Werte, und das gehoert nicht in jedes Bild.
    if (++seitRegelung.current < 30) return;
    seitRegelung.current = 0;

    // Eine feste Wahl ist eine Ansage des Lesers. Der Regler misst weiter —
    // die Werte sind fuer die Anzeige nuetzlich — aber greift nicht ein.
    if (wunsch.current.stufe !== 'AUTO') return;

    const e = regeln(stand.current, zeiten.current.auswerten(), zeitstempel, REGELN);
    stand.current = e.stand;
    if (e.massnahme.art === 'nichts') return;

    // Nach jedem Eingriff die Messung leeren. Sonst regelt der naechste
    // Durchgang gegen Werte, die vor der Aenderung entstanden sind.
    zeiten.current.leeren();
    setStufe(e.stand.stufe);
    setBudget(wirksamesBudget(e.stand));
  }, []);

  const ausfallMelden = useCallback(
    (grund: string) => {
      if (!geraet.current) return;
      const ziel = naechsteStufe(stand.current.stufe, geraet.current);
      // Kein Fehlerbild. Der Leser sieht nur, dass es weiterlaeuft.
      uebernehmen({
        stufe: ziel,
        gruende: [...(entscheidung?.gruende ?? []), `Ausfall (${grund}) → ${ziel}.`],
      });
    },
    [entscheidung, uebernehmen],
  );

  const grosseFassungAnfordern = useCallback(() => {
    wunsch.current = { ...wunsch.current, gross: true };
    neuEntscheiden();
  }, [neuEntscheiden]);

  const stufeWaehlen = useCallback(
    (wahl: Stufe | 'AUTO') => {
      wunsch.current = { ...wunsch.current, stufe: wahl };
      neuEntscheiden();
    },
    [neuEntscheiden],
  );

  const bericht = useCallback((): string[] => {
    const z: string[] = [];
    if (entscheidung) {
      z.push(`Stufe: ${stand.current.stufe}`);
      z.push(...entscheidung.gruende.map((g) => `  · ${g}`));
    }
    if (stand.current.gedrosselt.length > 0) {
      z.push(`Gedrosselt: ${stand.current.gedrosselt.join(', ')}`);
    }
    const m = zeiten.current.auswerten();
    if (m) {
      z.push(
        `${m.bilderJeSekunde.toFixed(0)} fps · Mittel ${m.bildzeitMittel.toFixed(1)} ms · P95 ${m.bildzeitP95.toFixed(1)} ms · ${m.proben} Proben`,
      );
    }
    const g = geraet.current;
    if (g) {
      z.push(
        `Geraet: ${g.webgpu ? 'WebGPU' : g.webgl2 ? 'WebGL2' : 'kein 3D'} · ${g.kerne ?? '?'} Kerne · ${g.speicherGB ?? '?'} GB · Dichte ${g.bildpunktdichte}`,
      );
      if (g.renderername) z.push(`  ${g.renderername}`);
    }
    return z;
  }, [entscheidung]);

  return {
    laedt,
    stufe,
    budget,
    ...(entscheidung ? { entscheidung } : {}),
    bildFertig,
    ausfallMelden,
    grosseFassungAnfordern,
    stufeWaehlen,
    bericht,
  };
}
