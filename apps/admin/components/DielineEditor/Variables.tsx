import { zodResolver } from "@hookform/resolvers/zod";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { IVar, useVariableStore } from "@repo/store/editor/variables.store";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Minus, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  conditions: z
    .array(z.object({ if: z.string(), then: z.string() }))
    .optional(),
  value: z.string().min(1),
});
type FormType = z.infer<typeof formSchema>;

const Variables = () => {
  const [selectedVar, setSelectedVar] = useState<IVar.Variable | null>(null);
  const { refresh } = useRouter();
  const { setVariable, variables, removeVariable, updateVariable } =
    useVariableStore();
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      value: "",
      conditions: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormType) => {
    const existingVarName = variables.find((v) => v.name === data.name);
    if (existingVarName && existingVarName.id !== data.id) {
      toast.error("Variable Name Should be Unique.");
      return;
    }

    if (
      data.name === "width" ||
      data.name === "length" ||
      data.name === "height"
    ) {
      toast.error(`"${data.name}" Can not be a variable.`);
      return;
    }

    if (selectedVar) {
      updateVariable(data);
      setSelectedVar(data);
    } else {
      setVariable(data);
      form.reset();
    }

    toast.success(`Variable Crated Successfully.`);
    refresh(); //todo: this dosen't work. so input of shapes doesn't get the latest var created and needs a tab reload.
  };

  const handleVarSelection = (id: string) => {
    if (id === "") {
      setSelectedVar(null);
      return;
    }

    const variable = variables.find((v) => v.id === id);
    if (variable) setSelectedVar(variable);
  };

  const {
    specs: { shapes },
  } = useDielineSpecStore();
  const handleVarDelesion = (id: string) => {
    const variable = variables.find((v) => v.id === id);
    if (!variable) {
      toast.error("Variable could not be found.");
      return;
    }

    for (const shape of Object.entries(shapes)) {
      //todo: ask AI if we can write this code more optimized.
      const val = shape[1][0];
      if (!val) continue;
      let strings: string[] = [];

      Object.entries(val).forEach(
        (v) => typeof v[1] === "string" && strings.push(v[1]),
      );

      for (const str of strings) {
        if (str.includes(variable.name)) {
          toast.error(
            `This variable is being used in the ${val.type} -> ${val.key}`,
          );
          return;
        }
      }
    }

    removeVariable(id);
    form.reset({ id: "", name: "", value: "" });
  };

  useEffect(() => {
    if (selectedVar) {
      form.reset(selectedVar);
    } else {
      form.reset({ id: "", name: "", value: "", conditions: [] });
    }
  }, [selectedVar]);

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-9" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input {...field} className="h-9" />
                </FormControl>
              </FormItem>
            )}
          />

          {fields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-center">
              <Button
                size={"icon"}
                variant={"ghost"}
                className="size-2 group text-muted-foreground"
                onClick={() => remove(idx)}
              >
                <span className="group-hover:hidden">{idx + 1}</span>
                <span className="hidden group-hover:block">
                  <Minus />
                </span>
              </Button>

              <div className="flex gap-3">
                <FormField
                  control={form.control}
                  name={`conditions.${idx}.if`}
                  render={({ field }) => (
                    <FormItem className="gap-0">
                      <FormLabel className="text-xs">If</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`conditions.${idx}.then`}
                  render={({ field }) => (
                    <FormItem className="gap-0">
                      <FormLabel className="text-xs">Then</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-9" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            size={"sm"}
            variant={"outline"}
            type="button"
            onClick={() => append({ if: "", then: "" })}
          >
            + Condition
          </Button>

          <Button
            disabled={!form.formState.isValid}
            variant={"outline"}
            className="w-full"
          >
            {!selectedVar && <Plus />}
            {selectedVar ? "Update" : "Add"}
          </Button>
        </form>
      </Form>

      <Separator />

      <div className="space-y-5">
        <Label>Variables</Label>
        {variables.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No Variables Set.
          </p>
        ) : (
          <ToggleGroup
            onValueChange={handleVarSelection}
            type="single"
            className="w-full flex-col"
            spacing={0.01}
          >
            {variables.map((item, idx) => (
              <ToggleGroupItem
                value={item.id}
                key={idx}
                className="text-xs font-medium data-[state=on]:bg-gray-200/50 data-[state=on]:border cursor-pointer w-full justify-start group"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex justify-between w-full">
                    <div>
                      <span className="medium text-blue-500">{item.name}</span>{" "}
                      = <span className="text-amber-700">{item.value}</span>
                    </div>
                    {item.conditions && item.conditions.length > 0 && (
                      <span className="text-muted-foreground">
                        + Conditions
                      </span>
                    )}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVarDelesion(item.id);
                    }}
                    className="hover:text-destructive hidden group-hover:block"
                  >
                    <Trash className="scale-[0.8]" />
                  </div>
                </div>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>
    </div>
  );
};

export default Variables;
