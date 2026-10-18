import { groupFormSchema } from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@repo/store/hooks";
import { updateNode } from "@repo/store/slices/nodesSlice";
import { ISpec } from "@repo/store/types";
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
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PropsHeader from "./PropsHeader";
import { DupOperationEditor } from "./shapes/DupOperationEditor";
import PointInput from "./shapes/PointInput";

interface Props {
  data: ISpec.Group;
  close: () => void;
}

/**
 * Props panel for a selected group.
 *
 * Groups have no geometry of their own (no origin / layer), so this only exposes
 * the group name plus the shared `dup` editor — the same duplicate operations that
 * shapes get (mirror, move, moveTo, zero, center, rotate, scale).
 */
function GroupsPropsProvider({ data, close }: Props) {
  const dispatch = useAppDispatch();

  type FormType = z.infer<typeof groupFormSchema>;

  const form = useForm<FormType>({
    resolver: zodResolver(groupFormSchema) as any,
    // Groups authored before `origin` existed have none; start them at zero so the
    // form is always valid.
    defaultValues: {
      ...(data as unknown as FormType),
      origin: data.origin ?? ["0", "0"],
    },
    mode: "onChange",
  });

  const onSubmit = (values: FormType) => {
    dispatch(
      updateNode({
        id: data.id,
        changes: values as unknown as Partial<ISpec.Node>,
      }),
    );
    toast.info("Group Updated.");
  };

  const { append, remove, fields } = useFieldArray({
    name: "dup",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PropsHeader form={form} close={close} />

        <Separator />

        <PointInput
          form={form}
          label="Origin"
          nameX="origin.0"
          nameY="origin.1"
        />

        <Separator />

        <Accordion
          defaultValue={fields[0]?.id ?? ""}
          collapsible
          type="single"
        >
          {fields.map((field, idx) => (
            <AccordionItem key={idx} value={field.id ?? String(idx)}>
              <AccordionTrigger className="py-2 group">
                <div className="flex justify-between w-full">
                  <div>Dup-{idx + 1}</div>
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
          onClick={() => append({ operations: [] })}
          size={"sm"}
          variant={"outline"}
          className="w-full"
          type="button"
        >
          <Layers2 />
          Duplicate
        </Button>

        <Separator />
      </form>
    </Form>
  );
}

export default GroupsPropsProvider;
