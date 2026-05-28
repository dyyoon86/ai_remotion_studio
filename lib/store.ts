"use client";

import { create } from "zustand";
import { INITIAL_SCENES, INITIAL_TRANSCRIPT } from "./mock-data";
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  loadActiveIdFromStorage,
  saveActiveIdToStorage,
  newProjectId,
  defaultName,
  type Project,
  type ProjectSnapshot,
} from "./projects";

export type ScenesSource = "mock" | "segmented" | "manual";

export type TranscriptSource = "mock" | "stt" | "derived";

export type TemplateId =
  | "comparison"
  | "intro"
  | "highlight"
  | "imagecard"
  | "flowSteps"
  | "keywordImpact"
  | "gridCard"
  | "numberList"
  | "layerStack"
  | "bidirectional"
  | "chatInterface"
  | "phoneChat"
  | "gaugeMeter"
  | "treeExplorer"
  | "multiPanelDash"
  | "premiumIntro"
  | "floatingCard3D"
  | "premiumMetric"
  | "gridExplosion"
  | "kineticTypo"
  | "redditStory"
  | "imageEmphasis"
  | "imageEmphasisV2"
  | "logoBrand"
  | "premiumFunnel"
  | "strategicBlueprint"
  | "orbitTimeline"
  | "logicFlow"
  | "hologramCore"
  | "cinematicMatrix"
  | "quantumSingularity"
  | "logoDualSnap"
  | "logoClone"
  | "logoMetrics"
  | "kineticCompact"
  | "comparisonV2";

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "comparison", label: "비교분석" },
  { id: "intro", label: "인트로" },
  { id: "highlight", label: "텍스트강조" },
  { id: "imagecard", label: "이미지카드" },
  { id: "flowSteps", label: "단계별 흐름도" },
  { id: "keywordImpact", label: "키워드 임팩트" },
  { id: "gridCard", label: "그리드 카드" },
  { id: "numberList", label: "번호리스트" },
  { id: "layerStack", label: "레이어 스택" },
  { id: "bidirectional", label: "양방향 연결" },
  { id: "chatInterface", label: "대화 인터페이스" },
  { id: "phoneChat", label: "스마트폰 채팅" },
  { id: "gaugeMeter", label: "게이지 측정" },
  { id: "treeExplorer", label: "트리 탐색" },
  { id: "multiPanelDash", label: "다중 패널 대시보드" },
  { id: "premiumIntro", label: "프리미엄 인트로" },
  { id: "floatingCard3D", label: "3D 플로팅 카드" },
  { id: "premiumMetric", label: "프리미엄 메트릭" },
  { id: "gridExplosion", label: "그리드 익스플로전" },
  { id: "kineticTypo", label: "키네틱 타이포" },
  { id: "redditStory", label: "레딧 스토리 모드" },
  { id: "imageEmphasis", label: "이미지 강조" },
  { id: "imageEmphasisV2", label: "이미지강조 V2" },
  { id: "logoBrand", label: "로고(브랜드)강조" },
  { id: "premiumFunnel", label: "프리미엄 퍼널" },
  { id: "strategicBlueprint", label: "전략적 블루프린트" },
  { id: "orbitTimeline", label: "궤도 타임라인" },
  { id: "logicFlow", label: "논리 흐름도" },
  { id: "hologramCore", label: "홀로그램 코어" },
  { id: "cinematicMatrix", label: "시네마틱 매트릭스" },
  { id: "quantumSingularity", label: "퀀텀 싱귤래리티" },
  { id: "logoDualSnap", label: "로고 듀얼 스냅" },
  { id: "logoClone", label: "로고분신술" },
  { id: "logoMetrics", label: "로고 강조 메트릭스" },
  { id: "kineticCompact", label: "키네틱 콤팩트" },
  { id: "comparisonV2", label: "비교분석 V2" },
];

export type TemplateCandidate = {
  templateId: TemplateId;
  reason: string;
};

export type Scene = {
  id: string;
  index: number;
  title: string;
  narration: string;
  image?: string;
  template: TemplateId;
  titleMeta: string;
  subtitleMeta: string;
  accentColor: string;
  templateCandidates?: TemplateCandidate[];
  /** Variable scene duration in frames (at 30fps). When undefined, default 90. */
  durationFrames?: number;
  /** TTS-generated audio URL like "/uploads/tts/<id>.mp3". */
  audioUrl?: string;
};

