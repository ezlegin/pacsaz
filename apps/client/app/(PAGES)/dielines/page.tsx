import DielinesGrid from "@/components/DielinesGrid";
import DielinesSidebar from "@/components/DielinesSidebar";
import { tuckEnd, tuckEndModel } from "@/public";

const page = () => {
  return (
    <div className="flex gap-14">
      <div className="w-100">
        <DielinesSidebar />
      </div>
      <div className="w-full">
        <DielinesGrid dielines={dielines} />
      </div>
    </div>
  );
};

export default page;

const dielines = [
  {
    title: "جعبه درب‌دار ساده",
    slug: "tuck-end",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه اسنپ لاک",
    slug: "tuck-end-snap-lock",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه پستی",
    slug: "postal-card",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه استاندارد FEFCO",
    slug: "fefco-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "پاکت مقوایی",
    slug: "paper-envelope",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه سینی‌دار",
    slug: "tray-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه درب‌دار ساده",
    slug: "tuck-end",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه پستی",
    slug: "postal-card",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه استاندارد FEFCO",
    slug: "fefco-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "پاکت مقوایی",
    slug: "paper-envelope",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
  {
    title: "جعبه سینی‌دار",
    slug: "tray-box",
    dielineImg: tuckEnd,
    modelImg: tuckEndModel,
  },
];
