const STORAGE_KEY = "studio-critic-ai:v1";
const ENTRY_KEY = "studioCriticEntered";
const START_MODE_KEY = "studioCriticStartMode";
const MODEL_NAME = "gemini-2.5-flash-lite";
const FIREBASE_SDK_VERSION = "11.10.0";
const MAX_INPUT_CHARS = 4000;
const AI_INIT_TIMEOUT_MS = 10000;
const AI_GENERATE_TIMEOUT_MS = 45000;
const CONFIG_URL = new URL("./src/firebaseConfig.js", window.location.href).href;

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

const $ = (id) => document.getElementById(id);

const els = {
  landingShell: $("landingShell"),
  appShell: $("appShell"),
  startChoicePanel: $("startChoicePanel"),
  openStartButtons: Array.from(document.querySelectorAll("[data-open-start]")),
  startModeButtons: Array.from(document.querySelectorAll("[data-start-mode]")),
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
};

let state = loadState();
let selectedFeedbackId = null;
let outputView = "critic";
let currentView = "home";
let aiClient = null;
let isBusy = false;
let lastAiFallbackReason = "";
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
  els.closeStartChoiceBtn?.addEventListener("click", closeStartChoice);
  els.closeStartTargets.forEach((target) => {
    target.addEventListener("click", closeStartChoice);
  });
  els.landingScrollLinks.forEach((link) => {
    link.addEventListener("click", handleLandingScrollLink);
  });
  window.addEventListener("hashchange", syncRouteFromHash);
  els.projectForm.addEventListener("submit", handleProjectSubmit);
  els.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
  els.feedbackText.addEventListener("input", renderInputLength);
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
  els.newProjectBtn.addEventListener("click", createNewProject);
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

  localStorage.setItem(ENTRY_KEY, "true");
  showAppShell();
  setView(route.view, { updateHash: false });
}

function showLandingShell(options = {}) {
  els.landingShell?.classList.remove("is-hidden");
  els.appShell?.classList.add("is-hidden");
  els.appShell?.classList.remove("is-visible");
  setStartChoiceVisible(options.startChoice === true);
}

function showAppShell() {
  els.landingShell?.classList.add("is-hidden");
  els.appShell?.classList.remove("is-hidden");
  els.appShell?.classList.add("is-visible");
  setStartChoiceVisible(false);
}

function setStartChoiceVisible(visible) {
  els.startChoicePanel?.classList.toggle("is-hidden", !visible);
  els.startChoicePanel?.setAttribute("aria-hidden", visible ? "false" : "true");
}

function openStartChoice() {
  navigateTo("#/start");
  window.setTimeout(() => els.startChoicePanel?.querySelector("[data-start-mode]")?.focus(), 0);
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
    createNewProject({ silent: true });
    navigateTo(APP_VIEW_HASHES.settings);
    window.setTimeout(() => {
      els.projectForm?.scrollIntoView({ block: "start" });
      els.projectForm?.querySelector("input")?.focus();
    }, 0);
    showToast("새 프로젝트로 시작합니다. 프로젝트 정보를 입력하세요.");
    return;
  }

  navigateTo(APP_VIEW_HASHES.settings);
  window.setTimeout(highlightBackupPanel, 0);
  showToast("백업 불러오기에서 JSON 파일을 선택하세요.");
}

function activateDemoProject() {
  const existingDemo = state.projects.find(isDemoProject);
  if (existingDemo) {
    state.activeProjectId = existingDemo.id;
  } else {
    const sampleProject = createSampleState().projects[0];
    state.projects.unshift(sampleProject);
    state.activeProjectId = sampleProject.id;
  }
  selectedFeedbackId = getActiveProject()?.feedbacks[0]?.id || null;
  outputView = "critic";
  saveState();
  renderAll();
}

