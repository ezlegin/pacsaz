import FAQ from "@/components/Home/FAQ";
import HomeCategories from "@/components/Home/HomeCategories";
import HomeCourseIntro from "@/components/Home/HomeCourseIntro";
import HomeFeatures from "@/components/Home/HomeFeatures";
import HomeSUbFAQ from "@/components/Home/HomeSubFAQ";
import LandingPage from "@/components/Home/LandingPage";
import SubscriptionList from "@/components/SubscriptionList";
import { prisma } from "@repo/db";

const page = async () => {
  const tarrif = await prisma.tarrif.findMany({
    include: { price: true, fairDownload: true, features: true },
  });
  const features = await prisma.tarrifFeature.findMany();
  const dieline = await prisma.dieline.findFirst({
    where: { slug: "tuck-end" },
    include: { settings: true, dielineImage: true, modelImage: true },
  });

  return (
    <div className="space-y-48">
      <div className="p-4 md:px-20 mx-auto md:pt-20">
        <LandingPage dieline={dieline} />
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <HomeFeatures />
      </div>

      <div className="p-4 md:p-20 mx-auto bg-muted/70">
        <HomeCategories />
      </div>

      <div className="p-4 space-y-10" id="subscription">
        <SubscriptionList tarrif={tarrif} features={features} />
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <FAQ />
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <HomeSUbFAQ />
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <HomeCourseIntro />
      </div>
    </div>
  );
};

export default page;
