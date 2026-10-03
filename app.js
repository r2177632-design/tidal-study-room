const STORAGE_KEY = "tidal-study-room-final-v1";
const LEGACY_STORAGE_KEYS = ["tidal-study-room-v1"];
const FINAL_RELEASE_RESET_KEY = "tidal-study-room-final-reset-20261003150000";
const INSPECT_MODE = new URLSearchParams(window.location.search).get("qa");
const { createFarmGame } = window.TidalFarmGame;
const CHARACTER_MARKS = window.TidalCharacterMarks;

const CHARACTERS = window.TIDAL_CHARACTERS || [];
const ACTIVE_CHARACTERS = CHARACTERS.filter(
  (character) => character.artStatus !== "pending",
);
const STAGE_ART_IDS = new Set(["cute", "pretty", "collection"]);
const STAGE_IDLE_DELAYS_MS = [560, 560, 560, 240, 240, 240, 600, 1000];
const STAGE_IDLE_CACHE_LIMIT = 4;
const STAGE_IDLE_SPRITE_CACHE_LIMIT = 2;
const STAGE_IDLE_SPRITE_COLUMNS = 8;
const STAGE_IDLE_SPRITE_ROWS = 4;
const STAGE_IDLE_SPRITE_INTERVAL_MS = 125;
const COMPANION_TAB_LIMIT = 3;
const COLLECTION_PAGE_SIZE = 4;
const CHARACTER_FORM_THRESHOLDS = {
  cute: 1,
  pretty: 10,
  collection: 20,
};
const CHARACTER_FORM_IDS = ["cute", "pretty", "collection"];
const CHARACTER_FORM_LABELS = {
  cute: "幼态",
  pretty: "鲸歌",
  collection: "典藏",
};
const CHARACTER_MAX_MARKS = Math.max(...Object.values(CHARACTER_FORM_THRESHOLDS));
const PERFECT_SETTLEMENT_INTERVAL_MS = 30_000;
const USE_MOBILE_ASSETS = window.matchMedia(
  "(max-width: 820px), (pointer: coarse)",
).matches;

function characterMarkMarkup(character, size = "md", extraClass = "") {
  return CHARACTER_MARKS?.markup(character, size, extraClass) || "";
}

const ICONS = {
  done: "circle-check",
  miss: "circle-x",
  delete: "trash-2",
  pending: "circle",
};

const elements = {
  app: document.querySelector("#app"),
  iosInstallTip: document.querySelector("#iosInstallTip"),
  iosInstallDismiss: document.querySelector("#iosInstallDismiss"),
  weekdayLabel: document.querySelector("#weekdayLabel"),
  dateLabel: document.querySelector("#dateLabel"),
  progressRing: document.querySelector("#progressRing"),
  progressValue: document.querySelector("#progressValue"),
  progressCopy: document.querySelector("#progressCopy"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskList: document.querySelector("#taskList"),
  taskCount: document.querySelector("#taskCount"),
  emptyState: document.querySelector("#emptyState"),
  suggestionRow: document.querySelector("#suggestionRow"),
  clearCompleted: document.querySelector("#clearCompleted"),
  perfectMarkButton: document.querySelector("#perfectMarkButton"),
  perfectMarkButtonLabel: document.querySelector("#perfectMarkButtonLabel"),
  markChoiceOverlay: document.querySelector("#markChoiceOverlay"),
  markChoiceClose: document.querySelector("#markChoiceClose"),
  markChoiceGrid: document.querySelector("#markChoiceGrid"),
  markChoiceTitle: document.querySelector("#markChoiceTitle"),
  markChoiceCopy: document.querySelector("#markChoiceCopy"),
  markChoiceNote: document.querySelector("#markChoiceNote"),
  stageTitle: document.querySelector("#stageTitle"),
  stageSubtitle: document.querySelector("#stageSubtitle"),
  portraitImage: document.querySelector("#portraitImage"),
  portraitLayer: document.querySelector("#portraitLayer"),
  selectedRole: document.querySelector("#selectedRole"),
  selectedState: document.querySelector("#selectedState"),
  companionTabs: document.querySelector("#companionTabs"),
  stageAction: document.querySelector(".stage-action"),
  whaleTokenCount: document.querySelector("#whaleTokenCount"),
  mergeHint: document.querySelector("#mergeHint"),
  mergeButton: document.querySelector("#mergeButton"),
  mergeButtonLabel: document.querySelector("#mergeButtonLabel"),
  collectionGrid: document.querySelector("#collectionGrid"),
  collectionViewport: document.querySelector("#collectionViewport"),
  collectionPage: document.querySelector("#collectionPage"),
  collectionPrev: document.querySelector("#collectionPrev"),
  collectionNext: document.querySelector("#collectionNext"),
  collectionCount: document.querySelector("#collectionCount"),
  growthPercent: document.querySelector("#growthPercent"),
  depthFill: document.querySelector("#depthFill"),
  growthCopy: document.querySelector("#growthCopy"),
  perfectDays: document.querySelector("#perfectDays"),
  streakDays: document.querySelector("#streakDays"),
  bigWhaleCount: document.querySelector("#bigWhaleCount"),
  statusBeacon: document.querySelector("#statusBeacon"),
  statusCopy: document.querySelector("#statusCopy"),
  toastRegion: document.querySelector("#toastRegion"),
  focusButton: document.querySelector("#focusButton"),
  soundButton: document.querySelector("#soundButton"),
  focusDock: document.querySelector("#focusDock"),
  focusTaskTitle: document.querySelector("#focusTaskTitle"),
  focusTimer: document.querySelector("#focusTimer"),
  focusComplete: document.querySelector("#focusComplete"),
  focusSkip: document.querySelector("#focusSkip"),
  mergeOverlay: document.querySelector("#mergeOverlay"),
  mergeClose: document.querySelector("#mergeClose"),
  mergeConfirm: document.querySelector("#mergeConfirm"),
  mergeTrio: document.querySelector("#mergeTrio"),
  mergeTitle: document.querySelector("#mergeTitle"),
  mergeDescription: document.querySelector("#mergeDescription"),
  stageViewport: document.querySelector("#stageViewport"),
  characterPending: document.querySelector("#characterPending"),
  hatchMedals: document.querySelector("#hatchMedals"),
  tideHistory: document.querySelector("#tideHistory"),
  viewTabs: document.querySelector(".view-tabs"),
  planForm: document.querySelector("#planForm"),
  planTitle: document.querySelector("#planTitle"),
  planRepeat: document.querySelector("#planRepeat"),
  planInterval: document.querySelector("#planInterval"),
  planIntervalField: document.querySelector("#planIntervalField"),
  planWeekdayField: document.querySelector("#planWeekdayField"),
  planStartDate: document.querySelector("#planStartDate"),
  planEndDate: document.querySelector("#planEndDate"),
  planStartTime: document.querySelector("#planStartTime"),
  planEndTime: document.querySelector("#planEndTime"),
  planEstimate: document.querySelector("#planEstimate"),
  planDeadline: document.querySelector("#planDeadline"),
  planCategory: document.querySelector("#planCategory"),
  planSubmit: document.querySelector("#planSubmit"),
  planReset: document.querySelector("#planReset"),
  planCount: document.querySelector("#planCount"),
  planList: document.querySelector("#planList"),
  weekGrid: document.querySelector("#weekGrid"),
  farmRoot: document.querySelector("#farmRoot"),
};

let state = loadState();
let currentArt = "cute";
let currentScreen = "today";
let farmGame = null;
let audioController = null;
let focusSession = null;
let editingPlanId = null;
let stageIdleTimer = null;
let stageIdleFrame = 0;
let stageIdleRunId = 0;
let stageIdleLayerElements = [];
let stageIdleCanvas = null;
let stageIdleSpriteImage = null;
let stageTransitionTimer = null;
let taskConfirmId = null;
let companionTabsExpanded = false;
let collectionPageIndex = 0;
let collectionFocusCharacterId = "";
let pointerLightLayer = null;
let pointerLightInitialized = false;
let lastPointerSparkAt = 0;
const stageIdleFrameCache = new Map();
const stageIdleSpriteCache = new Map();

const POINTER_LIGHT_SELECTOR = [
  ".view-tabs button",
  ".topbar-actions .quiet-button",
  ".task-panel .task-composer",
  ".task-panel .task-item",
  ".task-panel .task-check",
  ".task-panel .icon-button",
  ".stage-panel .view-switch button",
  ".stage-panel .companion-tab",
  ".plan-editor-panel .plan-field input",
  ".plan-editor-panel .plan-field select",
  ".plan-editor-panel .weekday-field label",
  ".plan-editor-panel .plan-submit",
  ".plan-editor-panel .quiet-button",
  ".plan-overview-panel .week-day",
  ".plan-overview-panel .plan-card",
  ".plan-overview-panel .plan-card-actions button",
  ".mark-choice-grid .mark-choice-card",
].join(",");

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function normalizeDayProgress(day) {
  if (!day || typeof day !== "object") return {};
  day.tasks = Array.isArray(day.tasks) ? day.tasks : [];
  day.perfect = Boolean(day.perfect && day.tasks.length);
  day.perfectSettledAt = Number(day.perfectSettledAt) || null;
  day.perfectMarkGranted = Boolean(day.perfectMarkGranted);
  day.perfectFarmRewarded = Boolean(day.perfectFarmRewarded);
  day.suppressedPlanIds = Array.isArray(day.suppressedPlanIds)
    ? day.suppressedPlanIds
    : [];
  day.hiddenCompletedTaskIds = Array.isArray(day.hiddenCompletedTaskIds)
    ? day.hiddenCompletedTaskIds
    : [];
  day.perfectMarkChoicePending = Boolean(day.perfectMarkChoicePending);
  day.perfectMarkClaimed = Boolean(day.perfectMarkClaimed);
  return day;
}

function createInitialState() {
  return {
    version: 4,
    days: {},
    plans: [],
    characterMarks: {},
    characterMarksInitialized: false,
    perfectMarkQueue: [],
    perfectMarkHistory: [],
    focusSessions: [],
    selectedCharacterId: "deep-current",
    mergedTokens: 0,
    synthesizedBigWhales: 0,
    synthesizedCards: 0,
    soundEnabled: false,
    farm: null,
  };
}

function clearLegacyState() {
  if (INSPECT_MODE) return;
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  if (localStorage.getItem(FINAL_RELEASE_RESET_KEY) === "1") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(FINAL_RELEASE_RESET_KEY, "1");
}

function loadState() {
  try {
    clearLegacyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const freshState = createInitialState();
      initializeCharacterProgress(freshState);
      return freshState;
    }
    const parsed = JSON.parse(raw);
    const normalized = {
      ...createInitialState(),
      ...parsed,
      days:
        parsed.days && typeof parsed.days === "object"
          ? Object.fromEntries(
              Object.entries(parsed.days).map(([date, day]) => [
                date,
                normalizeDayProgress(day),
              ]),
            )
          : {},
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      characterMarks:
        parsed.characterMarks && typeof parsed.characterMarks === "object"
          ? { ...parsed.characterMarks }
          : {},
      characterMarksInitialized: Boolean(parsed.characterMarksInitialized),
      perfectMarkQueue: Array.isArray(parsed.perfectMarkQueue)
        ? [
            ...new Set(
              parsed.perfectMarkQueue
                .map(String)
                .filter((dateKey) => isDateKey(dateKey)),
            ),
          ].sort()
        : [],
      perfectMarkHistory: Array.isArray(parsed.perfectMarkHistory)
        ? parsed.perfectMarkHistory
            .filter((entry) => entry && typeof entry === "object")
            .map((entry) => ({
              dateKey: isDateKey(entry.dateKey) ? entry.dateKey : "",
              characterId: String(entry.characterId || ""),
              selectedAt: Number(entry.selectedAt) || Date.now(),
            }))
        : [],
      focusSessions: Array.isArray(parsed.focusSessions)
        ? parsed.focusSessions
            .filter((session) => session && session.completedAt)
            .map((session) => ({
              id: String(session.id || createId()),
              date: String(session.date || ""),
              taskId: session.taskId ? String(session.taskId) : null,
              taskTitle: String(session.taskTitle || ""),
              minutes: Math.max(1, Number(session.minutes) || 25),
              completedAt: Number(session.completedAt) || Date.now(),
            }))
        : [],
      synthesizedCards:
        Number(parsed.synthesizedCards) || Number(parsed.synthesizedBigWhales) || 0,
    };
    const changed =
      initializeCharacterProgress(normalized) || ensureCharacterAssignments(normalized);
    if (changed && !INSPECT_MODE) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    const freshState = createInitialState();
    initializeCharacterProgress(freshState);
    return freshState;
  }
}

