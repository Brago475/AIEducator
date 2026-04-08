import { useState } from "react";
import { Key, ExternalLink, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Shield, X } from "lucide-react";
import { storeKey, testKey } from "../utils/openaiClient";

interface ApiKeyModalProps {
  onSuccess: () => void;
  onDismiss?: () => void;
}

export function ApiKeyModal({ onSuccess, onDismiss }: ApiKeyModalProps) {
  const [key, setKey]           = useState("");
  const [show, setShow]         = useState(false);
  const [status, setStatus]     = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith("sk-")) {
      setStatus("error");
      setErrorMsg("Key must start with 'sk-'. Get yours at platform.openai.com.");
      return;
    }
    setStatus("testing");
    setErrorMsg("");
    const result = await testKey(trimmed);
    if (result.ok) {
      storeKey(trimmed);
      setStatus("ok");
      setTimeout(onSuccess, 600);
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Invalid key. Please check and try again.");
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-gray-100">Connect Your AI</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">OpenAI API key required</p>
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Explanation */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            AIEducator uses OpenAI's GPT-4o mini to analyze your resume and power the AI chat. 
            You need your own API key — it's free to start and costs fractions of a cent per use.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700">
            {[
              { n: 1, text: "Sign up at platform.openai.com" },
              { n: 2, text: "Go to API Keys → Create new secret key" },
              { n: 3, text: "Paste your key below" },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{n}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
              </div>
            ))}
          </div>

          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-700 dark:text-blue-400 hover:underline font-medium"
          >
            Get your API key <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              Your OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                onKeyDown={handleKey}
                placeholder="sk-..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {status === "error" && (
              <div className="mt-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">{errorMsg}</p>
              </div>
            )}
            {status === "ok" && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Key verified! Setting up your AI…</p>
              </div>
            )}
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              Your key is stored only in your browser (localStorage) and sent directly to OpenAI. 
              It is never sent to Kean or AIEducator servers.
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!key.trim() || status === "testing" || status === "ok"}
            className="w-full py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600
              text-white font-semibold rounded-xl transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {status === "testing" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying key…</>
            ) : status === "ok" ? (
              <><CheckCircle className="w-4 h-4" /> Connected!</>
            ) : (
              <><Key className="w-4 h-4" /> Connect & Continue</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
