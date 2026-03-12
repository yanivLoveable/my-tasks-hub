import { Bell } from "lucide-react";

interface ControlsBarProps {
  totalTasks: number;
}

export default function ControlsBar({ totalTasks }: ControlsBarProps) {
  return (
    <div className="flex flex-col items-center pt-1 pb-1 px-8">
      <div className="flex items-center gap-2">
        <h1 className="text-[28px] font-extrabold text-primary leading-tight">
          מרכז המשימות וההתראות
        </h1>
        <Bell size={18} strokeWidth={2.5} className="text-alert-red" />
      </div>
      <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
        <span>
          ממתינות לך{" "}
          <span className="font-bold text-primary">{totalTasks}</span> משימות
          לביצוע
        </span>
        <span className="text-border">|</span>
        <span className="text-[11px] text-muted-foreground/70">
          מוצגות משימות שנפתחו בחצי השנה האחרונה בלבד
        </span>
      </div>
    </div>
  );
}
