import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { Messwerte, Stufe } from '../typen';
import {
  REGELN,
  REIHENFOLGE,
  regeln,
  standErstellen,
  wirksamesBudget,
  type Reglerstand,
} from '../regler';

function mess(fps: number, p95?: number): Messwerte {
  const mittel = 1000 / fps;
  return {
    bilderJeSekunde: fps,
    bildzeitMittel: mittel,
    bildzeitP95: p95 ?? mittel * 1.4,
    proben: 120,
  };
}

/** Laesst den Regler eine gedachte Zeitspanne durchlaufen. */
function laufen(
  start: Stufe,
  fps: (t: number, s: Reglerstand) => number,
  dauerMs = 120_000,
  schritt = 500,
) {
  let stand = standErstellen(start);
  const schritte: string[] = [];
  for (let t = 0; t <= dauerMs; t += schritt) {
    const e = regeln(stand, mess(fps(t, stand)), t);
    stand = e.stand;
    if (e.massnahme.art !== 'nichts') schritte.push(`${t}ms ${e.massnahme.art}`);
  }
  return { stand, schritte };
}

describe('Regler — Zurueckschalten', () => {
  it('ruehrt sich nicht, solange es laeuft', () => {
    const e = regeln(standErstellen('HIGH_END'), mess(60), 5_000);
    assert.equal(e.massnahme.art, 'nichts');
  });

  it('greift ohne genug Proben nicht ein', () => {
    const e = regeln(standErstellen('HIGH_END'), { ...mess(10), proben: 12 }, 5_000);
    assert.equal(e.massnahme.art, 'nichts');
  });

  it('nimmt unter 30 fps sofort eine ganze Stufe zurueck', () => {
    const e = regeln(standErstellen('HIGH_END'), mess(22), 5_000);
    assert.equal(e.massnahme.art, 'stufeRunter');
    assert.equal(e.stand.stufe, 'OPTIMIERT');
  });

  it('dreht unter 40 fps zuerst an den Stellschrauben', () => {
    const e = regeln(standErstellen('HIGH_END'), mess(35), 5_000);
    assert.equal(e.massnahme.art, 'drosseln');
    assert.deepEqual(e.stand.gedrosselt, ['renderskalierung']);
  });

  it('greift auch bei gutem Mittelwert ein, wenn das Perzentil ruckelt', () => {
    const e = regeln(standErstellen('HIGH_END'), mess(58, 140), 5_000);
    assert.equal(e.massnahme.art, 'drosseln');
  });

  it('regelt GESTREAMT gar nicht', () => {
    // Dort rechnet das Rechenzentrum. Eine schlechte Bildrate hiesse
    // Leitungsproblem — dafuer ist die Rueckfallkette da, nicht der Regler.
    const e = regeln(standErstellen('GESTREAMT'), mess(8), 5_000);
    assert.equal(e.massnahme.art, 'nichts');
    assert.equal(e.stand.stufe, 'GESTREAMT');
  });

  it('faellt unter RUECKFALL nicht weiter', () => {
    const e = regeln(standErstellen('RUECKFALL'), mess(5), 5_000);
    assert.equal(e.massnahme.art, 'nichts');
  });
});

describe('Regler — die Sperre', () => {
  it('regelt nicht gegen die eigene letzte Massnahme', () => {
    // Ohne Sperre landet dieselbe schlechte Messung binnen dreier Durchgaenge
    // ganz unten, obwohl die erste Massnahme noch gar nicht gewirkt haben
    // kann.
    let stand = standErstellen('HIGH_END');
    let eingriffe = 0;
    for (let t = 0; t < 2_000; t += 100) {
      const e = regeln(stand, mess(20), t);
      stand = e.stand;
      if (e.massnahme.art !== 'nichts') eingriffe++;
    }
    assert.equal(eingriffe, 1);
    assert.equal(stand.stufe, 'OPTIMIERT');
  });
});

