import { X } from "lucide-react";
import type { BannerMessage } from "@/hooks/useTasks";

interface BannerProps {
  message: BannerMessage | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

const BANNER_STYLES: Record<BannerMessage["type"], string> = {
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function Banner({ message, onDismiss, onRetry }: BannerProps) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 border-b text-[13px] ${BANNER_STYLES[message.type]}`}
    >
      <div className="flex items-center gap-2">
        <span>{message.text}</span>
        {message.type === "error" && onRetry && (
          <button
            className="underline font-semibold hover:no-underline"
            onClick={onRetry}
          >
            נסה שוב
          </button>
        )}
      </div>
      <button
        className="p-1 hover:opacity-70 transition-opacity"
        onClick={onDismiss}
      >
        <X size={14} />
      </button>
    </div>
  );
}
