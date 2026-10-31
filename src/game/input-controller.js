import { SESSION_SIZE } from "../config/app.js";
import {
  getCorrectPrefixLength,
  getFreshCorrectIndexes,
  getFreshWrongIndexes,
  isExactTypedMatch,
} from "./answer-analysis.js";
import { getRequestedSessionSize, syncSessionSizeLabel } from "./category-panel.js";
import { countInsertedTypingUnits } from "./typing-metrics.js";
import { isTouchKeyboardEnvironment } from "../layout/viewport-controller.js";
import { prefersReducedEffects } from "../ui/effects-preference.js";
import { showFeedbackBurst } from "../ui/feedback-effects.js";
import {
  arrowDockButtons,
  catCountEl,
  enterKeyBtnEl,
  hintBtnEl,
  inputEl,
  languageDockButtons,
  mainCard,
  newGameBtn,
  promptPrimaryFlagEl,
  promptSecondaryFlagEl,
  restartBtnEl,
  sessionSettingsBtnEl,
  sessionSizeSliderEl,
  skipCardBtnEl,
} from "../ui/dom.js";

export function focusAnswerInputWithoutScroll() {
  if (!inputEl) {
    return;
  }

  try {
    inputEl.focus({ preventScroll: true });
  } catch {
    inputEl.focus();
  }
}

export function focusAnswerInputAtEnd() {
  if (!inputEl) {
    return;
  }

  focusAnswerInputWithoutScroll();
  const caretPosition = inputEl.value.length;
  try {
    inputEl.setSelectionRange(caretPosition, caretPosition);
  } catch {
    // ignore inputs that do not support selection APIs
  }
}

export function activateTouchInputWithoutScroll(event) {
  if (!isTouchKeyboardEnvironment() || !inputEl || document.activeElement === inputEl) {
    return;
  }

  event.preventDefault();
  focusAnswerInputAtEnd();
}

export function insertTextIntoAnswerInput(text) {
  if (!inputEl || !text) {
    return;
  }

  const start = typeof inputEl.selectionStart === "number" ? inputEl.selectionStart : inputEl.value.length;
  const end = typeof inputEl.selectionEnd === "number" ? inputEl.selectionEnd : inputEl.value.length;

  if (typeof inputEl.setRangeText === "function") {
    inputEl.setRangeText(text, start, end, "end");
  } else {
    inputEl.value = `${inputEl.value.slice(0, start)}${text}${inputEl.value.slice(end)}`;
  }

  inputEl.dispatchEvent(new Event("input", { bubbles: true }));
}

