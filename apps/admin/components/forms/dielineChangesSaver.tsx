import { saveDielineChanges } from "@/actions/dieline";
import {
  DielineUpdateFormType,
  dielineUpdateFormSchema,
} from "@/lib/validationSchema/validatoinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline, DielineSettings } from "@repo/db";
import { getNodes } from "@repo/store/getters";
import { useAppDispatch, useAppSelector } from "@repo/store/hooks";
import { rulersSelectors } from "@repo/store/slices/rulersSlice";
import { variablesSelectors } from "@repo/store/slices/variablesSlice";
import {
  foldConfigSelectors,
  setFoldConfigFaceCount,
} from "@repo/store/slices/foldConfigSlice";
import {
  buildFoldRig,
  extractSegmentsFromSvg,
  parseFoldConfig,
} from "@repo/dieline-3d/geometry";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type DielineType = Dieline & { settings: DielineSettings };

const DielineChangesSaver = ({ dieline }: { dieline: DielineType }) => {
  const dispatch = useAppDispatch();

  const specs = {
    nodes: getNodes(),
    rulers: useAppSelector(rulersSelectors.selectAll),
  };
  const variables = useAppSelector(variablesSelectors.selectAll);
  const foldJson = useAppSelector(foldConfigSelectors.json);
  const svg = useAppSelector((state) => state.svg.svg);

  const form = useForm<DielineUpdateFormType>({
    resolver: zodResolver(dielineUpdateFormSchema as any),
    defaultValues: {
      specification: dieline.specification,
      variable: dieline.variable,
      foldConfig: dieline.settings?.foldConfig ?? "",
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
    form.setValue("foldConfig", foldJson);
  }, [foldJson]);

  /**
   * Record the panel count the folds were authored against, so a later change to
   * the template can be reported instead of silently misapplying directions.
   */
  useEffect(() => {
    if (!svg) return;

    try {
      const segments = extractSegmentsFromSvg(svg);
      if (segments.length === 0) return;

      const rig = buildFoldRig(segments, parseFoldConfig(foldJson));
      // Windows are cut-outs, so the authored count is panels only.
      const panelCount = rig.nodes.filter((node) => !node.isHole).length;
      dispatch(setFoldConfigFaceCount(panelCount));

      const config = parseFoldConfig(foldJson);
      if (config && config.faceCount !== panelCount) {
        // Stamp the current count onto the stored config.
        form.setValue(
          "foldConfig",
          JSON.stringify({ ...config, faceCount: panelCount }),
        );
      }
    } catch {
      // A rig is best-effort here; never block saving on it.
    }
  }, [svg, foldJson, dispatch, form]);

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
