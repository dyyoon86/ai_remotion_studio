"use client";

import { useRef, useState } from "react";
import { useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  ArrowRight,
  Clock,
  Loader2,
  X,
  Camera,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  const fixed = v >= 100 || u === 0 ? v.toFixed(0) : v.toFixed(1);
  return `${fixed} ${units[u]}`;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

type UploadResponse = {
  id: string;
  name: string;
  sizeBytes: number;
  durationSeconds: number;
  durationDisplay: string;
  videoUrl: string;
  thumbnails: string[];
};

export function UploadStep() {
  const uploadedFile = useStudio((s) => s.uploadedFile);
  const setUploadedFile = useStudio((s) => s.setUploadedFile);
  const goNext = useStudio((s) => s.goNext);

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      let payload: unknown;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { error: text || res.statusText };
      }
      if (!res.ok) {
        const msg =
          (payload as { error?: string })?.error ??
          `Upload failed (${res.status})`;
        throw new Error(msg);
      }
      const data = payload as UploadResponse;
      setUploadedFile({
        id: data.id,
        name: data.name,
        duration: data.durationDisplay,
        size: formatBytes(data.sizeBytes),
        durationSeconds: data.durationSeconds,
        sizeBytes: data.sizeBytes,
        videoUrl: data.videoUrl,
        thumbnails: data.thumbnails,
      });
    } catch (e) {
      setError((e as Error).message || "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void uploadFile(f);
    // Allow re-selecting the same file later
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFile(f);
  };

  return (
    <div className="px-8 py-10 max-w-5xl mx-auto">
      <header className="mb-10">
        <Badge variant="violet" className="mb-3">
          Step 01 · Upload
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">
          영상 파일을 업로드하세요
        </h1>
        <p className="text-slate-400 text-[15px]">
          MP4, MOV, WEBM, MKV 형식을 지원합니다. 업로드 후 자동으로 썸네일과
          메타데이터를 추출합니다.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1 whitespace-pre-wrap break-words">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-rose-300/70 hover:text-rose-100"
            aria-label="오류 닫기"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {!uploadedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (uploading) {
              e.preventDefault();
              return;
            }
            onDrop(e);
          }}
          onClick={() => {
            if (!uploading) inputRef.current?.click();
          }}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden",
            "bg-slate-900/40 backdrop-blur-sm",
            uploading && "cursor-progress",
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
                ? "업로드 및 분석 중..."
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
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">MP4</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">MOV</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">WEBM</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60">MKV</span>
              <span className="text-slate-600 mx-1">·</span>
              <span>최대 200MB</span>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm,.mkv,.m4v"
              className="hidden"
              onChange={onPick}
              disabled={uploading}
            />
          </div>
        </div>
      ) : (
        <Card elevated className="p-7 slide-in">
          <div className="flex items-start gap-5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
              <FileVideo size={22} className="text-white" />
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
                      <Clock size={12} />
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

              {/* Simple cosmetic time bar (no real playback) */}
              <div className="mt-5 rounded-lg bg-slate-950/50 border border-slate-800/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-violet-600 to-violet-400" />
                  </div>
                  <div className="nums text-[11px] text-slate-500 shrink-0">
                    00:00 / {uploadedFile.duration}
                  </div>
                </div>
              </div>

              {/* Thumbnail filmstrip */}
              {uploadedFile.thumbnails && uploadedFile.thumbnails.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-300">
                    <Camera size={12} className="text-violet-400" />
                    <span>썸네일 (자동 추출)</span>
                    <span className="text-slate-600 nums">
                      · {uploadedFile.thumbnails.length}장
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {uploadedFile.thumbnails.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt={`thumbnail ${i + 1}`}
                        className="h-16 w-28 object-cover rounded-md ring-1 ring-slate-800 hover:ring-violet-500/60 transition-all shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
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
