import { ADVANCED_GERMAN_CARDS } from "./advanced-reference.js";

// German A1–C2 reference: foundations, independent use and nuanced expression.
const slider = {
  mode: "fixed_first_slider", fixedColumns: 1,
  desktopVisibleDataColumns: 2, mobileVisibleDataColumns: 2,
};

export const GERMAN_REFERENCE_INTRO = {
  title: "Deutsch von A1 bis C2. Klar, sicher, präzise.",
  description: "Nachschlagen, auffrischen, weiterdenken: von den ersten Satzmustern bis zu differenzierter Argumentation und feinen Bedeutungsnuancen. Wähle deinen Schwerpunkt – Grundlagen bleiben auf jeder Stufe nützlich.",
  levelNote: "Die Stufen dienen zur Orientierung, nicht als starre Grenzen oder vollständiger Prüfungslehrplan. C2 heißt auch: einfach, treffend und situationsgerecht formulieren.",
  steps: ["1 · Regel lesen", "2 · Beispiel vergleichen", "3 · Selbst ausprobieren"],
  lookup: "Ein Wort ist unklar? Diese Wörterbücher suchen nach dem Wort aus deiner aktuellen Lernkarte.",
};

const additions = {
  grammar_tenses_primary: {
    level: "Basis & Vertiefung · Zeitformen", title: "Wann passiert etwas? Die Zeitformen",
    description: "Präsens für jetzt und Regelmäßiges; Perfekt häufig für Vergangenes im Gespräch. Präteritum begegnet dir besonders in Erzählungen – bei sein und haben auch oft im Alltag.",
    examples: [
      ["Jetzt", "Ich sage es dir jetzt."],
      ["Vergangenheit", "Ich habe es dir gestern gesagt."],
      ["Vorher passiert", "Ich hatte es schon gesagt, bevor du kamst."],
    ],
    tip: "Zukunft geht auch mit Präsens + Zeitangabe: Morgen sage ich es dir. Futur I: Ich werde es dir sagen. Sie (höflich) hat dieselben Verbformen wie sie (Plural).",
    practice: ["Ergänze: Gestern ___ ich Deutsch gelernt.", "habe → Gestern habe ich Deutsch gelernt."],
  },
  grammar_voice_primary: {
    level: "Vertiefung · Aktiv & Passiv", title: "Wer handelt – und was passiert?",
    description: "Im Aktiv steht die handelnde Person im Mittelpunkt. Im Vorgangspassiv zählt, was mit jemandem oder etwas geschieht: werden + Partizip II.",
    examples: [["Aktiv", "Die Frau trägt den Koffer."], ["Passiv", "Der Koffer wird von der Frau getragen."]],
    tip: "Achtung: Ich trage = ich mache es. Ich werde getragen = jemand trägt mich. Verwechsle Passiv und Zukunft nicht: wird getragen (Passiv) · wird tragen (Futur).",
    practice: ["Bilde das Passiv: Der Mann öffnet die Tür.", "Die Tür wird geöffnet. Optional: Die Tür wird von dem Mann geöffnet."],
  },
  grammar_cases_primary: {
    level: "A1–A2 · Die vier Fälle", title: "Welche Rolle hat das Nomen?",
    description: "Nominativ: Wer oder was? Akkusativ: Wen oder was? Dativ: Wem? Genitiv: Wessen? Verben und Präpositionen bestimmen oft den Fall.",
    examples: [["Wer? / Wem? / Was?", "Die Frau gibt dem Kind ein Buch."], ["Wessen?", "Das ist das Fahrrad des Kindes."]],
    tip: "Lerne Nomen immer mit Artikel und Plural: der Fisch, die Fische. Im Dativ Plural kommt meist -n hinzu: mit den Kindern; aber mit den Autos. Genitiv-Pronomen wie meiner sind selten – sie sind keine Possessivartikel wie mein.",
    practice: ["Ergänze: Ich helfe ___ Mann. (der Mann)", "dem → Ich helfe dem Mann. Das Verb helfen verlangt den Dativ."],
  },
};

