// ─── Category colors ──────────────────────────────────────────────
const catColors = {
  "Ingenieurwesen": "#60a5fa",
  "Argumentation":  "#f472b6",
  "Methodik":       "#4ade80",
  "Beschreibung":   "#fb923c",
  "Soft Skills":    "#a78bfa",
};

// ─── Card data ────────────────────────────────────────────────────
const allCards = [
  { source: "engineer", croatian: "inženjer", target: "der Ingenieur", cat: "Ingenieurwesen" },
  { source: "engineering", croatian: "inženjerstvo", target: "das Ingenieurwesen", cat: "Ingenieurwesen" },
  { source: "lunch break", croatian: "pauza za ručak", target: "die Mittagspause", cat: "Ingenieurwesen" },
  { source: "raised / increased", croatian: "povećan / podignut", target: "angehoben", cat: "Ingenieurwesen" },
  { source: "analysis", croatian: "analiza", target: "die Analyse", cat: "Methodik" },
  { source: "assumption", croatian: "pretpostavka", target: "die Annahme", cat: "Methodik" },
  { source: "requirement", croatian: "zahtjev", target: "die Anforderung", cat: "Methodik" },
  { source: "solution", croatian: "rješenje", target: "die Lösung", cat: "Methodik" },
  { source: "approach", croatian: "pristup", target: "der Ansatz", cat: "Methodik" },
  { source: "constraint", croatian: "ograničenje", target: "die Einschränkung", cat: "Methodik" },
  { source: "implementation", croatian: "provedba", target: "die Umsetzung", cat: "Methodik" },
  { source: "evaluation", croatian: "vrednovanje", target: "die Auswertung", cat: "Methodik" },
  { source: "efficiency", croatian: "učinkovitost", target: "die Effizienz", cat: "Methodik" },
  { source: "optimization", croatian: "optimizacija", target: "die Optimierung", cat: "Methodik" },
  { source: "data", croatian: "podaci", target: "die Daten", cat: "Methodik" },
  { source: "evidence", croatian: "dokaz", target: "der Nachweis", cat: "Methodik" },
  { source: "feasible", croatian: "izvedivo", target: "realisierbar", cat: "Methodik" },
  { source: "robust", croatian: "robustan", target: "robust", cat: "Methodik" },
  { source: "scalable", croatian: "skalabilno", target: "skalierbar", cat: "Methodik" },
  { source: "method", croatian: "metoda", target: "die Methode", cat: "Methodik" },
  { source: "procedure", croatian: "postupak", target: "das Verfahren", cat: "Methodik" },
  { source: "structure", croatian: "struktura", target: "die Struktur", cat: "Methodik" },
  { source: "model", croatian: "model", target: "das Modell", cat: "Methodik" },
  { source: "simulation", croatian: "simulacija", target: "die Simulation", cat: "Methodik" },
  { source: "measurement", croatian: "mjerenje", target: "die Messung", cat: "Methodik" },
  { source: "accuracy", croatian: "točnost", target: "die Genauigkeit", cat: "Methodik" },
  { source: "approximation", croatian: "aproksimacija", target: "die Näherung", cat: "Methodik" },
  { source: "parameter", croatian: "parametar", target: "der Parameter", cat: "Methodik" },
  { source: "boundary condition", croatian: "rubni uvjet", target: "die Randbedingung", cat: "Methodik" },
  { source: "proof", croatian: "dokaz", target: "der Beweis", cat: "Methodik" },
  { source: "hypothesis", croatian: "hipoteza", target: "die Hypothese", cat: "Methodik" },
  { source: "verification", croatian: "verifikacija", target: "die Verifikation", cat: "Methodik" },
  { source: "validation", croatian: "validacija", target: "die Validierung", cat: "Methodik" },
  { source: "result", croatian: "rezultat", target: "das Ergebnis", cat: "Methodik" },
  { source: "to assume", croatian: "pretpostaviti", target: "annehmen", cat: "Methodik" },
  { source: "to conclude", croatian: "zaključiti", target: "schlussfolgern", cat: "Methodik" },
  { source: "to emphasize", croatian: "naglasiti", target: "hervorheben", cat: "Methodik" },
  { source: "to clarify", croatian: "razjasniti", target: "klarstellen", cat: "Methodik" },
  { source: "to evaluate", croatian: "procijeniti", target: "bewerten", cat: "Methodik" },
  { source: "to verify", croatian: "provjeriti", target: "überprüfen", cat: "Methodik" },
  { source: "to derive", croatian: "izvesti", target: "ableiten", cat: "Methodik" },
  { source: "to observe", croatian: "promatrati", target: "beobachten", cat: "Methodik" },
  { source: "to quantify", croatian: "kvantificirati", target: "quantifizieren", cat: "Methodik" },
  { source: "to generalize", croatian: "generalizirati", target: "verallgemeinern", cat: "Methodik" },
  { source: "completely", croatian: "potpuno", target: "vollkommen", cat: "Argumentation" },
  { source: "conviction", croatian: "uvjerenje", target: "die Überzeugung", cat: "Argumentation" },
  { source: "objection", croatian: "prigovor", target: "der Einwand", cat: "Argumentation" },
  { source: "empirical", croatian: "empirijski", target: "empirisch", cat: "Argumentation" },
  { source: "based on", croatian: "na temelju", target: "aufbauend auf", cat: "Argumentation" },
  { source: "to specify", croatian: "precizirati", target: "präzisieren", cat: "Argumentation" },
  { source: "discussion", croatian: "rasprava", target: "die Diskussion", cat: "Argumentation" },
  { source: "conclusion", croatian: "zaključak", target: "die Schlussfolgerung", cat: "Argumentation" },
  { source: "trade-off", croatian: "kompromis ciljeva", target: "der Zielkonflikt", cat: "Argumentation" },
  { source: "risk", croatian: "rizik", target: "das Risiko", cat: "Argumentation" },
  { source: "uncertainty", croatian: "neizvjesnost", target: "die Unsicherheit", cat: "Argumentation" },
  { source: "argument", croatian: "argument", target: "das Argument", cat: "Argumentation" },
  { source: "counterargument", croatian: "protuargument", target: "das Gegenargument", cat: "Argumentation" },
  { source: "justification", croatian: "obrazloženje", target: "die Begründung", cat: "Argumentation" },
  { source: "reasoning", croatian: "argumentacija", target: "die Argumentation", cat: "Argumentation" },
  { source: "statement", croatian: "izjava", target: "die Aussage", cat: "Argumentation" },
  { source: "claim", croatian: "tvrdnja", target: "die Behauptung", cat: "Argumentation" },
  { source: "position", croatian: "stav", target: "die Position", cat: "Argumentation" },
  { source: "standpoint", croatian: "stajalište", target: "der Standpunkt", cat: "Argumentation" },
  { source: "assessment", croatian: "procjena", target: "die Einschätzung", cat: "Argumentation" },
  { source: "consideration", croatian: "razmatranje", target: "die Abwägung", cat: "Argumentation" },
  { source: "to justify", croatian: "opravdati", target: "begründen", cat: "Argumentation" },
  { source: "to question", croatian: "preispitati", target: "hinterfragen", cat: "Argumentation" },
  { source: "to support", croatian: "potkrijepiti", target: "untermauern", cat: "Argumentation" },
  { source: "to contradict", croatian: "proturječiti", target: "widersprechen", cat: "Argumentation" },
  { source: "to refute", croatian: "opovrgnuti", target: "widerlegen", cat: "Argumentation" },
  { source: "to illustrate", croatian: "ilustrirati", target: "veranschaulichen", cat: "Argumentation" },
  { source: "relevant", croatian: "relevantno", target: "relevant", cat: "Argumentation" },
  { source: "significant", croatian: "značajno", target: "signifikant", cat: "Argumentation" },
  { source: "negligible", croatian: "zanemarivo", target: "vernachlässigbar", cat: "Argumentation" },
  { source: "substantial", croatian: "znatno", target: "substanziell", cat: "Argumentation" },
  { source: "coherent", croatian: "koherentno", target: "kohärent", cat: "Argumentation" },
  { source: "consistent", croatian: "dosljedno", target: "konsistent", cat: "Argumentation" },
  { source: "plausible", croatian: "uvjerljivo", target: "plausibel", cat: "Argumentation" },
  { source: "questionable", croatian: "upitno", target: "fragwürdig", cat: "Argumentation" },
  { source: "conclusive", croatian: "odlučujuće", target: "ausschlaggebend", cat: "Argumentation" },
  { source: "tentative", croatian: "preliminarno", target: "vorläufig", cat: "Argumentation" },
  { source: "framework", croatian: "okvir", target: "der Rahmen", cat: "Argumentation" },
  { source: "context", croatian: "kontekst", target: "der Kontext", cat: "Argumentation" },
  { source: "scope", croatian: "opseg", target: "der Umfang", cat: "Argumentation" },
  { source: "perspective", croatian: "perspektiva", target: "die Perspektive", cat: "Argumentation" },
  { source: "objective", croatian: "cilj", target: "das Ziel", cat: "Argumentation" },
  { source: "criterion", croatian: "kriterij", target: "das Kriterium", cat: "Argumentation" },
  { source: "priority", croatian: "prioritet", target: "die Priorität", cat: "Argumentation" },
  { source: "dependency", croatian: "ovisnost", target: "die Abhängigkeit", cat: "Argumentation" },
  { source: "interaction", croatian: "međudjelovanje", target: "die Wechselwirkung", cat: "Argumentation" },
  { source: "implication", croatian: "posljedica", target: "die Auswirkung", cat: "Argumentation" },
  { source: "advantage", croatian: "prednost", target: "der Vorteil", cat: "Argumentation" },
  { source: "disadvantage", croatian: "nedostatak", target: "der Nachteil", cat: "Argumentation" },
  { source: "limitation", croatian: "ograničenje", target: "die Begrenzung", cat: "Argumentation" },
  { source: "potential", croatian: "potencijal", target: "das Potenzial", cat: "Argumentation" },
  { source: "feasibility", croatian: "izvedivost", target: "die Machbarkeit", cat: "Argumentation" },
  { source: "reliability", croatian: "pouzdanost", target: "die Zuverlässigkeit", cat: "Argumentation" },
  { source: "complexity", croatian: "složenost", target: "die Komplexität", cat: "Argumentation" },
  { source: "effort", croatian: "napor / trud", target: "der Aufwand", cat: "Argumentation" },
  { source: "benefit", croatian: "korist", target: "der Nutzen", cat: "Argumentation" },
  { source: "tradeoff", croatian: "kompromis", target: "der Kompromiss", cat: "Argumentation" },
  { source: "in principle", croatian: "načelno", target: "grundsätzlich", cat: "Argumentation" },
  { source: "in practice", croatian: "u praksi", target: "in der Praxis", cat: "Argumentation" },
  { source: "in contrast", croatian: "za razliku", target: "im Gegensatz", cat: "Argumentation" },
  { source: "on the one hand", croatian: "s jedne strane", target: "einerseits", cat: "Argumentation" },
  { source: "on the other hand", croatian: "s druge strane", target: "andererseits", cat: "Argumentation" },
  { source: "with respect to", croatian: "s obzirom na", target: "hinsichtlich", cat: "Argumentation" },
  { source: "to a certain extent", croatian: "u određenoj mjeri", target: "in gewissem Maße", cat: "Argumentation" },
  { source: "as a result", croatian: "kao posljedica toga", target: "infolgedessen", cat: "Argumentation" },
  { source: "therefore", croatian: "stoga", target: "daher", cat: "Argumentation" },
  { source: "nevertheless", croatian: "ipak", target: "dennoch", cat: "Argumentation" },
  { source: "to increase", croatian: "povećati", target: "steigern", cat: "Argumentation" },
  { source: "to reduce", croatian: "smanjiti", target: "reduzieren", cat: "Argumentation" },
  { source: "to maintain", croatian: "održavati", target: "aufrechterhalten", cat: "Argumentation" },
  { source: "to adjust", croatian: "prilagoditi", target: "anpassen", cat: "Argumentation" },
  { source: "located", croatian: "smješten", target: "gelegen", cat: "Beschreibung" },
  { source: "positioned", croatian: "pozicioniran", target: "positioniert", cat: "Beschreibung" },
  { source: "aligned", croatian: "poravnat", target: "ausgerichtet", cat: "Beschreibung" },
  { source: "offset", croatian: "pomaknut", target: "versetzt", cat: "Beschreibung" },
  { source: "adjacent", croatian: "susjedan", target: "angrenzend", cat: "Beschreibung" },
  { source: "overlapping", croatian: "preklapajući", target: "überlappend", cat: "Beschreibung" },
  { source: "embedded", croatian: "ugrađen", target: "eingebettet", cat: "Beschreibung" },
  { source: "exposed", croatian: "izložen", target: "freigelegt", cat: "Beschreibung" },
  { source: "central", croatian: "središnji", target: "zentral", cat: "Beschreibung" },
  { source: "peripheral", croatian: "periferni", target: "peripher", cat: "Beschreibung" },
  { source: "horizontal", croatian: "vodoravno", target: "horizontal", cat: "Beschreibung" },
  { source: "vertical", croatian: "okomito", target: "vertikal", cat: "Beschreibung" },
  { source: "diagonal", croatian: "dijagonalno", target: "diagonal", cat: "Beschreibung" },
  { source: "symmetrical", croatian: "simetrično", target: "symmetrisch", cat: "Beschreibung" },
  { source: "asymmetrical", croatian: "asimetrično", target: "asymmetrisch", cat: "Beschreibung" },
  { source: "layered", croatian: "slojevito", target: "geschichtet", cat: "Beschreibung" },
  { source: "compact", croatian: "kompaktno", target: "kompakt", cat: "Beschreibung" },
  { source: "elongated", croatian: "izduženo", target: "langgestreckt", cat: "Beschreibung" },
  { source: "bulky", croatian: "masivno", target: "massiv", cat: "Beschreibung" },
  { source: "slender", croatian: "vitko", target: "schlank", cat: "Beschreibung" },
  { source: "surface", croatian: "površina", target: "die Oberfläche", cat: "Beschreibung" },
  { source: "edge", croatian: "rub", target: "die Kante", cat: "Beschreibung" },
  { source: "corner", croatian: "kut", target: "die Ecke", cat: "Beschreibung" },
  { source: "interior", croatian: "unutrašnjost", target: "das Innere", cat: "Beschreibung" },
  { source: "exterior", croatian: "vanjština", target: "das Äußere", cat: "Beschreibung" },
  { source: "transition", croatian: "prijelaz", target: "der Übergang", cat: "Beschreibung" },
  { source: "junction", croatian: "spoj", target: "die Verbindung", cat: "Beschreibung" },
  { source: "gap", croatian: "razmak", target: "der Spalt", cat: "Beschreibung" },
  { source: "alignment", croatian: "poravnanje", target: "die Ausrichtung", cat: "Beschreibung" },
  { source: "orientation", croatian: "orijentacija", target: "die Orientierung", cat: "Beschreibung" },
  { source: "slightly", croatian: "blago", target: "leicht", cat: "Beschreibung" },
  { source: "moderately", croatian: "umjereno", target: "mäßig", cat: "Beschreibung" },
  { source: "considerably", croatian: "znatno", target: "erheblich", cat: "Beschreibung" },
  { source: "barely", croatian: "jedva", target: "kaum", cat: "Beschreibung" },
  { source: "predominantly", croatian: "pretežno", target: "überwiegend", cat: "Beschreibung" },
  { source: "partially", croatian: "djelomično", target: "teilweise", cat: "Beschreibung" },
  { source: "fully", croatian: "potpuno", target: "vollständig", cat: "Beschreibung" },
  { source: "evenly", croatian: "ravnomjerno", target: "gleichmäßig", cat: "Beschreibung" },
  { source: "unevenly", croatian: "neravnomjerno", target: "ungleichmäßig", cat: "Beschreibung" },
  { source: "irregular", croatian: "nepravilan", target: "unregelmäßig", cat: "Beschreibung" },
  { source: "appearance", croatian: "izgled", target: "das Erscheinungsbild", cat: "Beschreibung" },
  { source: "condition", croatian: "stanje", target: "der Zustand", cat: "Beschreibung" },
  { source: "well-maintained", croatian: "dobro održavan", target: "gepflegt", cat: "Beschreibung" },
  { source: "worn", croatian: "istrošen", target: "abgenutzt", cat: "Beschreibung" },
  { source: "damaged", croatian: "oštećen", target: "beschädigt", cat: "Beschreibung" },
  { source: "intact", croatian: "netaknut", target: "intakt", cat: "Beschreibung" },
  { source: "smooth", croatian: "glatko", target: "glatt", cat: "Beschreibung" },
  { source: "rough", croatian: "grubo", target: "rau", cat: "Beschreibung" },
  { source: "matte", croatian: "mat", target: "matt", cat: "Beschreibung" },
  { source: "glossy", croatian: "sjajno", target: "glänzend", cat: "Beschreibung" },
  { source: "transparent", croatian: "prozirno", target: "transparent", cat: "Beschreibung" },
  { source: "opaque", croatian: "neprozirno", target: "blickdicht", cat: "Beschreibung" },
  { source: "solid", croatian: "čvrsto", target: "massiv", cat: "Beschreibung" },
  { source: "fragile", croatian: "krhko", target: "fragil", cat: "Beschreibung" },
  { source: "stable", croatian: "stabilno", target: "stabil", cat: "Beschreibung" },
  { source: "flexible", croatian: "fleksibilno", target: "flexibel", cat: "Beschreibung" },
  { source: "rigid", croatian: "kruto", target: "starr", cat: "Beschreibung" },
  { source: "lightweight", croatian: "lagano", target: "leichtgewichtig", cat: "Beschreibung" },
  { source: "heavy", croatian: "teško", target: "schwer", cat: "Beschreibung" },
  { source: "balanced", croatian: "uravnoteženo", target: "ausgewogen", cat: "Beschreibung" },
  { source: "impression", croatian: "dojam", target: "der Eindruck", cat: "Beschreibung" },
  { source: "noticeable", croatian: "uočljivo", target: "auffällig", cat: "Beschreibung" },
  { source: "subtle", croatian: "suptilno", target: "dezent", cat: "Beschreibung" },
  { source: "dominant", croatian: "dominantno", target: "dominant", cat: "Beschreibung" },
  { source: "restrained", croatian: "suzdržano", target: "zurückhaltend", cat: "Beschreibung" },
  { source: "elegant", croatian: "elegantno", target: "elegant", cat: "Beschreibung" },
  { source: "functional", croatian: "funkcionalno", target: "funktional", cat: "Beschreibung" },
  { source: "practical", croatian: "praktično", target: "praktisch", cat: "Beschreibung" },
  { source: "aesthetic", croatian: "estetski", target: "ästhetisch", cat: "Beschreibung" },
  { source: "unobtrusive", croatian: "neupadljivo", target: "unaufdringlich", cat: "Beschreibung" },
  { source: "visually", croatian: "vizualno", target: "optisch", cat: "Beschreibung" },
  { source: "tactile", croatian: "taktilno", target: "haptisch", cat: "Beschreibung" },
  { source: "perceptible", croatian: "zamjetljivo", target: "wahrnehmbar", cat: "Beschreibung" },
  { source: "distinct", croatian: "jasno", target: "deutlich", cat: "Beschreibung" },
  { source: "faint", croatian: "slabo", target: "schwach", cat: "Beschreibung" },
  { source: "prominent", croatian: "istaknuto", target: "markant", cat: "Beschreibung" },
  { source: "uniform", croatian: "ujednačeno", target: "einheitlich", cat: "Beschreibung" },
  { source: "varied", croatian: "raznovrsno", target: "abwechslungsreich", cat: "Beschreibung" },
  { source: "consistent look", croatian: "skladna cjelina", target: "stimmiges Gesamtbild", cat: "Beschreibung" },
  { source: "overall", croatian: "ukupno", target: "insgesamt", cat: "Beschreibung" },
  { source: "experience", croatian: "iskustvo", target: "die Erfahrung", cat: "Soft Skills" },
  { source: "memory", croatian: "sjećanje", target: "die Erinnerung", cat: "Soft Skills" },
  { source: "moment", croatian: "trenutak", target: "der Moment", cat: "Soft Skills" },
  { source: "situation", croatian: "situacija", target: "die Situation", cat: "Soft Skills" },
  { source: "encounter", croatian: "susret", target: "die Begegnung", cat: "Soft Skills" },
  { source: "routine", croatian: "rutina", target: "die Routine", cat: "Soft Skills" },
  { source: "change", croatian: "promjena", target: "die Veränderung", cat: "Soft Skills" },
  { source: "development", croatian: "razvoj", target: "die Entwicklung", cat: "Soft Skills" },
  { source: "phase", croatian: "faza", target: "die Phase", cat: "Soft Skills" },
  { source: "to notice", croatian: "primijetiti", target: "bemerken", cat: "Soft Skills" },
  { source: "to realize", croatian: "shvatiti", target: "erkennen", cat: "Soft Skills" },
  { source: "to recall", croatian: "prisjetiti se", target: "sich erinnern", cat: "Soft Skills" },
  { source: "to reflect", croatian: "razmišljati", target: "reflektieren", cat: "Soft Skills" },
  { source: "to appreciate", croatian: "cijeniti", target: "schätzen", cat: "Soft Skills" },
  { source: "to enjoy", croatian: "uživati", target: "genießen", cat: "Soft Skills" },
  { source: "to struggle", croatian: "teško se nositi", target: "sich schwertun", cat: "Soft Skills" },
  { source: "to manage", croatian: "savladati", target: "bewältigen", cat: "Soft Skills" },
  { source: "to adapt", croatian: "prilagoditi se", target: "sich anpassen", cat: "Soft Skills" },
  { source: "to improve", croatian: "poboljšati se", target: "sich verbessern", cat: "Soft Skills" },
  { source: "conversation", croatian: "razgovor", target: "das Gespräch", cat: "Soft Skills" },
  { source: "exchange", croatian: "razmjena", target: "der Austausch", cat: "Soft Skills" },
  { source: "feedback", croatian: "povratna informacija", target: "die Rückmeldung", cat: "Soft Skills" },
  { source: "coordination", croatian: "usklađivanje", target: "die Abstimmung", cat: "Soft Skills" },
  { source: "agreement", croatian: "dogovor", target: "die Einigung", cat: "Soft Skills" },
  { source: "misunderstanding", croatian: "nesporazum", target: "das Missverständnis", cat: "Soft Skills" },
  { source: "clarification", croatian: "pojašnjenje", target: "die Klärung", cat: "Soft Skills" },
  { source: "support", croatian: "podrška", target: "die Unterstützung", cat: "Soft Skills" },
  { source: "collaboration", croatian: "suradnja", target: "die Zusammenarbeit", cat: "Soft Skills" },
  { source: "responsibility", croatian: "odgovornost", target: "die Verantwortung", cat: "Soft Skills" },
  { source: "reliable", croatian: "pouzdan", target: "verlässlich", cat: "Soft Skills" },
  { source: "approachable", croatian: "pristupačan", target: "zugänglich", cat: "Soft Skills" },
  { source: "cooperative", croatian: "suradljiv", target: "kooperativ", cat: "Soft Skills" },
  { source: "considerate", croatian: "obziran", target: "rücksichtsvoll", cat: "Soft Skills" },
  { source: "direct", croatian: "direktan", target: "direkt", cat: "Soft Skills" },
  { source: "open", croatian: "otvoren", target: "offen", cat: "Soft Skills" },
  { source: "constructive", croatian: "konstruktivan", target: "konstruktiv", cat: "Soft Skills" },
  { source: "objective", croatian: "objektivan", target: "sachlich", cat: "Soft Skills" },
  { source: "trustworthy", croatian: "pouzdan", target: "vertrauenswürdig", cat: "Soft Skills" },
];

