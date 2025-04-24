import { type Page, type Locator } from '@playwright/test';

export class FlashcardsListPage {
  readonly page: Page;
  readonly flashcardsList: Locator;
  readonly flashcardItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcardsList = page.getByTestId('flashcards-list');
    this.flashcardItems = page.getByTestId('flashcard-item');
  }

  async goto() {
    await this.page.goto('/flashcards');
  }

  async getFlashcards() {
    return this.flashcardItems.all();
  }

  async getFlashcardByIndex(index: number) {
    const flashcards = await this.getFlashcards();
    return flashcards[index];
  }

  async deleteFlashcard(index: number) {
    const flashcard = await this.getFlashcardByIndex(index);
    await flashcard.getByTestId('delete-button').click();
  }

  async editFlashcard(index: number) {
    const flashcard = await this.getFlashcardByIndex(index);
    await flashcard.getByTestId('edit-button').click();
  }
} 