export type TranscriptLine = {
  id: string;
  timestamp: string;
  text: string;
  sceneId?: string;
};

export type UploadedFile = {
  id?: string;
  name: string;
  duration: string;          // keep for back-compat (formatted)
  size: string;              // keep for back-compat (formatted, e.g. "5.4 MB")
  durationSeconds?: number;
  sizeBytes?: number;
  videoUrl?: string;
  thumbnails?: string[];     // 8 URLs
} | null;

export const STEPS = [
  { id: 0, label: "업로드", short: "Upload" },
  { id: 1, label: "대본입력", short: "Script" },
  { id: 2, label: "음성인식 + AI 분석", short: "Analyze" },
  { id: 3, label: "파이널 리뷰", short: "Review" },
  { id: 4, label: "렌더링", short: "Render" },
] as const;

export const ACCENT_PRESETS = [
  "#8b5cf6", // violet
  "#22d3ee", // cyan
  "#f59e0b", // amber
  "#ef4444", // red
  "#10b981", // emerald
  "#ec4899", // pink
];

type StudioState = {
  currentStep: number;
  uploadedFile: UploadedFile;
  script: string;
  scenes: Scene[];
  scenesSource: ScenesSource;
  transcript: TranscriptLine[];
  transcriptSource: TranscriptSource;
  transcribing: boolean;
  renderProgress: Record<string, number>;
  isRendering: boolean;
  renderComplete: boolean;
  analyzingScript: boolean;
  /** When true, /api/render mixes original uploaded video audio under TTS at 0.25 volume. */
  mixOriginalAudio: boolean;

  // Project state (Phase 5)
  projects: Project[];
  activeProjectId: string | null;

  setStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setUploadedFile: (file: UploadedFile) => void;
  setScript: (script: string) => void;
  setScenes: (scenes: Scene[]) => void;
  setScenesSource: (source: ScenesSource) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  /** Phase 6 — scene CRUD. */
  addScene: (after?: number) => string;
  removeScene: (id: string) => void;
  reorderScenes: (ids: string[]) => void;
  setTranscript: (t: TranscriptLine[]) => void;
  setDerivedTranscript: (t: TranscriptLine[]) => void;
  setTranscribing: (v: boolean) => void;
  setRenderProgress: (id: string, progress: number) => void;
  setIsRendering: (v: boolean) => void;
  setRenderComplete: (v: boolean) => void;
  setAnalyzingScript: (v: boolean) => void;
  setMixOriginalAudio: (v: boolean) => void;
  resetAll: () => void;

  // Project actions (Phase 5)
  loadProjects: () => void;
  newProject: (name?: string) => string;
  switchProject: (id: string) => void;
  saveCurrentProject: () => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
};

const initial = {
  currentStep: 0,
  uploadedFile: null as UploadedFile,
  script: "",
  scenes: INITIAL_SCENES,
  scenesSource: "mock" as ScenesSource,
  transcript: INITIAL_TRANSCRIPT,
  transcriptSource: "mock" as TranscriptSource,
  transcribing: false,
  renderProgress: {} as Record<string, number>,
  isRendering: false,
  renderComplete: false,
  analyzingScript: false,
  mixOriginalAudio: false,
};

function buildDefaultSnapshot(): ProjectSnapshot {
  return {
    uploadedFile: null,
    script: "",
    scenes: INITIAL_SCENES.map((s) => ({ ...s })),
    transcript: INITIAL_TRANSCRIPT.map((t) => ({ ...t })),
    scenesSource: "mock",
    transcriptSource: "mock",
    currentStep: 0,
    mixOriginalAudio: false,
  };
}

function buildEmptySnapshot(): ProjectSnapshot {
  return {
    uploadedFile: null,
    script: "",
    scenes: [],
    transcript: [],
    scenesSource: "manual",
    transcriptSource: "derived",
    currentStep: 0,
    mixOriginalAudio: false,
  };
}

function snapshotFromState(s: StudioState): ProjectSnapshot {
  return {
    uploadedFile: s.uploadedFile,
    script: s.script,
    scenes: s.scenes,
    transcript: s.transcript,
    scenesSource: s.scenesSource,
    transcriptSource: s.transcriptSource,
    currentStep: s.currentStep,
    mixOriginalAudio: s.mixOriginalAudio,
  };
}

