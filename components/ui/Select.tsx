"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  size?: "sm" | "md";
};

export function Select({ value, onChange, options, className, size = "md" }: Props) {
  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none w-full rounded-md border bg-slate-900/70 text-slate-100",
          "border-slate-700/70 hover:border-slate-600 focus:border-violet-500/60 focus:bg-slate-900",
          "pr-8 transition-all cursor-pointer ring-focus",
          size === "sm" ? "h-8 pl-3 text-xs" : "h-10 pl-3 text-sm"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
        size={size === "sm" ? 14 : 16}
      />
    </div>
  );
}