function saveState() {
  if (INSPECT_MODE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureToday() {
  const key = todayKey();
  let changed = false;
  if (!state.days[key]) {
    state.days[key] = normalizeDayProgress({});
    changed = true;
  }
  const beforeNormalize = JSON.stringify(state.days[key]);
  normalizeDayProgress(state.days[key]);
  if (JSON.stringify(state.days[key]) !== beforeNormalize) changed = true;
  changed = syncPlanTasks(state.days[key], key) || changed;
  if (changed) saveState();
  return state.days[key];
}

function dayIsComplete(day) {
  return Boolean(
    day?.tasks?.length &&
      day.tasks.every((task) => task.status === "done"),
  );
}

function settlePastPerfectDays() {
  const currentDateKey = todayKey();
  const queue = Array.isArray(state.perfectMarkQueue)
    ? [...new Set(state.perfectMarkQueue.filter(isDateKey))]
    : [];
  const queuedDates = new Set(queue);
  const settledDates = [];
  const perfectDates = [];
  let changed = false;

  Object.entries(state.days || {}).forEach(([dateKey, day]) => {
    if (!isDateKey(dateKey) || !day || typeof day !== "object") return;

    if (dateKey >= currentDateKey) {
      if (
        dateKey === currentDateKey &&
        !day.perfectSettledAt &&
        (day.perfect || day.perfectMarkChoicePending)
      ) {
        day.perfect = false;
        day.perfectMarkChoicePending = false;
        changed = true;
      }
      return;
    }

    if (day.perfectSettledAt) {
      if (day.perfect && !day.perfectMarkGranted) {
        day.perfectMarkGranted = true;
        if (!day.perfectMarkClaimed && !queuedDates.has(dateKey)) {
          queuedDates.add(dateKey);
        }
        changed = true;
      }
      return;
    }

    const perfect = dayIsComplete(day);
    day.perfectSettledAt = Date.now();
    day.perfect = perfect;
    day.perfectMarkChoicePending = false;
    changed = true;
    settledDates.push(dateKey);
    if (perfect) {
      day.perfectMarkGranted = true;
      if (!day.perfectMarkClaimed) queuedDates.add(dateKey);
      perfectDates.push(dateKey);
    }
  });

  const nextQueue = [...queuedDates].sort();
  if (JSON.stringify(nextQueue) !== JSON.stringify(state.perfectMarkQueue || [])) {
    state.perfectMarkQueue = nextQueue;
    changed = true;
  }
  if (changed) saveState();
  return { changed, settledDates, perfectDates };
}

function syncPerfectFarmRewards() {
  if (!farmGame) return { changed: false, rewardedDates: [] };
  let changed = false;
  const rewardedDates = [];
  Object.entries(state.days || {}).forEach(([dateKey, day]) => {
    if (!day?.perfect || !day.perfectSettledAt || day.perfectFarmRewarded) return;
    const reward = farmGame.rewardPerfectDay(dateKey);
    day.perfectFarmRewarded = true;
    changed = true;
    if (reward) rewardedDates.push(dateKey);
  });
  if (changed) saveState();
  return { changed, rewardedDates };
}

function notifyPerfectSettlement(settlement) {
  if (!settlement?.settledDates?.length) return;
  const perfectCount = settlement.perfectDates.length;
  const dateCopy = settlement.perfectDates
    .slice(0, 3)
    .map((dateKey) => dateKey.slice(5).replace("-", "/"))
    .join("、");
  showToast({
    title: "午夜结算完成",
    message: perfectCount
      ? `${perfectCount} 个全清日已结算${
          dateCopy ? `（${dateCopy}${perfectCount > 3 ? " 等" : ""}）` : ""
        }，印记已存入待选区，可随时领取。`
      : `${settlement.settledDates.length} 个日期已结算，本日未达到全清条件。`,
    tone: perfectCount ? "success" : "neutral",
    icon: perfectCount ? "stamp" : "moon",
  });
}

function runPerfectSettlement({ render = false, notify = false } = {}) {
  const settlement = settlePastPerfectDays();
  const farmRewards = syncPerfectFarmRewards();
  const streakReward = settlement.perfectDates.length
    ? farmGame?.rewardStreakMilestone(getMetrics().streak) || null
    : null;
  const changed =
    settlement.changed ||
    farmRewards.changed ||
    Boolean(streakReward);

  if (render && changed) renderAll();

  if (notify) notifyPerfectSettlement(settlement);

  return { ...settlement, farmRewards, streakReward, changed };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function companionById(characterId) {
  return ACTIVE_CHARACTERS.find((character) => character.id === characterId) || null;
}

function randomCompanion() {
  if (!ACTIVE_CHARACTERS.length) return null;
  return ACTIVE_CHARACTERS[Math.floor(Math.random() * ACTIVE_CHARACTERS.length)];
}

function ensureCharacterId(owner) {
  if (companionById(owner?.characterId)) return false;
  const companion = randomCompanion();
  if (!owner || !companion) return false;
  owner.characterId = companion.id;
  return true;
}

function ensureCharacterAssignments(targetState) {
  let changed = false;
  if (!targetState.characterMarks || typeof targetState.characterMarks !== "object") {
    targetState.characterMarks = {};
    changed = true;
  }
  Object.values(targetState.days || {}).forEach((day) => {
    (day.tasks || []).forEach((task) => {
      changed = ensureCharacterId(task) || changed;
    });
  });
  return changed;
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function companionForPlanDate(planId, dateKey) {
  if (!ACTIVE_CHARACTERS.length) return null;
  const index = hashText(`${planId}:${dateKey}`) % ACTIVE_CHARACTERS.length;
  return ACTIVE_CHARACTERS[index];
}

function legacyPerfectDayCount(targetState) {
  return Object.entries(targetState.days || {}).filter(
    ([, day]) => day.perfect && day.tasks?.length,
  ).length;
}

function initializeCharacterProgress(targetState) {
  let changed = false;
  if (!targetState.characterMarks || typeof targetState.characterMarks !== "object") {
    targetState.characterMarks = {};
    changed = true;
  }
  if (!targetState.characterMarksInitialized) {
    const legacyUnlockedCount = Math.min(
      ACTIVE_CHARACTERS.length,
      Math.floor(
        legacyPerfectDayCount(targetState) /
          CHARACTER_FORM_THRESHOLDS.pretty,
      ),
    );
    ACTIVE_CHARACTERS.slice(0, legacyUnlockedCount).forEach((character) => {
      targetState.characterMarks[character.id] = Math.max(
        CHARACTER_FORM_THRESHOLDS.collection,
        Number(targetState.characterMarks[character.id]) || 0,
      );
    });
    targetState.characterMarksInitialized = true;
    changed = true;
  }
  ACTIVE_CHARACTERS.forEach((character) => {
    const normalizedMarks = Math.max(
      0,
      Math.floor(Number(targetState.characterMarks[character.id]) || 0),
    );
    if (targetState.characterMarks[character.id] !== normalizedMarks) {
      targetState.characterMarks[character.id] = normalizedMarks;
      changed = true;
    }
  });
  return changed;
}

function characterMarkCount(characterId, targetState = state) {
  return Math.max(0, Math.floor(Number(targetState.characterMarks?.[characterId]) || 0));
}

function unlockedFormsForMarkCount(character, marks) {
  return CHARACTER_FORM_IDS.filter((form) => {
    if (character.id === "deep-current" && form === "cute") return true;
    return marks >= CHARACTER_FORM_THRESHOLDS[form];
  });
}

function awardCharacterMark(characterId, amount = 1) {
  const character = companionById(characterId);
  if (!character) return null;
  if (!state.characterMarks || typeof state.characterMarks !== "object") {
    state.characterMarks = {};
  }
  const before = characterMarkCount(character.id);
  const after = Math.min(
    CHARACTER_MAX_MARKS,
    before + Math.max(1, Math.floor(Number(amount) || 1)),
  );
  state.characterMarks[character.id] = after;
  const beforeForms = unlockedFormsForMarkCount(character, before);
  const afterForms = unlockedFormsForMarkCount(character, after);
  return {
    character,
    before,
    after,
    added: Math.max(0, after - before),
    beforeForms,
    afterForms,
    newForms: afterForms.filter((form) => !beforeForms.includes(form)),
    unlockedNow: afterForms.some((form) => !beforeForms.includes(form)),
  };
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function planMatchesDate(plan, dateKey) {
  if (!plan || plan.paused) return false;
  if (plan.startDate && dateKey < plan.startDate) return false;
  if (plan.endDate && dateKey > plan.endDate) return false;

  const date = new Date(`${dateKey}T12:00:00`);
  const repeat = plan.repeat || "daily";
  if (repeat === "once") return dateKey === plan.startDate;
  if (repeat === "weekdays") return date.getDay() >= 1 && date.getDay() <= 5;
  if (repeat === "weekly") {
    return (plan.weekdays || []).map(Number).includes(date.getDay());
  }
  if (repeat === "interval") {
    const start = new Date(`${plan.startDate}T12:00:00`);
    const dayDistance = Math.round((date - start) / 86400000);
    return dayDistance >= 0 && dayDistance % Math.max(1, Number(plan.interval) || 1) === 0;
  }
  return true;
}

function syncPlanTasks(day, dateKey) {
  const before = JSON.stringify(day.tasks || []);
  const matchingPlans = state.plans.filter((plan) => planMatchesDate(plan, dateKey));
  const suppressedIds = new Set(day.suppressedPlanIds || []);
  const matchingIds = new Set(matchingPlans.map((plan) => plan.id));

  day.tasks = (day.tasks || []).filter(
    (task) =>
      !task.planId ||
      task.status === "done" ||
      matchingIds.has(task.planId),
  );

  matchingPlans.forEach((plan, index) => {
    if (suppressedIds.has(plan.id)) return;
    const companion =
      companionForPlanDate(plan.id, dateKey) || randomCompanion();
    const existing = day.tasks.find((task) => task.planId === plan.id);
    const planTask = {
      title: plan.title,
      status: "pending",
      timeStart: plan.timeStart || "",
      timeEnd: plan.timeEnd || "",
      estimateMinutes: Number(plan.estimateMinutes) || 0,
      deadline: plan.deadline || "",
      category: plan.category || "学习",
      planId: plan.id,
      source: "plan",
      characterId: companion?.id || "",
      order: index,
    };

    if (existing && existing.status !== "done") {
      Object.assign(existing, planTask);
      return;
    }

    if (!existing) {
      day.tasks.push({
        id: createId(),
        createdAt: Date.now(),
        ...planTask,
      });
    }
  });
  return before !== JSON.stringify(day.tasks);
}

function getMetrics() {
  const learningDates = new Set();
  Object.entries(state.days).forEach(([date, day]) => {
    if (day.tasks?.some((task) => task.status === "done")) {
      learningDates.add(date);
    }
  });
  (state.focusSessions || []).forEach((session) => {
    if (session.date) learningDates.add(session.date);
  });
  const perfectDates = Object.entries(state.days)
    .filter(([, day]) => day.perfect && day.tasks?.length)
    .map(([date]) => date)
    .sort();

  // 检查模式（?qa=1 / ?qa=all）直接按满进度计算，方便一次看完 20 位伙伴与三种形态。
  const perfectDays =
    perfectDates.length + (INSPECT_MODE ? ACTIVE_CHARACTERS.length * 3 : 0);
  const characterMarks = {};
  const unlockedFormsByCharacter = {};
  ACTIVE_CHARACTERS.forEach((character) => {
    const marks = INSPECT_MODE
      ? CHARACTER_MAX_MARKS
      : characterMarkCount(character.id);
    characterMarks[character.id] = marks;
    unlockedFormsByCharacter[character.id] = unlockedFormsForMarkCount(
      character,
      marks,
    );
  });
  const unlockedCharacterIds = ACTIVE_CHARACTERS.filter((character) =>
    unlockedFormsByCharacter[character.id].includes("cute"),
  ).map((character) => character.id);
  const beautifulCharacterIds = ACTIVE_CHARACTERS.filter((character) =>
    unlockedFormsByCharacter[character.id].includes("pretty"),
  ).map((character) => character.id);
  const collectionCharacterIds = ACTIVE_CHARACTERS.filter((character) =>
    unlockedFormsByCharacter[character.id].includes("collection"),
  ).map((character) => character.id);
  const unlockedCount = unlockedCharacterIds.length;
  const beautifulCount = beautifulCharacterIds.length;
  const formUnlockCount = ACTIVE_CHARACTERS.reduce(
    (total, character) =>
      total + unlockedFormsByCharacter[character.id].length,
    0,
  );
  const formCapacity = ACTIVE_CHARACTERS.length * CHARACTER_FORM_IDS.length;
  const lockedForms = [];
  ACTIVE_CHARACTERS.forEach((character, characterIndex) => {
    CHARACTER_FORM_IDS.forEach((form, formIndex) => {
      if (unlockedFormsByCharacter[character.id].includes(form)) return;
      const marks = characterMarks[character.id] || 0;
      lockedForms.push({
        character,
        characterIndex,
        form,
        formIndex,
        label: CHARACTER_FORM_LABELS[form],
        threshold: CHARACTER_FORM_THRESHOLDS[form],
        marks,
        remaining: Math.max(0, CHARACTER_FORM_THRESHOLDS[form] - marks),
      });
    });
  });
  const nextForm =
    [...lockedForms].sort((left, right) => {
      if (left.remaining !== right.remaining) return left.remaining - right.remaining;
      if (left.formIndex !== right.formIndex) return left.formIndex - right.formIndex;
      return left.characterIndex - right.characterIndex;
    })[0] || null;
  const marksToNext = nextForm?.remaining || 0;
  const nextCharacter = nextForm?.character || null;
  const nextCharacterMarkCount = nextCharacter
    ? characterMarks[nextCharacter.id]
    : 0;
  const totalCharacterMarks = ACTIVE_CHARACTERS.reduce(
    (total, character) =>
      total + Math.min(CHARACTER_MAX_MARKS, characterMarks[character.id]),
    0,
  );
  const cardCapacity = Math.floor(ACTIVE_CHARACTERS.length / 3);
  const archivedCards = Math.min(
    cardCapacity,
    Math.max(0, Number(state.synthesizedCards) || 0),
  );
  const unarchivedBeautifulCount = Math.max(
    0,
    beautifulCount - archivedCards * 3,
  );
  const cardReady = unarchivedBeautifulCount >= 3;
  const cardProgress = cardReady ? 3 : unarchivedBeautifulCount;
  const nextCardProgress = cardProgress;

  return {
    perfectDates,
    perfectDays,
    beautifulCount,
    beautifulCharacterIds,
    collectionCharacterIds,
    unlockedCount,
    unlockedCharacterIds,
    unlockedFormsByCharacter,
    characterMarks,
    totalCharacterMarks,
    characterMarkCapacity: ACTIVE_CHARACTERS.length * CHARACTER_MAX_MARKS,
    formUnlockCount,
    formCapacity,
    formProgress: formCapacity ? formUnlockCount / formCapacity : 0,
    cardProgress,
    nextCardProgress,
    cardReady,
    mergeReady: cardReady,
    cardCapacity,
    archivedCards,
    allCardsArchived: cardCapacity > 0 && archivedCards >= cardCapacity,
    cardRemaining: cardReady ? 0 : 3 - cardProgress,
    nextForm,
    nextCharacter,
    nextCharacterMarkCount,
    marksToNext,
    daysToNext: marksToNext,
    streak: calculateStreak(perfectDates),
    learningDates: [...learningDates].sort(),
    learningDays: learningDates.size,
    focusSessions: (state.focusSessions || []).length,
    focusMinutes: (state.focusSessions || []).reduce(
      (total, session) => total + Math.max(0, Number(session.minutes) || 0),
      0,
    ),
    totalTasksCompleted: Object.values(state.days).reduce(
      (total, day) =>
        total + (day.tasks || []).filter((task) => task.status === "done").length,
      0,
    ),
  };
}

function calculateStreak(perfectDates) {
  if (!perfectDates.length) return 0;

  const perfectSet = new Set(perfectDates);
  const cursor = new Date(`${todayKey()}T12:00:00`);

  if (!perfectSet.has(formatDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (perfectSet.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function selectedCharacter() {
  return (
    CHARACTERS.find((character) => character.id === state.selectedCharacterId) ||
    CHARACTERS[0]
  );
}

function characterIsUnlocked(character, metrics = getMetrics(), form = "cute") {
  if (character.artStatus === "pending") return false;
  const unlockedForms = metrics.unlockedFormsByCharacter?.[character.id];
  if (Array.isArray(unlockedForms)) return unlockedForms.includes(form);
  return unlockedFormsForMarkCount(
    character,
    metrics.characterMarks?.[character.id] || 0,
  ).includes(form);
}

function characterUnlockMarks(character, metrics = getMetrics(), form = "cute") {
  return Math.max(
    0,
    CHARACTER_FORM_THRESHOLDS[form] -
      (metrics.characterMarks?.[character.id] || 0),
  );
}

function deepestUnlockedForm(character, metrics = getMetrics()) {
  const unlockedForms = metrics.unlockedFormsByCharacter?.[character.id] || [];
  return [...CHARACTER_FORM_IDS].reverse().find((form) => unlockedForms.includes(form)) || "";
}

function characterArtSource(character, art) {
  if (art === "cute") return character.cuteImage || character.image;
  if (art === "pretty") return character.prettyImage || character.image;
  return character.image;
}

function stopStageIdle() {
  stageIdleRunId += 1;
  window.clearInterval(stageIdleTimer);
  stageIdleTimer = null;
  stageIdleLayerElements.forEach((layer) => layer.remove());
  stageIdleLayerElements = [];
  stageIdleCanvas?.remove();
  stageIdleCanvas = null;
  stageIdleSpriteImage = null;
  elements.portraitLayer.classList.remove("is-frame-stack", "is-idle-sprite");
  elements.portraitImage.hidden = false;
  elements.portraitImage.classList.remove("is-frame-idle");
}

function preloadStageIdleSprite(source) {
  if (stageIdleSpriteCache.has(source)) {
    return stageIdleSpriteCache.get(source);
  }
  const pending = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const decoded = image.decode ? image.decode() : Promise.resolve();
      decoded.catch(() => {}).finally(() => resolve(image));
    };
    image.onerror = () => resolve(null);
    image.src = source;
  });
  stageIdleSpriteCache.set(source, pending);
  while (stageIdleSpriteCache.size > STAGE_IDLE_SPRITE_CACHE_LIMIT) {
    stageIdleSpriteCache.delete(stageIdleSpriteCache.keys().next().value);
  }
  return pending;
}

function drawStageIdleSprite() {
  if (!stageIdleCanvas || !stageIdleSpriteImage) return;
  const frameCount = STAGE_IDLE_SPRITE_COLUMNS * STAGE_IDLE_SPRITE_ROWS;
  const frame = stageIdleFrame % frameCount;
  const cellWidth = stageIdleCanvas.width;
  const cellHeight = stageIdleCanvas.height;
  const sourceX = (frame % STAGE_IDLE_SPRITE_COLUMNS) * cellWidth;
  const sourceY = Math.floor(frame / STAGE_IDLE_SPRITE_COLUMNS) * cellHeight;
  const context = stageIdleCanvas.getContext("2d");
  context.clearRect(0, 0, cellWidth, cellHeight);
  context.drawImage(
    stageIdleSpriteImage,
    sourceX,
    sourceY,
    cellWidth,
    cellHeight,
    0,
    0,
    cellWidth,
    cellHeight,
  );
}

function mountStageIdleCanvas(image) {
  if (!image) return false;
  const canvas = document.createElement("canvas");
  canvas.className = "portrait-idle-canvas";
  canvas.width = Math.round(image.naturalWidth / STAGE_IDLE_SPRITE_COLUMNS);
  canvas.height = Math.round(image.naturalHeight / STAGE_IDLE_SPRITE_ROWS);
  canvas.setAttribute("aria-hidden", "true");
  elements.portraitLayer.insertBefore(canvas, elements.portraitImage);
  elements.portraitImage.hidden = true;
  elements.portraitLayer.classList.add("is-idle-sprite");
  stageIdleCanvas = canvas;
  stageIdleSpriteImage = image;
  drawStageIdleSprite();
  return true;
}

function mountStageIdleStack(frames, images) {
  if (images.some((image) => !image)) return false;
  stageIdleLayerElements = images.map((image, index) => {
    image.className = "portrait-idle-layer";
    image.alt = index === 0 ? elements.portraitImage.alt : "";
    image.setAttribute("aria-hidden", index === 0 ? "false" : "true");
    image.dataset.frameIndex = String(index);
    elements.portraitLayer.insertBefore(image, elements.portraitImage);
    return image;
  });
  elements.portraitImage.hidden = true;
  elements.portraitLayer.classList.add("is-frame-stack");
  return true;
}

function showStageIdleFrame(index) {
  stageIdleLayerElements.forEach((layer, layerIndex) => {
    layer.classList.toggle("is-visible", layerIndex === index);
  });
}

function stageIdleSources(character, art) {
  if (art === "cute" && character.idleFrames?.length) return character.idleFrames;
  const source = characterArtSource(character, art);
  return source ? [source] : [];
}

function preloadStageIdleFrames(frames) {
  const cacheKey = frames.join("|");
  if (stageIdleFrameCache.has(cacheKey)) {
    return stageIdleFrameCache.get(cacheKey);
  }
  const pending = Promise.all(
    frames.map(
      (source) =>
        new Promise((resolve) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => {
            const decoded = image.decode ? image.decode() : Promise.resolve();
            decoded.catch(() => {}).finally(() => resolve(image));
          };
          image.onerror = () => resolve(null);
          image.src = source;
        }),
    ),
  );
  stageIdleFrameCache.set(cacheKey, pending);
  while (stageIdleFrameCache.size > STAGE_IDLE_CACHE_LIMIT) {
    stageIdleFrameCache.delete(stageIdleFrameCache.keys().next().value);
  }
  return pending;
}

function startStageIdle(character) {
  stopStageIdle();
  const art = currentArt;
  const frames = stageIdleSources(character, art);
  if (!frames.length) return;
  const runId = stageIdleRunId;
  const useIdleSprite =
    art === "cute" && Boolean(character.idleSprite) && !USE_MOBILE_ASSETS;
  const fallbackSource =
    useIdleSprite
      ? character.cuteImage || characterArtSource(character, art)
      : frames[0];
  elements.portraitImage.src = fallbackSource;
  elements.portraitImage.classList.toggle(
    "is-frame-idle",
    art === "cute" && frames.length > 0,
  );
  if (useIdleSprite) {
    preloadStageIdleSprite(character.idleSprite).then((image) => {
      if (
        runId !== stageIdleRunId ||
        currentArt !== art
      ) {
        return;
      }
      stageIdleFrame = 0;
      if (!mountStageIdleCanvas(image)) {
        elements.portraitImage.src = frames[0];
        return;
      }
      stageIdleTimer = window.setInterval(() => {
        if (
          currentScreen !== "today" ||
          currentArt !== art ||
          document.hidden
        ) {
          return;
        }
        stageIdleFrame =
          (stageIdleFrame + 1) %
          (STAGE_IDLE_SPRITE_COLUMNS * STAGE_IDLE_SPRITE_ROWS);
        drawStageIdleSprite();
      }, STAGE_IDLE_SPRITE_INTERVAL_MS);
    });
    return;
  }
  if (frames.length === 1) return;
  const delays =
    frames.length === STAGE_IDLE_DELAYS_MS.length
      ? STAGE_IDLE_DELAYS_MS
      : Array.from({ length: frames.length }, () => 620);
  preloadStageIdleFrames(frames).then((images) => {
    if (
      runId !== stageIdleRunId ||
      currentArt !== art
    ) {
      return;
    }
    stageIdleFrame = 0;
    if (!stageIdleLayerElements.length) {
      if (!mountStageIdleStack(frames, Array.isArray(images) ? images : [])) {
        elements.portraitImage.src = frames[0];
      }
    }
    showStageIdleFrame(0);
    const advanceFrame = () => {
      stageIdleTimer = window.setTimeout(() => {
        if (currentArt !== art) return;
        stageIdleFrame = (stageIdleFrame + 1) % frames.length;
        showStageIdleFrame(stageIdleFrame);
        advanceFrame();
      }, delays[stageIdleFrame]);
    };
    advanceFrame();
  });
}

function transitionStage(update) {
  window.clearTimeout(stageTransitionTimer);
  elements.portraitLayer.classList.add("is-switching");
  stageTransitionTimer = window.setTimeout(() => {
    update();
    window.requestAnimationFrame(() => {
      elements.portraitLayer.classList.remove("is-switching");
    });
  }, 150);
}

function pointerLightAllowed(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest(".mark-choice-overlay")) return true;
  if (target.closest(".view-tabs, .topbar-actions")) {
    return currentScreen !== "farm";
  }
  const panel = target.closest(".screen-panel");
  return Boolean(
    panel?.classList.contains("is-active") &&
      ["today", "plans"].includes(panel.dataset.screenPanel),
  );
}

function pointerLightPalette(target) {
  const planCard = target.closest(".plan-card");
  const category = planCard?.dataset.category || "";
  if (category === "阅读") return ["#f4d58d", "#c7f0e6", "#8fbaf0"];
  if (category === "运动" || target.closest('[data-status="missed"], [data-action="delete"]')) {
    return ["#ff9f8f", "#f3c5a3", "#7de6e3"];
  }
  if (category === "复习") return ["#8bd9ae", "#bee8d0", "#7de6e3"];
  if (category === "其他") return ["#b3bdff", "#8cd9e8", "#f3cc78"];
  if (
    target.closest(
      ".plan-overview-panel, .plan-submit, .view-tabs button.is-active, .companion-expand",
    )
  ) {
    return ["#f3cc78", "#8ee4dc", "#8fbdf2"];
  }
  return ["#7de6e3", "#8fbdf2", "#d9f6f3"];
}

function updatePointerGlow(target, event) {
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
  target.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
}

function spawnLightParticle(
  x,
  y,
  {
    dx = 0,
    dy = 0,
    color = "#7de6e3",
    size = 3,
    duration = 560,
    delay = 0,
    diamond = false,
  } = {},
) {
  if (!pointerLightLayer) return;
  const particle = document.createElement("i");
  particle.className = `pointer-light-particle ${diamond ? "is-diamond" : ""}`;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.setProperty("--spark-dx", `${dx}px`);
  particle.style.setProperty("--spark-dy", `${dy}px`);
  particle.style.setProperty("--spark-size", `${size}px`);
  particle.style.setProperty("--spark-color", color);
  particle.style.animationDuration = `${duration}ms`;
  particle.style.animationDelay = `${delay}ms`;
  pointerLightLayer.appendChild(particle);
  while (pointerLightLayer.childElementCount > 84) {
    pointerLightLayer.firstElementChild?.remove();
  }
  window.setTimeout(() => particle.remove(), duration + delay + 80);
}

function spawnPointerTrail(event, target) {
  const palette = pointerLightPalette(target);
  const color = palette[Math.floor(Math.random() * palette.length)];
  spawnLightParticle(event.clientX, event.clientY, {
    dx: (Math.random() - 0.5) * 20,
    dy: -4 - Math.random() * 16,
    color,
    size: 1.8 + Math.random() * 2.4,
    duration: 480 + Math.random() * 220,
    diamond: Math.random() > 0.78,
  });
}

function spawnPointerBurst(event, target) {
  const palette = pointerLightPalette(target);
  const count = target.matches(".plan-card, .plan-submit, .view-tabs button") ? 12 : 8;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + (Math.random() - 0.5) * 0.32;
    const distance = 24 + Math.random() * 34;
    spawnLightParticle(event.clientX, event.clientY, {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.72,
      color: palette[index % palette.length],
      size: 1.6 + Math.random() * 2.8,
      duration: 480 + Math.random() * 260,
      delay: Math.random() * 42,
      diamond: index % 4 === 0,
    });
  }

  if (!pointerLightLayer || pointerLightLayer.querySelectorAll(".click-light-ring").length > 4) {
    return;
  }
  const ring = document.createElement("span");
  ring.className = "click-light-ring";
  ring.style.left = `${event.clientX}px`;
  ring.style.top = `${event.clientY}px`;
  ring.style.setProperty("--ring-color", palette[0]);
  pointerLightLayer.appendChild(ring);
  window.setTimeout(() => ring.remove(), 640);
}

function initInteractiveLightEffects() {
  if (pointerLightInitialized) return;
  pointerLightInitialized = true;
  pointerLightLayer = document.createElement("div");
  pointerLightLayer.className = "pointer-light-layer";
  pointerLightLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(pointerLightLayer);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener(
    "pointermove",
    (event) => {
      if (reducedMotion.matches || !(event.target instanceof Element)) return;
      const target = event.target.closest(POINTER_LIGHT_SELECTOR);
      if (!target || !pointerLightAllowed(target)) return;
      updatePointerGlow(target, event);
      const now = performance.now();
      if (now - lastPointerSparkAt < 52) return;
      lastPointerSparkAt = now;
      spawnPointerTrail(event, target);
    },
    { passive: true },
  );

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        reducedMotion.matches ||
        event.button !== 0 ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const target = event.target.closest(POINTER_LIGHT_SELECTOR);
      if (!target || !pointerLightAllowed(target) || target.matches(":disabled")) return;
      updatePointerGlow(target, event);
      target.classList.add("is-pointer-pressed");
      spawnPointerBurst(event, target);
      window.setTimeout(() => target.classList.remove("is-pointer-pressed"), 320);
    },
    { passive: true },
  );
}

function renderDate() {
  const now = new Date();
  elements.weekdayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
  }).format(now);
  elements.dateLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace("/", "月")
    .concat("日");
}

