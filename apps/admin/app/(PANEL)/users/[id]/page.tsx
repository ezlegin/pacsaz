import ActionButton from "@/components/ActionButton";
import BackButton from "@/components/BackButton";
import { UserForm } from "@/components/forms/UserForm";
import PlanCard from "@/components/PlanCard";
import SubscriptionActions from "@/components/SubscriptionActions";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { mainURL } from "@/data/envs";
import { getPlanState } from "@/lib/plan";
import { prisma } from "@repo/db";
import { formatPrice } from "@repo/lib/utils/formatPrice";
import Card from "@repo/ui/components/custom/Card";
import PaymentStatus from "@repo/ui/components/custom/PaymentStatus";
import Table from "@repo/ui/components/custom/Table";
import { DialogTitle } from "@repo/ui/components/dialog";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { format } from "date-fns";
import { CreditCard, Download, Flag, Pencil, Save } from "lucide-react";
import { notFound } from "next/navigation";
import { Page, StatTile } from "../../components/PanelUI";

interface Props {
  params: Promise<{ id: string }>;
}

const RECENT = 20;

/**
 * One customer on one page: who they are, what they pay for and what they did
 * with it. Support questions ("did my payment go through?", "why can't I
 * download?") used to need four list pages and a guess.
 */
const page = async ({ params }: Props) => {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  const [plans, payments, paymentCount, paid, downloads, downloadCount, saved, savedCount, customerCount] =
    await Promise.all([
      prisma.plan.findMany({ where: { userId }, orderBy: { startedAt: "desc" } }),
      prisma.payment.findMany({
        where: { userId },
        include: { coupon: true },
        orderBy: { createdAt: "desc" },
        take: RECENT,
      }),
      prisma.payment.count({ where: { userId } }),
      prisma.payment.aggregate({
        where: { userId, status: "success" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.downloadHistory.findMany({
        where: { userId },
        include: { dieline: { select: { title: true, slug: true } } },
        orderBy: { downloadedAt: "desc" },
        take: RECENT,
      }),
      prisma.downloadHistory.count({ where: { userId } }),
      prisma.savedDieline.findMany({
        where: { userId },
        include: { dieline: { select: { title: true, slug: true } } },
        orderBy: { updatedAt: "desc" },
        take: RECENT,
      }),
      prisma.savedDieline.count({ where: { userId } }),
      prisma.customer.count({ where: { userId } }),
    ]);

  const current = plans.find((p) => getPlanState(p) === "active");

  return (
    <Page>
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <BackButton />
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{user.fullName}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{user.email}</span>
              <span dir="ltr">{user.phoneNumber}</span>
              {user.userType && <span className="capitalize">{user.userType}</span>}
              <span>Joined {format(user.joinedAt, "PPP")}</span>
            </div>
          </div>
        </div>

        <ActionButton icon={Pencil}>
          <DialogTitle>Edit user</DialogTitle>
          <UserForm user={user} />
        </ActionButton>
      </div>

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Flag}
          label="Current plan"
          value={current ? `${current.key} · ${current.period}` : "None"}
          hint={current ? `Ends ${format(current.endsAt, "PPP")}` : "No active subscription"}
          tone={current ? "primary" : "plain"}
        />
        <StatTile
          icon={CreditCard}
          label="Paid in total"
          value={formatPrice(paid._sum.total ?? 0, true, "en")}
          hint={`${paid._count} successful payment${paid._count === 1 ? "" : "s"}`}
        />
        <StatTile
          icon={Download}
          label="Downloads"
          value={String(downloadCount)}
          hint={current ? `${current.downloaded} of ${current.fairDownload} on the current plan` : undefined}
        />
        <StatTile
          icon={Save}
          label="Saved copies"
          value={String(savedCount)}
          hint={`${customerCount} customer${customerCount === 1 ? "" : "s"} in their panel`}
        />
      </div>

      {/* subscriptions */}
      <Section title="Subscriptions" count={plans.length}>
        <Table
          dir="ltr"
          data={plans}
          noDataMessage="No subscriptions."
          columns={[
            { label: "ID" },
            { label: "Plan" },
            { label: "Status" },
            { label: "Started" },
            { label: "Ends" },
            { label: "Downloads used" },
            { label: "Actions" },
          ]}
          renderRows={(plan: (typeof plans)[number]) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.id}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <PlanCard planKey={plan.key} planPeriod={plan.period} />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <SubscriptionStatus plan={plan} />
              </TableCell>
              <TableCell className="text-center">{format(plan.startedAt, "yyyy-MM-dd")}</TableCell>
              <TableCell className="text-center">{format(plan.endsAt, "yyyy-MM-dd")}</TableCell>
              <TableCell className="text-center tabular-nums">
                {plan.downloaded} / {plan.fairDownload}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <SubscriptionActions
                    planId={plan.id}
                    active={plan.status === "active"}
                    downloaded={plan.downloaded}
                  />
                </div>
              </TableCell>
            </TableRow>
          )}
        />
      </Section>

      {/* payments */}
      <Section title="Payments" count={paymentCount} more={paymentCount > RECENT}>
        <Table
          dir="ltr"
          data={payments}
          noDataMessage="No payments."
          columns={[
            { label: "ID" },
            { label: "Date" },
            { label: "Status" },
            { label: "Method" },
            { label: "Period" },
            { label: "Coupon" },
            { label: "Total" },
          ]}
          renderRows={(p: (typeof payments)[number]) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell className="text-center tabular-nums">{format(p.createdAt, "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell className="text-center">
                <PaymentStatus label={p.status} status={p.status} />
              </TableCell>
              <TableCell className="text-center">{p.method === "zarinPal" ? "ZarinPal" : p.method}</TableCell>
              <TableCell className="text-center">{p.period}</TableCell>
              <TableCell className="text-center font-mono text-xs">{p.coupon?.code ?? "—"}</TableCell>
              <TableCell className="text-right">{formatPrice(p.total, true, "en")}</TableCell>
            </TableRow>
          )}
        />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* downloads */}
        <Section title="Recent downloads" count={downloadCount} more={downloadCount > RECENT}>
          <Table
            dir="ltr"
            data={downloads}
            noDataMessage="No downloads."
            columns={[{ label: "Dieline" }, { label: "Downloaded" }]}
            renderRows={(d: (typeof downloads)[number]) => (
              <TableRow key={d.id}>
                <TableCell>
                  <a
                    target="_blank"
                    href={`${mainURL}/dieline/${d.dieline.slug}`}
                    className="hover:text-primary hover:underline"
                  >
                    {d.dieline.title}
                  </a>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {format(d.downloadedAt, "yyyy-MM-dd HH:mm")}
                </TableCell>
              </TableRow>
            )}
          />
        </Section>

        {/* saved copies */}
        <Section title="Saved copies" count={savedCount} more={savedCount > RECENT}>
          <Table
            dir="ltr"
            data={saved}
            noDataMessage="No saved copies."
            columns={[{ label: "Title" }, { label: "Template" }, { label: "Updated" }]}
            renderRows={(s: (typeof saved)[number]) => (
              <TableRow key={s.id}>
                <TableCell>{s.title}</TableCell>
                <TableCell className="text-center">{s.dieline.title}</TableCell>
                <TableCell className="text-right tabular-nums">{format(s.updatedAt, "yyyy-MM-dd")}</TableCell>
              </TableRow>
            )}
          />
        </Section>
      </div>
    </Page>
  );
};

export default page;

const Section = ({
  title,
  count,
  more,
  children,
}: {
  title: string;
  count: number;
  more?: boolean;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <h2 className="flex items-center gap-2 text-sm font-semibold">
      {title}
      <span className="font-normal text-muted-foreground">
        ({count}){more ? ` · latest ${RECENT} shown` : ""}
      </span>
    </h2>
    <Card className="p-0 overflow-hidden">{children}</Card>
  </section>
);

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) || 0 },
    select: { fullName: true },
  });
  return { title: user ? `${user.fullName} · Users` : "User" };
};
