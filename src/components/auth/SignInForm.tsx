'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";
import { useHydration, useFormMounting } from "@/hooks/useHydration";

type FormValues = z.infer<typeof authSchemas.login>;

interface SignInFormProps {
  redirectTo?: string;
}

export function SignInForm({ redirectTo = '' }: SignInFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { form, isLoading, error, handleSubmit } = useAuthForm<FormValues>({
    schema: authSchemas.login,
    defaultValues: {
      email: "",
      password: ""
    },
    onSubmit: async (data) => {
      try {
        await AuthService.signIn(data);
        
        // Użyj przekazanego redirectTo lub pobierz z parametrów URL
        let destination = redirectTo;
        if (!destination) {
          const params = new URLSearchParams(window.location.search);
          destination = params.get('redirect') || params.get('redirectTo') || '/flashcards';
        }
        
        // Set redirecting state to show loading in the UI
        setIsRedirecting(true);
        
        // Wait for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force page reload to ensure new session is loaded
        window.location.href = destination;
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

  const hasEmptyFields = !form.getValues('email') || !form.getValues('password');
  const isBusy = isLoading || isRedirecting;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={handleSubmit} 
            className="space-y-4" 
            data-testid="login-form" 
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
                      aria-describedby="email-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="email-description" />
                  <div className="text-xs text-muted-foreground" id="email-hint">
                    Wprowadź poprawny adres email
                  </div>
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
                      aria-describedby="password-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="password-description" />
                  <div className="text-xs text-muted-foreground" id="password-hint">
                    Hasło musi mieć minimum 8 znaków
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isBusy || hasEmptyFields}
              data-testid="login-submit"
            >
              {isBusy ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <a href="/auth/reset-password">Zapomniałeś hasła?</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
