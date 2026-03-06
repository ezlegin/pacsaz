import { ReactNode } from "react";

const PropsFormContent = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-4">{children}</div>;
};

export default PropsFormContent;
