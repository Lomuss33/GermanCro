import { SESSION_STORAGE_KEY } from "../config/app.js";
import {
  CARD_SCOPE_OPTIONS,
  SUBCATEGORY_OPTIONS,
  TOPIC_OPTIONS,
  mergeCards,
  sanitizeCard,
} from "../../shared/card-schema.js";
import {
  addCardDeEl,
  addCardEnEl,
  addCardForm,
  addCardHrEl,
  addCardSaveBtn,
  addCardScopeEl,
  addCardStatusEl,
  addCardSubcategoryEl,
  addCardTopicEl,
  authorModeEl,
  authorPanelEl,
  authorToggleBtn,
  exportCardsBtn,
} from "../ui/dom.js";

export function loadSessionAuthoringCards() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeCard).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function fillSelectOptions(selectEl, values, getLabel, fallbackValue) {
  if (!selectEl) {
    return;
  }

  const currentValue = selectEl.value;
  selectEl.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = getLabel(value);
    selectEl.appendChild(option);
  });

  const nextValue = values.includes(currentValue) ? currentValue : fallbackValue;
  if (nextValue) {
    selectEl.value = nextValue;
  }
}

export function createCardAuthoringController({
  translate,
  getTopicLabel,
  getSubcategoryLabel,
  getScopeLabel,
  getCapabilities,
  getPersistentCards,
  setPersistentCards,
  getSessionOnlyCards,
  setSessionOnlyCards,
  hasDuplicateCard,
  addCardToRuntime,
  showToast,
}) {
  function saveSessionCards() {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(getSessionOnlyCards(), null, 2));
  }

  function getExtraCardsForExport() {
    return mergeCards(getPersistentCards(), getSessionOnlyCards());
  }

  function setAuthoringFeedback(message, isError) {
    if (!addCardStatusEl) return;
    addCardStatusEl.textContent = message;
    addCardStatusEl.classList.toggle("is-error", Boolean(isError));
  }

  function setAuthoringBusy(isBusy) {
    if (!addCardSaveBtn || !exportCardsBtn) return;
    const persistentSave = Boolean(getCapabilities()?.persistentSave);
    addCardSaveBtn.disabled = isBusy;
    exportCardsBtn.disabled = isBusy;
    addCardSaveBtn.textContent = isBusy
      ? translate("messages.authoring.saveBusy")
      : persistentSave
        ? translate("messages.authoring.savePersistent")
        : translate("messages.authoring.saveSession");
    exportCardsBtn.textContent = translate("messages.authoring.export");
  }

  function renderAuthoringMode() {
    if (!authorModeEl) return;
    if (getCapabilities()?.persistentSave) {
      authorModeEl.classList.add("persistent");
      setAuthoringFeedback(translate("messages.authoring.modePersistent"), false);
    } else {
      authorModeEl.classList.remove("persistent");
      setAuthoringFeedback(translate("messages.authoring.modeSession"), false);
    }
    setAuthoringBusy(false);
  }

  function fillAuthoringSelects() {
    fillSelectOptions(addCardTopicEl, TOPIC_OPTIONS, getTopicLabel, TOPIC_OPTIONS[0]);
    fillSelectOptions(addCardSubcategoryEl, SUBCATEGORY_OPTIONS, getSubcategoryLabel, SUBCATEGORY_OPTIONS[0]);
    fillSelectOptions(addCardScopeEl, CARD_SCOPE_OPTIONS, getScopeLabel, CARD_SCOPE_OPTIONS[0]);
  }

  function downloadCardsUserJson() {
    const cards = getExtraCardsForExport();
    if (!cards.length) {
      setAuthoringFeedback(translate("messages.authoring.exportEmpty"), true);
      return;
    }

    const blob = new Blob([`${JSON.stringify(cards, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cards.user.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setAuthoringFeedback(translate("messages.authoring.exportDone"), false);
  }

  async function handleAddCardSubmit(event) {
    event.preventDefault();

    const card = sanitizeCard({
      topic: addCardTopicEl.value,
      subcategory: addCardSubcategoryEl.value,
      scope: addCardScopeEl.value,
      de: addCardDeEl.value,
      hr: addCardHrEl.value,
      en: addCardEnEl.value,
    });

    if (!card) {
      setAuthoringFeedback(translate("messages.authoring.invalid"), true);
      return;
    }

    if (hasDuplicateCard(card)) {
      setAuthoringFeedback(translate("messages.authoring.duplicate"), true);
      return;
    }

    setAuthoringBusy(true);

    try {
      if (getCapabilities()?.persistentSave) {
        const response = await fetch("./api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || translate("messages.authoring.saveFailed"));
        }

        const savedCard = payload.card || card;
        setPersistentCards(mergeCards(getPersistentCards(), [savedCard]));
        addCardToRuntime(savedCard);
        setAuthoringFeedback(translate("messages.authoring.savedPersistent"), false);
      } else {
        setSessionOnlyCards(mergeCards(getSessionOnlyCards(), [card]));
        saveSessionCards();
        addCardToRuntime(card);
        setAuthoringFeedback(translate("messages.authoring.savedSession"), false);
      }

      addCardForm.reset();
      fillAuthoringSelects();
      addCardTopicEl.value = TOPIC_OPTIONS[0];
      addCardSubcategoryEl.value = SUBCATEGORY_OPTIONS[0];
      addCardScopeEl.value = CARD_SCOPE_OPTIONS[0];
      showToast(translate("messages.toasts.cardSaved"));
    } catch (error) {
      setAuthoringFeedback(error.message || translate("messages.authoring.saveFailed"), true);
    } finally {
      setAuthoringBusy(false);
    }
  }

  function initAuthoringForm() {
    fillAuthoringSelects();
    addCardForm.addEventListener("submit", handleAddCardSubmit);
    exportCardsBtn.addEventListener("click", downloadCardsUserJson);

    if (authorToggleBtn && authorPanelEl) {
      authorToggleBtn.addEventListener("click", () => {
        const isOpen = !authorPanelEl.classList.contains("is-hidden");
        authorPanelEl.classList.toggle("is-hidden", isOpen);
        authorToggleBtn.classList.toggle("active", !isOpen);
        authorToggleBtn.setAttribute("aria-expanded", String(!isOpen));
      });
    }
  }

  return {
    init: initAuthoringForm,
    fillSelects: fillAuthoringSelects,
    renderMode: renderAuthoringMode,
  };
}
