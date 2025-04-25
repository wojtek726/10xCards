import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthService } from '@/lib/services/auth.service';
import { toast } from '@/components/ui/use-toast';

// Schemat walidacji formularza
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Aktualne hasło jest wymagane"),
  newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków"),
  confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Nowe hasło i potwierdzenie nie są takie same",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof passwordChangeSchema>;

export default function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (values: FormValues) => {
    console.log("Password change form submission started", { 
      hasCurrentPassword: !!values.currentPassword,
      newPasswordLength: values.newPassword.length,
      doPasswordsMatch: values.newPassword === values.confirmPassword
    });
    
    // Reset previous errors
    setFormError(null);
    
    // Validate passwords match
    if (values.newPassword !== values.confirmPassword) {
      setFormError("Nowe hasło i potwierdzenie nie są takie same");
      console.error("Password mismatch in form submission");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Calling AuthService.changePassword");
      
      const success = await AuthService.changePassword(
        values.currentPassword,
        values.newPassword
      );

      console.log("Password change result:", success);
      
      if (success) {
        toast({
          title: "Hasło zostało zmienione",
          description: "Twoje hasło zostało pomyślnie zaktualizowane",
          variant: "default"
        });
        form.reset();
      } else {
        toast({
          title: "Błąd zmiany hasła",
          description: "Sprawdź, czy aktualne hasło jest poprawne",
          variant: "destructive"
        });
        setFormError("Nie udało się zmienić hasła. Sprawdź czy aktualne hasło jest poprawne.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się zmienić hasła. Spróbuj ponownie później.",
        variant: "destructive"
      });
      setFormError("Wystąpił błąd techniczny. Spróbuj ponownie później.");
    } finally {
      setIsLoading(false);
      console.log("Password change form submission completed");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit event triggered");
    
    // Validate form before submission
    const isValid = form.formState.isValid;
    console.log("Form state before submission:", { 
      isValid,
      errors: form.formState.errors,
      isDirty: form.formState.isDirty 
    });
    
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formError}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktualne hasło</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Wprowadź aktualne hasło"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nowe hasło</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Wprowadź nowe hasło"
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
              <FormLabel>Potwierdź nowe hasło</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Potwierdź nowe hasło"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          onClick={() => console.log("Button clicked")}
        >
          {isLoading ? "Zmieniam hasło..." : "Zmień hasło"}
        </Button>
      </form>
    </Form>
  );
} 