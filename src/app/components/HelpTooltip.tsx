import { HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-indigo-600 hover:text-indigo-800 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
          {title && (
            <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}
