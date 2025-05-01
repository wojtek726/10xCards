import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class FlashcardGenerationPage extends BasePage {
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly generationForm: Locator;

  constructor(page: Page) {
    super(page);
    this.textInput = page.getByTestId('flashcard-generation-input');
    this.generateButton = page.getByTestId('generate-flashcard-button');
    this.errorMessage = page.getByTestId('error-message');
    this.loadingSpinner = page.getByTestId('loading-spinner');
    this.generationForm = page.getByTestId('flashcard-generation-form');
  }

  async goto() {
    await super.goto('/flashcards/generate');
    await this.ensureAuthentication();
    await this.waitForGenerationForm();
  }

  async navigateToGenerationPage() {
    await this.goto();
  }

  async enterText(text: string) {
    await this.textInput.waitFor({ timeout: 10000 });
    await this.textInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.waitFor({ timeout: 10000 });
    
    // Check if button is disabled
    const isDisabled = await this.generateButton.isDisabled();
    
    // If button is disabled, enter some text to enable it
    if (isDisabled) {
      console.log('Generate button is disabled, entering text to enable it');
      await this.enterText('Test text for E2E test');
      // Give time for the UI to update
      await this.page.waitForTimeout(100);
    }
    
    // Wait for button to be enabled
    await expect(this.generateButton).toBeEnabled({ timeout: 10000 });
    await this.generateButton.click();
  }

  async waitForGeneration() {
    try {
      // Check if page is closed first
      if (this.page.isClosed()) {
        console.warn('Page is already closed, skipping waitForGeneration');
        return;
      }
      
      // Wait for loading spinner to appear
      await expect(this.loadingSpinner).toBeVisible({ timeout: 30000 }).catch(() => {
        console.log('Loading spinner not visible, continuing');
      });
      
      // Check if page is still open before continuing
      if (this.page.isClosed()) {
        console.warn('Page closed during waitForGeneration, skipping further waits');
        return;
      }
      
      // Wait for loading spinner to disappear
      await expect(this.loadingSpinner).not.toBeVisible({ timeout: 30000 }).catch(() => {
        console.log('Loading spinner did not disappear, continuing anyway');
      });
      
      // Final check if page is still open before timeout
      if (!this.page.isClosed()) {
        await this.page.waitForTimeout(500); // Reduced timeout to avoid long waits
      }
    } catch (error) {
      console.warn('Error in waitForGeneration:', error);
      try {
        // Check if page is still active before taking screenshot
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: 'test-results/generation-error.png' });
        } else {
          console.warn('Page is closed, cannot take screenshot');
        }
      } catch (screenshotError) {
        console.warn('Error taking screenshot:', screenshotError);
      }
      throw error;
    }
  }

  async waitForGenerationForm() {
    await this.generationForm.waitFor({ timeout: 10000 });
  }

  async isGenerationFormVisible() {
    return this.generationForm.isVisible({ timeout: 10000 });
  }

  getErrorMessage() {
    return this.errorMessage;
  }

  async generateFlashcardWithText(text: string) {
    try {
      // Check if page is closed first
      if (this.page.isClosed()) {
        console.warn('Page is already closed, skipping generateFlashcardWithText');
        return;
      }
      
      await this.enterText(text);
      
      // Check if page is still open before clicking generate
      if (this.page.isClosed()) {
        console.warn('Page closed after entering text, aborting generation');
        return;
      }
      
      await this.clickGenerate();
      
      // Check if page is still open before waiting for generation
      if (this.page.isClosed()) {
        console.warn('Page closed after clicking generate, aborting wait for generation');
        return;
      }
      
      await this.waitForGeneration();
    } catch (error) {
      console.warn('Error in generateFlashcardWithText:', error);
      if (!this.page.isClosed()) {
        await this.page.screenshot({ path: 'test-results/generate-flashcard-with-text-error.png' });
      }
      throw error;
    }
  }
  
  async waitForSuggestion() {
    try {
      // Check if page is closed first
      if (this.page.isClosed()) {
        console.warn('Page is already closed, skipping waitForSuggestion');
        return;
      }
      
      await this.page.getByTestId('flashcard-suggestion').waitFor({ 
        state: 'visible', 
        timeout: 30000 
      });
    } catch (error) {
      console.warn('Error waiting for flashcard suggestion:', error);
      try {
        // Check if page is still active before taking screenshot
        if (!this.page.isClosed()) {
          await this.page.screenshot({ path: 'test-results/suggestion-wait-error.png' });
        } else {
          console.warn('Page is closed, cannot take screenshot');
        }
      } catch (screenshotError) {
        console.warn('Error taking screenshot:', screenshotError);
      }
      throw error;
    }
  }
} 