describe('Regler — Erhoehen', () => {
  it('erhoeht erst nach anhaltender Ruhe, nicht sofort', () => {
    let stand = standErstellen('OPTIMIERT');
    const e1 = regeln(stand, mess(60), 1_000);
    assert.equal(e1.massnahme.art, 'nichts');
    stand = e1.stand;

    const e2 = regeln(stand, mess(60), 1_000 + REGELN.ruheVorErhoehung + 100);
    assert.equal(e2.massnahme.art, 'stufeRauf');
    assert.equal(e2.stand.stufe, 'HIGH_END');
  });

  it('gibt beim Stufenwechsel keine Drosselung zurueck', () => {
    // Sonst wird die Szene im selben Zug wieder teurer: OPTIMIERT ohne
    // Drosselung kostet mehr als HIGH_END mit allen fuenf Schrauben.
    const stand: Reglerstand = {
      ...standErstellen('HIGH_END'),
      gedrosselt: [...REIHENFOLGE],
    };
    const e = regeln(stand, mess(20), 5_000);
    assert.equal(e.massnahme.art, 'stufeRunter');
    assert.deepEqual(e.stand.gedrosselt, [...REIHENFOLGE]);
  });

  it('gibt die Drosselungen einzeln wieder her, wenn es traegt', () => {
    let stand: Reglerstand = { ...standErstellen('OPTIMIERT'), gedrosselt: [...REIHENFOLGE] };
    let zurueck = 0;
    for (let t = 0; t < 200_000; t += 500) {
      const e = regeln(stand, mess(60), t);
      stand = e.stand;
      if (e.massnahme.art === 'drosseln') zurueck++;
      if (e.massnahme.art === 'stufeRauf') break;
    }
    assert.equal(zurueck, REIHENFOLGE.length);
    assert.deepEqual(stand.gedrosselt, []);
  });

  it('bietet eine zweimal gescheiterte Stufe nicht mehr an', () => {
    // Ein Geraet, das HIGH_END nicht haelt, aber OPTIMIERT muehelos schafft.
    // Ohne diese Regel pendelt es fuer den Rest des Besuchs — und das
    // Pendeln ist auffaelliger als die dauerhaft niedrigere Stufe.
    const { stand, schritte } = laufen(
      'HIGH_END',
      (_t, s) => (s.stufe === 'HIGH_END' ? 20 : 60),
      600_000,
    );
    assert.equal(stand.stufe, 'OPTIMIERT');
    assert.equal(stand.gescheitert['HIGH_END'], REGELN.aufgeben);
    assert.equal(schritte.filter((s) => s.includes('stufeRauf')).length, 1);
  });

  it('pendelt auch ueber eine lange Sitzung nicht', () => {
    const { schritte } = laufen('OPTIMIERT', (_t, s) => (s.stufe === 'HIGH_END' ? 25 : 58), 900_000);
    assert.ok(schritte.length <= 6, `zu viele Eingriffe: ${schritte.length}`);
  });
});

describe('Wirksames Budget', () => {
  it('entspricht ohne Drosselung genau der Stufe', () => {
    const b = wirksamesBudget(standErstellen('HIGH_END'));
    assert.equal(b.aufloesungsskala, 1.0);
    assert.equal(b.modellfassung, 'high');
  });

  it('senkt mit jeder Drosselung den Aufwand', () => {
    const voll = wirksamesBudget(standErstellen('HIGH_END'));
    const gedrosselt = wirksamesBudget({
      ...standErstellen('HIGH_END'),
      gedrosselt: [...REIHENFOLGE],
    });
    assert.ok(gedrosselt.aufloesungsskala < voll.aufloesungsskala);
    assert.ok(gedrosselt.partikel < voll.partikel);
    assert.ok(gedrosselt.lodStart > voll.lodStart);
    assert.equal(gedrosselt.schatten, 'klein');
  });

  it('laedt bei groeberem LOD auch die kleinere Modellfassung', () => {
    // Sonst wird die feine GLB-Datei geladen und dann nicht benutzt — die
    // teuerste Art, Bandbreite zu verschwenden.
    const b = wirksamesBudget({
      ...standErstellen('HIGH_END'),
      gedrosselt: ['lodDistanz'],
    });
    assert.equal(b.modellfassung, 'medium');
  });

  it('bleibt in sinnvollen Grenzen', () => {
    const b = wirksamesBudget({
      ...standErstellen('OPTIMIERT'),
      gedrosselt: [...REIHENFOLGE, ...REIHENFOLGE],
    });
    assert.ok(b.aufloesungsskala >= 0.5);
    assert.ok(b.partikel >= 0);
    assert.ok(b.lodStart <= 3);
  });
});
