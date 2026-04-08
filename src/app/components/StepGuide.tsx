import { useState } from "react";
import { Info, X, ChevronDown, ChevronUp } from "lucide-react";

interface StepGuideProps {
  storageKey: string;
  title: string;
  steps: string[];
  next?: string;
  tip?: string;
}

export function StepGuide({ storageKey, title, steps, next, tip }: StepGuideProps) {
  const key = `step-guide-${storageKey}`;
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(key) === "true");
  const [collapsed, setCollapsed] = useState(false);

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(key, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center gap-3 px-4 py-3">
        <Info className="w-4 h-4 text-gray-400 shrink-0" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{title}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded"
            aria-label={collapsed ? "Expand guide" : "Collapse guide"}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded"
            aria-label="Dismiss guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800">
          <ol className="mt-3 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {next && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Next:</span> {next}
            </p>
          )}
          {tip && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">{tip}</p>
          )}
        </div>
      )}
    </div>
  );
}
