"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg bg-slate-900/70 border border-slate-700/70 text-slate-100 placeholder:text-slate-500",
          "px-4 py-3 text-[15px] leading-relaxed transition-all ring-focus",
          "focus:border-violet-500/60 focus:bg-slate-900 resize-y",
          className
        )}
        {...rest}
      />
    );
  }
);
Textarea.displayName = "Textarea";
