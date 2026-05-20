import { saveDielineChanges } from "@/actions/dieline";
import {
  DielineUpdateFormType,
  dielineUpdateFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline } from "@repo/db";
import { DielineSettings } from "@repo/dieline-core/hooks/useDielineGenerator";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type DielineType = Dieline & { settings: DielineSettings };

const DielineChangesSaver = ({ dieline }: { dieline: DielineType }) => {
  const { specs } = useDielineSpecStore();
  const { variables } = useVariableStore();

  const form = useForm<DielineUpdateFormType>({
    resolver: zodResolver(dielineUpdateFormSchema as any),
    defaultValues: {
      specification: dieline.specification,
      variable: dieline.variable,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: DielineUpdateFormType) => {
    const res = saveDielineChanges(data, dieline.id);
    toast.promise(res, {
      loading: "Saving Dieline...",
      success: (res) => res.success,
      error: (res) => res.error,
    });
  };

  useEffect(() => {
    form.setValue("variable", JSON.stringify(variables));
  }, [variables]);

  useEffect(() => {
    form.setValue("specification", JSON.stringify(specs));
  }, [specs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <></>;
};

export default DielineChangesSaver;
