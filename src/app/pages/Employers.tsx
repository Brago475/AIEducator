import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap, Building2, Search, Users, Briefcase,
  TrendingUp, ArrowLeft, ArrowRight, ChevronRight,
  BookOpen, Sun, Moon, Mail, Lock, Shield,
  FileText, Target, Handshake, BarChart3,
  CheckCircle, Quote, Eye,
} from "lucide-react";

const ANIM_STYLES = `
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes sealFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(16,185,129,0.15); } 50% { box-shadow: 0 0 30px rgba(16,185,129,0.35); } }
  .fade-up { animation: fadeSlideUp 0.8s ease-out forwards; }
  .fade-up-d1 { animation: fadeSlideUp 0.8s ease-out 0.15s forwards; opacity: 0; }
  .fade-up-d2 { animation: fadeSlideUp 0.8s ease-out 0.3s forwards; opacity: 0; }
  .seal-float { animation: sealFloat 4s ease-in-out infinite; }
  .pulse-glow-green { animation: pulseGlow 3s ease-in-out infinite; }
`;

const HOW_IT_WORKS = [
  { icon: <Building2 className="w-5 h-5" />, title: "Create Company Profile", desc: "Tell us about your organization, roles you hire for, and what skills matter most." },
  { icon: <Target className="w-5 h-5" />, title: "Set Your Criteria", desc: "Define the majors, skills, GPA thresholds, and experience levels you're looking for." },
  { icon: <Search className="w-5 h-5" />, title: "AI Matches Candidates", desc: "Our AI cross-references your criteria with student profiles and resume scores." },
  { icon: <Handshake className="w-5 h-5" />, title: "Connect & Hire", desc: "Review matched candidates, schedule interviews, and make offers — all in one place." },
];

