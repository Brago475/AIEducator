import { AlertTriangle, X } from "lucide-react";

interface ErrorBannerProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ title, message, actionLabel, onAction, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md animate-in fade-in slide-in-from-top">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-800 leading-relaxed">{message}</p>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
