import { AUTOFILL_TRAILING_PUNCT } from "../config/app.js";
import {
  getCorrectPrefixLength,
  getGuidePreviousWordToken,
  getGuideSeparatorKind,
  getGuideWordTokenAt,
  getGuideWordTokens,
  isExactTypedMatch,
} from "./answer-analysis.js";
import { createWordGridRenderer, describeWordGrid } from "./word-grid.js";
import {
  answerGuideSizingState,
  scheduleAnswerGuideMeasure,
} from "../layout/viewport-controller.js";
import {
  answerGuideEl,
  answerGuideNoteEl,
  answerGuideStatusEl,
  answerTerminalStatusEl,
  answerTerminalStatusRowEl,
  wordGrid,
} from "../ui/dom.js";

export function getHintRevealStep(difficulty) {
  if (difficulty === "easy") {
    return 3;
  }
  if (difficulty === "medium") {
    return 2;
  }
  return 1;
}

export function getHintRevealValue(target, typed, difficulty) {
  const nextLength = Math.min(
    target.length,
    getCorrectPrefixLength(target, typed) + getHintRevealStep(difficulty)
  );
  return target.slice(0, nextLength);
}

export function getCharMeta(target, difficulty) {
  const hints = new Set();
  const autofill = new Set();
  const hintCountPerWord =
    difficulty === "easy" ? 3 :
    difficulty === "medium" ? 1 :
    0;

  getGuideWordTokens(target).forEach((wordToken) => {
    const word = wordToken.text;

    for (let i = 0; i < hintCountPerWord && i < word.length; i += 1) {
      hints.add(wordToken.start + i);
    }

    let tail = wordToken.end - 1;
    while (tail > wordToken.start && AUTOFILL_TRAILING_PUNCT.test(target[tail])) {
      autofill.add(tail);
      tail -= 1;
    }
  });

  return { hints, autofill };
}

