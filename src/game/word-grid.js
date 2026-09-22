import {
  getCorrectPrefixLength, getGuideTokens, getGuideSeparatorKind,
  isGuideSeparatorChar, getGuideSeparatorSymbol,
} from "./answer-analysis.js";

// Describe feedback separately from DOM updates so unchanged letters stay untouched.
export function describeWordGrid(target, typed, {
  hints, autofill, difficulty, separatorLabel,
  freshCorrectIndexes = new Set(), freshWrongIndexes = new Set(),
}) {
  const prefix = getCorrectPrefixLength(target, typed);
  const terminal = target.length > 0 && typed.length >= target.length;
  const describe = (index, char, separator, overflow = false) => {
    const classes = separator ? ["word-separator", "wchar", `is-${getGuideSeparatorKind(char)}`] : ["wchar"];
    let text;
    if (overflow) {
      classes.push("state-bad", "is-overflow");
      text = "x";
    } else if (separator) {
      text = typed[index] !== undefined && typed[index] !== char ? "x" : getGuideSeparatorSymbol(char);
      if (typed[index] !== undefined) classes.push(typed[index] === char ? "state-ok" : "state-bad");
      else if (index === prefix) classes.push("state-next");
    } else if (autofill.has(index)) {
      classes.push("state-auto");
      text = char;
    } else if (typed[index] !== undefined) {
      const correct = typed[index].toLowerCase() === char.toLowerCase();
      classes.push(correct ? "state-ok" : "state-bad");
      text = correct ? char : "x";
    } else if ((difficulty === "easy" && index >= prefix && index < prefix + 3) || hints.has(index)) {
      classes.push("state-hint");
      text = char;
    } else if (difficulty !== "hard" && index === prefix) {
      classes.push("state-next");
      text = char;
    } else {
      classes.push("state-hidden");
      text = "_";
    }
    if (!overflow && (separator || (!autofill.has(index) && typed[index] !== undefined))) {
      if (freshCorrectIndexes.has(index)) classes.push("state-hit");
      if (freshWrongIndexes.has(index)) classes.push("state-miss");
    }
    if (!overflow && index === typed.length) classes.push("state-caret");
    return {
      key: `${overflow ? "overflow" : "char"}-${index}`,
      className: classes.join(" "), text,
      kind: separator ? getGuideSeparatorKind(char) : null,
      label: separator ? separatorLabel(char, { overflow }) : null,
    };
  };
  const items = getGuideTokens(target).map(token => token.type === "separator"
    ? describe(token.start, token.char, true)
    : { key: `word-${token.start}`, className: "word-group", children:
      Array.from({ length: token.end - token.start }, (_, offset) => {
        const index = token.start + offset;
        return describe(index, target[index], false);
      }) });
  for (let index = target.length; index < typed.length; index += 1) {
    items.push(describe(index, typed[index], isGuideSeparatorChar(typed[index]), true));
  }
  if (!terminal && (typed.length > target.length || !target.length)) {
    items.push({ key: "end-caret", className: "answer-guide-inline-caret", caret: true });
  }
  return items;
}

export function createWordGridRenderer(root) {
  let previousTarget;
  const entries = new Map();
  return (target, items) => {
    if (target !== previousTarget) {
      root.replaceChildren();
      entries.clear();
      previousTarget = target;
    }
    const active = new Set();
    function reconcile(parent, children) {
      let cursor = parent.firstChild;
      for (const item of children) {
        active.add(item.key);
        let entry = entries.get(item.key);
        if (!entry) {
          const node = root.ownerDocument.createElement("div");
          entry = { node };
          if (!item.children && !item.caret) {
            entry.letter = root.ownerDocument.createElement("div");
            const line = root.ownerDocument.createElement("div");
            entry.letter.className = item.kind ? "word-separator-letter wchar-letter" : "wchar-letter";
            line.className = item.kind ? "word-separator-line wchar-line" : "wchar-line";
            node.append(entry.letter, line);
          }
          entries.set(item.key, entry);
        }
        const { node, letter } = entry;
        if (node.className !== item.className) node.className = item.className;
        if (letter && letter.textContent !== item.text) letter.textContent = item.text;
        if (letter) {
          const letterClass = item.kind ? "word-separator-letter wchar-letter" : "wchar-letter";
          const lineClass = item.kind ? "word-separator-line wchar-line" : "wchar-line";
          if (letter.className !== letterClass) letter.className = letterClass;
          if (letter.nextSibling.className !== lineClass) letter.nextSibling.className = lineClass;
        }
        if (item.kind) {
          if (node.dataset.separatorKind !== item.kind) node.dataset.separatorKind = item.kind;
          if (node.getAttribute("aria-label") !== item.label) {
            node.setAttribute("aria-label", item.label);
            node.setAttribute("title", item.label);
          }
        } else if (node.hasAttribute("data-separator-kind")) {
          delete node.dataset.separatorKind;
          node.removeAttribute("aria-label");
          node.removeAttribute("title");
        }
        if (item.caret) node.setAttribute("aria-hidden", "true");
        if (node !== cursor) parent.insertBefore(node, cursor);
        cursor = node.nextSibling;
        if (item.children) reconcile(node, item.children);
      }
      while (cursor) {
        const next = cursor.nextSibling;
        cursor.remove();
        cursor = next;
      }
    }
    reconcile(root, items);
    for (const key of entries.keys()) if (!active.has(key)) entries.delete(key);
  };
}
