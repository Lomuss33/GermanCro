import { SESSION_SIZE } from "../config/app.js";
import { SUBCATEGORY_COLORS, SUBCATEGORY_ICONS } from "../config/categories.js";
import { SUBCATEGORY_OPTIONS, TOPIC_CONFIG, TOPIC_OPTIONS } from "../../shared/card-schema.js";
import {
  catCountEl,
  newGameBtn,
  sessionSizeSliderEl,
  sliderLabelEl,
  subcategoryButtonsEl,
} from "../ui/dom.js";

export function resolveSessionSize(size, fallback = SESSION_SIZE) {
  const parsed = Number(size);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(parsed));
}

export function getRequestedSessionSize() {
  return resolveSessionSize(sessionSizeSliderEl?.value, SESSION_SIZE);
}

export function syncSessionSizeLabel() {
  if (sliderLabelEl && sessionSizeSliderEl) {
    sliderLabelEl.textContent = sessionSizeSliderEl.value;
  }
}

export function getTopicColor(topic) {
  return TOPIC_CONFIG[topic]?.color || "#888";
}

function setTopicButtonContent(button, label, icon = "•") {
  const iconEl = document.createElement("span");
  iconEl.className = "cat-btn-icon";
  iconEl.setAttribute("aria-hidden", "true");

  const glyphEl = document.createElement("span");
  glyphEl.className = "cat-btn-icon-glyph";
  glyphEl.textContent = icon;
  iconEl.appendChild(glyphEl);

  const labelEl = document.createElement("span");
  labelEl.className = "cat-btn-label";
  labelEl.textContent = label;

  button.replaceChildren(iconEl, labelEl);
}

export function updateOnboardingCategoryPreviewTarget() {
  const container = document.getElementById("catButtons");
  const target = container?.querySelector('[data-onboarding-target="category-preview"]');
  if (!container || !target) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const rows = [];
  Array.from(container.children)
    .filter((button) => button.classList.contains("cat-btn"))
    .forEach((button) => {
      const rect = button.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const currentRow = rows[rows.length - 1];
      if (!currentRow || Math.abs(rect.top - currentRow.top) > 1) {
        rows.push({ top: rect.top, bottom: rect.bottom });
      } else {
        currentRow.bottom = Math.max(currentRow.bottom, rect.bottom);
      }
    });

  const previewRows = rows.slice(0, 3);
  if (!previewRows.length) {
    target.style.height = "0px";
    return;
  }

  const previewTop = previewRows[0].top - containerRect.top;
  const previewBottom = previewRows[previewRows.length - 1].bottom - containerRect.top;
  target.style.top = `${Math.max(0, previewTop)}px`;
  target.style.height = `${Math.max(0, previewBottom - previewTop)}px`;
}

