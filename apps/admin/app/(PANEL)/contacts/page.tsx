import { Page, PageHeader, StatTile } from "../components/PanelUI";
import { getMailStatus } from "@/actions/contact";
import { ContactStatus, prisma } from "@repo/db";
import { globalPageSize } from "@repo/lib/data/consts";
import { pagination } from "@repo/lib/utils/pagination";
import Pagination from "@/components/Pagination";
import Search from "@/components/Search";
import { cn } from "@repo/ui/lib/utils";
import { CheckCheck, Mail, MailWarning, MessageSquare } from "lucide-react";
import Link from "next/link";
import ContactsList from "./ContactsList";

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

const STATUS_TABS: { label: string; value: ContactStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Replied", value: "replied" },
];

const page = async ({ searchParams }: Props) => {
  const { page: pageParam, status, search } = await searchParams;
  const { skip, take } = pagination(pageParam ?? "", globalPageSize);

  const statusFilter =
    status && status !== "all" ? (status as ContactStatus) : undefined;

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { subject: { contains: search, mode: "insensitive" as const } },
            { message: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [contacts, total, byStatus, mail] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contact.count({ where }),
    prisma.contact.groupBy({ by: ["status"], _count: true }),
    getMailStatus(),
  ]);

  const countOf = (value: ContactStatus) =>
    byStatus.find((s) => s.status === value)?._count ?? 0;

  const notSent = await prisma.contact.count({
    where: { status: "replied", replySent: false },
  });

  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === "all"
        ? byStatus.reduce((sum, s) => sum + s._count, 0)
        : countOf(tab.value),
  }));

  const activeTab = status ?? "all";

  return (
    <Page>
      <PageHeader
        icon={MessageSquare}
        title="Contact messages"
        description="Messages sent from the public contact form. Replies are delivered by email."
      />

      {/* mail configuration state */}
      {!mail.configured && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 sm:flex-row sm:items-center">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
            <MailWarning className="size-4" strokeWidth={1.9} />
          </span>
          <div className="space-y-0.5">
            <p className="text-xs font-bold">
              Reply delivery is not configured yet
            </p>
            <p className="text-[11px] leading-5 text-muted-foreground">
              Replies are saved on the message but no email is sent. Add{" "}
              <code className="rounded bg-muted px-1">RESEND_API_KEY</code> to the
              admin environment to start delivering them.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={MessageSquare}
          label="Total messages"
          value={String(byStatus.reduce((sum, s) => sum + s._count, 0))}
          tone="primary"
        />
        <StatTile
          icon={Mail}
          label="Unread"
          value={String(countOf("new"))}
          hint="Waiting for a first look"
        />
        <StatTile
          icon={CheckCheck}
          label="Replied"
          value={String(countOf("replied"))}
        />
        <StatTile
          icon={MailWarning}
          label="Saved, not sent"
          value={String(notSent)}
          hint={mail.configured ? "Sender error" : "Provider not configured"}
          tone={notSent > 0 ? "warning" : "plain"}
        />
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border bg-muted/40 p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                tab.value === "all" ? "/contacts" : `/contacts?status=${tab.value}`
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="rounded-md bg-muted px-1.5 text-[10px] font-bold tabular-nums">
                {tab.count}
              </span>
            </Link>
          ))}
        </div>

        <Search placeholder="Search name, email or subject" />
      </div>

      <ContactsList data={contacts} />

      <Pagination pageSize={globalPageSize} totalItems={total} />
    </Page>
  );
};

export default page;

export const metadata = {
  title: "Contacts",
};
