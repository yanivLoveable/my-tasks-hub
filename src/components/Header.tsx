import { useState } from "react";
import { MessageSquare, Info, X, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import FeedbackModal from "@/components/FeedbackModal";
import { formatTime } from "@/utils/dates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  lastUpdated: Date | null;
  nextRefreshTime: Date | null;
  refreshing?: boolean;
  failedSystems?: Record<string, Date>;
}

export default function Header({
  lastUpdated,
  nextRefreshTime,
  refreshing = false,
  failedSystems = {},
}: HeaderProps) {
  const { user } = useAuth();
  const failedNames = Object.keys(failedSystems);
  const hasPartialFailure = failedNames.length > 0;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const displayName = user?.name || user?.username || "משתמש";

  return (
    <>
      <div className="flex items-center justify-between px-8 py-1" dir="rtl">
        <img src="/logo.png" alt="Logo" width={195} height={40} className="flex-shrink-0" style={{ width: 195, height: 40 }} />
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 select-none whitespace-nowrap">
              עדכון אחרון: {formatTime(lastUpdated)}
              {nextRefreshTime && (
                <>
                  <span className="mx-0.5">|</span>
                  <span>רענון הבא: {formatTime(nextRefreshTime)}</span>
                </>
              )}
              {hasPartialFailure && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle size={14} className="text-amber-500 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" dir="rtl" className="text-[11px] max-w-[260px]">
                      רענון חלק מהמערכות נכשל ({failedNames.join(", ")}). המידע עשוי להיות חלקי.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
          )}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setFeedbackOpen(true)}
                  aria-label="שלח משוב"
                >
                  <span className="relative inline-flex items-center justify-center w-[16px] h-[16px]">
                    <MessageSquare size={16} />
                    <span className="absolute text-[6px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      ★
                    </span>
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                שלח משוב
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Info button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setInfoOpen(true)}
                  aria-label="הסבר על המערכת"
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                הסבר על המערכת
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User icon */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-primary text-primary"
                >
                  <User size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                שלום, {displayName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Thin divider below the top row */}
      <div className="w-full border-b border-border" />

      {/* Info Modal */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent
          className="w-[420px] max-w-[90vw] rounded-2xl px-8 py-6 overflow-hidden border-none [&>button:last-child]:hidden"
          dir="rtl"
        >
          {/* Close button – top-left (RTL) */}
          <button
            onClick={() => setInfoOpen(false)}
            className="absolute left-4 top-4 rounded-full w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex flex-col items-center gap-2.5">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Info size={22} className="text-primary" />
            </div>

            {/* Title */}
            <DialogTitle className="text-[18px] font-extrabold text-primary leading-snug tracking-wide text-center">
              הסבר על המערכת
            </DialogTitle>

            {/* Body text */}
            <div className="text-[13px] text-foreground leading-[1.7] w-full space-y-1.5">
              <p>ברוכים הבאים למרכז המשימות וההתראות!</p>
              <p>
                המערכת מרכזת עבורכם את כל המשימות והאישורים והממתינים לטיפולכם במקום אחד.
              </p>
              <p>המערכות המחוברות כרגע:</p>
              <ul className="list-disc list-inside space-y-0.5 mr-1">
                <li><span className="font-bold">SNOW</span>: משימות ואישורים.</li>
                <li><span className="font-bold">ERP</span>: משימות מ-WF עסקיים.</li>
                <li><span className="font-bold">אישור מסמכים</span>: חתימות וסבבי אישורים.</li>
              </ul>
              <p>בהמשך ירוכזו כאן משימות ממערכות נוספות.</p>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
