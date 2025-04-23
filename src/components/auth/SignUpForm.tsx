import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { z } from "zod";

type FormValues = z.infer<typeof authSchemas.signup>;

export default function SignUpForm() {
  const { form, isLoading, error, handleSubmit } = useAuthForm<FormValues>({
    schema: authSchemas.signup,
    onSubmit: async (data) => {
      await AuthService.signUp({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Rejestracja</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
              disabled={isLoading}
              data-testid="submit-button"
            >
              {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