const BENEFITS = [
  { icon: <Target className="w-6 h-6" />, title: "Pre-Qualified Talent", desc: "Every student has an AI-verified resume score and skill assessment before you see them." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Data-Driven Matching", desc: "Our AI matches based on skills, interests, and career alignment — not just keywords." },
  { icon: <Users className="w-6 h-6" />, title: "Direct University Pipeline", desc: "Access Kean's 16,000+ students across 50+ programs. No middleman." },
  { icon: <FileText className="w-6 h-6" />, title: "Free to Post", desc: "Post internships, part-time, and full-time roles at no cost during our beta." },
];

const TESTIMONIALS = [
  { name: "Local Tech Startup", quote: "We found three qualified interns within a week of posting. The AI matching saved us hours of resume screening." },
  { name: "Healthcare Network", quote: "The pre-qualified profiles meant every candidate we interviewed was actually a fit. Game changer for campus recruiting." },
];

// ─── Employer Dashboard (shown after login) ──────────────────────────────────
function EmployerDashboard({ companyName, onLogout }: { companyName: string; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Images/kean-seal.png" alt="" className="w-6 h-6 rounded-full bg-white p-0.5" />
            <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Kean <span className="text-blue-600 dark:text-blue-400">AIEducator</span>
            </span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium ml-1">
              Employer
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">{companyName}</span>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Welcome, {companyName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your job postings and discover matched candidates.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Briefcase className="w-6 h-6" />, title: "Post a Position", desc: "Create a new internship, part-time, or full-time listing.", color: "emerald" },
            { icon: <Search className="w-6 h-6" />, title: "Browse Candidates", desc: "Search AI-matched student profiles by skill and major.", color: "blue" },
            { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics", desc: "View applicant stats, match scores, and engagement.", color: "purple" },
          ].map((action, i) => (
            <button key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-left hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                action.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
                action.color === "blue" ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400" :
                "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
              }`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-1">
                {action.title}
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Overview stats */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-10">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: "0", label: "Active Postings", sub: "Post your first role" },
              { val: "0", label: "Total Applicants", sub: "Candidates will appear here" },
              { val: "—", label: "Avg Match Score", sub: "Based on AI matching" },
              { val: "0", label: "Interviews Scheduled", sub: "Connect with students" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.val}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{s.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-center">
          <Briefcase className="w-10 h-10 text-white/80 mx-auto mb-3" />
          <h3 className="text-white text-lg font-bold mb-2">Ready to Find Your Next Hire?</h3>
          <p className="text-emerald-100 text-sm mb-6 max-w-md mx-auto">
            Post your first position and our AI will start matching you with qualified Kean students immediately.
          </p>
          <button className="bg-white text-emerald-700 font-semibold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
            Post Your First Position
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Main Employer Page ──────────────────────────────────────────────────────
export default function Employers() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [view, setView] = useState<"landing" | "login" | "dashboard">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = email.split("@")[0]?.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Company";
    setCompanyName(name);
    setView("dashboard");
  };

  if (view === "dashboard") {
    return <EmployerDashboard companyName={companyName} onLogout={() => setView("landing")} />;
  }

  if (view === "login") {
    const inputCls = "w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 text-sm transition-all";

    return (
      <div className="min-h-screen flex">
        <style>{ANIM_STYLES}</style>

        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950">
          <img src="/Images/kean-building.png" alt="Kean University" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-gray-950/70 to-gray-950/90" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
            <div className="seal-float mb-8">
              <div className="pulse-glow-green rounded-full">
                <img src="/Images/kean-seal.png" alt="" className="w-28 h-28 rounded-full bg-white p-2" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold text-center mb-3">Employer Portal</h2>
            <p className="text-emerald-200/70 text-center max-w-sm leading-relaxed text-sm">
              Connect with pre-qualified Kean University students. AI-matched to your requirements.
            </p>
            <div className="flex items-center gap-6 mt-10">
              {[
                { val: "16K+", label: "Students" },
                { val: "50+", label: "Programs" },
                { val: "Free", label: "Beta Access" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold text-white">{s.val}</div>
                  <div className="text-xs text-emerald-300/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: login form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setView("landing")} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm">
              <div className="flex justify-center mb-6 lg:hidden seal-float">
                <img src="/Images/kean-seal.png" alt="" className="w-16 h-16 rounded-full bg-white p-1 shadow-md" />
              </div>

              <div className="fade-up">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center lg:text-left">
                  Employer Sign In
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center lg:text-left">
                  Access your employer dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 fade-up-d1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password" className={inputCls} required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-100 shadow-lg shadow-emerald-600/20">
                  Sign In
                </button>
              </form>

              <div className="fade-up-d2">
                <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">Request Access</a>
                </p>
                <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Secure employer portal
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ─── Landing view ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <style>{ANIM_STYLES}</style>

      {/* Nav */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src="/Images/kean-seal.png" alt="" className="w-6 h-6 rounded-full bg-white p-0.5" />
            <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Kean <span className="text-blue-600 dark:text-blue-400">AIEducator</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </button>
            <button onClick={() => setView("login")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              Employer Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gray-950 overflow-hidden">
        <img src="/Images/kean-building.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-gray-950/80 to-gray-950/95" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="seal-float mb-6 inline-block">
            <div className="pulse-glow-green rounded-full inline-block">
              <img src="/Images/kean-seal.png" alt="" className="w-20 h-20 rounded-full bg-white p-1.5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5" />
            Employer Portal — Free Beta
          </div>

          <h1 className="text-white mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.1 }}>
            Hire Pre-Qualified{" "}
            <span style={{ background: "linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Kean Talent
            </span>
          </h1>

          <p className="text-white/60 text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Our AI matches your requirements with student profiles, resume scores, and career interests. Skip the resume pile.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => setView("login")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-emerald-600/30">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all">
              See How It Works
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {["Free during beta", "AI-powered matching", "No middleman"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-white/50 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-emerald-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "16,000+", label: "Active Students", icon: <Users className="w-5 h-5" /> },
            { val: "85%", label: "Match Accuracy", icon: <TrendingUp className="w-5 h-5" /> },
            { val: "50+", label: "Degree Programs", icon: <BookOpen className="w-5 h-5" /> },
            { val: "Free", label: "To Post & Browse", icon: <Briefcase className="w-5 h-5" /> },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-emerald-100 mb-1 flex justify-center">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.val}</div>
              <div className="text-xs text-emerald-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-gray-900 dark:text-gray-100 mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Four steps from sign-up to your next great hire.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-gray-900 dark:text-gray-100 mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              Why Recruit Through AIEducator?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-7 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  {b.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-gray-900 dark:text-gray-100 mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              Trusted by Employers
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <Quote className="w-5 h-5 text-emerald-400 mb-3" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                <p className="text-xs text-gray-500">Beta Partner</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-white mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700 }}>
            Start Hiring Kean Talent Today
          </h2>
          <p className="text-gray-400 mb-8">
            Free during beta. No commitment. Post your first role in minutes.
          </p>
          <button onClick={() => setView("login")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto">
            <Building2 className="w-5 h-5" /> Create Employer Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Images/kean-seal.png" alt="" className="w-5 h-5 rounded-full bg-white p-0.5" />
            <span className="text-white font-semibold">Kean AIEducator</span>
          </div>
          <p className="text-gray-500 text-sm">Kean University · Union, New Jersey</p>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-300 transition-colors">Home</button>
            <button onClick={() => navigate("/login")} className="text-gray-500 hover:text-gray-300 transition-colors">Students</button>
          </div>
        </div>
      </footer>
    </div>
  );
}