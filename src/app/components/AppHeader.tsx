import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ChevronLeft, HelpCircle, UserCircle, Sun, Moon } from "lucide-react";

interface HeaderAction {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "ghost" | "outline" | "primary";
}

interface AppHeaderProps {
  back?: { label: string; to: string | number };
  statusLabel?: string;
  actions?: HeaderAction[];
  hideHelp?: boolean;
}

export function AppHeader({ back, statusLabel, actions, hideHelp = false }: AppHeaderProps) {
  const navigate = useNavigate();
  const [initials, setInitials]   = useState<string>("");
  const [hasSession, setHasSession] = useState(false);
  const [dark, setDark]           = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));

    const raw = localStorage.getItem("session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        setHasSession(true);
        if (session.displayName) {
          const parts: string[] = session.displayName.trim().split(/\s+/);
          setInitials(parts.filter(Boolean).map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());
        }
      } catch { /* ignore */ }
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleBack = () => {
    if (typeof back?.to === "number") navigate(back.to as number);
    else if (back?.to) navigate(back.to as string);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">

        {back && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
            aria-label={`Back to ${back.label}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{back.label}</span>
          </button>
        )}

        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          aria-label="Go to home page"
        >
          <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100 hidden sm:flex items-center gap-1.5">
            Kean University
            <span className="hidden md:inline text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
              AIEducator
            </span>
          </span>
        </button>

        <div className="flex-1" />

        {statusLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline shrink-0">{statusLabel}</span>
        )}

        {actions?.map((action, i) => {
          const handleClick = () => {
            if (action.onClick) action.onClick();
            else if (action.to) navigate(action.to);
          };
          if (action.variant === "primary") {
            return (
              <button key={i} onClick={handleClick}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shrink-0">
                {action.icon}<span className="hidden sm:inline">{action.label}</span>
              </button>
            );
          }
          if (action.variant === "outline") {
            return (
              <button key={i} onClick={handleClick}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
                {action.icon}<span className="hidden sm:inline">{action.label}</span>
              </button>
            );
          }
          return (
            <button key={i} onClick={handleClick}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0">
              {action.icon}<span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          aria-label="Toggle dark mode"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {!hideHelp && (
          <button
            onClick={() => navigate("/help")}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Help"
            title="Help"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        )}

        {hasSession ? (
          <button
            onClick={() => navigate("/profile")}
            className="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold flex items-center justify-center transition-colors shrink-0"
            aria-label="My Profile"
            title="My Profile"
          >
            {initials || <UserCircle className="w-4 h-4" />}
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
            aria-label="Sign in"
          >
            <UserCircle className="w-4.5 h-4.5" />
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}