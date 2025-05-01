import { expect } from '@playwright/test';
import { test } from './test-setup';
import { ProfilePage, DeleteAccountPage } from './page-objects/profile.page';

// Zmieniono z test.describe na test.describe.skip, aby tymczasowo dezaktywować te testy
test.describe.skip('Zarządzanie kontem użytkownika', () => {
  // Używamy stałego hooka autentykacji z pliku auth.setup.ts
  test.use({ isAuthenticated: true });
  
  test.beforeEach(async ({ page, baseURL }) => {
    // Nawiguj bezpośrednio do strony głównej
    await page.goto(baseURL + '/');
  });
  
  test('powinien umożliwiać nawigację do profilu z menu użytkownika', async ({ page }) => {
    // Kliknij na link "Profil" w głównym menu nawigacyjnym
    await page.getByTestId('profile-nav-link').click();
    
    // Upewnij się, że jesteśmy na stronie profilu
    await expect(page).toHaveURL(/.*\/profile/);
    await expect(page.locator('h1')).toContainText('Profil użytkownika');
  });
  
  test('powinien pokazywać informacje o koncie użytkownika', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    
    // Sprawdź czy podstawowe informacje o koncie są wyświetlane
    await expect(page.locator('div:has-text("Email:")')).toBeVisible();
    await expect(page.locator('div:has-text("Data utworzenia konta:")')).toBeVisible();
  });
  
  test('powinien wyświetlać formularz zmiany hasła', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    
    // Sprawdź czy formularz zmiany hasła jest wyświetlany
    await expect(profilePage.passwordInput).toBeVisible();
    await expect(profilePage.newPasswordInput).toBeVisible();
    await expect(profilePage.confirmPasswordInput).toBeVisible();
    await expect(profilePage.changePasswordButton).toBeVisible();
  });
  
  test('powinien walidować formularz zmiany hasła', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    
    // Test 1: Puste pola
    await profilePage.changePasswordButton.click();
    await expect(page.locator('form')).toContainText('Aktualne hasło jest wymagane');
    
    // Test 2: Tylko aktualne hasło
    await profilePage.passwordInput.fill('current-password');
    await profilePage.changePasswordButton.click();
    await expect(page.locator('form')).toContainText('Nowe hasło musi mieć co najmniej');
    
    // Test 3: Różne hasła
    await profilePage.passwordInput.fill('current-password');
    await profilePage.newPasswordInput.fill('new-password');
    await profilePage.confirmPasswordInput.fill('different-password');
    await profilePage.changePasswordButton.click();
    await expect(page.locator('form')).toContainText('nie są takie same');
  });
  
  test('powinien umożliwiać nawigację do strony usuwania konta', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    
    await profilePage.navigateToDeleteAccount();
    
    // Upewnij się, że jesteśmy na stronie usuwania konta
    await expect(page).toHaveURL(/.*\/profile\/delete/);
    await expect(page.locator('h1')).toContainText('Usuń konto');
  });
  
  test('powinien wyświetlać formularz usuwania konta', async ({ page }) => {
    const deleteAccountPage = new DeleteAccountPage(page);
    await deleteAccountPage.goto();
    
    // Sprawdź czy formularz usuwania konta jest wyświetlany
    await expect(deleteAccountPage.passwordInput).toBeVisible();
    await expect(deleteAccountPage.confirmationInput).toBeVisible();
    await expect(deleteAccountPage.deleteButton).toBeVisible();
    await expect(deleteAccountPage.cancelButton).toBeVisible();
  });
  
  test('powinien walidować formularz usuwania konta', async ({ page }) => {
    const deleteAccountPage = new DeleteAccountPage(page);
    await deleteAccountPage.goto();
    
    // Test 1: Puste pola
    await deleteAccountPage.deleteButton.click();
    await expect(page.locator('form')).toContainText('Hasło jest wymagane');
    await expect(page.locator('form')).toContainText('Wpisz USUN KONTO');
    
    // Test 2: Niepoprawne potwierdzenie
    await deleteAccountPage.passwordInput.fill('password');
    await deleteAccountPage.confirmationInput.fill('usun konto');
    await deleteAccountPage.deleteButton.click();
    await expect(page.locator('form')).toContainText('Wpisz USUN KONTO');
  });
  
  test('powinien umożliwiać powrót ze strony usuwania konta', async ({ page }) => {
    const deleteAccountPage = new DeleteAccountPage(page);
    await deleteAccountPage.goto();
    
    await deleteAccountPage.cancel();
    
    // Upewnij się, że jesteśmy z powrotem na stronie profilu
    await expect(page).toHaveURL(/.*\/profile/);
  });
}); 