// ─── State ────────────────────────────────────────────────────────
const SESSION_SIZE = 10;
const allCats = Object.keys(catColors);
let selectedCats = null;

let sessionCards = [], sessionIndex = 0;
let streak = 0, bestStreak = 0;
let totalCorrect = 0, totalAttempts = 0;
let forceCorrection = false, hintCount = 0;
let sessionStart = 0, totalCharsTyped = 0;

// ─── DOM refs ─────────────────────────────────────────────────────
const promptEl    = document.getElementById('promptText');
const promptSub   = document.getElementById('promptSub');
const inputEl     = document.getElementById('answer');
const solutionEl  = document.getElementById('solution');
const wordGrid    = document.getElementById('wordGrid');
const progFill    = document.getElementById('progressFill');
const categoryEl  = document.getElementById('categoryBadge');
const comboPop    = document.getElementById('comboPop');
const gameArea    = document.getElementById('gameArea');
const sessionEndEl = document.getElementById('sessionEnd');
const mainCard    = document.getElementById('mainCard');
const catCountEl  = document.getElementById('catCount');
const newGameBtn  = document.getElementById('newGameBtn');

// ─── Animated flag ────────────────────────────────────────────────
const flagEl = document.getElementById('deFlag');
for (let i = 0; i < 20; i++) {
  const col = document.createElement('div');
  col.className = 'de-flag-col';
  col.style.animationDelay = -(i / 20) * 3 + 's';
  col.style.setProperty('--billow', (i / 2) * 16 + 4 + 'px');
  flagEl.appendChild(col);
}

