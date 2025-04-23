import { useState } from "react";

interface UseAuthState {
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<UseAuthState>({
    isLoading: false,
    error: null,
  });

  const handleAuth = async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    try {
      setState({ isLoading: true, error: null });
      const result = await action();
      return result;
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd" 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    handleAuth,
  };
}; 