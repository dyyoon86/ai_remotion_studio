"use client";

import { useState } from "react";
import { useStudio, TEMPLATE_OPTIONS, type TemplateId, type TemplateCandidate, type TranscriptLine } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ScenePlayer } from "@/components/ScenePlayer";
import {
  ArrowLeft, ArrowRight, ImageIcon, Sparkles,
  ListMusic, Wand2, RefreshCw, Mic, FileWarning,
  FileText, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";

function ImageSlot({ image, sceneIndex, onPick }: { image?: string; sceneIndex: number; onPick: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPick(`https://picsum.photos/seed/scene${sceneIndex}/200`)}
      className={cn(
        "relative h-24 w-24 shrink-0 rounded-lg overflow-hidden",
        "border-2 border-dashed transition-all group",
        image
          ? "border-transparent"
          : "border-slate-700 hover:border-violet-500/60 bg-slate-950/40 bg-stripes"
      )}
      aria-label="이미지 추가"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 group-hover:text-violet-300 transition-colors">
          <ImageIcon size={20} />
          <span className="text-[10px] mt-1 font-mono">add</span>
        </div>
      )}
    </button>
  );
}

export function AnalysisStep() {
  const scenes = useStudio((s) => s.scenes);
  const scenesSource = useStudio((s) => s.scenesSource);
  const updateScene = useStudio((s) => s.updateScene);
  const transcript = useStudio((s) => s.transcript);
  const transcriptSource = useStudio((s) => s.transcriptSource);
  const transcribing = useStudio((s) => s.transcribing);
  const setTranscript = useStudio((s) => s.setTranscript);
  const setTranscribing = useStudio((s) => s.setTranscribing);
  const uploadedFile = useStudio((s) => s.uploadedFile);
  const goNext = useStudio((s) => s.goNext);
  const goPrev = useStudio((s) => s.goPrev);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [sttLanguage, setSttLanguage] = useState<string | null>(null);

  const templateLabelById = (id: TemplateId): string =>
    TEMPLATE_OPTIONS.find((t) => t.id === id)?.label ?? id;

  const reAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scenes: scenes.map((s) => ({
            id: s.id,
            title: s.title,
            narration: s.narration,
            current: s.template,
          })),
        }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as {
        recommendations?: {
          sceneId: string;
          candidates: TemplateCandidate[];
        }[];
      };

      const recs = data.recommendations ?? [];
      const sceneById = new Map(scenes.map((s) => [s.id, s] as const));
      for (const rec of recs) {
        const scene = sceneById.get(rec.sceneId);
        if (!scene) continue;
        const candidates = rec.candidates ?? [];
        if (candidates.length === 0) continue;
        updateScene(scene.id, {
          templateCandidates: candidates,
          template: candidates[0]?.templateId ?? scene.template,
        });
      }
    } catch (e) {
      setError(
        `분석 실패: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const runSTT = async () => {
    if (!uploadedFile?.id) return;
    setTranscribing(true);
    setSttError(null);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ videoId: uploadedFile.id }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as {
        transcript: TranscriptLine[];
        language?: string;
        durationSeconds?: number;
        segmentCount: number;
      };

      setTranscript(data.transcript);
      setSttLanguage(data.language ?? null);
    } catch (e) {
      setSttError(
        `STT 실패: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setTranscribing(false);
    }
  };

  // Defensive empty state — should rarely trigger since Step 2 now seeds scenes.
  if (scenes.length === 0) {
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center px-8 py-10">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/70">
            <FileWarning size={20} className="text-violet-300" />
          </div>
          <Badge variant="violet" className="mb-3">
            Step 03 · Analyze
          </Badge>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            씬이 없습니다.
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Step 2 에서 대본을 입력하세요.
          </p>
          <Button
            variant="primary"
            leftIcon={<ArrowLeft size={16} />}
            onClick={goPrev}
          >
            대본 입력으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Header (sticky-ish) */}
      <div className="px-8 pt-8 pb-5 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Badge variant="violet" className="mb-3">
              Step 03 · Analyze
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-1.5">
              음성 인식 + AI 씬 분석
            </h1>
            <p className="text-slate-400 text-[15px]">
              AI가 자동으로 추출한 {scenes.length}개의 씬입니다. 템플릿과 텍스트를 자유롭게 편집하세요.
            </p>
            <div className="flex items-center gap-2 mt-2">
              {scenesSource === "segmented" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30">
                  <Sparkles size={11} />
                  AI 분할됨 · {scenes.length}씬
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800/60 text-slate-400 ring-1 ring-slate-700/60">
                  <FileText size={11} />
                  예시 데이터 · {scenes.length}씬
                </span>
              )}
              {transcriptSource === "stt" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30">
                  <CheckCircle2 size={11} />
                  STT 완료 · {transcript.length} segments
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30">
                  <AlertTriangle size={11} />
                  STT 미구현 · 더미 자막
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={
                transcribing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mic size={14} />
                )
              }
              onClick={runSTT}
              disabled={transcribing || !uploadedFile?.id}
              title={!uploadedFile?.id ? "비디오를 먼저 업로드하세요" : undefined}
            >
              {transcribing ? "음성 인식 중..." : "STT 실행"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} className={analyzing ? "animate-spin" : ""} />}
              onClick={reAnalyze}
              disabled={analyzing}
            >
              {analyzing ? "재분석 중..." : "재분석"}
            </Button>
          </div>
        </div>
        {sttError && (
          <div className="mt-3 rounded-md border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-[13px] text-red-200">
            {sttError}
          </div>
        )}
      </div>

      {/* Body: scenes list + right panel */}
      <div className="flex-1 min-h-0 flex">
        {/* Main: scenes */}
        <div className="flex-1 min-w-0 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-4 max-w-[1100px] rounded-md border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-[13px] text-red-200">
              {error}
            </div>
          )}
          <div className="space-y-4 max-w-[1100px]">
            {scenes.map((scene, idx) => (
              <Card
                key={scene.id}
                className="p-5 hover:border-violet-500/30 transition-colors group"
              >
                <div className="flex items-stretch gap-4">
                  {/* Index badge */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-mono text-sm font-semibold border border-slate-700/70"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${scene.accentColor}20`,
                      }}
                    >
                      {String(scene.index).padStart(2, "0")}
                    </div>
                    <div
                      className="w-1 flex-1 rounded-full"
                      style={{ background: `${scene.accentColor}40` }}
                    />
                  </div>

                  {/* Image */}
                  <ImageSlot
                    image={scene.image}
                    sceneIndex={idx + 1}
                    onPick={(url) => updateScene(scene.id, { image: url })}
                  />

                  {/* Title + Narration */}
                  <div className="flex-1 min-w-0">
                    <Input
                      variant="inline"
                      value={scene.title}
                      onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                      placeholder="씬 타이틀..."
                      className="!text-[15px] !font-semibold !text-slate-100"
                    />
                    <textarea
                      value={scene.narration}
                      onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
                      placeholder="내래이션 텍스트..."
                      className="mt-1 w-full bg-transparent border border-transparent hover:border-slate-700/50 focus:border-violet-500/60 focus:bg-slate-900/50 rounded-md px-2 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 resize-none leading-relaxed transition-all ring-focus"
                      rows={2}
                    />

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <Mic size={11} className="text-violet-400" />
                      <span>STT 신뢰도 98%</span>
                      <span className="text-slate-700">·</span>
                      <span>{scene.narration.length} chars</span>
                    </div>
                  </div>

                  {/* Template select */}
                  <div className="shrink-0 w-48">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      Template
                    </div>
                    <Select
                      value={scene.template}
                      onChange={(v) => updateScene(scene.id, { template: v as typeof scene.template })}
                      options={TEMPLATE_OPTIONS.map((t) => ({ value: t.id, label: t.label }))}
                      size="sm"
                      className="w-full"
                    />
                    {scene.templateCandidates && scene.templateCandidates.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {scene.templateCandidates.slice(0, 3).map((cand) => {
                          const active = scene.template === cand.templateId;
                          return (
                            <button
                              key={cand.templateId}
                              type="button"
                              onClick={() =>
                                updateScene(scene.id, { template: cand.templateId })
                              }
                              title={cand.reason}
                              className={cn(
                                "px-1.5 py-0.5 rounded-md font-mono text-[10px] leading-tight border transition-colors",
                                active
                                  ? "border-violet-400/70 bg-violet-500/15 text-violet-100"
                                  : "border-slate-700/70 bg-slate-900/40 text-slate-300 hover:border-violet-500/50 hover:text-violet-200",
                              )}
                            >
                              {templateLabelById(cand.templateId)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mini preview */}
                  <div className="shrink-0 flex flex-col items-end">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      Preview
                    </div>
                    <div className="rounded-md overflow-hidden ring-1 ring-slate-800 group-hover:ring-violet-500/40 transition-all">
                      <ScenePlayer
                        scene={scene}
                        width={120}
                        height={68}
                        autoPlay
                        loop
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-2">
              <Wand2 size={13} />
              씬 수동 추가
            </button>
          </div>
        </div>

        {/* Right panel: transcript */}
        <aside className="w-[340px] shrink-0 border-l border-slate-800/60 bg-slate-950/40 flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2 mb-1">
              <ListMusic size={15} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-100">전체 자막</h3>
              {transcriptSource === "stt" ? (
                <Badge variant="success" className="ml-auto !text-[9px]">
                  STT
                </Badge>
              ) : (
                <Badge variant="warning" className="ml-auto !text-[9px]">
                  MOCK
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {transcriptSource === "stt"
                ? `총 ${transcript.length}개 · faster-whisper / ${sttLanguage ?? "ko"}`
                : `총 ${transcript.length}개 · STT 모듈 미구현 (목업)`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {transcript.map((line) => (
              <div
                key={line.id}
                className="group rounded-md px-3 py-2.5 hover:bg-slate-900/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono nums text-violet-400">
                    {line.timestamp}
                  </span>
                  {line.sceneId && (
                    <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
                      → {line.sceneId.replace("scene-", "#")}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed">
                  {line.text}
                </p>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <Sparkles size={12} className="text-violet-400" />
            <span>AI가 자동 구간 분할</span>
          </div>
        </aside>
      </div>

      {/* Footer actions */}
      <div className="px-8 py-5 border-t border-slate-800/60 bg-slate-950/60 flex items-center justify-between">
        <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={goPrev}>
          이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={goNext}
          rightIcon={<ArrowRight size={18} />}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
}
