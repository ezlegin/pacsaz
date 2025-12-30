import ProductNavbar from "@/components/product/ProductNavbar";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col h-full">
      <ProductNavbar productName={"test"} />
      <div className="h-full overflow-hidden">
        <Component />
      </div>
    </div>
  );
};
export default page;

const Component = () => {
  return <div className="h-full bg-accent">Component</div>;
};
