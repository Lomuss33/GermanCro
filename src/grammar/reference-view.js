import { createGrammarSliderTable } from "./table.js";
import { GERMAN_REFERENCE_INTRO, getGermanReferenceCards } from "./german-reference.js";

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderGrammarReference(root, baseCards, language) {
  const controllers = [];
  const german = language === "de";
  const cards = german ? getGermanReferenceCards(baseCards) : baseCards;
  const sections = [];
  let filterBar;
  let resultStatus;
  root.classList.toggle("grammar-grid--reference", german);
  if (german) {
    const intro = element("header", "grammar-reference-intro");
    intro.append(element("p", "grammar-reference-kicker", "DEIN LERNWERKZEUG"));
    intro.append(element("h2", "grammar-reference-title", GERMAN_REFERENCE_INTRO.title));
    intro.append(element("p", "grammar-reference-description", GERMAN_REFERENCE_INTRO.description));
    const steps = element("div", "grammar-reference-steps");
    GERMAN_REFERENCE_INTRO.steps.forEach(text => steps.append(element("span", "", text)));
    intro.append(steps, element("p", "grammar-reference-lookup", GERMAN_REFERENCE_INTRO.lookup));
    filterBar = element("div", "grammar-reference-filters");
    filterBar.setAttribute("role", "group");
    filterBar.setAttribute("aria-label", "Lernschwerpunkt auswählen");
    for (const [band, label] of [["all", "Alle Stufen"], ["A", "A1–A2 · Grundlagen"], ["B", "B1–B2 · Ausbau"], ["C", "C1–C2 · Feinschliff"]]) {
      const button = element("button", "grammar-reference-filter", label);
      button.type = "button";
      button.dataset.band = band;
      button.setAttribute("aria-pressed", String(band === "all"));
      button.addEventListener("click", () => {
        filterBar.querySelectorAll("button").forEach(other => other.setAttribute("aria-pressed", String(other === button)));
        sections.forEach(section => { section.hidden = band !== "all" && section.dataset.band !== band; });
        const visible = sections.filter(section => !section.hidden);
        resultStatus.textContent = `${visible.length} Themen · ${label}`;
        // A direct entry into a level opens its first lesson, without moving focus.
        if (band !== "all" && visible[0]?.tagName === "DETAILS") visible[0].open = true;
      });
      filterBar.append(button);
    }
    resultStatus = element("p", "grammar-reference-status", `${cards.length} Themen · Alle Stufen`);
    resultStatus.setAttribute("role", "status");
    intro.append(filterBar, resultStatus, element("p", "grammar-reference-level-note", GERMAN_REFERENCE_INTRO.levelNote));
    root.append(intro);
  }

  cards.forEach((card, index) => {
    const section = element(card.collapsed ? "details" : "section", "grammar-card");
    section.classList.toggle("grammar-lesson", german);
    section.dataset.band = card.band || "";
    sections.push(section);
    if (german) section.style.setProperty("--reference-accent", ["#7dd3fc", "#ff8ad8", "#bca2ff", "#84ead0", "#e8ff47", "#ffbd85"][index % 6]);
    if (card.collapsed) section.classList.add("grammar-lesson--expandable");
    const heading = card.collapsed ? element("summary", "grammar-lesson-summary") : element("header", "grammar-lesson-heading");
    if (card.level) heading.append(element("p", "grammar-lesson-level", `${String(index + 1).padStart(2, "0")} / ${card.level}`));
    heading.append(element("h3", "grammar-card-title", card.title));
    if (card.collapsed) heading.append(element("span", "grammar-lesson-action", "Regel & Beispiele"));
    section.append(heading);
    const body = element("div", "grammar-lesson-body");
    if (card.description) body.append(element("p", "grammar-lesson-description", card.description));

    if (card.examples?.length) {
      const examples = element("div", "grammar-lesson-examples");
      card.examples.forEach(([label, sentence]) => {
        const example = element("div", "grammar-lesson-example");
        example.append(element("span", "grammar-lesson-example-label", label), element("p", "", sentence));
        examples.append(example);
      });
      body.append(examples);
    }
    const mount = element("div", "grammar-slider-mount");
    body.append(mount);
    if (card.tip) {
      const note = element("aside", "grammar-lesson-tip");
      note.append(element("strong", "", "Merke"), element("p", "", card.tip));
      body.append(note);
    }
    if (card.practice) {
      const practice = element("details", "grammar-lesson-practice");
      const summary = element("summary", "", `Probier’s aus: ${card.practice[0]}`);
      practice.append(summary, element("p", "grammar-lesson-answer", card.practice[1]));
      body.append(practice);
    }
    if (card.source) {
      const source = element("a", "grammar-lesson-source", `Weiterlesen: ${card.source[0]} ↗`);
      source.href = card.source[1];
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      body.append(source);
    }
    section.append(body);
    root.append(section);

    let initialized = false;
    const initialize = () => {
      if (initialized || !section.isConnected || (card.collapsed && !section.open)) return;
      initialized = true;
      if (card.interaction?.mode === "fixed_first_slider") {
        section.classList.add("grammar-card--interactive");
        const controller = createGrammarSliderTable({ root: mount, card });
        if (controller) controllers.push(controller);
      } else {
        const wrap = element("div", "grammar-table-wrap");
        const table = element("table", "grammar-table");
        const head = document.createElement("thead");
        const header = document.createElement("tr");
        card.columns.forEach(text => { const cell = element("th", "", text); cell.scope = "col"; header.append(cell); });
        head.append(header);
        const tbody = document.createElement("tbody");
        card.rows.forEach(row => {
          const tr = document.createElement("tr");
          row.forEach((text, i) => { const cell = element(i ? "td" : "th", "", text); if (!i) cell.scope = "row"; tr.append(cell); });
          tbody.append(tr);
        });
        table.append(head, tbody); wrap.append(table); mount.append(wrap);
      }
    };
    if (card.collapsed) section.addEventListener("toggle", initialize);
    else initialize();
  });
  return controllers;
}
