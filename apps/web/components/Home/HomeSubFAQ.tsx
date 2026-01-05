import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import Card from "../Card";
import HomeTitle from "./HomeTitle";

const HomeSUbFAQ = () => {
  return (
    <div className="flex gap-10">
      <div className="space-y-3 w-1/2">
        <HomeTitle
          title="سوالات متداول درباره اشتراک پک ساز"
          description="در این بخش به سوالات متداول درباره‌ی اشتراک پک‌ساز پاسخ داده شده است.
          اگر سوال شما در اینجا پاسخ داده نشده، لطفاً از طریق بخش پشتیبانی با ما
          در ارتباط باشید."
          className="text-right"
        />
      </div>

      <div className="w-1/2">
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

export default HomeSUbFAQ;

const faqs = [
  {
    q: "دانلود منصفانه (Fair Download) یعنی چه؟",
    a: "دانلود منصفانه یعنی هر پلن تعداد مشخصی دانلود در ماه یا سال دارد تا استفاده‌ی حرفه‌ای و عادلانه برای همه‌ی کاربران حفظ شود.",
  },
  {
    q: "اگر دانلودهای پلنم تمام شود چه اتفاقی می‌افتد؟",
    a: "در صورت اتمام دانلودهای پلن، می‌توانید پلن خود را تمدید یا ارتقا دهید یا تا شروع دوره‌ی بعدی منتظر بمانید.",
  },
  {
    q: "پلن‌های اشتراک پک‌ساز چه تفاوتی با هم دارند؟",
    a: "تفاوت پلن‌ها در تعداد دانلود، امکانات حرفه‌ای‌تر، سطح دسترسی و مناسب بودن برای طراحان فردی یا سازمان‌هاست.",
  },
  {
    q: "آیا امکان ارتقا یا تغییر پلن در هر زمان وجود دارد؟",
    a: "بله. شما می‌توانید در هر زمان پلن خود را ارتقا دهید و از امکانات پلن جدید استفاده کنید.",
  },
  {
    q: "پرداخت‌ها از چه طریقی انجام می‌شود؟",
    a: "پرداخت‌ها به‌صورت آنلاین و از طریق درگاه‌های امن بانکی انجام می‌شود و پس از پرداخت، اشتراک شما بلافاصله فعال خواهد شد.",
  },
  {
    q: "آیا امکان پرداخت سالانه با تخفیف وجود دارد؟",
    a: "بله. در پلن‌های سالانه، هزینه نهایی کمتر از پرداخت ماهانه است و شامل تخفیف ویژه می‌شود.",
  },
];
