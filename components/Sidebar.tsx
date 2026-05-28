"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  Clock3,
  Tag,
  Sparkles,
  FolderOpen,
  Plus,
  Trash2,
  Pencil,
  Save,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useStudio } from "@/lib/store";

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

function formatProjectTime(ms: number): string {
  try {
    const d = new Date(ms);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${mm}/${dd} ${hh}:${mi}`;
  } catch {
    return "";
  }
}

function ProjectsPanel() {
  const projects = useStudio((s) => s.projects);
  const activeProjectId = useStudio((s) => s.activeProjectId);
  const loadProjects = useStudio((s) => s.loadProjects);
  const newProject = useStudio((s) => s.newProject);
  const switchProject = useStudio((s) => s.switchProject);
  const saveCurrentProject = useStudio((s) => s.saveCurrentProject);
  const deleteProject = useStudio((s) => s.deleteProject);
  const renameProject = useStudio((s) => s.renameProject);

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState<string>("");
  const [savedFlash, setSavedFlash] = React.useState<boolean>(false);
  const renameInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load projects once on mount (idempotent — store also no-ops if already loaded)
  const hydratedRef = React.useRef(false);
  React.useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    loadProjects();
  }, [loadProjects]);

  React.useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleNew = React.useCallback(() => {
    // Auto-save current first so we don't lose in-progress edits
    saveCurrentProject();
    newProject();
  }, [newProject, saveCurrentProject]);

  const handleSave = React.useCallback(() => {
    saveCurrentProject();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, [saveCurrentProject]);

  const handleDelete = React.useCallback(
    (id: string, name: string) => {
      const ok = window.confirm(`"${name}" 프로젝트를 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`);
      if (!ok) return;
      deleteProject(id);
    },
    [deleteProject]
  );

  const startRename = React.useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameDraft(currentName);
  }, []);

  const commitRename = React.useCallback(() => {
    if (renamingId && renameDraft.trim().length > 0) {
      renameProject(renamingId, renameDraft);
    }
    setRenamingId(null);
    setRenameDraft("");
  }, [renamingId, renameDraft, renameProject]);

  const cancelRename = React.useCallback(() => {
    setRenamingId(null);
    setRenameDraft("");
  }, []);

  return (
    <div className="px-3 pb-4">
      <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <FolderOpen size={14} className="text-violet-300" />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300">
              프로젝트
            </span>
            <span className="text-[10px] text-slate-500">({projects.length})</span>
          </div>
        </div>

        {/* New project button */}
        <div className="px-2 pt-2">
          <button
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-violet-500/40 bg-violet-500/5 px-2 py-1.5 text-[12px] font-medium text-violet-200 hover:bg-violet-500/15 hover:border-violet-400/60 transition-colors"
            title="새 프로젝트 만들기"
          >
            <Plus size={13} />
            <span>새 프로젝트</span>
          </button>
        </div>

        {/* Project list */}
        <ul className="px-2 py-2 max-h-[280px] overflow-y-auto space-y-1">
          {projects.length === 0 && (
            <li className="px-2 py-3 text-[11px] text-slate-500 text-center">
              프로젝트가 없습니다.
            </li>
          )}
          {projects.map((p) => {
            const active = p.id === activeProjectId;
            const isRenaming = renamingId === p.id;
            const sceneCount = p.snapshot?.scenes?.length ?? 0;
            return (
              <li
                key={p.id}
                className={cn(
                  "group relative rounded-md border transition-colors",
                  active
                    ? "border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/30"
                    : "border-transparent hover:border-slate-700/70 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-start gap-1 p-2">
                  <button
                    type="button"
                    onClick={() => !isRenaming && switchProject(p.id)}
                    className="flex-1 min-w-0 text-left"
                    title={isRenaming ? undefined : "이 프로젝트로 전환"}
                  >
                    {isRenaming ? (
                      <input
                        ref={renameInputRef}
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            cancelRename();
                          }
                        }}
                        onBlur={commitRename}
                        className="w-full bg-slate-950/60 border border-slate-700 rounded px-1.5 py-0.5 text-[12px] text-slate-100 outline-none focus:border-violet-500"
                        maxLength={48}
                      />
                    ) : (
                      <div
                        className={cn(
                          "text-[12.5px] font-medium leading-tight truncate",
                          active ? "text-violet-100" : "text-slate-200"
                        )}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRename(p.id, p.name);
                        }}
                      >
                        {p.name}
                      </div>
                    )}
                    <div className="mt-0.5 text-[10px] text-slate-500 font-mono tracking-tight truncate">
                      {formatProjectTime(p.updatedAt)} · {sceneCount}씬
                    </div>
                  </button>

                  {/* Action icons */}
                  {!isRenaming && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(p.id, p.name);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/60"
                        title="이름 변경"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id, p.name);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-300 hover:bg-red-500/15"
                        title="삭제"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Save button */}
        <div className="px-2 pb-2 pt-1 border-t border-slate-800/60">
          <button
            onClick={handleSave}
            disabled={!activeProjectId}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
              savedFlash
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                : "bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 border border-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="현재 작업을 활성 프로젝트에 저장"
          >
            {savedFlash ? (
              <>
                <Check size={13} />
                <span>저장됨</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>현재 작업 저장</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

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

      {/* Nav + Projects (scrollable middle area) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className="px-3 py-5">
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

        {/* Projects panel */}
        <ProjectsPanel />
      </div>

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
