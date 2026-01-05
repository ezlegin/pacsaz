import FAQ from "@/components/Home/FAQ";
import HomeCategories from "@/components/Home/HomeCategories";
import HomeSubscription from "@/components/Home/HomeSubscription";
import LandingPage from "@/components/Home/LandingPage";

const page = () => {
  return (
    <div className="space-y-32">
      <div className="px-24 mx-auto pt-20">
        <LandingPage />
      </div>

      <HomeCategories />

      <FAQ />

      <div className="space-y-10" id="subscription">
        <HomeSubscription />
      </div>
    </div>
  );
};

export default page;
