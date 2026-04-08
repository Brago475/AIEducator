import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, UserCircle, Plus, X } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { ProgressStepper } from "../components/ProgressStepper";
import { StepGuide } from "../components/StepGuide";
import { SkillPicker } from "../components/SkillPicker";
import { MAJORS, PRESET_INTERESTS } from "../data/profileData";

export default function Onboarding() {
  const navigate = useNavigate();
  const [major, setMajor]         = useState("");
  const [skills, setSkills]       = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("userProfile");
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.major)     setMajor(saved.major);
        if (saved.skills)    setSkills(saved.skills);
        if (saved.interests) setInterests(saved.interests);
      } catch {}
    }
    const sessionRaw = localStorage.getItem("session");
    if (sessionRaw) {
      try { const s = JSON.parse(sessionRaw); if (s.displayName) setDisplayName(s.displayName); } catch {}
    }
  }, []);

  const togglePresetInterest = (interest: string) =>
    setInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);

  const removeInterest = (interest: string) => setInterests((prev) => prev.filter((i) => i !== interest));

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const normalized = trimmed.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    if (interests.map((i) => i.toLowerCase()).includes(normalized.toLowerCase())) {
      setCustomError(`"${normalized}" is already in your list.`); return;
    }
    if (trimmed.length > 40) { setCustomError("Max 40 characters."); return; }
    setInterests((prev) => [...prev, normalized]);
    setCustomInput("");
    setCustomError("");
    inputRef.current?.focus();
  };

  const handleCustomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); }
    if (customError) setCustomError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userProfile", JSON.stringify({ major, skills, interests }));
    navigate("/resume-upload");
  };

  const isFormValid     = major && skills.length > 0 && interests.length > 0;
  const customInterests = interests.filter((i) => !PRESET_INTERESTS.includes(i));
  const presetSelected  = interests.filter((i) =>  PRESET_INTERESTS.includes(i));

  const fieldCls = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <AppHeader back={{ label: "Home", to: "/home" }} />
      <ProgressStepper currentStep={1} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <StepGuide
            storageKey="onboarding"
            title="Step 1 of 5 — Build Your Profile"
            steps={[
              "Select your major — this helps us rank which careers align with your degree.",
              "Pick skills from any category, or type your own. Use search or category tabs to browse.",
              "Pick career areas from the preset list, or type your own in the field below.",
            ]}
            next="You'll upload your resume so AIEducator can review it against your profile."
            tip="Your answers are saved locally and pre-filled next time."
          />

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            <div className="mb-7">
              {displayName && (
                <div className="flex items-center gap-2 mb-1.5">
                  <UserCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {displayName}</span>
                </div>
              )}
              <h2 className="text-gray-900 dark:text-gray-100 mb-1">Tell Us About Yourself</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This helps us give you career guidance specific to you.
                {major ? " Your previous answers are pre-filled." : ""}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-9">

              {/* Major */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Major <span className="text-red-500">*</span>
                </label>
                <select value={major} onChange={(e) => setMajor(e.target.value)} className={fieldCls} required>
                  <option value="">Select your major</option>
                  {MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Skills <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Covers Programming, Business, Design, Science, Communication, and more.
                </p>
                <SkillPicker selected={skills} onChange={setSkills} />
                {skills.length === 0 && (
                  <p className="mt-2 text-xs text-red-500 dark:text-red-400">Select at least one skill to continue.</p>
                )}
              </div>

              {/* Career Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Career Interests <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Pick from the list below, or add your own. At least one required.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {PRESET_INTERESTS.map((interest) => (
                    <button key={interest} type="button" onClick={() => togglePresetInterest(interest)}
                      className={`px-4 py-2.5 rounded-lg border transition-all text-sm text-left font-medium ${
                        interests.includes(interest)
                          ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-400"
                      }`}>
                      {interest}
                    </button>
                  ))}
                </div>

                {/* Custom interest */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Add your own interest
                  </p>
                  <div className="flex gap-2">
                    <input ref={inputRef} type="text" value={customInput}
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

                {/* Custom tags */}
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
                    {presetSelected.length > 0 && customInterests.length > 0
                      ? ` (${presetSelected.length} preset, ${customInterests.length} custom)` : ""}
                  </p>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => navigate("/home")}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 font-medium transition-colors">
                  Back
                </button>
                <button type="submit" disabled={!isFormValid}
                  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-7 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}