export function createCategoryPanelController({
  translate,
  getTopicLabel,
  getSubcategoryLabel,
  getSelectedTopics,
  setSelectedTopics,
  getSelectedSubcategories,
  setSelectedSubcategories,
  getExtendedRoundSize,
  getPool,
}) {
  let mixedTopicFeedbackTimer = 0;

  function playMixedTopicReselectFeedback() {
    const button = document.querySelector("#catButtons .cat-btn.mixed.active");
    if (!button) {
      return;
    }

    window.clearTimeout(mixedTopicFeedbackTimer);
    button.classList.remove("is-reselecting");
    void button.offsetWidth;
    button.classList.add("is-reselecting");
    mixedTopicFeedbackTimer = window.setTimeout(() => {
      button.classList.remove("is-reselecting");
      mixedTopicFeedbackTimer = 0;
    }, 220);
  }

  function updateRoundSizeControl(availableCount) {
    const extendedRoundSize = getExtendedRoundSize();
    const available = Math.max(0, Math.floor(Number(availableCount) || 0));
    const sliderMax = extendedRoundSize ? Math.max(5, available) : 50;
    if (sessionSizeSliderEl) {
      sessionSizeSliderEl.min = "5";
      sessionSizeSliderEl.max = String(sliderMax);
      sessionSizeSliderEl.step = extendedRoundSize ? "1" : "5";
      const currentValue = Number(sessionSizeSliderEl.value) || 5;
      sessionSizeSliderEl.value = String(Math.max(5, Math.min(sliderMax, currentValue)));
      syncSessionSizeLabel();
    }

    if (catCountEl) {
      const unit = translate("messages.categories.unit");
      const action = translate(extendedRoundSize
        ? "messages.categories.roundLimitLock"
        : "messages.categories.roundLimitUnlock");
      catCountEl.textContent = `${available} ${unit}`;
      catCountEl.setAttribute("aria-pressed", String(extendedRoundSize));
      catCountEl.setAttribute("aria-label", `${available} ${unit}. ${action}`);
      catCountEl.title = action;
    }
  }

  function buildSubcategoryPanel() {
    if (!subcategoryButtonsEl) {
      return;
    }

    subcategoryButtonsEl.replaceChildren();
    const options = [null, ...SUBCATEGORY_OPTIONS];
    options.forEach((subcategory, index) => {
      const selectedSubcategories = getSelectedSubcategories();
      const isActive = subcategory === null
        ? selectedSubcategories === null
        : selectedSubcategories?.has(subcategory) === true;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `subcategory-btn${subcategory === null ? " subcategory-btn-all" : ""}${isActive ? " active" : ""}`;
      if (subcategory) {
        button.style.setProperty("--subcategory-color", SUBCATEGORY_COLORS[index - 1]);
      }
      button.dataset.subcategory = subcategory || "all";
      button.setAttribute("aria-pressed", String(isActive));
      const icon = document.createElement("span");
      icon.className = "subcategory-btn-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = SUBCATEGORY_ICONS[subcategory || "all"];
      const label = document.createElement("span");
      label.className = "subcategory-btn-label";
      label.textContent = subcategory ? getSubcategoryLabel(subcategory) : translate("messages.categories.classAll");
      button.replaceChildren(icon, label);
      button.addEventListener("click", () => {
        if (subcategory === null) {
          setSelectedSubcategories(null);
        } else {
          let nextSet = getSelectedSubcategories();
          if (nextSet === null) {
            nextSet = new Set();
          }
          if (nextSet.has(subcategory)) {
            nextSet.delete(subcategory);
            if (nextSet.size === 0) {
              nextSet = null;
            }
          } else {
            nextSet.add(subcategory);
          }
          setSelectedSubcategories(nextSet);
        }
        buildTopicPanel();
      });
      subcategoryButtonsEl.appendChild(button);
    });
  }

  function buildTopicPanel() {
    const container = document.getElementById("catButtons");
    if (!container) return;
    container.innerHTML = "";

    const previewTarget = document.createElement("span");
    previewTarget.className = "onboarding-category-preview-target";
    previewTarget.dataset.onboardingTarget = "category-preview";
    previewTarget.setAttribute("aria-hidden", "true");
    container.appendChild(previewTarget);

    const selectedTopics = getSelectedTopics();
    const mixBtn = document.createElement("button");
    mixBtn.type = "button";
    mixBtn.className = `cat-btn mixed${selectedTopics === null ? " active" : ""}`;
    mixBtn.style.setProperty("--cat-color", "#e8ff47");
    mixBtn.setAttribute("aria-pressed", String(selectedTopics === null));
    setTopicButtonContent(mixBtn, translate("messages.categories.mixed"), "🧩");
    mixBtn.onclick = () => {
      const wasAlreadySelected = getSelectedTopics() === null;
      setSelectedTopics(null);
      buildTopicPanel();
      if (wasAlreadySelected) {
        playMixedTopicReselectFeedback();
      }
    };
    container.appendChild(mixBtn);

    TOPIC_OPTIONS.forEach((topic) => {
      const color = getTopicColor(topic);
      const currentTopics = getSelectedTopics();
      const isActive = currentTopics !== null && currentTopics.has(topic);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cat-btn${isActive ? " active" : ""}`;
      btn.dataset.topic = topic;
      btn.setAttribute("aria-pressed", String(isActive));
      setTopicButtonContent(btn, getTopicLabel(topic), TOPIC_CONFIG[topic]?.icon);
      btn.style.setProperty("--cat-color", color);
      btn.style.borderColor = `${color}70`;
      btn.style.color = isActive ? "#07101b" : "#fff";
      btn.style.background = isActive
        ? color
        : `linear-gradient(135deg, ${color}b8, ${color}52), linear-gradient(180deg, rgba(18, 28, 64, 0.88), rgba(8, 14, 34, 0.94))`;
      const iconEl = btn.querySelector(".cat-btn-icon");
      if (iconEl) {
        iconEl.style.color = isActive ? "#07101b" : color;
      }
      btn.onclick = () => {
        let nextTopics = getSelectedTopics();
        if (nextTopics === null) {
          nextTopics = new Set();
        }

        if (nextTopics.has(topic)) {
          nextTopics.delete(topic);
          if (nextTopics.size === 0) {
            nextTopics = null;
          }
        } else {
          nextTopics.add(topic);
        }

        setSelectedTopics(nextTopics);
        buildTopicPanel();
      };
      container.appendChild(btn);
    });

    updateOnboardingCategoryPreviewTarget();
    buildSubcategoryPanel();

    const pool = getPool();
    updateRoundSizeControl(pool.length);
    if (newGameBtn) {
      newGameBtn.disabled = pool.length === 0;
    }
  }

  function initPreviewObserver() {
    updateOnboardingCategoryPreviewTarget();
    window.addEventListener("resize", updateOnboardingCategoryPreviewTarget, { passive: true });
    window.addEventListener("orientationchange", updateOnboardingCategoryPreviewTarget, { passive: true });

    const container = document.getElementById("catButtons");
    if (container && typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(updateOnboardingCategoryPreviewTarget);
      observer.observe(container);
    }
  }

  return {
    buildTopicPanel,
    updateRoundSizeControl,
    initPreviewObserver,
  };
}
