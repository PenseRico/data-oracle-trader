import { useState, useCallback } from 'react';
import { chatCompletion, DEFAULT_MODELS, type Message } from '../lib/openrouter';

export interface UseOpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface UseOpenRouterReturn {
  isLoading: boolean;
  error: string | null;
  response: string | null;
  sendMessage: (systemPrompt: string, userPrompt: string) => Promise<string>;
  selectedModel: string;
}

export function useOpenRouter(options?: UseOpenRouterOptions): UseOpenRouterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (systemPrompt: string, userPrompt: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const messages: Message[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ];

        const result = await chatCompletion(
          options?.model ?? DEFAULT_MODELS[0].id,
          messages,
          {
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.max_tokens ?? 4096,
          }
        );

        const content = result.choices[0].message.content;
        setResponse(content);
        return content;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options?.model, options?.temperature, options?.max_tokens]
  );

  return { 
    isLoading, 
    error, 
    response, 
    sendMessage,
    selectedModel: options?.model ?? DEFAULT_MODELS[0].id
  };
}

export { DEFAULT_MODELS };