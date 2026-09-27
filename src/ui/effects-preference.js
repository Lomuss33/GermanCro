export function prefersReducedEffects() {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  return document.documentElement.dataset.effects === "reduced"
    || Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}
