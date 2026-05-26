"use client";

import { useStudio, ACCENT_PRESETS, TEMPLATE_OPTIONS } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ScenePlayer } from "@/components/ScenePlayer";
import {
  ArrowLeft, Play, Type, AlignLeft, Palette,
  Image as ImageIcon, Tag, FilmIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function PreviewStep() {
  const scenes = useStudio((s) => s.scenes);
  const updateScene = useStudio((s) => s.updateScene);
  const goNext = useStudio((s) => s.goNext);
  const goPrev = useStudio((s) => s.goPrev);

  return (
    <div className="px-8 py-8">
      <header className="mb-7 max-w-6xl mx-auto">
        <Badge variant="violet" className="mb-3">
          Step 04 · Review
        </Badge>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-1.5">
              파이널 리뷰
            </h1>
            <p className="text-slate-400 text-[15px]">
              각 씬의 타이틀·서브타이틀·로고·엑센트 컬러를 확정한 뒤 렌더링하세요.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 nums">
            <div className="px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-800/60">
              {scenes.length} scenes
            </div>
            <div className="px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-800/60">
              ~{(scenes.length * 3).toFixed(0)}s total
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-5 max-w-6xl mx-auto">
        {scenes.map((scene) => (
          <Card key={scene.id} className="p-6 group">
            <div className="flex items-stretch gap-6">
              {/* Left: full preview */}
              <div className="shrink-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 mb-2 flex items-center gap-1.5">
                  <FilmIcon size={11} className="text-violet-400" />
                  Live Preview · 1920×1080
                </div>
                <div
                  className="rounded-lg overflow-hidden ring-1 transition-all"
                  style={{
                    boxShadow: `0 12px 32px -16px ${scene.accentColor}50`,
                  }}
                >
                  <div className="ring-1 ring-slate-800 group-hover:ring-violet-500/40 transition-all rounded-lg overflow-hidden">
                    <ScenePlayer
                      scene={scene}
                      width={320}
                      height={180}
                      autoPlay
                      loop
                      controls={false}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 nums">
                  <span>#{String(scene.index).padStart(2, "0")}</span>
                  <span>3.0s · 90f @ 30fps</span>
                </div>
              </div>

              {/* Right: metadata */}
              <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-5 gap-y-4">
                {/* Title */}
                <div className="col-span-2">
                  <Label icon={<Type size={11} />} text="타이틀" />
                  <Input
                    value={scene.titleMeta}
                    onChange={(e) => updateScene(scene.id, { titleMeta: e.target.value })}
                    placeholder="대형 타이틀..."
                    className="!text-base !font-semibold"
                  />
                </div>

                {/* Subtitle */}
                <div className="col-span-2">
                  <Label icon={<AlignLeft size={11} />} text="서브타이틀" />
                  <Input
                    value={scene.subtitleMeta}
                    onChange={(e) => updateScene(scene.id, { subtitleMeta: e.target.value })}
                    placeholder="설명 텍스트..."
                  />
                </div>

                {/* Template (read-only display, can change) */}
                <div>
                  <Label icon={<Tag size={11} />} text="템플릿" />
                  <Select
                    value={scene.template}
                    onChange={(v) => updateScene(scene.id, { template: v as typeof scene.template })}
                    options={TEMPLATE_OPTIONS.map((t) => ({ value: t.id, label: t.label }))}
                    className="w-full"
                  />
                </div>

                {/* Logo slot */}
                <div>
                  <Label icon={<ImageIcon size={11} />} text="로고" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-10 w-10 rounded-md border border-dashed border-slate-700 hover:border-violet-500/60 bg-slate-950/40 flex items-center justify-center text-slate-500 hover:text-violet-300 transition-colors bg-stripes"
                      aria-label="로고 추가"
                    >
                      <ImageIcon size={14} />
                    </button>
                    <span className="text-xs text-slate-500">로고 미설정</span>
                  </div>
                </div>

                {/* Accent color */}
                <div className="col-span-2">
                  <Label icon={<Palette size={11} />} text="엑센트 컬러" />
                  <div className="flex items-center gap-2">
                    {ACCENT_PRESETS.map((c) => {
                      const active = c === scene.accentColor;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateScene(scene.id, { accentColor: c })}
                          className={cn(
                            "h-8 w-8 rounded-md transition-all border-2",
                            active
                              ? "scale-110 border-white/80"
                              : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                          )}
                          style={{
                            background: c,
                            boxShadow: active ? `0 4px 16px -2px ${c}80` : undefined,
                          }}
                          aria-label={`Accent ${c}`}
                        />
                      );
                    })}
                    <span className="ml-2 text-[11px] font-mono text-slate-500 nums">
                      {scene.accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer actions */}
      <div className="mt-10 max-w-6xl mx-auto flex items-center justify-between">
        <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={goPrev}>
          이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={goNext}
          rightIcon={<Play size={18} fill="currentColor" />}
          className="!px-8"
        >
          렌더링 시작
        </Button>
      </div>
    </div>
  );
}

function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500 mb-1.5 flex items-center gap-1.5">
      <span className="text-violet-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
