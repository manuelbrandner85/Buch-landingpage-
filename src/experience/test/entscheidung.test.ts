import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { Dienstlage, Leserwunsch } from '../typen';
import { entscheiden, naechsteStufe, type Lage } from '../entscheidung';
import { BEDARFSMUSTER } from '../bedarf';
import { startstufe, punkteFuer } from '../geraet';
import { GERAETE, NETZE, geraet } from './geraete';

const WUNSCH: Leserwunsch = {
  stufe: 'AUTO',
  grosseFassungGewuenscht: false,
  datensparen: false,
};
const GPU_FREI: Dienstlage = { gpuFrei: true };
const GPU_BELEGT: Dienstlage = { gpuFrei: false };

function lage(teile: Partial<Lage> = {}): Lage {
  return {
    geraet: GERAETE.buero,
    netz: NETZE.dsl,
    bedarf: BEDARFSMUSTER.buchobjekt('3D-Buch'),
    wunsch: WUNSCH,
    dienste: GPU_BELEGT,
    ...teile,
  };
}

describe('Geraeteeinstufung', () => {
  it('stuft die Matrix plausibel ein', () => {
    assert.equal(startstufe(GERAETE.spielerechner), 'HIGH_END');
    assert.equal(startstufe(GERAETE.buero), 'OPTIMIERT');
    assert.equal(startstufe(GERAETE.telefonEinfach), 'OPTIMIERT');
    assert.equal(startstufe(GERAETE.ohneWebGL), 'RUECKFALL');
  });

  it('laesst kein Telefon auf HIGH_END starten', () => {
    // Das aktuelle Oberklassetelefon kaeme nach Punkten auf HIGH_END. Es
    // hielte die Stufe eine halbe Minute, bis es warm wird — und bei
    // Bildpunktdichte 3 vermutlich nicht einmal so lange.
    assert.ok(punkteFuer(GERAETE.telefonNeu) >= 9);
    assert.equal(startstufe(GERAETE.telefonNeu), 'OPTIMIERT');
  });

  it('erkennt einen Software-Renderer als das, was er ist', () => {
    // Acht Kerne und viel Speicher — auf dem Papier ein starkes Geraet. Ohne
    // den Abzug bekaeme es HIGH_END und wuerde bei der ersten Szene
    // einbrechen.
    assert.ok(punkteFuer(GERAETE.softwareRenderer) < punkteFuer(GERAETE.buero));
    assert.equal(startstufe(GERAETE.softwareRenderer), 'RUECKFALL');
  });

  it('bestraft kein Geraet fuer Angaben, die der Browser verschweigt', () => {
    const offen = geraet({ webgpu: true });
    const knapp = geraet({ webgpu: true, kerne: 2, speicherGB: 2 });
    assert.ok(punkteFuer(offen) >= punkteFuer(knapp));
    assert.notEqual(startstufe(GERAETE.safariVerschwiegen), 'RUECKFALL');
  });
});

