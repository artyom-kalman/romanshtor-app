import { useMutation, useAction } from "convex/react";
import { toast } from "sonner";

export function useServerMutation(...args: Parameters<typeof useMutation>) {
  const mutation = useMutation(...args);
  return async (...mutationArgs: Parameters<typeof mutation>) => {
    try {
      return await mutation(...mutationArgs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
      throw error;
    }
  };
}

export function useServerAction(...args: Parameters<typeof useAction>) {
  const action = useAction(...args);
  return async (...actionArgs: Parameters<typeof action>) => {
    try {
      return await action(...actionArgs);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
      throw error;
    }
  };
}
