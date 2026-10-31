import { getSecureRandomRange } from "../core/random.js";
import { prefersReducedEffects } from "./effects-preference.js";
import {
  comboPop,
  feedbackBurstEl,
  progFill,
  roundTimerEl,
  statsBarEl,
} from "./dom.js";

const FEEDBACK_BURST_SYMBOLS = Object.freeze({
  success: Object.freeze({
    big: Object.freeze(["\u{1F389}", "\u2728", "\u2B50", "\u{1F4A5}", "\u{1F38A}", "\u2728", "\u2B50", "\u{1F389}", "\u{1F4AB}", "\u2728"]),
    small: Object.freeze(["\u2728", "\u2B50", "\u{1F4AB}", "\u2728", "\u2B50", "\u2728"]),
  }),
  error: Object.freeze(["\u2716", "\u26A1", "\u2715", "\u26A0", "\u2716", "\u26A1"]),
});

let feedbackBurstTimer = null;
const feedbackBurstPieces = [];
let toastTimer = 0;
let statsAnimationFrame = 0;
let statsAnimationToken = 0;
const statsAnimationTimers = new WeakMap();

function ensureFeedbackBurstPieces(count) {
  if (!feedbackBurstEl) {
    return [];
  }

  while (feedbackBurstPieces.length < count) {
    const piece = document.createElement("span");
    piece.className = "burst-piece";
    piece.hidden = true;
    feedbackBurstEl.appendChild(piece);
    feedbackBurstPieces.push(piece);
  }

  return feedbackBurstPieces;
}

function getFeedbackBurstSymbols(kind, isBig) {
  if (kind === "success") {
    return isBig ? FEEDBACK_BURST_SYMBOLS.success.big : FEEDBACK_BURST_SYMBOLS.success.small;
  }

  return FEEDBACK_BURST_SYMBOLS.error;
}

function resetFeedbackBurstPieces() {
  feedbackBurstPieces.forEach((piece) => {
    piece.hidden = true;
    piece.textContent = "";
    piece.style.animation = "none";
  });
}

export function showFeedbackBurst(kind, isBig = false) {
  if (!feedbackBurstEl) {
    return;
  }

  if (prefersReducedEffects()) {
    clearTimeout(feedbackBurstTimer);
    resetFeedbackBurstPieces();
    feedbackBurstEl.className = "feedback-burst";
    return;
  }

  clearTimeout(feedbackBurstTimer);
  feedbackBurstEl.className = `feedback-burst is-${kind}${isBig ? " is-big" : ""}`;

  const pieces = getFeedbackBurstSymbols(kind, isBig);
  const baseDistance = isBig ? 164 : 116;
  const distanceJitter = isBig ? 42 : 30;
  const startAngle = getSecureRandomRange(0, 359);
  const angleStep = 360 / Math.max(pieces.length, 1);
  const midpointPull = kind === "success" ? (isBig ? 20 : 14) : 8;
  const burstPieces = ensureFeedbackBurstPieces(pieces.length);

  burstPieces.forEach((piece, index) => {
    piece.hidden = true;
    piece.style.animation = "none";
    if (index >= pieces.length) {
      piece.textContent = "";
      return;
    }

    const symbol = pieces[index];
    const angleDegrees = startAngle + (angleStep * index) + getSecureRandomRange(-12, 12);
    const angle = angleDegrees * (Math.PI / 180);
    const distance = baseDistance + getSecureRandomRange(-distanceJitter, distanceJitter);
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance);
    const mx = Math.round(dx * 0.52);
    const my = Math.round(dy * 0.4 - midpointPull);

    piece.textContent = symbol;
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    const rotation = getSecureRandomRange(-44, 44);
    piece.style.setProperty("--mx", `${mx}px`);
    piece.style.setProperty("--my", `${my}px`);
    piece.style.setProperty("--rot-mid", `${Math.round(rotation * 0.45)}deg`);
    piece.style.setProperty("--rot", `${rotation}deg`);
    piece.style.animationDelay = `${index * 18}ms`;
    piece.hidden = false;
  });

  void feedbackBurstEl.offsetWidth;
  burstPieces.forEach((piece, index) => {
    if (index < pieces.length) {
      piece.style.animation = "";
    }
  });

  feedbackBurstTimer = setTimeout(() => {
    resetFeedbackBurstPieces();
    feedbackBurstEl.className = "feedback-burst";
  }, isBig ? 980 : 760);
}

