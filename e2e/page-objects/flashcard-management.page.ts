import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TEST_CONFIG } from '../test.config';

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
    await this.page.waitForLoadState('networkidle');
    await this.waitForFlashcardsList();
  }

  // Actions
  async createNewFlashcard(front: string, back: string) {
    try {
      await this.createButton.click();
      await this.flashcardForm.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUTS.ELEMENT });
      
      await this.frontInput.fill(front);
      await this.backInput.fill(back);
      
      // Wait for form validation
      await this.page.waitForTimeout(500);
      
      await this.saveButton.click();
      
      // Wait for success message
      await expect(this.page.getByText('Flashcard created successfully')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });
    } catch (error) {
      console.error('Failed to create flashcard:', error);
      await this.page.screenshot({ path: 'test-results/create-flashcard-error.png' });
      throw error;
    }
  }

  async editFlashcard(index: number, front: string, back: string) {
    try {
      const editButtons = await this.editButton.all();
      if (index >= editButtons.length) {
        throw new Error(`Flashcard at index ${index} does not exist`);
      }

      await editButtons[index].click();
      await this.flashcardForm.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUTS.ELEMENT });
      
      await this.frontInput.clear();
      await this.frontInput.fill(front);
      await this.backInput.clear();
      await this.backInput.fill(back);
      
      // Wait for form validation
      await this.page.waitForTimeout(500);
      
      await this.saveButton.click();
      
      // Wait for success message
      await expect(this.page.getByText('Flashcard updated successfully')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });
    } catch (error) {
      console.error('Failed to edit flashcard:', error);
      await this.page.screenshot({ path: 'test-results/edit-flashcard-error.png' });
      throw error;
    }
  }

  async deleteFlashcard(index: number) {
    try {
      const deleteButtons = await this.deleteButton.all();
      if (index >= deleteButtons.length) {
        throw new Error(`Flashcard at index ${index} does not exist`);
      }

      await deleteButtons[index].click();
      await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: TEST_CONFIG.TIMEOUTS.ELEMENT });
      await this.confirmDeleteButton.click();
      
      // Wait for success message
      await expect(this.page.getByText('Flashcard deleted successfully')).toBeVisible({
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
      });
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
      await this.page.screenshot({ path: 'test-results/delete-flashcard-error.png' });
      throw error;
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
    await this.waitForFlashcardsList();
    return await this.flashcardItems.count();
  }

  async getFlashcardContent(index: number) {
    try {
      await this.waitForFlashcardsList();
      const items = await this.flashcardItems.all();
      
      if (index >= items.length) {
        throw new Error(`Flashcard at index ${index} does not exist`);
      }

      const item = items[index];
      const front = await item.getByTestId('flashcard-front').textContent();
      const back = await item.getByTestId('flashcard-back').textContent();
      
      return { front, back };
    } catch (error) {
      console.error('Failed to get flashcard content:', error);
      await this.page.screenshot({ path: 'test-results/get-content-error.png' });
      throw error;
    }
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
    try {
      await this.flashcardsList.waitFor({ 
        state: 'visible', 
        timeout: TEST_CONFIG.TIMEOUTS.ELEMENT 
      });
    } catch (error) {
      // If the list is not visible, check if we have the no results message
      const hasNoResults = await this.noResultsMessage.isVisible();
      if (!hasNoResults) {
        throw error;
      }
    }
  }

  async waitForFlashcardForm() {
    await this.flashcardForm.waitFor({ state: 'visible' });
  }

  async waitForFlashcardsCount(expectedCount: number) {
    try {
      await this.page.waitForFunction(
        (count) => {
          const items = document.querySelectorAll('[data-testid="flashcard-item"]');
          return items.length === count;
        },
        expectedCount,
        { timeout: TEST_CONFIG.TIMEOUTS.ELEMENT }
      );
    } catch (error) {
      console.error(`Failed to wait for flashcard count (expected: ${expectedCount}):`, error);
      await this.page.screenshot({ path: `test-results/wait-count-error-${expectedCount}.png` });
      throw error;
    }
  }
} 