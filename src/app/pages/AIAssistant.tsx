import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Send, Bot, FileText, Briefcase, RotateCcw,
  UserCircle, Key, ChevronRight, CheckCircle, Circle,
  Sparkles, X,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { ApiKeyModal } from "../components/ApiKeyModal";
import { createClient, hasKey, clearKey } from "../utils/openaiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Build system prompt from user context ────────────────────────────────────
function buildSystemPrompt(): string {
  let name = "Student", major = "", skills: string[] = [], interests: string[] = [];
  let hasResume = false;

  try {
    const session = localStorage.getItem("session");
    if (session) { const s = JSON.parse(session); name = s.displayName || name; }
  } catch { /* ignore */ }

  try {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      const p = JSON.parse(profile);
      major     = p.major     || "";
      skills    = p.skills    || [];
      interests = p.interests || [];
    }
  } catch { /* ignore */ }

  hasResume = !!localStorage.getItem("resumeContent");

  const steps = [
    { label: "Onboarding profile complete",     done: !!(major && skills.length > 0 && interests.length > 0) },
    { label: "Resume uploaded",                  done: hasResume },
    { label: "Resume analyzed",                  done: !!localStorage.getItem("resumeAnalysisResult") },
  ];

  const incomplete = steps.filter((s) => !s.done).map((s) => `• ${s.label}`);

  return `You are AIEducator, an AI career assistant built exclusively for Kean University students in New Jersey.

STUDENT PROFILE:
- Name: ${name}
- Major: ${major || "Not set yet"}
- Skills: ${skills.length > 0 ? skills.join(", ") : "None selected yet"}
- Career interests: ${interests.length > 0 ? interests.join(", ") : "None selected yet"}
- Resume uploaded: ${hasResume ? "Yes" : "No"}

APP PROGRESS:
${steps.map((s) => `${s.done ? "✅" : "❌"} ${s.label}`).join("\n")}
${incomplete.length > 0 ? `\nSTILL NEEDS TO COMPLETE:\n${incomplete.join("\n")}` : "\nAll steps complete!"}

YOUR JOB:
1. Be warm, friendly, and encouraging — like a supportive mentor who genuinely wants to see them succeed. Use their name naturally.
2. Give SPECIFIC advice tied to this student's actual major (${major || "not yet set"}), skills, and interests.
3. If they haven't completed a step above, gently encourage them (e.g., "By the way, once you add your major in your Profile, I can give you way better advice!").
4. For resume questions, reference their specific background and celebrate what they're doing well before suggesting improvements.
5. For career questions, be enthusiastic about the possibilities that match their interests.
6. Keep replies conversational and easy to read — use short paragraphs, not walls of text. 3-5 key points max.
7. Start responses with something personal or encouraging — never jump straight into a list.
8. Use phrases like "Great question!", "That's a smart move", "I love that you're thinking about this" naturally.
9. For NJ/NYC job market questions, be specific about companies and neighborhoods.
10. If they seem unsure or anxious, reassure them — career planning is stressful and they're already ahead by using this tool.

IMPORTANT: Never give generic, copy-paste advice. Every response must reference something specific about this student when the question is career-related. Be the career advisor they wish they had — knowledgeable, approachable, and always in their corner.

ALSO: You are a helpful general assistant too. If the student asks general questions (math, science, homework, life advice, etc.), answer them helpfully and accurately. You're not limited to career topics only — think of yourself as a smart friend who happens to be a career expert. Help with whatever they need.`;
}

