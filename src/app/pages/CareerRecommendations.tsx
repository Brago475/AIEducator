import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Briefcase, TrendingUp, DollarSign, ChevronDown, ChevronUp,
  Loader2, RefreshCw, MessageCircle, ArrowLeft, Lightbulb,
  GraduationCap, ExternalLink, AlertCircle, Search,
  Building2, Calendar, FileText, HelpCircle, ChevronRight,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { ProgressStepper } from "../components/ProgressStepper";
import { createClient, hasKey } from "../utils/openaiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CareerRec {
  title: string;
  matchScore: number;
  whyMatch: string;
  salaryRange: string;
  demandLevel: string;
  keySkillsYouHave: string[];
  skillsToLearn: string[];
  dayInLife: string;
  growthPath: string;
  searchTerms: string[];
}

// ─── Career Fair Employers (Kean partners) ───────────────────────────────────
const CAREER_FAIR_EMPLOYERS = [
  {
    name: "RWJBarnabas Health",
    industry: "Healthcare",
    roles: ["Registered Nurse", "Health Informatics Analyst", "Medical Lab Technician"],
    location: "New Brunswick, NJ",
    hiringFor: "Full-time & Internships",
    website: "https://www.rwjbh.org/careers",
  },
  {
    name: "Deloitte",
    industry: "Consulting & Finance",
    roles: ["Audit Associate", "Technology Analyst", "Business Consultant"],
    location: "NYC / Remote",
    hiringFor: "Internships & Entry-level",
    website: "https://www.deloitte.com/careers",
  },
  {
    name: "NJ Transit",
    industry: "Government & Transportation",
    roles: ["IT Systems Analyst", "Project Coordinator", "Civil Engineer"],
    location: "Newark, NJ",
    hiringFor: "Full-time",
    website: "https://www.njtransit.com/careers",
  },
  {
    name: "Amazon",
    industry: "Technology & Logistics",
    roles: ["Software Development Engineer", "Operations Manager", "Data Analyst"],
    location: "NYC / NJ",
    hiringFor: "Internships & Full-time",
    website: "https://www.amazon.jobs",
  },
  {
    name: "Hackensack Meridian Health",
    industry: "Healthcare",
    roles: ["Clinical Research Coordinator", "Nursing Associate", "IT Support Specialist"],
    location: "Edison, NJ",
    hiringFor: "Full-time & Part-time",
    website: "https://www.hackensackmeridianhealth.org/careers",
  },
  {
    name: "KPMG",
    industry: "Accounting & Advisory",
    roles: ["Tax Associate", "Advisory Analyst", "Audit Intern"],
    location: "NYC / Short Hills, NJ",
    hiringFor: "Internships & Entry-level",
    website: "https://www.kpmg.us/careers",
  },
];

