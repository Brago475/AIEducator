import { useNavigate } from "react-router";
import { AppHeader } from "../components/AppHeader";
import {
  HelpCircle,
  FileText,
  TrendingUp,
  Briefcase,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    icon: <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "How is my resume score calculated?",
    answer:
      "Your resume score (0-100) is based on completeness (25%), keyword optimization (25%), formatting and readability (20%), quantifiable achievements (15%), and industry best practices (15%). Each section is analyzed to provide actionable feedback.",
  },
  {
    icon: <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "What file formats can I upload?",
    answer:
      "We support PDF, DOCX, DOC, and TXT files up to 10 MB. For best results with PDFs, if the extracted text looks garbled, use the Paste Text option instead.",
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "What does 'weak bullet point' mean?",
    answer:
      "Weak bullet points lack specific metrics, action verbs, or measurable outcomes. Strong bullets include numbers, demonstrate impact, and use active language. Each flagged bullet includes 3 concrete rewrite options.",
  },
  {
    icon: <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "How are career recommendations generated?",
    answer:
      "Career matches are scored across 28 paths in 8 fields using three components: Skill Match (0-40 pts), Interest Alignment (0-35 pts), and Major Alignment (0-25 pts). No artificial base score — every point is earned.",
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "How can I get more personalized help?",
    answer:
      "Use the AI Assistant (purple chat button) available on every page. Ask specific questions about your resume, career paths, or skill development. The AI has context about your profile and can provide tailored guidance.",
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "Is my data saved between sessions?",
    answer: "Yes. Your profile and resume are saved locally in your browser. You won't need to re-enter information when you return. Data is stored only on your device, not on our servers.",
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "What if I get stuck or encounter an error?",
    answer: "Use the back button on any page to go back. For technical issues, contact Kean University Career Services at career@kean.edu or visit the Career Center in Kean Hall.",
  },
  {
    icon: <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />,
    question: "Can I upload multiple resumes?",
    answer: "Yes. Upload a new resume any time from the Resume Upload page — each new upload replaces the previous analysis. Keep your own copies of different versions outside this tool.",
  },
];

const QUICK_TIPS = [
  "Use the chat button on any page to ask the AI Assistant questions",
  "Use the back button to review previous steps without losing progress",
  "Your progress is automatically saved as you complete each step",
  "Hover over question mark icons throughout the app for helpful tips",
];

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <AppHeader
        back={{ label: "Go Back", to: -1 }}
        actions={[{ label: "AI Assistant", to: "/ai-assistant", icon: <MessageCircle className="w-4 h-4" />, variant: "outline" }]}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <HelpCircle className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h1 className="text-gray-900 dark:text-gray-100 mb-1">Help and Documentation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Everything you need to know about using AIEducator</p>
          </div>

          {/* Quick Tips */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-gray-900 dark:text-gray-100 mb-4">Quick Tips</h2>
            <ul className="space-y-2">
              {QUICK_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <h2 className="text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{item.question}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-gray-900 dark:text-gray-100 mb-2">Still Need Help?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Kean University Career Services is here to support you.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:career@kean.edu"
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-white transition-colors">
                Email Career Services
              </a>
              <button onClick={() => navigate("/ai-assistant")}
                className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Ask AI Assistant
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}