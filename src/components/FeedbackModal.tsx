import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
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

const MAX_CHARS = 500;

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
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
        className="max-w-[440px] rounded-3xl px-12 py-12 overflow-hidden border-none [&>button:last-child]:hidden"
        dir="rtl"
      >
        {/* Close button – top-left */}
        <button
          onClick={handleClose}
          className="absolute left-5 top-5 rounded-full w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[17px] font-bold text-primary">תודה על המשוב!</p>
            <p className="text-[13px] text-muted-foreground">המשוב שלך התקבל בהצלחה</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-7">
            {/* Icon */}
            <div className="w-[72px] h-[72px] rounded-full bg-secondary flex items-center justify-center">
              <span className="relative inline-flex items-center justify-center w-9 h-9">
                <MessageSquare size={34} className="text-primary" />
                <span className="absolute text-[12px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  ★
                </span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-2">
              <DialogTitle className="text-[22px] font-extrabold text-primary leading-relaxed tracking-wide">
                נשמח לשמוע ממך
              </DialogTitle>
              <DialogDescription className="text-[14px] text-muted-foreground">
                המשוב שלך עוזר לנו להשתפר
              </DialogDescription>
            </div>

            {/* Textarea */}
            <div className="w-full relative">
              <textarea
                className="w-full h-36 rounded-2xl border border-input bg-background px-6 py-5 text-[14px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow leading-relaxed"
                placeholder="ניתן לכתוב הערות..."
                maxLength={MAX_CHARS}
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir="rtl"
              />
              <span className="absolute bottom-3 left-4 text-[11px] text-muted-foreground/50 select-none pointer-events-none">
                {text.length}/{MAX_CHARS}
              </span>
            </div>

            {/* Buttons – centered, Submit right / Cancel left in RTL */}
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={handleClose}
                className="h-11 px-6 rounded-xl border border-border text-[14px] font-semibold text-primary hover:bg-secondary transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="h-11 px-10 rounded-xl bg-[hsl(252,40%,60%)] text-white text-[14px] font-semibold hover:bg-[hsl(252,40%,52%)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                שלח משוב
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
