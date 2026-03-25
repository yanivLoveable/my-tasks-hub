import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import emailjs from "@emailjs/browser";
import { toast } from "@/hooks/use-toast";
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

// EmailJS public keys (safe to store client-side)
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          message: text,
          to_email: "yaniv.loveable@gmail.com",
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
        setText("");
      }, 1800);
    } catch (error) {
      toast({
        title: "שגיאה בשליחת המשוב",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setText("");
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[420px] max-w-[90vw] rounded-2xl px-8 py-7 overflow-hidden border-none [&>button:last-child]:hidden"
        dir="rtl"
      >
        {/* Close button – top-left */}
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 rounded-full w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X size={14} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-[15px] font-bold text-primary">תודה על המשוב!</p>
            <p className="text-[12px] text-muted-foreground">המשוב שלך התקבל בהצלחה</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <span className="relative inline-flex items-center justify-center w-7 h-7">
                <MessageSquare size={26} className="text-primary" />
                <span className="absolute text-[9px] leading-none top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  ★
                </span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <DialogTitle className="text-[20px] font-extrabold text-primary leading-snug tracking-wide">
                נשמח לשמוע ממך
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                המשוב שלך עוזר לנו להשתפר
              </DialogDescription>
            </div>

            {/* Textarea */}
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

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || sending}
                className="h-10 px-8 rounded-xl bg-action text-white text-[13px] font-semibold hover:bg-actionHover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? "שולח..." : "שלח משוב"}
              </button>
              <button
                onClick={handleClose}
                disabled={sending}
                className="h-10 px-5 rounded-xl border border-border text-[13px] font-semibold text-primary hover:bg-secondary transition-colors disabled:opacity-40"
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
