import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterService } from '../openrouter.service';
import type { ChatInput } from '../../../types';

// Mock the environment variable
vi.stubEnv('OPENROUTER_API_KEY', 'test-api-key');

// Mock the fetch function
const mockFetchResponse = {
  ok: true,
  json: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            front: "What are TypeScript interfaces?",
            back: "TypeScript interfaces define the structure of objects, enforcing a specific shape and type checking."
          })
        }
      }
    ],
    model: "openai/gpt-4",
    usage: {
      prompt_tokens: 50,
      completion_tokens: 50,
      total_tokens: 100
    }
  }),
  text: vi.fn().mockResolvedValue(""),
  status: 200,
  statusText: "OK"
};

// Setup fetch mock
vi.mock('undici', () => ({
  fetch: vi.fn(() => Promise.resolve(mockFetchResponse)),
  Response: globalThis.Response
}));

describe('OpenRouterService', () => {
  let service: OpenRouterService;
  
  beforeEach(() => {
    // Create a new instance for each test
    service = new OpenRouterService('test-api-key');
    
    // Reset the mocks
    vi.mocked(mockFetchResponse.json).mockClear();
    vi.mocked(mockFetchResponse.text).mockClear();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should send a chat completion request and parse the response', async () => {
    // Arrange
    const input: ChatInput = {
      systemMessage: 'You are a helpful assistant that creates flashcards.',
      userMessage: 'Create a flashcard about TypeScript interfaces.',
      responseFormat: {
        type: 'json_object'
      }
    };
    
    // Act
    const result = await service.sendChatCompletion(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(result.model).toBe('openai/gpt-4');
    expect(result.usage.total_tokens).toBe(100);
    
    // Parse the response to ensure it's a valid JSON
    const parsedResponse = JSON.parse(result.response);
    expect(parsedResponse).toHaveProperty('front');
    expect(parsedResponse).toHaveProperty('back');
    expect(parsedResponse.front).toBe('What are TypeScript interfaces?');
  });
}); 