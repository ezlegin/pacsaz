import NotificationForm from "@/components/forms/NotificationForm";
import { prisma } from "@repo/db";
import { Card, CardContent } from "@repo/ui/components/card";
import { Bell } from "lucide-react";
import { Page, PageHeader } from "../components/PanelUI";

/** Live data: this is the form that edits the site-wide announcement bar. */
export const dynamic = "force-dynamic";

const page = async () => {
  const notification = await prisma.notificationBar.findFirst({
    orderBy: { id: "asc" },
  });

  return (
    <Page>
      <PageHeader
        icon={Bell}
        title="Announcement bar"
        description="The bar at the top of every page of the client site. The call to action and the countdown are both optional."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <NotificationForm notification={notification} />
        </CardContent>
      </Card>
    </Page>
  );
};

export default page;
