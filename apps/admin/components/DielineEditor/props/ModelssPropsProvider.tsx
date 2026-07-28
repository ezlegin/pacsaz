import {
  doorFormSchema,
  glueFormSchema,
  snapLockFormSchema,
} from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Button } from "@repo/ui/components/button";
import { Form } from "@repo/ui/components/form";
import { Separator } from "@repo/ui/components/separator";
import { Layers2 } from "lucide-react";
import { ReactNode } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PropsHeader from "./PropsHeader";
import { DupOperationEditor } from "./shapes/DupOperationEditor";
import PointInput from "./shapes/PointInput";
import { ISpec } from "@repo/store/types";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addModel, updateModel } from "@repo/store/slices/modelsSlice";

const getModelSchema = (modelKey: ISpec.ModelsKey) => {
  const schemas: Record<ISpec.ModelsKey, any> = {
    glue: glueFormSchema,
    door: doorFormSchema,
    snapLock: snapLockFormSchema,
  };

  return schemas[modelKey];
};

interface ModelsPropsProvider<T extends ISpec.ModelsSpec> {
  data: T | null;
  children: (props: { form: any }) => ReactNode;
  close: () => void;
  modelKey: ISpec.ModelsKey;
}

function ModelsPropsProvider<T extends ISpec.ModelsSpec>({
  children,
  data,
  close,
  modelKey,
}: ModelsPropsProvider<T>) {
  const dispatch = useAppDispatch();

  const selection = useAppSelector((s) => s.selection.selection);
  const isUpdateType = !!selection;

  const schema = getModelSchema(modelKey);
  type FormType = z.infer<typeof schema>;

  const form = useForm<FormType>({
    resolver: zodResolver(schema as any),
    defaultValues: data ?? {
      stack: "model",
      key: modelKey,
      type: modelKey,
      from: ["0", "0"],
      to: ["0", "0"],
      mirror: {
        x: false,
        y: false,
      },

      id: "0",
      origin: ["0", "0"],
      hidden: false,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormType) => {
    if (isUpdateType) {
      dispatch(updateModel({ id: selection.id, changes: data }));
      toast.info("Model Updated.");
    } else {
      dispatch(addModel(data));
      toast.info("Model Created.");
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

export default ModelsPropsProvider;