// ─── Category panel ───────────────────────────────────────────────
function buildCatPanel() {
  const container = document.getElementById('catButtons');
  container.innerHTML = '';

  const mixBtn = document.createElement('button');
  mixBtn.className = 'cat-btn mixed' + (selectedCats === null ? ' active' : '');
  if (selectedCats === null) mixBtn.style.background = '#e8ff47';
  mixBtn.textContent = '⚡ Gemischt';
  mixBtn.onclick = () => { selectedCats = null; buildCatPanel(); };
  container.appendChild(mixBtn);

  allCats.forEach(cat => {
    const color = catColors[cat];
    const isActive = selectedCats !== null && selectedCats.has(cat);
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (isActive ? ' active' : '');
    btn.textContent = cat;
    btn.style.borderColor = color + '55';
    btn.style.color = isActive ? '#000' : color;
    if (isActive) btn.style.background = color;
    btn.onclick = () => {
      if (selectedCats === null) selectedCats = new Set();
      if (selectedCats.has(cat)) {
        selectedCats.delete(cat);
        if (selectedCats.size === 0) selectedCats = null;
      } else {
        selectedCats.add(cat);
      }
      buildCatPanel();
    };
    container.appendChild(btn);
  });

  const pool = getPool();
  catCountEl.textContent = pool.length + ' Karten verfügbar';
  newGameBtn.disabled = pool.length === 0;
}

