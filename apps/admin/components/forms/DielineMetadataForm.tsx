import { createDieline, updateDieline } from "@/actions/editor/editor";
import { handleRes } from "@/lib/utils/handleRes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dieline } from "@repo/db";
import { useLoading } from "@repo/lib/utils/useLoading";
import { useDielineSpecStore } from "@repo/store/editor/dielineSpec.store";
import { useVariableStore } from "@repo/store/editor/variables.store";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@repo/ui/components/form";
import { Spinner } from "@repo/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface FormData {
  title: string;
  slug: string;
}

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
});

const DielineMetadataForm = ({ dieline }: { dieline?: Dieline }) => {
  const router = useRouter();
  const isUpdateType = !!dieline;
  const { specs } = useDielineSpecStore();
  const { variables } = useVariableStore();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const form = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      title: dieline?.title || "Untitled",
      slug: dieline?.slug || "",
    },
  });

  const dielineData = {
    specification: JSON.stringify(specs),
    variable: JSON.stringify(variables),
  };

  const onSubmit = async ({ slug, title }: FormData) => {
    startLoading();

    const res = isUpdateType
      ? await updateDieline(
          {
            title,
            slug,
            ...dielineData,
          },
          dieline!.id,
        )
      : await createDieline({
          title,
          slug,
          ...dielineData,
        });

    handleRes(res, {
      onSuccess: () => {
        router.push(`/dielines/${slug}`);
      },
    });

    stopLoading();
  };

  useEffect(() => {
    if (isUpdateType) {
      const timeoutId = setTimeout(async () => {
        const formData = form.getValues();
        await updateDieline(
          {
            ...formData,
            ...dielineData,
          },
          dieline!.id,
        );
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [specs]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Button
          disabled={!form.formState.isValid || isLoading}
          className="w-full mb-3"
          variant={"primaryForeground"}
        >
          <Spinner isLoading={isLoading} />
          {isUpdateType ? "Save Changes" : "Create Dieline"}
        </Button>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input
                  {...field}
                  placeholder="Title"
                  className="text-lg w-full px-1 -translate-x-1 font-medium "
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input
                  {...field}
                  placeholder="slug"
                  className="text-sm w-full px-1 text-muted-foreground -translate-x-1 "
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default DielineMetadataForm;
