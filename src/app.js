const STORAGE_KEY = "studio-critic-ai:v1";
const ENTRY_KEY = "studioCriticEntered";
const START_MODE_KEY = "studioCriticStartMode";
const MODEL_NAME = "gemini-2.5-flash-lite";
const FIREBASE_SDK_VERSION = "11.10.0";
const MAX_INPUT_CHARS = 4000;
const AI_INIT_TIMEOUT_MS = 10000;
const AI_GENERATE_TIMEOUT_MS = 45000;
const CONFIG_URL = new URL("./src/firebaseConfig.js", window.location.href).href;
const START_TEMPLATE_HASH = "#/start/template";
const FEEDBACK_EXAMPLES = {
  graduation:
    "컨셉은 흥미롭지만 평면과 단면에서 그 개념이 어떻게 공간으로 이어지는지 아직 명확하지 않다. 프로그램 배치와 동선이 주제와 연결되도록 다이어그램과 도면에서 더 분명하게 보여줘야 한다.",
  competition:
    "아이디어는 명확하지만 심사 기준에서 요구하는 공공성, 실현 가능성, 제출물 구성과 어떻게 연결되는지 약하다. 핵심 개념을 한 장의 패널에서 바로 이해할 수 있도록 도면, 다이어그램, 설명 문장의 위계를 정리해야 한다.",
  studio:
    "동선은 흥미롭지만 프로그램 간 관계가 평면에서 명확하게 읽히지 않는다. 중심 공간이 좋은 장치처럼 보이지만 실제로 사람들이 어떻게 모이고 이동하는지 더 구체적으로 보여줘야 한다.",
  portfolio:
    "프로젝트 결과물은 정리되어 있지만 설계가 어떻게 발전했는지 과정이 잘 드러나지 않는다. 초기 문제의식, 주요 피드백, 변경 방향, 최종 설계 논리를 하나의 서사로 연결해야 한다.",
  renovation:
    "기존 공간의 문제점은 보이지만 어떤 부분을 유지하고 어떤 부분을 바꾸는지 기준이 약하다. 현황 분석, 사용자 불편, 개선 전략이 평면과 다이어그램에서 더 명확하게 연결되어야 한다.",
  urbanInfra:
    "도시적 문제의식은 좋지만 대지 맥락, 보행 흐름, 프로그램 배치, 시스템 작동 방식이 서로 따로 보인다. 도시 스케일의 흐름과 건축 내부 프로그램이 어떻게 연결되는지 단계적으로 보여줘야 한다.",
  default:
    "동선은 흥미롭지만 프로그램 간 관계가 평면에서 명확하게 읽히지 않는다. 중심 공간이 좋은 장치처럼 보이지만 실제로 사람들이 어떻게 모이고 이동하는지 더 구체적으로 보여줘야 한다. 조용한 공간과 활동적인 공간의 경계도 단면이나 배치에서 더 분명히 드러나면 좋겠다.",
};
const LEGAL_RISK_NOTICE =
  "이 항목은 법적 판정이 아니라 설계 검토용 체크리스트입니다. 실제 인허가 및 적합성은 최신 법령, 지자체 조례, 토지이음, 세움터, 전문가 검토로 확인하세요.";
const IRRELEVANT_FEEDBACK_MESSAGE =
  "이 입력은 건축 설계 크리틱 피드백으로 보기 어렵습니다. 교수 피드백, 도면 수정 사항, 공간 구성, 동선, 프로그램, 발표 논리와 관련된 내용을 입력해주세요.";
const ARCHITECTURE_RELEVANCE_TERMS = [
  "건축",
  "설계",
  "공간",
  "도면",
  "동선",
  "프로그램",
  "매스",
  "평면",
  "단면",
  "입면",
  "구조",
  "재료",
  "환경",
  "법규",
  "크리틱",
  "교수",
  "튜터",
  "패널",
  "모형",
  "대지",
  "배치",
  "스케일",
  "컨셉",
  "개념",
  "조닝",
  "공적",
  "사적",
  "프라이버시",
  "채광",
  "환기",
  "소음",
  "동선이",
  "단면이",
  "매스가",
  "논리가",
];
const OFF_TOPIC_TERMS = [
  "저녁",
  "점심",
  "아침",
  "메뉴",
  "김치찌개",
  "돈까스",
  "맛집",
  "요리",
  "비트코인",
  "주식",
  "코인",
  "투자",
  "연애",
  "데이트",
  "게임",
  "날씨",
  "여행",
  "코딩",
  "에러",
  "버그",
  "디버그",
  "추천해줘",
];

const CATEGORIES = [
  "컨셉",
  "전시 맥락",
  "프로그램",
  "동선",
  "구조",
  "설비",
  "환경",
  "법규",
  "매스",
  "평면",
  "단면",
  "입면",
  "재료",
  "시공",
  "표현 / 패널",
  "발표 논리",
  "모형",
  "기타",
];

const TASK_STATUSES = ["todo", "doing", "done", "hold"];
const STATUS_LABELS = {
  todo: "해야 함",
  doing: "진행 중",
  done: "완료",
  hold: "보류",
};
const PRIORITY_LABELS = {
  high: "높음",
  normal: "보통",
  low: "낮음",
};
const APP_VIEW_HASHES = {
  home: "#/app/home",
  feedback: "#/app/feedback",
  analysis: "#/app/analysis",
  tasks: "#/app/tasks",
  critic: "#/app/critic-prep",
  portfolio: "#/app/portfolio",
  settings: "#/app/settings",
};
const HASH_VIEW_SEGMENTS = {
  home: "home",
  feedback: "feedback",
  analysis: "analysis",
  tasks: "tasks",
  "critic-prep": "critic",
  portfolio: "portfolio",
  settings: "settings",
};
const ANALYSIS_BUSY_MESSAGES = {
  feedback: "피드백 원문을 읽고 설계 쟁점을 분류하는 중입니다.",
  reanalysis: "선택한 피드백을 다시 읽고 새 분석 결과를 준비하는 중입니다.",
  critic: "누적 피드백과 작업 카드를 바탕으로 다음 크리틱 준비안을 정리하는 중입니다.",
  portfolio: "누적 피드백과 완료 작업을 포트폴리오 서사로 정리하는 중입니다.",
  structuring: "작업 카드와 법규/검토 리스크를 정리하는 중입니다.",
};
const PROJECT_TEMPLATES = [
  {
    id: "graduation",
    name: "졸업설계",
    feedbackPlaceholder: "예: 교수님이 “동선과 프로그램의 관계가 아직 약하다”고 했다면 그대로 붙여넣어 보세요.",
    defaults: {
      title: "새 졸업설계 프로젝트",
      topic: "졸업설계 주제 입력",
      site: "대지 / 위치 입력",
      concept: "핵심 컨셉 입력",
      stage: "졸업설계 크리틱 진행 중",
      notes: "이번 학기 크리틱 피드백을 누적하고, 도면 작업·발표 문장·포트폴리오 서사로 정리합니다.",
    },
  },
  {
    id: "competition",
    name: "공모전",
    feedbackPlaceholder: "예: 심사 기준에 비해 콘셉트와 패널 표현이 약하다는 피드백을 붙여넣어 보세요.",
    defaults: {
      title: "새 공모전 프로젝트",
      topic: "공모전 주제와 심사 기준 입력",
      site: "대상지 / 공모 조건 입력",
      concept: "핵심 콘셉트와 제출 전략 입력",
      stage: "공모전 제출안 정리 단계",
      notes: "마감, 패널, 콘셉트, 제출 도면을 중심으로 피드백을 작업 카드로 정리합니다.",
    },
  },
  {
    id: "studio",
    name: "스튜디오 크리틱",
    feedbackPlaceholder: "예: 이번 주 크리틱에서 받은 교수님 피드백을 그대로 기록해 보세요.",
    defaults: {
      title: "새 스튜디오 크리틱 프로젝트",
      topic: "스튜디오 설계 주제 입력",
      site: "대지 / 수업 조건 입력",
      concept: "현재 설계 방향 입력",
      stage: "주간 스튜디오 크리틱 진행 중",
      notes: "매주 받은 피드백을 다음 수업 전 도면, 다이어그램, 발표 작업으로 전환합니다.",
    },
  },
  {
    id: "portfolio",
    name: "포트폴리오 정리",
    feedbackPlaceholder: "예: 포트폴리오에서 프로젝트 변화 과정이 잘 보이지 않는다는 피드백을 붙여넣어 보세요.",
    defaults: {
      title: "새 포트폴리오 정리 프로젝트",
      topic: "정리할 프로젝트 주제 입력",
      site: "프로젝트 위치 / 맥락 입력",
      concept: "최종 설계 논리 입력",
      stage: "포트폴리오 문장 및 리포트 정리 단계",
      notes: "완료된 프로젝트의 피드백, 수정 과정, 최종 설계 논리를 포트폴리오 서사로 정리합니다.",
    },
  },
  {
    id: "renovation",
    name: "리노베이션 프로젝트",
    feedbackPlaceholder: "예: 기존 공간 분석과 개선 방향이 더 명확해야 한다는 피드백을 붙여넣어 보세요.",
    defaults: {
      title: "새 리노베이션 프로젝트",
      topic: "기존 공간의 문제와 개선 방향 입력",
      site: "기존 건물 / 위치 입력",
      concept: "보존, 변형, 개입 전략 입력",
      stage: "현황 분석 및 공간 개선안 검토 단계",
      notes: "기존 공간의 문제점, 사례 분석, 공간 개선 방향을 중심으로 피드백을 정리합니다.",
    },
  },
  {
    id: "urban-infra",
    name: "도시/인프라 프로젝트",
    feedbackPlaceholder: "예: 도시 맥락, 동선, 시스템 흐름이 도면에서 약하다는 피드백을 붙여넣어 보세요.",
    defaults: {
      title: "새 도시/인프라 프로젝트",
      topic: "도시 문제와 인프라 시스템을 다루는 설계",
      site: "대지 / 도시 맥락 입력",
      concept: "도시적 개입과 시스템 흐름 입력",
      stage: "도시 맥락 및 시스템 검토 단계",
      notes: "동선, 프로그램, 시스템, 공공성, 환경 전략을 중심으로 피드백을 정리합니다.",
    },
  },
  {
    id: "blank",
    name: "빈 프로젝트",
    feedbackPlaceholder: "예: 교수님이 “동선과 프로그램의 관계가 아직 약하다”고 했다면 그대로 붙여넣어 보세요.",
    defaults: {},
  },
];

const $ = (id) => document.getElementById(id);

const els = {
  landingShell: $("landingShell"),
  appShell: $("appShell"),
  startChoicePanel: $("startChoicePanel"),
  templateChoicePanel: $("templateChoicePanel"),
  openStartButtons: Array.from(document.querySelectorAll("[data-open-start]")),
  startModeButtons: Array.from(document.querySelectorAll("[data-start-mode]")),
  templateButtons: Array.from(document.querySelectorAll("[data-template-id]")),
  templateBackTargets: Array.from(document.querySelectorAll("[data-template-back]")),
  closeStartChoiceBtn: $("closeStartChoiceBtn"),
  closeStartTargets: Array.from(document.querySelectorAll("[data-close-start]")),
  landingScrollLinks: Array.from(document.querySelectorAll("[data-scroll-target]")),
  projectList: $("projectList"),
  projectForm: $("projectForm"),
  activeProjectName: $("activeProjectName"),
  aiModePill: $("aiModePill"),
  feedbackForm: $("feedbackForm"),
  feedbackDate: $("feedbackDate"),
  feedbackSource: $("feedbackSource"),
  feedbackImportance: $("feedbackImportance"),
  feedbackKeywords: $("feedbackKeywords"),
  feedbackText: $("feedbackText"),
  feedbackExampleText: $("feedbackExampleText"),
  firstFeedbackExampleBtn: $("firstFeedbackExampleBtn"),
  inputLength: $("inputLength"),
  feedbackTimeline: $("feedbackTimeline"),
  analysisCard: $("analysisCard"),
  taskList: $("taskList"),
  outputPanel: $("outputPanel"),
  portfolioPanel: $("portfolioPanel"),
  aiDiagnosticPanel: $("aiDiagnosticPanel"),
  viewNav: document.querySelector(".view-nav"),
  viewButtons: Array.from(document.querySelectorAll("[data-view]")),
  viewPanels: Array.from(document.querySelectorAll("[data-view-panel]")),
  viewTargets: Array.from(document.querySelectorAll("[data-view-target]")),
  markdownExportButtons: Array.from(document.querySelectorAll("[data-export-markdown]")),
  homeProjectSummary: $("homeProjectSummary"),
  homeRecentAnalysis: $("homeRecentAnalysis"),
  homeTaskPreview: $("homeTaskPreview"),
  homeFeedbackSlot: $("homeFeedbackSlot"),
  feedbackInputSlot: $("feedbackInputSlot"),
  feedbackInputCard: $("feedbackInputCard"),
  toast: $("toast"),
  importFile: $("importFile"),
  analyzeBtn: $("analyzeBtn"),
  criticPrepBtn: $("criticPrepBtn"),
  portfolioBtn: $("portfolioBtn"),
  copyAnalysisBtn: $("copyAnalysisBtn"),
  copyCriticBtn: $("copyCriticBtn"),
  copyPortfolioBtn: $("copyPortfolioBtn"),
  copyTasksBtn: $("copyTasksBtn"),
  exportBtn: $("exportBtn"),
  resetSampleBtn: $("resetSampleBtn"),
  clearStorageBtn: $("clearStorageBtn"),
  returnLandingBtn: $("returnLandingBtn"),
  backupPanel: $("backupPanel"),
  newProjectBtn: $("newProjectBtn"),
  deleteProjectBtn: $("deleteProjectBtn"),
  analysisLoadingOverlay: $("analysisLoadingOverlay"),
  analysisLoadingMessage: $("analysisLoadingMessage"),
};

let state = loadState();
let selectedFeedbackId = null;
let outputView = "critic";
let currentView = "home";
let aiClient = null;
let isBusy = false;
let isAnalyzing = false;
let analyzingMessage = "";
let lastAiFallbackReason = "";
const expandedFeedbackIds = new Set();
const expandedTextKeys = new Set();
const aiDiagnostics = {
  configFileStatus: "checking",
  apiKeyPresent: false,
  apiKeyMasked: "-",
  projectId: "-",
  authDomain: "-",
  appIdPresent: false,
  firebaseSdkStatus: "pending",
  aiLogicSdkStatus: "pending",
  modelName: MODEL_NAME,
  lastErrorCode: "-",
  lastErrorSummary: "아직 오류가 없습니다.",
};

const aiClientPromise = createAiClient().then((client) => {
  aiClient = client;
  renderAiMode();
  return client;
});

init();

function init() {
  ensureSelection();
  els.feedbackDate.value = today();
  bindEvents();
  syncRouteFromHash();
}

function bindEvents() {
  els.openStartButtons.forEach((button) => {
    button.addEventListener("click", openStartChoice);
  });
  els.startModeButtons.forEach((button) => {
    button.addEventListener("click", () => startWithMode(button.dataset.startMode));
  });
  els.templateButtons.forEach((button) => {
    button.addEventListener("click", () => createProjectFromTemplate(button.dataset.templateId));
  });
  els.templateBackTargets.forEach((target) => {
    target.addEventListener("click", () => navigateTo("#/start"));
  });
  els.closeStartChoiceBtn?.addEventListener("click", closeStartChoice);
  els.closeStartTargets.forEach((target) => {
    target.addEventListener("click", closeStartChoice);
  });
  els.landingScrollLinks.forEach((link) => {
    link.addEventListener("click", handleLandingScrollLink);
  });
  window.addEventListener("hashchange", syncRouteFromHash);
  document.addEventListener("click", handleExpandableTextClick);
  els.projectForm.addEventListener("submit", handleProjectSubmit);
  els.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
  els.feedbackText.addEventListener("input", renderInputLength);
  els.firstFeedbackExampleBtn?.addEventListener("click", fillFirstFeedbackExample);
  els.projectList.addEventListener("click", handleProjectListClick);
  els.feedbackTimeline.addEventListener("click", handleTimelineClick);
  els.analysisCard.addEventListener("click", handleAnalysisCardClick);
  els.taskList.addEventListener("click", handleTaskClick);
  els.viewNav?.addEventListener("click", handleViewNavClick);
  els.viewTargets.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewTarget || "home"));
  });
  els.markdownExportButtons.forEach((button) => {
    button.addEventListener("click", exportProjectAsMarkdown);
  });
  els.analyzeBtn.addEventListener("click", handleAnalyzeButton);
  els.criticPrepBtn.addEventListener("click", handleCriticPrep);
  els.portfolioBtn.addEventListener("click", handlePortfolioDraft);
  els.copyAnalysisBtn?.addEventListener("click", handleCopyAnalysis);
  els.copyCriticBtn?.addEventListener("click", handleCopyCriticPlan);
  els.copyPortfolioBtn?.addEventListener("click", handleCopyPortfolio);
  els.copyTasksBtn?.addEventListener("click", handleCopyTasks);
  els.exportBtn.addEventListener("click", exportData);
  els.importFile.addEventListener("change", importData);
  els.resetSampleBtn.addEventListener("click", resetSample);
  els.clearStorageBtn.addEventListener("click", clearStorage);
  els.returnLandingBtn?.addEventListener("click", returnToLanding);
  els.newProjectBtn.addEventListener("click", openProjectTemplateChoice);
  els.deleteProjectBtn.addEventListener("click", deleteActiveProject);
}

function hasEnteredApp() {
  return localStorage.getItem(ENTRY_KEY) === "true";
}

function getDefaultHash() {
  return hasEnteredApp() ? "#/app/home" : "#/landing";
}

function getRouteFromHash() {
  const hash = window.location.hash || "";
  if (!hash) return { redirectTo: getDefaultHash() };
  if (hash === "#/landing") return { screen: "landing" };
  if (hash === "#/start") return { screen: "start" };
  if (hash === START_TEMPLATE_HASH) return { screen: "template" };

  const appRoute = hash.match(/^#\/app\/([^/?#]+)/);
  if (appRoute) {
    const view = HASH_VIEW_SEGMENTS[appRoute[1]];
    if (view) return { screen: "app", view };
    return { redirectTo: APP_VIEW_HASHES.home };
  }

  return { redirectTo: getDefaultHash() };
}

function navigateTo(hash, options = {}) {
  const target = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash === target) {
    syncRouteFromHash();
    return;
  }

  if (options.replace) {
    window.history.replaceState(null, "", target);
    syncRouteFromHash();
    return;
  }

  window.location.hash = target;
  syncRouteFromHash();
}

function syncRouteFromHash() {
  const route = getRouteFromHash();
  if (route.redirectTo) {
    navigateTo(route.redirectTo, { replace: true });
    return;
  }
  applyRoute(route);
}

function applyRoute(route) {
  if (route.screen === "landing") {
    showLandingShell();
    return;
  }

  if (route.screen === "start") {
    showLandingShell({ startChoice: true });
    return;
  }

  if (route.screen === "template") {
    showLandingShell({ templateChoice: true });
    return;
  }

  localStorage.setItem(ENTRY_KEY, "true");
  showAppShell();
  setView(route.view, { updateHash: false });
}

function showLandingShell(options = {}) {
  els.landingShell?.classList.remove("is-hidden");
  els.appShell?.classList.add("is-hidden");
  els.appShell?.classList.remove("is-visible");
  setStartChoiceVisible(options.startChoice === true);
  setTemplateChoiceVisible(options.templateChoice === true);
}

function showAppShell() {
  els.landingShell?.classList.add("is-hidden");
  els.appShell?.classList.remove("is-hidden");
  els.appShell?.classList.add("is-visible");
  setStartChoiceVisible(false);
  setTemplateChoiceVisible(false);
}

function setStartChoiceVisible(visible) {
  els.startChoicePanel?.classList.toggle("is-hidden", !visible);
  els.startChoicePanel?.setAttribute("aria-hidden", visible ? "false" : "true");
}

