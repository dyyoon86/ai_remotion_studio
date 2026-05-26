"use client";

import { Construction } from "lucide-react";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent?: string;
};

export function PlaceholderPage({ title, description, icon, accent = "#8b5cf6" }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 min-h-screen relative">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-md text-center fade-up">
        {/* Big icon ring */}
        <div className="relative inline-flex mb-7">
          <div
            className="absolute inset-0 -m-6 rounded-full blur-3xl opacity-40"
            style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
          />
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border"
            style={{
              borderColor: `${accent}40`,
              background: `linear-gradient(135deg, ${accent}15, transparent)`,
              boxShadow: `0 12px 40px -12px ${accent}50`,
            }}
          >
            <span style={{ color: accent }}>{icon}</span>
            {/* Construction badge */}
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur">
              <Construction size={14} className="text-amber-300" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-soft" />
          준비 중
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">
          {title}
        </h1>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>

        <div className="mt-8 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-600">
          Coming in next release · v0.2
        </div>
      </div>
    </div>
  );
}
