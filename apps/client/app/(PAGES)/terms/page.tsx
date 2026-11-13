import JsonLd from "@/components/JsonLd";
import LegalPage from "@/components/LegalPage";
import { terms } from "@/data/legal";
import { breadcrumbSchema, buildMetadata, SITE_NAME } from "@/lib/seo";

const PATH = "/terms";

const page = () => (
  <>
    <JsonLd
      data={breadcrumbSchema(
        [
          { name: "صفحه اصلی", path: "/" },
          { name: "قوانین و مقررات", path: PATH },
        ],
        PATH,
      )}
    />
    <LegalPage doc={terms} path={PATH} />
  </>
);

export default page;

export const metadata = buildMetadata({
  title: "قوانین و مقررات استفاده",
  description: `شرایط استفاده از ${SITE_NAME}: حساب کاربری، اشتراک و سهمیه دانلود، پرداخت و بازگشت وجه، مسئولیت فنی فایل‌ها و مجوز استفاده‌ی تجاری از دایلاین‌ها.`,
  path: PATH,
  keywords: ["قوانین پک‌ساز", "شرایط استفاده دایلاین", "بازگشت وجه پک‌ساز"],
});
