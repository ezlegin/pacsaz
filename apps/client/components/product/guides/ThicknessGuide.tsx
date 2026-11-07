import { Arrows, DimLine, GuideFigure, GuideHeader, GuideItem, GuideTip, INK, Label, MUTED, VIOLET } from "./GuideParts";

/** Board in section: a solid card and a single-flute board, each with its thickness. */
export function ThicknessFigure() {
  // A sine flute between two liners.
  const flute = Array.from({ length: 13 }, (_, i) => {
    const x = 200 + i * 10;
    return `${i === 0 ? "M" : "L"}${x} ${i % 2 ? 128 : 92}`;
  }).join("");
  return (
    <svg viewBox="0 0 360 200" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="ضخامت مقوا و کارتن فلوت">
      <Arrows id="th" />
      {/* solid card */}
      <rect x={30} y={102} width={120} height={14} rx={2} fill="#f5f3ff" stroke={INK} strokeWidth={1.5} />
      <DimLine id="th" x1={20} y1={98} x2={20} y2={120} />
      <Label x={90} y={150} color={INK} size={11}>مقوا</Label>
      <Label x={90} y={168} color={MUTED} size={10} weight={500}>۰٫۲ تا ۱ میلی‌متر</Label>

      {/* single-flute board */}
      <line x1={200} y1={88} x2={320} y2={88} stroke={INK} strokeWidth={2} />
      <line x1={200} y1={132} x2={320} y2={132} stroke={INK} strokeWidth={2} />
      <path d={flute} fill="none" stroke={VIOLET} strokeWidth={1.5} strokeLinejoin="round" />
      <DimLine id="th" x1={334} y1={86} x2={334} y2={134} />
      <Label x={260} y={150} color={INK} size={11}>کارتن فلوت</Label>
      <Label x={260} y={168} color={MUTED} size={10} weight={500}>۱ تا ۷ میلی‌متر</Label>
    </svg>
  );
}

const ThicknessGuide = () => (
  <div className="space-y-4">
    <GuideHeader
      title="ضخامت"
      lead="ضخامت مقوا یا کارتن به میلی‌متر. با انتخاب متریال خودکار پر می‌شود، ولی اگر ورق شما کمی ضخیم‌تر یا نازک‌تر است، عدد دقیقش را بدهید."
    />

    <GuideFigure caption="ضخامت، فاصله‌ی دو رویه‌ی ورق است">
      <ThicknessFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="چه چیزی را تغییر می‌دهد؟">
        هرجا ورق روی خودش تا می‌شود، دایلاین به اندازه‌ی یک ضخامت جا باز می‌کند: درِ جعبه کمی بالاتر لولا می‌خورد، فاصله‌ی زبانه و فلپ‌ها و شیارها با آن تنظیم می‌شود. در ابعاد داخلی و خارجی هم دو برابر ضخامت به اندازه اضافه یا از آن کم می‌شود.
      </GuideItem>
      <GuideItem title="اگر اشتباه وارد شود؟">
        با ضخامت کمتر از واقعی، جعبه سفت بسته می‌شود یا درش جا نمی‌رود؛ با ضخامت بیشتر، درزها لق می‌شوند. ضخامت را از برگه‌ی مشخصات ورق یا با کولیس اندازه بگیرید.
      </GuideItem>
    </div>

    <GuideTip>
      بازه‌ی زیر فیلد، ضخامت‌های مجاز برای این قالب است. تغییر ضخامت در پلن حرفه‌ای و سازمانی فعال است.
    </GuideTip>
  </div>
);

export default ThicknessGuide;
