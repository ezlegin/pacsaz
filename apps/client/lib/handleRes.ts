import { toast } from "sonner";

export function handleRes(
  res:
    | {
        success: string;
        error?: undefined;
      }
    | {
        error: string;
        success?: undefined;
      },
  options?: {
    onError?: () => void;
    onSuccess?: () => void;
  },
) {
  if (res.error) {
    toast.error(res.error);
    options && options.onError && options.onError();
    return;
  }

  if (res.success) {
    options && options.onSuccess && options.onSuccess();
    toast.success(res.success);
  }
}
