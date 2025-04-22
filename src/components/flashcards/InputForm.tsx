import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

const formSchema = z.object({
  text: z.string().min(1, "Tekst jest wymagany").max(1000, "Tekst nie może być dłuższy niż 1000 znaków"),
});

type FormValues = z.infer<typeof formSchema>;

interface InputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export const InputForm = ({ value, onChange, onSubmit, disabled }: InputFormProps) => {
  // Use local state to track the complete input value for tests
  const [localValue, setLocalValue] = useState(value);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: value,
    },
  });

  useEffect(() => {
    form.reset({ text: value });
    setLocalValue(value);
  }, [value, form]);

  const handleSubmit = (values: FormValues) => {
    const trimmedValue = values.text.trim();
    if (trimmedValue) {
      onSubmit(trimmedValue);
    }
  };

  // Track changes in both states to ensure tests capture the whole input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="input-form">
        <FormField
          control={form.control}
          name="text"
          render={({ field }: { field: ControllerRenderProps<FormValues, "text"> }) => (
            <FormItem>
              <FormLabel>Tekst do przetworzenia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszkę..."
                  className="min-h-[200px]"
                  disabled={disabled}
                  data-testid="input-text"
                  aria-describedby="input-description"
                  required
                  minLength={1}
                  maxLength={1000}
                  value={localValue}
                  onChange={(e) => {
                    handleChange(e);
                    field.onChange(e);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage id="input-description">
                Tekst powinien mieć od 1 do 1000 znaków.
              </FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={disabled || !localValue.trim()}>
          Generuj fiszkę
        </Button>
      </form>
    </Form>
  );
};
