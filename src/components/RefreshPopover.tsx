import { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
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

interface RefreshPopoverProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing: boolean;
  cooldown: boolean;
  cooldownTime: string;
}

const AUTO_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 min
const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 60 min

function formatHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getCountdown(lastUpdated: Date | null): string {
  if (!lastUpdated) return "--:--";
  const nextRefresh = lastUpdated.getTime() + AUTO_REFRESH_INTERVAL_MS;
  const remaining = Math.max(0, nextRefresh - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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
  const [, setTick] = useState(0);
  const stale = isStale(lastUpdated);

  // Tick every second to update countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const tooltipText = stale
    ? "הנתונים לא התרעננו זמן רב, מומלץ לבצע רענון ידני"
    : cooldown
      ? `הרענון יהיה זמין שוב בשעה ${cooldownTime}`
      : "רענון נתונים";

  return (
    <TooltipProvider delayDuration={300}>
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  stale
                    ? "text-warning hover:text-warning/80"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={(e) => {
                  // Don't open popover on click if we want to refresh
                  // Let the popover handle display, refresh on button inside
                }}
                disabled={false}
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
          className="w-auto min-w-[220px] p-3"
        >
          <div className="flex flex-col gap-2 text-[12px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span
                className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${
                  stale ? "bg-warning" : "bg-success"
                }`}
              />
              <span>
                עדכון אחרון:{" "}
                <span className="font-semibold text-foreground">
                  {lastUpdated ? formatHHMM(lastUpdated) : "--:--"}
                </span>
              </span>
              <span className="text-muted-foreground/40">|</span>
              <span>
                רענון אוטומטי בעוד{" "}
                <span className="font-semibold text-foreground">
                  {getCountdown(lastUpdated)}
                </span>
              </span>
            </div>
            {stale && (
              <p className="text-[11px] text-warning leading-tight">
                הנתונים לא התרעננו זמן רב, מומלץ לבצע רענון ידני
              </p>
            )}
            <button
              className="mt-1 flex items-center justify-center gap-1.5 w-full h-8 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={onRefresh}
              disabled={refreshing || cooldown}
            >
              <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "מרענן..." : "רענן עכשיו"}
            </button>
            {cooldown && !refreshing && (
              <p className="text-[10px] text-muted-foreground text-center">
                הרענון יהיה זמין שוב בשעה {cooldownTime}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
