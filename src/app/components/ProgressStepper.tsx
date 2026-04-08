import { Check } from "lucide-react";
import { useNavigate } from "react-router";

export const FLOW_STEPS = [
  { step: 1, label: "Profile",  description: "Tell us about you",  path: "/onboarding" },
  { step: 2, label: "Resume",   description: "Upload your resume", path: "/resume-upload" },
  { step: 3, label: "Analysis", description: "AI reviews it",      path: "/ai-analysis" },
  { step: 4, label: "Feedback", description: "Your results",        path: "/ai-feedback" },
  { step: 5, label: "Careers",  description: "Career matches",      path: "/career-recommendations" },
] as const;

interface ProgressStepperProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  allowNavigation?: boolean;
}

export function ProgressStepper({ currentStep, allowNavigation = true }: ProgressStepperProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        <nav aria-label="Progress steps">
          <ol className="flex items-center">
            {FLOW_STEPS.map((s, i) => {
              const completed = s.step < currentStep;
              const active    = s.step === currentStep;
              const canClick  = allowNavigation && completed;

              return (
                <li key={s.step} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => canClick && navigate(s.path)}
                    disabled={!canClick}
                    title={canClick ? `Go back to ${s.label}` : s.description}
                    className={`flex flex-col items-center gap-1 min-w-0 ${canClick ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      completed
                        ? "bg-green-600 dark:bg-green-500 text-white"
                        : active
                        ? "bg-blue-600 dark:bg-blue-500 text-white ring-2 ring-blue-200 dark:ring-blue-900"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"
                    }`}>
                      {completed ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className={`text-xs hidden sm:block transition-colors ${
                      active     ? "text-blue-600 dark:text-blue-400 font-medium" :
                      completed  ? "text-gray-500 dark:text-gray-400" :
                                   "text-gray-400 dark:text-gray-600"
                    }`}>
                      {s.label}
                    </span>
                  </button>

                  {i < FLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 transition-all duration-300 ${
                      completed ? "bg-green-400 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-800"
                    }`} />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
