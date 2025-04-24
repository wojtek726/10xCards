import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class FlashcardGenerationPage extends BasePage {
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.textInput = page.getByTestId('flashcard-generation-input');
    this.generateButton = page.getByTestId('generate-flashcard-button');
    this.errorMessage = page.getByTestId('error-message');
    this.loadingSpinner = page.getByTestId('loading-spinner');
  }

  async goto() {
    await super.goto('/flashcards/generate');
    await this.ensureAuthentication();
  }

  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async waitForGeneration() {
    try {
      await expect(this.loadingSpinner).toBeVisible({timeout: 5000}).catch(() => {
        console.log('Loading spinner not visible, continuing');
      });
      
      await expect(this.loadingSpinner).not.toBeVisible({timeout: 15000}).catch(() => {
        console.log('Loading spinner did not disappear, continuing anyway');
      });
      
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.warn('Error in waitForGeneration:', error);
      await this.page.waitForTimeout(5000);
    }
  }

  getErrorMessage() {
    return this.errorMessage;
  }
} 