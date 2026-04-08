import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle, AlertCircle, TrendingUp, FileText, ChevronRight,
  MessageCircle, Upload, ArrowRight, HelpCircle, Lightbulb,
  XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { HelpTooltip } from "../components/HelpTooltip";
import { ProgressStepper } from "../components/ProgressStepper";
import { StepGuide } from "../components/StepGuide";
import { loadAnalysisResult, type ResumeAnalysis } from "../utils/resumeAnalyzer";

// ─── Bullet Card ──────────────────────────────────────────────────────────────

function BulletCard({ item, index }: { item: ResumeAnalysis["weakBullets"][0]; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-2 py-1 rounded shrink-0 mt-0.5">
            <XCircle className="w-3 h-3" /> Needs Work
          </span>
          <p className="text-gray-800 dark:text-gray-200 italic text-sm leading-relaxed">"{item.original}"</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2">
        {item.issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed">{issue}</p>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
          {open ? <><ChevronUp className="w-4 h-4" /> Hide rewrites</> : <><ChevronDown className="w-4 h-4" /> Show {item.suggestions.length} suggested rewrites</>}
        </button>

        {open && (
          <div className="mt-3 space-y-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Choose one as a starting point — replace [ ] with your real data:
            </p>
            {item.suggestions.map((s, si) => (
              <div key={si} className="flex items-start gap-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                <span className="text-xs font-bold text-green-800 dark:text-green-300 bg-green-200 dark:bg-green-900 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {si + 1}
                </span>
                <p className="text-sm text-green-900 dark:text-green-200 font-medium leading-relaxed">{s}</p>
              </div>
            ))}
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1">
              <Lightbulb className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Pick the option that fits your actual experience, fill in the{" "}
                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-mono text-gray-800 dark:text-gray-200">[brackets]</code> with real numbers and tools, then tweak the wording to sound like you.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIFeedback() {
  const navigate  = useNavigate();
  const [countdown, setCountdown]       = useState(10);
  const [autoNavigate, setAutoNavigate] = useState(true);
  const [analysis, setAnalysis]         = useState<ResumeAnalysis | null>(null);

  useEffect(() => {
    const result = loadAnalysisResult();
    if (result) {
      setAnalysis(result);
    } else {
      // No cached result — send back to upload so the analysis runs
      navigate("/resume-upload");
    }
  }, [navigate]);

  useEffect(() => {
    if (!autoNavigate || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, autoNavigate]);

  useEffect(() => {
    if (autoNavigate && countdown === 0) navigate("/career-recommendations");
  }, [countdown, autoNavigate, navigate]);

  const goNow = () => { setAutoNavigate(false); navigate("/career-recommendations"); };
  const stay  = () => setAutoNavigate(false);

  const cardCls = "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <AppHeader
        back={{ label: "Back to Upload", to: "/resume-upload" }}
        actions={[{ label: "Upload New Resume", to: "/resume-upload", icon: <Upload className="w-4 h-4" />, variant: "outline" }]}
      />
      <ProgressStepper currentStep={4} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Auto-navigate banner */}
          {autoNavigate && countdown > 0 && (
            <div className="bg-gray-900 dark:bg-gray-100 rounded-xl p-4 text-white dark:text-gray-900">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center">
                    <span className="text-sm font-bold">{countdown}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next: Career Recommendations</p>
                    <p className="text-xs opacity-60">Auto-loading in {countdown} second{countdown !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={goNow}
                    className="px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                    Go Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={stay}
                    className="px-3 py-1.5 bg-white/10 dark:bg-black/10 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
                    Stay Here
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page header */}
          <div className={cardCls}>
            <h1 className="text-gray-900 dark:text-gray-100 mb-1">Your Resume Analysis</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Every issue below includes a specific reason and concrete rewrite options.
            </p>
          </div>

          <StepGuide
            storageKey="ai-feedback"
            title="Step 4 of 5 — Reading Your Results"
            steps={[
              "Your score (0-100) reflects 5 categories: completeness, keyword coverage, formatting, achievements, and best practices.",
              "Bullet Point Improvements shows real lines from your resume that need work, with reasons and 3 rewrite options each.",
              "Missing Keywords lists skills that recruiters filter for — only add them if you've actually used them.",
              "Recommended Additions gives WHY each change matters and HOW to do it.",
            ]}
            next="After reviewing, click 'View Career Recommendations' to see roles matched to your profile."
            tip="Click 'Show suggested rewrites' on each bullet card to expand the rewrite options."
          />

          {/* Overall Score */}
          <div className={cardCls}>
            <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-gray-900 dark:text-gray-100">Resume Score: {analysis?.score ?? 0}/100</h2>
                  <HelpTooltip
                    title="How is this calculated?"
                    content="Completeness (25%) · Keywords (25%) · Formatting (20%) · Achievements (15%) · Best Practices (15%). Expand Score Breakdown for per-category details."
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{analysis?.gradeLabel ?? "Analyzing"}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-semibold text-gray-900 dark:text-gray-100">{analysis?.grade ?? "…"}</div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{analysis?.gradeLabel ?? "Loading"}</p>
              </div>
            </div>

            {/* Score bars */}
            {analysis && (
              <details className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 list-none hover:text-gray-900 dark:hover:text-white">
                  <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Score Breakdown
                </summary>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Completeness", val: analysis.scoreBreakdown.completeness, max: 25 },
                    { label: "Keywords", val: analysis.scoreBreakdown.keywords, max: 25 },
                    { label: "Formatting", val: analysis.scoreBreakdown.formatting, max: 20 },
                    { label: "Achievements", val: analysis.scoreBreakdown.achievements, max: 15 },
                    { label: "Best Practices", val: analysis.scoreBreakdown.bestPractices, max: 15 },
                  ].map(({ label, val, max }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-1">
                        <span>{label}</span><span className="font-semibold">{val}/{max}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 dark:bg-blue-400 rounded-full h-1.5 transition-all" style={{ width: `${(val / max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Strengths */}
          {analysis && analysis.strengths.length > 0 && (
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-gray-900 dark:text-gray-100">What's Working</h2>
              </div>
              <div className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak Bullets */}
          {analysis && analysis.weakBullets.length > 0 && (
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-gray-900 dark:text-gray-100">Bullet Point Improvements</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Each card shows exactly why a bullet is weak, followed by 3 concrete rewrite options. Click "Show suggested rewrites" to expand.
              </p>
              <div className="space-y-4">
                {analysis.weakBullets.map((item, i) => <BulletCard key={i} item={item} index={i} />)}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis && analysis.missingKeywords.length > 0 && (
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-gray-900 dark:text-gray-100">Missing Keywords</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Commonly filtered for by ATS and recruiters. Only add them if you've actually used them.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysis.missingKeywords.map((kw, i) => (
                  <div key={i} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <span className="inline-block px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded mb-2">
                      {kw.keyword}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{kw.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Additions */}
          {analysis && analysis.suggestedAdditions.length > 0 && (
            <div className={cardCls}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-gray-900 dark:text-gray-100">Recommended Additions</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">Each recommendation includes why it matters and exactly what to do.</p>
              <div className="space-y-3">
                {analysis.suggestedAdditions.map((item, i) => (
                  <div key={i} className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</h3>
                    </div>
                    <div className="px-4 py-3 space-y-2 bg-white dark:bg-gray-900">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded shrink-0 mt-0.5">WHY</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.why}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-950 px-2 py-0.5 rounded shrink-0 mt-0.5">HOW</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.howTo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={cardCls}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={goNow}
                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                View Career Recommendations <ChevronRight className="w-4 h-4" />
              </button>
              {autoNavigate && countdown > 0 && (
                <button onClick={stay}
                  className="sm:flex-none px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Stop Auto-Navigate
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      <button onClick={() => navigate("/ai-assistant")}
        className="fixed bottom-6 right-6 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-3.5 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-white transition-colors flex items-center gap-2 group">
        <MessageCircle className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm">
          Ask AIEducator
        </span>
      </button>
    </div>
  );
}