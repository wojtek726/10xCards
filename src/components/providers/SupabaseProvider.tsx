import { createContext, useContext, type ReactNode, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../db/supabase.client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import { logger } from '../../lib/services/logger.service';

type SupabaseContextType = {
  supabase: SupabaseClient<Database>;
  isLoading: boolean;
  error: Error | null;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    try {
      const client = createSupabaseBrowserClient();
      setSupabase(client);
      setIsLoading(false);
    } catch (err) {
      logger.error('Error initializing Supabase client:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        Wystąpił błąd podczas inicjalizacji: {error.message}
      </div>
    );
  }

  if (isLoading || !supabase) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 