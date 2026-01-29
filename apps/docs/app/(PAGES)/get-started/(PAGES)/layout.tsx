import Sidebar from "@/components/SIdebar";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-3">
        <Sidebar />
      </div>
      <div className="col-span-9">{children}</div>
    </div>
  );
};

export default layout;