function getPool() {
  if (selectedCats === null) return allCards;
  return allCards.filter(c => selectedCats.has(c.cat));
}

// ─── Search links ─────────────────────────────────────────────────
const searchSites = [
  { name: "Duden",     icon: "📖", url: w => `https://www.duden.de/suchen/dudenonline/${encodeURIComponent(w)}` },
  { name: "DWDS",      icon: "🔤", url: w => `https://www.dwds.de/?q=${encodeURIComponent(w)}` },
  { name: "dict.cc",   icon: "🌐", url: w => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Wikipedia", icon: "📚", url: w => `https://de.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(w)}` },
  { name: "Google",    icon: "🔍", url: w => `https://www.google.com/search?q=${encodeURIComponent(w + ' auf Deutsch')}` },
  { name: "Linguee",   icon: "🗣️", url: w => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo",       icon: "🦁", url: w => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];

function updateSearchLinks(card) {
  const container = document.getElementById('searchLinks');
  container.innerHTML = '';
  const word = (card.target || card.source).replace(/^(der|die|das)\s+/i, '');
  searchSites.forEach(site => {
    const a = document.createElement('a');
    a.className = 'search-link';
    a.href = site.url(word);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<span>${site.icon}</span><span>${site.name}</span>`;
    container.appendChild(a);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────
const PUNCT = /[.,!?:;]/;

function normalize(t) {
  return t.trim().replace(/\s+/g, ' ').replace(/[.,!?:;]+$/, '').toLowerCase();
}

function getCharMeta(target) {
  const hints = new Set(), autofill = new Set();
  let pos = 0;
  target.split(' ').forEach(word => {
    if (!word.length) { pos++; return; }
    hints.add(pos);
    let t = word.length - 1;
    while (t > 0 && PUNCT.test(word[t])) { autofill.add(pos + t); t--; }
    pos += word.length + 1;
  });
  return { hints, autofill };
}

function buildWordGrid(target, typed) {
  wordGrid.innerHTML = '';
  const { hints, autofill } = getCharMeta(target);
  const words = target.split(' ');
  let pos = 0;

  words.forEach((word, wi) => {
    const group = document.createElement('div');
    group.className = 'word-group';
    for (let ci = 0; ci < word.length; ci++) {
      const idx = pos + ci;
      const tChar = target[idx], uChar = typed[idx];
      const wrap   = document.createElement('div'); wrap.className = 'wchar';
      const letter = document.createElement('div'); letter.className = 'wchar-letter';
      const line   = document.createElement('div'); line.className = 'wchar-line';
      if (autofill.has(idx)) {
        letter.textContent = tChar; wrap.classList.add('state-auto');
      } else if (uChar !== undefined) {
        letter.textContent = tChar;
        wrap.classList.add(uChar.toLowerCase() === tChar.toLowerCase() ? 'state-ok' : 'state-bad');
      } else if (hints.has(idx)) {
        letter.textContent = tChar; wrap.classList.add('state-hint');
      } else {
        letter.textContent = '_'; wrap.classList.add('state-hidden');
      }
      wrap.appendChild(letter); wrap.appendChild(line); group.appendChild(wrap);
    }
    pos += word.length + 1;
    wordGrid.appendChild(group);
    if (wi < words.length - 1) {
      const sp = document.createElement('div');
      sp.style.cssText = 'width:5px;flex-shrink:0';
      wordGrid.appendChild(sp);
    }
  });
}

// ─── Session ──────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startSession() {
  const pool = getPool();
  if (!pool.length) return;
  sessionCards = shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));
  sessionIndex = 0;
  streak = 0; bestStreak = 0;
  totalCorrect = 0; totalAttempts = 0; totalCharsTyped = 0;
  sessionStart = Date.now();
  updateStats();
  gameArea.style.display = 'block';
  sessionEndEl.style.display = 'none';
  loadCard();
  mainCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function loadCard() {
  const card = sessionCards[sessionIndex];
  promptEl.textContent = card.source;
  promptSub.textContent = card.croatian || '';
  inputEl.value = '';
  inputEl.className = '';
  solutionEl.style.display = 'none';
  forceCorrection = false;
  hintCount = 0;
  progFill.style.width = (sessionIndex / sessionCards.length * 100) + '%';
  const color = catColors[card.cat] || '#888';
  categoryEl.textContent = card.cat;
  categoryEl.style.color = color;
  categoryEl.style.borderColor = color + '55';
  categoryEl.style.background = color + '14';
  mainCard.classList.add('active');
  buildWordGrid(card.target, '');
  updateSearchLinks(card);
  inputEl.focus();
}

// ─── Events ───────────────────────────────────────────────────────
inputEl.addEventListener('input', () => {
  buildWordGrid(sessionCards[sessionIndex].target, inputEl.value);
});

document.getElementById('hintBtn').addEventListener('click', () => {
  const target = sessionCards[sessionIndex].target;
  hintCount++;
  const reveal = target.slice(0, hintCount * 3);
  inputEl.value = reveal;
  buildWordGrid(target, reveal);
  inputEl.focus();
});

inputEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const card = sessionCards[sessionIndex];
  if (normalize(inputEl.value) === normalize(card.target)) {
    totalCharsTyped += card.target.length;
    if (!forceCorrection) {
      totalCorrect++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      showCombo();
      showToast(getEncouragement(streak));
    }
    totalAttempts++;
    inputEl.className = 'correct';
    updateStats();
    setTimeout(() => {
      sessionIndex++;
      if (sessionIndex >= sessionCards.length) showSessionEnd();
      else loadCard();
    }, 140);
  } else {
    if (!forceCorrection) { totalAttempts++; streak = 0; }
    inputEl.className = 'wrong';
    solutionEl.innerHTML = '<strong>Richtig:</strong> ' + card.target;
    solutionEl.style.display = 'block';
    forceCorrection = true;
    updateStats();
  }
});

// ─── Stats ────────────────────────────────────────────────────────
function updateStats() {
  document.getElementById('streakNum').textContent = streak;
  document.getElementById('correctVal').textContent = totalCorrect;
  document.getElementById('totalVal').textContent = totalAttempts;
  const acc = totalAttempts ? Math.round(totalCorrect / totalAttempts * 100) : null;
  document.getElementById('accuracyVal').textContent = acc !== null ? acc + '%' : '—';
  const mins = (Date.now() - sessionStart) / 60000;
  const wpm = mins > 0 && totalCharsTyped > 0 ? Math.round((totalCharsTyped / 5) / mins) : null;
  document.getElementById('wpmVal').textContent = wpm || '—';
}

// ─── Combo / Toast ────────────────────────────────────────────────
function showCombo() {
  if (streak < 3) return;
  const labels = ['','','','🔥 Gut!','⚡ Stark!','💥 Super!','🌟 Mega!','🚀 Wahnsinn!','👑 Unschlagbar!'];
  comboPop.textContent = labels[Math.min(streak, labels.length - 1)] || ('🔥 x' + streak);
  comboPop.classList.remove('animate');
  void comboPop.offsetWidth;
  comboPop.classList.add('animate');
}

let toastTimer;
function showToast(msg) {
  if (!msg) return;
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1400);
}

function getEncouragement(s) {
  if (s === 3)  return '🔥 3 in a row!';
  if (s === 5)  return '⚡ Fünf! Weiter so!';
  if (s === 7)  return '💪 Perfekt!';
  if (s === 10) return '🌟 Legende!';
  return null;
}

// ─── Session end ──────────────────────────────────────────────────
function showSessionEnd() {
  progFill.style.width = '100%';
  gameArea.style.display = 'none';
  sessionEndEl.style.display = 'block';
  const pct = Math.round(totalCorrect / sessionCards.length * 100);
  document.getElementById('finalScore').textContent = pct + '%';
  const secs = Math.round((Date.now() - sessionStart) / 1000);
  const wpm  = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  document.getElementById('finalDetails').textContent =
    totalCorrect + '/' + sessionCards.length + ' richtig · Streak: ' + bestStreak + ' · ' + wpm + ' WPM · ' + secs + 's';
  document.getElementById('finalEmoji').textContent =
    pct === 100 ? '🏆🥇🔥' : pct >= 80 ? '🌟💪' : pct >= 60 ? '👍📚' : '💡 Weiterüben!';
}

// ─── Init ─────────────────────────────────────────────────────────
buildCatPanel();
startSession();