import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { InlineError } from "@/components/ui/inline-error";
import { Loader } from "@/components/ui/loader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { toast } from "../ui/use-toast";

const formSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      // TODO: Implement password reset logic
      console.log('Password reset requested for:', data.email);
      toast({
        title: 'Link do resetu hasła został wysłany',
        description: 'Sprawdź swoją skrzynkę email',
      });
    } catch (error) {
      toast({
        title: 'Wystąpił błąd',
        description: 'Nie udało się zresetować hasła. Spróbuj ponownie później.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Link wysłany!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Jeśli podany login istnieje w systemie, wyślemy na przypisany do niego adres email link do zresetowania
            hasła.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <a href="/auth/login">Wróć do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: { onChange: (e: any) => void; value: string; } }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Wysyłanie...' : 'Zresetuj hasło'}
        </Button>
      </form>
    </Form>
  );
}
