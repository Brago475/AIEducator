import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight, UserCircle, FileText, Cpu,
  Briefcase, MessageCircle, GraduationCap, LogOut,
  Settings, HelpCircle, CheckCircle, Circle,
  TrendingUp, Lightbulb, Star, ArrowRight, Send,
  BarChart3, Target, Clock, Award, BookOpen,
  AlertTriangle, Zap, ExternalLink, Loader2,
} from "lucide-react";
import { loadAnalysisResult } from "../utils/resumeAnalyzer";
import { createClient, hasKey } from "../utils/openaiClient";

const TIPS = [
  { icon: <Target className="w-4 h-4" />, tip: "Use numbers in your bullet points — '20%' is stronger than 'significantly'.", category: "Resume" },
  { icon: <FileText className="w-4 h-4" />, tip: "Keep your resume to one page unless you have 5+ years of experience.", category: "Resume" },
  { icon: <Zap className="w-4 h-4" />, tip: "Mirror keywords from the job description — most companies use ATS filters.", category: "Strategy" },
  { icon: <Award className="w-4 h-4" />, tip: "Lead with your strongest experience, not chronological order.", category: "Resume" },
  { icon: <Clock className="w-4 h-4" />, tip: "Follow up within 48 hours of submitting an application.", category: "Job Search" },
  { icon: <Briefcase className="w-4 h-4" />, tip: "Tailor your resume for each role — one version doesn't fit all.", category: "Strategy" },
  { icon: <Star className="w-4 h-4" />, tip: "Start bullets with action verbs: Led, Built, Designed, Increased, Reduced.", category: "Resume" },
  { icon: <BookOpen className="w-4 h-4" />, tip: "List relevant coursework if you lack work experience in that field.", category: "Resume" },
];

const ACTIONS = [
  { icon: <UserCircle className="w-5 h-5" />, title: "Build Profile", desc: "Major, skills, interests", to: "/onboarding", color: "blue" },
  { icon: <FileText className="w-5 h-5" />, title: "Upload Resume", desc: "PDF, Word, or paste text", to: "/resume-upload", color: "indigo" },
  { icon: <Cpu className="w-5 h-5" />, title: "AI Feedback", desc: "Scores and rewrites", to: "/ai-feedback", color: "purple" },
  { icon: <Briefcase className="w-5 h-5" />, title: "Career Center", desc: "Paths and job search", to: "/career-recommendations", color: "emerald" },
  { icon: <MessageCircle className="w-5 h-5" />, title: "AI Assistant", desc: "Ask anything", to: "/ai-assistant", color: "amber" },
  { icon: <Settings className="w-5 h-5" />, title: "My Profile", desc: "Edit preferences", to: "/profile", color: "gray" },
];

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
  indigo: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  purple: "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

const ANIM_STYLES = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .fade-in-d1 { animation: fadeIn 0.5s ease-out 0.1s forwards; opacity: 0; }
  .fade-in-d2 { animation: fadeIn 0.5s ease-out 0.2s forwards; opacity: 0; }
  .fade-in-d3 { animation: fadeIn 0.5s ease-out 0.3s forwards; opacity: 0; }
  .fade-in-d4 { animation: fadeIn 0.5s ease-out 0.4s forwards; opacity: 0; }
