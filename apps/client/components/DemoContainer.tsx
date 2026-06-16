import { pacsazLogoFull } from "@/public";
import Image from "next/image";
import React from "react";

const DemoContainer = () => {
  return (
    <div className="2xl:hidden flex flex-col justify-center gap-5 fixed inset-0 bg-gray-100  items-center p-4 z-50">
      <Image alt="" src={pacsazLogoFull} width={140} height={140} />
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          نسخه دمو تنها در صفحه نمایش های دسکتاپ ارائه شده است.
        </h1>
        <p className="text-gray-600">
          لطفاً وبسایت را روی صفحه نمایشی بزرگتر باز کنید.
        </p>
      </div>
    </div>
  );
};

export default DemoContainer;