function formatEnterBurstTime(ms) {
  const safeMs = Math.max(0, Number(ms) || 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

export function showEnterTimeBurst({ currentCardShownAt, getElapsedMs }) {
  if (!roundTimerEl || prefersReducedEffects()) {
    return;
  }

  const pressedAt = Date.now();
  const roundTimeMs = getElapsedMs(pressedAt);
  const cardTimeMs = currentCardShownAt ? pressedAt - currentCardShownAt : roundTimeMs;

  const createBurst = (text, className, removeAfter = 2800) => {
    const burst = document.createElement("span");
    burst.className = `enter-time-burst ${className}`;
    burst.textContent = text;
    roundTimerEl.appendChild(burst);
    window.setTimeout(() => burst.remove(), removeAfter);
  };

  createBurst(formatEnterBurstTime(cardTimeMs), "enter-time-burst-card");
  createBurst(formatEnterBurstTime(roundTimeMs), "enter-time-burst-total", 3200);
}

export function showCombo(streak, translate) {
  if (streak < 3 || !comboPop) {
    return;
  }

  comboPop.textContent = translate(`combo.${Math.min(streak, 8)}`) || `x${streak}`;
  comboPop.classList.remove("animate");
  void comboPop.offsetWidth;
  comboPop.classList.add("animate");
}

export function showToast(message) {
  if (!message) {
    return;
  }

  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

export function replayStatsClass(element, className, duration = 720) {
  if (!element) {
    return;
  }

  const currentTimer = statsAnimationTimers.get(element);
  if (currentTimer) {
    window.clearTimeout(currentTimer);
  }
  ["is-rise", "is-drop", "is-improving", "is-declining", "is-count-change", "is-event-success", "is-event-error", "is-event-skip"].forEach((transientClass) => {
    element.classList.remove(transientClass);
  });
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  statsAnimationTimers.set(element, window.setTimeout(() => {
    element.classList.remove(className);
    statsAnimationTimers.delete(element);
  }, duration));
}

export function animateStatsOnStart() {
  if (!statsBarEl) {
    return;
  }

  const animationToken = ++statsAnimationToken;
  if (statsAnimationFrame) {
    window.cancelAnimationFrame(statsAnimationFrame);
    statsAnimationFrame = 0;
  }

  statsBarEl.classList.remove("is-starting");
  statsBarEl.querySelectorAll(".stat").forEach((stat) => stat.classList.remove("is-starting"));

  void statsBarEl.offsetWidth;
  statsBarEl.classList.add("is-starting");
  statsBarEl.querySelectorAll(".stat").forEach((stat, index) => {
    stat.style.setProperty("--stat-delay", `${index * 90}ms`);
    stat.classList.add("is-starting");
  });

  const remainingEl = document.getElementById("remainingVal");
  const target = Number.parseInt(remainingEl?.textContent || "", 10);
  if (remainingEl && Number.isFinite(target) && target > 0 && !prefersReducedEffects()) {
    const startedAt = performance.now();
    const duration = 720;
    const tick = (now) => {
      if (animationToken !== statsAnimationToken) {
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - ((1 - progress) ** 3);
      remainingEl.textContent = String(Math.max(1, Math.round(target * eased)));
      if (progress < 1) {
        statsAnimationFrame = window.requestAnimationFrame(tick);
      } else {
        statsAnimationFrame = 0;
      }
    };
    statsAnimationFrame = window.requestAnimationFrame(tick);
  }

  window.setTimeout(() => {
    if (animationToken === statsAnimationToken) {
      statsBarEl.classList.remove("is-starting");
      statsBarEl.querySelectorAll(".stat").forEach((stat) => {
        stat.classList.remove("is-starting");
        stat.style.removeProperty("--stat-delay");
      });
    }
  }, 1500);
}

export function renderRoundProgressBar({ sessionCards, scoredCardEvents, translate, reset = false, empty = false }) {
  const track = progFill?.parentElement;
  if (!track) return;
  const total = empty ? 0 : sessionCards.length;
  const completed = empty ? 0 : sessionCards.reduce(
    (count, card) => count + Number(scoredCardEvents.has(card)), 0,
  );
  const percent = total ? Math.min(100, completed / total * 100) : 0;
  const previous = Number(track.dataset.completed || 0);
  const changed = reset || track.dataset.completed !== String(completed) ||
    track.dataset.total !== String(total);
  const valueText = total
    ? translate("messages.roundProgress.value", { completed, total, percent: Math.round(percent) })
    : translate("messages.roundProgress.empty");

  track.setAttribute("aria-label", translate("messages.roundProgress.label"));
  track.setAttribute("aria-valuemax", String(total || 1));
  track.setAttribute("aria-valuenow", String(completed));
  track.setAttribute("aria-valuetext", valueText);
  track.title = valueText;
  track.classList.toggle("is-complete", total > 0 && completed === total);
  track.classList.toggle("is-empty", completed === 0);
  track.style.setProperty("--progress-percent", `${percent}%`);
  track.style.setProperty("--progress-step", `${100 / (total > 20 ? 4 : Math.max(1, total))}%`);
  track.dataset.completed = String(completed);
  track.dataset.total = String(total);
  if (!changed) return;

  const from = getComputedStyle(progFill).clipPath;
  progFill.getAnimations().forEach((animation) => animation.cancel());
  track.getAnimations().forEach((animation) => animation.cancel());
  const to = `inset(0 ${100 - percent}% 0 0)`;
  progFill.style.removeProperty("width");
  progFill.style.clipPath = to;
  const reduceMotion = prefersReducedEffects();
  if (!reset && !reduceMotion) {
    progFill.animate([{ clipPath: from }, { clipPath: to }], {
      duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    if (completed > previous) {
      progFill.animate([
        { backgroundPosition: "-50% 0%, 0% 0%" },
        { backgroundPosition: "150% 0%, 0% 0%" },
      ], { duration: 850, delay: 120, easing: "ease-in-out" });
      track.animate([
        { boxShadow: "0 0 0 1px rgba(232,255,71,0.4), -3px 0 12px rgba(34,211,238,0.22), 3px 0 12px rgba(255,122,200,0.25)" },
        { boxShadow: "0 0 0 1px rgba(232,255,71,0), -3px 0 12px rgba(34,211,238,0), 3px 0 12px rgba(255,122,200,0)" },
      ], { duration: completed === total ? 900 : 550, easing: "ease-out" });
    }
  }
}