function renderTasks() {
  const day = ensureToday();
  const allTasks = [...(day.tasks || [])].sort((left, right) => {
    const leftTime = left.timeStart || "99:99";
    const rightTime = right.timeStart || "99:99";
    return leftTime.localeCompare(rightTime);
  });
  const hiddenCompleted = new Set(day.hiddenCompletedTaskIds || []);
  const tasks = allTasks.filter(
    (task) => task.status !== "done" || !hiddenCompleted.has(task.id),
  );
  const completeCount = allTasks.filter((task) => task.status === "done").length;
  const missedCount = allTasks.filter((task) => task.status === "missed").length;
  const remainingCount = allTasks.length - completeCount;
  const progress = allTasks.length
    ? Math.round((completeCount / allTasks.length) * 100)
    : 0;

  elements.taskCount.textContent = `${allTasks.length} 项`;
  elements.progressRing.style.setProperty("--progress", `${progress * 3.6}deg`);
  elements.progressValue.textContent = `${progress}%`;
  elements.progressCopy.textContent = allTasks.length
    ? `${completeCount} / ${allTasks.length} 已完成`
    : "还没有任务";

  elements.emptyState.hidden = tasks.length > 0 || (allTasks.length > 0 && !remainingCount);
  elements.taskList.innerHTML = tasks
    .map((task) => {
      const done = task.status === "done";
      const confirming = taskConfirmId === task.id && !done;
      const companion = companionById(task.characterId);
      return `
        <article
          class="task-item ${confirming ? "is-confirming" : ""}"
          data-id="${task.id}"
          data-status="${task.status}"
          data-companion-id="${companion?.id || ""}"
          style="--companion-color:${companion?.color || "#7de6e3"}"
          tabindex="0"
          aria-label="${escapeHtml(task.title)}，${
            companion ? `${escapeHtml(companion.name)}的专属任务，` : ""
          }${statusText(task.status)}"
        >
          <button
            class="task-check"
            type="button"
            data-action="done"
            ${done ? "disabled" : ""}
            title="${done ? "完成后不可撤回" : "确认完成"}"
            aria-label="${done ? "已完成，不可撤回" : "确认完成"}"
          >
            <i data-lucide="${done ? ICONS.done : ICONS.pending}"></i>
          </button>
          <div class="task-copy">
            <div class="task-title-line">
              <span class="task-title">${escapeHtml(task.title)}</span>
              ${
                companion
                  ? `
                    <span class="task-companion" title="${escapeHtml(companion.name)}专属任务">
                      ${characterMarkMarkup(companion, "xs", "task-companion-seal")}
                      <span class="task-companion-copy">
                        <b>${escapeHtml(companion.name)}</b>
                        <small>${characterMarkCount(companion.id)} / ${CHARACTER_MAX_MARKS}</small>
                      </span>
                    </span>
                  `
                  : ""
              }
            </div>
            <span class="task-meta">${escapeHtml(taskMeta(task, companion))}</span>
          </div>
          <span class="task-source">${task.source === "plan" ? "长期" : "今日"}</span>
          <div class="task-actions">
            ${
              done
                ? '<span class="task-locked"><i data-lucide="lock-keyhole"></i>已归档</span>'
                : `
                  <button
                    class="icon-button ${task.status === "missed" ? "is-active" : ""}"
                    type="button"
                    data-action="miss"
                    title="${task.status === "missed" ? "撤回未完成" : "标记未完成"}"
                    aria-label="${task.status === "missed" ? "撤回未完成" : "标记未完成"}"
                  >
                    <i data-lucide="${task.status === "missed" ? ICONS.done : ICONS.miss}"></i>
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    data-action="delete"
                    title="删除任务"
                    aria-label="删除任务"
                  >
                    <i data-lucide="${ICONS.delete}"></i>
                  </button>
                `
            }
          </div>
          ${
            confirming
              ? `
                <div class="task-confirm" role="group" aria-label="确认完成任务">
                  <span>确认完成「${escapeHtml(task.title)}」？${
                    companion
                      ? `完成后获得 1 枚「${escapeHtml(companion.name)}专属印记」。`
                      : ""
                  }</span>
                  <button class="task-confirm-primary" type="button" data-action="confirm-done">
                    <i data-lucide="check"></i>确认完成
                  </button>
                  <button type="button" data-action="cancel-done">
                    <i data-lucide="undo-2"></i>继续执行
                  </button>
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");

  if (allTasks.length && completeCount === allTasks.length) {
    setStatus(
      "success",
      state.perfectMarkQueue.length
        ? `今日已完成，00:00 后结算；另有 ${state.perfectMarkQueue.length} 枚印记可领取`
        : "今日已完成，00:00 后统一结算全清",
    );
  } else if (missedCount) {
    setStatus("danger", `${missedCount} 项搁浅，可以继续调整`);
  } else if (allTasks.length) {
    setStatus("neutral", `还差 ${remainingCount} 项完成今天的航程`);
  } else {
    setStatus(
      "neutral",
      state.perfectMarkQueue.length
        ? `有 ${state.perfectMarkQueue.length} 枚全清印记可随时领取`
        : "等待今天的第一项任务",
    );
  }

  refreshIcons();
}

function statusText(status) {
  if (status === "done") return "已完成";
  if (status === "missed") return "今日未完成，可以稍后调整";
  return "等待行动";
}

function taskMeta(task, companion = companionById(task.characterId)) {
  const time = task.timeStart
    ? `${task.timeStart}${task.timeEnd ? `-${task.timeEnd}` : ""}`
    : "未排时";
  const category = task.category || "学习";
  const estimate = task.estimateMinutes ? ` · ${task.estimateMinutes} 分钟` : "";
  const mark =
    task.status === "done" && task.markClaimed && companion
      ? ` · ${companion.name}印记已收`
      : "";
  return `${time} · ${category}${estimate}${mark} · ${statusText(task.status)}`;
}

function selectedWeekdays() {
  return [...elements.planWeekdayField.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => Number(input.value));
}

function setConditionalPlanField(field, visible) {
  if (!visible) {
    field.hidden = true;
    field.classList.remove("is-revealing");
    return;
  }
  const wasHidden = field.hidden;
  field.hidden = false;
  if (!wasHidden) return;
  field.classList.remove("is-revealing");
  void field.offsetWidth;
  field.classList.add("is-revealing");
  window.setTimeout(() => field.classList.remove("is-revealing"), 380);
}

function updatePlanFormVisibility() {
  const repeat = elements.planRepeat.value;
  setConditionalPlanField(elements.planIntervalField, repeat === "interval");
  setConditionalPlanField(elements.planWeekdayField, repeat === "weekly");
}

function resetPlanForm() {
  editingPlanId = null;
  elements.planList
    .querySelectorAll(".plan-card.is-selected")
    .forEach((card) => card.classList.remove("is-selected"));
  elements.planForm.reset();
  elements.planStartDate.value = todayKey();
  elements.planStartTime.value = "19:00";
  elements.planEndTime.value = "19:30";
  elements.planEstimate.value = "30";
  elements.planSubmit.innerHTML =
    '<i data-lucide="calendar-plus"></i><span>添加长期任务</span>';
  updatePlanFormVisibility();
  refreshIcons();
}

function planSummary(plan) {
  const repeatLabels = {
    daily: "每天",
    weekdays: "工作日",
    weekly: "每周指定日期",
    interval: `每 ${plan.interval || 2} 天`,
    once: "只执行一次",
  };
  const time = plan.timeStart
    ? `${plan.timeStart}${plan.timeEnd ? `-${plan.timeEnd}` : ""}`
    : "未设置时段";
  const range = plan.endDate
    ? `${plan.startDate} 至 ${plan.endDate}`
    : `${plan.startDate} 起`;
  const deadline = plan.deadline ? ` · ${plan.deadline} 前截止` : "";
  return `${repeatLabels[plan.repeat] || "每天"} · ${time} · ${plan.estimateMinutes || 30} 分钟${deadline} · ${range}`;
}

function renderPlans() {
  const plans = [...state.plans].sort((left, right) => {
    if (Boolean(left.paused) !== Boolean(right.paused)) return left.paused ? 1 : -1;
    return (left.createdAt || 0) - (right.createdAt || 0);
  });

  elements.planCount.textContent = `${plans.length} 项`;
  elements.planList.innerHTML = plans.length
    ? plans
        .map((plan) => {
          const companion = companionForPlanDate(plan.id, todayKey());
          return `
            <article
              class="plan-card ${plan.paused ? "is-paused" : ""}"
              data-plan-id="${plan.id}"
              data-category="${escapeHtml(plan.category || "其他")}"
              data-companion-id="${companion?.id || ""}"
              style="--companion-color:${companion?.color || "#7de6e3"}"
            >
              <div class="plan-card-main">
                <div class="plan-card-title">
                  <strong>${escapeHtml(plan.title)}</strong>
                  ${
                    companion
                      ? `
                        <em class="plan-card-companion">
                          ${characterMarkMarkup(companion, "xs")}
                          今日 · ${escapeHtml(companion.name)}
                        </em>
                      `
                      : ""
                  }
                  <em class="plan-card-category">${escapeHtml(plan.category || "其他")}</em>
                </div>
                <span class="plan-card-summary">${escapeHtml(planSummary(plan))}</span>
              </div>
              <div class="plan-card-actions">
                <button type="button" data-plan-action="toggle" title="${plan.paused ? "恢复计划" : "暂停计划"}">
                  <i data-lucide="${plan.paused ? "play" : "pause"}"></i>
                </button>
                <button type="button" data-plan-action="edit" title="编辑计划">
                  <i data-lucide="pencil"></i>
                </button>
                <button type="button" data-plan-action="delete" title="删除计划">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="plan-empty">还没有长期任务。先在左侧创建一条每天重复的计划。</div>';

  const today = new Date(`${todayKey()}T12:00:00`);
  elements.weekGrid.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const dateKey = formatDateKey(date);
    const matching = state.plans.filter((plan) => planMatchesDate(plan, dateKey));
    const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
    const dayLabel = new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    }).format(date);
    const preview = matching.length
      ? matching
          .slice(0, 3)
          .map((plan) => {
            const companion = companionForPlanDate(plan.id, dateKey);
            return `<span class="week-plan-item" style="--companion-color:${
              companion?.color || "#7de6e3"
            }">${characterMarkMarkup(companion, "xs")}<span>${escapeHtml(
              plan.title,
            )}</span></span>`;
          })
          .join("")
      : "无计划";
    const more =
      matching.length > 3
        ? `<span class="week-plan-more">+${matching.length - 3} 项</span>`
        : "";
    return `
      <article class="week-day ${index === 0 ? "is-today" : ""} ${matching.length ? "" : "is-empty"}">
        <div class="week-day-head">
          <time datetime="${dateKey}">${weekday}</time>
          <strong>${dayLabel}</strong>
        </div>
        <div class="week-day-copy">${preview}${more}</div>
        <small>${matching.length ? `${matching.length} 项计划` : "静水未排"}</small>
      </article>
    `;
  }).join("");

  refreshIcons();
}

function setStatus(tone, copy) {
  elements.statusBeacon.classList.toggle("is-danger", tone === "danger");
  elements.statusBeacon.classList.toggle("is-success", tone === "success");
  elements.statusCopy.textContent = copy;
}

function companionTabMarkup(character, metrics) {
  const unlocked = characterIsUnlocked(character, metrics, "cute");
  const active = unlocked && character.id === state.selectedCharacterId;
  const index = CHARACTERS.findIndex((item) => item.id === character.id);
  const marks = Math.min(CHARACTER_MAX_MARKS, metrics.characterMarks?.[character.id] || 0);
  const remaining = characterUnlockMarks(character, metrics, "cute");
  const unlockedForms = metrics.unlockedFormsByCharacter?.[character.id] || [];
  return `
    <button
      class="companion-tab ${active ? "is-active" : ""} ${unlocked ? "" : "is-locked"}"
      style="--companion-color:${character.color}"
      type="button"
      data-character-id="${character.id}"
      title="${
        unlocked
          ? `切换到${character.name}，已解锁 ${unlockedForms.length} / 3 种形态`
          : `${character.name}还需要 ${remaining} 枚专属印记解锁幼态`
      }"
    >
      ${characterMarkMarkup(character, "xs")}
      <span class="companion-tab-copy">
        <b>${index + 1}. ${escapeHtml(character.name)}</b>
        <small>${unlocked ? `${unlockedForms.length} / 3 形态` : `${marks} / 1 印记`}</small>
      </span>
    </button>
  `;
}

function renderCompanionTabs(metrics, current) {
  const collapsed = CHARACTERS.slice(0, COMPANION_TAB_LIMIT);
  if (!collapsed.some((character) => character.id === current.id) && collapsed.length) {
    collapsed[collapsed.length - 1] = current;
  }
  const visible = companionTabsExpanded ? CHARACTERS : collapsed;
  const hiddenCount = Math.max(0, CHARACTERS.length - collapsed.length);
  elements.companionTabs.classList.toggle("is-expanded", companionTabsExpanded);
  elements.companionTabs.innerHTML = `
    ${visible.map((character) => companionTabMarkup(character, metrics)).join("")}
    <button
      class="companion-tab companion-expand"
      type="button"
      data-companion-expand
      aria-expanded="${companionTabsExpanded}"
      title="${companionTabsExpanded ? "收起伙伴列表" : `展开其余 ${hiddenCount} 位伙伴`}"
    >
      <i data-lucide="${companionTabsExpanded ? "chevron-up" : "chevron-down"}"></i>
      <span>${companionTabsExpanded ? "收起" : `更多 ${hiddenCount}`}</span>
    </button>
  `;
}

function collectionCardMarkup(character, metrics, current, pageIndex) {
  const pendingArt = character.artStatus === "pending";
  const unlocked = !pendingArt && characterIsUnlocked(character, metrics, "cute");
  const active = unlocked && character.id === current.id;
  const marks = Math.min(CHARACTER_MAX_MARKS, metrics.characterMarks?.[character.id] || 0);
  const unlockedForms = metrics.unlockedFormsByCharacter?.[character.id] || [];
  const thumbnail = character.thumbnailImage || character.image;
  const thumbnailIsActive = pageIndex === collectionPageIndex;
  const formProgress = CHARACTER_FORM_IDS.map((form) => {
    const formUnlocked = unlockedForms.includes(form);
    const threshold = CHARACTER_FORM_THRESHOLDS[form];
    return `
      <span class="card-form-step ${formUnlocked ? "is-unlocked" : ""}">
        <i aria-hidden="true"></i>
        <b>${CHARACTER_FORM_LABELS[form]}</b>
        <small>${formUnlocked ? "已解锁" : `${marks} / ${threshold}`}</small>
      </span>
    `;
  }).join("");
  return `
    <button
      class="collection-card ${unlocked ? "is-unlocked" : "is-locked"} ${active ? "is-active" : ""}"
      style="--companion-color:${character.color}"
      type="button"
      data-character-id="${character.id}"
      aria-label="${
        pendingArt
          ? `${character.name}形象待确认`
          : unlocked
          ? `查看${character.name}，已解锁 ${unlockedForms
              .map((form) => CHARACTER_FORM_LABELS[form])
              .join("、")}`
          : `${character.name}幼态未解锁，已收集 ${marks} 枚专属印记`
      }"
    >
      <span class="card-pet-mark">${characterMarkMarkup(character, "sm")}</span>
      ${
        thumbnail
          ? `<img ${
              thumbnailIsActive
                ? `src="${thumbnail}"`
                : `src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-collection-thumb="${thumbnail}"`
            } alt="${unlocked ? character.name : "未解锁伙伴"}" loading="lazy" decoding="async" />`
          : `<span class="card-pending" aria-hidden="true"><i data-lucide="scan-face"></i></span>`
      }
      ${
        unlocked
          ? ""
          : `<span class="card-lock" aria-hidden="true"><i data-lucide="lock-keyhole"></i></span>`
      }
      <span class="card-copy">
        <strong>${escapeHtml(character.name)}</strong>
        <span>${
          pendingArt
            ? "等待形象确认"
            : unlocked
              ? `${character.role} · 印记 ${marks} / ${CHARACTER_MAX_MARKS}`
              : `幼态未解锁 · 印记 ${marks} / ${CHARACTER_FORM_THRESHOLDS.cute}`
        }</span>
        ${
          pendingArt
            ? ""
            : `<span class="card-mark-progress" aria-label="三种形态的印记解锁进度">${formProgress}</span>`
        }
      </span>
    </button>
  `;
}

function updateCollectionCarousel() {
  const pageCount = Math.max(1, Math.ceil(CHARACTERS.length / COLLECTION_PAGE_SIZE));
  collectionPageIndex = Math.min(Math.max(0, collectionPageIndex), pageCount - 1);
  elements.collectionGrid.style.transform = `translate3d(-${collectionPageIndex * 100}%, 0, 0)`;
  elements.collectionPage.textContent = `${collectionPageIndex + 1} / ${pageCount}`;
  elements.collectionPrev.disabled = collectionPageIndex === 0;
  elements.collectionNext.disabled = collectionPageIndex >= pageCount - 1;
  [...elements.collectionGrid.children].forEach((page, index) => {
    const activePage = index === collectionPageIndex;
    page.classList.toggle("is-active", activePage);
    page.setAttribute("aria-hidden", String(!activePage));
  });
  const activePage = elements.collectionGrid.children[collectionPageIndex];
  activePage?.querySelectorAll("img[data-collection-thumb]").forEach((image) => {
    image.src = image.dataset.collectionThumb;
    image.removeAttribute("data-collection-thumb");
  });
}

function renderCollectionCards(metrics, current) {
  const currentUnlocked = characterIsUnlocked(current, metrics);
  const activeIndex = currentUnlocked
    ? CHARACTERS.findIndex((character) => character.id === current.id)
    : -1;
  if (activeIndex >= 0 && current.id !== collectionFocusCharacterId) {
    collectionPageIndex = Math.floor(activeIndex / COLLECTION_PAGE_SIZE);
    collectionFocusCharacterId = current.id;
  }

  const pages = [];
  for (let index = 0; index < CHARACTERS.length; index += COLLECTION_PAGE_SIZE) {
    pages.push(CHARACTERS.slice(index, index + COLLECTION_PAGE_SIZE));
  }
  elements.collectionGrid.innerHTML = pages
    .map(
      (page, pageIndex) => `
        <div class="collection-page">
          ${page
            .map((character) =>
              collectionCardMarkup(character, metrics, current, pageIndex),
            )
            .join("")}
        </div>
      `,
    )
    .join("");
  updateCollectionCarousel();
}

function updateStageFormButtons(metrics, character) {
  document.querySelectorAll(".view-switch [data-art]").forEach((button) => {
    const form = button.dataset.art;
    const unlocked = characterIsUnlocked(character, metrics, form);
    const active = unlocked && currentArt === form;
    button.classList.toggle("is-locked", !unlocked);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.title = unlocked
      ? `切换到${character.name}的${CHARACTER_FORM_LABELS[form]}形态`
      : `还需要 ${characterUnlockMarks(character, metrics, form)} 枚${
          character.name
        }专属印记解锁${CHARACTER_FORM_LABELS[form]}`;
    button.innerHTML = `
      <i data-lucide="${unlocked ? (form === "collection" ? "image" : "sparkles") : "lock-keyhole"}"></i>
      <span>${CHARACTER_FORM_LABELS[form]}</span>
      ${unlocked ? "" : `<small>${characterUnlockMarks(character, metrics, form)}</small>`}
    `;
  });
}

function renderCompanions() {
  const metrics = getMetrics();
  let selected = selectedCharacter();

  if (!characterIsUnlocked(selected, metrics, "cute")) {
    selected =
      ACTIVE_CHARACTERS.find((character) =>
        characterIsUnlocked(character, metrics, "cute"),
      ) || CHARACTERS[0];
    state.selectedCharacterId = selected.id;
    saveState();
  }

  const current = selectedCharacter();
  if (!characterIsUnlocked(current, metrics, currentArt)) {
    currentArt = deepestUnlockedForm(current, metrics) || "cute";
  }
  elements.stageViewport.dataset.character = current.id;
  elements.stageViewport.dataset.art = currentArt;
  const pendingArt = current.artStatus === "pending";
  const currentUnlocked = characterIsUnlocked(current, metrics, "cute");
  const stagePlaceholder = pendingArt || !currentUnlocked;
  const unlockedForms = metrics.unlockedFormsByCharacter?.[current.id] || [];
  elements.stageTitle.textContent = current.name;
  elements.stageSubtitle.textContent = `${current.unit}。${current.quote}`;
  elements.selectedRole.textContent = current.role;
  elements.selectedState.textContent = stagePlaceholder
    ? "幼态未解锁"
    : `${CHARACTER_FORM_LABELS[currentArt]} · ${unlockedForms.length} / 3`;
  elements.portraitImage.hidden = stagePlaceholder;
  const portraitSource = characterArtSource(current, currentArt);
  elements.portraitImage.src = stagePlaceholder ? "" : portraitSource;
  elements.portraitImage.alt = `${current.name}立绘`;
  elements.characterPending.hidden = !stagePlaceholder;
  elements.hatchMedals.hidden = true;
  const pendingTitle = elements.characterPending.querySelector("strong");
  const pendingCopy = elements.characterPending.querySelector("span");
  if (pendingTitle) {
    pendingTitle.textContent = pendingArt ? "形象待确认" : "幼态印记尚未抵达";
  }
  if (pendingCopy) {
    pendingCopy.textContent = pendingArt
      ? "可爱方向定稿后再接入"
      : `再收集 1 枚${current.name}专属印记，即可解锁她的幼态`;
  }
  elements.stageViewport.classList.toggle("is-pending", stagePlaceholder);

  renderCompanionTabs(metrics, current);
  renderCollectionCards(metrics, current);
  updateStageFormButtons(metrics, current);
  refreshIcons();
}

function renderGrowth() {
  const metrics = getMetrics();
  const percent = Math.min(
    100,
    Math.round(metrics.formProgress * 100),
  );
  const cardTokenDisplay = metrics.cardReady ? 3 : metrics.cardProgress;

  elements.collectionCount.textContent = `${metrics.formUnlockCount} / ${metrics.formCapacity}`;
  elements.collectionCount.title = "已解锁形态 / 全部形态";
  elements.perfectDays.textContent = String(metrics.perfectDays);
  elements.streakDays.textContent = String(metrics.streak);
  elements.bigWhaleCount.textContent = String(state.synthesizedCards || 0);
  elements.growthPercent.textContent = `${percent}%`;
  elements.depthFill.style.width = `${percent}%`;
  elements.whaleTokenCount.textContent = metrics.allCardsArchived
    ? `${metrics.archivedCards} / ${metrics.cardCapacity}`
    : `${cardTokenDisplay} / 3`;
  elements.mergeButton.disabled = metrics.allCardsArchived;
  elements.mergeButton.classList.toggle("is-disabled", !metrics.mergeReady);
  elements.mergeButton.dataset.ready = String(metrics.mergeReady);
  elements.stageAction.dataset.ready = String(metrics.mergeReady);
  elements.mergeButtonLabel.textContent = metrics.allCardsArchived
    ? "典藏卡已全部装帧"
    : metrics.mergeReady
      ? "把本组 3 位装帧成卡"
      : "查看装帧进度";
  elements.mergeHint.textContent = metrics.allCardsArchived
    ? `已收齐全部 ${metrics.cardCapacity} 张典藏卡`
    : metrics.mergeReady
      ? `本组 ${cardTokenDisplay} / 3，确认后收进典藏馆`
      : `再解锁 ${metrics.cardRemaining} 位鲸歌形态即可装帧`;

  if (metrics.mergeReady) {
    elements.growthCopy.textContent = `每 3 位解锁鲸歌形态的伙伴装帧 1 张，当前可以装帧第 ${metrics.archivedCards + 1} 张潮汐典藏卡。`;
  } else if (metrics.nextForm) {
    elements.growthCopy.textContent = `再收集 ${metrics.nextForm.remaining} 枚${metrics.nextForm.character.name}专属印记，可解锁她的${metrics.nextForm.label}。`;
  } else if (metrics.allCardsArchived) {
    elements.growthCopy.textContent = `当前 ${metrics.cardCapacity} 组伙伴都已装帧，典藏馆已经收齐。`;
  } else if (metrics.archivedCards > 0) {
    elements.growthCopy.textContent = `已装帧 ${metrics.archivedCards} 张；再解锁 ${metrics.cardRemaining} 位鲸歌形态可以装帧下一张。`;
  } else {
    elements.growthCopy.textContent = `每解锁 3 位鲸歌形态可装帧 1 张，当前进度 ${metrics.cardProgress} / 3。`;
  }

  elements.mergeButton.title = metrics.allCardsArchived
    ? "全部潮汐典藏卡都已装帧"
    : metrics.mergeReady
      ? "把本轮三位伙伴装帧成一张潮汐典藏卡"
      : `再解锁 ${metrics.cardRemaining} 位鲸歌形态，即可推进下一张典藏卡`;
}

function renderTideHistory() {
  const today = new Date(`${todayKey()}T12:00:00`);
  elements.tideHistory.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const dateKey = formatDateKey(date);
    const day = state.days[dateKey];
    const perfect = Boolean(day?.perfect && day.tasks?.length);
    const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
    const dayLabel = String(date.getDate()).padStart(2, "0");
    return `
      <div class="history-day ${perfect ? "is-perfect" : ""} ${index === 6 ? "is-today" : ""}">
        <time datetime="${dateKey}">${weekday}</time>
        <span class="history-medal" aria-label="${perfect ? "已全清" : "未全清"}"></span>
        <strong>${dayLabel}</strong>
      </div>
    `;
  }).join("");
}

function renderView() {
  const character = selectedCharacter();
  const pendingArt = character.artStatus === "pending";
  elements.portraitLayer.hidden = false;
  elements.portraitLayer.classList.add("is-active");
  document.querySelectorAll("[data-art]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.art === currentArt,
    );
  });

  if (!pendingArt) {
    startStageIdle(character);
  } else {
    stopStageIdle();
  }
}

function renderAll() {
  ensureToday();
  renderDate();
  renderTasks();
  renderPlans();
  renderCompanions();
  renderGrowth();
  renderTideHistory();
  renderPerfectMarkState();
  renderView();
  farmGame?.render();
}

function renderPerfectMarkState() {
  ensureToday();
  const pendingCount = Array.isArray(state.perfectMarkQueue)
    ? state.perfectMarkQueue.length
    : 0;
  elements.perfectMarkButton.hidden = pendingCount === 0;
  elements.perfectMarkButton.classList.toggle("is-ready", pendingCount > 0);
  elements.perfectMarkButtonLabel.textContent =
    pendingCount > 1
      ? `选择全清印记 · ${pendingCount} 枚`
      : "选择全清印记";
  elements.perfectMarkButton.setAttribute(
    "aria-label",
    pendingCount > 1
      ? `选择全清印记，当前存有 ${pendingCount} 枚`
      : "选择全清印记",
  );
}

function renderPerfectMarkChoice() {
  const metrics = getMetrics();
  elements.markChoiceGrid.innerHTML = ACTIVE_CHARACTERS.map((character, index) => {
    const marks = metrics.characterMarks?.[character.id] || 0;
    const unlockedForms = metrics.unlockedFormsByCharacter?.[character.id] || [];
    const nextForm = CHARACTER_FORM_IDS.find(
      (form) => !unlockedForms.includes(form),
    );
    const formCopy = nextForm
      ? `${CHARACTER_FORM_LABELS[nextForm]}还差 ${Math.max(
          0,
          CHARACTER_FORM_THRESHOLDS[nextForm] - marks,
        )} 枚`
      : "全部形态已解锁";
    return `
      <button
        class="mark-choice-card"
        style="--companion-color:${character.color}"
        type="button"
        data-choice-character-id="${character.id}"
        aria-label="选择${escapeHtml(character.name)}的${CHARACTER_MARKS?.petName(character) || "专属"}印记"
      >
        <span class="mark-choice-index">${String(index + 1).padStart(2, "0")}</span>
        ${characterMarkMarkup(character, "lg")}
        <span class="mark-choice-card-copy">
          <strong>${escapeHtml(character.name)}</strong>
          <small>${escapeHtml(character.role)}</small>
        </span>
        <span class="mark-choice-card-progress">
          <b>${marks} / ${CHARACTER_MAX_MARKS}</b>
          <small>${formCopy}</small>
        </span>
      </button>
    `;
  }).join("");
  refreshIcons();
}

function openPerfectMarkChoice() {
  ensureToday();
  const pendingCount = state.perfectMarkQueue.length;
  if (!pendingCount) return;
  elements.markChoiceTitle.textContent = "选择全清的专属印记";
  elements.markChoiceCopy.textContent = `你已存下 ${pendingCount} 枚全清印记，未领取不会过期。挑选一位伙伴，让她的宠物印记落在收藏册中。`;
  elements.markChoiceNote.textContent =
    "每次领取消耗 1 枚已存全清印记；剩余印记可以以后继续选择。";
  renderPerfectMarkChoice();
  elements.markChoiceOverlay.classList.add("is-visible");
  elements.markChoiceOverlay.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    elements.markChoiceGrid
      .querySelector(".mark-choice-card")
      ?.focus({ preventScroll: true });
  });
}

function closePerfectMarkChoice() {
  elements.markChoiceOverlay.classList.remove("is-visible");
  elements.markChoiceOverlay.setAttribute("aria-hidden", "true");
}

function choosePerfectMark(characterId) {
  ensureToday();
  const dateKey = state.perfectMarkQueue[0];
  if (!dateKey) return;
  const reward = awardCharacterMark(characterId, 1);
  if (!reward) return;
  state.perfectMarkQueue.shift();
  state.perfectMarkHistory.push({
    dateKey,
    characterId: reward.character.id,
    selectedAt: Date.now(),
  });
  const day = state.days[dateKey];
  if (day) {
    day.perfectMarkChoicePending = false;
    day.perfectMarkClaimed = true;
    day.perfectMarkCharacterId = reward.character.id;
  }
  saveState();
  closePerfectMarkChoice();
  renderAll();
  showToast({
    title: `收下${reward.character.name}的${CHARACTER_MARKS?.petName(reward.character) || "专属"}印记`,
    message: reward.added
      ? `已消耗 ${dateKey.slice(5).replace("-", "/")} 的全清印记；专属印记 ${reward.before} → ${reward.after} / ${CHARACTER_MAX_MARKS}${
          reward.newForms.length
            ? `，已解锁${reward.newForms
                .map((form) => CHARACTER_FORM_LABELS[form])
                .join("、")}形态。`
            : "。"
        }`
      : `${reward.character.name}的专属印记已集齐 ${CHARACTER_MAX_MARKS} / ${CHARACTER_MAX_MARKS}，本次选择已记录，剩余印记仍可继续领取。`,
    tone: "success",
    icon: "stamp",
  });
}

function addTask(title) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return;

  const day = ensureToday();
  const companion = randomCompanion();
  day.tasks.unshift({
    id: createId(),
    title: cleanTitle.slice(0, 80),
    status: "pending",
    createdAt: Date.now(),
    characterId: companion?.id || "",
  });
  syncDayMetrics(day);
  saveState();
  renderAll();
  showToast({
    title: "任务已入海",
    message: companion
      ? `由${companion.name}接管，完成后会留下她的专属印记。`
      : "它现在停泊在今天的航程里。",
    icon: "plus",
  });
}

function syncDayMetrics(day) {
  if (!day || day.perfectSettledAt) return null;
  day.perfect = false;
  day.perfectMarkChoicePending = false;
  return null;
}

function updateTask(taskId, action) {
  const day = ensureToday();
  const task = day.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const wasDone = task.status === "done";
  let taskReward = null;
  let markReward = null;

  if (action === "done") {
    if (task.status === "done") return;
    taskConfirmId = taskId;
    renderTasks();
    window.requestAnimationFrame(() => {
      elements.taskList
        .querySelector(`[data-id="${taskId}"] [data-action="confirm-done"]`)
        ?.focus();
    });
    return;
  }

  if (action === "miss") {
    if (task.status === "done") return;
    task.status = task.status === "missed" ? "pending" : "missed";
  }

  if (action === "confirm-done") {
    if (task.status === "done") return;
    task.status = "done";
    taskConfirmId = null;
  }

  if (action === "cancel-done") {
    taskConfirmId = null;
    renderTasks();
    return;
  }

  if (
    action === "confirm-done" &&
    task.status === "done" &&
    !wasDone &&
    !task.rewardClaimed
  ) {
    task.rewardClaimed = true;
    taskReward = farmGame?.rewardTask(task) || null;
  }

  if (action === "confirm-done" && task.status === "done" && !wasDone && !task.markClaimed) {
    const companion = companionById(task.characterId) || randomCompanion();
    if (companion) {
      task.characterId = companion.id;
      markReward = awardCharacterMark(companion.id, 1);
    }
    task.markClaimed = true;
  }

  syncDayMetrics(day);
  const allDoneToday = dayIsComplete(day);
  saveState();
  renderAll();

  const row = elements.taskList.querySelector(`[data-id="${taskId}"]`);
  row?.classList.add("is-pulsing");
  window.setTimeout(() => row?.classList.remove("is-pulsing"), 720);

  if (task.status === "done") {
    completionBurst(row?.querySelector('[data-action="done"]'));
    const rewardCopy = taskReward
      ? `获得 ${taskReward.materials} 潮矿、${taskReward.tideCharges || 0} 次潮汛与 ${taskReward.xp} 潮栖经验${
          taskReward.firstTask
            ? `，并收到 ${taskReward.seedCount || 0} 份基础种子`
            : ""
        }。`
      : "";
    const markCopy = markReward
      ? `获得「${markReward.character.name}专属印记」1 枚，当前 ${markReward.after} / ${CHARACTER_MAX_MARKS}${
          markReward.newForms.length
            ? `，${markReward.newForms
                .map((form) => CHARACTER_FORM_LABELS[form])
                .join("、")}形态已经解锁。`
            : "。"
        }`
      : "";
    const settlementCopy = allDoneToday
      ? "今日任务已经全部完成，将在 00:00 统一结算全清与待选印记。"
      : "";
    showToast({
      title: markReward?.unlockedNow
        ? `${markReward.character.name}的${
            markReward.newForms
              .map((form) => CHARACTER_FORM_LABELS[form])
              .join("、")
          }形态已解锁`
        : "完成，今日航程继续推进",
      message: `${rewardCopy}${markCopy}${settlementCopy}`,
      tone: "success",
      icon: markReward?.unlockedNow ? "sparkles" : "badge-plus",
    });
  }

  if (task.status === "missed") {
    showToast({
      title: "这一项今天没有完成",
      message: "先保留事实，不必惩罚自己。你可以稍后撤回、继续保留或删除。",
      tone: "danger",
      icon: "triangle-alert",
      actionLabel: "撤回",
      onAction: () => updateTask(taskId, "miss"),
    });
  }
}

function deleteTask(taskId) {
  const day = ensureToday();
  const index = day.tasks.findIndex((task) => task.id === taskId);
  if (index < 0) return;
  if (day.tasks[index].status === "done") return;
  const [removed] = day.tasks.splice(index, 1);
  const suppressedPlan = Boolean(removed.planId);
  if (suppressedPlan) {
    day.suppressedPlanIds = [...new Set([...(day.suppressedPlanIds || []), removed.planId])];
  }
  syncDayMetrics(day);
  saveState();
  renderAll();

  showToast({
    title: "任务已移出清单",
    message: removed.title,
    icon: "trash-2",
    actionLabel: "恢复",
    onAction: () => {
      const currentDay = ensureToday();
      currentDay.tasks.splice(index, 0, removed);
      if (removed.planId) {
        currentDay.suppressedPlanIds = (currentDay.suppressedPlanIds || []).filter(
          (planId) => planId !== removed.planId,
        );
      }
      syncDayMetrics(currentDay);
      saveState();
      renderAll();
    },
  });
}

function clearCompletedTasks() {
  const day = ensureToday();
  const completed = day.tasks.filter((task) => task.status === "done");
  if (!completed.length) {
    showToast({
      title: "还没有已完成任务",
      message: "完成任务后可以来这里整批收起。",
      icon: "list-checks",
    });
    return;
  }

  day.hiddenCompletedTaskIds = [
    ...new Set([
      ...(day.hiddenCompletedTaskIds || []),
      ...completed.map((task) => task.id),
    ]),
  ];
  saveState();
  renderAll();
  showToast({
    title: "已完成任务已收起",
    message: `共收起 ${completed.length} 项，今日完成记录不会消失。`,
    tone: "success",
    icon: "archive",
  });
}

function completionBurst(origin) {
  if (!origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const originRect = origin.getBoundingClientRect();
  const targetRect = elements.stageViewport.getBoundingClientRect();
  const startX = originRect.left + originRect.width / 2;
  const startY = originRect.top + originRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height * 0.45;

  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement("span");
    particle.className = "completion-particle";
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty("--dx", `${endX - startX + (Math.random() - 0.5) * 80}px`);
    particle.style.setProperty("--dy", `${endY - startY + (Math.random() - 0.5) * 70}px`);
    particle.style.animationDelay = `${index * 18}ms`;
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 1100 + index * 18);
  }
}

function showToast({
  title,
  message,
  tone = "neutral",
  icon = "info",
  actionLabel = "",
  onAction = null,
  duration = 4200,
}) {
  const toast = document.createElement("article");
  toast.className = `toast ${tone === "danger" ? "is-danger" : ""} ${
    tone === "success" ? "is-success" : ""
  }`;
  toast.innerHTML = `
    <span class="toast-icon"><i data-lucide="${icon}"></i></span>
    <span class="toast-copy">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    </span>
    ${actionLabel ? `<button type="button">${escapeHtml(actionLabel)}</button>` : ""}
  `;
  elements.toastRegion.appendChild(toast);
  refreshIcons();

  let timeoutId = window.setTimeout(removeToast, duration);

  function removeToast() {
    window.clearTimeout(timeoutId);
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 240);
  }

  toast.querySelector("button")?.addEventListener("click", () => {
    onAction?.();
    removeToast();
  });
}

function refreshIcons() {
  window.lucide?.createIcons({
    attrs: {
      "stroke-width": 1.7,
    },
  });
}

function selectCharacter(characterId, requestedForm = "") {
  const metrics = getMetrics();
  const character = CHARACTERS.find((item) => item.id === characterId);
  if (!character) return;

  if (character.artStatus === "pending") {
    showToast({
      title: `${character.name}的形象还在确认`,
      message: "可爱方向定稿前，这一席不会接入旧草稿。",
      icon: "scan-face",
    });
    return;
  }

  if (!characterIsUnlocked(character, metrics, "cute")) {
    showToast({
      title: `${character.name}的幼态尚未解锁`,
      message: `再收集 ${characterUnlockMarks(character, metrics, "cute")} 枚${
        character.name
      }专属印记，即可见到她的幼态。`,
      icon: "lock-keyhole",
    });
    return;
  }

  state.selectedCharacterId = characterId;
  currentArt =
    STAGE_ART_IDS.has(requestedForm) &&
    characterIsUnlocked(character, metrics, requestedForm)
      ? requestedForm
      : deepestUnlockedForm(character, metrics) || "cute";
  saveState();
  farmGame?.setCharacter(characterId);
  transitionStage(() => {
    renderCompanions();
    renderView();
    refreshIcons();
  });
}

function toggleFocusMode() {
  const active = elements.app.classList.toggle("focus-mode");
  elements.focusButton.classList.toggle("is-active", active);
  elements.focusButton.querySelector("span").textContent = active ? "退出专注" : "专注";
  if (active) {
    elements.taskInput.blur();
    startFocusSession();
  } else {
    stopFocusSession();
  }
  renderFocusDock();
}

function focusTasks() {
  return ensureToday().tasks.filter((task) => task.status !== "done");
}

function selectFocusTask({ advance = false } = {}) {
  const tasks = focusTasks();
  if (!tasks.length) {
    focusSession.taskId = null;
    focusSession.remaining = 25 * 60;
    return;
  }

  const currentIndex = tasks.findIndex((task) => task.id === focusSession.taskId);
  const nextIndex = advance && currentIndex >= 0 ? (currentIndex + 1) % tasks.length : Math.max(0, currentIndex);
  focusSession.taskId = tasks[nextIndex].id;
  focusSession.remaining = 25 * 60;
}

function formatFocusTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function renderFocusDock() {
  if (!focusSession) {
    elements.focusDock.hidden = true;
    return;
  }

  const task = focusTasks().find((item) => item.id === focusSession.taskId);
  elements.focusDock.hidden = false;
  elements.focusDock.classList.toggle("is-summary", Boolean(focusSession.ended));
  elements.focusTaskTitle.textContent = focusSession.ended
    ? `25 分钟完成 · ${task?.title || focusSession.taskTitle || "自由专注"} · +${
        focusSession.reward?.materials || 0
      } 潮矿 / +${focusSession.reward?.tideCharges || 0} 潮汛`
    : task
      ? task.title
      : "自由专注";
  elements.focusTimer.textContent = focusSession.ended
    ? "已结束"
    : formatFocusTime(focusSession.remaining);
  elements.focusComplete.innerHTML = focusSession.ended
    ? '<i data-lucide="check"></i><span>确认完成关联任务</span>'
    : '<i data-lucide="check"></i><span>完成</span>';
  elements.focusSkip.innerHTML = focusSession.ended
    ? '<i data-lucide="bookmark"></i><span>保留任务</span>'
    : '<i data-lucide="forward"></i><span>跳过</span>';
  refreshIcons();
}

function startFocusSession() {
  stopFocusSession();
  focusSession = {
    taskId: null,
    remaining: 25 * 60,
    timerId: 0,
    ended: false,
    taskTitle: "",
    reward: null,
  };
  selectFocusTask();
  const selected = focusTasks().find((item) => item.id === focusSession.taskId);
  focusSession.taskTitle = selected?.title || "";
  focusSession.timerId = window.setInterval(() => {
    if (!focusSession) return;
    focusSession.remaining = Math.max(0, focusSession.remaining - 1);
    renderFocusDock();
    if (focusSession.remaining > 0) return;
    finishFocusSession();
  }, 1000);
}

function finishFocusSession() {
  if (!focusSession || focusSession.ended) return;
  window.clearInterval(focusSession.timerId);
  focusSession.timerId = 0;
  focusSession.remaining = 0;
  focusSession.ended = true;
  const task = focusTasks().find((item) => item.id === focusSession.taskId);
  const taskTitle = task?.title || focusSession.taskTitle || "自由专注";
  focusSession.reward = farmGame?.rewardFocusSession({
    taskId: focusSession.taskId,
    taskTitle,
  }) || null;
  state.focusSessions.push({
    id: createId(),
    date: todayKey(),
    taskId: focusSession.taskId || null,
    taskTitle,
    minutes: 25,
    completedAt: Date.now(),
  });
  saveState();
  farmGame?.render();
  renderFocusDock();
}

function stopFocusSession() {
  if (focusSession?.timerId) {
    window.clearInterval(focusSession.timerId);
  }
  focusSession = null;
  elements.focusDock.hidden = true;
}

function completeFocusTask() {
  if (!focusSession?.taskId) {
    focusSession && (focusSession.remaining = 25 * 60);
    renderFocusDock();
    return;
  }

  const taskId = focusSession.taskId;
  const task = focusTasks().find((item) => item.id === taskId);
  const completedFocus = focusSession.ended;
  stopFocusSession();
  if (elements.app.classList.contains("focus-mode")) {
    toggleFocusMode();
  }
  if (task && task.status !== "done") {
    updateTask(taskId, completedFocus ? "confirm-done" : "done");
  }
}

function skipFocusTask() {
  if (!focusSession) return;
  if (focusSession.ended) {
    stopFocusSession();
    if (elements.app.classList.contains("focus-mode")) toggleFocusMode();
    return;
  }
  selectFocusTask({ advance: true });
  const selected = focusTasks().find((item) => item.id === focusSession.taskId);
  focusSession.taskTitle = selected?.title || "";
  renderFocusDock();
}

function toggleSound() {
  if (!audioController) {
    audioController = createOceanSound();
  }
  const enabled = audioController.toggle();
  state.soundEnabled = enabled;
  saveState();
  elements.soundButton.classList.toggle("is-active", enabled);
  elements.soundButton.querySelector("span").textContent = enabled ? "环境音开" : "环境音";
}

function createOceanSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const low = context.createOscillator();
  low.type = "sine";
  low.frequency.value = 58;

  const high = context.createOscillator();
  high.type = "sine";
  high.frequency.value = 92;

  const lowGain = context.createGain();
  lowGain.gain.value = 0.018;
  const highGain = context.createGain();
  highGain.gain.value = 0.012;

  low.connect(lowGain).connect(master);
  high.connect(highGain).connect(master);
  low.start();
  high.start();

  let enabled = false;
  return {
    toggle() {
      enabled = !enabled;
      if (context.state === "suspended") context.resume();
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.linearRampToValueAtTime(enabled ? 0.65 : 0, context.currentTime + 0.8);
      return enabled;
    },
  };
}

function openMerge() {
  const metrics = getMetrics();
  if (!metrics.mergeReady) {
    if (metrics.allCardsArchived) {
      showToast({
        title: "典藏馆已经收齐",
        message: `当前 ${metrics.cardCapacity} 组伙伴都已完成装帧。`,
        tone: "success",
        icon: "sparkles",
      });
      return;
    }
    showToast({
      title: `还需要 ${metrics.cardRemaining} 位伙伴`,
      message: `每解锁 3 位鲸歌形态可装帧 1 张典藏卡；本轮进度 ${metrics.cardProgress} / 3。`,
      icon: "sparkles",
    });
    return;
  }
  const groupStart = metrics.archivedCards * 3;
  const group = ACTIVE_CHARACTERS.slice(groupStart, groupStart + 3);
  const trioFigures = elements.mergeTrio.querySelectorAll("figure");
  group.forEach((character, index) => {
    const figure = trioFigures[index];
    if (!figure) return;
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (image && character.image) {
      image.src = character.image;
      image.alt = `${character.name}全身立绘`;
    }
    if (caption) {
      caption.textContent = `${character.name} · ${character.role}`;
    }
  });
  elements.mergeTrio.setAttribute(
    "aria-label",
    `${group.map((character) => character.name).join("、")}三位独立鲸灵同时到席`,
  );
  elements.mergeTitle.textContent = `第 ${metrics.archivedCards + 1} 张潮汐典藏卡准备装帧`;
  elements.mergeDescription.textContent =
    "本组三位伙伴各自保留身份，只把这一组的同行印记留在同一张典藏卡上。";
  elements.mergeConfirm.textContent = `装帧第 ${metrics.archivedCards + 1} 张典藏卡`;
  elements.mergeOverlay.classList.add("is-visible");
  elements.mergeOverlay.setAttribute("aria-hidden", "false");
}

function closeMerge() {
  elements.mergeOverlay.classList.remove("is-visible");
  elements.mergeOverlay.setAttribute("aria-hidden", "true");
}

function confirmMerge() {
  const metrics = getMetrics();
  if (!metrics.mergeReady) return;
  state.synthesizedCards = (state.synthesizedCards || 0) + 1;
  saveState();
  closeMerge();
  renderGrowth();
  showToast({
    title: "潮汐典藏卡已收入馆藏",
    message: `第 ${metrics.archivedCards + 1} 张典藏卡已经完成装帧，当前共收进 ${metrics.archivedCards + 1} 张。`,
    tone: "success",
    icon: "sparkles",
  });
}

function switchScreen(screen) {
  currentScreen = ["plans", "farm"].includes(screen) ? screen : "today";
  if (window.location.protocol !== "file:") {
    const nextHash = currentScreen === "today" ? "" : `#${currentScreen}`;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${nextHash}`,
    );
  }
  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === currentScreen);
  });
  document.querySelectorAll("[data-screen-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.screenPanel === currentScreen);
  });
  if (currentScreen === "plans") renderPlans();
  if (currentScreen === "farm") farmGame?.activate();
  refreshIcons();
}

