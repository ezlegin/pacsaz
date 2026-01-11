import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-accent h-screen flex justify-center items-center">
      {children}
    </div>
  );
};

export default layout;
