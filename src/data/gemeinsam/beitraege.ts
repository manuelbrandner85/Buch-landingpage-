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
  {
    slug: 'seit-wann-beherrscht-der-mensch-das-feuer',
    bandId: 'band-1',
    titel: 'Seit wann beherrscht der Mensch das Feuer – wie sicher ist das?',
    datum: '2026-09-01',
    auszug:
      'Regelmäßiger Feuergebrauch gilt seit rund 400.000 Jahren als gesichert. Es gibt ältere Belege – und über die wird gestritten. Beides gehört zur Antwort.',
    absaetze: [
      'Die kurze Antwort zuerst: Regelmäßiger Feuergebrauch gilt seit etwa 400.000 Jahren vor heute als gesicherter Befund. Das ist die Zahl, hinter der kaum jemand mehr streitet. Es gibt ältere Belege, deutlich ältere sogar — und über die wird bis heute gestritten. Wer nur eine Jahreszahl braucht, hat damit genug. Wer wissen will, warum in verschiedenen Büchern verschiedene Zahlen stehen, liest weiter.',
      '## Warum hier zwei Zahlen stehen und nicht eine',
      'In diesem Band trägt jede Angabe eine Stufe zwischen A und G. A heißt gesicherter Befund, B starke Indizien, E umstritten, G widerlegt — Letzteres steht nur da, weil die Behauptung im Umlauf ist. Die 400.000 Jahre tragen ein A. Die ältesten Belege tragen ein E. Beide stehen im Buch, und sie stehen nicht gleichwertig nebeneinander. Was die Stufen im Einzelnen bedeuten, ist [hier erklärt](/ueber/).',
      'Das ist der ganze Unterschied zu der Formulierung, die man sonst überall liest: „Man nimmt an, dass der Mensch das Feuer vor etwa einer Million Jahren beherrschte." Der Satz ist nicht falsch. Er sagt nur nicht, wie weit man sich dabei aus dem Fenster lehnt.',
      '## Der Fund, über den gestritten wird',
      'Die älteste viel zitierte Zahl stammt aus der [Wonderwerk-Höhle](/faeden/ort/wonderwerk/) in Südafrika: Feuerbelege aus rund einer Million Jahren. Im Band stehen sie auf den Seiten 25 und 28 — mit der Stufe E, umstritten.',
      'Umstritten heißt nicht erfunden. Es heißt: Es gibt einen Befund, es gibt eine Deutung, und es gibt Fachleute, die diese Deutung nicht teilen. Warum ein so alter Fund überhaupt strittig sein kann, versteht man am besten an der Frage, wie ein Fund sein Alter bekommt.',
      '## Warum die Fundlage wichtiger ist als der Fund',
      'Kein Knochen und kein verkohltes Holzstück trägt sein Alter in sich. Datiert wird meist nicht der Fund selbst, sondern das Gestein um ihn herum — und das funktioniert nur, wenn er ungestört in seiner Schicht lag. Der Fachbegriff dafür ist [in situ](/faeden/begriffe/#in-situ), lateinisch für „an Ort und Stelle". Die Abfolge der Erdschichten heißt [Stratigrafie](/faeden/begriffe/#stratigrafie): Was unten liegt, ist in der Regel älter als das darüber.',
      'Daraus folgt eine Angabe, die im Band die Stufe G trägt, also widerlegt: Ein einzelnes Streufundstück ist praktisch nicht datierbar. Es liegt irgendwo, aber nicht mehr dort, wo es hingehört — und damit ist die einzige Uhr weg, die man hätte ablesen können.',
      'Und eine zweite Grenze, die viele überrascht: Die Radiokarbonmethode reicht rund 50.000 Jahre zurück. Für die Menschwerdung ist das viel zu wenig. Fundplätze aus dieser Zeit arbeiten deshalb mit anderen Verfahren — Argon-Argon und Paläomagnetik neben dem Radiokarbon. Drei Uhren, drei Reichweiten, drei Fehlerquellen. Wer eine Jahreszahl liest, liest immer auch ein Verfahren mit, und dessen Grenzen. Nachzulesen auf Seite 15, im [ersten Kapitel](/faeden/kapitel/1/).',
      '## Was sich ändert, wenn eine Gruppe Feuer hat',
      'Die eigentlich interessante Frage ist ohnehin nicht, wann zum ersten Mal etwas brannte, sondern was der regelmäßige Gebrauch verändert. Ein offenes Holzfeuer erreicht rund 700 Grad — gesicherter Befund. Raubtiere meiden es, und der Schlafplatz muss nicht mehr in einer engen Spalte liegen. Das sind starke Indizien, Stufe B: Man sieht die Folgen, man war nicht dabei.',
      'Der Punkt, an dem der Band länger verweilt, ist ein anderer. Eine Gruppe mit Feuer gewinnt vier bis fünf Stunden Tageslicht. Diese Stunden taugen kaum zum Arbeiten — aber zum Reden. Es entsteht eine Zeit ohne Aufgabe. Was Menschen in ihr taten, lässt sich nicht ausgraben. Dass sie sie hatten, schon.',
      '## Und was heißt das für die Antwort oben?',
      'Dass eine ehrliche Antwort zwei Teile hat. Der erste ist die Zahl, die trägt: rund 400.000 Jahre für den regelmäßigen Gebrauch. Der zweite ist der Hinweis, dass es Älteres gibt und dass es umstritten ist. Wer nur den ersten Teil weitergibt, sagt nichts Falsches. Wer nur den zweiten weitergibt, hat die bessere Überschrift. Beides zusammen ist die Auskunft.',
      'Wie weit dieses Verfahren im Band getrieben ist, lässt sich [in der begehbaren Welt zu Band 1](/faeden/band-1/) ausprobieren: Dort steht ein Regler für die Belegstufe. Wer ihn auf A stellt, sieht, wie wenig übrig bleibt. Das ist keine Panne, sondern die Aussage.',
    ],
  },
  {
    slug: 'was-heisst-gesicherter-befund',
    bandId: 'band-1',
    titel: 'Was heißt „gesicherter Befund"? Die Stufen, mit denen dieses Buch arbeitet',
    datum: '2026-09-04',
    auszug:
      'Sieben Stufen für Aussagen, fünf Angaben für Bilder. Was jede einzelne bedeutet – und warum ein Buch, das so arbeitet, weniger behauptet als andere.',
    absaetze: [
      'Die meisten Sachbücher kennen zwei Zustände: Etwas steht drin, oder es steht nicht drin. Dieser Band kennt sieben. Jede Aussage trägt eine Stufe zwischen A und G, und die Stufe steht nicht im Anhang, sondern neben der Aussage.',
      '## Die sieben Stufen',
      'A — gesicherter Befund. Mehrfach unabhängig belegt, in der Fachwelt nicht mehr strittig.',
      'B — starke Indizien. Die Folgen sind sichtbar, der Vorgang selbst nicht beobachtet.',
      'C — plausibel, aber ohne Primärquelle. Es passt zusammen, es fehlt der direkte Beleg.',
      'D — einzelne Darstellung. Eine Quelle sagt es, keine zweite bestätigt es.',
      'E — umstritten. Es gibt Befund und Deutung, und es gibt Fachleute, die die Deutung nicht teilen.',
      'F — schwach belegt.',
      'G — widerlegt. Steht im Buch nur, weil die Behauptung im Umlauf ist und sonst unwidersprochen bliebe.',
      '## Warum das unbequem ist',
      'Eine solche Kennzeichnung kostet Dramatik. Wo andere Bücher eine Szene ausmalen, steht hier manchmal, dass wir nicht wissen, wie es war — nur, was danach nachweisbar anders lief. Das ist schwerer zu schreiben und stellenweise nüchterner zu lesen.',
      'Sie hat aber einen Vorteil, der alles aufwiegt: Man kann dem Buch widersprechen. Wer eine Stufe für zu hoch hält, findet die Grundlage genannt und kann sie prüfen. Ein Buch, das sich nicht widerlegen lässt, ist kein Sachbuch, sondern eine Erzählung mit Fußnoten.',
      '## Der Regler, der es vorführt',
      'In der [begehbaren Welt zu Band 1](/faeden/band-1/) steht ein Schieberegler. Er blendet alles aus, was schwächer belegt ist als die eingestellte Stufe, und er sagt dabei, wie viele Angaben stehen bleiben und wie viele zurücktreten. Auf der strengsten Einstellung bleibt in manchen Abschnitten fast nichts stehen.',
      'Das ist die eigentliche Aussage des Verfahrens: Der größte Teil dessen, was über die Frühzeit erzählt wird, ist nicht gesichert. Er ist plausibel. Der Unterschied verschwindet nur, weil ihn niemand hinschreibt.',
      '## Und die Bilder?',
      'Für Abbildungen gilt eine eigene Skala, weil dort eine andere Frage zu beantworten ist: nicht wie sicher, sondern woher. Der Bildnachweis auf Seite 201 kennt fünf Angaben:',
      'Gesicherter Befund — was so aussieht, weil es so gefunden wurde.',
      'Rekonstruktion auf Grundlage von Befunden — die Fundlage gibt den Rahmen vor, das Bild füllt ihn.',
      'Freie Rekonstruktion — eine Vorstellung davon, wie es gewesen sein könnte, ohne Anspruch auf mehr.',
      'Karte auf realer Geobasis — echte Geografie, gezeichnete Darstellung.',
      'Eigene Darstellung — Schema, Zeitleiste, Diagramm.',
      'Der Satz, der im Bildnachweis darüber steht, ist der wichtigste: Kein Motiv dieses Bandes ist eine historische Fotografie. Es gab keine. Ein Bild, das aussieht wie ein Beweis, ohne einer zu sein, wäre die stillste Form der Unwahrheit — und in einem Buch über Belege die eine, die man sich am wenigsten leisten kann.',
      '## Wo die Begriffe stehen',
      'Die Fachwörter, die im Band in Gold hervorgehoben sind, erklärt das Glossar auf den Seiten 196 bis 198. Auf dieser Seite stehen sie in der [Begriffssammlung](/faeden/begriffe/), jeder mit der Seite, auf der er zum ersten Mal vorkommt. Die Fundplätze und Städte führt das Ortsregister auf Seite 203; hier sind sie [auf der Karte](/faeden/) verortet.',
    ],
  },
  {
    slug: 'wer-hat-die-pyramiden-gebaut',
    bandId: 'band-1',
    titel: 'Wer hat die Pyramiden gebaut – Sklaven?',
    datum: '2026-09-07',
    auszug:
      'Nein. Die Befunde zeigen eine verwaltete, verpflegte und bezahlte Arbeitsorganisation. Seit 2013 gibt es sogar das Tagebuch eines Beteiligten.',
    absaetze: [
      'Die kurze Antwort: Nein. Für ein Sklavenheer an den Pyramiden von [Gizeh](/faeden/ort/gizeh/) gibt es null Hinweise. Was die Befunde zeigen, ist etwas anderes und in mancher Hinsicht Erstaunlicheres: eine verwaltete, verpflegte und bezahlte Arbeitsorganisation. Im Band steht diese Aussage mit der Stufe B — starke Indizien.',
      '## Der Fund, der die Frage verändert hat',
      'Im Jahr 2013 kam ein Papyrus ans Licht, der rund 4.500 Jahre alt ist: das Schichtbuch des Merer. Es ist kein Königstext und keine Inschrift für die Ewigkeit, sondern die Aufzeichnung eines Mannes, der Steine transportierte — wer wann was tat, über Monate. Gesicherter Befund, Stufe A.',
      'Der Wert eines solchen Textes liegt darin, dass er nichts beweisen wollte. Königsinschriften erzählen, wie es aussehen sollte. Ein Schichtbuch erzählt, wie der Dienstplan war.',
      '## Was die Knochen sagen',
      'Die zweite Quelle ist unangenehmer und trotzdem eindeutig. An den Skeletten der Arbeiter finden sich verheilte Brüche und abgenutzte Wirbelsäulen — die Arbeit war schwer, und sie hat Menschen kaputt gemacht. Zugleich zeigen dieselben Funde Versorgung und Bestattung. Wer verpflegt und begraben wird, ist kein Verbrauchsgut.',
      'Beides gilt gleichzeitig, und beides trägt im Band die Stufe A. Die Erzählung von den gepeitschten Sklaven ist deshalb nicht deshalb falsch, weil die Arbeit leicht gewesen wäre. Sie ist falsch, weil sie die Organisation nicht kennt, die dahinterstand.',
      '## Woher die Sklavenerzählung kommt',
      'Sie ist alt, sie ist verbreitet, und sie hat den Vorteil jeder guten Geschichte: Sie erklärt ein Rätsel mit einem Bild statt mit einer Verwaltung. Zehntausend Peitschen sind anschaulicher als ein Verpflegungsplan.',
      'Genau an dieser Stelle steht im Band ein Satz, der über das Thema hinausreicht: Aus einer Lücke im Wissen folgt nichts als die Lücke. Dass man nicht weiß, wie ein Block bewegt wurde, ist kein Argument für irgendeine bestimmte Antwort. Es ist ein Argument dafür, die Frage offen zu lassen, bis jemand etwas findet.',
      '## Warum das im sechsten Kapitel steht',
      'Das [sechste Kapitel](/faeden/kapitel/6/) heißt „Am Rand des Belegten" und handelt genau davon: von Behauptungen, die am äußeren Rand dessen stehen, was sich prüfen lässt. Es enthält auch den Maßstab dafür — eine Erklärung, die durch keinen denkbaren Fund widerlegt werden kann, ist nicht besonders stark. Sie steht außerhalb der Frage nach Belegen.',
      'Zum selben Kapitel gehört ein Gegenbeispiel, das zeigt, dass Zurückhaltung nicht Langeweile bedeutet: Die Stadt Helike an der Nordküste der Peloponnes versank 373 vor Christus tatsächlich in einer einzigen Nacht. Das ist gesichert. Für die verschollene Hochkultur dagegen, die immer wieder daraus gemacht wird, gibt es keinen Befund — Stufe G.',
      'Die Pyramidenbaustelle steht im Band auf Seite 182.',
    ],
  },
  {
    slug: 'koenigsstrasse-neun-tage-statt-neunzig',
    bandId: 'band-1',
    titel: 'Die persische Königsstraße: wie schnell war ein Kurier wirklich?',
    datum: '2026-09-10',
    auszug:
      '2.700 Kilometer, neun Tage statt neunzig. Was eine Reiterstafette leistet – und warum fast alles, was wir über Persien wissen, von seinen Kriegsgegnern stammt.',
    absaetze: [
      'Die Zahl zuerst: Zwischen [Susa](/faeden/ort/susa/) und Sardes lagen rund 2.700 Kilometer Königsstraße. Ein Fußreisender brauchte dafür etwa neunzig Tage. Eine Reiterstafette brauchte neun. Beide Angaben tragen im Band die Stufe B — starke Indizien.',
      '## Was daran das Bemerkenswerte ist',
      'Nicht die Geschwindigkeit des Pferdes. Ein Pferd war nicht schneller als anderswo. Bemerkenswert ist, dass unterwegs gewechselt wurde: Reiter und Tier wurden abgelöst, die Nachricht lief weiter. Damit hängt die Laufzeit nicht mehr an der Ausdauer eines Einzelnen, sondern an der Dichte der Stationen.',
      'Das ist der eigentliche Gegenstand des Kapitels, und es ist ein unsichtbarer Faden im Wortsinn: Eine Verwaltungsentscheidung — Stationen einrichten und unterhalten — verzehnfacht die Reichweite einer Herrschaft, ohne dass irgendjemand schneller reitet.',
      '## Warum ein Reich das braucht',
      'Ein Reich ist größer als der Blick eines Menschen. Wer in Susa sitzt und in Sardes regieren will, muss den Unterschied zwischen neun und neunzig Tagen bezahlen können — sonst regiert die Provinz sich selbst.',
      'Der Fachbegriff für diese Provinz ist [Satrapie](/faeden/begriffe/#satrapie): ein Gebiet unter einem königlichen Statthalter. Steuern und Truppen kamen aus ihr heraus, Befehle gingen in sie hinein. Das ist gesicherter Befund, Stufe A — und es ist die Bauform, die später in ganz anderen Zusammenhängen wieder auftaucht.',
      '## Der Haken, der zu jeder Zahl über Persien gehört',
      'Hier steht im Band eine Randnotiz, die wichtiger ist als die Kilometerzahl: Fast alles, was wir über Persien wissen, stammt von Griechen, die gegen Persien Krieg führten. Beide Seiten sind Parteien, keine Beobachter. Die Stufe dafür ist E — umstritten.',
      'Das entwertet die Zahlen nicht. Es sagt nur, woher sie kommen. Wer über die persische Post liest, liest griechische Bewunderung für einen Gegner — und Bewunderung ist eine Verzerrung wie jede andere, nur eine sympathischere.',
      '## Was man daraus mitnimmt',
      'Dass Reichweite selten eine Frage der Kraft ist und fast immer eine der Organisation. Und dass eine Zahl, die man weitererzählen kann — neun Tage statt neunzig —, immer zwei Angaben braucht, um mehr zu sein als eine Anekdote: woher sie stammt und wie sicher sie ist.',
      'Nachzulesen im [vierten Kapitel](/faeden/kapitel/4/), Seite 101.',
    ],
  },
];
