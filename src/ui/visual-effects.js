import { createScrollFlag } from "./scroll-flag.js";

const STORAGE_KEY = "germancro-visual-effects";
const COPY = {
  de: ["Effekte", "Bewegung und Leuchteffekte reduzieren", "Bewegung und Leuchteffekte einschalten", "Bewegung ist durch die Systemeinstellung reduziert"],
  en: ["Effects", "Reduce motion and lighting effects", "Turn motion and lighting effects on", "Motion is reduced by your device setting"],
  hr: ["Efekti", "Smanji animacije i svjetlosne efekte", "Uključi animacije i svjetlosne efekte", "Animacije su smanjene postavkom uređaja"],
};

export function initVisualEffects({ button, getLanguage }) {
  const flag = createScrollFlag(document.getElementById("deFlag"));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
  let preference = null;
  let wasReduced = null;
  try { preference = localStorage.getItem(STORAGE_KEY); } catch { /* Storage is optional. */ }
  const isReduced = () => motion.matches || preference === "reduced";
  function sync() {
    const reduced = isReduced();
    document.documentElement.dataset.effects = reduced ? "reduced" : "full";
    document.documentElement.dataset.transparency = transparency.matches ? "reduced" : "full";
    flag.sync();
    if (reduced && wasReduced === false) {
      document.querySelectorAll("#progressFill, .progress-track, .site-title-letter, #skipCardBtn, #hintBtn")
        .forEach((element) => element.getAnimations?.().forEach((animation) => animation.cancel()));
    }
    wasReduced = reduced;
    const [label, reduceTitle, fullTitle, systemTitle] = COPY[getLanguage()] || COPY.en;
    if (button) {
      const titleEl = button.querySelector(".visual-effects-title");
      if (titleEl) titleEl.textContent = label;
      else button.textContent = label;
      button.title = motion.matches ? systemTitle : reduced ? fullTitle : reduceTitle;
      button.setAttribute("aria-label", button.title);
      button.setAttribute("aria-pressed", String(reduced));
      // System accessibility preferences remain authoritative.
      button.disabled = motion.matches;
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
