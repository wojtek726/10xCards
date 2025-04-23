import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";
import { useAuth } from "./useAuth";

interface UseAuthFormOptions<T> {
  schema: ZodSchema;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: DefaultValues<T>;
}

export const useAuthForm = <T extends Record<string, unknown>>({ 
  schema, 
  onSubmit,
  defaultValues 
}: UseAuthFormOptions<T>) => {
  const { isLoading, error, handleAuth } = useAuth();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await handleAuth(async () => {
      await onSubmit(data);
    });
  });

  return {
    form,
    isLoading,
    error,
    handleSubmit,
  };
}; 