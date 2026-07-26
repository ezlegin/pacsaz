import {
  arcFormSchema,
  circleFormSchema,
  lineFormSchema,
  linesFormSchema,
  polygonFormSchema,
  rectangleFormSchema,
} from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectionStore } from "@repo/store/app/selection.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Separator } from "@repo/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Layers2 } from "lucide-react";
import { ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PropsHeader from "./PropsHeader";
import { DupOperationEditor } from "./shapes/DupOperationEditor";
import PointInput from "./shapes/PointInput";

const getShapeSchema = (shapeKey: ISpec.ShapesKey) => {
  const schemas: Record<ISpec.ShapesKey, any> = {
    line: lineFormSchema,
    lines: linesFormSchema,
    rectangle: rectangleFormSchema,
    circle: circleFormSchema,
    polygon: polygonFormSchema,
    arc: arcFormSchema,
  };

  return schemas[shapeKey];
};

interface ShapesPropsProvider<T extends ISpec.ShapesSpec> {
  data: T | null;
  children: (props: { form: any }) => ReactNode;
  close: () => void;
  shapeKey: ISpec.ShapesKey;
}

function ShapesPropsProvider<T extends ISpec.ShapesSpec>({
  children,
  data,
  close,
  shapeKey,
}: ShapesPropsProvider<T>) {
  const { setShape, updateShape } = useDielineSpecStore();

  const { selection } = useSelectionStore();
  const isUpdateType = !!selection;

  const schema = getShapeSchema(shapeKey);
  type FormType = z.infer<typeof schema>;

  const form = useForm<FormType>({
    resolver: zodResolver(schema as any),
    defaultValues: data ?? {
      stack: "shape",
      key: shapeKey,
      type: shapeKey,
      angle: "0",
      height: "",
      length: "",
      width: "",
      radius: "",
      sides: "5",
      isRelative: true,
      pts: undefined,
      relativePts: {
        pts: [
          ["", undefined, "up"],
          ["", undefined, "right"],
        ],
        startPt: ["0", "0"],
      },
      isClosed: false,
      filletRadius: "",
      indices: "",
      startAngle: "",
      endAngle: "",

      id: "0",
      layer: "trim",
      origin: ["0", "0"],
      hidden: false,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormType) => {
    if (isUpdateType) {
      updateShape(selection.id, data);
      toast.info("Shape Updated.");
    } else {
      setShape(data);
      toast.info("Shape Created.");
      close();
    }
  };

  const { append, remove, fields } = useFieldArray({
    name: "dup",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PropsHeader form={form} close={close} />

        {children({ form })}

        <Separator />

        <PointInput
          form={form}
          label="Origin"
          nameX={`origin.0`}
          nameY={`origin.1`}
        />

        <div className="space-y-1">
          <FormField
            control={form.control}
            name="layer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Layer</FormLabel>
                <ToggleGroup
                  onValueChange={(val) => {
                    if (val === "") return;
                    field.onChange(val);
                  }}
                  value={field.value}
                  type="single"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ToggleGroupItem
                    value="trim"
                    className="w-1/3 data-[state=on]:bg-gray-200"
                  >
                    <span className="text-blue-500">Trim</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="fold"
                    className="w-1/3 data-[state=on]:bg-gray-200"
                  >
                    <span className="text-red-500">Fold</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="perf"
                    className="w-1/3 data-[state=on]:bg-gray-200"
                  >
                    <span className="text-fuchsia-500">Perf</span>
                  </ToggleGroupItem>
                </ToggleGroup>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isUpdateType && (
          <>
            <Separator />

            <Accordion defaultValue={fields[0]?.id} collapsible type="single">
              {fields.map((field, idx) => (
                <AccordionItem key={idx} value={field.id}>
                  <AccordionTrigger className="py-2 group">
                    <div className="flex justify-between w-full">
                      <div>Dup-1</div>
                      <div
                        className="border rounded-sm aspect-square size-4  justify-center items-center hidden group-hover:flex hover:bg-gray-200"
                        onClick={() => remove(idx)}
                      >
                        x
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-muted-foreground">
                    <DupOperationEditor form={form} dupIndex={idx} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              onClick={() => append({})}
              size={"sm"}
              variant={"outline"}
              className="w-full"
              type="button"
            >
              <Layers2 />
              Duplicate
            </Button>
          </>
        )}
        <Separator />
      </form>
    </Form>
  );
}

export default ShapesPropsProvider;
