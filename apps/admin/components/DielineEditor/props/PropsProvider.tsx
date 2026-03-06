import {
  arcFormSchema,
  circleFormSchema,
  lineFormSchema,
  linesFormSchema,
  polygonFormSchema,
  rectangleFormSchema,
} from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Separator } from "@repo/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Check, ChevronLeft, Layers2 } from "lucide-react";
import { ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DupOperationEditor } from "./DupOperationEditor";
import PointInput from "./PointInput";

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

interface PropsProvider<T extends ISpec.ShapesSpec> {
  data: T | null;
  children: (props: { form: any }) => ReactNode;
  close: () => void;
  shapeKey: ISpec.ShapesKey;
}

function PropsProvider<T extends ISpec.ShapesSpec>({
  children,
  data,
  close,
  shapeKey,
}: PropsProvider<T>) {
  const { setShape, updateShape } = useDielineSpecStore();

  const { selectedShape } = useSelectShapeStore();
  const isUpdateType = !!selectedShape;

  const schema = getShapeSchema(shapeKey);
  type FormType = z.infer<typeof schema>;

  const form = useForm<FormType>({
    resolver: zodResolver(schema as any),
    defaultValues: data ?? {
      key: shapeKey,
      type: shapeKey,
      angle: "",
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
      updateShape(selectedShape.type, selectedShape.id, data);
      toast.info("Shape Updated.");
    } else {
      setShape(shapeKey, data);
      toast.info("Shape Created.");
      close();
    }
  };

  const { append, remove, fields } = useFieldArray({
    name: "dup",
    control: form.control,
  });

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              type="button"
              className="has-[>svg]:px-0 "
              onClick={close}
            >
              <ChevronLeft />
            </Button>
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Shape Name"
                      className="p-0 h-fit w-fit border-0 bg-transparent text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:font-medium focus:border-b"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button
            variant="primaryForeground"
            size="icon"
            type="submit"
            // disabled={!form.formState.isValid}
          >
            <Check />
          </Button>
        </div>

        {children({ form })}

        <Separator />

        {shapeKey !== "lines" && (
          <PointInput
            form={form}
            label="Origin"
            nameX={`origin.0`}
            nameY={`origin.1`}
          />
        )}

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
      </form>
    </Form>
  );
}

export default PropsProvider;
