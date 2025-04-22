import { test, expect } from '@playwright/test';
import { FlashcardsListPage, FlashcardGenerationPage } from './page-objects';

test.describe('Flashcard Generation Flow', () => {
  test('should generate and accept a new flashcard', async ({ page }) => {
    // Arrange
    const listPage = new FlashcardsListPage(page);
    const generationPage = new FlashcardGenerationPage(page);
    const testText = 'Test input text for flashcard generation';

    // Act - Navigate to flashcards list and click generate button
    await listPage.navigateToFlashcardsList();
    await expect(page).toHaveURL('/flashcards');
    
    await listPage.clickGenerateNewFlashcards();
    await expect(page).toHaveURL('/flashcards/generate');

    // Act - Generate flashcard
    await generationPage.generateFlashcardWithText(testText);
    
    // Assert - Check loading state
    await expect(async () => {
      const isLoading = await generationPage.isLoading();
      expect(isLoading).toBeTruthy();
    }).toPass();

    // Wait for generation to complete
    await generationPage.waitForLoaderToDisappear();
    await generationPage.waitForSuggestion();

    // Assert - Verify flashcard content is visible
    const isSuggestionVisible = await generationPage.isSuggestionVisible();
    expect(isSuggestionVisible).toBeTruthy();

    // Get and verify flashcard content
    const content = await generationPage.getFlashcardContent();
    expect(content).toBeTruthy();
    expect(content?.front).toBeTruthy();
    expect(content?.back).toBeTruthy();

    // Act - Accept the flashcard
    await generationPage.acceptFlashcard();

    // Assert - Form should be reset
    await expect(async () => {
      const formContent = await page.inputValue('[data-test-id="flashcard-generation-input"]');
      expect(formContent).toBe('');
    }).toPass();
  });

  test('should be able to reject a generated flashcard', async ({ page }) => {
    // Arrange
    const generationPage = new FlashcardGenerationPage(page);
    const testText = 'Test input text for flashcard generation';

    // Act - Navigate directly to generation page
    await generationPage.navigateToGenerationPage();
    await generationPage.generateFlashcardWithText(testText);

    // Wait for generation to complete
    await generationPage.waitForLoaderToDisappear();
    await generationPage.waitForSuggestion();

    // Act - Reject the flashcard
    await generationPage.rejectFlashcard();

    // Assert - Suggestion should disappear but input should remain
    await expect(async () => {
      const isSuggestionVisible = await generationPage.isSuggestionVisible();
      expect(isSuggestionVisible).toBeFalsy();
    }).toPass();

    // Input text should still be present
    const inputValue = await page.inputValue('[data-test-id="flashcard-generation-input"]');
    expect(inputValue).toBe(testText);
  });

  test('should handle validation errors', async ({ page }) => {
    // Arrange
    const generationPage = new FlashcardGenerationPage(page);
    
    // Act - Try to generate with empty text
    await generationPage.navigateToGenerationPage();
    await generationPage.generateFlashcard(); // Don't enter any text

    // Assert - Should show validation error
    const errorMessage = await generationPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Tekst jest wymagany');
  });
}); 