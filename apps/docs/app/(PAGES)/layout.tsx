import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen p-5 max-w-7xl mx-auto space-y-5">
      <Navbar />
      {children}
    </div>
  );
};

export default layout;
