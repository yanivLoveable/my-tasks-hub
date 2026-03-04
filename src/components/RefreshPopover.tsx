import { useState, useEffect, useCallback } from "react";
import { RotateCw, Clock, X } from "lucide-react";
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
import { formatTime } from "@/utils/dates";

interface RefreshPopoverProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
  cooldown: boolean;
  cooldownTime: string;
}

const COOLDOWN_MS = 5 * 60 * 1000;
const STALE_THRESHOLD_MS = 60 * 60 * 1000;

function getRemainingMinutes(lastUpdated: Date | null): number {
  if (!lastUpdated) return 0;
  const elapsed = Date.now() - lastUpdated.getTime();
  return Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 60000));
}

function isStale(lastUpdated: Date | null): boolean {
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated.getTime() > STALE_THRESHOLD_MS;
}

export default function RefreshPopover({
  lastUpdated,
  onRefresh,
  refreshing,
  cooldown,
  cooldownTime,
}: RefreshPopoverProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [, setTick] = useState(0);
  const stale = isStale(lastUpdated);
  const remaining = getRemainingMinutes(lastUpdated);

  // Tick every second when popover is open to update remaining time
  useEffect(() => {
    if (!popoverOpen) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [popoverOpen]);

  const handleClick = useCallback(() => {
    if (refreshing) return;
    if (cooldown) {
      // Show the "up to date" popover
      setPopoverOpen(true);
    } else {
      onRefresh();
    }
  }, [cooldown, refreshing, onRefresh]);

  const tooltipText = stale
    ? "הנתונים לא התרעננו זמן רב, מומלץ לבצע רענון ידני"
    : cooldown
      ? `הרענון יהיה זמין שוב בעוד ${remaining} דקות`
      : "רענון נתונים";

  return (
    <TooltipProvider delayDuration={300}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                  stale
                    ? "text-warning hover:text-warning/80"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={handleClick}
              >
                <RotateCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" dir="rtl" className="text-[11px]">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="bottom"
          align="end"
          dir="rtl"
          className="w-auto max-w-[420px] px-4 py-2.5 rounded-xl bg-background border border-primary/30 shadow-sm"
        >
          <div className="flex items-center gap-3 text-[13px] text-foreground">
            <Clock size={16} className="text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">
              הנתונים עדכניים ל-{lastUpdated ? formatTime(lastUpdated) : "--"}.
              {" "}ניתן לרענן שוב בעוד {remaining} דקות
            </span>
            <button
              onClick={() => setPopoverOpen(false)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
