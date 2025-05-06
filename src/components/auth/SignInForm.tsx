import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface SignInFormProps {
  redirectTo?: string;
}

export function SignInForm({ redirectTo = '/flashcards' }: SignInFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState: { errors, isValid } } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = form.getValues();

    if (!isValid) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsSubmitting(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas logowania');
      }
      
      // Show success message
      setSuccess('Login successful');
      
      // Wait for a moment to show the success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect after successful login
      window.location.href = redirectTo;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieznany błąd podczas logowania';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return null;
  }

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
          >
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md" data-testid="error-message">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md" data-testid="success-message">
                {success}
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
                      disabled={isSubmitting}
                      data-testid="email"
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
                      disabled={isSubmitting}
                      data-testid="password"
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
              disabled={isSubmitting || !isValid}
              data-testid="submit"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Logowanie...
                </span>
              ) : (
                "Zaloguj się"
              )}
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
