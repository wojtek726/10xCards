import type { FlashcardDTO } from '../../types';

interface NewFlashcard {
  front: string;
  back: string;
}

export class FlashcardService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = '/api/flashcards';
  }

  /**
   * Get all flashcards for the current user
   */
  public async getFlashcards(): Promise<FlashcardDTO[]> {
    const response = await fetch(this.baseUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Create a new flashcard
   */
  public async createFlashcard(data: NewFlashcard): Promise<FlashcardDTO> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create flashcard: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
} 