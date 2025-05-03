import type { SupabaseClient } from '@supabase/supabase-js';
import type { FlashcardDTO } from '@/types';
import type { Database } from '@/db/database.types';

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async update(id: string, data: Partial<FlashcardDTO>, userId: string) {
    const { data: updatedFlashcard, error } = await this.supabase
      .from('flashcards')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updatedFlashcard;
  }
} 