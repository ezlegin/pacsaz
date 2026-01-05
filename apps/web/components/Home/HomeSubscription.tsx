import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@workspace/ui/components/accordion";
import React from "react";
import SubscriptionList from "../SubscriptionList";

const HomeSubscription = () => {
  return (
    <>
      <SubscriptionList />

      <div className="max-w-md mx-auto">
        <Accordion type="single" collapsible>
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`${idx}`}>
              <AccordionTrigger className="text-sm font-medium border-none cursor-pointer">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
};

export default HomeSubscription;

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
