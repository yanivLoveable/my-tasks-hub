import { Headphones, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SupportModal({ open, onOpenChange }: SupportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[400px] max-w-[90vw] rounded-2xl px-8 py-7 overflow-hidden border-none [&>button:last-child]:hidden"
        dir="rtl"
      >
        {/* Close button – top-left */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-full w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <Headphones size={26} className="text-primary" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-1">
            <DialogTitle className="text-[20px] font-extrabold text-primary leading-snug tracking-wide">
              צריך עזרה?
            </DialogTitle>
            <DialogDescription className="text-[14px] font-semibold text-foreground/70">
              אנחנו כאן בשבילך
            </DialogDescription>
          </div>

          {/* Instructions */}
          <div className="w-full text-[13px] text-muted-foreground leading-relaxed text-center mt-1">
            <p>
              לתמיכה טכנית ניתן לפנות למוקד התמיכה במספר{" "}
              <span className="font-bold text-primary">4050</span>.
            </p>
            <p className="mt-1">
              לחלופין, ניתן לפתוח פנייה באמצעות ה<span className="font-bold text-primary">צ׳אטבוט</span> בעמוד הבית של SNOW.
            </p>
          </div>

          {/* Buttons – centered, Chat right / Close left in RTL */}
          <div className="flex items-center justify-center gap-4 w-full mt-1">
            <button
              onClick={() => {
                window.open("#chatbot", "_blank");
              }}
              className="h-10 px-8 rounded-xl bg-[hsl(252,40%,60%)] text-white text-[13px] font-semibold hover:bg-[hsl(252,40%,52%)] transition-colors"
            >
              מעבר לצ׳אטבוט
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="h-10 px-6 rounded-xl border border-border text-[13px] font-semibold text-primary hover:bg-secondary transition-colors"
            >
              סגירה
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
