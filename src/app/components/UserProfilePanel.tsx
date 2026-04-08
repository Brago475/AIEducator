import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Briefcase, Code, Target, Pencil, ChevronDown } from "lucide-react";

interface UserProfile {
  major: string;
  skills: string[];
  interests: string[];
}

export function UserProfilePanel() {
  const navigate = useNavigate();
  const [profile, setProfile]         = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isExpanded, setIsExpanded]   = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("userProfile");
    if (raw) { try { setProfile(JSON.parse(raw)); } catch {} }
    const sessionRaw = localStorage.getItem("session");
    if (sessionRaw) { try { const s = JSON.parse(sessionRaw); if (s.displayName) setDisplayName(s.displayName); } catch {} }
  }, []);

  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden sticky top-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold flex items-center justify-center shrink-0">
            {displayName
              ? displayName.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
              : <User className="w-4 h-4" />}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-left">
            {displayName || "My Profile"}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800">
          {profile.major && (
            <div className="pt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Major</span>
              </div>
              <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                {profile.major}
              </span>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Code className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Skills ({profile.skills.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs border border-gray-200 dark:border-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Interests ({profile.interests.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map((interest) => (
                  <span key={interest} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs border border-gray-200 dark:border-gray-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit Profile
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-1.5">
              Changes update match scores instantly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
