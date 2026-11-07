import { GuideFigure, GuideHeader, GuideItem, GuideTip, Label, MUTED } from "./GuideParts";

/** What each line colour means in the downloaded file. */
export function LinesFigure() {
  const rows = [
    { color: "#1d4ed8", dash: undefined, name: "برش" },
    { color: "#dc2626", dash: "6 4", name: "تا" },
    { color: "#22c55e", dash: undefined, name: "بلید (فقط PDF و AI)" },
    { color: "#0ea5e9", dash: undefined, name: "خط‌کش و اندازه" },
  ];
  return (
    <svg viewBox="0 0 360 150" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="رنگ خطوط در فایل">
      {rows.map((r, i) => (
        <g key={r.name}>
          {/* Labels centred in their own column: start/end anchors flip on a right-to-left page. */}
          <line x1={40} y1={22 + i * 34} x2={170} y2={22 + i * 34} stroke={r.color} strokeWidth={2.5} strokeDasharray={r.dash} />
          <Label x={270} y={22 + i * 34} color={MUTED} size={11} weight={600}>{r.name}</Label>
        </g>
      ))}
    </svg>
  );
}

const FormatGuide = () => (
  <div className="space-y-4">
    <GuideHeader
      title="فرمت فایل"
      lead="هر سه فرمت همان دایلاین را در اندازه‌ی واقعی (۱:۱، به میلی‌متر) دارند؛ فرقشان در این است که فایل به دست چه کسی می‌رسد."
    />

    <GuideFigure caption="رنگ خطوط در فایل دانلودی">
      <LinesFigure />
    </GuideFigure>

    <div className="grid gap-2">
      <GuideItem title="PDF" badge="پیشنهادی">
        برای دیدن، چاپ آزمایشی و فرستادن به چاپخانه. خط برش و تا، بلید، خط‌کش‌ها و مشخصات فایل (اندازه، بلید) را دارد و در هر دستگاهی باز می‌شود.
      </GuideItem>
      <GuideItem title="AI (ایلاستریتور)">
        همان فایل PDF که مستقیم در Adobe Illustrator باز می‌شود. طراح می‌تواند طرح را روی دایلاین بچیند؛ پیش از چاپ، خطوط دایلاین را روی لایه‌ی جدا و غیرچاپی بگذارد.
      </GuideItem>
      <GuideItem title="DXF">
        برای قالب‌ساز، دستگاه برش لیزر و CNC و برش‌های پلاتر. فقط خطوط تولید را دارد، هر نوع روی لایه و رنگ خودش (برش آبی، تا قرمز، پرفراژ و نیم‌برش جدا)؛ بلید و خط‌کش ندارد، چون در ساخت قالب معنایی ندارند.
      </GuideItem>
    </div>

    <GuideTip>
      اگر نمی‌دانید چاپخانه چه می‌خواهد، PDF بفرستید. برای ساخت قالب تیغ، DXF را مستقیم به قالب‌ساز بدهید.
    </GuideTip>
  </div>
);

export default FormatGuide;
