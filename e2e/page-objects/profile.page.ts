import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ProfilePage extends BasePage {
  readonly passwordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly deleteAccountLink: Locator;

  constructor(page: Page) {
    super(page);
    
    this.passwordInput = page.getByLabel('Aktualne hasło');
    this.newPasswordInput = page.getByLabel('Nowe hasło');
    this.confirmPasswordInput = page.getByLabel('Potwierdź nowe hasło');
    this.changePasswordButton = page.getByRole('button', { name: 'Zmień hasło' });
    this.deleteAccountLink = page.getByRole('link', { name: 'Usuń konto' });
  }

  async goto() {
    await super.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await this.passwordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.changePasswordButton.click();
  }

  async navigateToDeleteAccount() {
    await this.deleteAccountLink.click();
    await this.page.waitForURL('**/profile/delete');
  }
}

export class DeleteAccountPage extends BasePage {
  readonly passwordInput: Locator;
  readonly confirmationInput: Locator;
  readonly deleteButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    
    this.passwordInput = page.getByLabel('Hasło');
    this.confirmationInput = page.getByLabel('Potwierdzenie');
    this.deleteButton = page.getByRole('button', { name: 'Usuń konto' });
    this.cancelButton = page.getByRole('button', { name: 'Anuluj' });
  }

  async goto() {
    await super.goto('/profile/delete');
    await this.page.waitForLoadState('networkidle');
  }

  async confirmDeletion(password: string) {
    await this.passwordInput.fill(password);
    await this.confirmationInput.fill('USUN KONTO');
    await this.deleteButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.page.waitForURL('**/profile');
  }
} 