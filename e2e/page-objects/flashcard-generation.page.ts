import { type Page, type Locator, expect } from '@playwright/test';

export class FlashcardGenerationPage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.getByTestId('generation-text-input');
    this.generateButton = page.getByTestId('generate-button');
    this.errorMessage = page.getByTestId('error-message');
    this.loadingSpinner = page.getByTestId('loading-spinner');
  }

  async goto() {
    await this.page.goto('/flashcards/generate');
  }

  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async waitForGeneration() {
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loadingSpinner).not.toBeVisible();
  }

  getErrorMessage() {
    return this.errorMessage.textContent();
  }
} 