import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setIsLoading(true);

    try {
      console.log("Starting login process for:", email);
      
      // Send request to login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: email, password }),
        credentials: "include", // Important - ensures cookies are sent and received
      });

      const data = await response.json();
      console.log("Login API response:", { status: response.status, ok: response.ok });

      if (!response.ok) {
        throw new Error(data.error || "Error during login process");
      }

      // Check if server returned appropriate information
      if (!data.user) {
        console.error("Missing user data in API response", data);
        throw new Error("Server returned incomplete user data");
      }

      // Get redirectTo parameter from URL
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo") || "/flashcards";
      console.log("After login redirecting to:", redirectTo);
      
      // Short delay to ensure cookies are properly set
      setDebugInfo("Redirecting in 1 second...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the chosen page after login
      window.location.href = redirectTo;
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Log In</h1>
        <p className="text-muted-foreground">
          Enter your login credentials to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {debugInfo && (
          <Alert>
            <AlertDescription>{debugInfo}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </div>
  );
}
