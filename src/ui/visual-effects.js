import { createScrollFlag } from "./scroll-flag.js";

const STORAGE_KEY = "germancro-visual-effects";
const COPY = {
  de: ["Effekte", "Bewegung und Leuchteffekte reduzieren"],
  en: ["Effects", "Reduce motion and lighting effects"],
  hr: ["Efekti", "Smanji animacije i svjetlosne efekte"],
};

export function initVisualEffects({ button, getLanguage }) {
  const flag = createScrollFlag(document.getElementById("deFlag"));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  let preference = null;
  try { preference = localStorage.getItem(STORAGE_KEY); } catch { /* Storage is optional. */ }
  const isReduced = () => motion.matches || transparency.matches || preference === "reduced";
  function sync() {
    document.documentElement.dataset.effects = isReduced() ? "reduced" : "full";
    flag.sync();
    const [label, title] = COPY[getLanguage()] || COPY.en;
    if (button) {
      const reduced = isReduced();
      const titleEl = button.querySelector(".visual-effects-title");
      if (titleEl) titleEl.textContent = label;
      else button.textContent = label;
      button.title = title;
      button.setAttribute("aria-pressed", String(reduced));
      // System accessibility preferences remain authoritative.
      button.disabled = motion.matches || transparency.matches;
    }
  }
  function syncActivity() {
    flag.sync();
  }
  button?.addEventListener("click", () => {
    preference = isReduced() ? "full" : "reduced";
    try { localStorage.setItem(STORAGE_KEY, preference); } catch { /* Keep session preference. */ }
    sync();
  });
  motion.addEventListener("change", sync);
  transparency.addEventListener("change", sync);
  document.addEventListener("visibilitychange", syncActivity);
  window.addEventListener("focus", syncActivity);
  window.addEventListener("blur", syncActivity);
  syncActivity();
  sync();
  return { sync };
}
