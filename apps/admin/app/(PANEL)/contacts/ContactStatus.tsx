import { ContactStatus } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";

const LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

const VARIANTS: Record<
  ContactStatus,
  "lightPrimary" | "lightYellow" | "lightGreen"
> = {
  new: "lightPrimary",
  read: "lightYellow",
  replied: "lightGreen",
};

const ContactStatusBadge = ({ status }: { status: ContactStatus }) => (
  <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
);

export default ContactStatusBadge;
