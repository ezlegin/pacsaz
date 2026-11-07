import { Arrows, DimLine, GuideFigure, GuideHeader, GuideItem, GuideTip, INK, Label, VIOLET } from "./GuideParts";

/** A corner of a panel: artwork runs past the cut line into the bleed. */
export function BleedFigure() {
  return (
    <svg viewBox="0 0 360 220" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="طرح تا بیرون خط برش ادامه پیدا می‌کند">
      <Arrows id="bl" />
      {/* bleed outline, the artwork's edge */}
      <rect x={40} y={30} width={280} height={160} rx={10} fill="url(#bleed-art)" stroke="#22c55e" strokeWidth={1.2} />
      <defs>
        <linearGradient id="bleed-art" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor={VIOLET} />
        </linearGradient>
      </defs>
      {/* cut line */}
      <rect x={68} y={58} width={224} height={104} fill="none" stroke="#1d4ed8" strokeWidth={2} />
      <Label x={180} y={110} color="#fff" size={12}>طرح شما</Label>

      <DimLine id="bl" x1={40} y1={204} x2={68} y2={204} color={INK} />
      <Label x={54} y={214} color={INK} size={10} weight={500}>بلید</Label>
      <Label x={180} y={16} color="#1d4ed8" size={10}>خط برش (آبی)</Label>
      <Label x={300} y={204} color="#16a34a" size={10}>لبه‌ی بلید (سبز)</Label>
    </svg>
  );
}

const BleedGuide = () => (
  <div className="space-y-4">
    <GuideHeader
      title="بلید (لب‌برش)"
      lead="نواری اضافه دور خط برش که طرح چاپی باید تا آنجا ادامه داشته باشد. برش هیچ‌وقت دقیقاً روی خط نمی‌افتد؛ بلید جلوی لبه‌ی سفید را می‌گیرد."
    />

    <GuideFigure caption="رنگ تا لبه‌ی سبز ادامه دارد؛ تیغ روی خط آبی می‌بُرد">
      <BleedFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="چه اندازه‌ای انتخاب کنم؟">
        برای بیشتر چاپخانه‌ها ۳ میلی‌متر کافی است. برای کارتن‌های فلوت و برش‌های بزرگ‌تر ۵ میلی‌متر مطمئن‌تر است. اگر چاپخانه عدد خاصی خواسته، همان را بگذارید.
      </GuideItem>
      <GuideItem title="در فایل چه می‌شود؟">
        در PDF و AI، دور هر قطعه یک خط سبز در فاصله‌ی بلید رسم می‌شود و دور پنجره‌ها هم همین فاصله به سمت داخل پنجره کشیده می‌شود. در DXF بلید نیست، چون آن فایل برای قالب‌ساز است و او فقط خط برش و تا را لازم دارد.
      </GuideItem>
    </div>

    <GuideTip>
      متن و لوگو را تا بلید نبرید؛ چیزهای مهم را دست‌کم چند میلی‌متر داخلِ خط برش نگه دارید تا با جابه‌جایی برش بریده نشوند.
    </GuideTip>
  </div>
);

export default BleedGuide;
