import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { InlineError } from "@/components/ui/inline-error";
import { Loader } from "@/components/ui/loader";
import { AuthService } from "@/lib/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const { data: authData, error: authError } = await AuthService.signIn(
      data.email,
      data.password
    );

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    // Get redirect URL from query parameters
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirectTo');
    
    // Redirect to the requested page or flashcards/generate as default
    window.location.href = redirectTo ? decodeURIComponent(redirectTo) : '/flashcards/generate';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <InlineError message={error} />}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")} 
              disabled={isLoading} 
              aria-invalid={!!errors.email}
              placeholder="twoj@email.com"
            />
            {errors.email && <InlineError message={errors.email.message!} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              placeholder="Minimum 8 znaków"
            />
            {errors.password && <InlineError message={errors.password.message!} />}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <a href="/auth/reset-password">Zapomniałeś hasła?</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
