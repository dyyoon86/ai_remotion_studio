"use client";

import { useRef, useState } from "react";
import { useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileAudio,
  CheckCircle2,
  Play,
  ArrowRight,
  Music4,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

function MockWaveform({ bars = 64, playing = false }: { bars?: number; playing?: boolean }) {
  // Deterministic pseudo-random for stable SSR/CSR
  const heights = Array.from({ length: bars }, (_, i) => {
    const t = (i / bars) * Math.PI * 4;
    const base = 0.5 + 0.5 * Math.sin(t) * Math.cos(t * 0.7 + 1.2);
    const noise = ((i * 9301 + 49297) % 233280) / 233280;
    return Math.max(0.15, Math.min(1, base * 0.7 + noise * 0.5));
  });

  return (
    <div className="flex items-center gap-[2px] h-16 w-full">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h * 100}%`, animationDelay: `${i * 30}ms` }}
          className={cn(
            "flex-1 rounded-full transition-all",
            playing
              ? "bg-gradient-to-t from-violet-600 to-violet-300 pulse-soft"
              : i < bars * 0.25
              ? "bg-violet-500/70"
              : "bg-slate-700/60"
          )}
        />
      ))}
    </div>
  );
}

export function UploadStep() {
  const uploadedFile = useStudio((s) => s.uploadedFile);
  const setUploadedFile = useStudio((s) => s.setUploadedFile);
  const goNext = useStudio((s) => s.goNext);

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (name: string) => {
    setUploading(true);
    // Simulate upload latency
    setTimeout(() => {
      setUploadedFile({
        name: name || "recording_session_01.mp3",
        duration: "3:42",
        size: "5.4 MB",
      });
      setUploading(false);
    }, 700);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f.name);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f.name);
  };

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <header className="mb-10">
        <Badge variant="violet" className="mb-3">
          Step 01 · Upload
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
          음성 파일을 업로드하세요
        </h1>
        <p className="text-slate-400 text-[15px]">
          MP3, WAV, M4A 형식을 지원합니다. AI가 자동으로 텍스트를 추출하고 씬을 분석합니다.
        </p>
      </header>

      {!uploadedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
            "bg-slate-900/40 backdrop-blur-sm",
            dragOver
              ? "border-violet-400 bg-violet-500/5 scale-[1.01] glow-violet"
              : "border-slate-700 hover:border-violet-500/60 hover:bg-slate-900/70"
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-stripes opacity-60 pointer-events-none" />

          <div className="relative px-8 py-20 flex flex-col items-center text-center">
            <div
              className={cn(
                "relative flex h-20 w-20 items-center justify-center rounded-2xl mb-6 transition-all",
                dragOver
                  ? "bg-violet-500 text-white"
                  : "bg-slate-800/70 text-violet-400"
              )}
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={36} />
              ) : (
                <UploadCloud size={36} strokeWidth={1.6} />
              )}
              {!uploading && (
                <span className="absolute -inset-2 rounded-3xl border border-violet-500/20 pulse-soft" />
              )}
            </div>

            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              {uploading
                ? "파일 분석 중..."
                : dragOver
                ? "여기에 놓아주세요"
                : "파일을 끌어다 놓으세요"}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              또는{" "}
              <span className="text-violet-300 underline underline-offset-4 decoration-violet-500/40">
                컴퓨터에서 선택
              </span>
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 nums">
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">MP3</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">WAV</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">M4A</span>
              <span className="text-slate-600 mx-1">·</span>
              <span>최대 100MB</span>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/*"
              className="hidden"
              onChange={onPick}
            />
          </div>
        </div>
      ) : (
        <Card elevated className="p-7 slide-in">
          <div className="flex items-start gap-5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
              <FileAudio size={22} className="text-white" />
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-slate-900">
                <CheckCircle2 size={12} className="text-white" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-slate-100 truncate">
                    {uploadedFile.name}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 nums">
                    <span className="flex items-center gap-1">
                      <Music4 size={12} />
                      {uploadedFile.duration}
                    </span>
                    <span>·</span>
                    <span>{uploadedFile.size}</span>
                    <span>·</span>
                    <Badge variant="success" className="!text-[10px]">
                      <CheckCircle2 size={10} />
                      업로드 완료
                    </Badge>
                  </div>
                </div>

                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="제거"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-lg bg-slate-950/50 border border-slate-800/60 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-400 transition-colors"
                    aria-label="재생"
                  >
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </button>
                  <div className="flex-1 nums text-[11px] text-slate-500">
                    00:00 / {uploadedFile.duration}
                  </div>
                </div>
                <MockWaveform bars={72} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Footer actions */}
      <div className="mt-10 flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-600">
          {uploadedFile ? "Ready · 다음 단계로 진행하세요" : "Waiting for file..."}
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={!uploadedFile}
          onClick={goNext}
          rightIcon={<ArrowRight size={18} />}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
}
