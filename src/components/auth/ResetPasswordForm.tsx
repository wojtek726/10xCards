import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { toast } from "../ui/use-toast";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useEffect, useRef } from "react";
import type { z } from "zod";
import { useHydration, useFormMounting } from "@/hooks/useHydration";

type FormValues = z.infer<typeof authSchemas.resetPassword>;

export default function ResetPasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  
  const { form, isLoading, error, handleSubmit } = useAuthForm<FormValues>({
    schema: authSchemas.resetPassword,
    onSubmit: async (data) => {
      await AuthService.resetPassword(data.email);
      toast({
        title: "Link do resetu hasła został wysłany",
        description: "Sprawdź swoją skrzynkę email",
      });
    },
  });

  useHydration();
  useFormMounting(formRef);

  useEffect(() => {
    // Add hydration marker to root element
    document.documentElement.setAttribute('data-hydrated', 'true');
    
    return () => {
      document.documentElement.removeAttribute('data-hydrated');
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reset hasła</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            data-testid="reset-password-form"
            ref={formRef}
            aria-busy={isLoading}
          >
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md" data-testid="error-message">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      disabled={isLoading}
                      data-testid="email-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="reset-password-submit"
            >
              {isLoading ? "Wysyłanie..." : "Zresetuj hasło"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <a href="/auth/login">Wróć do logowania</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
