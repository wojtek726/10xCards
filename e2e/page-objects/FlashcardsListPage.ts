import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlashcardsListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  private generateNewFlashcardsButton = this.page.getByTestId('generate-new-flashcards-button');

  // Navigation
  async navigateToFlashcardsList() {
    await this.goto('/flashcards');
  }

  // Actions
  async clickGenerateNewFlashcards() {
    await this.generateNewFlashcardsButton.click();
    await this.waitForUrl('/flashcards/generate');
  }

  // State
  async isGenerateButtonVisible() {
    return await this.generateNewFlashcardsButton.isVisible();
  }
} 