function isDemoProject(project) {
  return project.title === "시흥 IC 순환 자원 관람 인프라" || String(project.notes || "").includes("샘플 모드");
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
    copyBlock("설계 진단", diagnosis),
    copyBlock("왜 중요한가", analysis.whyItMatters),
    copyListBlock("검토 기준", analysis.reviewCriteria),
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
    summary:
      "폐기물 반입 동선, 관람 동선, CO₂ 순환 시스템의 경계를 평면과 단면에서 동시에 명확히 해야 한다.",
    categories: ["동선", "단면", "환경", "프로그램"],
    designIssue:
      "프로그램 간 동선 위계와 환경 제어 경계가 불명확해 산업 기능과 관람 경험이 같은 공간 논리 안에서 충돌할 수 있다.",
    designDiagnosis:
      "폐기물 처리, 관람 교육, CO₂ 순환 시스템이 모두 흥미로운 요소로 제시되어 있지만, 각 프로그램이 어디서 분리되고 어디서 시각적으로 연결되는지 도면에서 읽히지 않는다.",
    whyItMatters:
      "폐기물 처리 시설은 위생, 안전, 운영 동선이 설계 신뢰도를 좌우한다. 관람객이 처리 공정을 어디까지 볼 수 있는지, 음압 구역과 공개 구역의 경계가 어디인지가 불명확하면 환경 인프라를 전시/교육 프로그램으로 전환한다는 논리가 약해진다.",
    reviewCriteria: [
      "폐기물 차량, 운영자, 관람객 동선이 평면에서 서로 다른 선형과 출입 지점으로 구분되는가?",
      "하역장, 열분해 모듈, CO₂ 전환 장치의 연결이 단면에서 공기 흐름과 함께 읽히는가?",
      "관람자가 볼 수 있는 영역과 접근하면 안 되는 영역이 도면과 발표문에서 같은 기준으로 설명되는가?",
    ],
    actionItems: [
      {
        title: "폐기물 반입 동선과 관람객 동선을 분리한 평면 대안 작성",
        priority: "high",
        category: "동선",
        reason:
          "위생·안전 흐름과 전시/교육 흐름이 같은 전면부에서 겹치면 프로그램의 위계가 흐려진다.",
        outputType: "평면도",
        detail:
          "차량 진입, 하역, 운영자 이동, 관람객 진입을 서로 다른 색과 선형으로 표시하고 교차 지점이 있다면 완충실이나 시각적 관람 구간으로 분리한다.",
      },
      {
        title: "하역장, 열분해 모듈, CO₂ 전환 장치를 관통하는 핵심 단면 작성",
        priority: "high",
        category: "단면",
        reason:
          "환경 시스템이 말로만 설명되면 건축 공간으로 구현된 장면이 약해진다.",
        outputType: "단면도 / 다이어그램",
        detail:
          "하역장 음압 구역의 시작과 끝, 열분해 모듈의 위치, CO₂ 흐름, 관람 가능한 경계선을 한 단면 안에 겹쳐 표시한다.",
      },
      {
        title: "CO₂ 순환 시스템의 공개 범위 다이어그램 추가",
        priority: "normal",
        category: "환경",
        reason:
          "관람자가 처리 공정을 어디까지 이해하고 어디서 차단되는지 보여줘야 교육 프로그램의 설득력이 생긴다.",
        outputType: "다이어그램 / 패널",
        detail:
          "폐기물, 열, CO₂, 관람 시선의 흐름을 분리된 레이어로 그리고, 실제 접근 가능한 동선과 시각적으로만 관찰하는 구역을 구분한다.",
      },
    ],
    drawingTasks: [
      "평면도에 차량, 운영자, 관람객 동선을 서로 다른 색과 범례로 표시한다.",
      "핵심 단면에 하역장 음압 구역, 열분해 모듈, CO₂ 전환 장치, 관람 경계를 함께 표시한다.",
    ],
    diagramTasks: [
      "폐기물 처리 흐름과 CO₂ 순환 흐름을 분리한 시스템 다이어그램을 만든다.",
      "관람객이 볼 수 있는 공정과 차단되는 공정을 시선 다이어그램으로 표시한다.",
    ],
    nextCriticChecklist: [
      "분리된 폐기물 반입 동선과 관람 동선이 표시된 평면",
      "하역장과 열분해 모듈을 통과하는 핵심 단면",
      "CO₂ 순환 시스템의 공간 다이어그램",
    ],
    presentationLines: [
      "이 프로젝트는 폐기물 처리 과정을 단순히 숨기는 것이 아니라, 안전하게 통제된 관람 경계를 통해 환경 인프라의 작동을 읽게 만드는 제안입니다.",
      "평면에서는 위생·운영 동선과 관람 동선을 분리하고, 단면에서는 음압 구역과 CO₂ 순환 장치의 관계를 드러내는 것이 핵심입니다.",
    ],
    portfolioNarrative:
      "초기 계획은 폐기물 처리와 관람 프로그램을 병치하는 데 머물렀지만, 크리틱 이후 위생·운영 동선과 관람 동선을 분리하고 CO₂ 순환 시스템을 단면의 주된 서사로 드러내는 방향으로 발전했다.",
    riskQuestions: [
      "관람객은 폐기물 처리 공정을 어디까지 직접 볼 수 있는가?",
      "음압 구역은 어디서 시작되고 어디서 끝나는가?",
      "CO₂ 전환 시스템이 실제 공간에서 보이는 장면은 어디인가?",
    ],
  };
}

