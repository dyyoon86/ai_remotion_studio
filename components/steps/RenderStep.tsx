"use client";

import { useEffect, useRef, useState } from "react";
import { useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScenePlayer } from "@/components/ScenePlayer";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Film,
  Loader2,
  Mic,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { buildSrt } from "@/lib/srt";
import type { Scene } from "@/lib/store";

const PSEUDO_TICK_MS = 400;
const PSEUDO_CAP = 90;

type RenderPhase = null | "tts" | "render";

type VoiceOption = { id: string; label: string };
const VOICE_OPTIONS: VoiceOption[] = [
  { id: "ko-KR-SunHiNeural", label: "한국어 여성 (SunHi)" },
  { id: "ko-KR-InJoonNeural", label: "한국어 남성 (InJoon)" },
  { id: "en-US-AriaNeural", label: "영문 여성 (Aria)" },
  { id: "en-US-GuyNeural", label: "영문 남성 (Guy)" },
];
const DEFAULT_VOICE = VOICE_OPTIONS[0].id;

type TtsResponse = {
  tts: {
    sceneId: string;
    audioUrl: string;
    durationSeconds: number;
    durationFrames: number;
  }[];
};

function startPseudoProgress(
  scenes: Scene[],
  setRenderProgress: (id: string, progress: number) => void,
): ReturnType<typeof setInterval> {
  // Reset progress for all scenes
  scenes.forEach((s) => setRenderProgress(s.id, 0));
  const current: Record<string, number> = {};
  scenes.forEach((s) => (current[s.id] = 0));

  return setInterval(() => {
    for (const s of scenes) {
      const cur = current[s.id] ?? 0;
      if (cur >= PSEUDO_CAP) continue;
      // Small random step toward the cap
      const step = Math.random() * 3 + 0.5;
      const next = Math.min(PSEUDO_CAP, cur + step);
      current[s.id] = next;
      setRenderProgress(s.id, Math.round(next));
    }
  }, PSEUDO_TICK_MS);
}

