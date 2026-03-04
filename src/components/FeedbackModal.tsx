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
        className="max-w-[420px] rounded-3xl px-10 py-10 overflow-hidden border-none [&>button:last-child]:hidden"
        dir="rtl"
      >
        {/* Custom close button – top-left */}
        <button
          onClick={handleClose}
          className="absolute left-5 top-5 rounded-full w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[15px] font-bold text-primary">תודה על המשוב!</p>
            <p className="text-[13px] text-muted-foreground">המשוב שלך התקבל בהצלחה</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <span className="relative inline-flex items-center justify-center w-8 h-8">
                <MessageSquare size={30} className="text-primary" />
                <span className="absolute text-[11px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  ★
                </span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1.5">
              <DialogTitle className="text-[19px] font-extrabold text-primary">
                נשמח לשמוע ממך
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                המשוב שלך עוזר לנו להשתפר
              </DialogDescription>
            </div>

            {/* Textarea */}
            <div className="w-full relative">
              <textarea
                className="w-full h-32 rounded-xl border border-input bg-background px-5 py-4 text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="ניתן לכתוב הערות..."
                maxLength={MAX_CHARS}
                value={text}
                onChange={(e) => setText(e.target.value)}
                dir="rtl"
              />
              <span className="absolute bottom-2.5 left-3.5 text-[11px] text-muted-foreground/50 select-none pointer-events-none">
                {text.length}/{MAX_CHARS}
              </span>
            </div>

            {/* Buttons – centered pair */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={handleClose}
                className="h-10 px-5 text-[14px] font-semibold text-primary hover:text-primary/70 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="h-10 px-8 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
