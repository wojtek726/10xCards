import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { useHydration, useFormMounting } from "@/hooks/useHydration";

type FormValues = z.infer<typeof authSchemas.signup>;

export default function SignUpForm() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { form, isLoading, error, handleSubmit } = useAuthForm<FormValues>({
    schema: authSchemas.signup,
    onSubmit: async (data) => {
      try {
        await AuthService.signUp({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        
        // Get redirect URL from query parameters
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo') || '/flashcards';
        
        // Set redirecting state to show loading in the UI
        setIsRedirecting(true);
        
        // Wait for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force page reload to ensure new session is loaded
        window.location.href = redirectTo;
      } catch (error) {
        // Error is handled by useAuthForm
      }
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  useHydration();
  useFormMounting(formRef);

  useEffect(() => {
    // Add hydration marker to root element
    document.documentElement.setAttribute('data-hydrated', 'true');
    
    return () => {
      document.documentElement.removeAttribute('data-hydrated');
    };
  }, []);

  const hasEmptyFields = !form.getValues('email') || !form.getValues('password') || !form.getValues('confirmPassword');
  const isBusy = isLoading || isRedirecting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Rejestracja</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4" 
            data-testid="register-form" 
            ref={formRef}
            aria-busy={isBusy}
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
                      placeholder="twoj@email.com"
                      type="email"
                      disabled={isBusy}
                      data-testid="email-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Minimum 8 znaków"
                      type="password"
                      disabled={isBusy}
                      data-testid="password-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Powtórz hasło"
                      type="password"
                      disabled={isBusy}
                      data-testid="confirm-password-input"
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
              disabled={isBusy || hasEmptyFields}
              data-testid="register-submit"
            >
              {isBusy ? "Tworzenie konta..." : "Zarejestruj się"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