export function RenderStep() {
  const scenes = useStudio((s) => s.scenes);
  const renderProgress = useStudio((s) => s.renderProgress);
  const setRenderProgress = useStudio((s) => s.setRenderProgress);
  const isRendering = useStudio((s) => s.isRendering);
  const setIsRendering = useStudio((s) => s.setIsRendering);
  const renderComplete = useStudio((s) => s.renderComplete);
  const setRenderComplete = useStudio((s) => s.setRenderComplete);
  const updateScene = useStudio((s) => s.updateScene);
  const resetAll = useStudio((s) => s.resetAll);
  const setStep = useStudio((s) => s.setStep);
  const uploadedFile = useStudio((s) => s.uploadedFile);
  const mixOriginalAudio = useStudio((s) => s.mixOriginalAudio);
  const setMixOriginalAudio = useStudio((s) => s.setMixOriginalAudio);

  const [showToast, setShowToast] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderPhase, setRenderPhase] = useState<RenderPhase>(null);
  const [voice, setVoice] = useState<string>(DEFAULT_VOICE);
  const startedRef = useRef(false);
  const pseudoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  const realRender = async () => {
    setIsRendering(true);
    setRenderComplete(false);
    setRenderError(null);
    setRenderUrl(null);
    setRenderPhase("tts");

    // Show indeterminate progress while server works.
    if (pseudoTimerRef.current) clearInterval(pseudoTimerRef.current);
    pseudoTimerRef.current = startPseudoProgress(scenes, setRenderProgress);

    try {
      // Phase 1: TTS for each scene with non-empty narration.
      const sceneInputs = scenes
        .filter((s) => s.narration && s.narration.trim())
        .map((s) => ({ id: s.id, narration: s.narration }));

      if (sceneInputs.length > 0) {
        try {
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            body: JSON.stringify({
              scenes: sceneInputs,
              voice: voiceRef.current,
            }),
            headers: { "content-type": "application/json" },
          });
          if (ttsRes.ok) {
            const data = (await ttsRes.json()) as TtsResponse;
            for (const t of data.tts) {
              updateScene(t.sceneId, {
                audioUrl: t.audioUrl,
                durationFrames: t.durationFrames,
              });
            }
          } else {
            const err = await ttsRes
              .json()
              .catch(() => ({ error: ttsRes.statusText } as { error: string }));
            console.warn(
              "[render] TTS step failed; continuing with default 3s scenes:",
              err.error,
            );
          }
        } catch (e) {
          console.warn(
            "[render] TTS step threw; continuing with default 3s scenes:",
            e,
          );
        }
      }

      // Phase 2: render — read the LATEST scenes from store after TTS updates.
      setRenderPhase("render");
      const latestState = useStudio.getState();
      const latestScenes = latestState.scenes;
      const res = await fetch("/api/render", {
        method: "POST",
        body: JSON.stringify({
          scenes: latestScenes,
          mixOriginalAudio: latestState.mixOriginalAudio,
          sourceVideoUrl: latestState.uploadedFile?.videoUrl,
        }),
        headers: { "content-type": "application/json" },
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: res.statusText } as { error: string }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { url: string };

      if (pseudoTimerRef.current) {
        clearInterval(pseudoTimerRef.current);
        pseudoTimerRef.current = null;
      }
      // Lock all to 100
      latestScenes.forEach((s) => setRenderProgress(s.id, 100));
      setRenderUrl(data.url);
      setRenderComplete(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3800);
    } catch (e) {
      if (pseudoTimerRef.current) {
        clearInterval(pseudoTimerRef.current);
        pseudoTimerRef.current = null;
      }
      setRenderError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRendering(false);
      setRenderPhase(null);
    }
  };

  // Start render automatically when entering this step
  useEffect(() => {
    if (startedRef.current) return;
    if (renderComplete) return;
    startedRef.current = true;
    void realRender();
    return () => {
      if (pseudoTimerRef.current) {
        clearInterval(pseudoTimerRef.current);
        pseudoTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    if (pseudoTimerRef.current) {
      clearInterval(pseudoTimerRef.current);
      pseudoTimerRef.current = null;
    }
    startedRef.current = false;
    resetAll();
    setStep(0);
  };

  const handleRetry = () => {
    startedRef.current = true;
    void realRender();
  };

  const handleDownloadMp4 = () => {
    if (!renderUrl) return;
    const a = document.createElement("a");
    a.href = renderUrl;
    a.download = "video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadSrt = () => {
    const text = buildSrt(scenes);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitle.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalProgress = Math.round(
    scenes.reduce((sum, s) => sum + (renderProgress[s.id] ?? 0), 0) /
      Math.max(1, scenes.length),
  );

  const completedCount = scenes.filter(
    (s) => (renderProgress[s.id] ?? 0) >= 100,
  ).length;

  const headlineCopy = renderComplete
    ? "MP4 와 자막(SRT) 모두 다운로드할 수 있습니다."
    : renderPhase === "tts"
      ? "edge-tts 로 씬별 음성을 생성하는 중입니다."
      : renderPhase === "render"
        ? "Remotion 으로 인코딩 + 오디오 믹스 진행 중입니다."
        : "Remotion 으로 실제 인코딩 중입니다. 첫 실행은 Chromium 다운로드로 1-2분 소요됩니다.";

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto relative">
      {/* Success toast */}
      {showToast && (
        <div className="fixed top-8 right-8 z-50 slide-in">
          <Card className="!bg-emerald-950/80 !border-emerald-500/40 backdrop-blur-xl px-5 py-4 flex items-center gap-3 shadow-2xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
              <PartyPopper size={18} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-100">
                렌더링 완료!
              </div>
              <div className="text-xs text-emerald-300/80">
                MP4 와 SRT 모두 다운로드 가능합니다.
              </div>
            </div>
          </Card>
        </div>
      )}

      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge variant="violet" className="mb-3">
            Step 05 · Render
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
            {renderComplete ? (
              <span>
                <span className="text-gradient-violet">렌더링 완료</span>{" "}
                <span className="inline-block">🎬</span>
              </span>
            ) : renderPhase === "tts" ? (
              "음성 생성 중..."
            ) : (
              "씬 렌더링 중..."
            )}
          </h1>
          <p className="text-slate-400 text-[15px]">{headlineCopy}</p>
        </div>

        {/* Voice selector */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <label className="text-[11px] uppercase tracking-wider text-slate-500">
            음성
          </label>
          <div className="relative">
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              disabled={isRendering}
              className={cn(
                "appearance-none rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 pr-7 text-sm text-slate-200",
                "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500",
                isRendering && "opacity-50 cursor-not-allowed",
              )}
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            <Mic
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      </header>

      {/* Error banner */}
      {renderError && (
        <Card
          elevated
          className="p-5 mb-7 !bg-rose-950/40 !border-rose-500/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-rose-100 mb-1">
                렌더링 실패
              </div>
              <div className="text-xs text-rose-200/80 font-mono break-all">
                {renderError}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={handleRetry}
              disabled={isRendering}
            >
              다시 시도
            </Button>
          </div>
        </Card>
      )}

      {/* Overall progress card */}
      <Card elevated className="p-6 mb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                renderComplete
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-violet-500/15 text-violet-300",
              )}
            >
              {renderComplete ? (
                <CheckCircle2 size={20} />
              ) : (
                <Loader2 size={20} className="animate-spin" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {renderComplete
                  ? "All Done"
                  : renderPhase === "tts"
                    ? "Synthesizing"
                    : "Encoding"}
              </div>
              <div className="text-xs text-slate-500 nums">
                {completedCount} / {scenes.length} 씬 · {totalProgress}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 nums">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>
                ~
                {Math.max(
                  0,
                  scenes.length * 3 -
                    Math.round((totalProgress / 100) * scenes.length * 3),
                )}
                s left
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-400" />
              <span>1920×1080 · 30fps</span>
            </div>
          </div>
        </div>

        {/* Big progress bar */}
        <div className="relative h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-200",
              renderComplete
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : "bg-gradient-to-r from-violet-600 via-violet-400 to-indigo-400",
            )}
            style={{ width: `${totalProgress}%` }}
          >
            {!renderComplete && totalProgress > 0 && (
              <div className="absolute inset-0 shimmer" />
            )}
          </div>
        </div>
      </Card>

      {/* Mix original audio toggle */}
      <Card
        className={cn(
          "p-4 mb-7 transition-colors",
          mixOriginalAudio
            ? "border-violet-500/30 bg-violet-500/[0.04]"
            : "",
        )}
      >
        <label
          className={cn(
            "flex items-start gap-3 select-none",
            !uploadedFile?.videoUrl || isRendering
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer",
          )}
          title={
            !uploadedFile?.videoUrl
              ? "원본 비디오가 업로드된 경우에만 사용 가능"
              : undefined
          }
        >
          <input
            type="checkbox"
            checked={mixOriginalAudio}
            disabled={!uploadedFile?.videoUrl || isRendering}
            onChange={(e) => setMixOriginalAudio(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 accent-violet-500 disabled:cursor-not-allowed"
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-100">
              🎵 원본 영상 오디오 믹스 (배경)
            </div>
            <div className="text-[12px] text-slate-400 mt-0.5">
              업로드한 비디오의 원본 사운드를 낮은 볼륨으로 함께 깔아 재생합니다.
            </div>
            {!uploadedFile?.videoUrl && (
              <div className="text-[11px] text-amber-300/80 mt-1 font-mono">
                원본 비디오가 업로드된 경우에만 사용 가능
              </div>
            )}
          </div>
        </label>
      </Card>

      {/* Per-scene queue */}
      <div className="space-y-3 mb-10">
        {scenes.map((scene) => {
          const pct = renderProgress[scene.id] ?? 0;
          const isDone = pct >= 100;
          const isActive = isRendering && !isDone;
          const isPending = !isActive && !isDone;
          const isTtsPhase = renderPhase === "tts";

          return (
            <Card
              key={scene.id}
              className={cn(
                "p-4 transition-all",
                isActive && "border-violet-500/40 bg-violet-500/[0.03]",
                isDone && "border-emerald-500/20",
                isPending && "opacity-60",
              )}
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="shrink-0 rounded-md overflow-hidden ring-1 ring-slate-800">
                  <ScenePlayer
                    scene={scene}
                    width={96}
                    height={54}
                    autoPlay={isActive || isDone}
                    loop
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs text-slate-500 nums">
                      #{String(scene.index).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {scene.titleMeta || scene.title}
                    </span>
                    {isDone && (
                      <Badge variant="success" className="!text-[9px]">
                        <CheckCircle2 size={9} />
                        완료
                      </Badge>
                    )}
                    {isActive && isTtsPhase && (
                      <Badge variant="violet" className="!text-[9px]">
                        <Mic size={9} />
                        음성
                      </Badge>
                    )}
                    {isActive && !isTtsPhase && (
                      <Badge variant="violet" className="!text-[9px]">
                        <Loader2 size={9} className="animate-spin" />
                        인코딩
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="ghost" className="!text-[9px]">
                        대기
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-200",
                        isDone
                          ? "bg-emerald-500"
                          : isActive
                            ? "bg-gradient-to-r from-violet-500 to-violet-400"
                            : "bg-slate-700",
                      )}
                      style={{
                        width: `${pct}%`,
                        background: isDone ? scene.accentColor : undefined,
                      }}
                    >
                      {isActive && <div className="absolute inset-0 shimmer" />}
                    </div>
                  </div>
                </div>

                {/* Pct */}
                <div className="shrink-0 w-12 text-right font-mono text-sm text-slate-400 nums">
                  {pct}%
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          leftIcon={<RotateCcw size={16} />}
          onClick={handleReset}
        >
          처음으로
        </Button>

        <div className="flex items-center gap-3">
          {!renderComplete && !renderError && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={13} className="text-violet-400" />
              <span>
                {renderPhase === "tts"
                  ? "AI 음성 생성 진행 중"
                  : "AI 자동 인코딩 진행 중"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {renderComplete ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!renderUrl}
                  leftIcon={<Download size={18} />}
                  className="!px-8"
                  onClick={handleDownloadMp4}
                >
                  MP4 다운로드
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  disabled={scenes.length === 0}
                  leftIcon={<Download size={18} />}
                  onClick={handleDownloadSrt}
                >
                  SRT 다운로드
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                disabled
                leftIcon={<Film size={18} />}
                className="!px-8"
              >
                {renderPhase === "tts" ? "음성 생성 중..." : "렌더링 중..."}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
