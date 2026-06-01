import LoginCard from "@/components/forms/LoginCard";
import PacsazBGPattern from "@/components/PacsazBGPattern";

const page = () => {
  return (
    <PacsazBGPattern className="flex justify-center items-center">
      <LoginCard />
    </PacsazBGPattern>
  );
};

export default page;

export const metadata = {
  title: "ورود/ثبت نام",
};
