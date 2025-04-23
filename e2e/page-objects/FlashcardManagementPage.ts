import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlashcardManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  private flashcardsList = this.page.getByTestId('flashcards-list');
  private flashcardItems = this.page.getByTestId('flashcard-item');
  private createButton = this.page.getByTestId('create-flashcard-button');
  private frontInput = this.page.getByTestId('flashcard-front-input');
  private backInput = this.page.getByTestId('flashcard-back-input');
  private saveButton = this.page.getByTestId('save-flashcard-button');
  private cancelButton = this.page.getByTestId('cancel-flashcard-button');
  private deleteButton = this.page.getByTestId('delete-flashcard-button');
  private confirmDeleteButton = this.page.getByTestId('confirm-delete-button');
  private editButton = this.page.getByTestId('edit-flashcard-button');
  private searchInput = this.page.getByTestId('search-flashcards-input');
  private searchButton = this.page.getByTestId('search-flashcards-button');
  private noResultsMessage = this.page.getByTestId('no-flashcards-message');
  private errorMessage = this.page.getByTestId('flashcard-error-message');
  private flashcardForm = this.page.getByTestId('flashcard-form');

  // Navigation
  async navigateToFlashcards() {
    await this.goto('/flashcards');
  }

  // Actions
  async createNewFlashcard(front: string, back: string) {
    await this.createButton.click();
    await this.flashcardForm.waitFor({ state: 'visible' });
    await this.frontInput.fill(front);
    await this.backInput.fill(back);
    await this.saveButton.click();
  }

  async editFlashcard(index: number, front: string, back: string) {
    const editButtons = await this.editButton.all();
    if (index < editButtons.length) {
      await editButtons[index].click();
      await this.flashcardForm.waitFor({ state: 'visible' });
      await this.frontInput.fill(front);
      await this.backInput.fill(back);
      await this.saveButton.click();
    } else {
      throw new Error(`Flashcard at index ${index} does not exist`);
    }
  }

  async deleteFlashcard(index: number) {
    const deleteButtons = await this.deleteButton.all();
    if (index < deleteButtons.length) {
      await deleteButtons[index].click();
      await this.confirmDeleteButton.waitFor({ state: 'visible' });
      await this.confirmDeleteButton.click();
    } else {
      throw new Error(`Flashcard at index ${index} does not exist`);
    }
  }

  async searchFlashcards(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async clickFlashcard(index: number) {
    const flashcards = await this.flashcardItems.all();
    if (index < flashcards.length) {
      await flashcards[index].click();
    } else {
      throw new Error(`Flashcard at index ${index} does not exist`);
    }
  }

  // State checks
  async getFlashcardsCount() {
    return await this.flashcardItems.count();
  }

  async getFlashcardContent(index: number) {
    const items = await this.flashcardItems.all();
    if (index < items.length) {
      const item = items[index];
      const front = await item.getByTestId('flashcard-front').textContent();
      const back = await item.getByTestId('flashcard-back').textContent();
      return { front, back };
    }
    return null;
  }

  async isFlashcardsListVisible() {
    return await this.flashcardsList.isVisible();
  }

  async isFlashcardFormVisible() {
    return await this.flashcardForm.isVisible();
  }

  async hasNoResults() {
    return await this.noResultsMessage.isVisible();
  }

  async getErrorMessage() {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  // Wait conditions
  async waitForFlashcardsList() {
    await this.flashcardsList.waitFor({ state: 'visible' });
  }

  async waitForFlashcardForm() {
    await this.flashcardForm.waitFor({ state: 'visible' });
  }

  async waitForFlashcardsCount(count: number) {
    await this.page.waitForFunction(
      (expectedCount) => {
        const items = document.querySelectorAll('[data-testid="flashcard-item"]');
        return items.length === expectedCount;
      },
      count
    );
  }
} 