import { GuideFigure, GuideHeader, GuideItem, GuideTip, INK, Label, MUTED, VIOLET } from "./GuideParts";

/** The three families in section, thinnest to thickest. */
export function MaterialFigure() {
  const wave = (x0: number, top: number, bottom: number, n: number, step: number) =>
    Array.from({ length: n }, (_, i) => `${i === 0 ? "M" : "L"}${x0 + i * step} ${i % 2 ? bottom : top}`).join("");
  return (
    <svg viewBox="0 0 360 170" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="کاغذ و مقوا، کارتن تک‌لایه و دولایه">
      {/* paper / card */}
      <rect x={20} y={76} width={90} height={8} rx={2} fill="#f5f3ff" stroke={INK} strokeWidth={1.5} />
      <Label x={65} y={124} color={INK} size={11}>کاغذ و مقوا</Label>
      <Label x={65} y={142} color={MUTED} size={9} weight={500}>جعبه‌ی محصول، چاپ ظریف</Label>

      {/* single wall */}
      <line x1={135} y1={64} x2={225} y2={64} stroke={INK} strokeWidth={2} />
      <line x1={135} y1={96} x2={225} y2={96} stroke={INK} strokeWidth={2} />
      <path d={wave(135, 66, 94, 10, 10)} fill="none" stroke={VIOLET} strokeWidth={1.5} />
      <Label x={180} y={124} color={INK} size={11}>فلوت تک‌لایه</Label>
      <Label x={180} y={142} color={MUTED} size={9} weight={500}>F، E، B، C</Label>

      {/* double wall */}
      <line x1={250} y1={50} x2={340} y2={50} stroke={INK} strokeWidth={2} />
      <line x1={250} y1={80} x2={340} y2={80} stroke={INK} strokeWidth={2} />
      <line x1={250} y1={110} x2={340} y2={110} stroke={INK} strokeWidth={2} />
      <path d={wave(250, 52, 78, 10, 10)} fill="none" stroke={VIOLET} strokeWidth={1.5} />
      <path d={wave(250, 82, 108, 10, 10)} fill="none" stroke={VIOLET} strokeWidth={1.5} />
      <Label x={295} y={130} color={INK} size={11}>فلوت دولایه</Label>
      <Label x={295} y={148} color={MUTED} size={9} weight={500}>BE، BC، AB</Label>
    </svg>
  );
}

const MeterialGuide = () => (
  <div className="space-y-4">
    <GuideHeader
      title="متریال چاپ"
      lead="ورقی که جعبه از آن ساخته می‌شود. متریال ضخامت پیش‌فرض را تعیین می‌کند، و ضخامت روی همه‌ی فاصله‌ها و لقی‌های دایلاین اثر دارد؛ پس پیش از دانلود درست انتخابش کنید."
    />

    <GuideFigure caption="از نازک به ضخیم؛ موج بنفش لایه‌ی فلوت است">
      <MaterialFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="کاغذ گلاسه و مقوا گلاسه">
        نازک (حدود ۰٫۲ تا ۰٫۵ میلی‌متر) با سطح صاف و براق برای چاپ رنگی باکیفیت. مناسب جعبه‌ی لوازم آرایشی، دارو، خوراکی و هر محصول سبک.
      </GuideItem>
      <GuideItem title="کارتن فلوت تک‌لایه (F، E، B، C)">
        یک لایه‌ی موج‌دار بین دو رویه، از ۱٫۲ تا ۴ میلی‌متر. F و E برای جعبه‌های محکم ولی خوش‌چاپ؛ B و C برای جعبه‌ی حمل و کارتن‌های بزرگ‌تر.
      </GuideItem>
      <GuideItem title="کارتن فلوت دولایه (BE، BC، AB)">
        دو لایه‌ی موج‌دار، ۵ تا ۷ میلی‌متر. برای بار سنگین، چیدن روی هم و ارسال‌های دور.
      </GuideItem>
    </div>

    <GuideTip>
      مدل سه‌بعدی صفحه هم با متریال عوض می‌شود: مقوا صاف و سفید دیده می‌شود و کارتن با رنگ کرافت و لبه‌ی فلوت، تا قبل از سفارش حس واقعی جعبه را ببینید.
    </GuideTip>
  </div>
);

export default MeterialGuide;
