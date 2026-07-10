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
  description:
    "صفحه ورود و ثبت نام در وبسایت پکساز. با ورود به حساب کاربری خود می‌توانید به امکانات و خدمات ویژه دسترسی پیدا کنید.",
};
