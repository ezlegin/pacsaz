"use client";

import { deleteImage } from "@/actions/cloudinary";
import { placeholder } from "@/public";
import { useLoading } from "@repo/lib/utils/useLoading";
import { Button } from "@repo/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

interface Props {
  control: any;
  setValue: any;
  public_id?: string;
  image?: string | null;
}

const ImageField = ({ control, setValue, public_id, image }: Props) => {
  //HOOKS
  const [imagePreview, setImagePreview] = useState<string | null | undefined>(
    image,
  );
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, field: any) => {
    const input = e.target;

    if (input.files?.length && input.files[0]) {
      const file = input.files[0];

      // Allowed MIME types
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const maxSize = 4 * 1024 * 1024; // 5MB in bytes

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only Image Types Are Allowed.");
        input.value = "";
        return;
      }

      if (file.size > maxSize) {
        toast.error("must be less than 4mb");
        input.value = "";
        return;
      }

      field.onChange(file);
      setImagePreview(URL.createObjectURL(file));

      input.value = "";
    }
  };

  const handleImageRemove = async () => {
    startLoading();

    if (public_id) {
      const res = await deleteImage(public_id);

      if (res.error) {
        toast.error(res.error);
        stopLoading();
        return;
      }

      if (res.success) {
        toast.success(res.success);
        setValue("image", undefined);
        stopLoading();
        router.refresh();
      }

      setImagePreview(undefined);
    } else {
      toast.error("No image to delete.");
      stopLoading();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <FormField
        control={control}
        name="image"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="relative overflow-hidden rounded-md">
              <FormLabel htmlFor="file-upload">
                <Image
                  alt=""
                  src={imagePreview || placeholder}
                  width={400}
                  height={400}
                  className="aspect-square max-w-30 rounded-sm object-cover border border-slate-400 hover:drop-shadow-md border-dashed  cursor-pointer relative "
                />
              </FormLabel>
              {imagePreview && (
                <Button
                  type="button"
                  onClick={() => handleImageRemove()}
                  variant={"outline"}
                  className="border size-6 absolute top-0 m-1 bg-white"
                  size={"icon"}
                >
                  <Trash />
                </Button>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <Spinner isLoading={isLoading} />
                </div>
              )}
            </div>

            <FormControl>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, field)}
                id="file-upload"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ImageField;