// ─── Quick action prompts ─────────────────────────────────────────────────────
function getQuickActions(hasResume: boolean, hasProfile: boolean): Array<{ label: string; prompt: string }> {
  const actions = [];
  if (!hasProfile) actions.push({ label: "How do I set up my profile?", prompt: "Walk me through setting up my profile step by step." });
  if (!hasResume)  actions.push({ label: "Help me upload my resume", prompt: "What formats can I upload my resume in and how do I do it?" });
  if (hasResume)   actions.push({ label: "How can I improve my resume?", prompt: "Based on my profile and major, what are the most important improvements I should make to my resume?" });
  actions.push({ label: "What career paths fit me?", prompt: "Based on my major and skills, which career paths would be the best fit for me and why?" });
  actions.push({ label: "Prepare me for interviews", prompt: "What are the most common interview questions for someone with my background, and how should I answer them?" });
  actions.push({ label: "What skills should I learn next?", prompt: "Given my current skills and career interests, what should I learn next to be more competitive?" });
  return actions.slice(0, 6);
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepProgress() {
  const navigate = useNavigate();
  const steps = [
    { label: "Profile", to: "/onboarding", done: (() => { try { const p = JSON.parse(localStorage.getItem("userProfile") || "{}"); return !!(p.major && p.skills?.length && p.interests?.length); } catch { return false; } })() },
    { label: "Resume",  to: "/resume-upload", done: !!localStorage.getItem("resumeContent") },
    { label: "Analysis",to: "/ai-analysis",   done: !!localStorage.getItem("resumeAnalysisResult") },
  ];
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;
  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Complete your setup for the best experience
      </p>
      <div className="flex gap-2 flex-wrap">
        {steps.map((step) => (
          <button
            key={step.label}
            onClick={() => !step.done && navigate(step.to)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              step.done
                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 cursor-default"
                : "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
            }`}
          >
            {step.done
              ? <CheckCircle className="w-3.5 h-3.5" />
              : <Circle className="w-3.5 h-3.5" />}
            {step.label}
            {!step.done && <ChevronRight className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <p key={i} className="font-bold mt-2">{line.slice(4)}</p>;
        if (line.startsWith("## "))  return <p key={i} className="font-bold mt-2 text-base">{line.slice(3)}</p>;
        if (line.startsWith("# "))   return <p key={i} className="font-bold mt-2">{line.slice(2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return <p key={i} className="flex gap-2"><span className="shrink-0 mt-0.5">•</span><span>{line.slice(2)}</span></p>;
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return <p key={i} className="flex gap-2"><span className="shrink-0 font-semibold">{num}.</span><span>{line.replace(/^\d+\.\s/, "")}</span></p>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        }
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hi! I'm AIEducator — your personal career assistant for Kean University. I know your profile, your skills, and your goals. Ask me anything about your resume, career paths, interviews, or what to learn next. I'll give you specific advice, not generic tips.",
  timestamp: new Date(),
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [showKeyModal, setShowKeyModal]   = useState(false);
  const [messages, setMessages]           = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]                 = useState("");
  const [isStreaming, setIsStreaming]     = useState(false);
  const [canUndo, setCanUndo]             = useState(false);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);
  const inputRef                          = useRef<HTMLInputElement>(null);
  const abortRef                          = useRef<AbortController | null>(null);

  const hasResume  = !!localStorage.getItem("resumeContent");
  const hasProfile = (() => {
    try { const p = JSON.parse(localStorage.getItem("userProfile") || "{}"); return !!(p.major && p.skills?.length); }
    catch { return false; }
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for key on first meaningful send attempt
  const ensureKey = useCallback((): boolean => {
    if (hasKey()) return true;
    setShowKeyModal(true);
    return false;
  }, []);

  const handleSend = useCallback(async (questionText?: string) => {
    const userText = (questionText || input).trim();
    if (!userText || isStreaming) return;
    if (!ensureKey()) return;

    const client = createClient();
    if (!client) { setShowKeyModal(true); return; }

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setCanUndo(false);

    // Add empty assistant message that we'll fill via streaming
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", timestamp: new Date() };
    setMessages((prev) => [...prev, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const history = [...messages, userMsg].slice(-14).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const stream = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...history,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      });

      let accumulated = "";
      for await (const chunk of stream) {
        if (abortRef.current?.signal.aborted) break;
        const delta = chunk.choices[0]?.delta?.content || "";
        accumulated += delta;
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
        );
      }
      setCanUndo(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const isAuthErr = errMsg.toLowerCase().includes("auth") || errMsg.toLowerCase().includes("401") || errMsg.toLowerCase().includes("key");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: isAuthErr
                  ? "⚠️ Your API key appears to be invalid or expired. Click the key icon in the header to update it."
                  : `⚠️ Something went wrong: ${errMsg}. Please try again.`,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isStreaming, messages, ensureKey]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleUndo = () => {
    setMessages((prev) => {
      const arr = [...prev];
      // Remove last assistant + user message pair
      while (arr.length > 1 && arr[arr.length - 1].role === "assistant") arr.pop();
      while (arr.length > 1 && arr[arr.length - 1].role === "user") arr.pop();
      return arr;
    });
    setCanUndo(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const quickActions = getQuickActions(hasResume, hasProfile);
  const showQuickActions = messages.length < 3;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <AppHeader
        back={{ label: "Back", to: "/home" }}
        actions={[
          { label: "Resume Feedback", to: "/ai-feedback",             icon: <FileText   className="w-4 h-4" />, variant: "ghost" },
          { label: "Career Paths",    to: "/career-recommendations",  icon: <Briefcase  className="w-4 h-4" />, variant: "ghost" },

        ]}
      />



      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 overflow-hidden flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex flex-col" style={{ height: "calc(100vh - 140px)" }}>

          <StepProgress />

          {/* Chat container */}
          <div className="flex flex-col flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white dark:text-gray-900" />
                </div>
                <div>
                  <h1 className="text-gray-900 dark:text-gray-100">AIEducator</h1>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${hasKey() ? "bg-green-500" : "bg-gray-400"}`} />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {hasKey() ? "Connected · Llama 3.3 70B" : "AI not configured"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canUndo && (
                  <button onClick={handleUndo} title="Undo last message"
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Undo
                  </button>
                )}
                {messages.length > 1 && (
                  <button onClick={() => { setMessages([INITIAL_MESSAGE]); setCanUndo(false); }}
                    title="Clear chat"
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center shrink-0 mr-2.5 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 dark:bg-blue-500 text-white rounded-tr-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm"
                  }`}>
                    {message.role === "assistant"
                      ? <MessageContent content={message.content || "…"} />
                      : <p className="text-sm leading-relaxed">{message.content}</p>
                    }
                    {message.content && (
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-200" : "text-gray-500 dark:text-gray-400"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0 ml-2.5 mt-1">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming indicator */}
              {isStreaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center shrink-0 mr-2.5">
                    <Bot className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {[0, 150, 300].map((d) => (
                        <div key={d} className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {showQuickActions && (
              <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3 shrink-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Quick questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {quickActions.map((q, i) => (
                    <button key={i} onClick={() => handleSend(q.prompt)}
                      className="text-left text-xs px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasKey() ? "Ask anything about your resume, career, or interviews…" : "Ask anything about your resume, career, or interviews…"}
                  disabled={isStreaming}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
                    disabled:opacity-60"
                />
                {isStreaming ? (
                  <button onClick={handleStop}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 text-sm">
                    Stop
                  </button>
                ) : (
                  <button onClick={() => handleSend()} disabled={!input.trim()}
                    className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 text-sm">
                    <Send className="w-4 h-4" /> Send
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                {!hasKey()
                  ? <span className="text-gray-500">AI is not configured. Contact the administrator.</span>
                  : "Press Enter to send · Responses are specific to your profile and resume"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
