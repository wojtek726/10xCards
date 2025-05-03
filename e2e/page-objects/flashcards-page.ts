import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';

export class FlashcardsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToGeneration() {
    await this.page.getByTestId('create-flashcard-button').click();
    await this.page.waitForURL('**/flashcards/generate');
  }

  async navigateToList() {
    await this.page.getByTestId('flashcards-list-link').click();
    await this.page.waitForURL('**/flashcards');
  }

  async createFlashcard(front: string, back: string) {
    await this.page.getByTestId('flashcard-front-input').fill(front);
    await this.page.getByTestId('flashcard-back-input').fill(back);
    await this.page.getByTestId('save-flashcard').click();
    
    // Czekamy na potwierdzenie zapisania
    await expect(this.page.getByText('Flashcard saved successfully')).toBeVisible();
  }

  async editFlashcard(oldText: string, newText: string) {
    await this.page.getByText(oldText).click();
    await this.page.getByTestId('edit-flashcard').click();
    await this.page.getByTestId('flashcard-front-input').fill(newText);
    await this.page.getByTestId('save-changes').click();
    
    // Weryfikacja edycji
    await expect(this.page.getByText(newText)).toBeVisible();
  }

  async deleteFlashcard(text: string) {
    await this.page.getByText(text).click();
    await this.page.getByTestId('delete-flashcard').click();
    await this.page.getByTestId('confirm-delete').click();
    
    // Weryfikacja usunięcia
    await expect(this.page.getByText(text)).not.toBeVisible();
  }

  async generateFlashcard(text: string) {
    await this.page.getByTestId('flashcard-input').fill(text);
    await this.page.getByTestId('generate-button').click();
    
    // Czekamy na wygenerowanie
    await expect(this.page.getByTestId('flashcard-preview')).toBeVisible();
  }
} 