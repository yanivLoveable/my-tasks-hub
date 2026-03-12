import { useState } from "react";
import { MessageSquare, Info } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          <Popover open={infoOpen} onOpenChange={setInfoOpen}>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full border border-primary text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Info size={16} />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
                  הסבר על המערכת
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent
              side="bottom"
              align="end"
              className="w-[360px] p-5 rounded-xl"
              dir="rtl"
            >
              <h3 className="text-[15px] font-extrabold text-primary mb-3">הסבר על המערכת</h3>
              <div className="text-[13px] text-foreground leading-relaxed space-y-2">
                <p>
                  ברוכים הבאים למרכז המשימות וההתראות. המערכת מרכזת עבורכם את כל המשימות, האישורים והממתינים לטיפולכם בארגון במקום אחד.
                </p>
                <p>המערכות המחוברות כרגע:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[12px] text-muted-foreground mr-1">
                  <li>SNOW: משימות ואישורים.</li>
                  <li>ERP: משימות מ-WF עסקיים.</li>
                  <li>אישור מסמכים: חתימות וסבבי אישורים.</li>
                </ul>
                <p>בהמשך ירוכזו כאן משימות ממערכות נוספות.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[12px] text-muted-foreground mb-2">
                  אם יש לכם שאלות או הצעות לשיפור נשמח לשמוע
                </p>
                <button
                  className="h-8 px-5 rounded-lg bg-action text-white text-[12px] font-semibold hover:bg-actionHover transition-colors"
                  onClick={() => {
                    setInfoOpen(false);
                    setFeedbackOpen(true);
                  }}
                >
                  שלחו משוב
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Thin divider below the top row */}
      <div className="w-full border-b border-border" />

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
