import { cn } from "@repo/ui/lib/utils";
import { Gauge, TrendingUp } from "lucide-react";

const fa = (value: number) =>
  value.toLocaleString("fa-IR", { useGrouping: false });

const RemainingDownloads = ({
  downloaded,
  fairDownload,
}: {
  fairDownload: number;
  downloaded: number;
}) => {
  const remaining = Math.max(fairDownload - downloaded, 0);
  const ratio = fairDownload > 0 ? downloaded / fairDownload : 0;
  const pct = Math.min(Math.round(ratio * 100), 100);

  const tone: "primary" | "warning" | "danger" =
    ratio >= 0.9 ? "danger" : ratio >= 0.7 ? "warning" : "primary";

  const bar =
    tone === "danger"
      ? "bg-gradient-to-l from-rose-500 to-red-500"
      : tone === "warning"
        ? "bg-gradient-to-l from-amber-400 to-orange-500"
        : "bg-gradient-to-l from-violet-500 to-purple-600";

  const toneLabel =
    tone === "danger"
      ? { text: "سهمیه تقریباً تمام شده", cls: "bg-red-500/10 text-red-600" }
      : tone === "warning"
        ? { text: "مصرف بالا", cls: "bg-amber-500/10 text-amber-600" }
        : { text: "در محدوده مجاز", cls: "bg-green-500/10 text-green-600" };

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Gauge className="size-4" strokeWidth={1.9} />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold">سهمیه دانلود</h2>
            <p className="text-[11px] text-muted-foreground">
              مصرف دوره‌ی جاری اشتراک
            </p>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
            toneLabel.cls,
          )}
        >
          {toneLabel.text}
        </span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-primary">
            {fa(remaining)}
          </span>
          <span className="text-xs text-muted-foreground">
            دانلود باقی مانده
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
          <TrendingUp className="size-3.5" />
          {fa(pct)}٪ مصرف شده
        </span>
      </div>

      <div className="mt-auto space-y-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <span
            style={{ width: `${pct}%` }}
            className={cn("block h-full rounded-full transition-all", bar)}
          />
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{fa(downloaded)} دانلود شده</span>
          <span>{fa(fairDownload)} سهمیه کل</span>
        </div>
      </div>
    </div>
  );
};

export default RemainingDownloads;
