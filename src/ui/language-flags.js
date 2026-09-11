export const LANGUAGE_FLAG_BASE_CLASS = "language-flag-icon";

export const LANGUAGE_FLAG_CLASSES = {
  de: "language-flag-icon--de",
  hr: "language-flag-icon--hr",
  en: "language-flag-icon--en",
};

export const LANGUAGE_FLAG_SOURCES = {
  de: "https://flagcdn.com/de.svg",
  hr: "https://flagcdn.com/hr.svg",
  en: "https://flagcdn.com/gb.svg",
};

export const LANGUAGE_FLAG_CLASS_NAMES = Object.values(LANGUAGE_FLAG_CLASSES);

export function setLanguageFlagIcon(targetEl, language) {
  if (!targetEl) {
    return;
  }

  const resolvedLanguage = LANGUAGE_FLAG_CLASSES[language] ? language : "de";
  const flagClass = LANGUAGE_FLAG_CLASSES[resolvedLanguage];
  const flagSource = LANGUAGE_FLAG_SOURCES[resolvedLanguage];

  Array.from(targetEl.childNodes).forEach((node) => {
    if (node.nodeType === 3) {
      node.remove();
    }
  });

  const flagIcons = Array.from(targetEl.querySelectorAll(`.${LANGUAGE_FLAG_BASE_CLASS}`));
  let flagEl = flagIcons[0] || null;
  flagIcons.slice(1).forEach((node) => node.remove());

  if (!flagEl || flagEl.tagName !== "IMG") {
    const imageEl = document.createElement("img");
    if (flagEl) {
      imageEl.className = flagEl.className;
      flagEl.replaceWith(imageEl);
    } else {
      targetEl.prepend(imageEl);
    }
    flagEl = imageEl;
  }

  flagEl.classList.add(LANGUAGE_FLAG_BASE_CLASS);
  LANGUAGE_FLAG_CLASS_NAMES.forEach((className) => flagEl.classList.remove(className));
  flagEl.classList.add(flagClass);
  flagEl.src = flagSource;
  flagEl.alt = "";
  flagEl.loading = "eager";
  flagEl.decoding = "async";
  flagEl.draggable = false;
  flagEl.setAttribute("aria-hidden", "true");
  targetEl.dataset.flagLanguage = resolvedLanguage;
}
