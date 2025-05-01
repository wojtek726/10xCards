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
    
    this.passwordInput = page.locator('input[name="currentPassword"]');
    this.newPasswordInput = page.locator('input[name="newPassword"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.changePasswordButton = page.locator('form:has(input[name="newPassword"]) button[type="submit"]');
    this.deleteAccountLink = page.locator('a[href="/profile/delete"]');
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
    await this.deleteAccountLink.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await this.deleteAccountLink.click({ force: true });
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
    
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmationInput = page.locator('input[name="confirmation"]');
    this.deleteButton = page.locator('button[type="submit"][variant="destructive"]');
    this.cancelButton = page.locator('button[type="button"][variant="outline"]');
  }

  async goto() {
    await super.goto('/profile/delete');
    await this.page.waitForLoadState('networkidle');
  }

  async confirmDeletion(password: string) {
    await this.passwordInput.fill(password);
    await this.confirmationInput.fill('USUN KONTO');
    await this.deleteButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await this.deleteButton.click({ force: true });
  }

  async cancel() {
    await this.cancelButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    await this.cancelButton.click({ force: true });
    await this.page.waitForURL('**/profile');
  }
} 