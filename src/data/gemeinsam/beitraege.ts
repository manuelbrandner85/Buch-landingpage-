import type { BandId } from './typen';

/**
 * Das Journal.
 *
 * Ein eigener Kanal, der niemandem gehört außer dem Haus: keine Plattform,
 * keine Nutzungsbedingungen, keine Sperre. Was hier steht, ist auffindbar,
 * solange die Domain steht.
 *
 * Der Typ steht bewusst hier und nicht in `typen.ts`: Ein Beitrag ist kein
 * Teil des Weltmodells, sondern etwas, das über die Welt geschrieben wird.
 *
 * Ein Beitrag nennt den Band, aus dessen Stoff er kommt. Sichtbar wird er nur,
 * wenn dieser Band öffentlich ist — dieselbe Regel wie überall sonst, damit ein
 * Beitrag nicht verrät, was der Band noch verschweigt.
 */
export interface Beitrag {
  /** Der Kurzname in der Adresse: /blog/woher-wir-es-wissen/ */
  slug: string;
  /** Aus welchem Band der Stoff stammt. Steuert die Sichtbarkeit. */
  bandId: BandId;
  titel: string;
  /** Erscheinungsdatum, ISO. Beiträge in der Zukunft bleiben unsichtbar. */
  datum: string;
  /** Ein Satz für Übersicht, Suchmaschine und Vorschau. */
  auszug: string;
  /** Fließtext. Jeder Eintrag ein Absatz; eine Zeile mit '## ' wird Zwischentitel. */
  absaetze: string[];
}

export const BEITRAEGE: Beitrag[] = [
  {
    slug: 'woher-wir-es-wissen',
    bandId: 'band-1',
    titel: 'Warum in diesem Buch auf jeder Seite steht, woher wir es wissen',
    datum: '2026-08-26',
    auszug:
      'Die meisten Sachbücher erzählen sicher. Dieses unterscheidet zwischen gesichert, wahrscheinlich und offen — und sagt bei jeder Aussage, welches davon gilt.',
    absaetze: [
      'Es gibt einen Satz, der in populären Geschichtsbüchern erstaunlich oft steht: „Man nimmt an." Er klingt bescheiden, aber er ist ein Trick. Er behauptet etwas, ohne dafür geradezustehen, und überlässt es dem Lesenden, den Unterschied zwischen einer gut belegten Rekonstruktion und einer hübschen Vermutung selbst zu erraten.',
      'Die Unsichtbaren Fäden macht das anders. Jede Aussage im Buch trägt eine Stufe zwischen A und G. A heißt: mehrfach unabhängig belegt. G heißt: widerlegt, wird hier nur genannt, weil die Behauptung im Umlauf ist. Dazwischen liegen die Abstufungen, in denen die meiste Geschichte tatsächlich stattfindet.',
      '## Warum das unbequem ist',
      'Eine solche Kennzeichnung kostet Dramatik. Wo andere Bücher eine Szene ausmalen, steht hier manchmal, dass wir schlicht nicht wissen, wie es war — nur, was danach nachweisbar anders lief. Das ist weniger spannend zu lesen und deutlich schwerer zu schreiben.',
      'Es hat aber einen Vorteil, der alles andere aufwiegt: Man kann dem Buch widersprechen. Wer eine Stufe für zu hoch hält, findet die Grundlage genannt und kann sie prüfen. Ein Buch, das sich nicht widerlegen lässt, ist kein Sachbuch, sondern eine Erzählung mit Fußnoten.',
      '## Auch die Bilder sagen es',
      'Dieselbe Regel gilt für die Abbildungen. Kein Motiv in diesem Band ist eine historische Fotografie — es gab keine. Jedes Bild trägt deshalb seine Herkunft: gesicherter Befund, Rekonstruktion auf Grundlage von Befunden, oder freie Rekonstruktion. Ein Bild, das aussieht wie ein Beweis, ohne einer zu sein, wäre die stillste Form der Unwahrheit.',
      'Wer wissen will, wie weit das getrieben ist: Die begehbare Welt zur Reihe zeigt zu jedem Motiv dieselbe Angabe wie das gedruckte Buch — an derselben Stelle, in derselben Ausführlichkeit.',
    ],
  },
  {
    slug: 'was-ein-unsichtbarer-faden-ist',
    bandId: 'band-1',
    titel: 'Was ein unsichtbarer Faden ist',
    datum: '2026-08-29',
    auszug:
      'Der Titel der Reihe ist kein Bild für Schicksal oder Zufall. Er meint etwas Prüfbares: eine Wirkung, die über Jahrhunderte trägt, ohne dass die Beteiligten davon wussten.',
    absaetze: [
      'Ein Faden in diesem Buch ist keine Metapher für Schicksal. Er ist eine nachvollziehbare Kette: Eine Entscheidung wird getroffen, aus einem naheliegenden Grund, ohne jede große Absicht — und Jahrhunderte später hängt daran etwas, das mit dem ursprünglichen Anlass nichts mehr zu tun hat.',
      'Das Kennzeichen eines solchen Fadens ist, dass niemand ihn gespannt hat. Es gibt keinen Plan, keine Verschwörung, keinen Steuermann. Es gibt nur die unangenehme Tatsache, dass Folgen länger leben als Absichten.',
      '## Warum das der schwierigere Gedanke ist',
      'Es wäre einfacher, hinter langen Entwicklungen jemanden zu vermuten. Verschwörungen sind bequem: Sie geben der Geschichte einen Autor und uns jemanden, dem wir es vorwerfen können. Ein unsichtbarer Faden ist das Gegenteil. Er zeigt, wie viel Wirkung ohne Urheber entsteht — und dass die meisten Weichen von Leuten gestellt wurden, die nicht ahnten, dass sie an einer standen.',
      'Genau deshalb endet jedes Kapitel mit einer Bilanz: Was ist an dieser Stelle wirklich passiert, und was davon wirkt heute noch? Nicht als Pointe, sondern als Kassensturz.',
      '## Wo man anfängt',
      'Band 1, Ursprung und Ordnung, verfolgt die frühesten dieser Fäden — von dem Punkt, an dem Menschen anfingen, Dinge festzuhalten, bis zu den ersten Ordnungen, die länger hielten als die Menschen, die sie aufstellten.',
    ],
  },
];