function editPlan(planId) {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) return;
  elements.planList
    .querySelectorAll(".plan-card.is-selected")
    .forEach((card) => card.classList.remove("is-selected"));
  elements.planList.querySelector(`[data-plan-id="${planId}"]`)?.classList.add("is-selected");
  elements.planForm.classList.remove("is-updating");
  void elements.planForm.offsetWidth;
  elements.planForm.classList.add("is-updating");
  window.setTimeout(() => elements.planForm.classList.remove("is-updating"), 520);

  editingPlanId = plan.id;
  elements.planTitle.value = plan.title;
  elements.planRepeat.value = plan.repeat || "daily";
  elements.planInterval.value = plan.interval || 2;
  elements.planStartDate.value = plan.startDate || todayKey();
  elements.planEndDate.value = plan.endDate || "";
  elements.planStartTime.value = plan.timeStart || "";
  elements.planEndTime.value = plan.timeEnd || "";
  elements.planEstimate.value = plan.estimateMinutes || 30;
  elements.planDeadline.value = plan.deadline || "";
  elements.planCategory.value = plan.category || "学习";
  elements.planWeekdayField.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = (plan.weekdays || []).map(Number).includes(Number(input.value));
  });
  elements.planSubmit.innerHTML =
    '<i data-lucide="save"></i><span>保存长期任务</span>';
  updatePlanFormVisibility();
  refreshIcons();
  if (window.matchMedia("(max-width: 1040px)").matches) {
    elements.planForm.closest(".plan-editor-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  elements.planTitle.focus();
}

function handlePlanSubmit(event) {
  event.preventDefault();
  const wasEditing = Boolean(editingPlanId);
  const repeat = elements.planRepeat.value;
  const startDate = elements.planStartDate.value || todayKey();
  const endDate = elements.planEndDate.value;
  const startTime = elements.planStartTime.value;
  const endTime = elements.planEndTime.value;
  const weekdays = selectedWeekdays();

  if (endDate && endDate < startDate) {
    showToast({
      title: "结束日期早于开始日期",
      message: "请调整长期任务的日期范围。",
      tone: "danger",
      icon: "calendar-x",
    });
    return;
  }
  if (repeat === "weekly" && !weekdays.length) {
    showToast({
      title: "还没有选择执行日期",
      message: "每周计划至少选择一天。",
      tone: "danger",
      icon: "calendar-days",
    });
    return;
  }
  if (startTime && endTime && endTime < startTime) {
    showToast({
      title: "结束时间早于开始时间",
      message: "请调整每日时段。",
      tone: "danger",
      icon: "clock-alert",
    });
    return;
  }

  const existingPlan = editingPlanId
    ? state.plans.find((item) => item.id === editingPlanId)
    : null;
  const planData = {
    title: elements.planTitle.value.trim().slice(0, 80),
    repeat,
    interval: Math.max(1, Number(elements.planInterval.value) || 2),
    weekdays,
    startDate,
    endDate,
    timeStart: startTime,
    timeEnd: endTime,
    estimateMinutes: Math.max(5, Number(elements.planEstimate.value) || 30),
    deadline: elements.planDeadline.value,
    category: elements.planCategory.value,
    paused: false,
  };

  if (editingPlanId) {
    if (!existingPlan) return;
    Object.assign(existingPlan, planData, { paused: Boolean(existingPlan.paused) });
  } else {
    state.plans.push({
      id: createId(),
      createdAt: Date.now(),
      ...planData,
    });
  }

  saveState();
  ensureToday();
  resetPlanForm();
  renderAll();
  showToast({
    title: wasEditing ? "长期任务已保存" : "长期任务已创建",
    message: "长期任务的伙伴每天会重新随机，完成任务后积累她的专属印记。",
    tone: "success",
    icon: "calendar-check",
  });
}

function togglePlan(planId) {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) return;
  plan.paused = !plan.paused;
  saveState();
  ensureToday();
  renderAll();
  showToast({
    title: plan.paused ? "计划已暂停" : "计划已恢复",
    message: plan.title,
    icon: plan.paused ? "pause" : "play",
  });
}

