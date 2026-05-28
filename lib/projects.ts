import type {
  Scene,
  TranscriptLine,
  ScenesSource,
  TranscriptSource,
  UploadedFile,
} from "./store";

export type ProjectSnapshot = {
  uploadedFile: UploadedFile;
  script: string;
  scenes: Scene[];
  transcript: TranscriptLine[];
  scenesSource: ScenesSource;
  transcriptSource: TranscriptSource;
  currentStep: number;
  /** Whether to mix the original uploaded video's audio under the TTS track. */
  mixOriginalAudio?: boolean;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  snapshot: ProjectSnapshot;
};

const STORAGE_KEY = "remotion-ai-studio:projects.v1";
const ACTIVE_KEY = "remotion-ai-studio:projects.v1:active";

export function loadProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // basic validation: each must have an id + name + snapshot
    return parsed.filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        p.snapshot &&
        typeof p.snapshot === "object"
    );
  } catch {
    return [];
  }
}

export function saveProjectsToStorage(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to persist projects:", e);
  }
}

export function loadActiveIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    return raw && typeof raw === "string" ? raw : null;
  } catch {
    return null;
  }
}

export function saveActiveIdToStorage(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id === null) {
      window.localStorage.removeItem(ACTIVE_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_KEY, id);
    }
  } catch (e) {
    console.error("Failed to persist active project id:", e);
  }
}

export function newProjectId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultName(existing: Project[]): string {
  const n = existing.length + 1;
  return `프로젝트 ${n}`;
}
