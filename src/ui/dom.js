// Queried once, after the module script's HTML has been parsed.
export const promptEl = document.getElementById("promptText");

export const promptSub = document.getElementById("promptSub");

export const promptPrimaryFlagEl = document.getElementById("promptPrimaryFlag");

export const promptSecondaryFlagEl = document.getElementById("promptSecondaryFlag");

export const inputFlagEl = document.querySelector(".input-flag");

export const siteTitleEl = document.querySelector(".site-title");

export const siteTitleRowEl = document.querySelector(".site-title-row");

export const heroStageEl = document.getElementById("heroStage");

export const phoneGuideBarEl = document.getElementById("phoneGuideBar");

export const languageDockEl = document.getElementById("languageDock");

export const languageDockButtons = Array.from(document.querySelectorAll(".language-dock-btn"));

export const arrowDockEl = document.getElementById("arrowDock");

export const arrowDockButtons = Array.from(document.querySelectorAll(".arrow-dock-btn"));

export const arrowDockLabelEls = {
  up: document.getElementById("arrowDockLabelUp"),
  left: document.getElementById("arrowDockLabelLeft"),
  down: document.getElementById("arrowDockLabelDown"),
  right: document.getElementById("arrowDockLabelRight"),
};

export const appLoaderEl = document.getElementById("appLoader");

export const appLoaderSpinnerEl = document.getElementById("appLoaderSpinner");

export const onboardingDialogEl = document.getElementById("onboardingDialog");

export const installGuidePanelEl = document.getElementById("installGuidePanel");

export const installGuideBrowserPanelEl = document.getElementById("installGuideBrowserPanel");

export const installGuideBrowserEl = document.getElementById("installGuideBrowser");

export const installGuideStepsEl = document.getElementById("installGuideSteps");

export const statLabelStreakEl = document.getElementById("statLabelStreak");

export const statLabelRemainingEl = document.getElementById("statLabelRemaining");

export const statLabelAccuracyEl = document.getElementById("statLabelAccuracy");

export const statLabelWpmEl = document.getElementById("statLabelWpm");

export const cardLegendEl = document.getElementById("cardLegend");

export const cardTopbarEl = cardLegendEl?.closest(".card-topbar") || null;

export const legendCorrectEl = document.getElementById("legendCorrect");

export const legendNextEl = document.getElementById("legendNext");

export const legendWrongEl = document.getElementById("legendWrong");

export const skipCardBtnEl = document.getElementById("skipCardBtn");

export const skipCardBtnLabelEl = document.getElementById("skipCardBtnLabel");

export const skipCounterEl = document.getElementById("skipCounter");

export const enterKeyBtnEl = document.getElementById("enterKeyBtn");

export const promptHeadTitleEl = document.getElementById("promptHeadTitle");

export const inputEl = document.getElementById("answer");

export const wordGrid = document.getElementById("wordGrid");

export const answerTerminalStatusRowEl = document.getElementById("answerTerminalStatusRow");

export const answerTerminalStatusEl = document.getElementById("answerTerminalStatus");

export const answerGuideEl = document.getElementById("answerGuide");

export const answerGuideBodyEl = answerGuideEl?.querySelector(".answer-guide-body") || null;

export const answerGuideTrailFlagEl = answerGuideEl?.querySelector(".answer-guide-trail-flag") || null;

export const answerGuideActionRowEl = answerGuideEl?.querySelector(".action-row") || null;

export const roundTimerEl = document.getElementById("roundTimer");

export const finalTimeEl = document.getElementById("finalTime");

export const answerGuideLabelEl = document.getElementById("answerGuideLabel");

export const answerGuideStatusEl = document.getElementById("answerGuideStatus");

export const answerGuideNoteEl = document.getElementById("answerGuideNote");

export const feedbackBurstEl = document.getElementById("feedbackBurst");

export const progFill = document.getElementById("progressFill");

export const categoryEl = document.getElementById("categoryBadge");

export const comboPop = document.getElementById("comboPop");

export const gameArea = document.getElementById("gameArea");

export const sessionEndEl = document.getElementById("sessionEnd");

export const mainCard = document.getElementById("mainCard");

export const progressTrackEl = document.querySelector(".progress-track");

export const statsBarEl = document.querySelector(".stats-bar");

export const catCountEl = document.getElementById("catCount");

export const catButtonsLabelEl = document.getElementById("catButtonsLabel");

