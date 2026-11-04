import Footer from "@/components/Footer";
import "@/components/Home/home.css";
import Navbar from "@/components/Navbars/Navbar";
import SubscriptionBanner from "@/components/SubscriptionBannerServer";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-[calc(100vh-var(--app-top-offset))] grid grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="min-w-0">{children}</main>
      {/* The page ends on its own call to action; the footer's would repeat it. */}
      <Footer flush />
      <SubscriptionBanner />
    </div>
  );
};

export default layout;
