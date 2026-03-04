import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: wire to backend
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setSubmitted(false);
      setText("");
    }, 1800);
  };

  const handleClose = () => {
    onOpenChange(false);
    setText("");
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[380px] rounded-2xl p-0 overflow-hidden border-none"
        dir="rtl"
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10 px-6">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[15px] font-bold text-primary">תודה על המשוב!</p>
            <p className="text-[13px] text-muted-foreground">המשוב שלך התקבל בהצלחה</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 px-6">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <span className="relative inline-flex items-center justify-center w-7 h-7">
                <MessageSquare size={28} className="text-primary" />
                <span className="absolute text-[10px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  ★
                </span>
              </span>
            </div>

            {/* Title */}
            <DialogTitle className="text-[18px] font-extrabold text-primary text-center">
              נשמח לשמוע ממך
            </DialogTitle>
            <DialogDescription className="sr-only">
              טופס משוב
            </DialogDescription>

            {/* Textarea */}
            <textarea
              className="w-full h-28 rounded-xl border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              placeholder="ניתן לכתוב הערות..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              dir="rtl"
            />

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                שלח משוב
              </button>
              <button
                onClick={handleClose}
                className="h-10 px-4 text-[14px] font-semibold text-primary hover:text-primary/70 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
