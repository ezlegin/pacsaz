import {
  lineFormSchema,
  rectangleFormSchema,
} from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelectShapeStore } from "@repo/store/app/selectedShape.store";
import {
  ShapesKey,
  Specs,
  useDielineSpecStore,
} from "@repo/store/dieline/dielineSpec.store";
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
import { z } from "zod";

const getShapeSchema = (shapeKey: ShapesKey) => {
  switch (shapeKey) {
    case "line":
      return lineFormSchema;
    case "rectangle":
      return rectangleFormSchema;
    default:
      throw new Error(`Unsupported shape: ${shapeKey}`);
  }
};

interface PropsProvider<T extends Specs> {
  data: T;
  children: (props: { form: any }) => ReactNode;
  close: () => void;
  shapeKey: ShapesKey;
}

function PropsProvider<T extends Specs>({
  children,
  data,
  close,
  shapeKey,
}: PropsProvider<T>) {
  const {
    dielineSpec: { shapes },
    setShape,
    updateShape,
  } = useDielineSpecStore();

  const { selectedShape } = useSelectShapeStore();

  const schema = getShapeSchema(shapeKey);
  type FormType = z.infer<typeof schema>;

  const form = useForm<FormType>({
    resolver: zodResolver(schema as any),
    defaultValues: data ?? {
      angle: "",
      height: "",
      hidden: false,
      layer: "trim",
      length: "",
      origin: { x: "0", y: "0" },
      width: "",
    },
  });

  const onSubmit = (data: FormType) => {
    if (selectedShape) {
      updateShape(selectedShape.parent, selectedShape.child, data);
    } else {
      const prev = shapes?.[shapeKey];
      const lastKey = Object.keys(prev ?? {})
        .at(-1)
        ?.split("-")[1];

      const count = lastKey ? Number(lastKey) + 1 : 1;
      const key = `${shapeKey}-${count}`;

      setShape(shapeKey, key, data);
    }

    close();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={close}
            type="button"
            className="has-[>svg]:px-0 capitalize"
          >
            <ChevronLeft />
            {shapeKey}
          </Button>

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

        <div className="space-y-1">
          <Label>Origin</Label>
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="origin.x"
              render={({ field }) => (
                <FormItem className="gap-0 relative">
                  <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                    X
                  </span>
                  <FormControl>
                    <Input {...field} placeholder="0" className="h-9 pl-7" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin.y"
              render={({ field }) => (
                <FormItem className="gap-0 relative">
                  <span className="text-xs text-muted-foreground absolute translate-y-2.5 pl-3">
                    Y
                  </span>
                  <FormControl>
                    <Input {...field} placeholder="0" className="h-9 pl-7" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

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
