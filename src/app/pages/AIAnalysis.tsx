import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Lightbulb } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { ProgressStepper } from "../components/ProgressStepper";
import { analyzeResumeWithAI, saveAnalysisResult } from "../utils/resumeAnalyzer";
import { hasKey } from "../utils/openaiClient";

const STEPS = [
  { label: "Reading your resume", detail: "Pulling in every line of your document" },
  { label: "Checking layout and structure", detail: "Evaluating formatting, sections, and flow" },
  { label: "Identifying skills and experience", detail: "Spotting what you know and what you've done" },
  { label: "Comparing to your field's standards", detail: "Matching your profile to what employers expect" },
  { label: "Writing your personalized feedback", detail: "Crafting specific improvements for your resume" },
];

const TIPS = [
  "Tip: Use strong action verbs like \"led\", \"built\", \"designed\" to start bullet points.",
  "Tip: Quantify your achievements — numbers catch recruiters' eyes faster than adjectives.",
  "Tip: Tailor your resume for each job. One-size-fits-all rarely lands interviews.",
  "Tip: Keep your resume to one page if you have less than 5 years of experience.",
  "Tip: Put your most relevant experience first — recruiters spend ~7 seconds on a first scan.",
  "Tip: Include a skills section with keywords from the job description to pass ATS filters.",
  "Tip: Remove \"References available upon request\" — it's outdated and wastes space.",
  "Tip: Use consistent formatting — same font, bullet style, and date format throughout.",
];

type Phase = "need-key" | "analyzing" | "done" | "error";

export default function AIAnalysis() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [completedSteps, setCompleted] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentTip, setCurrentTip] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const didRun = useRef(false);
  const startTime = useRef(Date.now());

  // Rotate tips
  useEffect(() => {
    if (phase !== "analyzing") return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  // Elapsed timer
  useEffect(() => {
    if (phase !== "analyzing") return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const startAnalysis = () => {
    const resumeContent = localStorage.getItem("resumeContent");
    if (!resumeContent) { navigate("/resume-upload"); return; }

    setPhase("analyzing");
    setCompleted([]);
    setCurrentStep(0);
    setErrorMsg("");
    startTime.current = Date.now();

    // Advance visual steps on a timer
    const timings = [1800, 3500, 5500, 7500, 9500];
    timings.forEach((delay, i) => {
      setTimeout(() => {
        setCurrentStep(i + 1);
        setCompleted((prev) => [...prev, i]);
      }, delay);
    });

    // Run the actual AI analysis in parallel
    let profile: { major?: string; skills?: string[]; interests?: string[] } | undefined;
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) profile = JSON.parse(raw);
    } catch { /* ignore */ }

    analyzeResumeWithAI(resumeContent, profile)
      .then((result) => {
        saveAnalysisResult(result);
        const elapsed = Date.now() - startTime.current;
        const wait = Math.max(0, 10500 - elapsed);
        setTimeout(() => {
          setPhase("done");
          setTimeout(() => navigate("/ai-feedback"), 1200);
        }, wait);
      })
      .catch((err: Error) => {
        console.error("Analysis error:", err);
        setErrorMsg(
          err.message === "NO_API_KEY"
            ? "AI service is not configured. Please contact the administrator."
            : err.message === "EMPTY_RESUME"
            ? "Your resume appears to be empty. Please go back and upload content."
            : `Analysis failed: ${err.message}. Please try again.`
        );
        setPhase("error");
      });
  };

  // Initial check
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const resumeContent = localStorage.getItem("resumeContent");
    if (!resumeContent) { navigate("/resume-upload"); return; }

    if (!hasKey()) {
      setPhase("need-key");
    } else {
      startAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = phase === "done" ? 100 : (completedSteps.length / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <AppHeader back={{ label: "Back", to: "/resume-upload" }} />
      <ProgressStepper currentStep={3} allowNavigation={false} />

      {/* No-key fallback */}
      {phase === "need-key" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">AI Not Configured</p>
            <p className="text-gray-500 text-sm mb-4">The AI service is not currently available. Please contact the administrator.</p>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors" onClick={() => navigate("/resume-upload")}>
              <ArrowLeft className="w-4 h-4 inline mr-1.5" />Go Back
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">

            {/* Header */}
            <div className="text-center mb-8">
              {phase === "done" ? (
                <>
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Analysis Complete!</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taking you to your personalized feedback…</p>
                </>
              ) : phase === "error" ? (
                <>
                  <div className="w-14 h-14 bg-red-50 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Something Went Wrong</h2>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-5">{errorMsg}</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={startAnalysis}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">
                      <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                    <button onClick={() => navigate("/resume-upload")}
                      className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Go Back
                    </button>
                  </div>
                </>
              ) : phase === "analyzing" ? (
                <>
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">AI is Reviewing Your Resume</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reading your content and writing specific feedback. Usually 15–30 seconds.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Elapsed: {elapsedSec}s
                  </p>
                </>
              ) : null}
            </div>

            {/* Progress bar */}
            {(phase === "analyzing" || phase === "done") && (
              <div className="mb-7">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                  <span>{phase === "done" ? "Complete" : "In progress…"}</span>
                  <span className={phase === "done" ? "text-green-600 dark:text-green-400 font-semibold" : "text-blue-600 dark:text-blue-400 font-semibold"}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${phase === "done" ? "bg-green-500" : "bg-blue-600"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            {(phase === "analyzing" || phase === "done") && (
              <div className="space-y-2">
                {STEPS.map((step, idx) => {
                  const done = completedSteps.includes(idx);
                  const active = currentStep === idx && phase === "analyzing";
                  return (
                    <div key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-400 ${
                        done   ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" :
                        active ? "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700" :
                                 "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-40"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {done   ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /> :
                         active ? <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" /> :
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          done ? "text-gray-700 dark:text-gray-300" : active ? "text-blue-900 dark:text-blue-200" : "text-gray-400 dark:text-gray-600"
                        }`}>{step.label}</p>
                        {(done || active) && (
                          <p className={`text-xs mt-0.5 ${done ? "text-gray-500 dark:text-gray-400" : "text-blue-600 dark:text-blue-400"}`}>
                            {step.detail}
                          </p>
                        )}
                      </div>
                      {done && (
                        <span className="text-xs text-green-700 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded-full shrink-0">
                          Done
                        </span>
                      )}
                      {active && (
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full animate-pulse shrink-0">
                          Working…
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rotating tips */}
            {phase === "analyzing" && (
              <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3 transition-all">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed" key={currentTip}>
                  {TIPS[currentTip]}
                </p>
              </div>
            )}
          </div>

          {/* What happens next */}
          {phase === "analyzing" && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium uppercase tracking-wide">What happens next</p>
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">1</div>
                  Score & Grade
                </div>
                <div className="w-4 border-t border-gray-300 dark:border-gray-700" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">2</div>
                  Bullet Rewrites
                </div>
                <div className="w-4 border-t border-gray-300 dark:border-gray-700" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">3</div>
                  Career Matches
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}