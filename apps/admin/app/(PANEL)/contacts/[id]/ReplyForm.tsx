"use client";

import { replyToContact } from "@/actions/contact";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { Textarea } from "@repo/ui/components/textarea";
import { CheckCircle2, MailWarning, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PRESETS = [
  {
    label: "دریافت شد",
    text: "پیام شما دریافت شد. همکاران ما در اولین فرصت بررسی می‌کنند و در صورت نیاز پاسخ می‌دهند.",
  },
  {
    label: "درخواست اطلاعات بیشتر",
    text: "برای بررسی دقیق‌تر موضوع، لطفاً نام پروژه، ابعاد مورد نیاز و نوع متریال را ارسال کنید.",
  },
  {
    label: "پیگیری تیکت",
    text: "موضوع شما در حال بررسی است. نتیجه را به‌محض نهایی شدن از همین طریق اطلاع می‌دهیم.",
  },
];

const ReplyForm = ({
  contactId,
  email,
  mailConfigured,
  initialReply,
  replySent,
}: {
  contactId: number;
  email: string;
  mailConfigured: boolean;
  initialReply: string | null;
  replySent: boolean;
}) => {
  const [body, setBody] = useState(initialReply ?? "");
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState(replySent);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (body.trim().length < 3) {
      setError("Reply must be at least 3 characters.");
      return;
    }

    startLoading();
    const res = await replyToContact(contactId, body);

    if (res.error) {
      setError(res.error);
      toast.error(res.error);
      stopLoading();
      return;
    }

    setLastSent(Boolean(res.emailSent));
    toast.success(res.success);
    if ("warning" in res && res.warning) toast.warning(res.warning);

    stopLoading();
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="reply" className="text-xs font-bold">
            Reply
          </label>
          <span dir="ltr" className="text-[11px] text-muted-foreground">
            To: {email}
          </span>
        </div>

        <Textarea
          id="reply"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply..."
          className="min-h-44"
          dir="rtl"
        />

        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>

      {/* quick replies */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setBody(preset.text)}
            className="rounded-full border bg-background px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {initialReply && (
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2">
          {lastSent ? (
            <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
          ) : (
            <MailWarning className="size-3.5 shrink-0 text-amber-600" />
          )}
          <p className="text-[11px] text-muted-foreground">
            {lastSent
              ? "The saved reply was delivered by email."
              : "A reply is saved on this message but no email has been sent."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          {mailConfigured
            ? "The reply is emailed to the sender and stored on the message."
            : "Email delivery is not configured — the reply will be stored only."}
        </p>

        <Button
          type="submit"
          variant="gradient"
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? <Spinner /> : <Send className="size-4" />}
          {initialReply ? "Send again" : "Send reply"}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
