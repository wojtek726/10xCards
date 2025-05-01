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
    await this.ensureAuthentication();
    await this.waitForPageLoad();
  }
  
  async navigateToFlashcardsList() {
    await this.goto();
  }

  async clickGenerateNewFlashcards() {
    await this.generateNewFlashcardsButton.waitFor({ timeout: 10000 });
    await this.generateNewFlashcardsButton.click();
    await this.page.waitForURL('/flashcards/generate', { timeout: 10000 });
  }

  async navigateToFlashcardGeneration() {
    try {
      await this.clickGenerateNewFlashcards();
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

  async waitForPageLoad() {
    try {
      // Wait for either the flashcards list or empty state message
      await Promise.race([
        this.flashcardsList.waitFor({ state: 'visible', timeout: 30000 }),
        this.page.getByText('Nie masz jeszcze żadnych fiszek').waitFor({ state: 'visible', timeout: 30000 })
      ]);
    } catch (error) {
      console.warn('Neither flashcards list nor empty state message is visible');
      await this.page.screenshot({ path: 'test-results/flashcards-list-not-loaded.png' });
      throw error;
    }
  }
} 