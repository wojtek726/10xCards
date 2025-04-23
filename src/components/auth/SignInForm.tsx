import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { z } from "zod";

type FormValues = z.infer<typeof authSchemas.login>;

export default function SignInForm() {
  const { form, isLoading, error, handleSubmit } = useAuthForm<FormValues>({
    schema: authSchemas.login,
    defaultValues: {
      email: "",
      password: ""
    },
    onSubmit: async (data) => {
      try {
        const _response = await AuthService.signIn(data);
        
        // Get redirect URL from query parameters
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo') || '/flashcards';
        
        // Wait for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force page reload to ensure new session is loaded
        window.location.replace(redirectTo);
      } catch (error) {
        // ... existing code ...
      }
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
              disabled={isLoading}
              data-testid="submit-button"
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
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
