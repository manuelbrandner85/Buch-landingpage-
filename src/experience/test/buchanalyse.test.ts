import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { empfehlung, type Buchsteckbrief } from '../buchanalyse';

function buch(teile: Partial<Buchsteckbrief> = {}): Buchsteckbrief {
  return {
    titel: 'Prueftitel',
    genre: 'sachbuch',
    schauplatzVorhanden: false,
    zeitlicheTiefe: false,
    figurenImVordergrund: false,
    interaktionGewuenscht: false,
    ...teile,
  };
}

describe('Buchanalyse — die wichtigste Antwort ist oft "kein 3D"', () => {
  it('empfiehlt fuer ein statisches Cover kein 3D', () => {
    const e = empfehlung(buch({ genre: 'satire' }));
    assert.equal(e.technik, 'kein-3d');
    assert.ok(e.gruende.some((g) => g.includes('Kein 3D')));
  });

  it('empfiehlt fuer einen Schauplatz ohne Interaktion ein Video', () => {
    // Eine filmische Szene, durch die nur die Kamera faehrt, ist ein Film.
    // Sie live zu rechnen kostet Geld und bringt nichts.
    const e = empfehlung(
      buch({ genre: 'historischer-roman', schauplatzVorhanden: true, interaktionGewuenscht: false }),
    );
    assert.equal(e.technik, 'video');
  });

  it('empfiehlt Unreal nur fuer den begehbaren Schauplatz', () => {
    const e = empfehlung(
      buch({ genre: 'fantasy', schauplatzVorhanden: true, interaktionGewuenscht: true }),
    );
    assert.equal(e.technik, 'unreal');
    assert.equal(e.bedarf.unrealMoeglich, true);
  });

  it('empfiehlt oertliches 3D fuer ueberschaubare Szenen', () => {
    const e = empfehlung(buch({ genre: 'sachbuch', interaktionGewuenscht: true }));
    assert.equal(e.technik, 'three');
    assert.equal(e.bedarf.unrealMoeglich, false);
  });

  it('nimmt weg, was das Buch nicht hergibt', () => {
    const e = empfehlung(buch({ genre: 'fantasy', schauplatzVorhanden: false }));
    assert.ok(!e.elemente.includes('schauplatz'));
    assert.ok(e.gruende.some((g) => g.includes('Kein zeigbarer Handlungsort')));
  });

  it('gibt jedem Buch ein Cover und eine Begruendung', () => {
    const genres = [
      'sachbuch', 'historischer-roman', 'fantasy', 'thriller', 'science-fiction', 'satire',
    ] as const;
    for (const genre of genres) {
      for (const schauplatz of [true, false]) {
        for (const interaktion of [true, false]) {
          const e = empfehlung(
            buch({ genre, schauplatzVorhanden: schauplatz, interaktionGewuenscht: interaktion }),
          );
          const wo = `${genre}/${schauplatz}/${interaktion}`;
          assert.ok(e.elemente.includes('cover-3d'), wo);
          assert.ok(e.gruende.length > 0, wo);
          // Unreal nur, wo es auch begruendet ist.
          if (e.technik === 'unreal') {
            assert.ok(schauplatz && interaktion, `Unreal ohne Grund: ${wo}`);
          }
        }
      }
    }
  });
});
