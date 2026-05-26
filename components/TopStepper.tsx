"use client";

import { Check } from "lucide-react";
import { useStudio, STEPS } from "@/lib/store";
import { cn } from "@/lib/cn";

export function TopStepper() {
  const currentStep = useStudio((s) => s.currentStep);
  const setStep = useStudio((s) => s.setStep);

  return (
    <div className="w-full px-8 py-6 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-md">
      <div className="flex items-start justify-between max-w-6xl">
        {STEPS.map((step, idx) => {
          const status: "done" | "active" | "todo" =
            idx < currentStep ? "done" : idx === currentStep ? "active" : "todo";
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-start flex-1 min-w-0">
              {/* Step button */}
              <button
                type="button"
                onClick={() => setStep(idx)}
                className="group flex flex-col items-start text-left min-w-0"
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 border",
                      status === "done" &&
                        "bg-violet-500/15 border-violet-500/50 text-violet-300",
                      status === "active" &&
                        "bg-violet-500 border-violet-400 text-white ring-pulse glow-violet",
                      status === "todo" &&
                        "bg-slate-900 border-slate-700/80 text-slate-500 group-hover:border-slate-600"
                    )}
                  >
                    {status === "done" ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <span className="font-mono">{idx + 1}</span>
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className="hidden md:block flex-1 h-[2px] mx-3 relative overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-slate-800" />
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500",
                          status === "done" ? "w-full" : "w-0"
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-2.5 ml-0 max-w-[180px]">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Step {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium leading-tight mt-0.5 transition-colors",
                      status === "active" && "text-slate-100",
                      status === "done" && "text-slate-300",
                      status === "todo" && "text-slate-500 group-hover:text-slate-400"
                    )}
                  >
                    {step.label}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
