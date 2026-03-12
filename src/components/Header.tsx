import { useState } from "react";
import { MessageSquare, Info, X } from "lucide-react";
import RefreshPopover from "@/components/RefreshPopover";
import FeedbackModal from "@/components/FeedbackModal";
import { formatDateTimeHebrew } from "@/utils/format";
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
  onRefresh: () => void;
  refreshing: boolean;
  cooldown: boolean;
  cooldownTime: string;
}

export default function Header({
  lastUpdated,
  onRefresh,
  refreshing,
  cooldown,
  cooldownTime,
}: HeaderProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-8 py-1.5" dir="rtl">
        <span className="text-base font-extrabold text-primary tracking-wide">
          YANIV
        </span>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground/60 select-none">
              עדכון אחרון: {formatDateTimeHebrew(lastUpdated)}
            </span>
          )}
          <RefreshPopover
            lastUpdated={lastUpdated}
            onRefresh={onRefresh}
            refreshing={refreshing}
            cooldown={cooldown}
            cooldownTime={cooldownTime}
          />
          <div className="w-px h-4 bg-border" />
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setFeedbackOpen(true)}
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
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setInfoOpen(true)}
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                הסבר על המערכת
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

            {/* Footer divider + dual buttons */}
            <div className="w-full mt-1 pt-3 border-t border-border flex flex-col items-center gap-2">
              <p className="text-[12px] text-foreground text-center">
                אם יש לכם שאלות או הצעות לשיפור נשמח לשמוע
              </p>
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  className="h-10 px-7 rounded-xl bg-action text-white text-[13px] font-semibold hover:bg-actionHover transition-colors"
                  onClick={() => {
                    setInfoOpen(false);
                    setFeedbackOpen(true);
                  }}
                >
                  שלחו משוב
                </button>
                <button
                  className="h-10 px-5 rounded-xl border border-border text-[13px] font-semibold text-primary hover:bg-secondary transition-colors"
                  onClick={() => setInfoOpen(false)}
                >
                  סגירה
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
