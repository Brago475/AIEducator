/**
 * resumeAnalyzer.ts — AI-powered resume analysis using OpenAI GPT-4o mini.
 * No hardcoded rules. Every piece of feedback is generated from the actual resume text.
 */
import { createClient } from "./openaiClient";

// ─── Shared types (consumed by AIAnalysis + AIFeedback) ──────────────────────

export interface WeakBullet {
  original: string;
  issues: string[];
  suggestions: string[];
}

export interface SuggestedAddition {
  label: string;
  why: string;
  howTo: string;
}

export interface ResumeAnalysis {
  score: number;
  grade: string;
  gradeLabel: string;
  strengths: string[];
  missingKeywords: Array<{ keyword: string; why: string }>;
  weakBullets: WeakBullet[];
  suggestedAdditions: SuggestedAddition[];
  scoreBreakdown: {
    completeness: number;
    keywords: number;
    formatting: number;
    achievements: number;
    bestPractices: number;
  };
}

export interface AnalysisProfile {
  major?: string;
  skills?: string[];
  interests?: string[];
}

// ─── Main AI analysis function ────────────────────────────────────────────────

export async function analyzeResumeWithAI(
  resumeText: string,
  profile?: AnalysisProfile
): Promise<ResumeAnalysis> {
  const client = createClient();
  if (!client) throw new Error("NO_API_KEY");
  if (!resumeText.trim()) throw new Error("EMPTY_RESUME");

  const systemPrompt = `You are an expert resume reviewer for college students entering the job market.
Your job is to provide SPECIFIC, ACTIONABLE feedback based on the ACTUAL content of the resume you receive.
Never give generic advice. Quote real text from the resume. Reference their actual job titles, company names, bullet points, and skills.
Respond ONLY with valid JSON matching the schema provided.`;

  const userPrompt = `Analyze this student's resume thoroughly. Be specific to their actual content — quote real bullet points, reference their real job titles and companies.

STUDENT CONTEXT:
- Major: ${profile?.major || "Not specified"}
- Declared skills: ${profile?.skills?.length ? profile.skills.join(", ") : "Not specified"}
- Career interests: ${profile?.interests?.length ? profile.interests.join(", ") : "Not specified"}

RESUME TEXT:
---
${resumeText.slice(0, 6000)}
---

Return ONLY this JSON object (no markdown, no extra text):
{
  "score": <integer 0-100, be honest and accurate — average student resume scores 55-70>,
  "grade": <"A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F">,
  "gradeLabel": <brief label e.g. "Strong" | "Good" | "Needs Work" | "Weak">,
  "strengths": [
    <3-5 SPECIFIC strengths observed in THIS resume — quote real content, job titles, skills found>
  ],
  "weakBullets": [
    {
      "original": <exact bullet text copied verbatim from the resume>,
      "issues": [<specific reason this bullet fails — e.g. "no metric", "passive voice", "vague verb">],
      "suggestions": [
        <rewrite 1 using STAR method with placeholder metrics like [X%]>,
        <rewrite 2 with different action verb and angle>,
        <rewrite 3 emphasizing a different impact>
      ]
    }
    // Include 3-5 weak bullets, pick the worst ones
  ],
  "missingKeywords": [
    {
      "keyword": <specific skill/tool/term missing>,
      "why": <why THIS keyword matters for their major "${profile?.major || "their field"}" specifically>
    }
    // 4-6 most impactful missing keywords for their field
  ],
  "suggestedAdditions": [
    {
      "label": <what section or content to add>,
      "why": <specific reason based on their major/interests>,
      "howTo": <concrete actionable instruction with an example>
    }
    // 3-5 suggestions
  ],
  "scoreBreakdown": {
    "completeness":   <0-25, based on presence of: contact, summary, education, experience, skills>,
    "keywords":       <0-25, based on field-relevant terms found vs missing>,
    "formatting":     <0-20, based on structure, consistency, readability>,
    "achievements":   <0-15, based on quantified results and impact statements>,
    "bestPractices":  <0-15, based on action verbs, length, tense consistency, no typos>
  }
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 2500,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("EMPTY_RESPONSE");

  const data = JSON.parse(raw) as ResumeAnalysis;

  // Clamp all scores to valid ranges
  data.score = Math.max(0, Math.min(100, data.score));
  data.scoreBreakdown.completeness  = Math.max(0, Math.min(25, data.scoreBreakdown.completeness));
  data.scoreBreakdown.keywords      = Math.max(0, Math.min(25, data.scoreBreakdown.keywords));
  data.scoreBreakdown.formatting    = Math.max(0, Math.min(20, data.scoreBreakdown.formatting));
  data.scoreBreakdown.achievements  = Math.max(0, Math.min(15, data.scoreBreakdown.achievements));
  data.scoreBreakdown.bestPractices = Math.max(0, Math.min(15, data.scoreBreakdown.bestPractices));

  return data;
}

// ─── Save / load cached result ────────────────────────────────────────────────

export function saveAnalysisResult(result: ResumeAnalysis): void {
  localStorage.setItem("resumeAnalysisResult", JSON.stringify(result));
}

export function loadAnalysisResult(): ResumeAnalysis | null {
  try {
    const raw = localStorage.getItem("resumeAnalysisResult");
    return raw ? (JSON.parse(raw) as ResumeAnalysis) : null;
  } catch {
    return null;
  }
}
