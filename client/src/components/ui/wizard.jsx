// src/components/ui/wizard.jsx
// A multi-step Wizard component for forms.
// Props:
//   steps: Array of { title: string, component: ReactNode }
//   onFinish: () => Promise<void> | void — called when the user clicks "Save & Finish" on the last step
//   submitting: boolean — disables buttons while processing

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function Wizard({ steps = [], onFinish, submitting = false }) {
  const [currentStep, setCurrentStep] = useState(0);

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  const handleFinish = async () => {
    if (onFinish) await onFinish();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* ── Step indicator ── */}
      <nav aria-label="Progress" className="flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <React.Fragment key={idx}>
              <button
                type="button"
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                  ${isActive
                    ? "bg-emerald-600 text-white shadow-md"
                    : isCompleted
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}
                  `}>
                    {idx + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full ${idx < currentStep ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Step content ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10 animate-in fade-in duration-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{steps[currentStep]?.title}</h2>
        {steps[currentStep]?.component}
      </div>

      {/* ── Navigation ── */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isFirst}
          className="gap-2 rounded-xl h-11 px-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {isLast ? (
          <Button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-xl h-11 px-8 transition-all"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {submitting ? "Saving…" : "Save & Finish"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
