const STORAGE_KEY = "studio-critic-ai:v1";
const MODEL_NAME = "gemini-2.5-flash-lite";
const FIREBASE_SDK_VERSION = "11.10.0";
const MAX_INPUT_CHARS = 4000;
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

const $ = (id) => document.getElementById(id);

const els = {
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
  toast: $("toast"),
  importFile: $("importFile"),
  analyzeBtn: $("analyzeBtn"),
  criticPrepBtn: $("criticPrepBtn"),
  portfolioBtn: $("portfolioBtn"),
  exportBtn: $("exportBtn"),
  resetSampleBtn: $("resetSampleBtn"),
  clearStorageBtn: $("clearStorageBtn"),
  newProjectBtn: $("newProjectBtn"),
  deleteProjectBtn: $("deleteProjectBtn"),
};

let state = loadState();
let selectedFeedbackId = null;
let outputView = "critic";
let aiClient = null;
let isBusy = false;

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
  renderAll();
}

function bindEvents() {
  els.projectForm.addEventListener("submit", handleProjectSubmit);
  els.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
  els.feedbackText.addEventListener("input", renderInputLength);
  els.projectList.addEventListener("click", handleProjectListClick);
  els.feedbackTimeline.addEventListener("click", handleTimelineClick);
  els.analysisCard.addEventListener("click", handleAnalysisCardClick);
  els.taskList.addEventListener("click", handleTaskClick);
  els.analyzeBtn.addEventListener("click", handleAnalyzeButton);
  els.criticPrepBtn.addEventListener("click", handleCriticPrep);
  els.portfolioBtn.addEventListener("click", handlePortfolioDraft);
  els.exportBtn.addEventListener("click", exportData);
  els.importFile.addEventListener("change", importData);
  els.resetSampleBtn.addEventListener("click", resetSample);
  els.clearStorageBtn.addEventListener("click", clearStorage);
  els.newProjectBtn.addEventListener("click", createNewProject);
  els.deleteProjectBtn.addEventListener("click", deleteActiveProject);
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
    actionItems: [],
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
      "자기물류 처리 동선과 관람 동선을 분리하고, CO2 전환 시스템을 단면에서 작동 원리까지 보이도록 정리해야 한다.",
    categories: ["동선", "단면", "환경", "프로그램"],
    designIssue:
      "산업 기능과 관람 기능의 경계가 불명확하고, 환경 시스템이 공간 경험으로 충분히 번역되지 않았다.",
    actionItems: [
      {
        title: "자기물류 반입 동선과 관람 동선을 분리한 평면 대안 작성",
        priority: "high",
        category: "동선",
        reason:
          "서로 다른 사용자와 물류 흐름의 충돌을 줄이고 프로그램의 설득력을 높여야 한다.",
        outputType: "평면도",
      },
      {
        title: "여과실, 이산화탄소 전환 모듈, 외부 공간의 연결을 단면 다이어그램으로 표현",
        priority: "high",
        category: "단면",
        reason:
          "기술 시스템이 건축 공간에서 어떻게 작동하는지 크리틱이 한눈에 이해해야 한다.",
        outputType: "단면도 / 다이어그램",
      },
      {
        title: "관람자가 시스템을 안전하게 관찰하는 발표 논리 정리",
        priority: "normal",
        category: "발표 논리",
        reason:
          "산업 시설과 교육 프로그램을 결합한 의도를 짧고 명확하게 말할 필요가 있다.",
        outputType: "발표문",
      },
    ],
    nextCriticChecklist: [
      "분리된 물류 동선과 관람 동선이 표시된 평면",
      "여과실과 전환 모듈을 통과하는 핵심 단면",
      "CO2 전환 시스템의 공간 다이어그램",
    ],
    presentationLines: [
      "이 프로젝트는 자기물류 처리 과정을 숨기는 대신, 안전하게 관찰 가능한 환경 교육의 장으로 전환합니다.",
      "평면에서는 동선 충돌을 줄이고, 단면에서는 환경 시스템의 작동 흐름을 드러내는 것이 핵심입니다.",
    ],
    portfolioNarrative:
      "초기 계획은 자기물류 처리와 관람 프로그램을 병치하는 데 머물렀지만, 크리틱 이후 물류 동선과 관람 동선을 분리하고 CO2 전환 시스템을 단면의 주된 서사로 드러내는 방향으로 발전했다.",
    riskQuestions: [
      "관람 동선이 산업 동선과 만나는 지점의 안전 기준은 무엇인가?",
      "CO2 전환 시스템이 실제 공간에서 보이는 장면은 어디인가?",
    ],
  };
}

