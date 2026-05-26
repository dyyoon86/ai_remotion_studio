"use client";

import { useStudio } from "@/lib/store";
import { TopStepper } from "./TopStepper";
import { UploadStep } from "./steps/UploadStep";
import { ScriptStep } from "./steps/ScriptStep";
import { AnalysisStep } from "./steps/AnalysisStep";
import { PreviewStep } from "./steps/PreviewStep";
import { RenderStep } from "./steps/RenderStep";

const STEP_COMPONENTS = [UploadStep, ScriptStep, AnalysisStep, PreviewStep, RenderStep];

export function DashboardShell() {
  const currentStep = useStudio((s) => s.currentStep);
  const StepComponent = STEP_COMPONENTS[currentStep] ?? UploadStep;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <TopStepper />
      <div key={currentStep} className="flex-1 min-h-0 fade-up">
        <StepComponent />
      </div>
    </div>
  );
}