`;

function greetByTime(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateStr(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#2563eb" : "#d97706";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6"
          className="text-gray-100 dark:text-gray-800" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${score >= 80 ? "text-green-600 dark:text-green-400" : score >= 60 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>{score}</span>
      </div>
    </div>
  );
}

function FeedbackCarousel({ analysisResult, navigate }: { analysisResult: any; navigate: any }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = ["strengths", "keywords", "improvements"];

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((prev) => (prev + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="relative" style={{ minHeight: "160px" }}>
        <div className={`transition-all duration-500 absolute inset-0 ${activeSlide === 0 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"}`}>
          <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Star className="w-3 h-3" /> Your Strengths
          </h4>
          <div className="space-y-2">
            {(analysisResult.strengths || []).slice(0, 3).map((s: string, i: number) => (
              <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" /> {s}
              </p>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-500 absolute inset-0 ${activeSlide === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"}`}>
          <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {(analysisResult.missingKeywords || []).slice(0, 8).map((k: any, i: number) => (
              <div key={i} className="bg-amber-50 dark:bg-amber-950 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{k.keyword}</span>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5 line-clamp-1">{k.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`transition-all duration-500 absolute inset-0 ${activeSlide === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"}`}>
          <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Areas to Improve
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/30 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Bullets to rewrite</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{(analysisResult.weakBullets || []).length}</span>
            </div>
            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/30 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Suggested additions</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{(analysisResult.suggestedAdditions || []).length}</span>
            </div>
            <button onClick={() => navigate("/ai-feedback")} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              Fix these now <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActiveSlide(i)}
            className={`h-1.5 rounded-full transition-all ${i === activeSlide ? "bg-blue-600 w-4" : "bg-gray-300 dark:bg-gray-700 w-1.5"}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [major, setMajor] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [quickQuestion, setQuickQuestion] = useState("");
  const [quickAnswer, setQuickAnswer] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const questionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try { setDisplayName(JSON.parse(session).displayName || ""); } catch {}
    }
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        const p = JSON.parse(profile);
        setHasProfile(true);
        if (p.major) setMajor(p.major);
        if (p.skills) setSkills(p.skills.slice(0, 8));
      } catch {}
    }
    setHasResume(!!localStorage.getItem("resumeContent"));
    const result = loadAnalysisResult();
    if (result) setAnalysisResult(result);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTip((prev) => (prev + 1) % TIPS.length), 7000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { localStorage.removeItem("session"); navigate("/"); };

  const askQuickQuestion = async () => {
    if (!quickQuestion.trim() || !hasKey()) return;
    setAskingAI(true);
    setQuickAnswer("");
    try {
      const client = createClient();
      if (!client) return;
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a career advisor for college students. Give concise, helpful answers in 2-3 sentences max." },
          { role: "user", content: quickQuestion },
        ],
        max_tokens: 200,
        temperature: 0.3,
      });
      setQuickAnswer(res.choices[0]?.message?.content || "No response.");
    } catch { setQuickAnswer("Something went wrong. Try the full AI Assistant instead."); }
    finally { setAskingAI(false); }
  };

  const steps = [
    { label: "Profile", done: hasProfile, to: "/onboarding" },
    { label: "Resume", done: hasResume, to: "/resume-upload" },
    { label: "Analysis", done: !!analysisResult, to: "/ai-analysis" },
    { label: "Feedback", done: !!analysisResult, to: "/ai-feedback" },
    { label: "Careers", done: false, to: "/career-recommendations" },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);

  const scoreColor = analysisResult
    ? analysisResult.score >= 80 ? "text-green-600 dark:text-green-400"
    : analysisResult.score >= 60 ? "text-blue-600 dark:text-blue-400"
    : "text-amber-600 dark:text-amber-400" : "";

  const alerts: { msg: string; action: string; to: string; type: "info" | "warn" }[] = [];
  if (!hasProfile) alerts.push({ msg: "Complete your profile to get personalized results.", action: "Set Up Profile", to: "/onboarding", type: "warn" });
  if (hasProfile && !hasResume) alerts.push({ msg: "Upload your resume to unlock AI analysis.", action: "Upload Resume", to: "/resume-upload", type: "info" });
  if (hasResume && !analysisResult) alerts.push({ msg: "Your resume is ready. Run the AI analysis.", action: "Start Analysis", to: "/ai-analysis", type: "info" });
  if (analysisResult && analysisResult.score < 60) alerts.push({ msg: "Your score is below average. Check the AI feedback for improvements.", action: "View Feedback", to: "/ai-feedback", type: "warn" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <style>{ANIM_STYLES}</style>

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Images/kean-seal.png" alt="" className="w-6 h-6 rounded-full bg-white p-0.5" />
            <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Kean <span className="text-blue-600 dark:text-blue-400">AIEducator</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/help")} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-6 fade-in">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-0.5">
              {greetByTime()}{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getDateStr()}{major ? ` · ${major}` : ""}
            </p>
          </div>

          {alerts.length > 0 && (
            <div className="space-y-2 mb-6 fade-in-d1">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  alert.type === "warn"
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
                    : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"
                }`}>
                  <div className="flex items-center gap-2.5">
                    {alert.type === "warn"
                      ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      : <Lightbulb className="w-4 h-4 text-blue-500 shrink-0" />}
                    <span className={`text-sm ${alert.type === "warn" ? "text-amber-800 dark:text-amber-300" : "text-blue-800 dark:text-blue-300"}`}>
                      {alert.msg}
                    </span>
                  </div>
                  <button onClick={() => navigate(alert.to)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                      alert.type === "warn" ? "bg-amber-600 text-white hover:bg-amber-500" : "bg-blue-600 text-white hover:bg-blue-500"
                    }`}>
                    {alert.action}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6 fade-in-d2">

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your Journey</h3>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{completedCount}/{steps.length} Complete</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-5">
                <div className="h-2 rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex items-center justify-between mb-5">
                {steps.map((step, i) => (
                  <button key={i} onClick={() => navigate(step.to)} className="flex flex-col items-center gap-1.5 group relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      step.done
                        ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-medium ${
                      step.done ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600"
                    } transition-colors`}>
                      {step.label}
                    </span>
                  </button>
                ))}
              </div>
              {nextStep ? (
                <button onClick={() => navigate(nextStep.to)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-100">
                  Continue: {nextStep.label} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => navigate("/career-recommendations")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors">
                  <CheckCircle className="w-4 h-4" /> All Done. Explore Careers
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              {analysisResult ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Resume Score</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      analysisResult.score >= 80 ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                      : analysisResult.score >= 60 ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                    }`}>
                      {analysisResult.grade} {analysisResult.gradeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="shrink-0">
                      <ScoreRing score={analysisResult.score} size={90} />
                    </div>
                    <div className="flex-1 space-y-2">
                      {[
                        { label: "Completeness", val: analysisResult.scoreBreakdown.completeness, max: 25 },
                        { label: "Keywords", val: analysisResult.scoreBreakdown.keywords, max: 25 },
                        { label: "Formatting", val: analysisResult.scoreBreakdown.formatting, max: 20 },
                        { label: "Achievements", val: analysisResult.scoreBreakdown.achievements, max: 15 },
                        { label: "Practices", val: analysisResult.scoreBreakdown.bestPractices, max: 15 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-20 shrink-0">{item.label}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${(item.val / item.max) * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 w-8 text-right">{item.val}/{item.max}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigate("/ai-feedback")}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    View Full Feedback <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <BarChart3 className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">No Score Yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
                    Upload and analyze your resume to see detailed scoring.
                  </p>
                  <button onClick={() => navigate("/resume-upload")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {analysisResult && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 fade-in-d3 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Feedback Summary</h3>
                <button onClick={() => navigate("/ai-feedback")} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
              </div>
              <FeedbackCarousel analysisResult={analysisResult} navigate={navigate} />
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-6 fade-in-d3">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Quick Question</h3>
              <button onClick={() => navigate("/ai-assistant")} className="ml-auto text-xs text-gray-400 hover:text-blue-600 transition-colors">
                Full chat <ExternalLink className="w-3 h-3 inline" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                ref={questionRef}
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuickQuestion()}
                placeholder="Ask about resumes, interviews, careers..."
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button onClick={askQuickQuestion} disabled={askingAI || !quickQuestion.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors shrink-0">
                {askingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {quickAnswer && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3.5 relative">
                <button onClick={() => { setQuickAnswer(""); setQuickQuestion(""); }} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed pr-6">{quickAnswer}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6 fade-in-d4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your Skills</h3>
                <button onClick={() => navigate("/onboarding")} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-lg font-medium">
                      {skill}
                    </span>
                  ))}
                  {skills.length >= 8 && (
                    <button onClick={() => navigate("/onboarding")} className="text-xs text-blue-600 dark:text-blue-400 py-1.5 hover:underline">
                      + more
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 mb-2">No skills added yet.</p>
                  <button onClick={() => navigate("/onboarding")} className="text-xs text-blue-600 hover:underline font-medium">Add skills</button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Career Tip</h3>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full ml-auto">
                  {TIPS[currentTip].category}
                </span>
              </div>
              <div className="flex items-start gap-3" key={currentTip}>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  {TIPS[currentTip].icon}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {TIPS[currentTip].tip}
                </p>
              </div>
              <div className="flex items-center justify-center gap-1 mt-4">
                {TIPS.map((_, i) => (
                  <button key={i} onClick={() => setCurrentTip(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentTip ? "bg-blue-600 w-3" : "bg-gray-300 dark:bg-gray-700"}`} />
                ))}
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3 fade-in-d4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 fade-in-d4">
            {ACTIONS.map((action) => (
              <button key={action.to} onClick={() => navigate(action.to)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-center hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${COLOR_MAP[action.color]}`}>
                  {action.icon}
                </div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{action.title}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{action.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-8 fade-in-d4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">Job Search Resources</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
                { name: "Handshake", url: "https://app.joinhandshake.com" },
                { name: "Indeed", url: "https://www.indeed.com" },
                { name: "Kean Career Services", url: "https://www.kean.edu/offices/career-services" },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            Kean University · Union, New Jersey
          </p>
        </div>
      </main>
    </div>
  );
}