function createSampleState() {
  const project = createProject({
    title: "시흥 IC 순환 자원 관람 인프라",
    topic: "폐기물 처리와 CO₂ 순환 시스템을 결합한 공개형 환경 인프라",
    site: "시흥 IC 인근 산업·교통 인프라 경계부",
    concept:
      "폐기물 반입, 열분해, CO₂ 순환, 관람 교육 동선을 분리하면서도 단면적으로 읽히게 만드는 공개형 인프라",
    stage: "졸업설계 중간 크리틱 준비",
    deadline: today(),
    notes:
      "샘플 모드에서는 Firebase 설정 없이 프로젝트, 피드백, Mock 분석, 작업 리스트 흐름을 체험할 수 있습니다.",
  });
  const feedbackId = uid("feedback");
  const analysis = sampleAnalysis();
  project.feedbacks = [
    {
      id: feedbackId,
      date: today(),
      source: "교수",
      rawText:
        "폐기물 반입 동선과 관람 동선이 너무 가까워 보인다. CO₂ 순환 시스템은 흥미롭지만, 공간적으로 어떻게 드러나는지 약하다. 하역장과 열분해 모듈의 연결 관계를 단면에서 더 명확히 보여줘야 한다.",
      importance: "high",
      keywords: ["동선", "CO₂", "단면", "이산화탄소"],
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
  els.aiModePill.textContent = aiClient.available ? "Gemini 연결 가능" : aiUnavailableLabel(aiClient.message);
  els.aiModePill.className = `status-pill ${aiClient.available ? "ok" : "warn"}`;
  els.aiModePill.title = aiClient.message;
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
    <p>${escapeHtml(project.concept || project.topic || "프로젝트 브리프를 Settings에서 정리해두면 분석 품질이 좋아집니다.")}</p>
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
      <h3>${escapeHtml(diagnosis || analysis?.summary || "아직 분석되지 않은 피드백입니다.")}</h3>
      <p>${escapeHtml(analysis?.whyItMatters || feedback.rawText || "Analysis 화면에서 선택 피드백을 재분석할 수 있습니다.")}</p>
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
                <strong>${escapeHtml(task.title)}</strong>
                <span>${escapeHtml(task.outputType || task.category || "작업")} · ${escapeHtml(PRIORITY_LABELS[task.priority] || "보통")}</span>
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
      const summary = feedback.analysis?.summary || "아직 분석되지 않은 피드백입니다. 재분석을 실행하세요.";
      const diagnosis = feedback.analysis?.designDiagnosis || feedback.analysis?.designIssue || "";
      const rawPreview = truncate(feedback.rawText, 150);
      const tags = displayTags(feedback.keywords, feedback.analysis?.categories)
        .slice(0, 8)
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
      const activeClass = feedback.id === selectedFeedbackId ? "active" : "";
      return `
        <article class="timeline-item ${activeClass}" data-feedback-id="${escapeAttr(feedback.id)}">
          <button class="timeline-select ${activeClass}" data-feedback-id="${escapeAttr(feedback.id)}" type="button">
            <div class="timeline-meta">
              <span class="date">${escapeHtml(feedback.date)}</span>
              <span class="source">${escapeHtml(feedback.source)}</span>
              <span class="importance ${escapeAttr(feedback.importance)}">${escapeHtml(PRIORITY_LABELS[feedback.importance] || "보통")}</span>
            </div>
            <span class="feedback-label">AI 요약</span>
            <p class="feedback-summary">${escapeHtml(summary)}</p>
            ${diagnosis ? `<p class="feedback-diagnosis">${escapeHtml(truncate(diagnosis, 140))}</p>` : ""}
            <p class="feedback-raw">${escapeHtml(rawPreview)}</p>
            <div class="tags">${tags}</div>
          </button>
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
          <strong>${escapeHtml(task.title)}</strong>
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
      ${task.reason ? `<p>${escapeHtml(task.reason)}</p>` : ""}
      ${task.detail ? `<p class="task-detail">${escapeHtml(task.detail)}</p>` : ""}
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

async function handleTimelineClick(event) {
  const actionButton = event.target.closest("[data-feedback-action]");
  if (actionButton) {
    const feedbackId = actionButton.dataset.feedbackId;
    if (actionButton.dataset.feedbackAction === "delete") {
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
  setBusy(true);
  try {
    const analysis = await analyzeFeedback(project, feedback);
    const fallbackReason = lastAiFallbackReason;
    feedback.analysis = analysis;
    feedback.keywords = normalizeTags([...feedback.keywords, ...analysis.categories]);
    project.tasks = project.tasks.filter((task) => task.sourceFeedbackId !== feedback.id);
    project.tasks.unshift(
      ...analysis.actionItems.map((item) =>
        createTask(item, feedback.id, item.category || analysis.categories[0] || "기타"),
      ),
    );
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
  const project = getActiveProject();
  if (!project || project.feedbacks.length === 0) {
    setView("critic");
    showOutputNotice("다음 크리틱 준비안을 만들려면 먼저 피드백을 하나 이상 저장하고 분석해야 합니다.");
    showToast("다음 크리틱 준비를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true);
  try {
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
  const project = getActiveProject();
  if (!project || project.feedbacks.length === 0) {
    setView("portfolio");
    showOutputNotice("포트폴리오 서사를 만들려면 누적 피드백이나 완료된 작업 카드가 필요합니다.", "portfolio");
    showToast("포트폴리오 서사를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true);
  try {
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
  try {
    return await requestJsonFromModel(buildAnalysisPrompt(project, feedback), normalizeAnalysis);
  } catch (error) {
    console.info("Feedback analysis AI generation failed. Using fallback.", error);
    recordAiFallback(aiClient && !aiClient.available ? "Firebase 연결 준비 실패" : "Gemini 분석 실패", error);
    return fallbackAnalysis(project, feedback);
  }
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

나쁜 예:
- "동선 분리가 필요합니다."
- "매스 디자인 검토가 필요합니다."
- "공간적 구현이 필요합니다."

좋은 예:
"폐기물 반입 동선과 관람객 동선이 같은 전면부에서 겹치면, 위생·안전 프로그램과 전시/교육 프로그램의 위계가 흐려진다.
다음 크리틱 전에는 평면에서 차량, 운영자, 관람객 동선을 서로 다른 선형으로 분리하고,
단면에서는 하역장 음압 구역과 관람 가능 구역의 경계를 명확히 표시해야 한다."

사용자가 말하지 않은 사실은 단정하지 말고 "검토 필요"라고 표현한다.
반드시 JSON 객체만 반환한다.

분류 카테고리:
${CATEGORIES.join(", ")}
카테고리는 위 목록 중에서만 선택한다. CO2, co2, 이산화탄소는 태그에서는 CO₂로 정규화하고, 카테고리로는 환경을 사용한다.

JSON 스키마:
{
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
  "portfolioNarrative": "포트폴리오에 넣을 수 있는 설계 발전 서사"
}

품질 기준:
- actionItems는 최소 3개를 작성한다.
- 각 actionItems.detail은 도면/다이어그램/발표문에서 실제로 무엇을 표시하거나 고칠지 말한다.
- reviewCriteria는 다음 크리틱 때 판단 기준으로 사용할 수 있게 쓴다.
- summary는 짧게, designDiagnosis와 whyItMatters는 더 구체적으로 쓴다.

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
  const categories = inferCategories(`${project.topic} ${project.concept} ${feedback.rawText}`, feedback.keywords);
  const primary = categories[0] || "기타";
  const second = categories[1] || "표현 / 패널";
  const topic = project.topic || project.title;
  const sourceText = `${project.topic} ${project.concept} ${feedback.rawText}`;
  const hasWasteSystem = /폐기물|쓰레기|하역|열분해|처리|반입/.test(sourceText);
  const hasVisitorFlow = /관람|방문|전시|교육/.test(sourceText);
  const hasCarbonSystem = /co2|co₂|이산화탄소|탄소|순환/i.test(sourceText);
  const diagnosis = hasWasteSystem || hasVisitorFlow
    ? "프로그램 간 동선 위계와 환경 제어 경계가 불명확합니다. 운영·처리 흐름과 관람 경험이 어디서 분리되고 어디서 시각적으로 연결되는지 도면에서 더 분명하게 읽혀야 합니다."
    : "피드백은 설계 의도와 실제 산출물 사이의 연결이 약한 지점을 가리킵니다. 개념, 공간 구성, 표현 방식이 같은 기준으로 정렬되어야 합니다.";
  const whyItMatters = hasWasteSystem
    ? "폐기물 처리 시설은 위생, 안전, 운영 동선이 설계 신뢰도를 좌우합니다. 관람 동선이 처리 동선과 충돌하면 교육 프로그램의 설득력도 약해지고, 하역장이나 음압 구역의 경계가 모호하면 공간의 안전 기준을 설명하기 어렵습니다."
    : "설계 문제의 원인이 도면에서 검증되지 않으면 크리틱은 형태 취향이나 표현 방식의 논쟁으로 흐르기 쉽습니다. 다음 검토 전에는 어떤 산출물에서 어떤 판단을 확인할 수 있는지 명확히 해야 합니다.";
  const drawingTasks = hasWasteSystem
    ? [
        "평면도에 차량 반입, 운영자 이동, 관람객 이동을 서로 다른 선형과 출입 지점으로 표시한다.",
        "핵심 단면에 하역장, 처리 모듈, 음압 또는 차단 구역, 관람 가능 경계를 함께 표시한다.",
      ]
    : [
        `${primary} 쟁점이 드러나는 핵심 평면 또는 단면을 한 장 선택해 수정 전후를 비교한다.`,
        "공개 영역, 운영 영역, 완충 영역처럼 판단 기준이 되는 경계를 도면 범례로 표시한다.",
      ];
  const diagramTasks = hasCarbonSystem
    ? [
        "CO₂ 흐름, 에너지 흐름, 관람 시선을 분리한 시스템 다이어그램을 만든다.",
        "환경 시스템이 실제 공간에서 보이는 지점과 숨겨지는 지점을 레이어로 구분한다.",
      ]
    : [
        "피드백 이전과 이후의 설계 판단 변화를 한 장의 전후 비교 다이어그램으로 정리한다.",
        "프로그램, 동선, 공간 경험의 관계를 선과 영역으로 단순화해 표시한다.",
      ];
  return {
    summary: `${feedback.source} 피드백의 핵심은 ${primary} 관점에서 ${topic}의 설계 판단을 도면과 다이어그램으로 검증하라는 것입니다.`,
    categories,
    designIssue: diagnosis,
    designDiagnosis: diagnosis,
    whyItMatters,
    reviewCriteria: [
      hasWasteSystem
        ? "폐기물 반입, 운영자 이동, 관람객 동선이 평면에서 서로 다른 출입과 흐름으로 구분되는가?"
        : `${primary} 문제가 도면에서 검토 가능한 기준으로 표시되는가?`,
      hasCarbonSystem
        ? "CO₂ 또는 환경 시스템의 흐름이 단면과 다이어그램에서 공간적 경계와 함께 읽히는가?"
        : "개념 설명이 실제 평면, 단면, 매스, 패널 표현으로 연결되는가?",
      "다음 크리틱에서 리뷰어가 같은 도면을 보고 수정 의도를 바로 확인할 수 있는가?",
    ],
    actionItems: [
      {
        title: hasWasteSystem
          ? "폐기물 반입 동선과 관람객 동선을 분리한 평면 대안 작성"
          : `${primary} 이슈를 한 장의 핵심 도면으로 다시 정리`,
        priority: feedback.importance === "high" ? "high" : "normal",
        category: hasWasteSystem ? "동선" : primary,
        reason:
          hasWasteSystem
            ? "처리 시설의 위생·안전 흐름과 전시/교육 흐름이 겹치면 프로그램 위계가 흐려집니다."
            : "크리틱에서 지적된 문제가 실제 공간 구성에서 어떻게 해결되는지 바로 확인할 수 있어야 합니다.",
        outputType: hasWasteSystem
          ? "평면도"
          : primary.includes("단면")
            ? "단면도"
            : primary.includes("평면")
              ? "평면도"
              : "다이어그램",
        detail: hasWasteSystem
          ? "차량 진입, 하역, 운영자 이동, 관람객 진입을 서로 다른 색과 선형으로 표시하고 교차 지점은 완충실, 관람창, 레벨 차이 중 하나로 처리합니다."
          : "수정 전 도면과 수정 후 도면을 나란히 두고, 바뀐 경계·동선·프로그램 관계를 굵은 선과 짧은 주석으로 표시합니다.",
      },
      {
        title: hasWasteSystem
          ? "하역장과 처리 모듈을 통과하는 핵심 단면 작성"
          : `${second} 관점의 전후 비교 다이어그램 작성`,
        priority: hasWasteSystem ? "high" : "normal",
        category: hasWasteSystem ? "단면" : second,
        reason:
          hasWasteSystem
            ? "공정과 환경 제어가 단면에서 보이지 않으면 기술 시스템이 건축 공간으로 번역되지 않습니다."
            : "피드백 이전과 이후의 판단 변화를 시각적으로 보여주면 설계 발전 과정이 더 선명해집니다.",
        outputType: hasWasteSystem ? "단면도 / 다이어그램" : "다이어그램 / 패널",
        detail: hasWasteSystem
          ? "하역장, 처리 모듈, 음압 구역, 관람 가능 구역의 경계를 한 단면에 겹쳐 표시하고 공기 흐름은 별도 화살표로 분리합니다."
          : "문제 지점, 수정 판단, 기대 효과를 3단계로 나누고 각 단계에 대응하는 도면 조각을 함께 배치합니다.",
      },
      {
        title: hasCarbonSystem ? "CO₂ 순환 시스템의 공개 범위 다이어그램 추가" : "피드백을 반영한 30초 발표 문장 정리",
        priority: "normal",
        category: hasCarbonSystem ? "환경" : "발표 논리",
        reason:
          hasCarbonSystem
            ? "환경 시스템이 실제 공간에서 어디까지 드러나는지 보여줘야 개념과 체험이 연결됩니다."
            : "도면 수정 의도를 말로 압축해 두면 다음 크리틱에서 질문이 들어와도 답변 흐름이 흔들리지 않습니다.",
        outputType: hasCarbonSystem ? "다이어그램 / 패널" : "발표문",
        detail: hasCarbonSystem
          ? "CO₂ 흐름, 설비 위치, 관람 시선을 분리된 레이어로 그리고, 관람자가 직접 보는 장면과 내부에서만 작동하는 장치를 구분합니다."
          : "문제 진단, 수정 기준, 다음 검토에서 확인받을 점을 각각 한 문장으로 압축합니다.",
      },
    ],
    drawingTasks,
    diagramTasks,
    nextCriticChecklist: uniqueStrings([
      ...drawingTasks,
      ...diagramTasks,
      "다음 질문에 답할 수 있는 짧은 발표 문장",
    ]),
    presentationLines: [
      hasWasteSystem
        ? "이번 수정에서는 폐기물 처리 동선과 관람 동선을 분리해 위생·안전 흐름을 먼저 확보하고, 관람은 통제된 경계 안에서 이루어지도록 조정했습니다."
        : `이번 수정에서는 ${primary} 문제가 단순한 표현 문제가 아니라 설계 구조의 문제라고 보고, 도면과 발표 논리를 함께 조정했습니다.`,
      hasCarbonSystem
        ? "CO₂ 순환 시스템은 설비 설명이 아니라 단면에서 읽히는 공간 장치로 보이도록 정리했습니다."
        : "피드백을 반영해 프로그램, 동선, 공간 경험이 서로 분리되지 않도록 다시 연결했습니다.",
    ],
    portfolioNarrative:
      hasWasteSystem
        ? "초기안은 폐기물 처리와 관람 프로그램을 병치하는 데 머물렀지만, 크리틱 이후 운영 동선과 관람 동선을 분리하고 환경 제어 경계를 단면과 다이어그램으로 드러내는 방향으로 발전했다."
        : "초기안은 개념 설명에 비해 도면에서 설계 판단이 충분히 드러나지 않았다. 크리틱 이후 피드백을 작업 단위로 나누고, 핵심 도면과 발표 논리를 함께 수정하면서 설계의 변화 과정이 더 읽히도록 발전시켰다.",
    riskQuestions: [
      hasVisitorFlow ? "관람객은 처리 공정 또는 운영 과정을 어디까지 볼 수 있는가?" : "이 수정이 실제 공간 경험에서는 어떤 장면으로 드러나는가?",
      hasWasteSystem ? "음압 또는 차단 구역은 어디서 시작되고 어디서 끝나는가?" : "기존 안과 비교했을 때 가장 크게 달라진 설계 판단은 무엇인가?",
      hasCarbonSystem ? "CO₂ 순환 시스템은 공간에서 보이는 장면과 숨겨지는 장치가 어떻게 나뉘는가?" : "다음 크리틱에서 검토 필요로 남겨둘 쟁점은 무엇인가?",
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

function clearFeedbackForm() {
  els.feedbackDate.value = today();
  els.feedbackImportance.value = "normal";
  els.feedbackKeywords.value = "";
  els.feedbackText.value = "";
  renderInputLength();
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

function setBusy(nextBusy) {
  isBusy = nextBusy;
  const buttons = [
    els.analyzeBtn,
    els.criticPrepBtn,
    els.portfolioBtn,
    els.deleteProjectBtn,
    els.feedbackForm.querySelector("button[type='submit']"),
  ];
  buttons.forEach((button) => {
    if (button) button.disabled = isBusy;
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
