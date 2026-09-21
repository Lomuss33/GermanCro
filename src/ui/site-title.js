export function renderSiteTitleLineContent({ line, startCharIndex = 0 }) {
  const fragment = document.createDocumentFragment();
  Array.from(line.text).forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = `site-title-letter band-${Math.min(3, Math.floor((startCharIndex + index) / 3) + 1)}`;
    span.dataset.letter = letter;
    span.style.setProperty("--title-flag-position", `${((startCharIndex + index) % 3) * 50}%`);
    span.textContent = letter;
    fragment.appendChild(span);
  });
  return fragment;
}
