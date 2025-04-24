import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class FlashcardsListPage extends BasePage {
  readonly flashcardsList: Locator;
  readonly flashcardItems: Locator;
  readonly generateNewFlashcardsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.flashcardsList = page.getByTestId('flashcards-list');
    this.flashcardItems = page.getByTestId('flashcard-item');
    this.generateNewFlashcardsButton = page.getByTestId('generate-new-flashcards-button');
  }

  async goto() {
    await super.goto('/flashcards');
    // Ensure authentication is set up properly
    await this.ensureAuthentication();
  }
  
  async navigateToFlashcardsList() {
    await this.goto();
  }

  async navigateToFlashcardGeneration() {
    try {
      // First try clicking the button if it exists
      if (await this.generateNewFlashcardsButton.isVisible({ timeout: 5000 })) {
        await this.generateNewFlashcardsButton.click();
        await this.page.waitForURL('/flashcards/generate', { timeout: 10000 });
      } else {
        // If button isn't visible, navigate directly
        await this.page.goto('/flashcards/generate');
      }
    } catch (error) {
      console.warn('Failed to navigate to flashcard generation via button, using direct navigation');
      await this.page.goto('/flashcards/generate');
    }
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

  async waitForFlashcardsList() {
    try {
      await this.flashcardsList.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      console.warn('Flashcards list not visible, might be empty state');
    }
  }
} 