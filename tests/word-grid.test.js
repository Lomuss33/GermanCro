import test from "node:test";
import assert from "node:assert/strict";
import { describeWordGrid, createWordGridRenderer } from "../src/game/word-grid.js";

const options = {
  hints: new Set(), autofill: new Set(), difficulty: "hard",
  separatorLabel: (char, { overflow }) => `${overflow ? "extra " : ""}${char}`,
};
const describe = (target, typed, overrides = {}) => describeWordGrid(target, typed, { ...options, ...overrides });
const flatten = items => items.flatMap(item => item.children || [item]);

test("letter feedback preserves case matching, hints, punctuation and caret movement", () => {
  let letters = flatten(describe("Ärger, ja!", "äx", {
    hints: new Set([3]), autofill: new Set([9]), freshCorrectIndexes: new Set([0]), freshWrongIndexes: new Set([1]),
  }));
  assert.equal(letters[0].text, "Ä");
  assert.match(letters[0].className, /state-ok state-hit/);
  assert.equal(letters[1].text, "x");
  assert.match(letters[1].className, /state-bad state-miss/);
  assert.match(letters[2].className, /state-hidden state-caret/);
  assert.equal(letters[3].text, "e");
  assert.match(letters[3].className, /state-hint/);
  assert.equal(letters[5].kind, null);
  assert.equal(letters[6].kind, "space");
  assert.equal(letters[9].text, "!");
  assert.match(letters[9].className, /state-auto/);
  letters = flatten(describe("ja", "ja"));
  assert.ok(letters.every(item => !item.className.includes("state-caret")));
});

test("easy, medium, autofill and overflow retain distinct states", () => {
  assert.deepEqual(flatten(describe("Hallo", "", { difficulty: "easy" })).map(item => item.text), ["H", "a", "l", "_", "_"]);
  assert.match(flatten(describe("Hallo", "", { difficulty: "medium" }))[0].className, /state-next state-caret/);
  assert.match(flatten(describe("ja", "", { autofill: new Set([1]) }))[1].className, /state-auto/);
  const overflow = flatten(describe("ja", "ja x"));
  assert.match(overflow[2].className, /state-bad is-overflow/);
  assert.equal(overflow[2].label, "extra  ");
  assert.equal(overflow[3].text, "x");
  assert.equal(describe("", "")[0].caret, true);
});

// Minimal tree fixture exercises identity and mutation behavior, without a browser dependency.
class Element {
  constructor(document) {
    this.ownerDocument = document;
    this.children = [];
    this.dataset = {};
    this.attributes = new Map();
    this.parent = null;
    this.className = "";
    this.textContent = "";
  }
  get firstChild() { return this.children[0] || null; }
  get nextSibling() { return this.parent?.children[this.parent.children.indexOf(this) + 1] || null; }
  append(...nodes) { for (const node of nodes) this.insertBefore(node, null); }
  insertBefore(node, cursor) {
    node.remove();
    node.parent = this;
    this.children.splice(cursor ? this.children.indexOf(cursor) : this.children.length, 0, node);
  }
  remove() {
    if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
  }
  replaceChildren() { for (const node of [...this.children]) node.remove(); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); }
  hasAttribute(key) { return key === "data-separator-kind" ? "separatorKind" in this.dataset : this.attributes.has(key); }
}

test("typing preserves letter nodes; overflow cleanup and a new card replace only necessary nodes", () => {
  let created = 0;
  const document = { createElement() { created += 1; return new Element(document); } };
  const root = document.createElement();
  const render = createWordGridRenderer(root);
  render("ja", describe("ja", ""));
  const word = root.firstChild;
  const first = word.firstChild;
  const initialCount = created;
  render("ja", describe("ja", "j"));
  assert.equal(root.firstChild, word);
  assert.equal(word.firstChild, first);
  assert.equal(created, initialCount);
  assert.equal(first.firstChild.textContent, "j");
  render("ja", describe("ja", "ja "));
  const overflow = root.children[1];
  assert.equal(overflow.dataset.separatorKind, "space");
  render("ja", describe("ja", "jax"));
  assert.equal(root.children[1], overflow);
  assert.equal(overflow.firstChild.className, "wchar-letter");
  assert.equal(overflow.hasAttribute("data-separator-kind"), false);
  render("ja", describe("ja", ""));
  assert.equal(root.children.length, 1);
  assert.equal(root.firstChild.firstChild, first);
  render("neu", describe("neu", ""));
  assert.notEqual(root.firstChild.firstChild, first);
});
