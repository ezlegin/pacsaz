import FAQ from "@/components/Home/FAQ";
import HomeCategories from "@/components/Home/HomeCategories";
import HomeCourseIntro from "@/components/Home/HomeCourseIntro";
import HomeFeatures from "@/components/Home/HomeFeatures";
import HomeSUbFAQ from "@/components/Home/HomeSubFAQ";
import HomeSubscription from "@/components/Home/HomeSubscription";
import LandingPage from "@/components/Home/LandingPage";

const page = () => {
  return (
    <div className="space-y-48">
      <div className="px-20 mx-auto pt-20">
        <LandingPage />
      </div>

      <div className="max-w-6xl mx-auto">
        <HomeFeatures />
      </div>

      <div className="p-20 mx-auto bg-muted/70">
        <HomeCategories />
      </div>

      <div className="max-w-6xl mx-auto">
        <FAQ />
      </div>

      <div className="space-y-10" id="subscription">
        <HomeSubscription />
      </div>

      <div className="max-w-6xl mx-auto">
        <HomeSUbFAQ />
      </div>

      <div className="max-w-6xl mx-auto">
        <HomeCourseIntro />
      </div>
    </div>
  );
};

export default page;
