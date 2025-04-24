import { createSupabaseServerInstance } from '@/db/supabase.client';
import type { FlashcardDTO } from '@/types';

export class FlashcardService {
  static async update(id: string, data: Partial<FlashcardDTO>, userId: string) {
    const supabase = createSupabaseServerInstance();
    
    const { data: updatedFlashcard, error } = await supabase
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