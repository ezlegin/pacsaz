import Terms from "../Terms";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

const Step4 = () => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground text-center font-medium">
        ثبت نام شما به منزله تایید قوانین و مقررات پک ساز می باشد.
      </p>

      <ScrollArea
        scrollHideDelay={9999}
        dir="rtl"
        className="h-[450px] w-full rounded-2xl border p-4"
      >
        <div className="text-muted-foreground">
          <Terms style="raw" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Step4;
