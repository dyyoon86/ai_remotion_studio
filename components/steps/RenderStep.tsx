"use client";

import { useEffect, useRef, useState } from "react";
import { useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScenePlayer } from "@/components/ScenePlayer";
import {
  CheckCircle2, Download, Loader2, PartyPopper,
  RotateCcw, Film, Clock, Sparkles, Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

const DURATION_MS = 3000; // per scene
const TICK_MS = 60;

export function RenderStep() {
  const scenes = useStudio((s) => s.scenes);
  const renderProgress = useStudio((s) => s.renderProgress);
  const setRenderProgress = useStudio((s) => s.setRenderProgress);
  const isRendering = useStudio((s) => s.isRendering);
  const setIsRendering = useStudio((s) => s.setIsRendering);
  const renderComplete = useStudio((s) => s.renderComplete);
  const setRenderComplete = useStudio((s) => s.setRenderComplete);
  const resetAll = useStudio((s) => s.resetAll);
  const setStep = useStudio((s) => s.setStep);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [showToast, setShowToast] = useState(false);
  const startedRef = useRef(false);

  // Start render automatically when entering this step
  useEffect(() => {
    if (startedRef.current) return;
    if (renderComplete) return;
    startedRef.current = true;
    startRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRender = async () => {
    setIsRendering(true);
    setRenderComplete(false);

    for (let i = 0; i < scenes.length; i++) {
      const sceneId = scenes[i].id;
      setActiveIndex(i);
      // Reset for re-renders
      setRenderProgress(sceneId, 0);
      await new Promise<void>((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const pct = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
          setRenderProgress(sceneId, pct);
          if (pct >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, TICK_MS);
      });
    }

    setActiveIndex(-1);
    setIsRendering(false);
    setRenderComplete(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const handleReset = () => {
    resetAll();
    setStep(0);
  };

  const totalProgress = Math.round(
    scenes.reduce((sum, s) => sum + (renderProgress[s.id] ?? 0), 0) / Math.max(1, scenes.length)
  );

  const completedCount = scenes.filter((s) => (renderProgress[s.id] ?? 0) >= 100).length;

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
              <div className="text-sm font-semibold text-emerald-100">렌더링 완료!</div>
              <div className="text-xs text-emerald-300/80">모든 씬이 성공적으로 렌더링되었습니다.</div>
            </div>
          </Card>
        </div>
      )}

      <header className="mb-8">
        <Badge variant="violet" className="mb-3">
          Step 05 · Render
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
          {renderComplete ? (
            <span>
              <span className="text-gradient-violet">렌더링 완료</span>{" "}
              <span className="inline-block">🎬</span>
            </span>
          ) : (
            "씬 렌더링 중..."
          )}
        </h1>
        <p className="text-slate-400 text-[15px]">
          {renderComplete
            ? "모든 씬이 준비되었습니다. 영상을 다운로드하세요."
            : "각 씬을 순차적으로 인코딩합니다. 잠시만 기다려주세요."}
        </p>
      </header>

      {/* Overall progress card */}
      <Card elevated className="p-6 mb-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              renderComplete
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-violet-500/15 text-violet-300"
            )}>
              {renderComplete ? (
                <CheckCircle2 size={20} />
              ) : (
                <Loader2 size={20} className="animate-spin" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">
                {renderComplete ? "All Done" : "Encoding"}
              </div>
              <div className="text-xs text-slate-500 nums">
                {completedCount} / {scenes.length} 씬 · {totalProgress}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 nums">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>~{Math.max(0, scenes.length * 3 - Math.round((totalProgress / 100) * scenes.length * 3))}s left</span>
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
                : "bg-gradient-to-r from-violet-600 via-violet-400 to-indigo-400"
            )}
            style={{ width: `${totalProgress}%` }}
          >
            {!renderComplete && totalProgress > 0 && (
              <div className="absolute inset-0 shimmer" />
            )}
          </div>
        </div>
      </Card>

      {/* Per-scene queue */}
      <div className="space-y-3 mb-10">
        {scenes.map((scene, i) => {
          const pct = renderProgress[scene.id] ?? 0;
          const isActive = i === activeIndex;
          const isDone = pct >= 100;
          const isPending = !isActive && !isDone;

          return (
            <Card
              key={scene.id}
              className={cn(
                "p-4 transition-all",
                isActive && "border-violet-500/40 bg-violet-500/[0.03]",
                isDone && "border-emerald-500/20",
                isPending && "opacity-60"
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
                    {isActive && (
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
                          : "bg-slate-700"
                      )}
                      style={{ width: `${pct}%`, background: isDone ? scene.accentColor : undefined }}
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
          {!renderComplete && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={13} className="text-violet-400" />
              <span>AI 자동 인코딩 진행 중</span>
            </div>
          )}
          <Button
            variant="primary"
            size="lg"
            disabled={!renderComplete}
            leftIcon={renderComplete ? <Download size={18} /> : <Film size={18} />}
            className="!px-8"
            onClick={() => {
              // Mock download
              alert("📥 final_render.mp4 (다운로드는 모의 동작입니다)");
            }}
          >
            {renderComplete ? "다운로드" : "렌더링 중..."}
          </Button>
        </div>
      </div>
    </div>
  );
}
