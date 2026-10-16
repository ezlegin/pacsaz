import NotificationForm from "@/components/forms/NotificationForm";
import PageTitle from "@/components/PageTitle";
import { prisma } from "@repo/db";
import { Card, CardContent } from "@repo/ui/components/card";

/** Live data: this is the form that edits the site-wide announcement bar. */
export const dynamic = "force-dynamic";

const page = async () => {
  const notification = await prisma.notificationBar.findFirst({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-3">
      <PageTitle title="Notification" />

      <p className="max-w-2xl text-sm text-muted-foreground">
        The announcement bar at the top of every page of the client site. The
        call to action and the countdown are both optional.
      </p>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <NotificationForm notification={notification} />
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