describe('Die Kostenbremse', () => {
  it('mietet keine Grafikkarte, wenn das Geraet die Szene selbst schafft', () => {
    // Der teuerste denkbare Fehler: Spielerechner an Glasfaser, freie GPU im
    // Rechenzentrum — und trotzdem kein GESTREAMT, weil oertlich alles da
    // ist. Ohne diese Regel faellt das erst auf der Rechnung auf.
    const e = entscheiden(
      lage({
        geraet: GERAETE.spielerechner,
        netz: NETZE.glasfaser,
        bedarf: BEDARFSMUSTER.schauplatz('Mittelalterliche Stadt'),
        dienste: GPU_FREI,
      }),
    );
    assert.equal(e.stufe, 'HIGH_END');
  });

  it('startet sie, wenn das Geraet oertlich scheitert', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.telefonAlt,
        netz: NETZE.mobilfunkGut,
        bedarf: BEDARFSMUSTER.schauplatz('Mittelalterliche Stadt'),
        dienste: GPU_FREI,
      }),
    );
    assert.equal(e.stufe, 'GESTREAMT');
  });

  it('startet sie auch auf ausdruecklichen Wunsch — Welt betreten', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.spielerechner,
        netz: NETZE.glasfaser,
        bedarf: BEDARFSMUSTER.schauplatz('Mittelalterliche Stadt'),
        dienste: GPU_FREI,
        wunsch: { ...WUNSCH, grosseFassungGewuenscht: true },
      }),
    );
    assert.equal(e.stufe, 'GESTREAMT');
  });

  it('startet sie nie ohne tragende Leitung', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.telefonAlt,
        netz: NETZE.mobilfunkSchwach,
        bedarf: BEDARFSMUSTER.schauplatz('Stadt'),
        dienste: GPU_FREI,
      }),
    );
    assert.notEqual(e.stufe, 'GESTREAMT');
  });

  it('lehnt weite Strecken wegen der Laufzeit ab, nicht wegen der Bandbreite', () => {
    // 100 Mbit/s reichen bequem. Aber 240 ms zwischen Klick und Bild machen
    // jede Bedienung zaeh — und zaeh ist schlimmer als einfacher.
    const e = entscheiden(
      lage({
        geraet: GERAETE.telefonAlt,
        netz: NETZE.weiteStrecke,
        bedarf: BEDARFSMUSTER.schauplatz('Stadt'),
        dienste: GPU_FREI,
      }),
    );
    assert.notEqual(e.stufe, 'GESTREAMT');
  });

  it('startet sie nie fuer eine Szene, die sie nicht rechtfertigt', () => {
    // Ein 3D-Buch mit zwei Animationen gehoert auf keinen GPU-Server.
    const e = entscheiden(
      lage({
        geraet: GERAETE.telefonEinfach,
        netz: NETZE.glasfaser,
        bedarf: BEDARFSMUSTER.buchobjekt('3D-Buch'),
        dienste: GPU_FREI,
        wunsch: { ...WUNSCH, grosseFassungGewuenscht: true },
      }),
    );
    assert.notEqual(e.stufe, 'GESTREAMT');
  });

  it('startet sie nie, wenn keine frei ist — und sagt das auch', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.telefonAlt,
        netz: NETZE.glasfaser,
        bedarf: BEDARFSMUSTER.schauplatz('Stadt'),
        dienste: GPU_BELEGT,
      }),
    );
    assert.notEqual(e.stufe, 'GESTREAMT');
    assert.ok(e.gruende.some((g) => g.includes('Keine freie Grafikkarte')));
  });
});

describe('Wuensche des Lesers', () => {
  it('deckelt bei weniger Bewegung', () => {
    const e = entscheiden(lage({ geraet: GERAETE.wenigerBewegung }));
    assert.equal(e.stufe, 'OPTIMIERT');
    assert.ok(e.gruende.some((g) => g.includes('Weniger Bewegung')));
  });

  it('achtet Datensparen bedingungslos', () => {
    const e = entscheiden(lage({ geraet: GERAETE.spielerechner, netz: NETZE.datensparen }));
    assert.equal(e.stufe, 'OPTIMIERT');
  });

  it('nimmt eine fest gewaehlte Stufe ernst — auch nach unten', () => {
    const e = entscheiden(
      lage({ geraet: GERAETE.spielerechner, wunsch: { ...WUNSCH, stufe: 'RUECKFALL' } }),
    );
    assert.equal(e.stufe, 'RUECKFALL');
  });

  it('erfuellt einen unmoeglichen Wunsch nicht stillschweigend', () => {
    // GESTREAMT ohne GPU und ohne Leitung gibt es nicht. Statt zu scheitern
    // wird der oertliche Weg genommen — und der Grund steht dabei.
    const e = entscheiden(
      lage({ geraet: GERAETE.buero, wunsch: { ...WUNSCH, stufe: 'GESTREAMT' } }),
    );
    assert.notEqual(e.stufe, 'GESTREAMT');
    assert.ok(e.gruende.some((g) => g.includes('nicht moeglich')));
  });
});

