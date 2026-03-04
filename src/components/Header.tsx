import { useState } from "react";
import { MessageSquare } from "lucide-react";
import RefreshPopover from "@/components/RefreshPopover";
import FeedbackModal from "@/components/FeedbackModal";
import { formatDateTimeHebrew } from "@/utils/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  return (
    <>
      <div className="flex items-center justify-between px-8 py-2.5" dir="rtl">
        <span className="text-lg font-extrabold text-primary tracking-wide">
          MATCAM
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
                  className="flex items-center justify-center w-8 h-8 rounded-md transition-colors text-muted-foreground hover:text-primary"
                  onClick={() => setFeedbackOpen(true)}
                >
                  <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
                    <MessageSquare size={18} />
                    <span className="absolute text-[7px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
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
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
