import { rulerFormSchema } from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import PropsHeader from "./PropsHeader";
import PointInput from "./shapes/PointInput";

type FormType = z.infer<typeof rulerFormSchema>;

const RulerProps = ({
  close,
  selection,
}: {
  close: () => void;
  selection: ISpec.ShapesSpec | ISpec.Ruler | null;
}) => {
  const {
    setRuler,
    specs: { rulers },
    updateRuler,
  } = useDielineSpecStore();
  const form = useForm<FormType>({
    resolver: zodResolver(rulerFormSchema),
    defaultValues: (selection as ISpec.Ruler) ?? {
      id: "",
      stack: "ruler",
      hidden: false,
      from: ["0", "length / 4"],
      to: ["width", "length / 4"],
      offset: "0.02 * width",
      value: "width",
      key: "ruler-width",
      type: "ruler",
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormType) => {
    if (selection) {
      updateRuler(data);
      toast.success("Ruler Updated.");
    } else {
      for (const r of rulers) {
        if (r.key === data.key) {
          toast.error("Ruler Key Should Be Unique.");
          return;
        }
      }

      setRuler(data);
      toast.info("Ruler Created.");

      close();
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PropsHeader form={form} close={close} />

          <PointInput form={form} nameX="from.0" nameY="from.1" label="From" />
          <PointInput form={form} nameX="to.0" nameY="to.1" label="To" />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <Input placeholder="expr..." className="h-9" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offset</FormLabel>
                <Input placeholder="expr..." className="h-9" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default RulerProps;
