/**
 * Fachbegriffe, die im Buch in Gold hervorgehoben sind und im Glossar (S. 196–198)
 * erklärt werden. Hier stehen nur Begriffe, deren Erklärung wörtlich aus dem Band
 * übernommen werden konnte.
 *
 * Das vollständige Glossar des Bandes umfasst mehr Einträge. Es wird nachgetragen,
 * sobald der Text als Datei vorliegt – aus einer Texterkennung übernommen wäre er
 * an zu vielen Stellen still verfälscht, und ein Glossar mit falschen Erklärungen
 * ist schlimmer als ein kurzes.
 */
export interface Begriff {
  id: string;
  wort: string;
  /** Weitere Schreibweisen, die im Text vorkommen. */
  formen?: string[];
  erklaerung: string;
  seite: number;
}

export const BEGRIFFE: Begriff[] = [
  { id: 'in-situ', wort: 'in situ', formen: ['In situ'], seite: 15,
    erklaerung: 'Lateinisch für „an Ort und Stelle“. Ein Fund, der unverlagert in seiner Schicht liegt, ist datierbar.' },
  { id: 'stratigrafie', wort: 'Stratigrafie', seite: 15,
    erklaerung: 'Die Abfolge der Erdschichten. Was unten liegt, ist in der Regel älter als das darüber.' },
  { id: 'fundlage', wort: 'Fundlage', seite: 15,
    erklaerung: 'Die Lage eines Fundes in der Schicht. Sie ist oft wichtiger als der Fund selbst, weil verlagerte Stücke sich nicht zuordnen lassen.' },
  { id: 'domestikationssyndrom', wort: 'Domestikationssyndrom', seite: 43,
    erklaerung: 'Das Bündel von Merkmalen, das Kulturpflanzen von ihren wilden Vorfahren trennt – beim Getreide vor allem die Ähre, die nicht mehr von selbst zerfällt.' },
  { id: 'gruenderkulturen', wort: 'Gründerkulturen', seite: 49,
    erklaerung: 'Die acht Pflanzen, die sich als gemeinsames Paket ausbreiteten und die Grundlage des frühen Ackerbaus bildeten.' },
  { id: 'geschichtshaus', wort: 'Geschichtshaus', seite: 66,
    erklaerung: 'Hodders Begriff für Häuser mit auffällig vielen Bestattungen und reicher Ausstattung.' },
  { id: 'achaemeniden', wort: 'Achämeniden', seite: 101,
    erklaerung: 'Persische Herrscherdynastie, 550 bis 330 v. Chr. Auf ihrem Höhepunkt das größte Reich, das es bis dahin gegeben hatte.' },
  { id: 'satrapie', wort: 'Satrapie', formen: ['Satrapien'], seite: 101,
    erklaerung: 'Provinz unter einem königlichen Statthalter. Steuern und Truppen kamen aus ihr, Befehle gingen in sie hinein.' },
  { id: 'pirradazis', wort: 'Pirradaziš', seite: 101,
    erklaerung: 'Persischer Name des Kuriersystems, in Verwaltungstafeln aus Persepolis belegt.' },
  { id: 'hoehle-17', wort: 'Höhle 17', seite: 159,
    erklaerung: 'Eine Kammer von wenigen Metern in Dunhuang, hinter einer bemalten Wand verborgen, um 1002 zugemauert und 1900 wiederentdeckt.' },
];

/** Alle Schreibweisen, nach Länge sortiert – längere zuerst, damit sie zuerst greifen. */
export const BEGRIFF_FORMEN: { form: string; begriff: Begriff }[] = BEGRIFFE
  .flatMap((b) => [b.wort, ...(b.formen ?? [])].map((form) => ({ form, begriff: b })))
  .sort((a, b) => b.form.length - a.form.length);
