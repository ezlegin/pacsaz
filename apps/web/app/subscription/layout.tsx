import Navbar from "@/components/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="bg-accent h-full">{children}</div>
    </div>
  );
};

export default layout;
