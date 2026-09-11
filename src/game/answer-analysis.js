export function getCorrectPrefixLength(target, typed) {
  let index = 0;
  while (
    index < typed.length &&
    index < target.length &&
    typed[index].toLowerCase() === target[index].toLowerCase()
  ) {
    index += 1;
  }
  return index;
}

export function getGuideSeparatorKind(char) {
  if (char === " ") {
    return "space";
  }
  return null;
}

export function isGuideSeparatorChar(char) {
  return getGuideSeparatorKind(char) !== null;
}

export function getGuideSeparatorSymbol(char) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return "";
  }

  return char;
}

export function getGuideTokens(target) {
  const tokens = [];
  let wordStart = -1;

  for (let index = 0; index < target.length; index += 1) {
    const char = target[index];

    if (isGuideSeparatorChar(char)) {
      if (wordStart !== -1) {
        tokens.push({
          type: "word",
          start: wordStart,
          end: index,
          text: target.slice(wordStart, index),
        });
        wordStart = -1;
      }

      tokens.push({
        type: "separator",
        start: index,
        end: index + 1,
        char,
        kind: getGuideSeparatorKind(char),
      });
      continue;
    }

    if (wordStart === -1) {
      wordStart = index;
    }
  }

  if (wordStart !== -1) {
    tokens.push({
      type: "word",
      start: wordStart,
      end: target.length,
      text: target.slice(wordStart),
    });
  }

  return tokens;
}

export function getGuideWordTokens(target) {
  return getGuideTokens(target)
    .filter((token) => token.type === "word")
    .map((token, index) => ({
      ...token,
      wordNumber: index + 1,
    }));
}

export function getGuideWordTokenAt(wordTokens, index) {
  for (const token of wordTokens) {
    if (index >= token.start && index < token.end) {
      return token;
    }
  }

  return null;
}

export function getGuidePreviousWordToken(wordTokens, index) {
  let previous = null;

  for (const token of wordTokens) {
    if (token.start >= index) {
      break;
    }
    previous = token;
  }

  return previous;
}

export function getFreshCorrectIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const wasCorrect = prevChar !== undefined && prevChar.toLowerCase() === targetChar.toLowerCase();
    const isCorrect = currentChar.toLowerCase() === targetChar.toLowerCase();

    if (!wasCorrect && isCorrect) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

export function getFreshWrongIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const isWrong = currentChar.toLowerCase() !== targetChar.toLowerCase();
    if (!isWrong) {
      continue;
    }

    if (prevChar === undefined || currentChar !== prevChar || prevChar.toLowerCase() === targetChar.toLowerCase()) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

export function isExactTypedMatch(target, typed) {
  return typed.length === target.length && getCorrectPrefixLength(target, typed) === target.length;
}
