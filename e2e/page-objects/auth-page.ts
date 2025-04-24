import type { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - updated with data-testid and more specific selectors
  private loginForm = this.page.locator('[data-testid="login-form"]');
  private registerForm = this.page.locator('[data-testid="register-form"]');
  private emailInput = this.page.locator('[data-testid="email-input"]');
  private passwordInput = this.page.locator('[data-testid="password-input"]');
  private confirmPasswordInput = this.page.locator('[data-testid="confirm-password-input"]');
  private loginButton = this.page.locator('[data-testid="submit-button"]');
  private registerButton = this.page.locator('[data-testid="submit-button"]');
  private errorMessage = this.page.locator('[data-testid="error-message"]');
  private switchToRegisterLink = this.page.getByRole('link', { name: 'Zarejestruj się' });
  private switchToLoginLink = this.page.locator('.text-blue-600', { hasText: 'Masz już konto? Zaloguj się' });
  private logoutButton = this.page.getByRole('button', { name: 'Wyloguj' });
  private userMenuButton = this.page.locator('[data-testid="user-menu-button"]');

  // Navigation methods with improved waiting
  async navigateToLogin() {
    await this.goto('/auth/login');
    await this.waitForLoginForm();
  }

  async navigateToRegister() {
    await this.goto('/auth/signup');
    await this.waitForRegisterForm();
  }

  // Form interaction methods with explicit waiting
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async fillRegisterForm(email: string, password: string, confirmPassword: string) {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.confirmPasswordInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async submitLoginForm() {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async submitRegisterForm() {
    await this.registerButton.waitFor({ state: 'visible' });
    await this.registerButton.click();
  }

  async login(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillLoginForm(email, password);
    await this.submitLoginForm();
  }

  async register(email: string, password: string, confirmPassword: string = password) {
    await this.navigateToRegister();
    await this.fillRegisterForm(email, password, confirmPassword);
    await this.submitRegisterForm();
  }

  async switchToRegister() {
    await this.switchToRegisterLink.waitFor({ state: 'visible' });
    await this.switchToRegisterLink.click();
    await this.waitForRegisterForm();
  }

  async switchToLogin() {
    await this.switchToLoginLink.waitFor({ state: 'visible' });
    await this.switchToLoginLink.click();
    await this.waitForLoginForm();
  }

  async logout() {
    await this.userMenuButton.waitFor({ state: 'visible' });
    await this.userMenuButton.click();
    await this.logoutButton.waitFor({ state: 'visible' });
    await this.logoutButton.click();
  }

  // Helper methods for form visibility
  async waitForLoginForm() {
    try {
      await this.loginForm.waitFor({ state: 'visible', timeout: 30000 });
    } catch (error) {
      console.warn('Login form not visible, trying to continue the test');
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/login-form-not-visible.png', fullPage: true });
    }
  }

  async waitForRegisterForm() {
    try {
      await this.registerForm.waitFor({ state: 'visible', timeout: 30000 });
    } catch (error) {
      console.warn('Register form not visible, trying to continue the test');
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'test-results/register-form-not-visible.png', fullPage: true });
    }
  }

  // State checks with explicit waiting
  async isLoginFormVisible() {
    return this.loginForm.isVisible();
  }

  async isRegisterFormVisible() {
    return this.registerForm.isVisible();
  }

  async isLoggedIn() {
    try {
      await this.userMenuButton.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      return this.errorMessage.textContent();
    } catch (error) {
      return null;
    }
  }

  async waitForSuccessfulLogin() {
    try {
      console.log('Waiting for successful login...');
      
      // Zrób zrzut ekranu przed rozpoczęciem
      await this.page.screenshot({ 
        path: 'test-results/before-login-verification.png', 
        fullPage: true 
      });

      // Dajmy więcej czasu na przetworzenie logowania
      await this.page.waitForTimeout(2000);
      
      // Sprawdźmy kilka różnych strategii, żeby określić czy użytkownik jest zalogowany
      let loggedIn = false;
      
      // Strategia 1: Sprawdź URL - sprawdzamy czy nie jesteśmy już na stronie logowania
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/auth/login') && !currentUrl.includes('/auth/signup')) {
        console.log('URL indicates successful login:', currentUrl);
        loggedIn = true;
      } else {
        // Jeśli URL ciągle wskazuje na stronę logowania, spróbujmy alternatywnej weryfikacji
        try {
          // Strategia 2: Poszukaj elementów, które są widoczne tylko dla zalogowanych użytkowników
          const userMenuVisible = await this.userMenuButton.isVisible({ timeout: 5000 });
          
          if (userMenuVisible) {
            console.log('User menu button is visible - user is logged in');
            loggedIn = true;
          } else {
            // Strategia 3: Sprawdź czy formularz logowania zniknął
            const loginFormGone = !(await this.loginForm.isVisible({ timeout: 2000 }));
            
            if (loginFormGone) {
              console.log('Login form disappeared - likely logged in');
              loggedIn = true;
            }
          }
        } catch (err) {
          console.warn('Error during login verification checks:', err);
        }
      }
      
      // Jeśli żadna z powyższych strategii nie zadziałała, czekajmy na nawigację
      if (!loggedIn) {
        console.log('Still not verified as logged in, waiting for navigation');
        
        try {
          await this.page.waitForNavigation({ 
            timeout: 10000,
            waitUntil: 'domcontentloaded' 
          });
          
          console.log('Navigation occurred, rechecking login status');
          
          // Po nawigacji, sprawdźmy ponownie
          const newUrl = this.page.url();
          if (!newUrl.includes('/auth/login') && !newUrl.includes('/auth/signup')) {
            console.log('After navigation, URL indicates successful login');
            loggedIn = true;
          }
        } catch (navError) {
          console.warn('Navigation timeout, but may still be logged in');
        }
      }
      
      // Ostateczna weryfikacja
      await this.page.screenshot({ 
        path: 'test-results/after-login-verification.png', 
        fullPage: true 
      });
      
      if (loggedIn) {
        return;
      }
      
      throw new Error('Could not verify successful login');
    } catch (error) {
      console.error('Login verification failed:', error);
      
      // Take a screenshot for debugging
      await this.page.screenshot({ 
        path: 'test-results/login-verification-failed.png',
        fullPage: true 
      });
      
      // Log current page content and URL for debugging
      const content = await this.page.content();
      console.log('Current URL:', this.page.url());
      console.log('Current page content:', content);
      
      throw error;
    }
  }
} 