import { useState } from "react";
import {
  GraduationCap, User, FileText, Sparkles, MessageCircle,
  X, ChevronRight, ChevronLeft,
} from "lucide-react";

/**
 * WelcomeWalkthrough.tsx
 *
 * A 5-slide modal that appears the first time a student lands on the
 * Home page. Walks them through what to do, in order. Dismissed by
 * setting localStorage `walkthroughSeen = "true"`, which persists across
 * sessions (treated as a UI preference, not student data).
 *
 * The student can skip at any time.
 */

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Props {
  onClose: () => void;
  name?: string;
}

export function WelcomeWalkthrough({ onClose, name }: Props) {
  const slides: Slide[] = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: name ? `Welcome, ${name}!` : "Welcome to AIEducator",
      description:
        "You're signed in. Here's a 30 second tour of how to get the most out of AIEducator. Skip anytime.",
    },
    {
      icon: <User className="w-8 h-8" />,
      title: "Step 1: Build Your Profile",
      description:
        "Pick your major, select your skills, and choose your career interests. This personalizes every result you get.",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Step 2: Upload Your Resume",
      description:
        "Drop a PDF, DOCX, or paste the text. Your resume stays in your browser only, never on a server.",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Step 3: Run the AI Analysis",
      description:
        "Get a score, top strengths, weak bullets to rewrite, missing keywords, and 6 career paths matched to you.",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Step 4: Chat Anytime",
      description:
        "The AI Assistant already knows your profile and resume. Ask it about interviews, skill gaps, or what to learn next.",
    },
  ];

  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isFirst = step === 0;
  const isLast = step === slides.length - 1;

  const handleClose = () => {
    localStorage.setItem("walkthroughSeen", "true");
    onClose();
  };

  const handleNext = () => {
    if (isLast) handleClose();
    else setStep((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {step + 1} of {slides.length}
          </span>
          <button
            onClick={handleClose}
            aria-label="Skip walkthrough"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
          >
            Skip <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5">
            {slide.icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {slide.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-1.5 bg-blue-600 dark:bg-blue-400"
                  : "w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          {!isFirst ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            className="text-sm font-semibold bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {isLast ? "Got it, let's start" : "Next"}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}