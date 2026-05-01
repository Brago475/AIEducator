/**
 * Data privacy utilities for AIEducator.
 *
 * AIEducator is an academic prototype tied to a research study at Kean University.
 * For IRB compliance, no student data is collected on a server. All inputs
 * (profile, resume, AI analysis) live only in the student's browser via localStorage,
 * and can be wiped at any time.
 *
 * Keys created by the app:
 *   session                 login info (email, displayName)
 *   userProfile             major, skills, interests
 *   resumeContent           the raw resume text the student uploaded or pasted
 *   resumeAnalysisResult    the AI scored analysis returned by Groq
 *   theme                   dark/light mode preference (NOT user data, kept on reset)
 */

const USER_DATA_KEYS = [
  "session",
  "userProfile",
  "resumeContent",
  "resumeAnalysisResult",
] as const;

/**
 * Wipes every localStorage key that holds student data.
 * Preserves UI preferences like theme.
 * Returns the list of keys that were actually present and removed,
 * so the caller can show a confirmation message if desired.
 */
export function clearAllUserData(): string[] {
  const cleared: string[] = [];
  for (const key of USER_DATA_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      cleared.push(key);
    }
  }
  return cleared;
}

/**
 * Returns true if any student data is currently stored in the browser.
 * Useful for showing or hiding the Delete button on the privacy notice.
 */
export function hasStoredUserData(): boolean {
  return USER_DATA_KEYS.some((key) => localStorage.getItem(key) !== null);
}

/**
 * Returns a human-readable list of what is currently stored.
 * Used by the privacy notice so students can see exactly what exists
 * before they decide to delete it.
 */
export function listStoredDataLabels(): string[] {
  const labels: Record<(typeof USER_DATA_KEYS)[number], string> = {
    session: "Login session (your name and email)",
    userProfile: "Profile (major, skills, interests)",
    resumeContent: "Uploaded resume text",
    resumeAnalysisResult: "AI resume analysis",
  };
  return USER_DATA_KEYS
    .filter((key) => localStorage.getItem(key) !== null)
    .map((key) => labels[key]);
}