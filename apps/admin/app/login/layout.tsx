import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-accent min-h-screen flex justify-center items-center px-4">
      {children}
    </div>
  );
};

export default layout;
