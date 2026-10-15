import { CustomDielineSettings, Dieline, DownloadHistory } from "@repo/db";
import { ActButton } from "@/components/ActionButton";
import { cn } from "@repo/ui/lib/utils";
import { formatDate } from "date-fns";
import { ArrowUpRight, Download, RotateCw } from "lucide-react";
import Link from "next/link";
import { EmptyState, PanelCard, SectionHeader, Td, Th } from "./PanelUI";

interface RecordType extends DownloadHistory {
  dieline: Dieline;
  settings: CustomDielineSettings | null;
}

const COLUMNS = [
  "قالب",
  "ابعاد (mm)",
  "متریال",
  "ضخامت",
  "بلید",
  "نوع ابعاد",
  "تاریخ",
  "",
];

const LastDownloads = ({ data }: { data: RecordType[] }) => {
  return (
    <PanelCard>
      <SectionHeader
        icon={Download}
        title="آخرین دانلودها"
        description={
          data.length > 0
            ? `${data.length.toLocaleString("fa-IR", { useGrouping: false })} دانلود اخیر`
            : "سابقه‌ی دانلودهای تو"
        }
      />

      {data.length === 0 ? (
        <EmptyState
          icon={Download}
          title="هنوز هیچ قالبی دانلود نکرده‌ای"
          description="یک قالب را باز کن، ابعاد و متریال را تنظیم کن و خروجی آماده‌ی چاپ بگیر."
          action={
            <Link
              href="/dielines"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
            >
              مشاهده قالب‌ها
              <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {COLUMNS.map((label, index) => (
                  <Th key={index} className={index === 0 ? "" : "text-center"}>
                    {label}
                  </Th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.map(({ id, downloadedAt, dieline, settings }) => (
                <tr
                  key={id}
                  className="transition-colors hover:bg-primary/[0.03]"
                >
                  <Td>
                    <Link
                      href={`/dieline/${dieline.slug}`}
                      target="_blank"
                      className="group inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
                    >
                      {dieline.title}
                      <ArrowUpRight className="size-3 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  </Td>

                  <Td className="text-center font-medium" dir="ltr">
                    <span className="inline-block">
                      {settings
                        ? `${settings.length}×${settings.width}×${settings.height}`
                        : "—"}
                    </span>
                  </Td>

                  <Td className="text-center">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                      {settings?.material ?? "—"}
                    </span>
                  </Td>

                  <Td className="text-center" dir="ltr">
                    {settings?.thickness ?? "—"}
                  </Td>

                  <Td className="text-center" dir="ltr">
                    {settings?.bleed ?? "—"}
                  </Td>

                  <Td className="text-center">
                    {settings?.dimensionType ?? "—"}
                  </Td>

                  <Td
                    className={cn("text-center text-muted-foreground")}
                  >
                    {formatDate(downloadedAt, "yyyy/MM/dd")}
                  </Td>

                  <Td className="text-center">
                    <div className="flex justify-center">
                      <Link
                        target="_blank"
                        href={`/dieline/${dieline.slug}?settingsId=${settings?.id}`}
                      >
                        <ActButton>
                          <RotateCw size={14} />
                        </ActButton>
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
};

export default LastDownloads;