describe('Gemessene Wirklichkeit', () => {
  it('deckelt, wenn das Geraet seine Startstufe nicht haelt', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.spielerechner,
        messwerte: { bilderJeSekunde: 24, bildzeitMittel: 41.7, bildzeitP95: 60, proben: 120 },
      }),
    );
    assert.equal(e.stufe, 'RUECKFALL');
  });

  it('laesst zu wenige Proben unbeachtet', () => {
    const e = entscheiden(
      lage({
        geraet: GERAETE.spielerechner,
        messwerte: { bilderJeSekunde: 12, bildzeitMittel: 83, bildzeitP95: 120, proben: 4 },
      }),
    );
    assert.equal(e.stufe, 'HIGH_END');
  });
});

describe('Jeder Fall bekommt eine Stufe und eine Begruendung', () => {
  it('ueber die gesamte Matrix', () => {
    for (const [name, g] of Object.entries(GERAETE)) {
      for (const [netzname, n] of Object.entries(NETZE)) {
        for (const bedarf of [
          BEDARFSMUSTER.stimmung('S'),
          BEDARFSMUSTER.buchobjekt('B'),
          BEDARFSMUSTER.karte('K'),
          BEDARFSMUSTER.inszenierung('I'),
          BEDARFSMUSTER.schauplatz('P'),
        ]) {
          for (const dienste of [GPU_FREI, GPU_BELEGT]) {
            const e = entscheiden(lage({ geraet: g, netz: n, bedarf, dienste }));
            const wo = `${name}/${netzname}/${bedarf.name}/${dienste.gpuFrei}`;
            assert.ok(e.stufe, wo);
            assert.ok(e.gruende.length > 0, `Begruendung fehlt: ${wo}`);
            if (e.stufe === 'GESTREAMT') {
              assert.equal(bedarf.unrealMoeglich, true, wo);
              assert.equal(dienste.gpuFrei, true, wo);
            }
          }
        }
      }
    }
  });
});

describe('Die Rueckfallkette', () => {
  it('geht Schritt fuer Schritt tiefer, nie im Kreis', () => {
    assert.equal(naechsteStufe('GESTREAMT', GERAETE.spielerechner), 'HIGH_END');
    assert.equal(naechsteStufe('HIGH_END', GERAETE.spielerechner), 'OPTIMIERT');
    assert.equal(naechsteStufe('OPTIMIERT', GERAETE.spielerechner), 'RUECKFALL');
    assert.equal(naechsteStufe('RUECKFALL', GERAETE.spielerechner), 'RUECKFALL');
  });

  it('ueberspringt, was das Geraet nicht kann', () => {
    assert.equal(naechsteStufe('GESTREAMT', GERAETE.buero), 'OPTIMIERT');
    assert.equal(naechsteStufe('GESTREAMT', GERAETE.ohneWebGL), 'RUECKFALL');
    assert.equal(naechsteStufe('HIGH_END', geraet({ webgpu: true, webgl2: false })), 'RUECKFALL');
  });

  it('endet auf jedem Geraet in hoechstens drei Schritten', () => {
    // Die Doktrin verlangt, die Kette zu erzwingen statt ihr zu vertrauen.
    for (const g of Object.values(GERAETE)) {
      let stufe = naechsteStufe('GESTREAMT', g);
      let schritte = 1;
      while (stufe !== 'RUECKFALL' && schritte < 10) {
        stufe = naechsteStufe(stufe, g);
        schritte++;
      }
      assert.equal(stufe, 'RUECKFALL');
      assert.ok(schritte <= 3, `zu viele Schritte: ${schritte}`);
    }
  });
});
