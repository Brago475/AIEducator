import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  User, GraduationCap, Code2, Target, Save, CheckCircle,
  Plus, X, AlertTriangle, ChevronRight, RotateCcw, Info,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { SkillPicker } from "../components/SkillPicker";
import { MAJORS, PRESET_INTERESTS } from "../data/profileData";

function computeCompleteness(displayName: string, major: string, skills: string[], interests: string[]) {
  const checks = [
    { label: "Display name",       done: displayName.trim().length > 0 },
    { label: "Major selected",     done: major.length > 0 },
    { label: "At least 1 skill",   done: skills.length > 0 },
    { label: "At least 1 interest",done: interests.length > 0 },
    { label: "3+ skills",          done: skills.length >= 3 },
    { label: "2+ interests",       done: interests.length >= 2 },
  ];
  return { checks, pct: Math.round((checks.filter((c) => c.done).length / checks.length) * 100) };
}

function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail]               = useState("");
  const [displayName, setDisplayName]   = useState("");
  const [major, setMajor]               = useState("");
  const [skills, setSkills]             = useState<string[]>([]);
  const [interests, setInterests]       = useState<string[]>([]);
  const [saved, setSaved]               = useState(false);
  const [dirty, setDirty]               = useState(false);
  const [showReset, setShowReset]       = useState(false);
  const [customInput, setCustomInput]   = useState("");
  const [customError, setCustomError]   = useState("");
  const customInputRef                  = useRef<HTMLInputElement>(null);
  const [snapshot, setSnapshot]         = useState("");

  useEffect(() => {
    let loadedName = "", loadedEmail = "", loadedMajor = "", loadedSkills: string[] = [], loadedInterests: string[] = [];
    const sessionRaw = localStorage.getItem("session");
    if (sessionRaw) {
      try { const s = JSON.parse(sessionRaw); if (s.displayName) { loadedName = s.displayName; setDisplayName(s.displayName); } if (s.email) { loadedEmail = s.email; setEmail(s.email); } } catch {}
    }
    const profileRaw = localStorage.getItem("userProfile");
    if (profileRaw) {
      try {
        const p = JSON.parse(profileRaw);
        if (p.major)     { loadedMajor     = p.major;     setMajor(p.major); }
        if (p.skills)    { loadedSkills    = p.skills;    setSkills(p.skills); }
        if (p.interests) { loadedInterests = p.interests; setInterests(p.interests); }
      } catch {}
    }
    setSnapshot(JSON.stringify({ displayName: loadedName, major: loadedMajor, skills: loadedSkills, interests: loadedInterests }));
  }, []);

  useEffect(() => {
    setDirty(JSON.stringify({ displayName, major, skills, interests }) !== snapshot);
  }, [displayName, major, skills, interests, snapshot]);

  const togglePresetInterest = (i: string) =>
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  const removeInterest = (i: string) => setInterests((prev) => prev.filter((x) => x !== i));

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const normalized = trimmed.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    if (interests.map((x) => x.toLowerCase()).includes(normalized.toLowerCase())) {
      setCustomError(`"${normalized}" is already in your list.`); return;
    }
    if (trimmed.length > 40) { setCustomError("Max 40 characters."); return; }
    setInterests((prev) => [...prev, normalized]);
    setCustomInput("");
    setCustomError("");
    customInputRef.current?.focus();
  };

  const handleCustomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); }
    if (customError) setCustomError("");
  };

  const handleSave = () => {
    const sessionRaw = localStorage.getItem("session");
    let session: Record<string, string> = {};
    if (sessionRaw) { try { session = JSON.parse(sessionRaw); } catch {} }
    session.displayName = displayName.trim();
    localStorage.setItem("session", JSON.stringify(session));
    localStorage.setItem("userProfile", JSON.stringify({ major, skills, interests }));
    setSnapshot(JSON.stringify({ displayName: displayName.trim(), major, skills, interests }));
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    localStorage.removeItem("userProfile");
    localStorage.removeItem("session");
    setDisplayName(""); setEmail(""); setMajor(""); setSkills([]); setInterests([]);
    setShowReset(false);
    setSnapshot(JSON.stringify({ displayName: "", major: "", skills: [], interests: [] }));
  };

  const customInterests = interests.filter((i) => !PRESET_INTERESTS.includes(i));
  const { checks, pct } = computeCompleteness(displayName, major, skills, interests);
  const completenessColor = pct >= 80 ? "bg-green-500 dark:bg-green-400" : pct >= 50 ? "bg-blue-500 dark:bg-blue-400" : "bg-red-400";
  const completenessLabel = pct >= 80 ? "Great shape" : pct >= 50 ? "Almost there" : "Needs work";

  const fieldCls = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <AppHeader back={{ label: "Home", to: "/" }} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100">My Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your profile powers career match scores and resume feedback.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {dirty && (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Unsaved changes
                </span>
              )}
              {saved && (
                <span className="text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              <button onClick={handleSave} disabled={!dirty}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white disabled:text-gray-400 dark:disabled:text-gray-600 text-sm font-medium rounded-lg transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          {/* Completeness */}
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Profile Completeness</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                pct >= 80 ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900" :
                pct >= 50 ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" :
                            "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
              }`}>
                {pct}% — {completenessLabel}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-4">
              <div className={`${completenessColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  {c.done
                    ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 shrink-0" />}
                  <span className={c.done ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <Section icon={<User className="w-4 h-4" />} title="Account" subtitle="Your name is shown in greetings throughout the app">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Martinez" className={fieldCls} />
              </div>
              {email && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">University Email</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600">{email}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Academic */}
          <Section icon={<GraduationCap className="w-4 h-4" />} title="Academic Info" subtitle="Used to weight careers linked to your major">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Major</label>
              <select value={major} onChange={(e) => setMajor(e.target.value)} className={fieldCls}>
                <option value="">Select your major</option>
                {MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {major && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Careers linked to {major} will receive a major alignment bonus.
                </p>
              )}
            </div>
          </Section>

          {/* Skills */}
          <Section icon={<Code2 className="w-4 h-4" />} title="Skills" subtitle="Each skill you have adds points to a matching career's score">
            <SkillPicker selected={skills} onChange={setSkills} compact />
            {skills.length > 0 && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {skills.length} skill{skills.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </Section>

          {/* Career Interests */}
          <Section icon={<Target className="w-4 h-4" />} title="Career Interests" subtitle="Each matching interest adds points to a career's score">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {PRESET_INTERESTS.map((interest) => (
                <button key={interest} type="button" onClick={() => togglePresetInterest(interest)}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                    interests.includes(interest)
                      ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400"
                  }`}>
                  {interest}
                </button>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Add a custom interest
              </p>
              <div className="flex gap-2">
                <input ref={customInputRef} type="text" value={customInput}
                  onChange={(e) => { setCustomInput(e.target.value); setCustomError(""); }}
                  onKeyDown={handleCustomKey}
                  placeholder="e.g. Game Development, Robotics, UX Design"
                  maxLength={40}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                <button type="button" onClick={addCustomInterest} disabled={!customInput.trim()}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {customError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{customError}</p>}
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                Press <kbd className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700 dark:text-gray-200">Enter</kbd> to add quickly.
              </p>
            </div>

            {customInterests.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Your custom interests</p>
                <div className="flex flex-wrap gap-2">
                  {customInterests.map((interest) => (
                    <span key={interest} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)}
                        className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-400 hover:text-white flex items-center justify-center transition-colors"
                        aria-label={`Remove ${interest}`}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {interests.length > 0 && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                {interests.length} interest{interests.length !== 1 ? "s" : ""} selected
                {customInterests.length > 0 && ` (${interests.length - customInterests.length} preset, ${customInterests.length} custom)`}
              </p>
            )}
          </Section>

          {/* How it affects results */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">How your profile affects match scores</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { icon: <GraduationCap className="w-3.5 h-3.5" />, label: "Major", desc: "Adds up to 25 pts to careers linked to your degree program." },
                    { icon: <Code2 className="w-3.5 h-3.5" />, label: "Skills", desc: "Each skill you have that a career needs adds proportional points." },
                    { icon: <Target className="w-3.5 h-3.5" />, label: "Interests", desc: "Each matching interest (preset or custom) adds up to 35 total pts." },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">{icon} {label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{desc}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/career-recommendations")}
                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 transition-colors">
                  View Career Matches <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pb-2">
            <button onClick={handleSave} disabled={!dirty}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-medium rounded-lg transition-all">
              <Save className="w-4 h-4" /> {dirty ? "Save Changes" : "All Changes Saved"}
            </button>
          </div>

          {/* Danger zone */}
          <div className="border border-red-200 dark:border-red-900 rounded-xl overflow-hidden">
            <div className="bg-red-50 dark:bg-red-950 px-6 py-4 border-b border-red-200 dark:border-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-300">Danger Zone</span>
            </div>
            <div className="px-6 py-5 bg-white dark:bg-gray-900">
              {!showReset ? (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Reset Profile</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Clears all saved data. This cannot be undone.</p>
                  </div>
                  <button onClick={() => setShowReset(true)}
                    className="px-4 py-2 text-sm font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Profile
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Are you sure?</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mb-4">
                    This will delete your major, skills, interests, and login session. You'll need to log in again.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors">
                      Yes, Reset Everything
                    </button>
                    <button onClick={() => setShowReset(false)}
                      className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}