import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { logger } from '../../lib/services/logger.service';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
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
              <a href="/profile" className="transition-colors hover:text-foreground/80" data-testid="profile-nav-link">
                Profil
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full px-2" 
                    onClick={toggleProfileMenu}
                    data-testid="profile-icon-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="sr-only">Profil</span>
                  </Button>
                  <div className={`absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${isProfileMenuOpen ? 'block' : 'hidden'} hover:block`}>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="profile-link">
                      Zarządzaj kontem
                    </a>
                  </div>
                </div>
              </div>
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