import SubscriptionList from "@/components/SubscriptionList";
import { prisma } from "@repo/db";

const page = async () => {
  const tarrif = await prisma.tarrif.findMany({
    include: { fairDownload: true, features: true, price: true },
    orderBy: { key: "asc" },
  });

  const features = await prisma.tarrifFeature.findMany();

  return (
    <div className="flex justify-center items-center">
      <SubscriptionList tarrif={tarrif} features={features} />
    </div>
  );
};

export default page;

export const metadata = {
  title: "اشتراک ها",
  description:
    "صفحه اشتراک‌ها در وبسایت پکساز. در این صفحه می‌توانید انواع اشتراک‌های موجود را مشاهده و انتخاب کنید.",
};