export function createGameInputController({
  canConvenienceFocusAnswerInput,
  isOnboardingBlocked,
  getFirstRunTour,
  getSessionCards,
  getSessionIndex,
  getPendingFinishAt,
  isRoundTimerStarted,
  startRoundTimer,
  isRenderableCard,
  recoverPlayableSession,
  getTargetValue,
  getPreviousTypedValue,
  setPreviousTypedValue,
  addTypingUnits,
  answerGuideController,
  scheduleAutoSubmit,
  cancelAutoSubmit,
  submitCurrentAnswer,
  showSessionEnd,
  skipCurrentCard,
  goBackToPreviousCard,
  switchLearningMode,
  cycleLearningMode,
  togglePromptOrder,
  toggleExtendedRoundSize,
  startSession,
  triggerEnterTimeBurst,
  setDifficulty,
} = {}) {
  let enterKeyPulseTimer = 0;

  function shouldCaptureTypingForAnswer(event) {
    if (!canConvenienceFocusAnswerInput()) {
      return false;
    }

    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }

    if (event.key.length !== 1) {
      return false;
    }

    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body || activeElement === document.documentElement) {
      return true;
    }

    return false;
  }

  function shouldTapFocusAnswerInput(target) {
    if (!canConvenienceFocusAnswerInput() || !(target instanceof Element)) {
      return false;
    }

    if (!mainCard?.contains(target)) {
      return false;
    }

    if (target.closest("button, a, input, textarea, select, label")) {
      return false;
    }

    return true;
  }

  function initDifficultyControls() {
    document.querySelectorAll(".difficulty-panel button").forEach((btn) => {
      btn.addEventListener("click", () => {
        setDifficulty(btn.dataset.diff);

        document.querySelectorAll(".difficulty-panel button").forEach((button) => {
          button.classList.remove("active");
        });

        btn.classList.add("active");

        const sessionCards = getSessionCards();
        if (sessionCards.length) {
          const target = getTargetValue(sessionCards[getSessionIndex()]);
          answerGuideController.buildWordGrid(target, inputEl.value);
        }
      });
    });
  }

  function initInputEvents() {
    sessionSizeSliderEl?.addEventListener("input", syncSessionSizeLabel);
    catCountEl?.addEventListener("click", () => {
      toggleExtendedRoundSize();
    });
    newGameBtn?.addEventListener("click", () => {
      if (getFirstRunTour()?.playFromWelcome()) {
        return;
      }
      startSession(getRequestedSessionSize());
    });
    restartBtnEl?.addEventListener("click", () => {
      startSession(getRequestedSessionSize());
    });
    sessionSettingsBtnEl?.addEventListener("click", () => {
      document.getElementById("catPanel")?.scrollIntoView({
        behavior: prefersReducedEffects() ? "instant" : "smooth",
        block: "start",
        inline: "nearest",
      });
    });

    languageDockButtons.forEach((button) => {
      button.addEventListener("click", () => {
        switchLearningMode(button.dataset.lang);
      });
    });

    const arrowActions = {
      ArrowRight: () => skipCurrentCard(),
      ArrowLeft: () => goBackToPreviousCard(),
      ArrowUp: () => switchLearningMode(cycleLearningMode()),
      ArrowDown: () => hintBtnEl?.click(),
    };

    let arrowPressTimer = 0;
    const lightArrowButton = (key) => {
      const button = arrowDockButtons.find((candidate) => candidate.dataset.arrow === key);
      if (!button) {
        return;
      }

      button.classList.remove("is-pressed");
      void button.offsetWidth;
      button.classList.add("is-pressed");
      window.clearTimeout(arrowPressTimer);
      arrowPressTimer = window.setTimeout(() => {
        button.classList.remove("is-pressed");
      }, 180);
    };

    arrowDockButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = arrowActions[button.dataset.arrow];
        if (!action) {
          return;
        }
        lightArrowButton(button.dataset.arrow);
        action();
      });
    });

    for (const button of [skipCardBtnEl, hintBtnEl]) {
      if (!button) continue;
      let cornerPulse;
      button.addEventListener("click", () => {
        if (prefersReducedEffects()) return;
        cornerPulse?.cancel();
        cornerPulse = button.animate(
          [
            { transform: "scale(1)", offset: 0 },
            { transform: "scale(0.97)", offset: 0.28 },
            { transform: "scale(1.06)", offset: 0.62 },
            { transform: "scale(1)", offset: 1 },
          ],
          { duration: 300, easing: "cubic-bezier(0.22, 0.9, 0.3, 1.18)" },
        );
      });
    }

    if (skipCardBtnEl) {
      skipCardBtnEl.addEventListener("click", () => {
        skipCurrentCard();
      });
    }

    function pulseEnterKeyBadge() {
      if (!enterKeyBtnEl) {
        return;
      }
      window.clearTimeout(enterKeyPulseTimer);
      enterKeyBtnEl.classList.remove("is-key-pressed");
      void enterKeyBtnEl.offsetWidth;
      enterKeyBtnEl.classList.add("is-key-pressed");
      enterKeyPulseTimer = window.setTimeout(() => {
        enterKeyBtnEl.classList.remove("is-key-pressed");
        enterKeyPulseTimer = 0;
      }, 300);
    }

    enterKeyBtnEl?.addEventListener("click", () => {
      if (!getSessionCards().length) {
        return;
      }
      pulseEnterKeyBadge();
      triggerEnterTimeBurst();
      submitCurrentAnswer({ finishNow: true });
      if (!mainCard.classList.contains("is-session-ended")) focusAnswerInputAtEnd();
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isOnboardingBlocked()
      ) {
        return;
      }

      const action = arrowActions[event.key];
      if (!action) {
        return;
      }

      event.preventDefault();
      lightArrowButton(event.key);
      action();
    });

    [promptPrimaryFlagEl, promptSecondaryFlagEl].forEach((button) => {
      button?.addEventListener("click", () => {
        togglePromptOrder();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!shouldCaptureTypingForAnswer(event)) {
        return;
      }

      event.preventDefault();
      focusAnswerInputAtEnd();
      insertTextIntoAnswerInput(event.key);
    });

    mainCard?.addEventListener("click", (event) => {
      if (!shouldTapFocusAnswerInput(event.target)) {
        return;
      }

      focusAnswerInputAtEnd();
    });

    inputEl.addEventListener("input", () => {
      const sessionCards = getSessionCards();
      if (!sessionCards.length) {
        return;
      }

      if (!isRoundTimerStarted() && inputEl.value.length > 0) {
        startRoundTimer();
      }

      const currentCard = sessionCards[getSessionIndex()];
      if (!isRenderableCard(currentCard)) {
        void recoverPlayableSession("input-invalid-card", sessionCards.length || SESSION_SIZE);
        return;
      }

      const target = getTargetValue(currentCard);
      const typedValue = inputEl.value;
      const previousTypedValue = getPreviousTypedValue();
      const addedTypingUnits = countInsertedTypingUnits(previousTypedValue, typedValue);
      if (addedTypingUnits > 0) {
        addTypingUnits(addedTypingUnits);
      }
      const previousPrefix = getCorrectPrefixLength(target, previousTypedValue);
      const currentPrefix = getCorrectPrefixLength(target, typedValue);
      const previousExact = isExactTypedMatch(target, previousTypedValue);
      const currentExact = isExactTypedMatch(target, typedValue);
      const previousAtOrPastEnd = previousTypedValue.length >= target.length;
      const currentAtOrPastEnd = typedValue.length >= target.length;
      const reachedTerminalSuccess = !previousExact && currentExact;
      const reachedTerminalError = currentAtOrPastEnd && !currentExact && (!previousAtOrPastEnd || previousExact);
      const freshCorrectIndexes = getFreshCorrectIndexes(target, previousTypedValue, typedValue);
      const freshWrongIndexes = getFreshWrongIndexes(target, previousTypedValue, typedValue);

      answerGuideController.buildWordGrid(target, typedValue, {
        freshCorrectIndexes,
        freshWrongIndexes,
        terminalHit:
          reachedTerminalSuccess ? "success" :
          reachedTerminalError ? "error" :
          null,
      });

      if (reachedTerminalSuccess) {
        answerGuideController.playCompleteHit();
        showFeedbackBurst("success", false);
      } else if (
        reachedTerminalError ||
        (previousExact && !currentExact && typedValue.length > previousTypedValue.length) ||
        (typedValue.length > previousTypedValue.length && currentPrefix < typedValue.length && currentPrefix <= previousPrefix)
      ) {
        showFeedbackBurst("error", false);
      }

      setPreviousTypedValue(typedValue);

      if (currentExact) {
        scheduleAutoSubmit(target, currentCard);
      } else {
        cancelAutoSubmit();
      }
    });

    hintBtnEl?.addEventListener("click", () => {
      const sessionCards = getSessionCards();
      if (!sessionCards.length) {
        return;
      }

      const currentCard = sessionCards[getSessionIndex()];
      if (!isRenderableCard(currentCard)) {
        void recoverPlayableSession("hint-invalid-card", sessionCards.length || SESSION_SIZE);
        return;
      }

      const target = getTargetValue(currentCard);
      const reveal = answerGuideController.getHintRevealValue(target, inputEl.value);
      inputEl.value = reveal;
      inputEl.className = "";
      answerGuideController.buildWordGrid(target, reveal, {
        terminalHit: isExactTypedMatch(target, reveal) ? "success" : null,
      });
      if (isExactTypedMatch(target, reveal)) {
        answerGuideController.playCompleteHit();
      }
      setPreviousTypedValue(reveal);
      focusAnswerInputAtEnd();
    });

    inputEl.addEventListener("touchstart", activateTouchInputWithoutScroll, { passive: false });

    inputEl.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") {
        activateTouchInputWithoutScroll(event);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        !getPendingFinishAt() ||
        event.key !== "Enter" ||
        event.repeat ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        getFirstRunTour()?.isOpen()
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pulseEnterKeyBadge();
      triggerEnterTimeBurst();
      showSessionEnd();
    }, { capture: true });

    inputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || !getSessionCards().length) {
        return;
      }
      event.preventDefault();
      if (event.repeat || event.isComposing) return;
      pulseEnterKeyBadge();
      triggerEnterTimeBurst();
      submitCurrentAnswer();
    });
  }

  return {
    initDifficultyControls,
    initInputEvents,
  };
}
