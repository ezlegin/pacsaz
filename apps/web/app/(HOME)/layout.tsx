import Footer from "@/components/Footer";
import Navbar from "@/components/Navbars/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <Navbar />
      <div className="flex-1 mb-32">{children}</div>
      <Footer />
    </div>
  );
};

export default layout;