function setTemplateChoiceVisible(visible) {
  els.templateChoicePanel?.classList.toggle("is-hidden", !visible);
  els.templateChoicePanel?.setAttribute("aria-hidden", visible ? "false" : "true");
}

function openStartChoice() {
  navigateTo("#/start");
  window.setTimeout(() => els.startChoicePanel?.querySelector("[data-start-mode]")?.focus(), 0);
}

function openProjectTemplateChoice() {
  localStorage.setItem(START_MODE_KEY, "new");
  navigateTo(START_TEMPLATE_HASH);
  window.setTimeout(() => els.templateChoicePanel?.querySelector("[data-template-id]")?.focus(), 0);
}

function closeStartChoice() {
  navigateTo("#/landing");
}

function handleLandingScrollLink(event) {
  event.preventDefault();
  navigateTo("#/landing");
  const targetId = event.currentTarget.dataset.scrollTarget;
  window.setTimeout(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

function enterApp(view = "home") {
  localStorage.setItem(ENTRY_KEY, "true");
  navigateTo(APP_VIEW_HASHES[view] || APP_VIEW_HASHES.home);
}

function returnToLanding() {
  localStorage.removeItem(ENTRY_KEY);
  localStorage.removeItem(START_MODE_KEY);
  navigateTo("#/landing");
}

function startWithMode(mode) {
  const startMode = ["demo", "new", "import"].includes(mode) ? mode : "demo";
  localStorage.setItem(START_MODE_KEY, startMode);
  setStartChoiceVisible(false);

  if (startMode === "demo") {
    activateDemoProject();
    navigateTo(APP_VIEW_HASHES.home);
    showToast("데모 프로젝트로 시작합니다.");
    return;
  }

  if (startMode === "new") {
    navigateTo(START_TEMPLATE_HASH);
    return;
  }

  navigateTo(APP_VIEW_HASHES.settings);
  window.setTimeout(highlightBackupPanel, 0);
  showToast("백업 불러오기에서 JSON 파일을 선택하세요.");
}

function activateDemoProject() {
  const demoIndex = state.projects.findIndex(isDemoProject);
  const sampleProject = createSampleState().projects[0];
  if (demoIndex >= 0) {
    const existingDemo = state.projects[demoIndex];
    if (existingDemo.title === sampleProject.title && existingDemo.notes === sampleProject.notes) {
      state.activeProjectId = existingDemo.id;
    } else {
      state.projects[demoIndex] = sampleProject;
      state.activeProjectId = sampleProject.id;
    }
  } else {
    state.projects.unshift(sampleProject);
    state.activeProjectId = sampleProject.id;
  }
  selectedFeedbackId = getActiveProject()?.feedbacks[0]?.id || null;
  outputView = "critic";
  saveState();
  renderAll();
}

function isDemoProject(project) {
  const notes = String(project.notes || "");
  return project.title === "빌라 사보아 재해석 스튜디오" || notes.includes("공개 데모용 교육 예시") || notes.includes("공개 데모용 가상 프로젝트") || notes.includes("샘플 모드");
}

function highlightBackupPanel() {
  if (!els.backupPanel) return;
  els.backupPanel.scrollIntoView({ block: "center" });
  els.backupPanel.focus({ preventScroll: true });
  els.backupPanel.classList.add("start-highlight");
  window.setTimeout(() => els.backupPanel?.classList.remove("start-highlight"), 1800);
}

function handleCopyAnalysis() {
  const feedback = selectedFeedback();
  if (!feedback?.analysis) {
    showToast("복사할 분석 결과가 없습니다. 먼저 피드백을 분석하세요.");
    return;
  }
  copyToClipboard(formatAnalysisForCopy(feedback.analysis, feedback), "분석 결과가 복사되었습니다.");
}

function handleCopyCriticPlan() {
  const project = getActiveProject();
  if (!project || !hasCriticPlan(project.criticPlan)) {
    showToast("복사할 크리틱 준비 내용이 없습니다. 먼저 다음 크리틱 준비를 생성하세요.");
    return;
  }
  copyToClipboard(formatCriticPlanForCopy(project), "크리틱 준비 내용이 복사되었습니다.");
}

function handleCopyPortfolio() {
  const project = getActiveProject();
  if (!project || !hasPortfolio(project.portfolioDraft)) {
    showToast("복사할 포트폴리오 문장이 없습니다. 먼저 포트폴리오 문장을 생성하세요.");
    return;
  }
  copyToClipboard(formatPortfolioForCopy(project), "포트폴리오 문장이 복사되었습니다.");
}

function handleCopyTasks() {
  const project = getActiveProject();
  if (!project || project.tasks.length === 0) {
    showToast("복사할 작업 리스트가 없습니다.");
    return;
  }
  copyToClipboard(formatTasksForCopy(project), "작업 리스트가 복사되었습니다.");
}

async function copyToClipboard(text, successMessage = "복사되었습니다.") {
  const value = String(text || "").trim();
  if (!value) {
    showToast("복사할 내용이 없습니다.");
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      fallbackCopyText(value);
    }
    showToast(successMessage);
  } catch (error) {
    console.info("Clipboard copy failed", error);
    try {
      fallbackCopyText(value);
      showToast(successMessage);
    } catch (fallbackError) {
      console.info("Fallback copy failed", fallbackError);
      showToast("복사에 실패했습니다. 텍스트를 직접 선택해 복사해주세요.");
    }
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) {
    throw new Error("document.execCommand('copy') returned false.");
  }
}

function formatAnalysisForCopy(analysis, feedback) {
  const diagnosis = analysis.designDiagnosis || analysis.designIssue;
  return [
    analysis.isRelevantToArchitecture === false
      ? copyBlock("건축 설계 관련성", analysis.relevanceMessage || IRRELEVANT_FEEDBACK_MESSAGE)
      : "",
    copyBlock("설계 진단", diagnosis),
    copyBlock("왜 중요한가", analysis.whyItMatters),
    copyListBlock("검토 기준", analysis.reviewCriteria),
    copyRiskChecksBlock("법규/검토 리스크", analysis.riskChecks),
    copyListBlock("도면 작업", analysis.drawingTasks),
    copyListBlock("다이어그램 작업", analysis.diagramTasks),
    copyListBlock("예상 질문", analysis.riskQuestions),
    copyListBlock("발표 문장", analysis.presentationLines),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function formatCriticPlanForCopy(project) {
  const plan = project.criticPlan || emptyCriticPlan();
  return [
    copyListBlock("이번 주 반드시 수정할 것", plan.mustFix),
    copyListBlock("다음 크리틱 때 보여줄 자료", plan.reviewMaterials),
    copyListBlock("예상 질문", plan.riskQuestions),
    copyListBlock("답변 준비 문장", plan.answerLines),
    copyListBlock("발표 순서", plan.presentationOrder, { numbered: true }),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function formatPortfolioForCopy(project) {
  const draft = project.portfolioDraft || emptyPortfolioDraft();
  return [
    copyBlock("초기 문제의식", draft.problem),
    copyBlock("주요 피드백", draft.feedback),
    copyBlock("설계 변경 방향", draft.change),
    copyBlock("최종 설계 논리", draft.logic),
    copyBlock("포트폴리오 설명문", draft.description),
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function formatTasksForCopy(project) {
  return TASK_STATUSES.map((status) => {
    const tasks = project.tasks.filter((task) => task.status === status);
    const lines = tasks.length
      ? tasks.flatMap((task) => [
          `- ${task.title} / ${task.outputType || "산출물 미정"} / ${PRIORITY_LABELS[task.priority] || "보통"}`,
          `  설명: ${task.detail || task.reason || "설명 없음"}`,
        ])
      : ["- 없음"];
    return [`[${STATUS_LABELS[status]}]`, ...lines].join("\n");
  })
    .join("\n\n")
    .trim();
}

function exportProjectAsMarkdown() {
  const project = getActiveProject();
  if (!project) {
    showToast("내보낼 프로젝트가 없습니다.");
    return;
  }
  const filename = markdownReportFilename(project);
  const content = formatProjectAsMarkdown(project);
  downloadTextFile(filename, content, "text/markdown;charset=utf-8");
  showToast("Markdown 리포트를 저장했습니다.");
}

function formatProjectAsMarkdown(project) {
  return [
    `# ${markdownValue(project.title || "studio-critic-ai report")}`,
    "",
    "## 프로젝트 정보",
    "",
    `- 설계 주제: ${markdownValue(project.topic)}`,
    `- 대지 / 위치: ${markdownValue(project.site)}`,
    `- 핵심 컨셉: ${markdownValue(project.concept)}`,
    `- 현재 단계: ${markdownValue(project.stage)}`,
    `- 다음 크리틱 / 마감일: ${markdownValue(project.deadline)}`,
    `- 메모: ${markdownValue(project.notes)}`,
    "",
    "---",
    "",
    "## 피드백 요약",
    "",
    formatFeedbacksForMarkdown(project.feedbacks),
    "",
    "---",
    "",
    "## 작업 리스트",
    "",
    formatTasksForMarkdown(project.tasks),
    "",
    "---",
    "",
    "## 다음 크리틱 준비",
    "",
    formatCriticPlanForMarkdown(project.criticPlan),
    "",
    "---",
    "",
    "## 포트폴리오 서사",
    "",
    formatPortfolioForMarkdown(project.portfolioDraft),
    "",
  ].join("\n");
}

function formatFeedbacksForMarkdown(feedbacks) {
  if (!feedbacks.length) return "아직 생성된 내용이 없습니다.";
  return feedbacks
    .map((feedback, index) => {
      const analysis = feedback.analysis || emptyAnalysis();
      const diagnosis = analysis.designDiagnosis || analysis.designIssue;
      return [
        `### ${index + 1}. ${markdownValue(feedback.date)} / ${markdownValue(feedback.source)} / ${markdownValue(PRIORITY_LABELS[feedback.importance] || "보통")}`,
        "",
        "원문:",
        markdownValue(feedback.rawText),
        "",
        ...(analysis.isRelevantToArchitecture === false
          ? [
              "건축 설계 관련성:",
              markdownValue(analysis.relevanceMessage || IRRELEVANT_FEEDBACK_MESSAGE),
              "",
            ]
          : []),
        "AI 요약:",
        markdownValue(analysis.summary),
        "",
        "설계 진단:",
        markdownValue(diagnosis),
        "",
        "왜 중요한가:",
        markdownValue(analysis.whyItMatters),
        "",
        "검토 기준:",
        markdownList(analysis.reviewCriteria),
        "",
        "법규/검토 리스크:",
        markdownRiskChecks(analysis.riskChecks),
        "",
        "도면 작업:",
        markdownList(analysis.drawingTasks),
        "",
        "다이어그램 작업:",
        markdownList(analysis.diagramTasks),
        "",
        "예상 질문:",
        markdownList(analysis.riskQuestions),
        "",
        "발표 문장:",
        markdownList(analysis.presentationLines),
      ].join("\n");
    })
    .join("\n\n");
}

function formatTasksForMarkdown(tasks) {
  if (!tasks.length) return "아직 생성된 내용이 없습니다.";
  return TASK_STATUSES.map((status) => {
    const grouped = tasks.filter((task) => task.status === status);
    const lines = grouped.length
      ? grouped.flatMap((task) => [
          `- ${markdownValue(task.title)}`,
          `  - 산출물: ${markdownValue(task.outputType)}`,
          `  - 우선순위: ${markdownValue(PRIORITY_LABELS[task.priority] || "보통")}`,
          `  - 설명: ${markdownValue(task.detail || task.reason)}`,
        ])
      : ["아직 생성된 내용이 없습니다."];
    return [`### ${STATUS_LABELS[status]}`, ...lines].join("\n");
  }).join("\n\n");
}

function formatCriticPlanForMarkdown(plan = emptyCriticPlan()) {
  return [
    "### 이번 주 반드시 수정할 것",
    markdownList(plan.mustFix),
    "",
    "### 다음 크리틱 때 보여줄 자료",
    markdownList(plan.reviewMaterials),
    "",
    "### 예상 질문",
    markdownList(plan.riskQuestions),
    "",
    "### 답변 준비 문장",
    markdownList(plan.answerLines),
    "",
    "### 발표 순서",
    markdownList(plan.presentationOrder, { numbered: true }),
  ].join("\n");
}

function formatPortfolioForMarkdown(draft = emptyPortfolioDraft()) {
  return [
    "### 초기 문제의식",
    markdownValue(draft.problem),
    "",
    "### 주요 피드백",
    markdownValue(draft.feedback),
    "",
    "### 설계 변경 방향",
    markdownValue(draft.change),
    "",
    "### 최종 설계 논리",
    markdownValue(draft.logic),
    "",
    "### 포트폴리오 설명문",
    markdownValue(draft.description),
  ].join("\n");
}

function markdownReportFilename(project) {
  const title = String(project?.title || "").trim();
  if (!title) return "studio-critic-ai-report.md";
  const slug = title
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return slug ? `studio-critic-ai_${slug}_${today()}.md` : "studio-critic-ai-report.md";
}

function markdownValue(value) {
  const text = String(value || "").trim();
  return text || "아직 생성된 내용이 없습니다.";
}

function markdownList(items, options = {}) {
  const list = toStringArray(items);
  if (!list.length) return "아직 생성된 내용이 없습니다.";
  return list.map((item, index) => (options.numbered ? `${index + 1}. ${item}` : `- ${item}`)).join("\n");
}

function markdownRiskChecks(items) {
  const checks = normalizeRiskChecks(items);
  if (!checks.length) return "관련 리스크 항목이 없습니다.";
  return checks
    .map((item) =>
      [
        `- 제목: ${markdownValue(item.title)}`,
        `  - 유형: ${markdownValue(item.type)}`,
        `  - 이유: ${markdownValue(item.reason)}`,
        `  - 확인 방법: ${markdownValue(item.checkMethod)}`,
        `  - 주의: ${markdownValue(item.caution)}`,
      ].join("\n"),
    )
    .join("\n");
}

function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function copyBlock(title, value) {
  return `[${title}]\n${stringOr(value, "없음")}`;
}

function copyListBlock(title, items, options = {}) {
  const list = toStringArray(items);
  const lines = list.length
    ? list.map((item, index) => (options.numbered ? `${index + 1}. ${item}` : `- ${item}`))
    : ["- 없음"];
  return [`[${title}]`, ...lines].join("\n");
}

function copyRiskChecksBlock(title, items) {
  const checks = normalizeRiskChecks(items);
  const lines = checks.length
    ? checks.flatMap((item) => [
        `- 제목: ${item.title}`,
        `  유형: ${item.type || "기타"}`,
        `  이유: ${item.reason || "확인 필요"}`,
        `  확인 방법: ${item.checkMethod || "관련 도면과 기준으로 확인 필요"}`,
        `  주의: ${item.caution || "법적 판정이 아니라 추가 확인이 필요한 항목입니다."}`,
      ])
    : ["- 관련 리스크 항목이 없습니다."];
  return [`[${title}]`, ...lines].join("\n");
}

function uid(prefix) {
  const random = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function emptyAnalysis() {
  return {
    isRelevantToArchitecture: true,
    relevanceMessage: "",
    summary: "",
    categories: [],
    designIssue: "",
    designDiagnosis: "",
    whyItMatters: "",
    reviewCriteria: [],
    actionItems: [],
    drawingTasks: [],
    diagramTasks: [],
    nextCriticChecklist: [],
    presentationLines: [],
    portfolioNarrative: "",
    riskQuestions: [],
    riskChecks: [],
  };
}

function emptyCriticPlan() {
  return {
    mustFix: [],
    reviewMaterials: [],
    riskQuestions: [],
    answerLines: [],
    presentationOrder: [],
  };
}

function emptyPortfolioDraft() {
  return {
    problem: "",
    feedback: "",
    change: "",
    logic: "",
    description: "",
  };
}

function createProject(overrides = {}) {
  const now = nowIso();
  return {
    id: uid("project"),
    title: "새 건축 프로젝트",
    topic: "",
    site: "",
    concept: "",
    stage: "",
    deadline: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
    feedbacks: [],
    tasks: [],
    criticPlan: emptyCriticPlan(),
    portfolioDraft: emptyPortfolioDraft(),
    ...overrides,
  };
}

function sampleAnalysis() {
  return {
    isRelevantToArchitecture: true,
    relevanceMessage: "빌라 사보아 재해석에 대한 건축 설계 크리틱 피드백입니다.",
    summary:
      "빌라 사보아의 램프, 필로티, 옥상정원을 현대 주거의 생활 동선, 프라이버시, 환경 성능 기준으로 다시 검토해야 한다.",
    categories: ["동선", "평면", "단면", "환경", "발표 논리"],
    designIssue:
      "상징적 동선과 실제 생활 동선 사이의 균형, 공적 영역과 사적 영역의 구분, 환경 성능의 보완이 재해석 설계의 주요 검토 과제가 된다.",
    designDiagnosis:
      "빌라 사보아의 핵심 장치인 램프, 필로티, 옥상정원은 건축적 산책로와 근대건축의 상징성을 강하게 만든다. 그러나 현대 주거로 재해석할 경우 생활 편의성, 프라이버시, 접근성, 환경 성능을 어떤 방식으로 보완할지 도면에서 더 구체화해야 한다.",
    whyItMatters:
      "이 작품은 명작이기 때문에 단순히 형태를 따라 하는 방식으로는 설득력이 약하다. 원작의 공간 개념을 이해한 뒤 오늘날의 생활 방식, 프라이버시, 접근성, 에너지 성능에 맞게 무엇을 유지하고 무엇을 조정하는지 명확히 보여줘야 한다.",
    reviewCriteria: [
      "램프가 단순한 조형 요소가 아니라 실제 생활 동선으로도 작동하는가?",
      "공적 공간과 사적 공간의 위계가 평면에서 명확하게 읽히는가?",
      "옥상정원이 상징적 장치에 그치지 않고 실제 거주 경험과 연결되는가?",
      "필로티 하부 공간이 현대적 프로그램으로 재해석될 수 있는가?",
      "빛, 열, 환기 등 환경 성능이 현대 기준에서 보완되었는가?",
    ],
    actionItems: [
      {
        title: "원작 램프 동선과 현대 생활 동선 비교 다이어그램 작성",
        priority: "high",
        category: "동선",
        reason:
          "빌라 사보아의 건축적 산책로가 현대 주거의 실제 생활 동선과 어떻게 겹치거나 충돌하는지 비교해야 한다.",
        outputType: "다이어그램",
        detail:
          "원작의 램프 동선과 현대 가족의 일상 동선을 같은 기준으로 그려, 이동 길이, 접근성, 반복 사용성, 상징적 경험의 차이를 비교한다.",
      },
      {
        title: "공적/사적 영역 위계를 평면에 표시",
        priority: "high",
        category: "평면",
        reason:
          "현대 주거로 재해석하려면 개방적인 평면 안에서도 가족 공유 영역과 개인 영역의 프라이버시 구조가 읽혀야 한다.",
        outputType: "평면도",
        detail:
          "거실, 가족 공유 공간, 개인실, 서비스 공간을 색상 또는 해치로 구분하고, 방문객 동선과 가족 동선이 만나는 지점을 표시한다.",
      },
      {
        title: "옥상정원과 필로티 하부의 현대적 프로그램 제안",
        priority: "normal",
        category: "프로그램",
        reason:
          "원작의 상징적 요소를 유지하면서도 실제 생활과 연결되는 프로그램으로 재해석해야 한다.",
        outputType: "단면도 / 프로그램 다이어그램",
        detail:
          "필로티 하부에는 현대적 공유 활동이나 진입 완충 기능을, 옥상정원에는 실제 생활 가능한 외부 공간과 환경 성능 보완 전략을 제안한다.",
      },
    ],
    drawingTasks: [
      "원작의 램프 동선과 현대 생활 동선을 비교하는 평면 다이어그램을 작성한다.",
      "공적 영역, 가족 공유 영역, 개인 영역을 색상 또는 해치로 구분한다.",
      "필로티 하부와 옥상정원의 사용 프로그램을 평면에 명확히 표시한다.",
      "단면에서 램프, 거실, 옥상정원이 어떻게 연속되는지 표현한다.",
    ],
    diagramTasks: [
      "건축적 산책로 다이어그램을 만든다.",
      "공적/사적 영역 위계 다이어그램을 만든다.",
      "원작 개념 유지 요소와 현대적 보완 요소 비교 다이어그램을 만든다.",
      "빛, 환기, 열환경 보완 전략 다이어그램을 만든다.",
    ],
    nextCriticChecklist: [
      "원작 램프 동선과 현대 생활 동선을 비교한 다이어그램",
      "공적/사적 영역 위계가 표시된 평면",
      "필로티 하부와 옥상정원의 현대적 사용 프로그램",
      "환경 성능 보완 전략이 표시된 단면 또는 다이어그램",
    ],
    presentationLines: [
      "이 재해석은 빌라 사보아의 형태를 복제하는 것이 아니라, 건축적 산책로라는 원리를 현대 주거의 생활 동선으로 다시 번역하는 시도입니다.",
      "원작의 필로티와 옥상정원은 유지하되, 오늘날의 거주성, 프라이버시, 환경 성능을 보완하는 방향으로 프로그램 위계를 재구성했습니다.",
      "중요한 것은 명작의 이미지를 따라가는 것이 아니라, 그 작품이 제안했던 공간적 질문을 현재의 생활 조건에서 다시 묻는 것입니다.",
    ],
    portfolioNarrative:
      "초기안은 빌라 사보아의 상징적 요소를 인용하는 데 머물렀지만, 크리틱 이후 램프, 필로티, 옥상정원을 현대 주거의 생활 동선, 프라이버시, 환경 성능과 연결하는 방향으로 발전했다.",
    riskChecks: [
      {
        title: "현대 주거 기준의 접근성 검토",
        type: "접근성",
        reason:
          "램프가 건축적 산책로로 작동하지만, 실제 이동 약자 접근성과 생활 동선으로도 적절한지 확인할 필요가 있다.",
        checkMethod: "평면과 단면에서 진입부, 램프 경사, 수직 이동 동선을 함께 표시한다.",
        caution: "정확한 적합성은 관련 법규와 현행 기준을 별도로 확인해야 한다.",
      },
      {
        title: "옥상정원의 안전 및 유지관리 검토",
        type: "운영 / 안전",
        reason:
          "옥상정원이 실제 생활 공간으로 사용될 경우 난간, 방수, 유지관리, 피난과 관련된 검토가 필요하다.",
        checkMethod: "단면도와 옥상 평면에 이용 범위, 접근 동선, 안전 경계, 관리 동선을 표시한다.",
        caution: "이 앱은 법적 판정이 아니라 검토 항목만 제안한다.",
      },
    ],
    riskQuestions: [
      "원작의 어떤 가치를 유지하고, 어떤 부분을 현대적으로 바꾸려는가?",
      "램프는 여전히 중심 동선인가, 아니면 상징적 장치인가?",
      "현대 주거에서 프라이버시는 어떻게 확보되는가?",
      "필로티 하부 공간은 오늘날 어떤 프로그램으로 활용되는가?",
      "옥상정원은 실제 생활 공간으로 작동하는가?",
    ],
  };
}

function createSampleState() {
  const project = createProject({
    title: "빌라 사보아 재해석 스튜디오",
    topic: "르 코르뷔지에의 빌라 사보아를 현대적 생활 방식과 환경 성능 관점에서 다시 검토하는 주거 실험",
    site: "프랑스 푸아시의 근대 주거 실험을 가정한 교육용 분석 프로젝트",
    concept:
      "근대건축의 5원칙을 유지하되, 오늘날의 거주성, 접근성, 환경성, 프로그램 다양성 관점에서 공간 흐름을 재해석한다.",
    stage: "사례 분석 및 재해석 크리틱 준비",
    deadline: today(),
    notes:
      "이 샘플은 공개 데모용 교육 예시입니다. 실제 사용자는 자신의 설계 프로젝트와 크리틱 피드백으로 교체해 사용할 수 있습니다.",
  });
  const feedbackId = uid("feedback");
  const analysis = sampleAnalysis();
  project.feedbacks = [
    {
      id: feedbackId,
      date: today(),
      source: "교수",
      rawText:
        "빌라 사보아의 램프와 옥상정원은 공간적 경험을 만드는 강한 장치지만, 현대 주거 관점에서 보면 일상 생활의 편의성과 프라이버시가 다소 약하게 느껴진다. 필로티와 자유로운 평면은 개방감을 만들지만, 내부 프로그램의 위계와 실제 거주 동선이 명확하게 읽히지는 않는다. 이 작품을 오늘날의 주거로 재해석한다면, 상징적인 산책로 개념을 유지하면서도 생활 동선, 가족 구성원의 사적 영역, 환경 성능을 어떻게 보완할지 더 구체적으로 보여줘야 한다.",
      importance: "high",
      keywords: ["동선", "평면", "주거", "환경"],
      analysis,
      createdAt: nowIso(),
    },
  ];
  project.tasks = analysis.actionItems.map((item) => createTask(item, feedbackId, item.category));
  project.criticPlan = project.feedbacks.length > 0 ? fallbackCriticPlan(project) : emptyCriticPlan();
  project.portfolioDraft = fallbackPortfolioDraft(project);
  return {
    projects: [project],
    activeProjectId: project.id,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createSampleState();
    return normalizeState(JSON.parse(saved));
  } catch {
    return createSampleState();
  }
}

function normalizeState(value) {
  if (!value || !Array.isArray(value.projects)) {
    return createSampleState();
  }
  if (value.projects.length === 0) {
    return { projects: [], activeProjectId: null };
  }
  const projects = value.projects.map(normalizeProject);
  const activeProjectId = projects.some((project) => project.id === value.activeProjectId)
    ? value.activeProjectId
    : projects[0].id;
  return { projects, activeProjectId };
}

function normalizeProject(project) {
  const base = createProject();
  const normalized = {
    ...base,
    ...project,
    title: stringOr(project.title, base.title),
    feedbacks: Array.isArray(project.feedbacks) ? project.feedbacks.map(normalizeFeedback) : [],
    tasks: Array.isArray(project.tasks) ? project.tasks.map(normalizeTask) : [],
    criticPlan: normalizeCriticPlan(project.criticPlan),
    portfolioDraft: normalizePortfolioDraft(project.portfolioDraft),
  };
  return normalized;
}

function normalizeFeedback(feedback) {
  return {
    id: stringOr(feedback.id, uid("feedback")),
    date: stringOr(feedback.date, today()),
    source: stringOr(feedback.source, "교수"),
    rawText: stringOr(feedback.rawText, ""),
    importance: ["high", "normal", "low"].includes(feedback.importance)
      ? feedback.importance
      : "normal",
    keywords: normalizeTags(feedback.keywords),
    analysis: feedback.analysis ? normalizeAnalysis(feedback.analysis) : null,
    createdAt: stringOr(feedback.createdAt, nowIso()),
  };
}

function normalizeTask(task) {
  return {
    id: stringOr(task.id, uid("task")),
    title: stringOr(task.title, "작업 제목 없음"),
    priority: ["high", "normal", "low"].includes(task.priority) ? task.priority : "normal",
    category: stringOr(task.category, "기타"),
    reason: stringOr(task.reason, ""),
    outputType: stringOr(task.outputType, ""),
    detail: stringOr(task.detail, ""),
    status: TASK_STATUSES.includes(task.status) ? task.status : "todo",
    sourceFeedbackId: stringOr(task.sourceFeedbackId, ""),
    createdAt: stringOr(task.createdAt, nowIso()),
  };
}

function normalizeAnalysis(analysis) {
  const safe = analysis || {};
  const isRelevantToArchitecture = safe.isRelevantToArchitecture !== false;
  const relevanceMessage = stringOr(
    safe.relevanceMessage,
    isRelevantToArchitecture ? "" : IRRELEVANT_FEEDBACK_MESSAGE,
  );
  if (!isRelevantToArchitecture) {
    return irrelevantFeedbackAnalysis(relevanceMessage);
  }
  const designDiagnosis = stringOr(safe.designDiagnosis, safe.designIssue || "");
  const reviewCriteria = toStringArray(safe.reviewCriteria);
  const drawingTasks = toStringArray(safe.drawingTasks);
  const diagramTasks = toStringArray(safe.diagramTasks);
  const nextCriticChecklist = uniqueStrings([
    ...reviewCriteria,
    ...toStringArray(safe.nextCriticChecklist),
    ...drawingTasks,
    ...diagramTasks,
  ]).slice(0, 10);
  return {
    isRelevantToArchitecture,
    relevanceMessage,
    summary: stringOr(safe.summary, ""),
    categories: normalizeCategories(safe.categories),
    designIssue: stringOr(safe.designIssue, designDiagnosis),
    designDiagnosis,
    whyItMatters: stringOr(safe.whyItMatters, ""),
    reviewCriteria,
    actionItems: Array.isArray(safe.actionItems)
      ? safe.actionItems.map((item) => normalizeActionItem(item, safe.categories?.[0]))
      : [],
    drawingTasks,
    diagramTasks,
    nextCriticChecklist,
    presentationLines: toStringArray(safe.presentationLines),
    portfolioNarrative: stringOr(safe.portfolioNarrative, ""),
    riskQuestions: toStringArray(safe.riskQuestions),
    riskChecks: normalizeRiskChecks(safe.riskChecks),
  };
}

function irrelevantFeedbackAnalysis(message = IRRELEVANT_FEEDBACK_MESSAGE) {
  return {
    isRelevantToArchitecture: false,
    relevanceMessage: message || IRRELEVANT_FEEDBACK_MESSAGE,
    summary: "건축 설계와 무관한 입력입니다.",
    categories: ["기타"],
    designIssue: "분석을 진행하지 않았습니다.",
    designDiagnosis: "분석을 진행하지 않았습니다.",
    whyItMatters: "Studio Critic AI는 건축 설계 피드백을 작업 카드와 발표 문장으로 정리하는 도구입니다.",
    reviewCriteria: [],
    actionItems: [],
    drawingTasks: [],
    diagramTasks: [],
    nextCriticChecklist: [],
    presentationLines: [],
    portfolioNarrative: "",
    riskQuestions: [],
    riskChecks: [],
  };
}

function normalizeActionItem(item, fallbackCategory = "기타") {
  const category = mapLooseCategory(item?.category || fallbackCategory);
  return {
    title: stringOr(item?.title, "작업 제목 없음"),
    priority: ["high", "normal", "low"].includes(item?.priority) ? item.priority : "normal",
    category: CATEGORIES.includes(category) ? category : "기타",
    reason: stringOr(item?.reason, ""),
    outputType: stringOr(item?.outputType, ""),
    detail: stringOr(item?.detail, ""),
  };
}

function normalizeRiskChecks(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") {
        return {
          title: item.trim(),
          type: "기타",
          reason: "",
          checkMethod: "",
          caution: "법적 판정이 아니라 추가 확인이 필요한 항목입니다.",
        };
      }
      return {
        title: stringOr(item?.title, "검토 항목"),
        type: stringOr(item?.type, "기타"),
        reason: stringOr(item?.reason, ""),
        checkMethod: stringOr(item?.checkMethod, ""),
        caution: stringOr(item?.caution, "법적 판정이 아니라 추가 확인이 필요한 항목입니다."),
      };
    })
    .filter((item) => item.title);
}

function normalizeCriticPlan(plan) {
  const safe = plan || {};
  return {
    mustFix: toStringArray(safe.mustFix),
    reviewMaterials: toStringArray(safe.reviewMaterials),
    riskQuestions: toStringArray(safe.riskQuestions),
    answerLines: toStringArray(safe.answerLines),
    presentationOrder: toStringArray(safe.presentationOrder),
  };
}

function normalizePortfolioDraft(draft) {
  const safe = draft || {};
  return {
    problem: stringOr(safe.problem, ""),
    feedback: stringOr(safe.feedback, ""),
    change: stringOr(safe.change, ""),
    logic: stringOr(safe.logic, ""),
    description: stringOr(safe.description, ""),
  };
}

function normalizeCategories(value) {
  const categories = normalizeTags(value).map(mapLooseCategory);
  if (categories.length === 0) return [];
  const normalized = uniqueStrings(
    categories.map((category) => (CATEGORIES.includes(category) ? category : "기타")),
  );
  const withoutFallback = normalized.filter((category) => category !== "기타");
  return (withoutFallback.length > 0 ? withoutFallback : normalized).slice(0, 5);
}

function toStringArray(value) {
  if (typeof value === "string") {
    return value
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeTags(value) {
  return uniqueStrings(toStringArray(value).map(normalizeTag).filter(Boolean));
}

function normalizeTag(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const compact = text.replace(/\s+/g, "").toLowerCase();
  if (["co2", "co₂", "이산화탄소", "탄소"].includes(compact)) return "CO₂";
  return text.replace(/\s+/g, " ");
}

function mapLooseCategory(value) {
  const tag = normalizeTag(value);
  if (CATEGORIES.includes(tag)) return tag;
  const compact = tag.replace(/\s+/g, "").toLowerCase();
  if (["co2", "co₂", "이산화탄소", "탄소", "환기", "에너지"].includes(compact)) return "환경";
  if (/패널|표현|다이어그램|diagram/.test(compact)) return "표현 / 패널";
  if (/발표|논리|서사/.test(compact)) return "발표 논리";
  if (/이동|접근|흐름|반입|관람/.test(compact)) return "동선";
  if (/볼륨|형태/.test(compact)) return "매스";
  return tag;
}

function stringOr(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function ensureSelection() {
  const project = getActiveProject();
  if (!project) return;
  if (selectedFeedbackId === null && project.feedbacks.length > 0) {
    selectedFeedbackId = project.feedbacks[0]?.id || null;
  } else if (selectedFeedbackId && !project.feedbacks.some((feedback) => feedback.id === selectedFeedbackId)) {
    selectedFeedbackId = null;
  }
}

function selectedFeedback(project = getActiveProject()) {
  if (!project) return null;
  return project.feedbacks.find((feedback) => feedback.id === selectedFeedbackId) || null;
}

function createTask(item, sourceFeedbackId, fallbackCategory = "기타") {
  const category = mapLooseCategory(item.category || fallbackCategory);
  return {
    id: uid("task"),
    title: stringOr(item.title, "작업 제목 없음"),
    priority: ["high", "normal", "low"].includes(item.priority) ? item.priority : "normal",
    category: CATEGORIES.includes(category) ? category : fallbackCategory,
    reason: stringOr(item.reason, ""),
    outputType: stringOr(item.outputType, ""),
    detail: stringOr(item.detail, ""),
    status: "todo",
    sourceFeedbackId,
    createdAt: nowIso(),
  };
}

async function createAiClient() {
  updateAiDiagnostics({
    configFileStatus: "checking",
    firebaseSdkStatus: "pending",
    aiLogicSdkStatus: "pending",
    lastErrorCode: "-",
    lastErrorSummary: "Firebase 설정 파일을 확인하는 중입니다.",
  });
  try {
    const configModule = await withTimeout(import(CONFIG_URL), 5000, "Firebase 설정 파일 로드");
    const firebaseConfig = configModule.firebaseConfig || configModule.default;
    const configCheck = inspectFirebaseConfig(firebaseConfig);
    updateAiDiagnostics({
      configFileStatus: configCheck.valid ? "found" : "invalid",
      apiKeyPresent: configCheck.apiKeyPresent,
      apiKeyMasked: configCheck.apiKeyMasked,
      projectId: configCheck.projectId,
      authDomain: configCheck.authDomain,
      appIdPresent: configCheck.appIdPresent,
      firebaseSdkStatus: configCheck.valid ? "checking" : "skipped",
      aiLogicSdkStatus: configCheck.valid ? "pending" : "skipped",
      lastErrorCode: configCheck.valid ? "-" : "CONFIG_INVALID",
      lastErrorSummary: configCheck.valid
        ? "Firebase config 파일을 감지했습니다. SDK를 불러오는 중입니다."
        : configCheck.reason,
    });
    if (!configCheck.valid) {
      return unavailableAiClient(
        "CONFIG_INVALID",
        `${configCheck.reason} Firebase Console의 Project settings > Your apps에서 web config를 다시 복사해 src/firebaseConfig.js를 교체하세요.`,
      );
    }

    let appModule;
    try {
      appModule = await withTimeout(
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
        AI_INIT_TIMEOUT_MS,
        "Firebase App SDK 로드",
      );
      updateAiDiagnostics({
        firebaseSdkStatus: "loaded",
        aiLogicSdkStatus: "checking",
        lastErrorSummary: "Firebase App SDK를 불러왔습니다. AI Logic SDK를 확인하는 중입니다.",
      });
    } catch (error) {
      const details = classifyAiError(error);
      updateAiDiagnostics({
        firebaseSdkStatus: "failed",
        aiLogicSdkStatus: "skipped",
        lastErrorCode: details.code,
        lastErrorSummary: details.summary,
      });
      return unavailableAiClient(details.code, `Firebase App SDK 로드 실패: ${details.summary}`);
    }

    let aiModule;
    try {
      aiModule = await withTimeout(
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-ai.js`),
        AI_INIT_TIMEOUT_MS,
        "Firebase AI Logic Web SDK 로드",
      );
      updateAiDiagnostics({
        aiLogicSdkStatus: "loaded",
        lastErrorSummary: "Firebase AI Logic SDK를 불러왔습니다. Gemini 모델을 준비하는 중입니다.",
      });
    } catch (error) {
      const details = classifyAiError(error);
      updateAiDiagnostics({
        aiLogicSdkStatus: "failed",
        lastErrorCode: details.code,
        lastErrorSummary: details.summary,
      });
      return unavailableAiClient(details.code, `Firebase AI Logic SDK 로드 실패: ${details.summary}`);
    }

    const { initializeApp } = appModule;
    const { getAI, getGenerativeModel, GoogleAIBackend } = aiModule;
    if (typeof getAI !== "function" || typeof getGenerativeModel !== "function") {
      throw new Error("Firebase AI Logic Web SDK exports were not found.");
    }
    const app = initializeApp(firebaseConfig);
    const backend = GoogleAIBackend ? new GoogleAIBackend() : undefined;
    const ai = backend ? getAI(app, { backend }) : getAI(app);
    const model = getGenerativeModel(ai, { model: MODEL_NAME });
    updateAiDiagnostics({
      lastErrorCode: "-",
      lastErrorSummary: `Firebase AI Logic 연결 준비 완료: ${MODEL_NAME}`,
    });
    return {
      available: true,
      model,
      message: `Firebase AI Logic 연결됨: ${MODEL_NAME}`,
    };
  } catch (error) {
    console.info("Firebase AI Logic is unavailable. Falling back to mock mode.", error);
    const details = classifyAiError(error);
    const diagnosticPatch = {};
    if (details.code === "CONFIG_FILE_LOAD_FAILED") {
      diagnosticPatch.configFileStatus = "missing";
      diagnosticPatch.firebaseSdkStatus = "skipped";
      diagnosticPatch.aiLogicSdkStatus = "skipped";
    } else {
      if (aiDiagnostics.firebaseSdkStatus === "checking") diagnosticPatch.firebaseSdkStatus = "failed";
      if (aiDiagnostics.aiLogicSdkStatus === "checking") diagnosticPatch.aiLogicSdkStatus = "failed";
    }
    updateAiDiagnostics(diagnosticPatch);
    return unavailableAiClient(
      details.code,
      `Firebase AI Logic 초기화 실패: ${details.summary} Mock 모드로 실행합니다.`,
    );
  }
}

function isUsableFirebaseConfig(config) {
  return inspectFirebaseConfig(config).valid;
}

function inspectFirebaseConfig(config) {
  const result = {
    valid: false,
    apiKeyPresent: false,
    apiKeyMasked: "-",
    projectId: "-",
    authDomain: "-",
    appIdPresent: false,
    reason: "src/firebaseConfig.js에서 firebaseConfig 객체를 찾지 못했습니다.",
  };
  if (!config || typeof config !== "object") return result;

  const values = {
    apiKey: String(config.apiKey || "").trim(),
    authDomain: String(config.authDomain || "").trim(),
    projectId: String(config.projectId || "").trim(),
    appId: String(config.appId || "").trim(),
  };
  result.apiKeyPresent = Boolean(values.apiKey);
  result.apiKeyMasked = values.apiKey ? maskApiKey(values.apiKey) : "-";
  result.projectId = values.projectId || "-";
  result.authDomain = values.authDomain || "-";
  result.appIdPresent = Boolean(values.appId);

  const required = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = required.filter((key) => !values[key]);
  const placeholders = required.filter((key) => /YOUR_|PASTE_|REPLACE_|<|>/.test(values[key]));
  if (missing.length > 0) {
    result.reason = `Firebase config 필수값 누락: ${missing.join(", ")}.`;
    return result;
  }
  if (placeholders.length > 0) {
    result.reason = `Firebase config에 예시값이 남아 있습니다: ${placeholders.join(", ")}.`;
    return result;
  }

  result.valid = true;
  result.reason = "Firebase config 필수값을 확인했습니다.";
  return result;
}

function maskApiKey(apiKey) {
  const value = String(apiKey || "").trim();
  if (!value) return "-";
  if (value.length <= 12) return `${value.slice(0, 3)}...`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function unavailableAiClient(code, message) {
  updateAiDiagnostics({
    lastErrorCode: code,
    lastErrorSummary: message,
  });
  return {
    available: false,
    code,
    message,
  };
}

function renderAll() {
  ensureSelection();
  renderAiMode();
  renderAiDiagnostics();
  renderCurrentView();
  renderProjectList();
  renderProjectForm();
  renderHomeView();
  renderFeedbackTimeline();
  renderAnalysisCard();
  renderTaskList();
  renderOutputPanel();
  renderInputLength();
  renderBusyState();
}

function handleViewNavClick(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  setView(button.dataset.view || "home");
}

function setView(view, options = {}) {
  const allowed = new Set(["home", "feedback", "analysis", "tasks", "critic", "portfolio", "settings"]);
  const nextView = allowed.has(view) ? view : "home";
  if (options.updateHash !== false) {
    navigateTo(APP_VIEW_HASHES[nextView] || APP_VIEW_HASHES.home);
    return;
  }
  currentView = nextView;
  renderAll();
}

function renderCurrentView() {
  mountSharedFeedbackCard();
  els.viewButtons.forEach((button) => {
    const active = button.dataset.view === currentView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  els.viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === currentView);
  });
}

function mountSharedFeedbackCard() {
  if (!els.feedbackInputCard || !els.homeFeedbackSlot || !els.feedbackInputSlot) return;
  const targetSlot = currentView === "feedback" ? els.feedbackInputSlot : els.homeFeedbackSlot;
  if (els.feedbackInputCard.parentElement !== targetSlot) {
    targetSlot.appendChild(els.feedbackInputCard);
  }
}

function renderAiMode() {
  if (!els.aiModePill) return;
  if (isAnalyzing) {
    els.aiModePill.textContent = aiClient?.available ? "Gemini 분석 중..." : "Demo Mode 분석 중...";
    els.aiModePill.className = `status-pill ${aiClient?.available ? "ok" : "warn"}`;
    els.aiModePill.title = analyzingMessage || "AI 분석을 처리하는 중입니다.";
    return;
  }
  if (!aiClient) {
    els.aiModePill.textContent = "AI 상태 확인 중";
    els.aiModePill.className = "status-pill";
    return;
  }
  if (lastAiFallbackReason) {
    els.aiModePill.textContent = aiClient.available
      ? "Gemini 재시도 가능 · 최근 Mock 대체"
      : aiUnavailableLabel(aiClient.message);
    els.aiModePill.className = "status-pill warn";
    els.aiModePill.title = lastAiFallbackReason;
    return;
  }
  const hasRecentGeminiSuccess =
    aiClient.available && aiDiagnostics.lastErrorCode === "-" && /최근 Gemini (호출이|분석) 성공/.test(aiDiagnostics.lastErrorSummary);
  els.aiModePill.textContent = aiClient.available
    ? hasRecentGeminiSuccess
      ? "Gemini 분석 성공"
      : "Gemini 연결 가능"
    : aiUnavailableLabel(aiClient.message);
  els.aiModePill.className = `status-pill ${aiClient.available ? "ok" : "warn"}`;
  els.aiModePill.title = hasRecentGeminiSuccess ? aiDiagnostics.lastErrorSummary : aiClient.message;
}

function aiUnavailableLabel(message) {
  if (aiDiagnostics.lastErrorCode === "CONFIG_FILE_LOAD_FAILED") {
    return "Demo Mode · Firebase 없이 로컬 체험 중";
  }
  if (/설정값|예시값/.test(message)) return "Mock 모드 · 설정값 확인 필요";
  if (/초기화 실패|SDK|네트워크|설정 파일/.test(message)) return "Mock 모드 · 설정/SDK 확인 필요";
  return "Mock 모드 · Firebase 미연결";
}

function updateAiDiagnostics(patch) {
  Object.assign(aiDiagnostics, patch);
  renderAiDiagnostics();
}

function renderAiDiagnostics() {
  if (!els.aiDiagnosticPanel) return;
  const modeLabel = aiClient?.available
    ? "Gemini 연결 준비됨"
    : aiClient
      ? aiDiagnostics.lastErrorCode === "CONFIG_FILE_LOAD_FAILED"
        ? "Demo Mode"
        : "Mock fallback"
      : "확인 중";
  const rows = [
    ["config 파일", statusText(aiDiagnostics.configFileStatus)],
    [
      "apiKey",
      aiDiagnostics.apiKeyPresent ? `있음 (${aiDiagnostics.apiKeyMasked})` : "없음",
    ],
    ["projectId", aiDiagnostics.projectId || "-"],
    ["authDomain", aiDiagnostics.authDomain || "-"],
    ["appId", aiDiagnostics.appIdPresent ? "있음" : "없음"],
    ["Firebase SDK", statusText(aiDiagnostics.firebaseSdkStatus)],
    ["AI Logic SDK", statusText(aiDiagnostics.aiLogicSdkStatus)],
    ["Gemini 모델", aiDiagnostics.modelName],
    ["마지막 오류 코드", aiDiagnostics.lastErrorCode || "-"],
    ["마지막 오류 요약", aiDiagnostics.lastErrorSummary || "-"],
  ];
  els.aiDiagnosticPanel.innerHTML = `
    <details class="diagnostic-shell">
      <summary class="diagnostic-head">
        <strong>Firebase 연결 진단</strong>
        <span class="status-pill ${aiClient?.available ? "ok" : "warn"}">${escapeHtml(modeLabel)}</span>
      </summary>
    <dl>
      ${rows
        .map(
          ([label, value]) => `
            <div>
              <dt>${escapeHtml(label)}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>
          `,
        )
        .join("")}
    </dl>
    <p class="diagnostic-help">
      API 키가 유효하지 않다면 Firebase Console의 Project settings &gt; Your apps에서 현재 웹앱 config를 다시 복사하고,
      AI Logic의 Gemini Developer API provider 설정을 확인하세요.
    </p>
    </details>
  `;
}

function statusText(status) {
  const labels = {
    checking: "확인 중",
    found: "감지됨",
    invalid: "설정 오류",
    missing: "없음 / 로드 실패",
    pending: "대기",
    skipped: "건너뜀",
    loaded: "로드됨",
    failed: "로드 실패",
  };
  return labels[status] || status || "-";
}

function renderProjectList() {
  if (state.projects.length === 0) {
    els.projectList.innerHTML = renderEmptyState(
      "folder",
      "새 스튜디오 프로젝트를 시작하세요",
      "프로젝트를 만들고 크리틱 피드백을 누적해보세요.",
    );
    return;
  }
  const activeId = state.activeProjectId;
  els.projectList.innerHTML = state.projects
    .map(
      (project) => `
        <button class="project-item ${project.id === activeId ? "active" : ""}" data-project-id="${escapeAttr(project.id)}" type="button">
          <span class="project-item-head">
            <span class="mini-icon icon-folder" aria-hidden="true"></span>
            <strong>${escapeHtml(project.title)}</strong>
          </span>
          <span class="project-stage">${escapeHtml(project.stage || project.topic || "단계 미입력")}</span>
          <span class="project-metrics">
            <span>피드백 ${project.feedbacks.length}</span>
            <span>작업 ${project.tasks.length}</span>
            <span>${escapeHtml(project.deadline || "마감일 미입력")}</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderProjectForm() {
  const project = getActiveProject();
  if (!project) {
    els.activeProjectName.textContent = "프로젝트 없음";
    setProjectFormDisabled(true);
    $("projectTitle").value = "";
    $("projectTopic").value = "";
    $("projectSite").value = "";
    $("projectStage").value = "";
    $("projectDeadline").value = "";
    $("projectConcept").value = "";
    $("projectNotes").value = "";
    els.feedbackText.placeholder = "크리틱에서 들은 말을 그대로 붙여넣으세요.";
    updateFeedbackExampleGuide(null);
    return;
  }
  setProjectFormDisabled(false);
  els.activeProjectName.textContent = project.title;
  $("projectTitle").value = project.title;
  $("projectTopic").value = project.topic;
  $("projectSite").value = project.site;
  $("projectStage").value = project.stage;
  $("projectDeadline").value = project.deadline;
  $("projectConcept").value = project.concept;
  $("projectNotes").value = project.notes;
  els.feedbackText.placeholder = projectFeedbackPlaceholder(project);
  updateFeedbackExampleGuide(project);
}

function renderHomeView() {
  const project = getActiveProject();
  if (!els.homeProjectSummary || !els.homeRecentAnalysis || !els.homeTaskPreview) return;
  if (!project) {
    els.homeProjectSummary.innerHTML = renderEmptyState(
      "folder",
      "새 스튜디오 프로젝트를 시작하세요",
      "프로젝트를 만들고 크리틱 피드백을 누적해보세요.",
    );
    els.homeRecentAnalysis.innerHTML = renderEmptyState(
      "spark",
      "아직 분석 결과가 없습니다",
      "피드백을 저장하면 최근 AI 설계 진단이 여기에 표시됩니다.",
    );
    els.homeTaskPreview.innerHTML = renderEmptyState(
      "checklist",
      "아직 작업 카드가 없습니다",
      "분석 결과에서 생성된 작업이 오늘 할 일로 정리됩니다.",
    );
    return;
  }

  const feedbackCount = project.feedbacks.length;
  const openTasks = project.tasks.filter((task) => task.status !== "done");
  const doneTasks = project.tasks.filter((task) => task.status === "done");
  els.homeProjectSummary.innerHTML = `
    <div class="summary-title">${escapeHtml(project.title)}</div>
    <dl class="summary-grid">
      <div><dt>단계</dt><dd>${escapeHtml(project.stage || "미입력")}</dd></div>
      <div><dt>마감일</dt><dd>${escapeHtml(project.deadline || "미입력")}</dd></div>
      <div><dt>피드백</dt><dd>${feedbackCount}개</dd></div>
      <div><dt>열린 작업</dt><dd>${openTasks.length}개</dd></div>
    </dl>
    ${renderExpandableText(project.concept || project.topic || "프로젝트 브리프를 Settings에서 정리해두면 분석 품질이 좋아집니다.", {
      key: `home-project-${project.id}-summary`,
      className: "home-project-text",
      collapsedLines: 5,
      threshold: 220,
    })}
  `;

  const feedback = latestAnalyzedFeedback(project) || project.feedbacks[0];
  if (!feedback) {
    els.homeRecentAnalysis.innerHTML = renderEmptyState(
      "spark",
      "아직 분석 결과가 없습니다",
      "빠른 피드백 입력에서 크리틱 내용을 저장하고 분석해보세요.",
    );
  } else {
    const analysis = feedback.analysis;
    const diagnosis = analysis?.designDiagnosis || analysis?.designIssue;
    els.homeRecentAnalysis.innerHTML = `
      <div class="timeline-meta">
        <span class="date">${escapeHtml(feedback.date)}</span>
        <span class="source">${escapeHtml(feedback.source)}</span>
        <span class="importance ${escapeAttr(feedback.importance)}">${escapeHtml(PRIORITY_LABELS[feedback.importance] || "보통")}</span>
      </div>
      ${renderExpandableText(diagnosis || analysis?.summary || "아직 분석되지 않은 피드백입니다.", {
        key: `home-feedback-${feedback.id}-diagnosis`,
        className: "home-analysis-title",
        tagName: "h3",
        collapsedLines: 3,
        threshold: 150,
      })}
      ${renderExpandableText(analysis?.whyItMatters || feedback.rawText || "Analysis 화면에서 선택 피드백을 재분석할 수 있습니다.", {
        key: `home-feedback-${feedback.id}-why`,
        className: "home-analysis-body",
        collapsedLines: 5,
        threshold: 240,
      })}
    `;
  }

  const todayTasks = openTasks
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
    .slice(0, 5);
  if (todayTasks.length === 0) {
    els.homeTaskPreview.innerHTML = renderEmptyState(
      doneTasks.length ? "checklist" : "spark",
      doneTasks.length ? "열린 작업이 없습니다" : "아직 작업 카드가 없습니다",
      doneTasks.length ? "완료된 작업은 Tasks 화면에서 확인할 수 있습니다." : "피드백을 분석하면 도면, 다이어그램, 발표 작업이 생성됩니다.",
    );
    return;
  }
  els.homeTaskPreview.innerHTML = `
    <div class="home-task-list">
      ${todayTasks
        .map(
          (task) => `
            <article class="home-task-item">
              <span class="task-check" aria-hidden="true"></span>
              <div>
                ${renderExpandableText(task.title, {
                  key: `home-task-${task.id}-title`,
                  className: "home-task-title",
                  tagName: "strong",
                  collapsedLines: 2,
                  threshold: 78,
                })}
                <span>${escapeHtml(task.outputType || task.category || "작업")} · ${escapeHtml(PRIORITY_LABELS[task.priority] || "보통")}</span>
                ${task.detail || task.reason ? renderExpandableText(task.detail || task.reason, {
                  key: `home-task-${task.id}-detail`,
                  className: "home-task-detail",
                  collapsedLines: 3,
                  threshold: 130,
                }) : ""}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function latestAnalyzedFeedback(project) {
  return [...project.feedbacks].reverse().find((feedback) => feedback.analysis) || null;
}

function priorityWeight(priority) {
  return { high: 0, normal: 1, low: 2 }[priority] ?? 1;
}

function setProjectFormDisabled(disabled) {
  [
    "projectTitle",
    "projectTopic",
    "projectSite",
    "projectStage",
    "projectDeadline",
    "projectConcept",
    "projectNotes",
  ].forEach((id) => {
    $(id).disabled = disabled;
  });
  els.projectForm.querySelector("button[type='submit']").disabled = disabled;
  els.deleteProjectBtn.disabled = disabled;
}

function renderFeedbackTimeline() {
  const project = getActiveProject();
  if (!project) {
    els.feedbackTimeline.innerHTML = renderEmptyState(
      "folder",
      "프로젝트가 없습니다",
      "새 프로젝트를 만들거나 샘플을 복원한 뒤 피드백을 기록하세요.",
    );
    return;
  }
  if (project.feedbacks.length === 0) {
    els.feedbackTimeline.innerHTML = renderEmptyState(
      "feedback",
      "아직 저장된 피드백이 없습니다",
      "크리틱에서 들은 말을 붙여넣으면 AI가 설계 진단과 작업 카드를 생성합니다.",
    );
    return;
  }

  els.feedbackTimeline.innerHTML = project.feedbacks
    .map((feedback) => {
      const isIrrelevant = feedback.analysis?.isRelevantToArchitecture === false;
      const summary = isIrrelevant
        ? "건축 설계 피드백으로 보기 어려운 입력입니다."
        : feedback.analysis?.summary || "아직 분석되지 않은 피드백입니다. 재분석을 실행하세요.";
      const diagnosis = isIrrelevant
        ? feedback.analysis?.relevanceMessage || IRRELEVANT_FEEDBACK_MESSAGE
        : feedback.analysis?.designDiagnosis || feedback.analysis?.designIssue || "";
      const tags = displayTags(feedback.keywords, feedback.analysis?.categories)
        .slice(0, 8)
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
      const activeClass = `${feedback.id === selectedFeedbackId ? "active" : ""} ${isIrrelevant ? "is-irrelevant" : ""}`.trim();
      return `
        <article class="timeline-item ${activeClass}" data-feedback-id="${escapeAttr(feedback.id)}">
          <div class="timeline-select ${activeClass}" data-feedback-id="${escapeAttr(feedback.id)}" role="button" tabindex="0">
            <div class="timeline-meta">
              <span class="date">${escapeHtml(feedback.date)}</span>
              <span class="source">${escapeHtml(feedback.source)}</span>
              <span class="importance ${escapeAttr(feedback.importance)}">${escapeHtml(PRIORITY_LABELS[feedback.importance] || "보통")}</span>
            </div>
            <div class="timeline-text-group">
              ${renderTimelineScrollText(summary, {
                label: isIrrelevant ? "입력 안내" : "AI 요약",
                className: "timeline-summary-text feedback-summary",
              })}
              ${diagnosis ? renderTimelineScrollText(diagnosis, {
                label: isIrrelevant ? "안내" : "설계 진단",
                className: "timeline-diagnosis-text feedback-diagnosis",
              }) : ""}
              ${renderTimelineScrollText(feedback.rawText || "원문 없음", {
                label: "피드백 원문",
                className: "timeline-raw-text feedback-raw",
              })}
            </div>
            <div class="tags">${tags}</div>
          </div>
          <div class="item-actions">
            <button data-feedback-action="reanalyze" data-feedback-id="${escapeAttr(feedback.id)}" type="button">재분석</button>
            <button class="danger" data-feedback-action="delete" data-feedback-id="${escapeAttr(feedback.id)}" type="button">삭제</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAnalysisCard() {
  const feedback = selectedFeedback();
  if (!feedback) {
    els.analysisCard.className = "analysis-card empty panel-scroll";
    els.analysisCard.innerHTML = renderEmptyState(
      "spark",
      "분석할 피드백을 선택하세요",
      "타임라인에서 피드백을 선택하거나 새 피드백을 저장하면 설계 진단이 표시됩니다.",
    );
    return;
  }

  const feedbackMeta = `
    <div class="timeline-meta">
      <span class="date">${escapeHtml(feedback.date)}</span>
      <span class="source">${escapeHtml(feedback.source)}</span>
      <span class="importance ${escapeAttr(feedback.importance)}">${escapeHtml(PRIORITY_LABELS[feedback.importance] || "보통")}</span>
    </div>
    ${renderTags(displayTags(feedback.keywords, feedback.analysis?.categories))}
    <h4>피드백 원문</h4>
    <p class="feedback-raw">${escapeHtml(feedback.rawText || "원문 없음")}</p>
  `;

  if (!feedback.analysis) {
    els.analysisCard.className = "analysis-card panel-scroll";
    els.analysisCard.innerHTML = `
      <div class="analysis-toolbar">
        <button data-analysis-action="reanalyze" type="button">재분석</button>
        <button class="danger" data-analysis-action="delete-feedback" type="button">피드백 삭제</button>
      </div>
      <div class="analysis-lead">
        <span class="card-icon icon-spark" aria-hidden="true"></span>
        <div>
          <span class="card-kicker">AI 설계 진단</span>
          <h3>아직 분석되지 않은 피드백입니다.</h3>
        </div>
      </div>
      ${feedbackMeta}
      ${renderEmptyState("spark", "재분석을 실행하세요", "선택한 피드백의 원문을 기준으로 분석 카드와 작업 카드가 생성됩니다.")}
    `;
    return;
  }

  const analysis = feedback.analysis;
  const diagnosis = analysis.designDiagnosis || analysis.designIssue;
  const analysisSourceBadge = mockAnalysisBadgeLabel();
  if (analysis.isRelevantToArchitecture === false) {
    els.analysisCard.className = "analysis-card relevance-card panel-scroll";
    els.analysisCard.innerHTML = `
      <div class="analysis-toolbar">
        <button data-analysis-action="reanalyze" type="button">재분석</button>
        <button class="danger" data-analysis-action="delete-feedback" type="button">피드백 삭제</button>
      </div>
      <div class="analysis-lead relevance-lead">
        <span class="card-icon icon-feedback" aria-hidden="true"></span>
        <div>
          <span class="card-kicker">입력 안내</span>
          ${analysisSourceBadge ? `<span class="analysis-source-badge">${escapeHtml(analysisSourceBadge)}</span>` : ""}
          <h3>건축 설계 피드백으로 보기 어려운 입력입니다</h3>
          <p>${escapeHtml(analysis.relevanceMessage || IRRELEVANT_FEEDBACK_MESSAGE)}</p>
        </div>
      </div>
      ${feedbackMeta}
      ${renderEmptyState("feedback", "작업 카드가 생성되지 않았습니다", "교수 피드백, 도면 수정 사항, 공간 구성, 동선, 프로그램, 발표 논리와 관련된 내용을 입력하면 분석과 작업 카드가 생성됩니다.")}
    `;
    return;
  }
  els.analysisCard.className = "analysis-card panel-scroll";
  els.analysisCard.innerHTML = `
    <div class="analysis-toolbar">
      <button data-analysis-action="reanalyze" type="button">재분석</button>
      <button class="danger" data-analysis-action="delete-feedback" type="button">피드백 삭제</button>
    </div>
    <div class="analysis-lead">
      <span class="card-icon icon-spark" aria-hidden="true"></span>
      <div>
        <span class="card-kicker">AI 설계 진단</span>
        ${analysisSourceBadge ? `<span class="analysis-source-badge">${escapeHtml(analysisSourceBadge)}</span>` : ""}
        <h3>${escapeHtml(diagnosis || "설계 진단이 아직 정리되지 않았습니다.")}</h3>
      </div>
    </div>
    <div class="analysis-grid">
      <section class="analysis-section">
        <h4>설계 진단</h4>
        <p>${escapeHtml(diagnosis || "설계 진단이 아직 정리되지 않았습니다.")}</p>
      </section>
      <section class="analysis-section">
        <h4>왜 중요한가</h4>
        <p>${escapeHtml(analysis.whyItMatters || "설계 완성도, 안전성, 경험, 발표 논리에 미치는 영향은 추가 검토가 필요합니다.")}</p>
      </section>
    </div>
    <h4>검토 기준</h4>
    ${renderList(analysis.reviewCriteria.length ? analysis.reviewCriteria : analysis.nextCriticChecklist)}
    <section class="risk-check-section" aria-label="법규/검토 리스크">
      <h4>법규/검토 리스크</h4>
      ${renderRiskChecks(analysis.riskChecks)}
      <p class="risk-check-note">${escapeHtml(LEGAL_RISK_NOTICE)}</p>
    </section>
    <h4>다음 작업</h4>
    ${renderActionItems(analysis.actionItems)}
    <div class="analysis-grid">
      <section class="analysis-section">
        <h4>도면 작업</h4>
        ${renderList(analysis.drawingTasks)}
      </section>
      <section class="analysis-section">
        <h4>다이어그램 작업</h4>
        ${renderList(analysis.diagramTasks)}
      </section>
    </div>
    <h4>예상 질문</h4>
    ${renderList(analysis.riskQuestions)}
    <h4>발표 문장</h4>
    ${renderList(analysis.presentationLines)}
    <h4>핵심 요약</h4>
    <p class="analysis-summary">${escapeHtml(analysis.summary || "분석 요약 없음")}</p>
    ${feedbackMeta}
    <h4>포트폴리오 서사</h4>
    <p>${escapeHtml(analysis.portfolioNarrative || "누적 피드백이 쌓이면 서사가 더 구체화됩니다.")}</p>
  `;
}

function mockAnalysisBadgeLabel() {
  if (!lastAiFallbackReason && aiDiagnostics.lastErrorCode === "-") return "";
  if (aiDiagnostics.lastErrorCode === "CONFIG_FILE_LOAD_FAILED") return "Demo Mode 분석";
  return "Mock fallback 분석";
}

function renderTaskList() {
  const project = getActiveProject();
  if (!project) {
    els.taskList.innerHTML = renderEmptyState(
      "folder",
      "프로젝트가 없습니다",
      "새 프로젝트를 만들면 분석 결과에서 작업 카드가 정리됩니다.",
    );
    return;
  }
  if (project.tasks.length === 0) {
    els.taskList.innerHTML = renderEmptyState(
      "checklist",
      "아직 작업 카드가 없습니다",
      "피드백을 분석하면 도면, 다이어그램, 발표 작업이 자동으로 정리됩니다.",
    );
    return;
  }

  if (currentView === "tasks") {
    els.taskList.innerHTML = `
      <div class="kanban-board">
        ${TASK_STATUSES.map((status) => {
          const tasks = project.tasks.filter((task) => task.status === status);
          return `
            <section class="kanban-column">
              <header>
                <strong>${escapeHtml(STATUS_LABELS[status])}</strong>
                <span>${tasks.length}</span>
              </header>
              <div class="kanban-items">
                ${
                  tasks.length
                    ? tasks.map(renderTaskCard).join("")
                    : `<p class="list-empty">이 상태의 작업이 없습니다.</p>`
                }
              </div>
            </section>
          `;
        }).join("")}
      </div>
    `;
    return;
  }

  els.taskList.innerHTML = project.tasks
    .map(renderTaskCard)
    .join("");
}

function renderTaskCard(task) {
  return `
    <article class="task-card status-${escapeAttr(task.status)}">
      <div class="task-top">
        <div class="task-title-row">
          <span class="task-check" aria-hidden="true"></span>
          ${renderExpandableText(task.title, {
            key: `task-${task.id}-title`,
            className: "task-title-text",
            tagName: "strong",
            collapsedLines: 3,
            threshold: 120,
          })}
        </div>
        <div class="task-actions">
          <button class="status-cycle ${escapeAttr(task.status)}" data-task-id="${escapeAttr(task.id)}" data-task-action="status" type="button">
            ${escapeHtml(STATUS_LABELS[task.status] || "해야 함")}
          </button>
          <button class="danger" data-task-id="${escapeAttr(task.id)}" data-task-action="delete" type="button">삭제</button>
        </div>
      </div>
      <div class="tags">
        <span class="tag priority-${escapeAttr(task.priority)}">${escapeHtml(PRIORITY_LABELS[task.priority] || "보통")}</span>
        <span class="tag">${escapeHtml(task.category || "기타")}</span>
        ${task.outputType ? `<span class="tag">${escapeHtml(task.outputType)}</span>` : ""}
      </div>
      ${task.reason ? renderExpandableText(task.reason, {
        key: `task-${task.id}-reason`,
        className: "task-reason",
        collapsedLines: 4,
        threshold: 180,
      }) : ""}
      ${task.detail ? renderExpandableText(task.detail, {
        key: `task-${task.id}-detail`,
        className: "task-detail",
        collapsedLines: 5,
        threshold: 220,
      }) : ""}
    </article>
  `;
}

function renderOutputPanel() {
  const project = getActiveProject();
  if (!project) {
    els.outputPanel.className = "output-panel empty panel-scroll";
    els.outputPanel.innerHTML = renderEmptyState(
      "board",
      "프로젝트가 없습니다",
      "새 프로젝트를 만들거나 샘플을 복원하면 다음 크리틱 준비안을 생성할 수 있습니다.",
    );
    if (els.portfolioPanel) {
      els.portfolioPanel.className = "output-panel empty panel-scroll";
      els.portfolioPanel.innerHTML = renderEmptyState(
        "doc",
        "프로젝트가 없습니다",
        "새 프로젝트를 만들거나 샘플을 복원하면 포트폴리오 문장을 생성할 수 있습니다.",
      );
    }
    return;
  }

  if (hasCriticPlan(project.criticPlan)) {
    renderCriticPanel(project.criticPlan);
  } else {
    els.outputPanel.className = "output-panel empty panel-scroll";
    els.outputPanel.innerHTML = renderEmptyState(
      "board",
      "다음 크리틱 준비안이 아직 없습니다",
      "피드백과 작업 카드가 쌓이면 다음 크리틱 준비안을 생성할 수 있습니다.",
    );
  }

  if (hasPortfolio(project.portfolioDraft)) {
    renderPortfolioPanel(project.portfolioDraft);
    return;
  }
  if (els.portfolioPanel) {
    els.portfolioPanel.className = "output-panel empty panel-scroll";
    els.portfolioPanel.innerHTML = renderEmptyState(
      "doc",
      "포트폴리오 문장이 아직 없습니다",
      "피드백과 완료 작업이 쌓이면 포트폴리오 설명문을 생성할 수 있습니다.",
    );
  }
}

function renderCriticPanel(plan) {
  els.outputPanel.className = "output-panel panel-scroll";
  els.outputPanel.innerHTML = `
    <div class="output-head">
      <span class="card-icon icon-board" aria-hidden="true"></span>
      <div>
        <span class="output-source">다음 크리틱 준비</span>
        <h3>다음 크리틱에서 보여줄 것</h3>
      </div>
    </div>
    <h4>이번 주 반드시 수정할 것</h4>
    ${renderList(plan.mustFix)}
    <h4>준비할 도면 / 다이어그램 / 이미지</h4>
    ${renderList(plan.reviewMaterials)}
    <h4>다시 물어볼 질문</h4>
    ${renderList(plan.riskQuestions)}
    <h4>질문에 대한 준비 문장</h4>
    ${renderList(plan.answerLines)}
    <h4>발표 순서</h4>
    ${renderList(plan.presentationOrder, "ol")}
  `;
}

function renderPortfolioPanel(draft) {
  const target = els.portfolioPanel || els.outputPanel;
  target.className = "output-panel panel-scroll";
  target.innerHTML = `
    <div class="output-head">
      <span class="card-icon icon-doc" aria-hidden="true"></span>
      <div>
        <span class="output-source">포트폴리오 문장</span>
        <h3>설계 발전 서사 초안</h3>
      </div>
    </div>
    <h4>초기 문제의식</h4>
    <p>${escapeHtml(draft.problem)}</p>
    <h4>주요 피드백</h4>
    <p>${escapeHtml(draft.feedback)}</p>
    <h4>설계 변경 방향</h4>
    <p>${escapeHtml(draft.change)}</p>
    <h4>최종 설계 논리</h4>
    <p>${escapeHtml(draft.logic)}</p>
    <h4>포트폴리오 설명문</h4>
    <p>${escapeHtml(draft.description)}</p>
  `;
}

function renderInputLength() {
  const count = els.feedbackText.value.length;
  els.inputLength.textContent = `${count.toLocaleString("ko-KR")}자 입력`;
  els.inputLength.className = count > MAX_INPUT_CHARS ? "warning" : "muted";
}

function renderTags(tags) {
  const safeTags = normalizeTags(tags);
  if (safeTags.length === 0) return "";
  return `<div class="tags">${safeTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function displayTags(keywords = [], categories = []) {
  return uniqueStrings([...normalizeCategories(categories), ...normalizeTags(keywords)]).filter(Boolean);
}

function renderExpandableText(text, options = {}) {
  const value = String(text ?? "").trim();
  const fallback = options.fallback ?? "";
  const displayValue = value || fallback;
  if (!displayValue) return "";
  const key = options.key || `text-${hashText(displayValue)}`;
  const collapsedLines = Number(options.collapsedLines || 5);
  const threshold = Number(options.threshold || 180);
  const tagName = ["p", "strong", "span", "h3"].includes(options.tagName) ? options.tagName : "p";
  const className = options.className ? ` ${options.className}` : "";
  const lineCount = displayValue.split(/\r?\n/).length;
  const needsToggle = Boolean(options.alwaysToggle) || displayValue.length > threshold || lineCount > collapsedLines + 1;
  const isExpanded = expandedTextKeys.has(key) || !needsToggle;
  const stateClass = isExpanded ? "is-expanded" : "is-collapsed";
  const label = options.label ? `<span class="feedback-label">${escapeHtml(options.label)}</span>` : "";
  const style = ` style="--collapsed-lines:${Math.max(1, collapsedLines)}"`;

  return `
    <div class="expandable-text ${stateClass}${needsToggle ? " has-toggle" : ""}"${style}>
      ${label}
      <${tagName} class="expandable-body${className}">${escapeHtml(displayValue)}</${tagName}>
      ${
        needsToggle
          ? `<button class="text-toggle" data-expand-key="${escapeAttr(key)}" type="button" aria-expanded="${isExpanded ? "true" : "false"}">${isExpanded ? "접기" : "전체 보기"}</button>`
          : ""
      }
    </div>
  `;
}

function renderTimelineScrollText(text, options = {}) {
  const value = String(text ?? "").trim();
  const fallback = options.fallback ?? "";
  const displayValue = value || fallback;
  if (!displayValue) return "";
  const label = options.label ? `<span class="feedback-label">${escapeHtml(options.label)}</span>` : "";
  const className = options.className ? ` ${options.className}` : "";

  return `
    <div class="timeline-scroll-block">
      ${label}
      <div class="timeline-scroll-text${className}" tabindex="0">${escapeHtml(displayValue)}</div>
    </div>
  `;
}

function hashText(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function renderActionItems(items) {
  const values = Array.isArray(items) ? items : [];
  if (values.length === 0) return `<p class="muted list-empty">아직 생성된 작업이 없습니다.</p>`;
  return `
    <div class="analysis-actions">
      ${values
        .map(
          (item) => `
            <article class="analysis-action">
              <div class="tags">
                <span class="tag priority-${escapeAttr(item.priority)}">${escapeHtml(PRIORITY_LABELS[item.priority] || "보통")}</span>
                ${item.outputType ? `<span class="tag">${escapeHtml(item.outputType)}</span>` : ""}
                ${item.category ? `<span class="tag">${escapeHtml(item.category)}</span>` : ""}
              </div>
              <strong>${escapeHtml(item.title)}</strong>
              ${item.reason ? `<p>${escapeHtml(item.reason)}</p>` : ""}
              ${item.detail ? `<p class="task-detail">${escapeHtml(item.detail)}</p>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderRiskChecks(items) {
  const checks = normalizeRiskChecks(items);
  if (!checks.length) return `<p class="muted list-empty">관련 리스크 항목이 없습니다.</p>`;
  return `
    <div class="risk-check-list">
      ${checks
        .map(
          (item) => `
            <article class="risk-check-card">
              <div class="tags">
                <span class="tag">${escapeHtml(item.type || "기타")}</span>
                <span class="tag">확인 필요</span>
              </div>
              <strong>${escapeHtml(item.title)}</strong>
              ${item.reason ? `<p><b>이유</b>${escapeHtml(item.reason)}</p>` : ""}
              ${item.checkMethod ? `<p><b>확인 방법</b>${escapeHtml(item.checkMethod)}</p>` : ""}
              ${item.caution ? `<p><b>주의</b>${escapeHtml(item.caution)}</p>` : ""}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderList(items, tagName = "ul") {
  const values = toStringArray(items);
  if (values.length === 0) return `<p class="muted list-empty">아직 생성된 항목이 없습니다.</p>`;
  return `<${tagName}>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tagName}>`;
}

function renderEmptyState(icon, title, body) {
  return `
    <div class="empty-state empty-${escapeAttr(icon)}">
      <span class="empty-icon icon-${escapeAttr(icon)}" aria-hidden="true"></span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function handleProjectSubmit(event) {
  event.preventDefault();
  const project = getActiveProject();
  if (!project) return;
  project.title = $("projectTitle").value.trim() || "새 건축 프로젝트";
  project.topic = $("projectTopic").value.trim();
  project.site = $("projectSite").value.trim();
  project.stage = $("projectStage").value.trim();
  project.deadline = $("projectDeadline").value;
  project.concept = $("projectConcept").value.trim();
  project.notes = $("projectNotes").value.trim();
  project.updatedAt = nowIso();
  saveState();
  renderAll();
  showToast("프로젝트 정보를 저장했습니다.");
}

async function handleFeedbackSubmit(event) {
  event.preventDefault();
  if (isBusy) {
    showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    return;
  }
  await addFeedbackFromFormAndAnalyze();
}

function handleProjectListClick(event) {
  const button = event.target.closest("[data-project-id]");
  if (!button) return;
  state.activeProjectId = button.dataset.projectId;
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
}

function handleExpandableTextClick(event) {
  const button = event.target.closest("[data-expand-key]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const key = button.dataset.expandKey;
  if (!key) return;
  if (expandedTextKeys.has(key)) {
    expandedTextKeys.delete(key);
  } else {
    expandedTextKeys.add(key);
  }
  renderAll();
}

async function handleTimelineClick(event) {
  if (event.target.closest("[data-expand-key]")) return;
  const actionButton = event.target.closest("[data-feedback-action]");
  if (actionButton) {
    const feedbackId = actionButton.dataset.feedbackId;
    if (actionButton.dataset.feedbackAction === "toggle-text") {
      if (expandedFeedbackIds.has(feedbackId)) {
        expandedFeedbackIds.delete(feedbackId);
      } else {
        expandedFeedbackIds.add(feedbackId);
      }
      renderFeedbackTimeline();
    } else if (isBusy) {
      showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    } else if (actionButton.dataset.feedbackAction === "delete") {
      deleteFeedback(feedbackId);
    } else if (actionButton.dataset.feedbackAction === "reanalyze") {
      await reanalyzeFeedback(feedbackId);
    }
    return;
  }

  const button = event.target.closest("[data-feedback-id]");
  if (!button) return;
  selectedFeedbackId = button.dataset.feedbackId;
  renderAll();
}

async function handleAnalysisCardClick(event) {
  const actionButton = event.target.closest("[data-analysis-action]");
  if (!actionButton) return;
  const feedback = selectedFeedback();
  if (!feedback) {
    showToast("선택된 피드백이 없습니다.");
    return;
  }
  if (isBusy) {
    showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    return;
  }
  if (actionButton.dataset.analysisAction === "delete-feedback") {
    deleteFeedback(feedback.id);
  } else if (actionButton.dataset.analysisAction === "reanalyze") {
    await reanalyzeFeedback(feedback.id);
  }
}

function handleTaskClick(event) {
  const button = event.target.closest("[data-task-id]");
  if (!button) return;
  const project = getActiveProject();
  if (!project) return;
  const task = project.tasks.find((item) => item.id === button.dataset.taskId);
  if (!task) return;
  if (button.dataset.taskAction === "delete") {
    deleteTask(task.id);
    return;
  }
  const currentIndex = TASK_STATUSES.indexOf(task.status);
  task.status = TASK_STATUSES[(currentIndex + 1) % TASK_STATUSES.length];
  project.updatedAt = nowIso();
  saveState();
  renderTaskList();
  showToast(`작업 상태를 '${STATUS_LABELS[task.status]}'로 변경했습니다.`);
}

async function handleAnalyzeButton() {
  if (isBusy) {
    showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    return;
  }
  const project = getActiveProject();
  const feedback = selectedFeedback(project);
  if (!feedback) {
    showOutputNotice("선택된 피드백이 없습니다. 타임라인에서 피드백을 선택하거나 새 피드백을 저장하세요.");
    showToast("선택된 피드백이 없습니다.");
    return;
  }
  await reanalyzeFeedback(feedback.id);
}

async function addFeedbackFromFormAndAnalyze() {
  const project = getActiveProject();
  if (!project) {
    showToast("피드백을 저장할 프로젝트가 없습니다. 새 프로젝트를 먼저 만드세요.");
    return;
  }
  const rawText = els.feedbackText.value.trim();
  if (!rawText) {
    showToast("피드백 원문을 입력하세요.");
    return;
  }
  if (rawText.length > MAX_INPUT_CHARS) {
    showToast(`입력 길이가 ${MAX_INPUT_CHARS.toLocaleString("ko-KR")}자를 넘었습니다. 핵심 피드백 단위로 나눠 주세요.`);
    return;
  }

  const feedback = {
    id: uid("feedback"),
    date: els.feedbackDate.value || today(),
    source: els.feedbackSource.value || "교수",
    rawText,
    importance: els.feedbackImportance.value || "normal",
    keywords: parseKeywords(els.feedbackKeywords.value),
    analysis: null,
    createdAt: nowIso(),
  };
  project.feedbacks.unshift(feedback);
  selectedFeedbackId = feedback.id;
  clearFeedbackForm();
  await runAnalysisForFeedback(project, feedback);
}

async function runAnalysisForFeedback(project, feedback) {
  setBusy(true, feedback.analysis ? ANALYSIS_BUSY_MESSAGES.reanalysis : ANALYSIS_BUSY_MESSAGES.feedback);
  try {
    await waitForPaint();
    setAnalyzingStep("설계 이슈를 분류하고 Gemini 응답을 기다리는 중입니다.");
    const analysis = await analyzeFeedback(project, feedback);
    setAnalyzingStep(ANALYSIS_BUSY_MESSAGES.structuring);
    const fallbackReason = lastAiFallbackReason;
    if (!fallbackReason) {
      updateAiDiagnostics({
        lastErrorCode: "-",
        lastErrorSummary: `최근 Gemini 분석 성공. 응답 스키마 정규화 완료: ${analysisFieldSummary(analysis)}.`,
      });
    }
    feedback.analysis = analysis;
    feedback.keywords = normalizeTags([...feedback.keywords, ...analysis.categories]);
    project.tasks = project.tasks.filter((task) => task.sourceFeedbackId !== feedback.id);
    if (analysis.isRelevantToArchitecture !== false) {
      project.tasks.unshift(
        ...analysis.actionItems.map((item) =>
          createTask(item, feedback.id, item.category || analysis.categories[0] || "기타"),
        ),
      );
    }
    project.criticPlan = fallbackCriticPlan(project);
    project.portfolioDraft = fallbackPortfolioDraft(project);
    project.updatedAt = nowIso();
    saveState();
    outputView = "critic";
    renderAll();
    showToast(
      fallbackReason
        ? aiFallbackToast("Gemini 분석", "Mock 분석으로 작업 카드를 생성했습니다.")
        : "피드백 분석과 작업 카드 생성을 완료했습니다.",
    );
  } finally {
    setBusy(false);
  }
}

async function reanalyzeFeedback(feedbackId) {
  const project = getActiveProject();
  const feedback = project?.feedbacks.find((item) => item.id === feedbackId);
  if (!project || !feedback) {
    showToast("재분석할 피드백을 찾지 못했습니다.");
    return;
  }
  const confirmed = window.confirm("기존 작업이 새 분석 결과로 교체됩니다. 계속할까요?");
  if (!confirmed) return;
  selectedFeedbackId = feedback.id;
  await runAnalysisForFeedback(project, feedback);
}

function deleteFeedback(feedbackId) {
  const project = getActiveProject();
  if (!project) return;
  const feedback = project.feedbacks.find((item) => item.id === feedbackId);
  if (!feedback) return;
  const confirmed = window.confirm("이 피드백과 연결된 작업 카드가 함께 삭제됩니다. 계속할까요?");
  if (!confirmed) return;
  project.feedbacks = project.feedbacks.filter((item) => item.id !== feedbackId);
  project.tasks = project.tasks.filter((task) => task.sourceFeedbackId !== feedbackId);
  if (selectedFeedbackId === feedbackId) {
    selectedFeedbackId = feedbackId;
  }
  project.criticPlan = project.feedbacks.length > 0 ? fallbackCriticPlan(project) : emptyCriticPlan();
  project.portfolioDraft = project.feedbacks.length > 0 ? fallbackPortfolioDraft(project) : emptyPortfolioDraft();
  project.updatedAt = nowIso();
  saveState();
  renderAll();
  showToast("피드백과 연결된 작업 카드를 삭제했습니다.");
}

function deleteTask(taskId) {
  const project = getActiveProject();
  if (!project) return;
  const task = project.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const confirmed = window.confirm("이 작업 카드만 삭제됩니다. 계속할까요?");
  if (!confirmed) return;
  project.tasks = project.tasks.filter((item) => item.id !== taskId);
  project.criticPlan = fallbackCriticPlan(project);
  project.portfolioDraft = project.feedbacks.length > 0 ? fallbackPortfolioDraft(project) : emptyPortfolioDraft();
  project.updatedAt = nowIso();
  saveState();
  renderAll();
  showToast("작업 카드를 삭제했습니다.");
}

async function handleCriticPrep() {
  if (isBusy) {
    showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    return;
  }
  const project = getActiveProject();
  if (!project || project.feedbacks.length === 0) {
    setView("critic");
    showOutputNotice("다음 크리틱 준비안을 만들려면 먼저 피드백을 하나 이상 저장하고 분석해야 합니다.");
    showToast("다음 크리틱 준비를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true, ANALYSIS_BUSY_MESSAGES.critic);
  try {
    await waitForPaint();
    let plan;
    let fallbackReason = "";
    try {
      plan = await requestJsonFromModel(buildCriticPlanPrompt(project), normalizeCriticPlan);
    } catch (error) {
      console.info("Critic prep AI generation failed. Using fallback.", error);
      fallbackReason = recordAiFallback("다음 크리틱 생성 실패", error);
      plan = fallbackCriticPlan(project);
    }
    project.criticPlan = plan;
    project.updatedAt = nowIso();
    outputView = "critic";
    currentView = "critic";
    saveState();
    renderAll();
    showToast(
      fallbackReason
        ? aiFallbackToast("다음 크리틱 생성", "Mock 준비안으로 대체했습니다.")
        : "다음 크리틱 준비 패널을 생성했습니다.",
    );
  } finally {
    setBusy(false);
  }
}

async function handlePortfolioDraft() {
  if (isBusy) {
    showToast("AI 분석이 진행 중입니다. 잠시만 기다려주세요.");
    return;
  }
  const project = getActiveProject();
  if (!project || project.feedbacks.length === 0) {
    setView("portfolio");
    showOutputNotice("포트폴리오 서사를 만들려면 누적 피드백이나 완료된 작업 카드가 필요합니다.", "portfolio");
    showToast("포트폴리오 서사를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true, ANALYSIS_BUSY_MESSAGES.portfolio);
  try {
    await waitForPaint();
    let draft;
    let fallbackReason = "";
    try {
      draft = await requestJsonFromModel(buildPortfolioPrompt(project), normalizePortfolioDraft);
    } catch (error) {
      console.info("Portfolio AI generation failed. Using fallback.", error);
      fallbackReason = recordAiFallback("포트폴리오 서사 생성 실패", error);
      draft = fallbackPortfolioDraft(project);
    }
    project.portfolioDraft = draft;
    project.updatedAt = nowIso();
    outputView = "portfolio";
    currentView = "portfolio";
    saveState();
    renderAll();
    showToast(
      fallbackReason
        ? aiFallbackToast("포트폴리오 서사 생성", "Mock 서사로 대체했습니다.")
        : "포트폴리오 서사 초안을 생성했습니다.",
    );
  } finally {
    setBusy(false);
  }
}

async function analyzeFeedback(project, feedback) {
  const relevance = validateFeedbackRelevance(feedback);
  if (!relevance.isRelevant) {
    lastAiFallbackReason = "";
    renderAiMode();
    return irrelevantFeedbackAnalysis(relevance.message);
  }
  try {
    return await requestJsonFromModel(buildAnalysisPrompt(project, feedback), normalizeAnalysis);
  } catch (error) {
    console.info("Feedback analysis AI generation failed. Using fallback.", error);
    recordAiFallback(aiClient && !aiClient.available ? "Firebase 연결 준비 실패" : "Gemini 분석 실패", error);
    return fallbackAnalysis(project, feedback);
  }
}

function validateFeedbackRelevance(feedback) {
  const rawText = String(feedback?.rawText || "");
  const keywords = normalizeTags(feedback?.keywords).join(" ");
  const source = `${rawText} ${keywords}`.toLowerCase();
  const compact = source.replace(/\s+/g, "");
  const hasArchitectureTerm = ARCHITECTURE_RELEVANCE_TERMS.some((term) =>
    source.includes(String(term).toLowerCase()),
  );
  if (hasArchitectureTerm) {
    return { isRelevant: true, message: "" };
  }
  if (compact.length <= 5) {
    return { isRelevant: false, message: IRRELEVANT_FEEDBACK_MESSAGE };
  }
  const hasOffTopicTerm = OFF_TOPIC_TERMS.some((term) => source.includes(String(term).toLowerCase()));
  if (hasOffTopicTerm) {
    return { isRelevant: false, message: IRRELEVANT_FEEDBACK_MESSAGE };
  }
  return { isRelevant: false, message: IRRELEVANT_FEEDBACK_MESSAGE };
}

async function requestJsonFromModel(prompt, normalizer) {
  const client = await aiClientPromise;
  if (!client.available) {
    throw new Error(client.message);
  }
  const result = await withTimeout(
    client.model.generateContent(prompt),
    AI_GENERATE_TIMEOUT_MS,
    "Gemini generateContent",
  );
  const text = await extractResponseText(result);
  const parsed = parseJsonFromText(text);
  lastAiFallbackReason = "";
  updateAiDiagnostics({
    lastErrorCode: "-",
    lastErrorSummary: "최근 Gemini 호출이 성공했습니다.",
  });
  renderAiMode();
  return normalizer(parsed);
}

function withTimeout(promise, timeoutMs, label) {
  let timer = 0;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => {
      reject(new Error(`${label} 시간이 초과되었습니다.`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

function recordAiFallback(context, error) {
  const details = classifyAiError(error);
  const reason = `${context}: ${details.summary}`;
  lastAiFallbackReason = reason;
  updateAiDiagnostics({
    lastErrorCode: details.code,
    lastErrorSummary: reason,
  });
  console.info("AI fallback diagnostics", {
    context,
    code: details.code,
    summary: details.summary,
  });
  renderAiMode();
  return reason;
}

function analysisFieldSummary(analysis) {
  const requiredFields = [
    "isRelevantToArchitecture",
    "relevanceMessage",
    "summary",
    "categories",
    "designDiagnosis",
    "whyItMatters",
    "reviewCriteria",
    "actionItems",
    "drawingTasks",
    "diagramTasks",
    "riskQuestions",
    "presentationLines",
    "portfolioNarrative",
    "riskChecks",
  ];
  const ready = requiredFields.filter((field) => Object.hasOwn(analysis || {}, field));
  return `${ready.length}/${requiredFields.length}개 필드 준비`;
}

function aiFallbackToast(actionLabel, fallbackLabel) {
  if (aiDiagnostics.lastErrorCode === "CONFIG_FILE_LOAD_FAILED") {
    const demoLabel = fallbackLabel
      .replace("Mock 분석으로 작업 카드를 생성했습니다.", "Mock 분석과 작업 카드를 생성했습니다.")
      .replace("Mock 준비안으로 대체했습니다.", "Mock 준비안을 생성했습니다.")
      .replace("Mock 서사로 대체했습니다.", "Mock 서사를 생성했습니다.");
    return `${actionLabel}: Demo Mode에서 ${demoLabel}`;
  }
  const code = aiDiagnostics.lastErrorCode && aiDiagnostics.lastErrorCode !== "-"
    ? ` (${aiDiagnostics.lastErrorCode})`
    : "";
  return `${actionLabel} 실패${code}. Firebase 연결 진단을 확인하세요. ${fallbackLabel}`;
}

function describeAiError(error) {
  return classifyAiError(error).summary;
}

function classifyAiError(error) {
  const raw = String(error?.message || error?.code || error || "알 수 없는 오류");
  const message = sanitizeAiError(raw);
  if (/firebaseConfig\.js|Firebase 설정 파일 로드/i.test(message)) {
    return {
      code: "CONFIG_FILE_LOAD_FAILED",
      summary: "src/firebaseConfig.js를 불러오지 못했습니다. 파일 경로와 로컬 서버 응답을 확인하세요.",
    };
  }
  if (/Failed to fetch dynamically imported module|Importing a module script failed|firebase-(app|ai)\.js|Firebase App SDK|Firebase AI Logic Web SDK/i.test(message)) {
    return {
      code: "SDK_IMPORT_FAILED",
      summary: "Firebase Web SDK를 불러오지 못했습니다. 네트워크, 브라우저 차단, 또는 CDN 접근 상태를 확인하세요.",
    };
  }
  if (/시간이 초과|timed out|timeout/i.test(message)) {
    return {
      code: "AI_TIMEOUT",
      summary: "Firebase AI Logic 응답 시간이 초과되었습니다. 네트워크 또는 API 설정을 확인하세요.",
    };
  }
  if (/JSON object not found|Unexpected token|JSON/i.test(message)) {
    return {
      code: "RESPONSE_FORMAT_INVALID",
      summary: "Gemini 응답이 요청한 JSON 형식이 아니었습니다.",
    };
  }
  if (/API key not valid|invalid api key|auth\/invalid-api-key/i.test(message)) {
    return {
      code: "API_KEY_INVALID",
      summary:
        "Firebase config의 apiKey가 현재 Firebase 웹앱과 맞지 않거나, Firebase AI Logic / Gemini Developer API 설정이 완료되지 않았을 수 있습니다. Firebase Console의 Project settings > Your apps에서 web config를 다시 복사해 src/firebaseConfig.js를 교체하세요.",
    };
  }
  if (/permission|403|PERMISSION_DENIED|not authorized/i.test(message)) {
    return {
      code: "PERMISSION_DENIED",
      summary:
        "Firebase AI Logic 또는 Gemini API 권한이 허용되지 않았습니다. AI Logic provider 설정과 Google Cloud API 키 제한을 확인하세요.",
    };
  }
  if (/quota|429|RESOURCE_EXHAUSTED|rate limit/i.test(message)) {
    return {
      code: "QUOTA_EXHAUSTED",
      summary: "Gemini API 할당량 또는 속도 제한에 도달했습니다.",
    };
  }
  return {
    code: String(error?.code || "AI_ERROR").replace(/[^A-Z0-9_/-]/gi, "_").slice(0, 60),
    summary: truncate(message, 220),
  };
}

function sanitizeAiError(message) {
  return String(message || "")
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "AIza...")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractResponseText(result) {
  if (result?.response && typeof result.response.text === "function") {
    return result.response.text();
  }
  if (typeof result?.text === "function") {
    return result.text();
  }
  if (typeof result === "string") {
    return result;
  }
  return JSON.stringify(result);
}

function parseJsonFromText(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("JSON object not found in AI response.");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function buildAnalysisPrompt(project, feedback) {
  return `
너는 건축학과 설계 스튜디오의 크리틱 피드백을 분석하는 설계 튜터다.
사용자의 피드백을 단순 요약하지 말고, 설계상 문제가 무엇인지 진단하고, 왜 중요한지 설명하며,
다음 크리틱 전까지 수행해야 할 도면·다이어그램·발표 작업으로 변환한다.

분석 원칙:
1. 피드백 원문을 그대로 반복하지 마라.
2. "무엇이 문제인지"보다 "왜 설계상 문제가 되는지"를 설명해라.
3. 추상적인 조언보다 실제 산출물 단위의 작업을 제안해라.
4. 건축 학생이 다음 크리틱 전까지 해야 할 일로 바꿔라.
5. 평면, 단면, 다이어그램, 매스, 패널, 발표문 중 어떤 산출물이 필요한지 명확히 말해라.
6. 불확실한 내용은 단정하지 말고 "검토 필요"라고 표시해라.
7. 결과는 반드시 JSON 객체만 반환해라.

관련성 안전 원칙:
- 입력이 건축 설계 크리틱, 공간 피드백, 도면 검토, 발표 논리, 포트폴리오 정리와 관련 없으면 억지로 건축 분석을 만들지 마라.
- 무관한 입력이면 isRelevantToArchitecture를 false로 반환하고, 사용자가 어떤 건축 설계 피드백을 입력해야 하는지 relevanceMessage에 안내하라.
- 무관한 입력이면 actionItems, drawingTasks, diagramTasks, riskChecks, reviewCriteria, riskQuestions, presentationLines, nextCriticChecklist는 빈 배열로 반환하라.
- 무관한 입력에 대해 법규, 설계 판단, 공간 조건을 꾸며내지 마라.

법규/검토 리스크 원칙:
- 법규를 자동 판정하지 마라.
- 적법/위법을 단정하지 마라.
- 사용자가 입력한 정보만으로 확정할 수 없는 법규는 "확인 필요"로 표현해라.
- 설계 크리틱 관점에서 다음 검토해야 할 법규·피난·접근성·구조·설비·환경 리스크를 짚어라.
- 실제 인허가 검토는 최신 법령, 지자체 조례, 토지이음, 세움터, 전문가 검토가 필요하다고 안내해라.
- 법규 항목은 과하게 많이 만들지 말고, 피드백과 관련 있는 2~5개 정도만 제안해라.
- 이 항목은 법적 판정이 아니라 설계 검토용 체크리스트입니다. 실제 적합성은 최신 법령, 지자체 조례, 토지이음, 세움터, 전문가 검토로 확인해야 합니다.

나쁜 예:
- "동선 분리가 필요합니다."
- "매스 디자인 검토가 필요합니다."
- "공간적 구현이 필요합니다."

좋은 예:
"빌라 사보아의 램프가 건축적 산책로로는 강하지만 현대 주거의 실제 생활 동선과 충돌한다면, 상징적 경험과 거주 편의성 사이의 균형이 약해진다.
다음 크리틱 전에는 원작 램프 동선과 현대 생활 동선을 비교하는 다이어그램을 만들고,
평면에서는 공적 영역, 가족 공유 영역, 개인 영역의 위계를 명확히 표시해야 한다."

사용자가 말하지 않은 사실은 단정하지 말고 "검토 필요"라고 표현한다.
반드시 JSON 객체만 반환한다.

분류 카테고리:
${CATEGORIES.join(", ")}
카테고리는 위 목록 중에서만 선택한다. 환경 시스템 관련 키워드는 태그로 정규화하고, 카테고리로는 환경을 사용한다.

JSON 스키마:
{
  "isRelevantToArchitecture": true,
  "relevanceMessage": "건축 설계 크리틱과 관련되는 이유 또는 무관할 때 입력 가이드",
  "summary": "피드백의 핵심을 한 문장으로 압축",
  "categories": ["동선", "단면", "환경"],
  "designIssue": "designDiagnosis와 같은 내용. 기존 호환용 필드",
  "designDiagnosis": "이 피드백이 가리키는 설계상 핵심 문제",
  "whyItMatters": "이 문제가 설계 완성도, 안전성, 경험, 발표 논리에 왜 중요한지",
  "reviewCriteria": [
    "다음 검토 때 확인해야 할 기준"
  ],
  "actionItems": [
    {
      "title": "구체적인 작업 제목",
      "priority": "high | normal | low",
      "category": "관련 카테고리",
      "reason": "이 작업이 필요한 이유",
      "outputType": "평면도 / 단면도 / 다이어그램 / 발표문 / 패널 / 매스 검토",
      "detail": "실제로 어떻게 수정하거나 표현해야 하는지"
    }
  ],
  "drawingTasks": [
    "도면에서 해야 할 작업"
  ],
  "diagramTasks": [
    "다이어그램에서 해야 할 작업"
  ],
  "nextCriticChecklist": ["다음 크리틱에 보여줄 항목"],
  "presentationLines": ["발표 때 사용할 수 있는 문장"],
  "riskQuestions": ["교수나 리뷰어가 다시 물어볼 가능성이 높은 질문"],
  "riskChecks": [
    {
      "title": "검토 항목 제목",
      "type": "법규 / 피난 / 접근성 / 구조 / 설비 / 환경 / 운영 / 기타",
      "reason": "왜 이 항목을 확인해야 하는지",
      "checkMethod": "어떤 자료나 도면으로 확인해야 하는지",
      "caution": "법적 판정이 아니라 추가 확인이 필요하다는 안내"
    }
  ],
  "portfolioNarrative": "포트폴리오에 넣을 수 있는 설계 발전 서사"
}

품질 기준:
- actionItems는 최소 3개를 작성한다.
- 각 actionItems.detail은 도면/다이어그램/발표문에서 실제로 무엇을 표시하거나 고칠지 말한다.
- reviewCriteria는 다음 크리틱 때 판단 기준으로 사용할 수 있게 쓴다.
- riskChecks는 법적 적합성 판정이 아니라 확인해야 할 가능성이 있는 항목만 조심스럽게 쓴다.
- summary는 짧게, designDiagnosis와 whyItMatters는 더 구체적으로 쓴다.
- 단, isRelevantToArchitecture가 false인 경우 위 최소 개수 기준은 적용하지 말고 모든 작업/리스크 배열을 비워라.

프로젝트:
${projectDigest(project)}

피드백:
- 날짜: ${feedback.date}
- 출처: ${feedback.source}
- 중요도: ${feedback.importance}
- 키워드: ${feedback.keywords.join(", ") || "없음"}
- 원문: ${feedback.rawText}
`;
}

function buildCriticPlanPrompt(project) {
  return `
너는 건축 스튜디오 다음 크리틱 준비를 돕는 AI다.
아래 누적 피드백과 작업 리스트를 바탕으로, 다음 크리틱에서 보여줄 산출물과 예상 질문 대응 문장을 만든다.
반드시 JSON 객체만 반환한다.

JSON 스키마:
{
  "mustFix": ["이번 주 반드시 수정할 것"],
  "reviewMaterials": ["다음 크리틱에 보여줄 도면 / 다이어그램 / 이미지"],
  "riskQuestions": ["교수나 리뷰어가 다시 물어볼 가능성이 높은 질문"],
  "answerLines": ["질문에 대한 짧은 준비 문장"],
  "presentationOrder": ["발표 순서 제안"]
}

프로젝트와 누적 기록:
${projectDigest(project)}
`;
}

function buildPortfolioPrompt(project) {
  return `
너는 건축 포트폴리오 서사를 정리하는 편집자다.
누적 피드백과 완료 또는 진행 중인 작업을 바탕으로 설계가 어떻게 발전했는지 설명한다.
단순 요약이 아니라 설계자의 판단 변화가 보이는 문장으로 작성한다.
반드시 JSON 객체만 반환한다.

JSON 스키마:
{
  "problem": "초기 문제의식",
  "feedback": "주요 피드백",
  "change": "설계 변경 방향",
  "logic": "최종 설계 논리",
  "description": "포트폴리오 설명문"
}

프로젝트와 누적 기록:
${projectDigest(project)}
`;
}

function projectDigest(project) {
  const feedbacks = project.feedbacks
    .map(
      (feedback) => `
피드백 ${feedback.date} / ${feedback.source}
원문: ${feedback.rawText}
분석: ${feedback.analysis?.summary || "분석 없음"}
설계 진단: ${feedback.analysis?.designDiagnosis || feedback.analysis?.designIssue || "진단 없음"}
검토 기준: ${(feedback.analysis?.reviewCriteria || []).join(" / ") || "없음"}
카테고리: ${displayTags(feedback.keywords, feedback.analysis?.categories).join(", ") || "없음"}
`,
    )
    .join("\n");
  const tasks = project.tasks
    .map(
      (task) =>
        `- [${STATUS_LABELS[task.status]}] ${task.title} / ${task.category} / ${PRIORITY_LABELS[task.priority]} / ${task.outputType} / ${task.detail || task.reason}`,
    )
    .join("\n");
  return `
프로젝트명: ${project.title}
설계 주제: ${project.topic || "미입력"}
대지 / 위치: ${project.site || "미입력"}
핵심 컨셉: ${project.concept || "미입력"}
현재 단계: ${project.stage || "미입력"}
다음 크리틱 또는 마감일: ${project.deadline || "미입력"}
메모: ${project.notes || "미입력"}

누적 피드백:
${feedbacks || "없음"}

작업 리스트:
${tasks || "없음"}
`.slice(0, 12000);
}

function fallbackAnalysis(project, feedback) {
  const relevance = validateFeedbackRelevance(feedback);
  if (!relevance.isRelevant) {
    return irrelevantFeedbackAnalysis(relevance.message);
  }
  const rawText = `${feedback.rawText || ""} ${normalizeTags(feedback.keywords).join(" ")}`;
  const categories = inferCategories(rawText, feedback.keywords);
  const primary = categories[0] || "기타";
  const topic = project.topic || project.title;
  const scenario = mockScenarioFromText(rawText);
  const mock = mockScenarioContent(scenario, { project, feedback, topic, primary, categories });
  return {
    isRelevantToArchitecture: true,
    relevanceMessage: "건축 설계 크리틱과 관련된 피드백으로 판단했습니다.",
    summary: mock.summary,
    categories: uniqueStrings([...mock.categories, ...categories]).slice(0, 5),
    designIssue: mock.designDiagnosis,
    designDiagnosis: mock.designDiagnosis,
    whyItMatters: mock.whyItMatters,
    reviewCriteria: mock.reviewCriteria,
    actionItems: mock.actionItems,
    drawingTasks: mock.drawingTasks,
    diagramTasks: mock.diagramTasks,
    nextCriticChecklist: uniqueStrings([
      ...mock.reviewCriteria,
      ...mock.drawingTasks,
      ...mock.diagramTasks,
      "다음 질문에 답할 수 있는 짧은 발표 문장",
    ]).slice(0, 10),
    presentationLines: mock.presentationLines,
    portfolioNarrative: mock.portfolioNarrative,
    riskChecks: mock.riskChecks,
    riskQuestions: mock.riskQuestions,
  };
}

function mockScenarioFromText(text) {
  const source = String(text || "");
  if (/옥상정원|일사|열환경|열\b|환기|방수|유지관리|환경|에너지/i.test(source)) return "environment";
  if (/입면|매스|수평창|프라이버시|외부\s*시선|외부시선|시선|파사드|개구부/i.test(source)) return "facade";
  if (/동선|램프|공적|사적|평면|프로그램|영역|진입|이동/i.test(source)) return "movement";
  return "default";
}

function mockScenarioContent(scenario, context) {
  switch (scenario) {
    case "movement":
      return mockMovementAnalysis(context);
    case "environment":
      return mockEnvironmentAnalysis(context);
    case "facade":
      return mockFacadeAnalysis(context);
    default:
      return mockDefaultAnalysis(context);
  }
}

function mockMovementAnalysis({ feedback, topic }) {
  const designDiagnosis =
    "피드백은 동선과 프로그램의 관계가 평면에서 충분히 읽히지 않는 문제를 가리킵니다. 공적 영역과 사적 영역, 중심 공간과 주변 프로그램의 위계가 도면에서 분명하지 않으면 공간 경험이 설명보다 약해질 수 있습니다.";
  const drawingTasks = [
    "평면도에 주요 진입 동선, 반복 이용 동선, 서비스 동선을 서로 다른 선형으로 표시한다.",
    "공적 영역, 공유 영역, 사적 영역을 색상 또는 해치로 구분한다.",
    "중심 공간과 각 프로그램이 만나는 지점에 머무름, 통과, 충돌 가능성을 주석으로 표시한다.",
  ];
  const diagramTasks = [
    "사용자 유형별 동선 다이어그램을 작성한다.",
    "프로그램 관계 다이어그램에서 중심 공간과 주변 프로그램의 연결 강도를 표시한다.",
    "공적/사적 영역 위계 다이어그램을 만든다.",
  ];
  return {
    summary: `${feedback.source} 피드백은 ${topic}에서 동선, 평면, 프로그램 위계를 다시 검증하라는 내용입니다.`,
    categories: ["동선", "프로그램", "평면", "발표 논리"],
    designDiagnosis,
    whyItMatters:
      "동선과 프로그램 위계가 약하면 사용자가 어디로 들어오고, 어디에 머물고, 어떤 공간으로 이동하는지 설계 의도가 흐려집니다. 다음 크리틱에서는 설명보다 평면과 다이어그램에서 관계가 먼저 읽혀야 합니다.",
    reviewCriteria: [
      "주요 사용자 동선이 평면에서 한눈에 구분되는가?",
      "공적 영역과 사적 영역의 경계가 프로그램 배치와 일치하는가?",
      "중심 공간이 단순한 빈 공간이 아니라 이동과 머무름을 조직하는 장치로 작동하는가?",
      "프로그램 간 충돌 지점과 완충 영역이 도면에서 확인되는가?",
    ],
    actionItems: [
      {
        title: "사용자 유형별 동선 평면도 작성",
        priority: feedback.importance === "high" ? "high" : "normal",
        category: "동선",
        reason: "동선 문제를 말로 설명하지 않고 평면에서 직접 검토할 수 있게 해야 합니다.",
        outputType: "평면도",
        detail: "방문자, 거주자, 운영자 또는 서비스 동선을 서로 다른 선으로 그리고, 겹치는 지점과 분리해야 할 지점을 표시합니다.",
      },
      {
        title: "공적/사적 프로그램 위계 다이어그램 작성",
        priority: "high",
        category: "프로그램",
        reason: "프로그램 관계가 약하면 공간의 성격과 이용 흐름이 동시에 흐려집니다.",
        outputType: "다이어그램",
        detail: "공적, 공유, 사적 영역을 단계적으로 배열하고 각 영역 사이의 완충 조건을 짧은 주석으로 적습니다.",
      },
      {
        title: "중심 공간과 주변 프로그램 연결 방식 보완",
        priority: "normal",
        category: "평면",
        reason: "중심 공간이 실제 사용 장면을 조직하는지 보여줘야 합니다.",
        outputType: "평면도 / 발표문",
        detail: "중심 공간 주변에 사람들이 모이고 흩어지는 장면을 표시하고, 발표에서는 중심 공간의 역할을 한 문장으로 설명합니다.",
      },
    ],
    drawingTasks,
    diagramTasks,
    presentationLines: [
      "이번 수정은 동선을 더 복잡하게 만드는 것이 아니라, 프로그램 간 관계가 평면에서 먼저 읽히도록 정리하는 데 초점을 두었습니다.",
      "중심 공간은 장식적 요소가 아니라 사용자가 모이고 이동하는 흐름을 조직하는 장치로 재정의했습니다.",
    ],
    portfolioNarrative:
      "초기안은 프로그램과 동선의 관계가 느슨했지만, 크리틱 이후 사용자 흐름과 공적/사적 위계를 평면과 다이어그램으로 정리하면서 공간 논리가 더 명확해졌다.",
    riskChecks: [
      {
        title: "동선 충돌과 피난 흐름 검토",
        type: "피난 / 운영",
        reason: "일상 동선과 비상 시 이동 흐름이 같은 병목 지점에 집중될 수 있습니다.",
        checkMethod: "평면도에 일반 동선, 운영 동선, 피난 방향을 함께 표시하고 병목 구간을 표시합니다.",
        caution: "피난 적합성은 현행 법규와 전문가 검토로 별도 확인해야 합니다.",
      },
      {
        title: "공적/사적 영역 접근성 확인",
        type: "접근성 / 운영",
        reason: "공적 영역과 사적 영역의 경계가 모호하면 접근 통제와 이용 경험이 충돌할 수 있습니다.",
        checkMethod: "출입구, 공용 복도, 수직 동선, 사적 영역 진입부를 평면에서 함께 확인합니다.",
        caution: "이 항목은 법적 판정이 아니라 설계 검토용 체크리스트입니다.",
      },
    ],
    riskQuestions: [
      "사용자는 어디에서 들어와 어떤 순서로 프로그램을 경험하는가?",
      "공적 영역과 사적 영역은 어디서 분리되거나 만나는가?",
      "중심 공간은 실제 사용 흐름을 조직하는가?",
    ],
  };
}

function mockEnvironmentAnalysis({ feedback, topic }) {
  const designDiagnosis =
    "피드백은 옥상정원, 일사, 환기, 열환경 같은 환경 장치가 공간 경험과 단면 구성으로 충분히 번역되지 않은 문제를 가리킵니다. 환경 전략이 좋은 아이디어로만 남지 않도록 단면, 디테일, 유지관리 흐름에서 검증해야 합니다.";
  const drawingTasks = [
    "단면도에 일사, 환기, 열 이동, 외부 공간의 관계를 화살표와 주석으로 표시한다.",
    "옥상정원 또는 외부 데크가 있다면 방수, 배수, 난간, 접근 동선을 평면과 단면에 함께 표시한다.",
    "환경 성능을 담당하는 벽체, 개구부, 완충 공간의 위치를 도면 범례로 정리한다.",
  ];
  const diagramTasks = [
    "계절별 일사와 환기 흐름 다이어그램을 만든다.",
    "옥상정원 또는 외부 공간의 이용, 유지관리, 안전 경계 다이어그램을 만든다.",
    "열환경 완충 전략을 실내/외부 공간 관계로 단순화해 표현한다.",
  ];
  return {
    summary: `${feedback.source} 피드백은 ${topic}의 환경 전략을 단면, 유지관리, 실제 사용 장면으로 검증하라는 내용입니다.`,
    categories: ["환경", "단면", "설비", "시공"],
    designDiagnosis,
    whyItMatters:
      "환경 전략은 설계 개념을 강화할 수 있지만, 도면에서 작동 방식과 유지관리 조건이 보이지 않으면 장식적 설명처럼 보입니다. 특히 외부 공간과 지붕, 열·환기 전략은 안전, 방수, 운영 계획과 함께 제시되어야 설득력이 생깁니다.",
    reviewCriteria: [
      "환경 장치가 단면에서 실제 공기, 빛, 열 흐름으로 읽히는가?",
      "옥상정원이나 외부 공간의 접근, 안전, 방수, 유지관리 조건이 표시되는가?",
      "환경 전략이 공간 경험과 프로그램 운영을 동시에 보완하는가?",
      "계절별 또는 시간대별 변화가 다이어그램으로 설명되는가?",
    ],
    actionItems: [
      {
        title: "환경 흐름을 표시한 핵심 단면 작성",
        priority: "high",
        category: "단면",
        reason: "환경 전략은 평면보다 단면에서 작동 방식이 더 분명하게 검증됩니다.",
        outputType: "단면도",
        detail: "일사, 열, 환기, 외부 공간의 관계를 같은 단면에 표시하고, 어떤 공간이 완충 역할을 하는지 주석을 붙입니다.",
      },
      {
        title: "옥상정원 유지관리 조건 다이어그램 작성",
        priority: feedback.importance === "high" ? "high" : "normal",
        category: "환경",
        reason: "옥상정원이 실제 사용 공간이라면 안전과 유지관리 조건이 함께 제시되어야 합니다.",
        outputType: "다이어그램 / 단면 상세",
        detail: "이용 범위, 관리 동선, 방수·배수 고려 지점, 안전 경계를 분리해 표시합니다.",
      },
      {
        title: "계절별 일사·환기 전략 발표 문장 정리",
        priority: "normal",
        category: "발표 논리",
        reason: "환경 전략은 어떤 계절과 사용 조건에서 효과가 있는지 말로도 정리되어야 합니다.",
        outputType: "발표문",
        detail: "여름, 겨울, 중간기 조건에서 빛과 공기 흐름이 어떻게 달라지는지 2~3문장으로 압축합니다.",
      },
    ],
    drawingTasks,
    diagramTasks,
    presentationLines: [
      "환경 전략은 형태의 부가 요소가 아니라 단면에서 빛, 열, 공기 흐름을 조정하는 공간 장치로 정리했습니다.",
      "옥상정원은 상징적 외부 공간을 넘어 접근, 안전, 방수, 유지관리 조건까지 함께 검토하는 방향으로 보완했습니다.",
    ],
    portfolioNarrative:
      "크리틱 이후 환경 전략은 추상적 컨셉에서 단면과 유지관리 조건으로 구체화되었고, 외부 공간과 실내 경험을 연결하는 설계 장치로 발전했다.",
    riskChecks: [
      {
        title: "방수·배수 및 유지관리 검토",
        type: "시공 / 운영",
        reason: "옥상정원과 외부 공간은 사용성뿐 아니라 방수, 배수, 점검 동선이 설계 성립에 영향을 줍니다.",
        checkMethod: "옥상 평면과 단면에 배수 방향, 관리 접근, 방수층 고려 지점을 표시합니다.",
        caution: "구체적인 적합성은 구조·시공 전문가와 현행 기준으로 확인해야 합니다.",
      },
      {
        title: "환기와 열환경 기준 확인",
        type: "환경 / 설비",
        reason: "자연환기나 열 완충 전략이 실제 실내 환경 개선으로 이어지는지 검토가 필요합니다.",
        checkMethod: "단면과 환경 다이어그램에 유입, 배출, 차양, 완충 공간을 함께 표시합니다.",
        caution: "이 앱은 성능 계산을 하지 않으며 검토 항목만 제안합니다.",
      },
    ],
    riskQuestions: [
      "환경 전략은 단면에서 어떻게 작동하는가?",
      "옥상정원이나 외부 공간은 누가 어떻게 관리하는가?",
      "일사, 환기, 열환경 전략은 계절별로 어떻게 달라지는가?",
    ],
  };
}

function mockFacadeAnalysis({ feedback, topic }) {
  const designDiagnosis =
    "피드백은 입면과 매스가 외부 이미지로는 보이지만, 내부 프로그램, 프라이버시, 채광 조건과 충분히 연결되지 않은 문제를 가리킵니다. 수평창, 개구부, 외부 시선, 매스 분절이 공간 사용 논리와 함께 설명되어야 합니다.";
  const drawingTasks = [
    "입면도에 수평창, 개구부, 차폐 요소와 내부 프로그램의 대응 관계를 표시한다.",
    "매스 분절이 공적 공간, 사적 공간, 서비스 공간과 어떻게 연결되는지 평면과 입면을 나란히 비교한다.",
    "외부 시선이 들어오는 방향과 프라이버시 보호가 필요한 영역을 도면에 표시한다.",
  ];
  const diagramTasks = [
    "외부 시선과 프라이버시 레이어 다이어그램을 만든다.",
    "입면 개구부와 내부 프로그램 관계 다이어그램을 만든다.",
    "매스 분절과 채광 방향을 함께 보여주는 다이어그램을 만든다.",
  ];
  return {
    summary: `${feedback.source} 피드백은 ${topic}의 입면, 매스, 프라이버시 조건을 공간 사용 논리와 연결하라는 내용입니다.`,
    categories: ["입면", "매스", "평면", "환경"],
    designDiagnosis,
    whyItMatters:
      "입면과 매스가 내부 사용 방식과 연결되지 않으면 형태적 인상은 남아도 설계 논리는 약해집니다. 특히 주거나 커뮤니티 공간에서는 외부 시선, 채광, 프라이버시가 평면과 입면에서 동시에 검토되어야 합니다.",
    reviewCriteria: [
      "입면의 개구부가 내부 프로그램과 대응되는가?",
      "수평창이나 큰 개구부가 채광과 프라이버시를 동시에 설명하는가?",
      "매스 분절이 공간 위계와 사용 장면을 반영하는가?",
      "외부 시선과 내부 사적 영역의 관계가 도면에서 확인되는가?",
    ],
    actionItems: [
      {
        title: "입면 개구부와 내부 프로그램 대응표 작성",
        priority: "high",
        category: "입면",
        reason: "입면 표현이 내부 공간 사용과 연결되는지 검토해야 합니다.",
        outputType: "입면도 / 다이어그램",
        detail: "입면 위에 내부 프로그램 위치를 겹쳐 표시하고, 개구부가 필요한 이유를 채광, 조망, 프라이버시 기준으로 구분합니다.",
      },
      {
        title: "외부 시선과 프라이버시 레이어 표시",
        priority: feedback.importance === "high" ? "high" : "normal",
        category: "평면",
        reason: "프라이버시 문제는 입면뿐 아니라 평면의 영역 배치와 함께 검토해야 합니다.",
        outputType: "평면도 / 입면도",
        detail: "외부 시선 방향, 완충 공간, 차폐 요소, 사적 영역을 같은 도면 세트에서 표시합니다.",
      },
      {
        title: "매스 분절과 채광 전략 다이어그램 작성",
        priority: "normal",
        category: "매스",
        reason: "매스 조정이 조형적 선택이 아니라 빛과 공간 위계를 만드는 판단임을 보여줘야 합니다.",
        outputType: "매스 검토 / 다이어그램",
        detail: "매스 분절 전후를 비교하고, 채광 방향과 내부 주요 공간의 관계를 화살표로 표시합니다.",
      },
    ],
    drawingTasks,
    diagramTasks,
    presentationLines: [
      "입면은 외부 이미지가 아니라 내부 프로그램, 채광, 프라이버시 조건이 밖으로 드러나는 결과로 다시 정리했습니다.",
      "매스 분절은 조형적 변화가 아니라 외부 시선과 내부 사용 영역을 조정하기 위한 설계 판단입니다.",
    ],
    portfolioNarrative:
      "크리틱 이후 입면과 매스는 독립된 형태 표현에서 벗어나, 내부 프로그램과 프라이버시·채광 조건을 조정하는 설계 논리로 발전했다.",
    riskChecks: [
      {
        title: "개구부와 프라이버시 검토",
        type: "환경 / 운영",
        reason: "큰 창이나 수평창은 채광에는 유리하지만 외부 시선과 사적 영역 노출을 동시에 만들 수 있습니다.",
        checkMethod: "입면도와 평면도에 외부 시선 방향, 개구부 높이, 사적 영역 위치를 함께 표시합니다.",
        caution: "프라이버시와 채광 성능은 대지 조건과 주변 맥락에 따라 추가 검토가 필요합니다.",
      },
      {
        title: "일조·높이·인접 대지 영향 확인",
        type: "법규 / 환경",
        reason: "매스와 입면 변경은 일조, 높이 제한, 인접 대지 관계에 영향을 줄 수 있습니다.",
        checkMethod: "매스 모델과 배치도에서 인접 대지, 높이, 그림자 방향을 검토합니다.",
        caution: "정확한 적합성은 최신 법령과 지자체 조례로 확인해야 합니다.",
      },
    ],
    riskQuestions: [
      "입면의 개구부는 내부 프로그램과 어떤 관계가 있는가?",
      "프라이버시가 필요한 공간은 외부 시선으로부터 어떻게 보호되는가?",
      "매스 조정은 채광과 공간 위계를 어떻게 바꾸는가?",
    ],
  };
}

function mockDefaultAnalysis({ feedback, topic, primary }) {
  const designDiagnosis =
    "피드백은 설계 의도와 실제 산출물 사이의 연결이 약한 지점을 가리킵니다. 개념, 공간 구성, 표현 방식이 같은 기준으로 정렬되어야 다음 크리틱에서 수정 방향이 명확해집니다.";
  const drawingTasks = [
    `${primary} 쟁점이 드러나는 핵심 도면을 한 장 선택해 수정 전후를 비교한다.`,
    "문제가 되는 영역과 수정한 영역을 도면 범례로 표시한다.",
  ];
  const diagramTasks = [
    "피드백 이전과 이후의 설계 판단 변화를 한 장의 전후 비교 다이어그램으로 정리한다.",
    "개념, 공간 구성, 발표 논리의 관계를 간단한 흐름도로 표시한다.",
  ];
  return {
    summary: `${feedback.source} 피드백의 핵심은 ${primary} 관점에서 ${topic}의 설계 판단을 도면과 다이어그램으로 검증하라는 것입니다.`,
    categories: [primary, "표현 / 패널", "발표 논리"],
    designDiagnosis,
    whyItMatters:
      "설계 문제의 원인이 도면에서 검증되지 않으면 크리틱은 형태 취향이나 표현 방식의 논쟁으로 흐르기 쉽습니다. 다음 검토 전에는 어떤 산출물에서 어떤 판단을 확인할 수 있는지 명확히 해야 합니다.",
    reviewCriteria: [
      `${primary} 문제가 도면에서 검토 가능한 기준으로 표시되는가?`,
      "개념 설명이 실제 평면, 단면, 매스, 패널 표현으로 연결되는가?",
      "다음 크리틱에서 리뷰어가 같은 도면을 보고 수정 의도를 바로 확인할 수 있는가?",
      "수정 이후에도 검토 필요로 남겨둘 쟁점이 명확한가?",
    ],
    actionItems: [
      {
        title: `${primary} 이슈를 한 장의 핵심 도면으로 다시 정리`,
        priority: feedback.importance === "high" ? "high" : "normal",
        category: primary,
        reason: "크리틱에서 지적된 문제가 실제 공간 구성에서 어떻게 해결되는지 바로 확인할 수 있어야 합니다.",
        outputType: primary.includes("단면") ? "단면도" : primary.includes("평면") ? "평면도" : "다이어그램",
        detail: "수정 전 도면과 수정 후 도면을 나란히 두고, 바뀐 경계·동선·프로그램 관계를 굵은 선과 짧은 주석으로 표시합니다.",
      },
      {
        title: "피드백 전후 비교 다이어그램 작성",
        priority: "normal",
        category: "표현 / 패널",
        reason: "수정 판단의 변화가 시각적으로 보여야 설계 발전 과정이 선명해집니다.",
        outputType: "다이어그램 / 패널",
        detail: "문제 지점, 수정 판단, 기대 효과를 3단계로 나누고 각 단계에 대응하는 도면 조각을 함께 배치합니다.",
      },
      {
        title: "피드백을 반영한 30초 발표 문장 정리",
        priority: "normal",
        category: "발표 논리",
        reason: "도면 수정 의도를 말로 압축해 두면 다음 크리틱에서 질문이 들어와도 답변 흐름이 흔들리지 않습니다.",
        outputType: "발표문",
        detail: "문제 진단, 수정 기준, 다음 검토에서 확인받을 점을 각각 한 문장으로 압축합니다.",
      },
    ],
    drawingTasks,
    diagramTasks,
    presentationLines: [
      `이번 수정에서는 ${primary} 문제가 단순한 표현 문제가 아니라 설계 구조의 문제라고 보고, 도면과 발표 논리를 함께 조정했습니다.`,
      "다음 크리틱에서는 수정한 판단이 어떤 산출물에서 검증되는지 순서대로 보여주겠습니다.",
    ],
    portfolioNarrative:
      "초기안은 개념 설명에 비해 도면에서 설계 판단이 충분히 드러나지 않았다. 크리틱 이후 피드백을 작업 단위로 나누고, 핵심 도면과 발표 논리를 함께 수정하면서 설계의 변화 과정이 더 읽히도록 발전시켰다.",
    riskChecks: [
      {
        title: "기본 이용 동선과 안전 검토",
        type: "운영 / 피난",
        reason: "설계 쟁점이 구체화되면 이용 흐름과 비상 시 이동 흐름도 함께 확인해야 합니다.",
        checkMethod: "핵심 평면에 일반 동선, 출입구, 계단 또는 피난 방향을 표시합니다.",
        caution: "이 항목은 법적 판정이 아니라 추가 확인이 필요한 체크리스트입니다.",
      },
      {
        title: "대지 조건과 용도 기준 확인",
        type: "법규 / 기타",
        reason: "프로젝트 용도와 대지 조건이 설계 방향에 영향을 줄 수 있습니다.",
        checkMethod: "대지 정보, 프로그램 용도, 주요 면적 조건을 정리한 뒤 관련 기준을 확인합니다.",
        caution: "정확한 적합성은 최신 법령, 지자체 조례, 전문가 검토로 확인해야 합니다.",
      },
    ],
    riskQuestions: [
      "이 수정이 실제 공간 경험에서는 어떤 장면으로 드러나는가?",
      "기존 안과 비교했을 때 가장 크게 달라진 설계 판단은 무엇인가?",
      "다음 크리틱에서 검토 필요로 남겨둘 쟁점은 무엇인가?",
    ],
  };
}

function inferCategories(text, keywords = []) {
  const source = `${text} ${normalizeTags(keywords).join(" ")}`;
  const rules = [
    ["동선", /동선|흐름|접근|이동|반입|관람/],
    ["단면", /단면|층|수직|레벨|높이/],
    ["평면", /평면|배치|구획|실/],
    ["프로그램", /프로그램|기능|교육|관람|시설/],
    ["환경", /환경|co2|탄소|에너지|환기|여과/iu],
    ["구조", /구조|스팬|기둥|보|하중/],
    ["매스", /매스|형태|볼륨|덩어리/],
    ["입면", /입면|외피|파사드/],
    ["재료", /재료|마감|질감/],
    ["표현 / 패널", /패널|표현|다이어그램|렌더|이미지/],
    ["발표 논리", /발표|논리|설명|말|서사/],
  ];
  const found = rules.filter(([, pattern]) => pattern.test(source)).map(([category]) => category);
  const keywordCategories = normalizeTags(keywords)
    .map(mapLooseCategory)
    .filter((keyword) => CATEGORIES.includes(keyword));
  const categories = uniqueStrings([...keywordCategories, ...found]);
  return (categories.length > 0 ? categories : ["기타"]).slice(0, 5);
}

function fallbackCriticPlan(project) {
  const highTasks = project.tasks
    .filter((task) => task.priority === "high" && task.status !== "done")
    .map((task) => task.title);
  const openTasks = project.tasks.filter((task) => task.status !== "done").map((task) => task.title);
  const analyses = project.feedbacks.map((feedback) => feedback.analysis).filter(Boolean);
  return {
    mustFix: uniqueStrings(highTasks.length ? highTasks : openTasks).slice(0, 5),
    reviewMaterials: uniqueStrings(
      analyses.flatMap((analysis) => analysis.nextCriticChecklist).concat(
        analyses.flatMap((analysis) => analysis.drawingTasks || []),
        analyses.flatMap((analysis) => analysis.diagramTasks || []),
        project.tasks.map((task) => task.outputType).filter(Boolean),
      ),
    ).slice(0, 6),
    riskQuestions: uniqueStrings(
      analyses.flatMap((analysis) => analysis.riskQuestions).concat(
        analyses.flatMap((analysis) => analysis.reviewCriteria || []),
      ),
    ).slice(0, 5),
    answerLines: uniqueStrings(analyses.flatMap((analysis) => analysis.presentationLines)).slice(0, 4),
    presentationOrder: [
      "이전 크리틱에서 나온 핵심 문제를 먼저 짚는다.",
      "수정한 도면과 다이어그램을 순서대로 보여준다.",
      "아직 확인이 필요한 리스크 질문을 명확히 제시한다.",
      "다음 작업 범위를 짧게 정리한다.",
    ],
  };
}

function fallbackPortfolioDraft(project) {
  const analyses = project.feedbacks.map((feedback) => feedback.analysis).filter(Boolean);
  const mainFeedback = analyses[0]?.summary || project.feedbacks[0]?.rawText || "누적 피드백이 아직 충분하지 않습니다.";
  const completed = project.tasks.filter((task) => task.status === "done").map((task) => task.title);
  const active = project.tasks.filter((task) => task.status !== "done").map((task) => task.title);
  return {
    problem: `${project.title}은 ${project.topic || "설계 주제"}를 공간적으로 설득해야 하는 과제에서 출발했다.`,
    feedback: mainFeedback,
    change:
      active[0] ||
      "피드백을 바탕으로 핵심 도면, 다이어그램, 발표 논리를 서로 맞물리게 정리하는 방향으로 수정했다.",
    logic:
      completed[0] ||
      "최종 논리는 개념을 설명하는 데서 멈추지 않고, 사용자의 동선과 공간의 작동 원리를 도면에서 읽히게 만드는 데 있다.",
    description:
      analyses[0]?.portfolioNarrative ||
      "크리틱 이후 설계자는 피드백을 실행 가능한 작업으로 나누고, 도면 수정과 발표 문장을 함께 정리하면서 설계 발전 과정을 포트폴리오 서사로 전환했다.",
  };
}

function hasCriticPlan(plan) {
  return Boolean(
    plan &&
      (plan.mustFix.length ||
        plan.reviewMaterials.length ||
        plan.riskQuestions.length ||
        plan.answerLines.length ||
        plan.presentationOrder.length),
  );
}

function hasPortfolio(draft) {
  return Boolean(
    draft &&
      (draft.problem || draft.feedback || draft.change || draft.logic || draft.description),
  );
}

function parseKeywords(value) {
  return normalizeTags(
    String(value || "")
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function uniqueStrings(items) {
  const seen = new Set();
  return toStringArray(items).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fillFirstFeedbackExample() {
  const example = getFeedbackExampleForProject(getActiveProject());
  const currentText = els.feedbackText.value.trim();
  if (currentText && currentText !== example) {
    const confirmed = window.confirm("현재 입력 중인 내용이 있습니다. 예시 문장으로 바꿀까요?");
    if (!confirmed) return;
  }

  els.feedbackText.value = example;
  renderInputLength();
  els.feedbackText.focus();
  showToast("예시 문장을 입력창에 넣었습니다. 저장하고 분석을 눌러 결과를 확인하세요.");
}

function clearFeedbackForm() {
  els.feedbackDate.value = today();
  els.feedbackImportance.value = "normal";
  els.feedbackKeywords.value = "";
  els.feedbackText.value = "";
  renderInputLength();
}

function getProjectTemplate(templateId) {
  return PROJECT_TEMPLATES.find((template) => template.id === templateId) || PROJECT_TEMPLATES[PROJECT_TEMPLATES.length - 1];
}

function createProjectFromTemplate(templateId) {
  const template = getProjectTemplate(templateId);
  const defaults = { ...template.defaults };
  if (template.id === "blank") {
    defaults.title = `새 건축 프로젝트 ${state.projects.length + 1}`;
  }

  const project = createProject(defaults);
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  selectedFeedbackId = null;
  outputView = "critic";
  localStorage.setItem(ENTRY_KEY, "true");
  localStorage.setItem(START_MODE_KEY, "new");
  saveState();
  renderAll();
  navigateTo(APP_VIEW_HASHES.home);
  window.setTimeout(() => {
    els.feedbackText?.focus();
  }, 0);
  showToast(`${template.name} 템플릿으로 프로젝트를 만들었습니다.`);
}

function projectFeedbackPlaceholder(project) {
  const haystack = `${project?.title || ""} ${project?.topic || ""} ${project?.stage || ""} ${project?.notes || ""}`;
  const template = PROJECT_TEMPLATES.find((item) => item.id !== "blank" && haystack.includes(item.name));
  return template?.feedbackPlaceholder || getProjectTemplate("blank").feedbackPlaceholder;
}

function updateFeedbackExampleGuide(project) {
  if (!els.feedbackExampleText) return;
  els.feedbackExampleText.textContent = getFeedbackExampleForProject(project);
}

function getFeedbackExampleForProject(project) {
  const haystack = `${project?.title || ""} ${project?.topic || ""} ${project?.stage || ""} ${project?.notes || ""}`.toLowerCase();
  if (/졸업설계/.test(haystack)) return FEEDBACK_EXAMPLES.graduation;
  if (/공모전|제출물|심사\s*기준|마감/.test(haystack)) return FEEDBACK_EXAMPLES.competition;
  if (/포트폴리오|서사|설명문/.test(haystack)) return FEEDBACK_EXAMPLES.portfolio;
  if (/리노베이션|개선|현황|기존\s*공간/.test(haystack)) return FEEDBACK_EXAMPLES.renovation;
  if (/도시|인프라|공공|보행|도시\s*맥락/.test(haystack)) return FEEDBACK_EXAMPLES.urbanInfra;
  if (/스튜디오\s*크리틱|주간\s*스튜디오|매주\s*받은|다음\s*수업/.test(haystack)) return FEEDBACK_EXAMPLES.studio;
  return FEEDBACK_EXAMPLES.default;
}

function createNewProject(options = {}) {
  const silent = options?.silent === true;
  const project = createProject({
    title: `새 건축 프로젝트 ${state.projects.length + 1}`,
  });
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
  if (!silent) {
    showToast("새 프로젝트를 만들었습니다.");
  }
}

function deleteActiveProject() {
  const project = getActiveProject();
  if (!project) {
    showToast("삭제할 프로젝트가 없습니다.");
    return;
  }
  const confirmed = window.confirm("이 프로젝트와 연결된 피드백, 작업 리스트가 모두 삭제됩니다. 계속할까요?");
  if (!confirmed) return;
  state.projects = state.projects.filter((item) => item.id !== project.id);
  state.activeProjectId = state.projects[0]?.id || null;
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
  showToast(
    state.projects.length > 0
      ? "프로젝트를 삭제했습니다."
      : "모든 프로젝트가 삭제되었습니다. 새 프로젝트를 만들거나 샘플을 복원하세요.",
  );
}

function exportData() {
  downloadTextFile(
    `studio-critic-ai-backup-${today()}.json`,
    JSON.stringify(state, null, 2),
    "application/json;charset=utf-8",
  );
  showToast("JSON 백업 파일을 내보냈습니다.");
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result || "{}")));
      selectedFeedbackId = null;
      outputView = "critic";
      saveState();
      renderAll();
      showToast("JSON 데이터를 불러왔습니다.");
    } catch (error) {
      console.error(error);
      showToast("JSON 파일을 읽지 못했습니다. studio-critic-ai에서 내보낸 백업 파일인지 확인하세요.");
    } finally {
      els.importFile.value = "";
    }
  };
  reader.readAsText(file);
}

function resetSample() {
  state = createSampleState();
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
  showToast("샘플 데이터를 복원했습니다.");
}

function clearStorage() {
  const confirmed = window.confirm("현재 브라우저의 studio-critic-ai 데이터를 초기화할까요?");
  if (!confirmed) return;
  const project = createProject({ title: "새 건축 프로젝트" });
  state = {
    projects: [project],
    activeProjectId: project.id,
  };
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
  showToast("localStorage 데이터를 초기화했습니다.");
}

function setBusy(nextBusy, message = "") {
  isBusy = nextBusy;
  isAnalyzing = nextBusy;
  analyzingMessage = nextBusy
    ? message || "설계 진단, 작업 카드, 법규/검토 리스크를 정리하는 중입니다."
    : "";
  renderBusyState();
}

function setAnalyzingStep(message) {
  if (!isAnalyzing) return;
  analyzingMessage = message || analyzingMessage;
  renderBusyState();
}

function renderBusyState() {
  if (els.analysisLoadingOverlay) {
    els.analysisLoadingOverlay.classList.toggle("is-hidden", !isAnalyzing);
    els.analysisLoadingOverlay.setAttribute("aria-hidden", isAnalyzing ? "false" : "true");
  }
  if (els.analysisLoadingMessage) {
    els.analysisLoadingMessage.textContent =
      analyzingMessage || "설계 진단, 작업 카드, 법규/검토 리스크를 정리하는 중입니다. 잠시만 기다려주세요.";
  }

  const feedbackSubmit = els.feedbackForm?.querySelector("button[type='submit']");
  setButtonBusy(feedbackSubmit, isBusy, "분석 중...");
  setButtonBusy(els.analyzeBtn, isBusy, "분석 중...");
  setButtonBusy(els.criticPrepBtn, isBusy, "생성 중...");
  setButtonBusy(els.portfolioBtn, isBusy, "생성 중...");

  [
    els.deleteProjectBtn,
    els.newProjectBtn,
    ...document.querySelectorAll('[data-feedback-action="delete"], [data-analysis-action="delete-feedback"]'),
  ].forEach((button) => {
    if (button) button.disabled = isBusy;
  });

  document
    .querySelectorAll('[data-feedback-action="reanalyze"], [data-analysis-action="reanalyze"]')
    .forEach((button) => setButtonBusy(button, isBusy, "처리 중..."));

  renderAiMode();
}

function setButtonBusy(button, busy, busyText) {
  if (!button) return;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent.trim();
  }
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.defaultText;
}

function waitForPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

function showOutputNotice(message, target = "critic") {
  const panel = target === "portfolio" && els.portfolioPanel ? els.portfolioPanel : els.outputPanel;
  panel.className = "output-panel empty panel-scroll";
  panel.innerHTML = renderEmptyState(target === "portfolio" ? "doc" : "board", "생성할 피드백이 필요합니다", message);
}

function truncate(value, limit) {
  const text = String(value || "").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