function deletePlan(planId) {
  const index = state.plans.findIndex((plan) => plan.id === planId);
  if (index < 0) return;
  const [removed] = state.plans.splice(index, 1);
  saveState();
  ensureToday();
  renderAll();
  showToast({
    title: "长期任务已移除",
    message: removed.title,
    icon: "trash-2",
    actionLabel: "恢复",
    onAction: () => {
      state.plans.splice(index, 0, removed);
      saveState();
      ensureToday();
      renderAll();
    },
  });
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    const screen = window.location.hash.slice(1);
    if (["today", "plans", "farm"].includes(screen)) switchScreen(screen);
  });

  elements.viewTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-screen]");
    if (button) switchScreen(button.dataset.screen);
  });

  elements.planForm.addEventListener("submit", handlePlanSubmit);
  elements.planRepeat.addEventListener("change", updatePlanFormVisibility);
  elements.planReset.addEventListener("click", resetPlanForm);
  elements.planList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-plan-action]");
    const card = event.target.closest("[data-plan-id]");
    if (!card) return;
    const planId = card.dataset.planId;
    if (!button) {
      editPlan(planId);
      return;
    }
    if (button.dataset.planAction === "edit") editPlan(planId);
    if (button.dataset.planAction === "toggle") togglePlan(planId);
    if (button.dataset.planAction === "delete") deletePlan(planId);
  });

  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(elements.taskInput.value);
    elements.taskInput.value = "";
  });

  elements.taskList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    const taskRow = event.target.closest(".task-item");
    if (!button || !taskRow) return;
    const taskId = taskRow.dataset.id;
    const action = button.dataset.action;
    if (action === "delete") deleteTask(taskId);
    else updateTask(taskId, action);
  });

  elements.taskList.addEventListener("keydown", (event) => {
    const row = event.target.closest(".task-item");
    if (!row) return;
    const taskId = row.dataset.id;
    const task = ensureToday().tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (row.classList.contains("is-confirming")) {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        updateTask(taskId, "confirm-done");
        window.requestAnimationFrame(() => {
          elements.taskList.querySelector(`[data-id="${taskId}"]`)?.focus();
        });
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        updateTask(taskId, "cancel-done");
        window.requestAnimationFrame(() => {
          elements.taskList.querySelector(`[data-id="${taskId}"]`)?.focus();
        });
        return;
      }
    }

    const actionButton = event.target.closest("button");
    if (actionButton && [" ", "Enter"].includes(event.key)) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const rows = [...elements.taskList.querySelectorAll(".task-item")];
      const currentIndex = rows.indexOf(row);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + rows.length) % rows.length;
      rows[nextIndex]?.focus();
      return;
    }

    let action = "";
    if (event.key === " " || event.key === "Enter") action = "done";
    if (event.key.toLowerCase() === "m") action = "miss";
    if (event.key === "Delete") action = "delete";
    if (!action) return;
    if (task.status === "done") return;

    event.preventDefault();
    if (action === "delete") deleteTask(taskId);
    else updateTask(taskId, action);
    window.requestAnimationFrame(() => {
      elements.taskList.querySelector(`[data-id="${taskId}"]`)?.focus();
    });
  });

  elements.suggestionRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-suggestion]");
    if (!button) return;
    addTask(button.dataset.suggestion);
  });

  elements.clearCompleted.addEventListener("click", clearCompletedTasks);
  elements.perfectMarkButton.addEventListener("click", openPerfectMarkChoice);
  elements.markChoiceClose.addEventListener("click", closePerfectMarkChoice);
  elements.markChoiceOverlay.addEventListener("click", (event) => {
    if (event.target === elements.markChoiceOverlay) closePerfectMarkChoice();
  });
  elements.markChoiceGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice-character-id]");
    if (button) choosePerfectMark(button.dataset.choiceCharacterId);
  });

  document.querySelector(".view-switch")?.addEventListener("click", (event) => {
    const artButton = event.target.closest("[data-art]");
    if (artButton) {
      const character = selectedCharacter();
      const metrics = getMetrics();
      const form = STAGE_ART_IDS.has(artButton.dataset.art)
        ? artButton.dataset.art
        : "cute";
      if (!characterIsUnlocked(character, metrics, form)) {
        showToast({
          title: `${character.name}的${CHARACTER_FORM_LABELS[form]}尚未解锁`,
          message: `再收集 ${characterUnlockMarks(
            character,
            metrics,
            form,
          )} 枚${character.name}专属印记，即可切换到${CHARACTER_FORM_LABELS[form]}形态。`,
          icon: "lock-keyhole",
        });
        return;
      }
      selectCharacter(character.id, form);
      return;
    }
  });

  elements.companionTabs.addEventListener("click", (event) => {
    if (event.target.closest("[data-companion-expand]")) {
      companionTabsExpanded = !companionTabsExpanded;
      renderCompanions();
      elements.companionTabs.classList.remove("is-layout-changing");
      void elements.companionTabs.offsetWidth;
      elements.companionTabs.classList.add("is-layout-changing");
      window.setTimeout(
        () => elements.companionTabs.classList.remove("is-layout-changing"),
        420,
      );
      refreshIcons();
      return;
    }
    const button = event.target.closest("[data-character-id]");
    if (button) selectCharacter(button.dataset.characterId);
  });

  elements.collectionGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-character-id]");
    if (button) selectCharacter(button.dataset.characterId);
  });
  elements.collectionPrev.addEventListener("click", () => {
    collectionPageIndex -= 1;
    updateCollectionCarousel();
  });
  elements.collectionNext.addEventListener("click", () => {
    collectionPageIndex += 1;
    updateCollectionCarousel();
  });

  elements.focusButton.addEventListener("click", toggleFocusMode);
  elements.focusComplete.addEventListener("click", completeFocusTask);
  elements.focusSkip.addEventListener("click", skipFocusTask);
  elements.soundButton.addEventListener("click", toggleSound);
  elements.mergeButton.addEventListener("click", openMerge);
  elements.mergeClose.addEventListener("click", closeMerge);
  elements.mergeConfirm.addEventListener("click", confirmMerge);
  elements.mergeOverlay.addEventListener("click", (event) => {
    if (event.target === elements.mergeOverlay) closeMerge();
  });

  document.addEventListener("keydown", (event) => {
    const editing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if (event.key === "Escape") {
      if (taskConfirmId) {
        const taskId = taskConfirmId;
        taskConfirmId = null;
        renderTasks();
        window.requestAnimationFrame(() => {
          elements.taskList.querySelector(`[data-id="${taskId}"]`)?.focus();
        });
      } else if (elements.markChoiceOverlay.classList.contains("is-visible")) {
        closePerfectMarkChoice();
      } else if (elements.mergeOverlay.classList.contains("is-visible")) {
        closeMerge();
      } else if (elements.app.classList.contains("focus-mode")) {
        toggleFocusMode();
      }
    }
    if (editing) return;

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      elements.taskInput.focus();
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFocusMode();
    }

    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      switchScreen(currentScreen === "plans" ? "today" : "plans");
    }

    const index = Number(event.key) - 1;
    if (Number.isInteger(index) && index >= 0 && index < CHARACTERS.length) {
      selectCharacter(CHARACTERS[index].id);
    }
  });
}

