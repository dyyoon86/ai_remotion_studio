"use client";

import { create } from "zustand";
import { INITIAL_SCENES, INITIAL_TRANSCRIPT } from "./mock-data";

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
};

export type TranscriptLine = {
  id: string;
  timestamp: string;
  text: string;
  sceneId?: string;
};

export type UploadedFile = {
  name: string;
  duration: string;
  size: string;
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
  transcript: TranscriptLine[];
  renderProgress: Record<string, number>;
  isRendering: boolean;
  renderComplete: boolean;

  setStep: (step: number) => void;
  goNext: () => void;
  goPrev: () => void;
  setUploadedFile: (file: UploadedFile) => void;
  setScript: (script: string) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  setRenderProgress: (id: string, progress: number) => void;
  setIsRendering: (v: boolean) => void;
  setRenderComplete: (v: boolean) => void;
  resetAll: () => void;
};

const initial = {
  currentStep: 0,
  uploadedFile: null as UploadedFile,
  script: "",
  scenes: INITIAL_SCENES,
  transcript: INITIAL_TRANSCRIPT,
  renderProgress: {} as Record<string, number>,
  isRendering: false,
  renderComplete: false,
};

export const useStudio = create<StudioState>((set, get) => ({
  ...initial,

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

  updateScene: (id, patch) =>
    set((s) => ({
      scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
    })),

  setRenderProgress: (id, progress) =>
    set((s) => ({ renderProgress: { ...s.renderProgress, [id]: progress } })),

  setIsRendering: (v) => set({ isRendering: v }),

  setRenderComplete: (v) => set({ renderComplete: v }),

  resetAll: () => {
    set({
      ...initial,
      // Re-clone scenes/transcript so editing doesn't share refs
      scenes: INITIAL_SCENES.map((s) => ({ ...s })),
      transcript: INITIAL_TRANSCRIPT.map((t) => ({ ...t })),
      renderProgress: {},
    });
  },
}));

// Helper: keep a stable reference to the get function for non-React use
export const getStudio = () => useStudio.getState();
