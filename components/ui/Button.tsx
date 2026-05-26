"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700 disabled:bg-violet-900/60 disabled:text-violet-300/60 shadow-[0_4px_18px_-4px_rgba(139,92,246,0.5)]",
  secondary:
    "bg-slate-800/80 text-slate-100 hover:bg-slate-700 active:bg-slate-800 disabled:bg-slate-900 disabled:text-slate-500 border border-slate-700/70",
  ghost:
    "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 disabled:text-slate-600",
  danger:
    "bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700",
  outline:
    "bg-transparent border border-slate-700 text-slate-200 hover:border-violet-500/60 hover:text-violet-200 hover:bg-violet-500/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ring-focus disabled:cursor-not-allowed select-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
        {children}
        {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
      </button>
    );
  }
);
Button.displayName = "Button";
