import { ReactNode } from "react";

const PacsazBGPattern = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-accent h-screen overflow-hidden flex  items-center justify-center ">
      <div
        className={`
        absolute inset-0 
        bg-[url('/pacsaz-pattern.png')]
        bg-[length:800px]
        bg-repeat
        opacity-20
        pointer-events-none
      `}
      />
      {children}
    </div>
  );
};

export default PacsazBGPattern;