function stateFromSnapshot(snap: ProjectSnapshot): Partial<StudioState> {
  return {
    uploadedFile: snap.uploadedFile,
    script: snap.script,
    scenes: snap.scenes,
    transcript: snap.transcript,
    scenesSource: snap.scenesSource,
    transcriptSource: snap.transcriptSource,
    currentStep: snap.currentStep,
    // Legacy snapshots may not have this field — default to false.
    mixOriginalAudio: snap.mixOriginalAudio ?? false,
  };
}

export const useStudio = create<StudioState>((set, get) => ({
  ...initial,
  projects: [] as Project[],
  activeProjectId: null as string | null,

  setStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(STEPS.length - 1, step)) }),

  goNext: () =>
    set((s) => ({
      currentStep: Math.min(STEPS.length - 1, s.currentStep + 1),
    })),

  goPrev: () =>
    set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setScript: (script) => set({ script }),

  setScenes: (scenes) => set({ scenes }),

  setScenesSource: (source) => set({ scenesSource: source }),

  updateScene: (id, patch) =>
    set((s) => ({
      scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
    })),

  addScene: (after) => {
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((s) => {
      const current = s.scenes;
      // Determine insertion position (0-based index in the array).
      const insertAt =
        typeof after === "number" && after >= 0 && after <= current.length
          ? after
          : current.length;
      const accent =
        ACCENT_PRESETS[insertAt % ACCENT_PRESETS.length] ?? ACCENT_PRESETS[0];
      const fresh: Scene = {
        id: newId,
        index: insertAt + 1, // will be recomputed below
        title: "새 씬",
        narration: "",
        template: "intro",
        titleMeta: "새 씬",
        subtitleMeta: "",
        accentColor: accent,
        image: undefined,
        templateCandidates: undefined,
        durationFrames: undefined,
        audioUrl: undefined,
      };
      const next = [
        ...current.slice(0, insertAt),
        fresh,
        ...current.slice(insertAt),
      ].map((sc, i) => ({ ...sc, index: i + 1 }));
      return { scenes: next };
    });
    return newId;
  },

  removeScene: (id) =>
    set((s) => ({
      scenes: s.scenes
        .filter((sc) => sc.id !== id)
        .map((sc, i) => ({ ...sc, index: i + 1 })),
    })),

  reorderScenes: (ids) =>
    set((s) => {
      const byId = new Map(s.scenes.map((sc) => [sc.id, sc] as const));
      const seen = new Set<string>();
      const ordered: Scene[] = [];
      // First: take ids in the requested order, ignoring duplicates and unknowns.
      for (const id of ids) {
        if (seen.has(id)) continue;
        const sc = byId.get(id);
        if (!sc) continue;
        ordered.push(sc);
        seen.add(id);
      }
      // Then: append any current scenes not in the ids array, preserving their
      // existing relative order (so no scene is lost).
      for (const sc of s.scenes) {
        if (!seen.has(sc.id)) {
          ordered.push(sc);
          seen.add(sc.id);
        }
      }
      return {
        scenes: ordered.map((sc, i) => ({ ...sc, index: i + 1 })),
      };
    }),

  setTranscript: (t) => set({ transcript: t, transcriptSource: "stt" }),

  setDerivedTranscript: (t) => set({ transcript: t, transcriptSource: "derived" }),

  setTranscribing: (v) => set({ transcribing: v }),

  setRenderProgress: (id, progress) =>
    set((s) => ({ renderProgress: { ...s.renderProgress, [id]: progress } })),

  setIsRendering: (v) => set({ isRendering: v }),

  setRenderComplete: (v) => set({ renderComplete: v }),

  setAnalyzingScript: (v) => set({ analyzingScript: v }),

  setMixOriginalAudio: (v) => set({ mixOriginalAudio: v }),

  resetAll: () => {
    set({
      ...initial,
      // Re-clone scenes/transcript so editing doesn't share refs
      scenes: INITIAL_SCENES.map((s) => ({ ...s })),
      transcript: INITIAL_TRANSCRIPT.map((t) => ({ ...t })),
      renderProgress: {},
    });
  },

  // ----- Project actions (Phase 5) -----

  loadProjects: () => {
    if (typeof window === "undefined") return;
    const loaded = loadProjectsFromStorage();

    if (loaded.length === 0) {
      // First-time visitor: create implicit default project with mock data
      const id = newProjectId();
      const now = Date.now();
      const defaultProj: Project = {
        id,
        name: "프로젝트 1",
        createdAt: now,
        updatedAt: now,
        snapshot: buildDefaultSnapshot(),
      };
      const list = [defaultProj];
      saveProjectsToStorage(list);
      saveActiveIdToStorage(id);
      set({
        projects: list,
        activeProjectId: id,
        ...stateFromSnapshot(defaultProj.snapshot),
      });
      return;
    }

    // Determine active: persisted id if valid, otherwise first
    const persistedActive = loadActiveIdFromStorage();
    const active =
      (persistedActive && loaded.find((p) => p.id === persistedActive)) ||
      loaded[0];
    saveActiveIdToStorage(active.id);

    set({
      projects: loaded,
      activeProjectId: active.id,
      ...stateFromSnapshot(active.snapshot),
    });
  },

  newProject: (name) => {
    const id = newProjectId();
    const now = Date.now();
    const existing = get().projects;
    const proj: Project = {
      id,
      name: name && name.trim().length > 0 ? name.trim() : defaultName(existing),
      createdAt: now,
      updatedAt: now,
      snapshot: buildEmptySnapshot(),
    };
    const nextList = [...existing, proj];
    saveProjectsToStorage(nextList);
    saveActiveIdToStorage(id);
    set({
      projects: nextList,
      activeProjectId: id,
      ...stateFromSnapshot(proj.snapshot),
      // Always reset transient state when switching
      renderProgress: {},
      isRendering: false,
      renderComplete: false,
      transcribing: false,
      analyzingScript: false,
    });
    return id;
  },

  switchProject: (id) => {
    const { projects, activeProjectId } = get();
    if (id === activeProjectId) return;
    const target = projects.find((p) => p.id === id);
    if (!target) return;

    // Snapshot the currently-active project first so unsaved edits aren't lost.
    if (activeProjectId) {
      const currentSnap = snapshotFromState(get());
      const updatedProjects = projects.map((p) =>
        p.id === activeProjectId
          ? { ...p, snapshot: currentSnap, updatedAt: Date.now() }
          : p
      );
      saveProjectsToStorage(updatedProjects);
      // Reload target from updated list so we pick up any normalized refs
      const finalTarget = updatedProjects.find((p) => p.id === id) ?? target;
      saveActiveIdToStorage(id);
      set({
        projects: updatedProjects,
        activeProjectId: id,
        ...stateFromSnapshot(finalTarget.snapshot),
        renderProgress: {},
        isRendering: false,
        renderComplete: false,
        transcribing: false,
        analyzingScript: false,
      });
      return;
    }

    saveActiveIdToStorage(id);
    set({
      activeProjectId: id,
      ...stateFromSnapshot(target.snapshot),
      renderProgress: {},
      isRendering: false,
      renderComplete: false,
      transcribing: false,
      analyzingScript: false,
    });
  },

  saveCurrentProject: () => {
    const state = get();
    const { activeProjectId, projects } = state;
    if (!activeProjectId) return;
    const snap = snapshotFromState(state);
    const now = Date.now();
    const next = projects.map((p) =>
      p.id === activeProjectId ? { ...p, snapshot: snap, updatedAt: now } : p
    );
    saveProjectsToStorage(next);
    set({ projects: next });
  },

  deleteProject: (id) => {
    const { projects, activeProjectId } = get();
    const next = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(next);

    if (id !== activeProjectId) {
      set({ projects: next });
      return;
    }

    // Deleted was active — switch to first remaining, or null
    if (next.length === 0) {
      saveActiveIdToStorage(null);
      set({
        projects: next,
        activeProjectId: null,
        ...stateFromSnapshot(buildEmptySnapshot()),
        renderProgress: {},
        isRendering: false,
        renderComplete: false,
        transcribing: false,
        analyzingScript: false,
      });
      return;
    }

    const fallback = next[0];
    saveActiveIdToStorage(fallback.id);
    set({
      projects: next,
      activeProjectId: fallback.id,
      ...stateFromSnapshot(fallback.snapshot),
      renderProgress: {},
      isRendering: false,
      renderComplete: false,
      transcribing: false,
      analyzingScript: false,
    });
  },

  renameProject: (id, name) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    const { projects } = get();
    const next = projects.map((p) =>
      p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p
    );
    saveProjectsToStorage(next);
    set({ projects: next });
  },
}));

// Helper: keep a stable reference to the get function for non-React use
export const getStudio = () => useStudio.getState();
