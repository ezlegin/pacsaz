import { useDielineSpecStore } from "@repo/store/dieline/dielineSpec.store";
import { Button } from "@repo/ui/components/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormData {
  title: string;
  slug: string;
}

const DielineMetadataForm = () => {
  const { dielineSpec } = useDielineSpecStore();
  const dielineMetadata = {
    title: "",
    slug: "",
  }; //todo: fetch from DB

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      title: dielineMetadata?.title || "Untitled",
      slug: dielineMetadata?.slug,
    },
  });

  const onSubmit = (data: FormData) => {
    //todo: push to DB
    console.log({
      title: data.title,
      slug: data.slug,
      dielineSpec: JSON.stringify(dielineSpec),
    });
    toast.success("Saved Successfully");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Button
        disabled={!isValid}
        className="w-full mb-3"
        variant={"primaryForeground"}
      >
        Save Changes
      </Button>

      <input
        {...register("title", {
          required: "Title is required",
        })}
        className="text-lg w-full px-1 -translate-x-1 font-medium "
        placeholder="Title"
      />

      <input
        {...register("slug", {
          required: "Slug is required",
        })}
        className="text-sm w-full px-1 text-muted-foreground -translate-x-1 "
        placeholder="Slug"
      />
    </form>
  );
};

export default DielineMetadataForm;
