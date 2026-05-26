"use client";

import { useEffect, useState } from "react";
import { useStudio } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, ArrowRight, FileText, Sparkles, Wand2 } from "lucide-react";
import { MOCK_SCRIPT } from "@/lib/mock-data";

export function ScriptStep() {
  const script = useStudio((s) => s.script);
  const setScript = useStudio((s) => s.setScript);
  const goNext = useStudio((s) => s.goNext);
  const goPrev = useStudio((s) => s.goPrev);

  const [pulse, setPulse] = useState(false);

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
        <span>대본이 비어 있어도 음성 인식 결과로 자동 생성됩니다.</span>
      </div>

      {/* Footer actions */}
      <div className="mt-10 flex items-center justify-between">
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
