import { RotateCw, MessageSquare } from "lucide-react";
import { formatDateTimeHebrew } from "@/utils/format";

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
  return (
    <div className="flex items-center justify-between px-8 py-2.5" dir="rtl">
      <span className="text-lg font-extrabold text-primary tracking-wide">
        MATCAM
      </span>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            עדכון אחרון: {formatDateTimeHebrew(lastUpdated)}
          </span>
        )}
        <div className="w-px h-4 bg-border" />
        <button
          title={
            cooldown
              ? `הרענון יהיה זמין שוב בשעה ${cooldownTime}`
              : "רענן נתונים"
          }
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onRefresh}
          disabled={refreshing || cooldown}
        >
          <RotateCw
            size={18}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
        <button
          title="שלח משוב"
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors text-muted-foreground hover:text-primary"
        >
          <span className="relative inline-flex items-center justify-center w-[18px] h-[18px]">
            <MessageSquare size={18} />
            <span className="absolute text-[7px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              ★
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
