import FAQ from "@/components/Home/FAQ";
import HomeCategories from "@/components/Home/HomeCategories";
import HomeFeatures from "@/components/Home/HomeFeatures";
import HomeSubscription from "@/components/Home/HomeSubscription";
import LandingPage from "@/components/Home/LandingPage";

const page = () => {
  return (
    <div className="space-y-32">
      <div className="px-24 mx-auto pt-20">
        <LandingPage />
      </div>

      <div className="max-w-6xl mx-auto">
        <HomeFeatures />
      </div>

      <HomeCategories />

      <div className="max-w-6xl mx-auto">
        <FAQ />
      </div>

      <div className="space-y-10" id="subscription">
        <HomeSubscription />
      </div>
    </div>
  );
};

export default page;
