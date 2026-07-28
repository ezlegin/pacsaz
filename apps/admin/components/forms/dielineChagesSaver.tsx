import { saveDielineChanges } from "@/actions/dieline";
import {
  DielineUpdateFormType,
  dielineUpdateFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline, DielineSettings } from "@repo/db";
import { useAppSelector } from "@repo/store/hooks";
import { effectsSelectors } from "@repo/store/slices/effectsSlice";
import { modelsSelectors } from "@repo/store/slices/modelsSlice";
import { rulersSelectors } from "@repo/store/slices/rulersSlice";
import { shapesSelectors } from "@repo/store/slices/shapesSlice";
import { variablesSelectors } from "@repo/store/slices/variablesSlice";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type DielineType = Dieline & { settings: DielineSettings };

const DielineChangesSaver = ({ dieline }: { dieline: DielineType }) => {
  const specs = {
    shapes: useAppSelector(shapesSelectors.selectAll),
    rulers: useAppSelector(rulersSelectors.selectAll),
    models: useAppSelector(modelsSelectors.selectAll),
  };
  const variables = useAppSelector(variablesSelectors.selectAll);
  const effects = useAppSelector(effectsSelectors.selectAll);

  const form = useForm<DielineUpdateFormType>({
    resolver: zodResolver(dielineUpdateFormSchema as any),
    defaultValues: {
      specification: dieline.specification,
      variable: dieline.variable,
      effect: dieline.effect,
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
    form.setValue("effect", JSON.stringify(effects));
  }, [effects]);

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
