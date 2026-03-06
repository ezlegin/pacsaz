import { Button } from "@repo/ui/components/button";
import Card from "@repo/ui/components/custom/Card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import {
  FlipHorizontal,
  LucideIcon,
  Maximize,
  Move,
  Move3D,
  RotateCw,
  Scale3D,
  Square,
} from "lucide-react";
import { useFieldArray } from "react-hook-form";
import PointInput from "./PointInput";

interface Props {
  form: any;
  dupIndex: number;
}

export function DupOperationEditor({ form, dupIndex }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `dup.${dupIndex}.operations`,
  });

  const operationButtons = [
    { title: "zero", icon: Scale3D, onClick: () => append({ type: "zero" }) },
    {
      title: "center",
      icon: Square,
      onClick: () => append({ type: "center" }),
    },
    {
      title: "mirror",
      icon: FlipHorizontal,
      onClick: () => append({ type: "mirror", x: false, y: false }),
    },
    {
      title: "move",
      icon: Move,
      onClick: () => append({ type: "move", value: ["0", "0"] }),
    },
    {
      title: "move to",
      icon: Move3D,
      onClick: () => append({ type: "moveTo", value: ["0", "0"] }),
    },
    {
      title: "rotate",
      icon: RotateCw,
      onClick: () => append({ type: "rotate", value: "0" }),
    },
    {
      title: "scale",
      icon: Maximize,
      onClick: () => append({ type: "scale", value: "1" }),
    },
  ];

  return (
    <div className="space-y-1">
      {/* ADD OPERATION */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {operationButtons.map((item, idx) => (
          <OperationButton
            key={idx}
            Icon={item.icon}
            title={item.title}
            onClick={item.onClick}
          />
        ))}
      </div>

      {fields.map((field, index) => {
        const type = form.watch(`dup.${dupIndex}.operations.${index}.type`);

        return (
          <Card key={field.id} className="p-1.5 px-2 space-y-2 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="font-medium">{type}</span>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="size-5 p-0 text-xs"
                  type="button"
                  variant={"outline"}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </Button>

                <Button
                  size="sm"
                  className="size-5 p-0 text-xs"
                  type="button"
                  variant={"outline"}
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </Button>

                <Button
                  size="sm"
                  className="size-5 p-0 text-xs"
                  variant="destructive"
                  type="button"
                  onClick={() => remove(index)}
                >
                  x
                </Button>
              </div>
            </div>

            {/* CONDITIONAL FIELDS */}

            {type === "mirror" && (
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`dup.${dupIndex}.operations.${index}.x`}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 justify-between">
                      <FormLabel>X</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`dup.${dupIndex}.operations.${index}.y`}
                  render={({ field }) => (
                    <FormItem className="flex gap-1 justify-between">
                      <FormLabel>Y</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {type === "move" && (
              <div className="flex gap-2">
                <PointInput
                  form={form}
                  nameX={`dup.${dupIndex}.operations.${index}.value.0`}
                  nameY={`dup.${dupIndex}.operations.${index}.value.1`}
                />
              </div>
            )}

            {type === "move" ||
              (type === "moveTo" && (
                <div className="flex gap-2">
                  <PointInput
                    form={form}
                    nameX={`dup.${dupIndex}.operations.${index}.value.0`}
                    nameY={`dup.${dupIndex}.operations.${index}.value.1`}
                  />
                </div>
              ))}

            {type === "rotate" && (
              <FormField
                control={form.control}
                name={`dup.${dupIndex}.operations.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex gap-1 justify-between">
                    <FormLabel>Rotate</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1.0" className="h-8" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {type === "scale" && (
              <FormField
                control={form.control}
                name={`dup.${dupIndex}.operations.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex gap-1 justify-between">
                    <FormLabel>Scale</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1.0" className="h-8" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}

const OperationButton = ({
  onClick,
  Icon,
  title,
}: {
  Icon: LucideIcon;
  title: string;
  onClick: () => void;
}) => {
  return (
    <Button
      size="icon"
      variant="outline"
      type="button"
      className="size-8"
      title={title}
      onClick={onClick}
    >
      <Icon />
    </Button>
  );
};