// ─── AI Career Generator ─────────────────────────────────────────────────────
async function generateCareerRecs(profile: {
  major?: string;
  skills?: string[];
  interests?: string[];
}): Promise<CareerRec[]> {
  const client = createClient();
  if (!client) throw new Error("NO_API_KEY");

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a career advisor for college students. Generate personalized career recommendations based on the student's profile. Use current job market knowledge. Be specific and actionable. Respond ONLY with valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: `Based on this student's profile, recommend 6 career paths ranked by fit.

STUDENT PROFILE:
- Major: ${profile.major || "Not specified"}
- Skills: ${profile.skills?.length ? profile.skills.join(", ") : "Not specified"}
- Career Interests: ${profile.interests?.length ? profile.interests.join(", ") : "Not specified"}

Return ONLY this JSON array (no extra text):
[
  {
    "title": "Job Title",
    "matchScore": <70-98, realistic based on their skills>,
    "whyMatch": "<2 sentences why this fits THEM, reference actual skills/major>",
    "salaryRange": "<e.g. '$55K – $120K'>",
    "demandLevel": "<'Very High' | 'High' | 'Moderate'>",
    "keySkillsYouHave": ["<2-4 skills from their profile>"],
    "skillsToLearn": ["<2-3 skills to develop>"],
    "dayInLife": "<2 sentences describing typical day>",
    "growthPath": "<e.g. 'Junior → Mid → Senior → Lead → Director'>",
    "searchTerms": ["<3 job search keywords>"]
  }
]

Sort by matchScore descending. Be honest with scores.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 3000,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");
  const parsed = JSON.parse(raw);
  const careers: CareerRec[] = Array.isArray(parsed) ? parsed : parsed.careers || parsed.recommendations || Object.values(parsed)[0];
  if (!Array.isArray(careers)) throw new Error("Invalid response format");
  return careers.sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function demandColor(level: string) {
  if (level === "Very High") return "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400";
  if (level === "High") return "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400";
  return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
}

function scoreColor(score: number) {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  return "text-amber-600 dark:text-amber-400";
}

function jobSearchUrl(platform: string, query: string) {
  const q = encodeURIComponent(query);
  switch (platform) {
    case "linkedin": return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=New%20Jersey`;
    case "indeed": return `https://www.indeed.com/jobs?q=${q}&l=New+Jersey`;
    case "handshake": return `https://app.joinhandshake.com/stu/jobs?query=${q}`;
    default: return "#";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CareerRecommendations() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<CareerRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [profileInfo, setProfileInfo] = useState<{ major?: string; skills?: string[]; interests?: string[] }>({});
  const [activeTab, setActiveTab] = useState<"careers" | "fair">("careers");
  const didRun = useRef(false);

  const loadCareers = async () => {
    setLoading(true);
    setError("");
    setCareers([]);

    let profile: { major?: string; skills?: string[]; interests?: string[] } = {};
    try {
      const raw = localStorage.getItem("userProfile");
      if (raw) profile = JSON.parse(raw);
    } catch {}
    setProfileInfo(profile);

    if (!hasKey()) {
      setError("AI service is not configured.");
      setLoading(false);
      return;
    }

    try {
      const results = await generateCareerRecs(profile);
      setCareers(results);
    } catch (err: any) {
      console.error("Career gen error:", err);
      setError(`Failed to generate recommendations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    loadCareers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <AppHeader
        back={{ label: "Back", to: "/home" }}
        actions={[
          { label: "AI Assistant", to: "/ai-assistant", icon: <MessageCircle className="w-4 h-4" />, variant: "ghost" },
        ]}
      />
      <ProgressStepper currentStep={5} allowNavigation={false} />

      <main className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Career Center</h1>
            {profileInfo.major && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full">
                <GraduationCap className="w-3.5 h-3.5" />
                {profileInfo.major}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab("careers")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "careers"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              AI Recommendations
            </button>
            <button
              onClick={() => setActiveTab("fair")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "fair"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Career Fair Employers
            </button>
          </div>

          {/* ═══ TAB 1: AI Career Recommendations ═══════════════════════════ */}
          {activeTab === "careers" && (
            <>
              {loading && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Analyzing Career Paths</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Matching your profile to current opportunities…</p>
                </div>
              )}

              {error && !loading && (
                <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button onClick={loadCareers} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </div>
              )}

              {!loading && !error && careers.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{careers.length} paths found</p>
                    <button onClick={loadCareers} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>

                  <div className="space-y-4">
                    {careers.map((career, i) => {
                      const expanded = expandedIdx === i;
                      return (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                          <button onClick={() => setExpandedIdx(expanded ? null : i)} className="w-full p-5 text-left flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{career.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{career.whyMatch}</p>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  <div className={`text-xl font-bold ${scoreColor(career.matchScore)}`}>{career.matchScore}%</div>
                                  <span className="text-[10px] text-gray-400 uppercase">Match</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <DollarSign className="w-3 h-3" /> {career.salaryRange}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${demandColor(career.demandLevel)}`}>
                                  <TrendingUp className="w-3 h-3" /> {career.demandLevel}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 mt-1">
                              {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>
                          </button>

                          {expanded && (
                            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
                              <div className="grid sm:grid-cols-2 gap-5 mt-4">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills You Have</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {career.keySkillsYouHave.map((s, j) => (
                                      <span key={j} className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs px-2.5 py-1 rounded-lg">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills to Learn</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {career.skillsToLearn.map((s, j) => (
                                      <span key={j} className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-xs px-2.5 py-1 rounded-lg">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">A Typical Day</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{career.dayInLife}</p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Growth Path</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{career.growthPath}</p>
                                </div>
                              </div>

                              {/* Job search links */}
                              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Search "{career.title}" Positions</h4>
                                <div className="space-y-2">
                                  {career.searchTerms.map((term, j) => (
                                    <div key={j} className="flex flex-col gap-1.5">
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{term}</span>
                                      <div className="flex flex-wrap gap-2">
                                        <a href={jobSearchUrl("linkedin", term)} target="_blank" rel="noopener noreferrer"
                                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-500 transition-colors inline-flex items-center gap-1">
                                          Search on LinkedIn <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <a href={jobSearchUrl("indeed", term)} target="_blank" rel="noopener noreferrer"
                                          className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full hover:bg-purple-500 transition-colors inline-flex items-center gap-1">
                                          Search on Indeed <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <a href={jobSearchUrl("handshake", term)} target="_blank" rel="noopener noreferrer"
                                          className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-400 transition-colors inline-flex items-center gap-1">
                                          Search on Handshake <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                      Click any career to see details and direct job search links. Hit "Regenerate" for fresh AI results.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* ═══ TAB 2: Career Fair Employers ═══════════════════════════════ */}
          {activeTab === "fair" && (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Companies actively recruiting Kean University students. Apply directly, schedule interviews, and prepare.
                </p>
              </div>

              <div className="space-y-4">
                {CAREER_FAIR_EMPLOYERS.map((employer, i) => (
                  <EmployerBooth key={i} employer={employer} navigate={navigate} />
                ))}
              </div>
            </>
          )}

          {/* Bottom nav */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate("/home")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm">
              <GraduationCap className="w-4 h-4" /> Back to Home
            </button>
            <button onClick={() => navigate("/ai-assistant")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors text-sm">
              <MessageCircle className="w-4 h-4" /> Discuss with AI
            </button>
            <button onClick={() => navigate("/ai-feedback")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Resume Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Employer Booth Component ─────────────────────────────────────────────────
function EmployerBooth({ employer, navigate }: { employer: typeof CAREER_FAIR_EMPLOYERS[0]; navigate: any }) {
  const [expanded, setExpanded] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [prepContent, setPrepContent] = useState("");
  const [questionsContent, setQuestionsContent] = useState("");
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [loadingQ, setLoadingQ] = useState(false);
  const [sentResume, setSentResume] = useState(false);
  const [scheduledInterview, setScheduledInterview] = useState(false);

  const generatePrep = async () => {
    if (prepContent) { setShowPrep(!showPrep); return; }
    setLoadingPrep(true);
    setShowPrep(true);
    try {
      const client = createClient();
      if (!client) { setPrepContent("AI not configured."); return; }
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a career coach. Be concise and actionable." },
          { role: "user", content: `I have an interview with ${employer.name} (${employer.industry}). Give me 5 short, specific preparation tips. No numbering, use bullet points with dashes.` },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });
      setPrepContent(res.choices[0]?.message?.content || "No tips generated.");
    } catch { setPrepContent("Failed to generate tips. Try again."); }
    finally { setLoadingPrep(false); }
  };

  const generateQuestions = async () => {
    if (questionsContent) { setShowQuestions(!showQuestions); return; }
    setLoadingQ(true);
    setShowQuestions(true);
    try {
      const client = createClient();
      if (!client) { setQuestionsContent("AI not configured."); return; }
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a career coach. Be concise." },
          { role: "user", content: `Give me 6 common interview questions for ${employer.roles[0]} at ${employer.name} (${employer.industry}). Include 2 behavioral, 2 technical, and 2 you should ask the interviewer. Format with dashes, no numbering.` },
        ],
        max_tokens: 600,
        temperature: 0.3,
      });
      setQuestionsContent(res.choices[0]?.message?.content || "No questions generated.");
    } catch { setQuestionsContent("Failed to generate questions. Try again."); }
    finally { setLoadingQ(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{employer.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{employer.industry} · {employer.location}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {employer.roles.map((role, j) => (
              <span key={j} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-lg">{role}</span>
            ))}
          </div>
          <span className="inline-block mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">{employer.hiringFor}</span>
        </div>
        <div className="shrink-0 mt-1">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Expanded actions */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
          {/* Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <a href={employer.website} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-xs font-medium">
              <ExternalLink className="w-4 h-4" /> Apply Now
            </a>
            <button onClick={() => { setScheduledInterview(true); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${
                scheduledInterview
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900"
              }`}>
              <Calendar className="w-4 h-4" />
              {scheduledInterview ? "Requested!" : "Schedule Interview"}
            </button>
            <button onClick={() => { setSentResume(true); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${
                sentResume
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900"
              }`}>
              <FileText className="w-4 h-4" />
              {sentResume ? "Sent!" : "Send Resume"}
            </button>
            <button onClick={() => navigate("/ai-assistant")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium">
              <MessageCircle className="w-4 h-4" /> Ask AI
            </button>
          </div>

          {/* Prep & Questions */}
          <div className="flex gap-2 mt-4">
            <button onClick={generatePrep}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {loadingPrep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              Preparation Tips
            </button>
            <button onClick={generateQuestions}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {loadingQ ? <Loader2 className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
              Interview Questions
            </button>
          </div>

          {/* AI-generated prep tips */}
          {showPrep && prepContent && (
            <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-2">
                Prep Tips for {employer.name}
              </h4>
              <div className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-line leading-relaxed">
                {prepContent}
              </div>
            </div>
          )}

          {/* AI-generated interview questions */}
          {showQuestions && questionsContent && (
            <div className="mt-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide mb-2">
                Interview Questions for {employer.name}
              </h4>
              <div className="text-sm text-purple-900 dark:text-purple-200 whitespace-pre-line leading-relaxed">
                {questionsContent}
              </div>
            </div>
          )}

          {/* Confirmation messages */}
          {scheduledInterview && (
            <p className="mt-3 text-xs text-green-600 dark:text-green-400 text-center">
              Interview request sent! The recruiter will contact you at your registered email.
            </p>
          )}
          {sentResume && (
            <p className="mt-3 text-xs text-green-600 dark:text-green-400 text-center">
              Resume submitted to {employer.name}! Check your email for confirmation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}