import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";

const page = () => {
  return (
    <div className="flex gap-14">
      <div className="w-100">
        <DielinesSidebar />
      </div>
      <div className="w-full">
        <DielinesGrid />
      </div>
    </div>
  );
};

export default page;
