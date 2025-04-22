import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/home-page';

test.describe('Home page', () => {
  test('should load the home page successfully', async ({ page }) => {
    // Arrange
    const homePage = new HomePage(page);
    
    // Act
    await homePage.goto();
    
    // Assert
    await homePage.isVisible();
    await expect(page).toHaveURL('/');
    await expect(page).toHaveScreenshot('home-page.png');
  });
}); 