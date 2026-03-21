import { useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { FunctionReference, OptionalRestArgs, FunctionReturnType } from "convex/server";

export function useServerMutation<M extends FunctionReference<"mutation">>(
  mutation: M,
) {
  const mutationFn = useMutation(mutation);
  return async (...args: OptionalRestArgs<M>): Promise<FunctionReturnType<M>> => {
    try {
      return await mutationFn(...args);
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка, попробуйте снова");
      throw error;
    }
  };
}

export function useServerAction<A extends FunctionReference<"action">>(
  action: A,
) {
  const actionFn = useAction(action);
  return async (...args: OptionalRestArgs<A>): Promise<FunctionReturnType<A>> => {
    try {
      return await actionFn(...args);
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка, попробуйте снова");
      throw error;
    }
  };
}
