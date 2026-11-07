import { Arrows, DimLine, GuideFigure, GuideHeader, GuideItem, GuideTip, INK, Label, MUTED, VIOLET, VIOLET_SOFT } from "./GuideParts";

/**
 * Two walls of a box in section, with where each dimension type measures:
 * inside faces, the crease (middle of the board), outside faces.
 */
export function SectionFigure() {
  const wall = 22; // board drawn thick so the three lines read apart
  const left = 70;
  const right = 290;
  return (
    <svg viewBox="0 0 360 230" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="ابعاد داخلی، تولید و خارجی روی دیواره‌ی جعبه">
      <Arrows id="dt" />
      <Arrows id="dtg" color={INK} />
      <Arrows id="dto" color={MUTED} />
      {/* product */}
      <rect x={left + wall + 8} y={70} width={right - left - 2 * wall - 16} height={60} rx={8} fill={VIOLET_SOFT} />
      <Label x={180} y={100} color={VIOLET} size={10} weight={500}>محصول</Label>
      {/* walls and floor */}
      <path d={`M${left} 40V160H${right}V40H${right - wall}V${160 - wall}H${left + wall}V40Z`} fill="#fff" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* creases, the middle of each wall */}
      <line x1={left + wall / 2} y1={34} x2={left + wall / 2} y2={166} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.2} />
      <line x1={right - wall / 2} y1={34} x2={right - wall / 2} y2={166} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.2} />

      <DimLine id="dt" x1={left + wall} y1={52} x2={right - wall} y2={52} />
      <Label x={180} y={42} size={10}>داخلی</Label>
      <DimLine id="dtg" x1={left + wall / 2} y1={182} x2={right - wall / 2} y2={182} color={INK} />
      <Label x={180} y={194} color={INK} size={10}>تولید (خط تا تا خط تا)</Label>
      <DimLine id="dto" x1={left} y1={214} x2={right} y2={214} color={MUTED} />
      <Label x={180} y={224} color={MUTED} size={10}>خارجی</Label>
    </svg>
  );
}

const DimensionTypeGuide = () => (
  <div className="space-y-4">
    <GuideHeader
      title="نوع ابعاد"
      lead="مقوا ضخامت دارد، پس یک جعبه سه اندازه دارد: داخلش، روی خط‌های تا، و بیرونش. این گزینه می‌گوید عددی که وارد کرده‌اید کدام‌یک است."
    />

    <GuideFigure caption="برش از دیواره‌ی جعبه؛ خط قرمز محل تا است">
      <SectionFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="ابعاد تولید" badge="پیش‌فرض">
        فاصله‌ی خط تا تا خط تا، همان اندازه‌ای که دایلاین با آن رسم می‌شود. اگر اندازه را از یک دایلاین یا نمونه‌ی موجود برداشته‌اید، این را انتخاب کنید.
      </GuideItem>
      <GuideItem title="ابعاد داخلی">
        فضای خالی داخل جعبه، برای وقتی که اندازه‌ی محصول را دارید. دایلاین به هر بُعد دو برابر ضخامت اضافه می‌کند، و به طول و عرض ۱ میلی‌متر هم برای اینکه محصول راحت داخل برود.
      </GuideItem>
      <GuideItem title="ابعاد خارجی">
        اندازه‌ی بیرونی جعبه‌ی ساخته‌شده، برای وقتی که جعبه باید داخل کارتن، قفسه یا جای مشخصی جا شود. دایلاین از هر بُعد دو برابر ضخامت کم می‌کند.
      </GuideItem>
    </div>

    <GuideTip>
      خط‌کش‌های دایلاین همیشه همان عددی را نشان می‌دهند که شما وارد کرده‌اید؛ در حالت داخلی یا خارجی، دو سرِ خط‌کش کمی جابه‌جا رسم می‌شود تا معلوم باشد اندازه از داخل یا بیرون گرفته شده است.
    </GuideTip>
  </div>
);

export default DimensionTypeGuide;