const extraCards = [
  {
    id: "german_articles", level: "A1–A2 · Artikel", title: "ein, eine, einen – die Endung zählt",
    description: "Der unbestimmte Artikel richtet sich nach Genus und Fall. Im Plural gibt es keinen unbestimmten Artikel: ein Buch → Bücher. Kein kann dagegen auch im Plural stehen.",
    columns: ["Fall", "Maskulin", "Feminin", "Neutrum", "Plural ohne Artikel"],
    rows: [
      ["Nominativ", "ein Mann", "eine Frau", "ein Kind", "Kinder"],
      ["Akkusativ", "einen Mann", "eine Frau", "ein Kind", "Kinder"],
      ["Dativ", "einem Mann", "einer Frau", "einem Kind", "Kindern"],
      ["Genitiv", "eines Mannes", "einer Frau", "eines Kindes", "—"],
    ],
    examples: [["Wer?", "Ein Mann wartet."], ["Wen?", "Ich sehe einen Mann."]],
    tip: "Mein und kein folgen bei diesen Formen demselben Muster wie ein: mein Kind, meinem Kind; kein Mann, keinen Mann. Ein Genitiv Plural ohne Artikel braucht oft weitere Kennzeichnung, etwa: die Rechte kleiner Kinder.",
    practice: ["Ergänze: Ich sehe ___ Hund. (ein Hund)", "einen → Ich sehe einen Hund. sehen + Akkusativ."],
  },
  {
    id: "german_core_verbs", level: "A1 · Unverzichtbare Verben", title: "sein, haben & Modalverben",
    description: "Diese Formen brauchst du täglich. Nach können und müssen steht der zweite Verbteil als Infinitiv am Satzende – ohne zu.",
    columns: ["Person", "sein", "haben", "können", "müssen"],
    rows: [
      ["ich", "bin", "habe", "kann", "muss"], ["du", "bist", "hast", "kannst", "musst"],
      ["er/sie/es", "ist", "hat", "kann", "muss"], ["wir", "sind", "haben", "können", "müssen"],
      ["ihr", "seid", "habt", "könnt", "müsst"], ["sie / Sie", "sind", "haben", "können", "müssen"],
    ],
    examples: [["sein / haben", "Ich bin müde. Ich habe Zeit."], ["Modalverb", "Du kannst heute Deutsch üben."]],
    tip: "Perfekt mit haben: Ich habe gelernt. Häufig mit sein bei Ortswechsel oder Zustandswechsel: Ich bin gefahren. Ich bin eingeschlafen.",
    practice: ["Ergänze: Du ___ heute arbeiten. (müssen)", "musst → Du musst heute arbeiten."],
  },
  {
    id: "german_sentence_order", level: "A1–A2 · Satzbau", title: "Wo steht das Verb?",
    description: "Im Aussagesatz steht das konjugierte Verb auf Position 2. Position bedeutet Satzteil, nicht einzelnes Wort. Nach einer Zeitangabe folgt also direkt das Verb.",
    columns: ["Satztyp", "Muster", "Beispiel"],
    rows: [
      ["Aussage", "Satzteil + Verb + Rest", "Ich lerne heute Deutsch."],
      ["Zeit zuerst", "Zeit + Verb + Subjekt", "Heute lerne ich Deutsch."],
      ["Ja/Nein-Frage", "Verb + Subjekt + Rest?", "Lernst du Deutsch?"],
      ["W-Frage", "Fragewort + Verb + Subjekt?", "Wann lernst du Deutsch?"],
      ["Nebensatz", "weil / dass + … + Verb", "Ich bleibe, weil ich Zeit habe."],
      ["Trennbares Verb", "Verb … Vorsilbe", "Ich rufe dich morgen an."],
      ["Perfekt", "haben / sein … Partizip II", "Ich habe gestern gelernt."],
    ],
    tip: "Satzklammer: Ich muss heute arbeiten. Ich habe heute gearbeitet. Im Nebensatz steht das konjugierte Verb am Ende: … weil ich heute arbeiten muss.",
    practice: ["Ordne: morgen / ich / nach Berlin / fahre", "Morgen fahre ich nach Berlin. Auch richtig: Ich fahre morgen nach Berlin."],
  },
  {
    id: "german_prepositions", level: "A1–A2 · Präpositionen", title: "Wo? Wohin? Mit wem?",
    description: "Lerne Präposition und Fall zusammen. Bei Wechselpräpositionen entscheidet die Bedeutung: Ort (wo?) → Dativ; Ziel oder neue Position (wohin?) → Akkusativ.",
    columns: ["Gruppe", "Präpositionen", "Beispiel"],
    rows: [
      ["Immer Dativ", "aus, bei, mit, nach, seit, von, zu", "Ich fahre mit dem Bus."],
      ["Immer Akkusativ", "durch, für, gegen, ohne, um", "Das Geschenk ist für dich."],
      ["Wechselpräpositionen", "an, auf, hinter, in, neben, über, unter, vor, zwischen", "in der Schule / in die Schule"],
      ["Wo? · Dativ", "Ort, auch bei Bewegung am Ort", "Ich laufe im Park."],
      ["Wohin? · Akkusativ", "Ziel oder neue Position", "Ich laufe in den Park."],
    ],
    examples: [["Position", "Das Buch liegt auf dem Tisch."], ["Neue Position", "Ich lege das Buch auf den Tisch."]],
    tip: "Bewegung allein bedeutet nicht Akkusativ! Häufige Kurzformen: im = in dem · ins = in das · am = an dem · zum = zu dem · zur = zu der.",
    practice: ["Ergänze: Ich lege den Schlüssel auf ___ Tisch.", "den → auf den Tisch. Wohin lege ich den Schlüssel?"],
  },
  {
    id: "german_pronouns", level: "A1 · Pronomen", title: "ich, mich, mir – die Person bleibt gleich",
    description: "Pronomen ersetzen Nomen. Ihre Form hängt von der Rolle im Satz ab: Ich sehe ihn. Er hilft mir.",
    columns: ["Nominativ", "Akkusativ", "Dativ"],
    rows: [["ich", "mich", "mir"], ["du", "dich", "dir"], ["er", "ihn", "ihm"], ["sie", "sie", "ihr"], ["es", "es", "ihm"], ["wir", "uns", "uns"], ["ihr", "euch", "euch"], ["sie (Plural)", "sie", "ihnen"], ["Sie (höflich)", "Sie", "Ihnen"]],
    tip: "Sie und Ihnen in der höflichen Anrede immer großschreiben. Häufige Dativverben: helfen, danken, gefallen, gehören.",
    practice: ["Ersetze Anna: Ich danke Anna.", "Ich danke ihr. danken + Dativ."],
  },
  {
    id: "german_negation", level: "A1–A2 · Verneinung", title: "nicht oder kein?",
    description: "Kein verneint ein Nomen mit unbestimmtem Artikel oder ohne Artikel. Nicht verneint zum Beispiel eine Handlung, eine Eigenschaft oder einen bestimmten Satzteil.",
    columns: ["Situation", "Positiv", "Negativ"],
    rows: [
      ["ein / eine + Nomen", "Ich habe ein Auto.", "Ich habe kein Auto."],
      ["Nomen ohne Artikel", "Ich habe Zeit.", "Ich habe keine Zeit."],
      ["Eigenschaft", "Das ist teuer.", "Das ist nicht teuer."],
      ["Handlung", "Ich komme heute.", "Ich komme heute nicht."],
      ["Satzklammer", "Ich kann kommen.", "Ich kann nicht kommen."],
      ["Bestimmtes Nomen", "Das ist mein Buch.", "Das ist nicht mein Buch."],
    ],
    tip: "Kein verändert sich wie ein: kein Mann · keinen Mann · keinem Mann. Die Position von nicht hängt davon ab, was du verneinst: nicht heute, sondern morgen.",
    practice: ["Ergänze: Ich trinke ___ Kaffee.", "keinen → Ich trinke keinen Kaffee. Kaffee ist maskulin und steht hier im Akkusativ."],
  },
];

export function getGermanReferenceCards(baseCards) {
  return [
    ...baseCards.map(card => {
      const lesson = { ...card, ...additions[card.id], band: "A" };
      if (card.id === "grammar_tenses_primary") {
        // Show the two most immediately useful forms first, without changing conjugations.
        lesson.columns = ["Person", "Präsens", "Perfekt", "Präteritum", "Plusquamperfekt", "Futur I"];
        lesson.rows = card.rows.map(row => [0, 2, 4, 3, 5, 1].map(index => row[index]));
      }
      return lesson;
    }),
    ...extraCards.map(card => ({ ...card, band: "A", interaction: slider, collapsed: true })),
    ...ADVANCED_GERMAN_CARDS.map(card => ({ ...card, interaction: slider, collapsed: true })),
  ];
}
