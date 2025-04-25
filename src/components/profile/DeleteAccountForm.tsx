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
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Hasło jest wymagane do potwierdzenia"),
  confirmation: z.literal('USUN KONTO', {
    errorMap: () => ({ message: "Wpisz USUN KONTO (wielkimi literami) aby potwierdzić" })
  })
});

type FormValues = z.infer<typeof deleteAccountSchema>;

export default function DeleteAccountForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: '',
      confirmation: '' as 'USUN KONTO'
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Dodatkowe potwierdzenie przed usunięciem
      if (!window.confirm("Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna.")) {
        setIsLoading(false);
        return;
      }

      const success = await AuthService.deleteAccount(values.password);

      if (success) {
        toast({
          title: "Konto zostało usunięte",
          description: "Nastąpi przekierowanie na stronę główną...",
          variant: "default"
        });
        
        // Po pomyślnym usunięciu konta, przekieruj na stronę główną po krótkiej chwili
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        toast({
          title: "Błąd usuwania konta",
          description: "Sprawdź, czy hasło jest poprawne",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się usunąć konta. Spróbuj ponownie później.",
        variant: "destructive"
      });
      console.error("Błąd usuwania konta:", error);
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Wprowadź swoje hasło"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdzenie</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Wpisz USUN KONTO"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2 flex justify-between">
          <Button type="button" variant="outline" onClick={() => window.location.href = '/profile'}>
            Anuluj
          </Button>
          <Button type="submit" variant="destructive" disabled={isLoading}>
            {isLoading ? "Trwa usuwanie konta..." : "Usuń konto"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 