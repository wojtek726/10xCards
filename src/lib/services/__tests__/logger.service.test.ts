import { describe, it, expect } from 'vitest';
import { logger } from '../logger.service';

describe('Logger Service', () => {
  describe('testGithubActions', () => {
    it('should return the same value when not empty', () => {
      const testValue = 'test';
      expect(logger.testGithubActions(testValue)).toBe(testValue);
    });

    it('should throw error when value is empty', () => {
      expect(() => logger.testGithubActions('')).toThrow('Value cannot be empty');
    });
  });
}); 