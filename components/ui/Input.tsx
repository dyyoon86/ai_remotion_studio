"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "inline";
};

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className, variant = "default", ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md text-sm text-slate-100 placeholder:text-slate-500 transition-all ring-focus",
          variant === "default" &&
            "bg-slate-900/70 border border-slate-700/70 px-3 py-2 focus:border-violet-500/60 focus:bg-slate-900",
          variant === "inline" &&
            "bg-transparent border border-transparent px-2 py-1.5 hover:border-slate-700/60 focus:border-violet-500/60 focus:bg-slate-900/50",
          className
        )}
        {...rest}
      />
    );
  }
);
Input.displayName = "Input";
