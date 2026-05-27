"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "violet" | "success" | "warning" | "ghost" | "info";

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-800 text-slate-300 border-slate-700/60",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ghost: "bg-transparent text-slate-400 border-slate-800",
  info: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
};

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

export function Badge({ className, variant = "default", children, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
