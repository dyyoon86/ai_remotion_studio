"use client";

import { create } from "zustand";
import { INITIAL_SCENES, INITIAL_TRANSCRIPT } from "./mock-data";

export type TemplateId =
  | "comparison"
  | "intro"
  | "highlight"
  | "imagecard";

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "comparison", label: "비교분석" },
  { id: "intro", label: "인트로" },
  { id: "highlight", label: "텍스트강조" },
  { id: "imagecard", label: "이미지카드" },
];

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
