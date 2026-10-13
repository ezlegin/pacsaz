import {
  fromModelNode,
  modelChildMirror,
  modelPropsComponents,
  toModelParams,
} from "@/lib/models/registry";
import { modelFormSchemas } from "@/lib/validationSchema/PropsSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { addNode, updateNode } from "@repo/store/slices/nodesSlice";
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
import { nanoid } from "nanoid";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import PropsHeader from "./PropsHeader";
import { DupOperationEditor } from "./shapes/DupOperationEditor";
import PointInput from "./shapes/PointInput";

interface Props {
  /** Model being edited, or null when creating a new one from the Tools list. */
  data: ISpec.Model | null;
  modelKey: ISpec.ModelKey;
  /** Defaults used when creating. */
  initialValues: Record<string, unknown>;
  close: () => void;
}

/**
 * Props panel for a model node.
 *
 * Models are opaque: the panel exposes the model's own params plus the shared dup
 * editor, and never reaches into the generated geometry. `params` is what the
 * Drawer rebuilds the real geometry from on every render.
 */
function ModelsPropsProvider({ data, modelKey, initialValues, close }: Props) {
  const dispatch = useAppDispatch();

  const selection = useAppSelector((s) => s.selection.selection);
  const isUpdate = !!selection && !!data;

  const schema = modelFormSchemas[modelKey];

  const Params = modelPropsComponents[modelKey];

  // Both the schema and the params component vary by model kind, so the form is
  // typed loosely here and narrowed when the node is written back.
  const form = useForm<Record<string, any>, any, Record<string, any>>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: (data ? fromModelNode(data) : initialValues) as never,
    mode: "onChange",
  });

  const onSubmit = (values: Record<string, any>) => {
    const flat = values as Record<string, unknown>;

    if (isUpdate && data) {
      dispatch(
        updateNode({
          id: data.id,
          changes: {
            key: flat.key,
            hidden: flat.hidden,
            origin: flat.origin,
            dup: flat.dup,
            params: toModelParams(flat),
          } as unknown as Partial<ISpec.Node>,
        }),
      );
      toast.info("Model Updated.");
      return;
    }

    const node: ISpec.Model = {
      id: nanoid(),
      type: "model",
      stack: "model",
      modelKey,
      key: (flat.key as string) || modelKey,
      hidden: !!flat.hidden,
      origin: (flat.origin as ISpec.Point) ?? ["0", "0"],
      params: toModelParams(flat),
      nodes: [],
      effects: [],
    };

    // Children are a mirror only; the engine rebuilds real geometry from params.
    node.nodes = modelChildMirror(node);

    dispatch(addNode(node));
    toast.info("Model Created.");
    close();
  };

  const { append, remove, fields } = useFieldArray({
    name: "dup",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PropsHeader form={form} close={close} />

        <Params form={form} />

        <Separator />

        <PointInput
          form={form}
          label="Origin"
          nameX="origin.0"
          nameY="origin.1"
        />

        {isUpdate && (
          <>
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
          </>
        )}

        <Separator />
      </form>
    </Form>
  );
}

export default ModelsPropsProvider;
