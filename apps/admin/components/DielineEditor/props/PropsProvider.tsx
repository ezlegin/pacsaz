import {
  circleFormSchema,
  lineFormSchema,
  linesFormSchema,
  rectangleFormSchema,
} from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  ISpec,
  useDielineSpecStore,
} from "@repo/store/editor/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Check, ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const getShapeSchema = (shapeKey: ISpec.ShapesKey) => {
  const schemas: Record<ISpec.ShapesKey, any> = {
    line: lineFormSchema,
    lines: linesFormSchema,
    rectangle: rectangleFormSchema,
    circle: circleFormSchema,
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
      pts: [
        ["", ""],
        ["", ""],
      ],
      isRelative: true,

      id: "0",
      layer: "trim",
      origin: ["0", "0"],
      hidden: false,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormType) => {
    if (selectedShape) {
      updateShape(selectedShape.type, selectedShape.id, data);
      toast.info("Shape Updated.");
    } else {
      setShape(shapeKey, data);
      toast.info("Shape Created.");
      close();
    }
  };

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
            disabled={!form.formState.isValid}
          >
            <Check />
          </Button>
        </div>

        {children({ form })}

        {shapeKey !== "lines" && (
          <div className="space-y-1">
            <Label>Origin</Label>
            <div className="flex">
              <FormField
                control={form.control}
                name="origin.0"
                render={({ field }) => (
                  <FormItem className="gap-0 relative">
                    <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                      X
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0"
                        className="h-9 pl-7 rounded-r-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin.1"
                render={({ field }) => (
                  <FormItem className="gap-0 relative">
                    <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                      Y
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0"
                        className="h-9 pl-7 rounded-l-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
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
      </form>
    </Form>
  );
}

export default PropsProvider;
