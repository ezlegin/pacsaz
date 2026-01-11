"use client";

import PacsazLogo from "@/components/PacsazLogo";
import Card from "@repo/ui/components/custom/Card";
import { Separator } from "@repo/ui/components/separator";
import PageTitle from "@/components/PageTitle";

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <div className="flex flex-col justify-center items-center space-y-4">
        <PacsazLogo scale={1.4} />

        <PageTitle
          title="درباره پک‌ساز"
          subTitle="پک‌ساز تلاشی است برای ساده‌سازی یکی از پیچیده‌ترین بخش‌های دنیای
          بسته‌بندی؛ جایی که دقت، میلی‌مترها و تصمیم‌های فنی، مستقیماً به نتیجه
          نهایی گره می‌خورند."
        />
      </div>

      <Card className="space-y-6 leading-relaxed">
        <h2 className="text-xl font-semibold">داستان شکل‌گیری</h2>

        <p>
          ایده‌ی پک‌ساز از یک نیاز واقعی متولد شد؛ نیاز به ابزاری که بتواند
          فرآیند طراحی دایلاین‌های بسته‌بندی را سریع‌تر، دقیق‌تر و قابل‌اعتمادتر
          کند، بدون اینکه طراح یا قالب‌ساز درگیر محاسبات تکراری و خطاپذیر شود.
        </p>

        <p>
          از مهرماه سال <strong>۱۴۰۳</strong>، کدنویسی این محصول به‌صورت جدی
          آغاز شد؛ با تمرکز بر ساخت هسته‌ای محاسباتی که بتواند منطق بسته‌بندی را
          به زبان ماشین ترجمه کند، اما همچنان برای انسان قابل فهم و قابل کنترل
          باقی بماند.
        </p>

        <p>
          پک‌ساز نتیجه‌ی همکاری نزدیک با شرکت{" "}
          <a
            href="https://igraphical.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition"
          >
            <strong>آی گرافیکال</strong>
          </a>{" "}
          است؛ مجموعه‌ای که سال‌ها در حوزه آموزش و اجرای طراحی گرافیک و
          بسته‌بندی فعالیت داشته و تجربه‌ی عملی آن، نقش مهمی در شکل‌گیری دیدگاه
          این محصول ایفا کرده است.
        </p>
      </Card>

      <Card className="space-y-6 leading-relaxed">
        <h2 className="text-xl font-semibold">نگاه و فلسفه محصول</h2>

        <p>
          ما در پک‌ساز باور داریم دایلاین فقط یک نقشه فنی نیست؛ دایلاین نقطه‌ی
          تلاقی خلاقیت، مهندسی و تولید است.
        </p>

        <p>هدف ما ساخت ابزاری است که:</p>

        <ul className="list-disc pr-5 space-y-2 text-muted-foreground">
          <li>طراح را از درگیری با محاسبات پیچیده نجات دهد</li>
          <li>به چاپخانه و قالب‌ساز خروجی قابل اعتماد ارائه کند</li>
          <li>و فرآیند طراحی بسته‌بندی را شفاف‌تر و سریع‌تر کند</li>
        </ul>

        <p>
          پک‌ساز تلاش می‌کند در پس‌زمینه بماند؛ مثل خطوط ظریفی که دیده نمی‌شوند،
          اما اگر نباشند، کل ساختار فرو می‌ریزد.
        </p>
      </Card>

      <Card className="space-y-6">
        <h2 className="text-xl font-semibold">تیم توسعه</h2>

        <p className="leading-relaxed text-muted-foreground">
          هسته‌ی فنی و معماری اصلی پک‌ساز توسط{" "}
          <strong className="text-foreground">علیرضا ازلگینی</strong> طراحی و
          پیاده‌سازی شده است. از تعریف منطق دایلاین‌ها گرفته تا ساختار محاسبات،
          تجربه کاربری و تصمیم‌های فنی کلیدی.
        </p>

        <Separator />

        <ul className="space-y-2">
          <li>
            <strong>مدیر توسعه و هسته محصول:</strong> علیرضا ازلگینی
          </li>
          <li>
            <strong>تیم توسعه:</strong>
            <ul className="pr-5 list-disc text-muted-foreground mt-1 space-y-1">
              <li>علیرضا ازلگینی</li>
              <li>مهدی بهرامی</li>
              <li>محمدامین برهانی</li>
            </ul>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AboutPage;
