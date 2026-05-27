"use client";

import { useEffect, useState } from "react";
import { useStudio, ACCENT_PRESETS, type Scene } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MOCK_SCRIPT } from "@/lib/mock-data";

type SegmentResponse = {
  scenes?: { title: string; narration: string }[];
  error?: string;
};

type AnalyzeResponse = {
  recommendations?: {
    sceneId: string;
    candidates: import("@/lib/store").TemplateCandidate[];
  }[];
};

export function ScriptStep() {
  const script = useStudio((s) => s.script);
  const setScript = useStudio((s) => s.setScript);
  const setScenes = useStudio((s) => s.setScenes);
  const setScenesSource = useStudio((s) => s.setScenesSource);
  const goNext = useStudio((s) => s.goNext);
  const goPrev = useStudio((s) => s.goPrev);
  const analyzingScript = useStudio((s) => s.analyzingScript);
  const setAnalyzingScript = useStudio((s) => s.setAnalyzingScript);

  const [pulse, setPulse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingPhase, setAnalyzingPhase] = useState<"segment" | "recommend" | null>(null);

  // Light typing-feedback animation on long pauses, just visual flavor
  useEffect(() => {
    if (!script) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
  }, [script]);

  const charCount = script.length;
  const wordCount = script.trim() === "" ? 0 : script.trim().split(/\s+/).length;
  const lineCount = script === "" ? 0 : script.split("\n").length;

  const hasUserScript =
    script.trim() !== "" && script.trim() !== MOCK_SCRIPT.trim();

  const handleNext = async () => {
    setError(null);

    // Empty or mock script → keep legacy behaviour (use INITIAL_SCENES already in store)
    if (!hasUserScript) {
      goNext();
      return;
    }

    setAnalyzingScript(true);
    setAnalyzingPhase("segment");
    try {
      const res = await fetch("/api/segment-script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ script }),
      });

      let data: SegmentResponse = {};
      try {
        data = (await res.json()) as SegmentResponse;
      } catch {
        // ignore parse failure; we'll synthesise an error below
      }

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const segs = Array.isArray(data.scenes) ? data.scenes : [];
      if (segs.length === 0) {
        throw new Error("씬을 분할하지 못했습니다.");
      }

      const newScenes: Scene[] = segs.map((seg, i) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `scene-${i + 1}-${Date.now()}`,
        index: i + 1,
        title: seg.title,
        narration: seg.narration,
        template: "intro",
        titleMeta: seg.title,
        subtitleMeta: "",
        accentColor: ACCENT_PRESETS[i % ACCENT_PRESETS.length] ?? "#8b5cf6",
        image: undefined,
      }));

      // Phase 2: auto-recommend templates for the freshly built scenes
      setAnalyzingPhase("recommend");
      try {
        const recRes = await fetch("/api/analyze-templates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            scenes: newScenes.map((s) => ({
              id: s.id,
              title: s.title,
              narration: s.narration,
              current: s.template,
            })),
          }),
        });

        if (recRes.ok) {
          const recData = (await recRes.json()) as AnalyzeResponse;
          const recs = recData.recommendations ?? [];
          const sceneById = new Map(newScenes.map((s) => [s.id, s] as const));
          for (const rec of recs) {
            const scene = sceneById.get(rec.sceneId);
            if (!scene) continue;
            const candidates = rec.candidates ?? [];
            if (candidates.length === 0) continue;
            scene.template = candidates[0]?.templateId ?? scene.template;
            scene.templateCandidates = candidates;
          }
        } else {
          console.error("[ScriptStep] analyze-templates returned", recRes.status);
        }
      } catch (recErr) {
        // Silently swallow — user can still run 재분석 manually in Step 3
        console.error("[ScriptStep] analyze-templates failed:", recErr);
      }

      setScenes(newScenes);
      setScenesSource("segmented");
      goNext();
    } catch (e) {
      setError(
        `씬 분할 실패: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setAnalyzingScript(false);
      setAnalyzingPhase(null);
    }
  };

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Badge variant="violet" className="mb-3">
            Step 02 · Script
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
            원본 대본을 입력하세요
          </h1>
          <p className="text-slate-400 text-[15px]">
            대본은 AI 음성 인식 결과와 비교·보정에 사용됩니다.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Wand2 size={14} />}
          onClick={() => setScript(MOCK_SCRIPT)}
        >
          예시 불러오기
        </Button>
      </header>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-[13px] text-red-200">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-300" />
          <span>{error}</span>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/70 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileText size={13} className="text-violet-400" />
            <span className="uppercase tracking-[0.16em]">script.md</span>
            <span className="text-slate-700">·</span>
            <span className={pulse ? "text-violet-300" : "text-slate-500"}>
              {pulse ? "editing..." : "saved"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 nums">
            <span>{lineCount} lines</span>
            <span className="text-slate-700">·</span>
            <span>{wordCount} words</span>
            <span className="text-slate-700">·</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        <Textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="원본 대본을 입력하세요...

예시:
[오프닝]
안녕하세요, 오늘은 ...
[1번 제품]
..."
          className="!rounded-none !border-0 !bg-transparent min-h-[420px] font-mono text-[14px] leading-7"
        />
      </Card>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Sparkles size={13} className="text-violet-400" />
        <span>
          {hasUserScript
            ? "AI가 씬을 자동 분할합니다"
            : "대본이 비어 있어도 음성 인식 결과로 자동 생성됩니다."}
        </span>
      </div>

      {/* Footer actions */}
      <div className="mt-10 flex items-center justify-between">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={16} />}
          onClick={goPrev}
          disabled={analyzingScript}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={analyzingScript}
          rightIcon={
            analyzingScript ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} />
            )
          }
        >
          {analyzingPhase === "segment"
            ? "씬 분할 중..."
            : analyzingPhase === "recommend"
              ? "템플릿 추천 중..."
              : "다음 단계"}
        </Button>
      </div>
    </div>
  );
}
