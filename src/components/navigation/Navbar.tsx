import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { logger } from '../../lib/services/logger.service';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Request with proper headers for cache busting
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include' // Important for including cookies
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas wylogowywania");
      }

      // Clear local and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Dodajemy krótkie opóźnienie przed przekierowaniem
      await new Promise(resolve => setTimeout(resolve, 100));

      // Przekierowanie bez wymuszonego przeładowania
      window.location.assign("/auth/login?logout=true");
    } catch (error) {
      logger.error("Błąd podczas wylogowywania:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="text-xl font-bold">
            10x Cards
          </a>
          
          {user && (
            <div className="flex items-center space-x-6 text-sm font-medium">
              <a href="/flashcards" className="transition-colors hover:text-foreground/80">
                Moje fiszki
              </a>
              <a href="/flashcards/generate" className="transition-colors hover:text-foreground/80">
                Generuj fiszki
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <a href="/auth/login">Zaloguj się</a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 