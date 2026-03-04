import { Headphones } from "lucide-react";
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
        className="max-w-[380px] rounded-2xl p-0 overflow-hidden border-none"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4 py-8 px-6">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <Headphones size={28} className="text-primary" />
          </div>

          {/* Title */}
          <DialogTitle className="text-[18px] font-extrabold text-primary text-center">
            צריך עזרה?
          </DialogTitle>
          <DialogDescription className="sr-only">
            מידע על תמיכה טכנית
          </DialogDescription>

          {/* Instructions */}
          <div className="w-full space-y-3 text-[13px] text-muted-foreground leading-relaxed text-right">
            <p>
              לתמיכה טכנית ניתן לפנות למוקד התמיכה בשלוחה{" "}
              <span className="font-bold text-primary">4050</span>.
            </p>
            <p>
              לחלופין, ניתן לפתוח פנייה באמצעות הצ׳אטבוט שלנו לקבלת מענה מהיר.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/90 transition-colors"
            >
              סגירה
            </button>
            <button
              onClick={() => {
                // TODO: link to chatbot
                window.open("#chatbot", "_blank");
              }}
              className="flex-1 h-10 rounded-lg border border-primary text-primary text-[14px] font-semibold hover:bg-primary/5 transition-colors"
            >
              מעבר לצ׳אטבוט
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
