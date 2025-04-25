import type { APIRoute } from 'astro';
import { supabaseClient, createSupabaseServerInstance } from '@/db/supabase.client';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

// Ensure API route is not prerendered and processed as a server endpoint
export const prerender = false;

// Schemat walidacyjny dla usuwania konta
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Hasło jest wymagane do weryfikacji")
});

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    logger.info("Rozpoczynanie obsługi żądania DELETE /api/auth/account");
    
    // Używamy instancji serwera z cookies do autoryzacji
    const supabase = createSupabaseServerInstance({ request, cookies });
    logger.info("Utworzono instancję Supabase dla autoryzacji użytkownika");
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      logger.warn("Błąd autoryzacji przy próbie usunięcia konta", { error: authError.message });
      return new Response(
        JSON.stringify({ error: "Brak uprawnień", details: authError.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      logger.warn("Próba usunięcia konta bez zalogowanego użytkownika");
      return new Response(
        JSON.stringify({ error: "Brak uprawnień - użytkownik nie zalogowany" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info("Użytkownik zautoryzowany", { userId: user.id, email: user.email });

    // Parsujemy dane wejściowe z ciała zapytania
    let requestData;
    try {
      requestData = await request.json();
      logger.info("Odczytano dane z ciała zapytania", { hasPassword: !!requestData?.password });
    } catch (error) {
      logger.warn("Błąd parsowania ciała zapytania", { error });
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane w zapytaniu" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Walidacja danych
    const result = deleteAccountSchema.safeParse(requestData);
    if (!result.success) {
      logger.warn("Nieprawidłowe dane do usunięcia konta", {
        userId: user.id,
        errors: result.error.format()
      });
      
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane", issues: result.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { password } = result.data;
    logger.info("Dane zapytania zwalidowane poprawnie");
    
    // Weryfikacja hasła
    logger.info("Weryfikacja hasła użytkownika", { email: user.email });
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email as string,
      password: password
    });

    if (signInError) {
      logger.warn("Nieprawidłowe hasło przy próbie usunięcia konta", { 
        userId: user.id,
        error: signInError.message
      });
      
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe hasło" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info("Hasło zweryfikowane pomyślnie", { userId: user.id });
    
    const userId = user.id;
    logger.info("Rozpoczęto proces usuwania konta", { userId });

    try {
      // Tworzenie instancji supabase z uprawnieniami administratora
      logger.info("Tworzenie instancji administratora Supabase z uprawnieniami service_role");
      const adminSupabase = createSupabaseServerInstance({ 
        request, 
        cookies, 
        useServiceRole: true 
      });
      
      // Wykonujemy zapytanie SQL bezpośrednio, aby zapewnić prawidłową kolejność usuwania
      logger.info("Wykonanie rpc do usunięcia konta użytkownika", { userId });
      
      // Najpierw sprawdźmy dane użytkownika dla logowania
      const { data: userData, error: userDataError } = await adminSupabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userDataError) {
        logger.warn("Błąd podczas pobierania danych użytkownika", {
          userId,
          error: userDataError.message
        });
      } else {
        logger.info("Pobrano dane użytkownika", {
          userId,
          email: userData.email,
          hasData: !!userData
        });
      }
      
      // 1. Najpierw usuwamy fiszki użytkownika
      logger.info("Usuwanie powiązanych fiszek użytkownika", { userId });
      const { error: deleteFlashcardsError } = await adminSupabase
        .from('flashcards')
        .delete()
        .eq('user_id', userId);
      
      if (deleteFlashcardsError) {
        logger.error("Błąd podczas usuwania fiszek użytkownika", { 
          userId, 
          error: deleteFlashcardsError.message,
          code: deleteFlashcardsError.code
        });
        // Kontynuujemy mimo błędu
      }
      
      // 2. Potem usuwamy dane z tabeli public.users
      logger.info("Usuwanie danych z tabeli public.users", { userId });
      const { error: deletePublicUserError } = await adminSupabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (deletePublicUserError) {
        logger.error("Błąd podczas usuwania danych z public.users", { 
          userId, 
          error: deletePublicUserError.message,
          code: deletePublicUserError.code
        });
        // Kontynuujemy mimo błędu
      }
      
      // 3. Na końcu usuwamy użytkownika z Supabase Auth
      logger.info("Wywołanie admin.deleteUser aby usunąć użytkownika z auth.users", { userId });
      const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

      if (deleteError) {
        logger.error("Błąd podczas usuwania konta użytkownika z auth.users", {
          userId,
          error: deleteError.message,
          code: deleteError.code
        });

        return new Response(
          JSON.stringify({ 
            error: "Wystąpił błąd podczas usuwania konta", 
            details: deleteError.message
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Po usunięciu, sprawdzamy czy rzeczywiście user został usunięty z auth
      try {
        const { data: authUsers, error: authUsersError } = await adminSupabase.auth.admin.listUsers();
        
        if (authUsersError) {
          logger.error("Błąd podczas pobierania listy użytkowników po usunięciu", {
            error: authUsersError.message
          });
        } else {
          const deletedUserStillExists = authUsers.users.some(u => u.id === userId);
          logger.info("Sprawdzenie czy użytkownik został usunięty", {
            userWasDeleted: !deletedUserStillExists,
            totalUsersCount: authUsers.users.length
          });
          
          if (deletedUserStillExists) {
            logger.warn("Użytkownik nadal istnieje mimo próby usunięcia!", { userId });
          }
        }
      } catch (checkError) {
        logger.error("Błąd podczas sprawdzania użytkowników po usunięciu", {
          error: checkError instanceof Error ? checkError.message : String(checkError)
        });
      }
    } catch (adminError) {
      logger.error("Wyjątek podczas usuwania konta przez admin API", {
        userId,
        error: adminError instanceof Error ? adminError.message : String(adminError)
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Wystąpił błąd podczas usuwania konta", 
          details: adminError instanceof Error ? adminError.message : "Nieznany błąd"
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Wyczyść ciasteczka sesji
    logger.info("Czyszczenie ciasteczek sesji");
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });

    logger.info("Konto użytkownika zostało pomyślnie usunięte", { userId });

    return new Response(
      JSON.stringify({ success: true, message: "Konto zostało usunięte" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas usuwania konta", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({ 
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Nieznany błąd"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const all: APIRoute = ({ request }) => {
  return new Response(null, {
    status: 405,
    headers: {
      'Allow': 'DELETE'
    }
  });
}; 