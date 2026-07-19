import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";
import Card from "@repo/ui/components/custom/Card";
import { CircleQuestionMark } from "lucide-react";

const FAQ = () => {
  return (
    <div className="flex flex-wrap lg:flex-nowrap w-full gap-10">
      <div className="space-y-3 w-full ">
        <Badge variant={"primaryForeground"}>
          Frequently Asked Questions
          <CircleQuestionMark />
        </Badge>

        <h2 className="font-semibold text-2xl">سوالات متداول درباره پک‌ساز</h2>

        <p className="text-sm text-muted-foreground">
          در این بخش به سوالات متداول درباره‌ی پک‌ساز پاسخ داده شده است. اگر
          سوال شما در اینجا پاسخ داده نشده، لطفاً از طریق بخش پشتیبانی با ما در
          ارتباط باشید.
        </p>

        {/* <Button variant={"default"}>صفحه سوالات متداول</Button> */}
      </div>

      <div className="w-full">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`${idx}`} className="border-none">
              <Card className="py-0">
                <AccordionTrigger className="text-sm font-medium border-none cursor-pointer">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;

const faqs = [
  {
    q: "پک‌ساز دقیقاً چه کاری انجام می‌دهد؟",
    a: "پک‌ساز یک ابزار تخصصی آنلاین برای تولید دایلاین‌های استاندارد بسته‌بندی است که به طراحان، چاپخانه‌ها و استودیوهای طراحی کمک می‌کند بدون خطا و بر اساس ابعاد واقعی، دایلاین آماده‌ی تولید بسازند.",
  },
  {
    q: "برای استفاده از پک‌ساز باید نرم‌افزار خاصی نصب کنم؟",
    a: "خیر. پک‌ساز کاملاً تحت وب است و بدون نصب هیچ نرم‌افزاری، از طریق مرورگر قابل استفاده است.",
  },
  {
    q: "چه فرمت‌هایی برای خروجی دایلاین‌ها ارائه می‌شود؟",
    a: "دایلاین‌ها در فرمت‌های استاندارد وکتور مانند PDF، DXF و AI ارائه می‌شوند تا به‌راحتی در نرم‌افزارهای وکتور همچون مثل Adobe Illustrator قابل ویرایش باشند.",
  },
  {
    q: "آیا دایلاین‌های تولیدشده قابل استفاده در چاپخانه هستند؟",
    a: "بله. تمام دایلاین‌های پک‌ساز بر اساس اصول فنی چاپ و بسته‌بندی طراحی شده‌اند و خروجی‌ها مستقیماً قابل استفاده در چاپخانه و خطوط تولید هستند.",
  },
  {
    q: "آیا پک‌ساز برای چاپخانه‌ها و تیم‌های طراحی هم مناسب است؟",
    a: "کاملاً. پک‌ساز به‌گونه‌ای طراحی شده که هم برای طراحان مستقل و هم برای چاپخانه‌ها و تیم‌های حرفه‌ای قابل استفاده باشد.",
  },
  {
    q: "اگر در حین استفاده سوال یا مشکلی داشته باشم چه کار کنم؟",
    a: "می‌توانید از طریق بخش پشتیبانی با تیم پک‌ساز در ارتباط باشید تا در سریع‌ترین زمان راهنمایی شوید.",
  },
];
