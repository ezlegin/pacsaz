import { Arrows, DimLine, GuideFigure, GuideHeader, GuideItem, GuideTip, INK, Label, VIOLET_SOFT } from "./GuideParts";

/** A box in isometric view with its three dimensions. */
export function BoxFigure() {
  // Isometric corners: front-bottom-left at (90,170); length runs right-down, width right-up.
  return (
    <svg viewBox="0 0 360 230" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="طول، عرض و ارتفاع جعبه">
      <Arrows id="dim" />
      {/* top */}
      <path d="M90 80L190 110L280 70L180 40Z" fill={VIOLET_SOFT} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* front (length side) */}
      <path d="M90 80L190 110L190 200L90 170Z" fill="#fff" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* side (width side) */}
      <path d="M190 110L280 70L280 160L190 200Z" fill="#f5f3ff" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />

      {/* length, under the front face */}
      <DimLine id="dim" x1={84} y1={186} x2={184} y2={216} />
      <Label x={120} y={214}>طول</Label>
      {/* width, under the side face */}
      <DimLine id="dim" x1={198} y1={214} x2={288} y2={174} />
      <Label x={262} y={210}>عرض</Label>
      {/* height, beside the front edge */}
      <DimLine id="dim" x1={70} y1={84} x2={70} y2={168} />
      <Label x={46} y={126}>ارتفاع</Label>
    </svg>
  );
}

const DimensionGuide = () => (
  <div className="space-y-4">
    <GuideHeader title="طول، عرض و ارتفاع" lead="سه عددی که اندازه‌ی جعبه را می‌سازند، همه به میلی‌متر. دایلاین با هر تغییر دوباره و دقیق برای همان اندازه ساخته می‌شود." />

    <GuideFigure caption="جعبه از روبه‌رو، با درِ بالا">
      <BoxFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="طول">
        پهنای وجه بزرگ‌تر جعبه، یعنی وجهی که در (لید) روی آن بسته می‌شود و معمولاً طرح اصلی روی آن چاپ می‌شود.
      </GuideItem>
      <GuideItem title="عرض">
        پهنای وجه کناری و کوچک‌تر. در بیشتر قالب‌ها اگر عرض را از طول بزرگ‌تر بدهید، دایلاین خودش وجه‌ها را جابه‌جا می‌کند تا در روی وجه پهن بنشیند.
      </GuideItem>
      <GuideItem title="ارتفاع">
        فاصله‌ی کف تا درِ جعبه، یعنی همان جهتی که محصول از آن داخل جعبه گذاشته می‌شود.
      </GuideItem>
    </div>

    <GuideTip>
      وقتی نشانگر را روی هر فیلد ببرید، خط‌کشی که همان اندازه را نشان می‌دهد روی دایلاین بنفش می‌شود. اعداد به حداقل و حداکثرِ مجاز این قالب محدود می‌شوند.
    </GuideTip>
  </div>
);

export default DimensionGuide;
