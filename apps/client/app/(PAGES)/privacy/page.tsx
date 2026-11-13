import JsonLd from "@/components/JsonLd";
import LegalPage from "@/components/LegalPage";
import { privacy } from "@/data/legal";
import { breadcrumbSchema, buildMetadata, SITE_NAME } from "@/lib/seo";

const PATH = "/privacy";

const page = () => (
  <>
    <JsonLd
      data={breadcrumbSchema(
        [
          { name: "صفحه اصلی", path: "/" },
          { name: "حریم خصوصی", path: PATH },
        ],
        PATH,
      )}
    />
    <LegalPage doc={privacy} path={PATH} />
  </>
);

export default page;

export const metadata = buildMetadata({
  title: "سیاست حریم خصوصی",
  description: `${SITE_NAME} چه اطلاعاتی نگه می‌دارد و چرا: حساب، دانلودها و پرداخت‌ها؛ تصاویر طرح شما هرگز آپلود نمی‌شود و اطلاعات به کسی فروخته نمی‌شود.`,
  path: PATH,
  keywords: ["حریم خصوصی پک‌ساز", "سیاست حفظ اطلاعات"],
});
