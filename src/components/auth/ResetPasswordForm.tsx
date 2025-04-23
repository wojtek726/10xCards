import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { toast } from "../ui/use-toast";
import { authSchemas } from "@/lib/validation/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { z } from "zod";

type FormValues = z.infer<typeof authSchemas.resetPassword>;

export default function ResetPasswordForm() {
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Reset hasła</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
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
