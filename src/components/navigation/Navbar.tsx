import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/services/auth.service";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const handleLogout = async () => {
    await AuthService.signOut();
    window.location.href = "/auth/login";
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
              <Button variant="outline" onClick={handleLogout}>
                Wyloguj
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