function createSampleState() {
  const project = createProject({
    title: "시흥 IC 모듈형 자기물류 처리 시설",
    topic: "자기물류 처리와 CO2 전환 시스템을 결합한 임시 인프라",
    site: "시흥 IC 인근 산업·교통 인프라 경계부",
    concept:
      "자기물류 처리, CO2 전환, 관람 교육 동선을 분리하면서도 단면적으로 연결하는 공개형 인프라",
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
        "자기물류 반입 동선과 관람 동선이 너무 가까워 보인다. CO2 전환 시스템이 말로만 있고 공간적으로 어떻게 드러나는지 약하다. 여과실과 이산화탄소 전환 모듈의 연결 관계를 단면에서 더 명확히 보여줘야 한다.",
      importance: "high",
      keywords: ["동선", "CO2", "단면", "이산화탄소"],
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
    keywords: toStringArray(feedback.keywords),
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
    status: TASK_STATUSES.includes(task.status) ? task.status : "todo",
    sourceFeedbackId: stringOr(task.sourceFeedbackId, ""),
    createdAt: stringOr(task.createdAt, nowIso()),
  };
}

function normalizeAnalysis(analysis) {
  const safe = analysis || {};
  return {
    summary: stringOr(safe.summary, ""),
    categories: normalizeCategories(safe.categories),
    designIssue: stringOr(safe.designIssue, ""),
    actionItems: Array.isArray(safe.actionItems)
      ? safe.actionItems.map((item) => normalizeActionItem(item, safe.categories?.[0]))
      : [],
    nextCriticChecklist: toStringArray(safe.nextCriticChecklist),
    presentationLines: toStringArray(safe.presentationLines),
    portfolioNarrative: stringOr(safe.portfolioNarrative, ""),
    riskQuestions: toStringArray(safe.riskQuestions),
  };
}

function normalizeActionItem(item, fallbackCategory = "기타") {
  return {
    title: stringOr(item?.title, "작업 제목 없음"),
    priority: ["high", "normal", "low"].includes(item?.priority) ? item.priority : "normal",
    category: stringOr(item?.category, fallbackCategory || "기타"),
    reason: stringOr(item?.reason, ""),
    outputType: stringOr(item?.outputType, ""),
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
  const categories = toStringArray(value);
  if (categories.length === 0) return [];
  return categories.map((category) => {
    const exact = CATEGORIES.find((candidate) => candidate === category);
    return exact || category;
  });
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
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
  return {
    id: uid("task"),
    title: stringOr(item.title, "작업 제목 없음"),
    priority: ["high", "normal", "low"].includes(item.priority) ? item.priority : "normal",
    category: stringOr(item.category, fallbackCategory),
    reason: stringOr(item.reason, ""),
    outputType: stringOr(item.outputType, ""),
    status: "todo",
    sourceFeedbackId,
    createdAt: nowIso(),
  };
}

async function createAiClient() {
  try {
    const configModule = await import(CONFIG_URL);
    const firebaseConfig = configModule.firebaseConfig;
    if (!isUsableFirebaseConfig(firebaseConfig)) {
      return {
        available: false,
        message: "Firebase 설정이 비어 있어 Mock 모드로 실행합니다. 샘플 분석 결과가 생성됩니다.",
      };
    }

    const [{ initializeApp }, aiModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-ai.js`),
    ]);
    const { getAI, getGenerativeModel, GoogleAIBackend } = aiModule;
    const app = initializeApp(firebaseConfig);
    const backend = GoogleAIBackend ? new GoogleAIBackend() : undefined;
    const ai = backend ? getAI(app, { backend }) : getAI(app);
    const model = getGenerativeModel(ai, { model: MODEL_NAME });
    return {
      available: true,
      model,
      message: `Firebase AI Logic 연결됨: ${MODEL_NAME}`,
    };
  } catch (error) {
    console.info("Firebase AI Logic is unavailable. Falling back to mock mode.", error);
    return {
      available: false,
      message: "Firebase 설정 파일이 없거나 SDK를 불러오지 못해 Mock 모드로 실행합니다. 샘플 분석 결과가 생성됩니다.",
    };
  }
}

function isUsableFirebaseConfig(config) {
  if (!config || typeof config !== "object") return false;
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  return required.every((key) => {
    const value = String(config[key] || "");
    return value && !value.includes("YOUR_");
  });
}

function renderAll() {
  ensureSelection();
  renderAiMode();
  renderProjectList();
  renderProjectForm();
  renderFeedbackTimeline();
  renderAnalysisCard();
  renderTaskList();
  renderOutputPanel();
  renderInputLength();
}

function renderAiMode() {
  if (!els.aiModePill) return;
  if (!aiClient) {
    els.aiModePill.textContent = "AI 상태 확인 중";
    els.aiModePill.className = "status-pill";
    return;
  }
  els.aiModePill.textContent = aiClient.available ? "Gemini 연결 가능" : "Mock 모드 · Firebase 미연결";
  els.aiModePill.className = `status-pill ${aiClient.available ? "ok" : "warn"}`;
  els.aiModePill.title = aiClient.message;
}

function renderProjectList() {
  if (state.projects.length === 0) {
    els.projectList.innerHTML = `
      <div class="empty">
        프로젝트가 없습니다. 새 프로젝트를 만들거나 샘플 복원으로 시작하세요.
      </div>
    `;
    return;
  }
  const activeId = state.activeProjectId;
  els.projectList.innerHTML = state.projects
    .map(
      (project) => `
        <button class="project-item ${project.id === activeId ? "active" : ""}" data-project-id="${escapeAttr(project.id)}" type="button">
          <strong>${escapeHtml(project.title)}</strong>
          <span>${escapeHtml(project.stage || project.topic || "단계 미입력")}</span>
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
    els.feedbackTimeline.innerHTML = `<div class="empty">프로젝트가 없습니다. 새 프로젝트를 만들거나 샘플 복원으로 시작하세요.</div>`;
    return;
  }
  if (project.feedbacks.length === 0) {
    els.feedbackTimeline.innerHTML = `<div class="empty">아직 저장된 피드백이 없습니다. 크리틱 원문을 입력하고 '저장하고 분석'을 눌러 첫 작업 카드를 만드세요.</div>`;
    return;
  }

  els.feedbackTimeline.innerHTML = project.feedbacks
    .map((feedback) => {
      const summary = feedback.analysis?.summary || "아직 분석되지 않은 피드백입니다. 재분석을 실행하세요.";
      const rawPreview = truncate(feedback.rawText, 150);
      const tags = [...feedback.keywords, ...(feedback.analysis?.categories || [])]
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
            <p>${escapeHtml(summary)}</p>
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
    els.analysisCard.className = "analysis-card empty";
    els.analysisCard.innerHTML =
      "분석할 피드백이 선택되지 않았습니다. 타임라인에서 피드백을 선택하거나 새 피드백을 저장하세요.";
    return;
  }

  const feedbackMeta = `
    <div class="timeline-meta">
      <span class="date">${escapeHtml(feedback.date)}</span>
      <span class="source">${escapeHtml(feedback.source)}</span>
      <span class="importance ${escapeAttr(feedback.importance)}">${escapeHtml(PRIORITY_LABELS[feedback.importance] || "보통")}</span>
    </div>
    ${renderTags(feedback.keywords)}
    <h4>피드백 원문</h4>
    <p class="feedback-raw">${escapeHtml(feedback.rawText || "원문 없음")}</p>
  `;

  if (!feedback.analysis) {
    els.analysisCard.className = "analysis-card";
    els.analysisCard.innerHTML = `
      <div class="analysis-toolbar">
        <button data-analysis-action="reanalyze" type="button">재분석</button>
        <button class="danger" data-analysis-action="delete-feedback" type="button">피드백 삭제</button>
      </div>
      <h3>아직 분석되지 않은 피드백입니다.</h3>
      ${feedbackMeta}
      <p class="empty">재분석을 실행하면 Mock 분석 카드와 작업 카드가 생성됩니다.</p>
    `;
    return;
  }

  const analysis = feedback.analysis;
  els.analysisCard.className = "analysis-card";
  els.analysisCard.innerHTML = `
    <div class="analysis-toolbar">
      <button data-analysis-action="reanalyze" type="button">재분석</button>
      <button class="danger" data-analysis-action="delete-feedback" type="button">피드백 삭제</button>
    </div>
    <h3>${escapeHtml(analysis.summary || "분석 요약 없음")}</h3>
    ${feedbackMeta}
    ${renderTags(analysis.categories)}
    <h4>설계 이슈</h4>
    <p>${escapeHtml(analysis.designIssue || "설계 이슈가 아직 정리되지 않았습니다.")}</p>
    <h4>작업 제안</h4>
    ${renderList(
      analysis.actionItems.map(
        (item) =>
          `${item.title} · ${PRIORITY_LABELS[item.priority] || "보통"} · ${item.outputType || "산출물 미정"}`,
      ),
    )}
    <h4>다음 크리틱 체크리스트</h4>
    ${renderList(analysis.nextCriticChecklist)}
    <h4>발표 문장</h4>
    ${renderList(analysis.presentationLines)}
    <h4>포트폴리오 서사</h4>
    <p>${escapeHtml(analysis.portfolioNarrative || "누적 피드백이 쌓이면 서사가 더 구체화됩니다.")}</p>
    <h4>리스크 질문</h4>
    ${renderList(analysis.riskQuestions)}
  `;
}

function renderTaskList() {
  const project = getActiveProject();
  if (!project) {
    els.taskList.innerHTML = `<div class="empty">프로젝트가 없습니다. 새 프로젝트를 만들면 작업 카드가 여기에 표시됩니다.</div>`;
    return;
  }
  if (project.tasks.length === 0) {
    els.taskList.innerHTML = `<div class="empty">아직 작업 카드가 없습니다. 피드백을 저장하고 분석하면 해야 할 작업이 자동으로 생성됩니다.</div>`;
    return;
  }

  els.taskList.innerHTML = project.tasks
    .map(
      (task) => `
        <article class="task-card">
          <div class="task-top">
            <strong>${escapeHtml(task.title)}</strong>
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
        </article>
      `,
    )
    .join("");
}

function renderOutputPanel() {
  const project = getActiveProject();
  if (!project) {
    els.outputPanel.className = "output-panel empty";
    els.outputPanel.innerHTML = "프로젝트가 없습니다. 새 프로젝트를 만들거나 샘플 복원으로 시작하세요.";
    return;
  }
  if (outputView === "portfolio" && hasPortfolio(project.portfolioDraft)) {
    renderPortfolioPanel(project.portfolioDraft);
    return;
  }
  if (hasCriticPlan(project.criticPlan)) {
    renderCriticPanel(project.criticPlan);
    return;
  }
  if (hasPortfolio(project.portfolioDraft)) {
    renderPortfolioPanel(project.portfolioDraft);
    return;
  }
  els.outputPanel.className = "output-panel empty";
  els.outputPanel.innerHTML =
    "피드백과 작업 카드가 쌓이면 다음 크리틱 준비안이나 포트폴리오 서사를 생성할 수 있습니다.";
}

function renderCriticPanel(plan) {
  els.outputPanel.className = "output-panel";
  els.outputPanel.innerHTML = `
    <span class="output-source">다음 크리틱 준비</span>
    <h3>다음 크리틱에서 보여줄 것</h3>
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
  els.outputPanel.className = "output-panel";
  els.outputPanel.innerHTML = `
    <span class="output-source">포트폴리오 서사</span>
    <h3>설계 발전 서사 초안</h3>
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
  const safeTags = toStringArray(tags);
  if (safeTags.length === 0) return "";
  return `<div class="tags">${safeTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function renderList(items, tagName = "ul") {
  const values = toStringArray(items);
  if (values.length === 0) return `<p class="muted">아직 생성된 항목이 없습니다.</p>`;
  return `<${tagName}>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tagName}>`;
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
    feedback.analysis = analysis;
    feedback.keywords = uniqueStrings([...feedback.keywords, ...analysis.categories]);
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
    showToast("피드백 분석과 작업 카드 생성을 완료했습니다.");
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
    showOutputNotice("다음 크리틱 준비안을 만들려면 먼저 피드백을 하나 이상 저장하고 분석해야 합니다.");
    showToast("다음 크리틱 준비를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true);
  try {
    let plan;
    try {
      plan = await requestJsonFromModel(buildCriticPlanPrompt(project), normalizeCriticPlan);
    } catch (error) {
      console.info("Critic prep AI generation failed. Using fallback.", error);
      plan = fallbackCriticPlan(project);
    }
    project.criticPlan = plan;
    project.updatedAt = nowIso();
    outputView = "critic";
    saveState();
    renderAll();
    showToast("다음 크리틱 준비 패널을 생성했습니다.");
  } finally {
    setBusy(false);
  }
}

async function handlePortfolioDraft() {
  const project = getActiveProject();
  if (!project || project.feedbacks.length === 0) {
    showOutputNotice("포트폴리오 서사를 만들려면 누적 피드백이나 완료된 작업 카드가 필요합니다.");
    showToast("포트폴리오 서사를 만들 피드백이 없습니다.");
    return;
  }
  setBusy(true);
  try {
    let draft;
    try {
      draft = await requestJsonFromModel(buildPortfolioPrompt(project), normalizePortfolioDraft);
    } catch (error) {
      console.info("Portfolio AI generation failed. Using fallback.", error);
      draft = fallbackPortfolioDraft(project);
    }
    project.portfolioDraft = draft;
    project.updatedAt = nowIso();
    outputView = "portfolio";
    saveState();
    renderAll();
    showToast("포트폴리오 서사 초안을 생성했습니다.");
  } finally {
    setBusy(false);
  }
}

async function analyzeFeedback(project, feedback) {
  try {
    return await requestJsonFromModel(buildAnalysisPrompt(project, feedback), normalizeAnalysis);
  } catch (error) {
    console.info("Feedback analysis AI generation failed. Using fallback.", error);
    if (aiClient && !aiClient.available) {
      showToast("Firebase 설정이 없어 Mock 분석 결과로 대체합니다.");
    } else {
      showToast("Gemini 호출에 실패해 Mock 분석 결과로 대체합니다.");
    }
    return fallbackAnalysis(project, feedback);
  }
}

async function requestJsonFromModel(prompt, normalizer) {
  const client = await aiClientPromise;
  if (!client.available) {
    throw new Error(client.message);
  }
  const result = await client.model.generateContent(prompt);
  const text = await extractResponseText(result);
  const parsed = parseJsonFromText(text);
  return normalizer(parsed);
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
너는 한국어에 최적화된 건축 설계 스튜디오 크리틱 정리 AI다.
피드백을 단순 요약하지 말고 설계자가 바로 실행할 수 있는 작업 리스트, 발표 문장, 다음 크리틱 체크리스트로 변환한다.
사용자가 말하지 않은 사실은 단정하지 말고 "확인이 필요함"으로 표현한다.
반드시 JSON 객체만 반환한다.

분류 카테고리:
${CATEGORIES.join(", ")}

JSON 스키마:
{
  "summary": "핵심 피드백 한두 문장 요약",
  "categories": ["카테고리"],
  "designIssue": "설계 문제가 무엇인지 설명",
  "actionItems": [
    {
      "title": "해야 할 작업",
      "priority": "high | normal | low",
      "category": "관련 카테고리",
      "reason": "왜 해야 하는지",
      "outputType": "평면도 / 단면도 / 다이어그램 / 발표문 / 패널"
    }
  ],
  "nextCriticChecklist": ["다음 크리틱에 보여줄 항목"],
  "presentationLines": ["발표 때 사용할 수 있는 문장"],
  "portfolioNarrative": "포트폴리오에 넣을 수 있는 설계 발전 서사",
  "riskQuestions": ["다시 물어볼 가능성이 높은 질문"]
}

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
카테고리: ${(feedback.analysis?.categories || feedback.keywords || []).join(", ")}
`,
    )
    .join("\n");
  const tasks = project.tasks
    .map(
      (task) =>
        `- [${STATUS_LABELS[task.status]}] ${task.title} / ${task.category} / ${PRIORITY_LABELS[task.priority]} / ${task.outputType}`,
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
  return {
    summary: `${feedback.source} 피드백의 핵심은 ${primary} 관점에서 ${topic}의 설계 논리를 더 명확히 보여주는 것입니다.`,
    categories,
    designIssue:
      "현재 피드백은 설계 의도와 실제 산출물 사이의 연결이 충분히 읽히지 않는 지점을 가리킵니다. 도면, 다이어그램, 발표 문장을 서로 맞물리게 정리할 필요가 있습니다.",
    actionItems: [
      {
        title: `${primary} 이슈를 한 장의 핵심 도면으로 다시 정리`,
        priority: feedback.importance === "high" ? "high" : "normal",
        category: primary,
        reason:
          "크리틱에서 지적된 문제가 실제 공간 구성에서 어떻게 해결되는지 바로 확인할 수 있어야 합니다.",
        outputType: primary.includes("단면") ? "단면도" : primary.includes("평면") ? "평면도" : "다이어그램",
      },
      {
        title: `${second} 관점의 전후 비교 다이어그램 작성`,
        priority: "normal",
        category: second,
        reason:
          "피드백 이전과 이후의 판단 변화를 시각적으로 보여주면 설계 발전 과정이 더 선명해집니다.",
        outputType: "다이어그램 / 패널",
      },
      {
        title: "피드백을 반영한 30초 발표 문장 정리",
        priority: "normal",
        category: "발표 논리",
        reason:
          "도면 수정 의도를 말로 압축해 두면 다음 크리틱에서 질문이 들어와도 답변 흐름이 흔들리지 않습니다.",
        outputType: "발표문",
      },
    ],
    nextCriticChecklist: [
      `${primary} 수정 전후가 보이는 핵심 도면`,
      "피드백을 반영한 설계 판단 다이어그램",
      "다음 질문에 답할 수 있는 짧은 발표 문장",
    ],
    presentationLines: [
      `이번 수정에서는 ${primary} 문제가 단순한 표현 문제가 아니라 설계 구조의 문제라고 보고, 도면과 발표 논리를 함께 조정했습니다.`,
      "피드백을 반영해 프로그램, 동선, 공간 경험이 서로 분리되지 않도록 다시 연결했습니다.",
    ],
    portfolioNarrative:
      "초기안은 개념 설명에 비해 도면에서 설계 판단이 충분히 드러나지 않았다. 크리틱 이후 피드백을 작업 단위로 나누고, 핵심 도면과 발표 논리를 함께 수정하면서 설계의 변화 과정이 더 읽히도록 발전시켰다.",
    riskQuestions: [
      "이 수정이 실제 공간 경험에서는 어떤 장면으로 드러나는가?",
      "기존 안과 비교했을 때 가장 크게 달라진 설계 판단은 무엇인가?",
    ],
  };
}

function inferCategories(text, keywords = []) {
  const source = `${text} ${keywords.join(" ")}`;
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
  return uniqueStrings([...keywords.filter((keyword) => CATEGORIES.includes(keyword)), ...found, "기타"]).slice(0, 5);
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
        project.tasks.map((task) => task.outputType).filter(Boolean),
      ),
    ).slice(0, 6),
    riskQuestions: uniqueStrings(analyses.flatMap((analysis) => analysis.riskQuestions)).slice(0, 5),
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
  return uniqueStrings(
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

function createNewProject() {
  const project = createProject({
    title: `새 건축 프로젝트 ${state.projects.length + 1}`,
  });
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  selectedFeedbackId = null;
  outputView = "critic";
  saveState();
  renderAll();
  showToast("새 프로젝트를 만들었습니다.");
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
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `studio-critic-ai-backup-${today()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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

function showOutputNotice(message) {
  els.outputPanel.className = "output-panel empty";
  els.outputPanel.innerHTML = escapeHtml(message);
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