export const subcategoryFilterLabelEl = document.getElementById("subcategoryFilterLabel");

export const subcategoryButtonsEl = document.getElementById("subcategoryButtons");

export const settingsPanelTitleEl = document.getElementById("settingsPanelTitle");

export const settingsPanelTitleTextEl = document.getElementById("settingsPanelTitleText");

export const tutorialReplayBtnEl = document.getElementById("tutorialReplayBtn");

export const catPanelTitleEl = document.getElementById("catPanelTitle");

export const difficultyHardBtn = document.getElementById("difficultyHardBtn");

export const difficultyMediumBtn = document.getElementById("difficultyMediumBtn");

export const difficultyEasyBtn = document.getElementById("difficultyEasyBtn");

export const sliderUnitLabelEl = document.getElementById("sliderUnitLabel");

export const sessionSizeSliderEl = document.getElementById("sessionSizeSlider");

export const sliderLabelEl = document.getElementById("sliderLabel");

export const newGameBtn = document.getElementById("newGameBtn");

export const searchPanelEl = document.getElementById("searchPanel");

export const searchPanelTitleEl = document.getElementById("searchPanelTitle");

export const searchPanelSubtitleEl = document.getElementById("searchPanelSubtitle");

export const grammarSectionTitleEl = document.getElementById("grammarSectionTitle");

export const grammarGridEl = document.getElementById("grammarGrid");

export const searchLinksEl = document.getElementById("searchLinks");

export const authorPanelEl = document.getElementById("authorPanel");

export const authorToggleBtn = document.getElementById("authorToggleBtn");

export const authorPanelTitleEl = document.getElementById("authorPanelTitle");

export const addCardForm = document.getElementById("addCardForm");

export const addCardDeEl = document.getElementById("newCardDe");

export const addCardHrEl = document.getElementById("newCardHr");

export const addCardEnEl = document.getElementById("newCardEn");

export const addCardTopicEl = document.getElementById("newCardTopic");

export const addCardSubcategoryEl = document.getElementById("newCardSubcategory");

export const addCardScopeEl = document.getElementById("newCardScope");

export const authorLabelDeEl = document.getElementById("authorLabelDe");

export const authorLabelTopicEl = document.getElementById("authorLabelTopic");

export const authorLabelSubcategoryEl = document.getElementById("authorLabelSubcategory");

export const authorLabelScopeEl = document.getElementById("authorLabelScope");

export const authorLabelHrEl = document.getElementById("authorLabelHr");

export const authorLabelEnEl = document.getElementById("authorLabelEn");

export const addCardSaveBtn = document.getElementById("addCardSaveBtn");

export const exportCardsBtn = document.getElementById("exportCardsBtn");

export const addCardStatusEl = document.getElementById("addCardStatus");

export const authorModeEl = document.getElementById("authorMode");

export const factsPanelTitleEl = document.getElementById("factsPanelTitle");

export const factsPanelSubtitleEl = document.getElementById("factsPanelSubtitle");

export const factsCountryBtn = document.getElementById("factsCountryBtn");

export const factsStatesBtn = document.getElementById("factsStatesBtn");

export const factsWorldBtn = document.getElementById("factsWorldBtn");

export const statePickerWrap = document.getElementById("statePickerWrap");

export const statePickerEl = document.getElementById("statePicker");

export const factsContentEl = document.getElementById("factsContent");

export const factsPanelEl = document.querySelector(".facts-panel");

export const hintBtnEl = document.getElementById("hintBtn");

export const enterHintLabelEl = document.getElementById("enterHintLabel");

export const sessionEndLabelEl = document.getElementById("sessionEndLabel");

export const finalCorrectLabelEl = document.getElementById("finalCorrectLabel");

export const finalSkippedLabelEl = document.getElementById("finalSkippedLabel");

export const finalStreakLabelEl = document.getElementById("finalStreakLabel");

export const finalWpmLabelEl = document.getElementById("finalWpmLabel");

export const finalTimeLabelEl = document.getElementById("finalTimeLabel");

export const restartBtnEl = document.getElementById("restartBtn");

export const finalCorrectEl = document.getElementById("finalCorrect");

export const finalSkippedEl = document.getElementById("finalSkipped");

export const finalStreakEl = document.getElementById("finalStreak");

export const finalWpmEl = document.getElementById("finalWpm");

export const siteFooterLinkEl = document.getElementById("siteFooterLink");
