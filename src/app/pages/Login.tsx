import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail, Shield, ArrowLeft, GraduationCap } from "lucide-react";

const ANIM_STYLES = `
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes sealFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(37,99,235,0.15); } 50% { box-shadow: 0 0 30px rgba(37,99,235,0.35); } }
  @keyframes kenBurns { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }
  .fade-up { animation: fadeSlideUp 0.8s ease-out forwards; }
  .fade-up-d1 { animation: fadeSlideUp 0.8s ease-out 0.15s forwards; opacity: 0; }
  .fade-up-d2 { animation: fadeSlideUp 0.8s ease-out 0.3s forwards; opacity: 0; }
  .seal-float { animation: sealFloat 4s ease-in-out infinite; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .ken-burns { animation: kenBurns 25s ease-in-out infinite; }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (localStorage.getItem("session")) navigate("/onboarding", { replace: true });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const namePart = email.split("@")[0] ?? "";
    const displayName = namePart.split(".").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    localStorage.setItem("session", JSON.stringify({ email, displayName }));
    navigate("/onboarding");
  };

  const inputCls =
    "w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-all";

  return (
    <div className="min-h-screen flex">
      <style>{ANIM_STYLES}</style>

      {/* ── LEFT: Campus image panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950">
        <img
          src="/Images/kean-building.png"
          alt="Kean University Campus"
          className="absolute inset-0 w-full h-full object-cover ken-burns opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-gray-950/70 to-gray-950/90" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          {/* Animated seal */}
          <div className="seal-float mb-8">
            <div className="pulse-glow rounded-full">
              <img src="/Images/kean-seal.png" alt="Kean University" className="w-28 h-28 rounded-full bg-white p-2" />
            </div>
          </div>

          <img src="/Images/kean-logo.png" alt="Kean University" className="h-12 mb-6 brightness-0 invert drop-shadow-lg" />

          <h2 className="text-white text-2xl font-bold text-center mb-3">
            Welcome to AIEducator
          </h2>
          <p className="text-blue-200/70 text-center max-w-sm leading-relaxed text-sm">
            AI-powered resume analysis, career matching, and employer connections — built exclusively for Kean University students.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-10">
            {[
              { val: "30s", label: "Analysis Time" },
              { val: "20+", label: "Career Paths" },
              { val: "Free", label: "For Students" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-blue-300/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login form ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        {/* Top bar */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/Images/kean-seal.png" alt="" className="w-6 h-6 rounded-full bg-white" />
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Kean <span className="text-blue-600">AIEducator</span>
            </span>
          </div>
        </div>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mobile seal */}
            <div className="flex justify-center mb-6 lg:hidden seal-float">
              <img src="/Images/kean-seal.png" alt="Kean University" className="w-16 h-16 rounded-full bg-white p-1 shadow-md" />
            </div>

            <div className="fade-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center lg:text-left">
                Student Sign In
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center lg:text-left">
                Use your Kean University credentials
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 fade-up-d1">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" id="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@kean.edu"
                    className={inputCls} required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password" id="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputCls} required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-100 shadow-lg shadow-blue-600/20"
              >
                Sign In
              </button>
            </form>

            <div className="fade-up-d2">
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
                <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-950 px-3 text-xs text-gray-400">or</span></div>
              </div>

              <button
                onClick={() => navigate("/employers")}
                className="w-full py-3.5 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                I'm an Employer
              </button>

              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                No account?{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Contact IT Services</a>
              </p>

              <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Your information is secure and protected
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}