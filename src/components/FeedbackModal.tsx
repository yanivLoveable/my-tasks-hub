import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
const FEEDBACK_EMAIL = "feedback-taskcenter@example.com";

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmit = () => {
    const userName = user?.name || user?.username || "Unknown";
    const subject = encodeURIComponent(`משוב TASK CENTER - ${userName}`);
    const body = encodeURIComponent(text);

    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;

    setText("");
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setText("");
      setSubmitted(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[420px] max-w-[90vw] rounded-2xl px-8 py-7 overflow-hidden border-none [&>button:last-child]:hidden"
        dir="rtl"
      >
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 rounded-full w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
            <span className="relative inline-flex items-center justify-center w-7 h-7">
              <MessageSquare size={26} className="text-primary" />
              <span className="absolute text-[9px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary">
                ★
              </span>
            </span>
          </div>

          {submitted ? (
            <div className="flex items-center justify-center" style={{ minHeight: '176px' }}>
              <p className="text-[20px] font-extrabold text-primary leading-snug tracking-wide">
                המשוב נשלח בהצלחה
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <DialogTitle className="text-[20px] font-extrabold text-primary leading-snug tracking-wide">
                  נשמח לשמוע ממך
                </DialogTitle>
                <DialogDescription className="text-[13px] text-muted-foreground">
                  המשוב שלך עוזר לנו להשתפר
                </DialogDescription>
              </div>

              <div className="w-full relative">
                <textarea
                  className="w-full h-28 rounded-xl border border-input bg-background px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow leading-relaxed"
                  placeholder="ניתן לכתוב הערות..."
                  maxLength={MAX_CHARS}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  dir="rtl"
                />
                <span className="absolute bottom-2 left-3 text-[10px] text-muted-foreground/50 select-none pointer-events-none">
                  {text.length}/{MAX_CHARS}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="h-10 px-8 rounded-xl bg-action text-white text-[13px] font-semibold hover:bg-actionHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  שלח משוב
                </button>
                <button
                  onClick={handleClose}
                  className="h-10 px-5 rounded-xl border border-border text-[13px] font-semibold text-primary hover:bg-secondary transition-colors"
                >
                  ביטול
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