export function createAnswerGuideController({ translate, getDifficulty }) {
  let answerGuideCompleteTimer = null;
  const renderWordGrid = createWordGridRenderer(wordGrid);

  function getGuideSeparatorLabel(char, { overflow = false } = {}) {
    const kind = getGuideSeparatorKind(char);
    if (kind === "space") {
      return translate(overflow ? "messages.guide.extraSeparator" : "messages.guide.separator");
    }
    return char;
  }

  function getGuideStatusForSeparator(char, word, total) {
    const kind = getGuideSeparatorKind(char);
    if (kind === "space") {
      return translate("messages.guide.statusSpace", { word, total });
    }
    return "";
  }

  function getGuideProgress(target, typed) {
    const correctPrefixLen = getCorrectPrefixLength(target, typed);
    const wordTokens = getGuideWordTokens(target);
    const totalWords = Math.max(wordTokens.length, 1);
    const hasExtraChars = typed.length > target.length && correctPrefixLen >= target.length;
    const hasWrongChar = typed.length > correctPrefixLen && !hasExtraChars;

    if (hasExtraChars) {
      return {
        state: "error",
        statusText: translate("messages.guide.statusTooLong"),
        noteText: translate("messages.guide.noteTooLong"),
      };
    }

    if (hasWrongChar) {
      const expectedChar = target[correctPrefixLen];
      const separatorStatus = getGuideStatusForSeparator(
        expectedChar,
        getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
        totalWords,
      );

      if (separatorStatus) {
        return {
          state: "error",
          statusText: separatorStatus,
          noteText: translate("messages.guide.noteWrong"),
        };
      }

      const currentWordToken =
        getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
        getGuidePreviousWordToken(wordTokens, correctPrefixLen) ||
        wordTokens[0];

      return {
        state: "error",
        statusText: translate("messages.guide.statusWrong", {
          word: currentWordToken?.wordNumber || 1,
          total: totalWords,
          char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
        }),
        noteText: translate("messages.guide.noteWrong"),
      };
    }

    if (correctPrefixLen >= target.length) {
      return {
        state: "success",
        statusText: translate("messages.guide.statusDone", { total: totalWords }),
        noteText: "",
      };
    }

    const nextChar = target[correctPrefixLen];
    const separatorStatus = getGuideStatusForSeparator(
      nextChar,
      getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
      totalWords,
    );

    if (separatorStatus) {
      return {
        state: "progress",
        statusText: separatorStatus,
        noteText: "",
      };
    }

    const currentWordToken =
      getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
      wordTokens[wordTokens.length - 1] ||
      null;

    return {
      state: "progress",
      statusText: translate("messages.guide.statusProgress", {
        word: currentWordToken?.wordNumber || 1,
        total: totalWords,
        char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
        length: currentWordToken?.text.length || 1,
      }),
      noteText: "",
    };
  }

  function updateAnswerGuide(target, typed) {
    if (!answerGuideEl || !answerGuideStatusEl || !answerGuideNoteEl) {
      return;
    }

    if (!target) {
      answerGuideEl.classList.remove("is-success", "is-error");
      answerGuideStatusEl.classList.remove("is-success", "is-error");
      answerGuideStatusEl.textContent = "";
      answerGuideNoteEl.textContent = "";
      return;
    }

    const { state, statusText, noteText } = getGuideProgress(target, typed);
    answerGuideEl.classList.toggle("is-success", state === "success");
    answerGuideEl.classList.toggle("is-error", state === "error");
    answerGuideStatusEl.classList.toggle("is-success", state === "success");
    answerGuideStatusEl.classList.toggle("is-error", state === "error");
    answerGuideStatusEl.textContent = statusText;
    answerGuideNoteEl.textContent = noteText;
  }

  function playAnswerGuideCompleteHit() {
    if (!answerGuideEl) {
      return;
    }

    clearTimeout(answerGuideCompleteTimer);
    answerGuideEl.classList.remove("is-complete-hit");
    void answerGuideEl.offsetWidth;
    answerGuideEl.classList.add("is-complete-hit");
    answerGuideCompleteTimer = setTimeout(() => {
      answerGuideEl.classList.remove("is-complete-hit");
    }, 360);
  }

  function clearCompleteHit() {
    clearTimeout(answerGuideCompleteTimer);
    answerGuideEl?.classList.remove("is-complete-hit");
  }

  function updateAnswerTerminalStatus(target, typed, terminalHit = null) {
    if (!answerTerminalStatusRowEl || !answerTerminalStatusEl) {
      return;
    }

    const showTerminalStatus = Boolean(target) && typed.length >= target.length;
    answerTerminalStatusRowEl.classList.toggle("is-visible", showTerminalStatus);
    answerTerminalStatusEl.className = "answer-terminal-status-badge";

    if (!showTerminalStatus) {
      answerTerminalStatusEl.textContent = "";
      return;
    }

    const terminalStatusKind = isExactTypedMatch(target, typed) ? "success" : "error";
    answerTerminalStatusEl.classList.add("is-visible", `is-${terminalStatusKind}`);

    if (terminalHit && terminalHit === terminalStatusKind) {
      answerTerminalStatusEl.classList.add(`is-hit-${terminalHit}`);
    }

    answerTerminalStatusEl.textContent = terminalStatusKind === "success" ? "\u2665" : "\u2715";
  }

  function buildWordGrid(
    target,
    typed,
    {
      freshCorrectIndexes = new Set(),
      freshWrongIndexes = new Set(),
      terminalHit = null,
    } = {}
  ) {
    const difficulty = getDifficulty();
    renderWordGrid(target, describeWordGrid(target, typed, {
      ...getCharMeta(target, difficulty),
      difficulty,
      separatorLabel: getGuideSeparatorLabel,
      freshCorrectIndexes,
      freshWrongIndexes,
    }));

    answerGuideSizingState.target = String(target ?? "");
    answerGuideSizingState.typed = String(typed ?? "");
    scheduleAnswerGuideMeasure("build-word-grid");
    updateAnswerTerminalStatus(target, typed, terminalHit);
    updateAnswerGuide(target, typed);
  }

  return {
    buildWordGrid,
    updateAnswerGuide,
    playCompleteHit: playAnswerGuideCompleteHit,
    clearCompleteHit,
    getHintRevealValue: (target, typed) => getHintRevealValue(target, typed, getDifficulty()),
  };
}
