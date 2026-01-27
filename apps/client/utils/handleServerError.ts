export type ServerErrorResult = {
  success: false;
  message: string;
};

export function handleServerError(
  error: unknown,
  fileName = "ServerError",
  fallbackMessage = "Unexpected server error."
): ServerErrorResult {
  console.error(`[${fileName}]`, error);

  return {
    success: false,
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}
