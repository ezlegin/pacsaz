import Terms from "@/components/Terms";

const page = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-5 ">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl">قوانین و مقررات پک ساز</h1>
        <p className="text-sm text-muted-foreground">
          استفاده از وب‌سایت پک‌ساز به‌منزله پذیرش کامل قوانین و مقررات حاضر
          است. در صورت عدم موافقت با هر یک از مفاد، لطفاً از ادامه استفاده از
          خدمات خودداری نمایید.
        </p>
      </div>

      <Terms />
    </div>
  );
};

export default page;

export const metadata = {
  title: "قوانین و مقررات",
  description:
    "صفحه قوانین و مقررات در وبسایت پکساز. با استفاده از این وبسایت، شما موافقت خود را با شرایط و قوانین ارائه شده در این صفحه اعلام می‌کنید.",
};
