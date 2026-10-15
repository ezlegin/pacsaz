import { deleteContact } from "@/actions/contact";
import DeleteButton from "@/components/DeleteButton";
import Card from "@repo/ui/components/custom/Card";
import Table from "@repo/ui/components/custom/Table";
import { Contact } from "@repo/db";
import { Badge } from "@repo/ui/components/badge";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ContactStatusBadge from "./ContactStatus";

export const columns = [
  { label: "Name" },
  { label: "Subject" },
  { label: "Message" },
  { label: "Status" },
  { label: "Reply" },
  { label: "Received" },
  { label: "Action" },
];

const ContactsList = ({ data }: { data: Contact[] }) => {
  const renderRows = (contact: Contact) => (
    <TableRow key={contact.id}>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{contact.fullName}</span>
          <span dir="ltr" className="text-xs text-muted-foreground">
            {contact.email}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <Link
          href={`/contacts/${contact.id}`}
          className="inline-flex items-center gap-1 hover:text-primary"
        >
          {contact.subject}
          <ArrowUpRight size={12} className="text-muted-foreground" />
        </Link>
      </TableCell>

      <TableCell className="max-w-64">
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {contact.message}
        </span>
      </TableCell>

      <TableCell className="text-center">
        <ContactStatusBadge status={contact.status} />
      </TableCell>

      <TableCell className="text-center">
        {contact.status === "replied" ? (
          <Badge variant={contact.replySent ? "lightGreen" : "lightYellow"}>
            {contact.replySent ? "Sent" : "Not sent"}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="text-center text-xs text-muted-foreground">
        {format(contact.createdAt, "yyyy-MM-dd")}
      </TableCell>

      <TableCell>
        <div className="flex justify-end">
          <DeleteButton deleteFn={deleteContact} id={contact.id} />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <Table
        columns={columns}
        data={data}
        renderRows={renderRows}
        dir="ltr"
        noDataMessage="No contact messages yet."
      />
    </Card>
  );
};

export default ContactsList;