function initIosInstallTip() {
  if (!elements.iosInstallTip || !elements.iosInstallDismiss) return;
  const isIos =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  const dismissKey = "tidal-study-ios-install-dismissed";
  if (!isIos || isStandalone || localStorage.getItem(dismissKey) === "1") return;

  elements.iosInstallTip.hidden = false;
  elements.iosInstallDismiss.addEventListener(
    "click",
    () => {
      elements.iosInstallTip.hidden = true;
      localStorage.setItem(dismissKey, "1");
    },
    { once: true },
  );
}

function boot() {
  const startupSettlement = settlePastPerfectDays();
  farmGame = createFarmGame({
    root: elements.farmRoot,
    state,
    saveState,
    showToast,
    getMetrics,
    todayKey,
    characters: CHARACTERS,
    getSelectedCharacterId: () => state.selectedCharacterId,
    onSelectCharacter: selectCharacter,
    characterIsUnlocked,
    formThresholds: CHARACTER_FORM_THRESHOLDS,
    onStoryAction(action) {
      switchScreen("today");
      if (action === "create-task") {
        window.setTimeout(() => elements.taskInput.focus(), 120);
      }
      if (action === "focus" && !elements.app.classList.contains("focus-mode")) {
        window.setTimeout(toggleFocusMode, 120);
      }
    },
  });
  const startupFarmRewards = syncPerfectFarmRewards();
  const startupStreakReward = startupSettlement.perfectDates.length
    ? farmGame?.rewardStreakMilestone(getMetrics().streak) || null
    : null;
  renderAll();
  if (
    startupSettlement.settledDates.length ||
    startupFarmRewards.changed ||
    startupStreakReward
  ) {
    notifyPerfectSettlement(startupSettlement);
  }
  bindEvents();
  initInteractiveLightEffects();
  initIosInstallTip();
  resetPlanForm();
  const hashScreen = window.location.hash.slice(1);
  const initialScreen = ["plans", "farm"].includes(hashScreen)
    ? hashScreen
    : "today";
  switchScreen(initialScreen);
  refreshIcons();
  window.__tidalStudyBooted = true;
  const canRegisterServiceWorker =
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" ||
      ["localhost", "127.0.0.1"].includes(window.location.hostname));
  if (canRegisterServiceWorker) {
    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("./sw.js", { scope: "./", updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => {
          // 注册失败时仍继续使用普通网页模式。
        });
    };
    const scheduleServiceWorker = () => {
      window.setTimeout(registerServiceWorker, 6000);
    };
    if (document.readyState === "complete") {
      scheduleServiceWorker();
    } else {
      window.addEventListener("load", scheduleServiceWorker, { once: true });
    }
  }
  window.setInterval(
    () => runPerfectSettlement({ render: true, notify: true }),
    PERFECT_SETTLEMENT_INTERVAL_MS,
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      runPerfectSettlement({ render: true, notify: true });
    }
  });
  if (state.soundEnabled) {
    setTimeout(() => {
      audioController = createOceanSound();
      audioController.toggle();
      elements.soundButton.classList.add("is-active");
      elements.soundButton.querySelector("span").textContent = "环境音开";
    }, 200);
  }
}

boot();
