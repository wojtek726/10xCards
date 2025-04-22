import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlashcardGenerationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  private generationView = this.page.getByTestId('flashcard-generation-view');
  private generationForm = this.page.getByTestId('flashcard-generation-form');
  private inputTextarea = this.page.getByTestId('flashcard-generation-input');
  private generateButton = this.page.getByTestId('generate-flashcard-button');
  private loader = this.page.getByTestId('generation-loader');
  private errorMessage = this.page.getByTestId('generation-error');
  
  // Flashcard suggestion locators
  private flashcardSuggestion = this.page.getByTestId('flashcard-suggestion');
  private flashcardFront = this.page.getByTestId('flashcard-front');
  private flashcardBack = this.page.getByTestId('flashcard-back');
  private acceptButton = this.page.getByTestId('accept-flashcard-button');
  private rejectButton = this.page.getByTestId('reject-flashcard-button');

  // Navigation
  async navigateToGenerationPage() {
    await this.goto('/flashcards/generate');
  }

  // Form actions
  async enterText(text: string) {
    await this.inputTextarea.fill(text);
  }

  async generateFlashcard() {
    await this.generateButton.click();
  }

  async generateFlashcardWithText(text: string) {
    await this.enterText(text);
    await this.generateFlashcard();
  }

  // Flashcard suggestion actions
  async acceptFlashcard() {
    await this.acceptButton.click();
  }

  async rejectFlashcard() {
    await this.rejectButton.click();
  }

  // State checks
  async isGenerationFormVisible() {
    return await this.generationForm.isVisible();
  }

  async isLoading() {
    return await this.loader.isVisible();
  }

  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  async isSuggestionVisible() {
    return await this.flashcardSuggestion.isVisible();
  }

  async getFlashcardContent() {
    if (await this.isSuggestionVisible()) {
      const front = await this.flashcardFront.textContent();
      const back = await this.flashcardBack.textContent();
      return { front, back };
    }
    return null;
  }

  // Wait conditions
  async waitForSuggestion() {
    await this.flashcardSuggestion.waitFor({ state: 'visible' });
  }

  async waitForLoaderToDisappear() {
    await this.loader.waitFor({ state: 'hidden' });
  }
} 