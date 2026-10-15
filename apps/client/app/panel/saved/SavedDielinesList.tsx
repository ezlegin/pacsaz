import { deleteSavedDieline } from "@/actions/dieline";
import DeleteButton from "@/components/DeleteButton";
import SaveDielineForm from "@/components/forms/SaveDielineForm";
import { CustomDielineSettings, Dieline, Plan, SavedDieline } from "@repo/db";
import ActionButton from "@/components/ActionButton";
import { DialogTitle } from "@repo/ui/components/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { formatDate } from "date-fns";
import { Bookmark, Info, Pencil, RotateCw } from "lucide-react";
import Link from "next/link";
import { EmptyState, PanelCard, SectionHeader } from "../components/PanelUI";

interface SavedDielineType extends SavedDieline {
  settings: CustomDielineSettings | null;
  dieline: Dieline;
}

const SavedDielinesList = ({
  data,
  plan,
}: {
  data: SavedDielineType[];
  plan: Plan;
}) => {
  return (
    <PanelCard>
      <SectionHeader
        icon={Bookmark}
        title="قالب‌های ذخیره‌شده"
        description="نسخه‌های شخصی‌سازی‌شده‌ای که با ابعاد و متریال خودت ساختی"
      />

      {data.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="هنوز قالبی ذخیره نکرده‌ای"
          description="هر قالب را با ابعاد، متریال و بلید دلخواه تنظیم کن و ذخیره کن تا بعداً با یک کلیک بازتولید شود."
          action={
            <Link
              href="/dielines"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:gap-3 hover:shadow-lg hover:shadow-primary/30"
            >
              انتخاب قالب
            </Link>
          }
        />
      ) : (
        <>
          {/* ------------------------- desktop table ------------------------ */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  {[
                    "عنوان",
                    "قالب",
                    "ابعاد (mm)",
                    "متریال",
                    "ضخامت",
                    "بلید",
                    "نوع ابعاد",
                    "تاریخ",
                    "",
                  ].map((label, index) => (
                    <th
                      key={index}
                      className={
                        index === 0
                          ? "px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground"
                          : "px-4 py-3 text-center text-[11px] font-semibold text-muted-foreground"
                      }
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {data.map((row) => {
                  const { createdAt, id, title, description, settings, dieline } =
                    row;

                  return (
                    <tr
                      key={id}
                      className="transition-colors hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{title}</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help text-muted-foreground/60 transition-colors hover:text-primary">
                                <Info className="size-3.5" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {description && description !== ""
                                ? description
                                : "بدون توضیحات"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs font-medium">
                        {dieline?.title ?? "—"}
                      </td>

                      <td
                        className="px-4 py-3.5 text-center text-xs"
                        dir="ltr"
                      >
                        {settings
                          ? `${settings.length}×${settings.width}×${settings.height}`
                          : "—"}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                          {settings?.material ?? "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs" dir="ltr">
                        {settings?.thickness ?? "—"}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs" dir="ltr">
                        {settings?.bleed ?? "—"}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                        {settings?.dimensionType ?? "—"}
                      </td>

                      <td className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                        {formatDate(createdAt, "yyyy/MM/dd")}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Link
                            target="_blank"
                            href={`/dieline/${dieline?.slug}?settingsId=${settings?.id}`}
                          >
                            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                              <RotateCw size={14} />
                            </span>
                          </Link>

                          <ActionButton icon={Pencil}>
                            <DialogTitle>ویرایش قالب</DialogTitle>
                            <SaveDielineForm
                              plan={plan}
                              settings={settings!}
                              slug={dieline?.slug}
                              savedDieline={row}
                            />
                          </ActionButton>

                          <DeleteButton deleteFn={deleteSavedDieline} id={id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* -------------------------- mobile cards ----------------------- */}
          <ul className="divide-y lg:hidden">
            {data.map((row) => {
              const { createdAt, id, title, description, settings, dieline } =
                row;

              return (
                <li key={id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-xs font-bold">{title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {dieline?.title ?? "—"} ·{" "}
                        {formatDate(createdAt, "yyyy/MM/dd")}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <ActionButton icon={Pencil}>
                        <DialogTitle>ویرایش قالب</DialogTitle>
                        <SaveDielineForm
                          plan={plan}
                          settings={settings!}
                          slug={dieline?.slug}
                          savedDieline={row}
                        />
                      </ActionButton>
                      <DeleteButton deleteFn={deleteSavedDieline} id={id} />
                    </div>
                  </div>

                  {description && (
                    <p className="text-[11px] leading-5 text-muted-foreground">
                      {description}
                    </p>
                  )}

                  <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-3.5">
                    {[
                      {
                        label: "ابعاد (mm)",
                        value: settings
                          ? `${settings.length}×${settings.width}×${settings.height}`
                          : "—",
                        ltr: true,
                      },
                      {
                        label: "متریال",
                        value: settings?.material ?? "—",
                      },
                      {
                        label: "ضخامت",
                        value: settings?.thickness ?? "—",
                        ltr: true,
                      },
                      {
                        label: "بلید",
                        value: settings?.bleed ?? "—",
                        ltr: true,
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-0.5">
                        <dt className="text-[10px] text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd
                          dir={item.ltr ? "ltr" : undefined}
                          className="text-[11px] font-bold"
                        >
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    target="_blank"
                    href={`/dieline/${dieline?.slug}?settingsId=${settings?.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl border bg-background py-2.5 text-[11px] font-medium transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <RotateCw className="size-3.5" />
                    بازتولید قالب
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PanelCard>
  );
};

export default SavedDielinesList;
