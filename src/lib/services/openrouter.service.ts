import type { ChatInput, ChatResponse, ModelParameters, RequestPayload } from "../../types";
import { OpenRouterError, OpenRouterErrorCode } from "../../types";
import { fetch, Response } from "undici";

interface OpenRouterAPIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModelName: string;
  private defaultModelParameters: ModelParameters;
  private readonly retryConfig: RetryConfig;

  constructor(apiKey?: string) {
    const key = apiKey || import.meta.env.OPENROUTER_API_KEY;
    console.log("OpenRouterService initialization:");
    console.log("- API Key from parameter:", apiKey ? "provided" : "not provided");
    console.log("- API Key from import.meta.env:", import.meta.env.OPENROUTER_API_KEY ? "provided" : "not provided");
    console.log("- Final API Key:", key ? "provided" : "not provided");
    console.log("- Environment variables available:", Object.keys(import.meta.env).join(", "));

    if (!key) {
      console.error("OpenRouterService initialization failed:");
      console.error("- import.meta.env:", import.meta.env);
      throw new OpenRouterError("Missing OPENROUTER_API_KEY environment variable", 401, OpenRouterErrorCode.AUTH_ERROR);
    }

    this.apiKey = key;
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.defaultModelName = "openai/gpt-4";
    this.defaultModelParameters = {
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
    this.retryConfig = {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffFactor: 2,
    };
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!OpenRouterError.isRetryableError(lastError) || attempt === this.retryConfig.maxRetries) {
          throw lastError;
        }

        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, {
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delay,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * this.retryConfig.backoffFactor, this.retryConfig.maxDelayMs);
      }
    }

    // This should never happen as we always either return or throw in the loop
    throw new OpenRouterError("Maximum retries exceeded", 500, OpenRouterErrorCode.UNKNOWN_ERROR);
  }

  public setModelParameters(params: ModelParameters): void {
    this.defaultModelParameters = {
      ...this.defaultModelParameters,
      ...params,
    };
  }

  public async sendChatCompletion(input: ChatInput): Promise<ChatResponse> {
    try {
      const payload = this.buildPayload(input);
      const response = await this.sendRequest(payload);
      return this.parseResponse(response);
    } catch (error) {
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError(error instanceof Error ? error.message : "Unknown error occurred", 500);
    }
  }

  private buildPayload(input: ChatInput): RequestPayload {
    const systemMessage =
      input.responseFormat?.type === "json_object"
        ? `${input.systemMessage} You must respond with a valid JSON object only, no other text.`
        : input.systemMessage;

    return {
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: input.userMessage,
        },
      ],
      model: this.defaultModelName,
      ...this.defaultModelParameters,
    };
  }

  private async sendRequest(payload: RequestPayload): Promise<Response> {
    return this.withRetry(async () => {
      try {
        console.log("Sending request to OpenRouter API...");
        console.log("API Key length:", this.apiKey.length);
        console.log("Request payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://10x-cards.com",
            "X-Title": "10x Cards",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("OpenRouter API Error:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });

          let errorJson;
          try {
            errorJson = JSON.parse(errorText);
          } catch {
            errorJson = { message: errorText };
          }

          const errorCode = this.mapHttpStatusToErrorCode(response.status);
          throw new OpenRouterError(
            errorJson.message || `Request failed with status ${response.status}`,
            response.status,
            errorCode,
            OpenRouterError.isRetryableError(new Error(errorJson.message))
          );
        }

        return response;
      } catch (error) {
        if (error instanceof OpenRouterError) {
          throw error;
        }

        console.error("Network or parsing error:", error);
        throw new OpenRouterError(
          error instanceof Error ? error.message : "Network error occurred",
          500,
          OpenRouterErrorCode.NETWORK_ERROR,
          true
        );
      }
    });
  }

  private mapHttpStatusToErrorCode(status: number): OpenRouterErrorCode {
    switch (status) {
      case 401:
      case 403:
        return OpenRouterErrorCode.AUTH_ERROR;
      case 429:
        return OpenRouterErrorCode.RATE_LIMIT_ERROR;
      case 400:
        return OpenRouterErrorCode.VALIDATION_ERROR;
      case 408:
      case 504:
        return OpenRouterErrorCode.TIMEOUT_ERROR;
      case 500:
      case 502:
      case 503:
        return OpenRouterErrorCode.SERVER_ERROR;
      default:
        return OpenRouterErrorCode.UNKNOWN_ERROR;
    }
  }

  private validateResponse(data: unknown): asserts data is OpenRouterAPIResponse {
    if (!data || typeof data !== "object") {
      throw new OpenRouterError("Invalid response: expected an object", 400, OpenRouterErrorCode.VALIDATION_ERROR);
    }

    const response = data as Partial<OpenRouterAPIResponse>;

    if (!response.choices?.length) {
      throw new OpenRouterError("Invalid response: missing choices array", 400, OpenRouterErrorCode.VALIDATION_ERROR);
    }

    if (!response.choices[0]?.message?.content) {
      throw new OpenRouterError("Invalid response: missing message content", 400, OpenRouterErrorCode.VALIDATION_ERROR);
    }

    if (!response.model || typeof response.model !== "string") {
      throw new OpenRouterError(
        "Invalid response: missing or invalid model",
        400,
        OpenRouterErrorCode.VALIDATION_ERROR
      );
    }

    if (!response.usage || typeof response.usage !== "object") {
      throw new OpenRouterError(
        "Invalid response: missing or invalid usage data",
        400,
        OpenRouterErrorCode.VALIDATION_ERROR
      );
    }

    const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
    if (
      typeof prompt_tokens !== "number" ||
      typeof completion_tokens !== "number" ||
      typeof total_tokens !== "number"
    ) {
      throw new OpenRouterError(
        "Invalid response: missing or invalid token counts",
        400,
        OpenRouterErrorCode.VALIDATION_ERROR
      );
    }
  }

  private async parseResponse(response: Response): Promise<ChatResponse> {
    const data = await response.json();

    try {
      this.validateResponse(data);
    } catch (error) {
      console.error("Response validation failed:", data);
      throw error;
    }

    return {
      response: data.choices[0].message.content,
      model: data.model,
      usage: {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
        total_tokens: data.usage.total_tokens,
      },
    };
  }
}
