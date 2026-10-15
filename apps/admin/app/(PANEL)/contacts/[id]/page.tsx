import { markContactRead } from "@/actions/contact";
import { isMailConfigured } from "@/lib/mail";
import { prisma } from "@repo/db";
import { format } from "date-fns";
import {
  ArrowLeft,
  AtSign,
  CalendarClock,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "../../components/PanelUI";
import ContactStatusBadge from "../ContactStatus";
import ReplyForm from "./ReplyForm";

interface Props {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  const contactId = Number(id);

  if (!Number.isFinite(contactId)) notFound();

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) notFound();

  /**
   * Opening the message marks it read. Uses a non-revalidating action because
   * this runs during render.
   */
  if (contact.status === "new") {
    await markContactRead(contact.id);
    contact.status = "read";
  }

  const facts = [
    { icon: AtSign, label: "Email", value: contact.email, ltr: true },
    {
      icon: Phone,
      label: "Phone",
      value: contact.phoneNumber ?? "—",
      ltr: true,
    },
    {
      icon: CalendarClock,
      label: "Received",
      value: format(contact.createdAt, "yyyy-MM-dd HH:mm"),
    },
  ];

  return (
    <Page>
      {/* ------------------------------ header ------------------------------ */}
      <div className="flex flex-col gap-4">
        <Link
          href="/contacts"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          Back to contacts
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-extrabold text-white shadow-lg shadow-primary/20">
              {contact.fullName.trim().charAt(0)}
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight">
                {contact.subject}
              </h1>
              <p className="text-xs text-muted-foreground">
                {contact.fullName}
              </p>
            </div>
          </div>

          <ContactStatusBadge status={contact.status} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* --------------------------- conversation -------------------------- */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border bg-background">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
              <Mail className="size-4 text-primary" />
              <h2 className="text-xs font-bold">Original message</h2>
            </div>
            <p className="whitespace-pre-wrap p-5 text-sm leading-7 text-muted-foreground">
              {contact.message}
            </p>
          </section>

          {contact.replyMessage && (
            <section className="overflow-hidden rounded-2xl border bg-background">
              <div className="flex items-center justify-between gap-2 border-b bg-primary/[0.04] px-5 py-3">
                <div className="flex items-center gap-2">
                  <Send className="size-4 text-primary" />
                  <h2 className="text-xs font-bold">Your reply</h2>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {contact.repliedAt
                    ? format(contact.repliedAt, "yyyy-MM-dd HH:mm")
                    : ""}
                </span>
              </div>
              <p className="whitespace-pre-wrap p-5 text-sm leading-7 text-muted-foreground">
                {contact.replyMessage}
              </p>
            </section>
          )}

          <section className="rounded-2xl border bg-background p-5">
            <ReplyForm
              contactId={contact.id}
              email={contact.email}
              mailConfigured={isMailConfigured()}
              initialReply={contact.replyMessage}
              replySent={contact.replySent}
            />
          </section>
        </div>

        {/* ------------------------------ sidebar ---------------------------- */}
        <aside className="space-y-4">
          <section className="space-y-4 rounded-2xl border bg-background p-5">
            <h2 className="text-xs font-bold">Sender details</h2>

            <ul className="space-y-3.5">
              {facts.map(({ icon: Icon, label, value, ltr }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-3.5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p
                      dir={ltr ? "ltr" : undefined}
                      className="truncate text-xs font-medium"
                    >
                      {value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent(
                `Re: ${contact.subject}`,
              )}`}
              className="flex items-center justify-center gap-2 rounded-xl border bg-background py-2 text-xs font-medium transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Mail className="size-3.5" />
              Open in mail client
            </a>
          </section>

          <section className="space-y-2 rounded-2xl border bg-muted/30 p-5">
            <h2 className="text-xs font-bold">Delivery</h2>
            <p className="text-[11px] leading-5 text-muted-foreground">
              {contact.status !== "replied"
                ? "No reply sent yet. The reply text is stored on the message before delivery is attempted, so nothing is lost if sending fails."
                : contact.replySent
                  ? "The reply was delivered by email."
                  : "The reply is stored but was not delivered. Add RESEND_API_KEY to the admin environment, then send again."}
            </p>
            {contact.replyId && (
              <p dir="ltr" className="truncate text-[10px] text-muted-foreground">
                id: {contact.replyId}
              </p>
            )}
          </section>
        </aside>
      </div>
    </Page>
  );
};

export default page;

export const metadata = {
  title: "Contact message",
};
