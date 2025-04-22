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

const signUpSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
  confirmPassword: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    const { data: authData, error: authError } = await AuthService.signUp(
      data.email,
      data.password
    );

    if (authError) {
      setError(authError);
      setIsLoading(false);
      return;
    }

    // Przekierowanie na stronę logowania z informacją o potrzebie potwierdzenia emaila
    window.location.href = "/login?verification=pending";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Rejestracja</CardTitle>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              disabled={isLoading}
              aria-invalid={!!errors.confirmPassword}
              placeholder="Powtórz hasło"
            />
            {errors.confirmPassword && <InlineError message={errors.confirmPassword.message!} />}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2" />
                Tworzenie konta...
              </>
            ) : (
              "Zarejestruj się"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
