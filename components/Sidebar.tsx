"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LayoutTemplate, Clock3, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/templates", label: "템플릿", icon: LayoutTemplate },
  { href: "/history", label: "히스토리", icon: Clock3 },
  { href: "/logo", label: "로고 등록", icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col">
      {/* Logo / brand */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_4px_16px_-4px_rgba(139,92,246,0.55)] group-hover:scale-105 transition-transform">
            <Sparkles size={18} className="text-white" />
            <span className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-slate-100">
              Remotion <span className="text-gradient-violet">AI</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Studio · v0.1
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5">
        <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-600">
          Workspace
        </div>
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-violet-500/10 text-violet-200"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]" />
                  )}
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors",
                      active ? "text-violet-300" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer card */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="rounded-lg bg-gradient-to-br from-violet-500/10 via-slate-900 to-slate-900 border border-violet-500/20 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-soft" />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300/90">
              Beta Online
            </span>
          </div>
          <div className="text-[12px] text-slate-400 leading-snug">
            AI 자동화로 영상 제작을<br />
            <span className="text-slate-200 font-medium">5분 안에</span> 완성합니다.
          </div>
        </div>
      </div>
    </aside>
  );
}
