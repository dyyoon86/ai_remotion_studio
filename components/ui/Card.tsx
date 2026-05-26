"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
};

export const Card = React.forwardRef<HTMLDivElement, Props>(
  ({ className, elevated, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm",
          elevated && "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
