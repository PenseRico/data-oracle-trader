const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

let cachedModels: OpenRouterModel[] | null = null;

export async function getModels(): Promise<OpenRouterModel[]> {
  if (cachedModels) return cachedModels;

  const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = await response.json();
  cachedModels = data.data.map((model: Record<string, unknown>) => ({
    id: model.id as string,
    name: model.name as string,
    description: model.description as string,
    context_length: model.context_length as number,
    pricing: model.pricing as { prompt: string; completion: string } | undefined,
  }));

  return cachedModels;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const DEFAULT_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: '', context_length: 128000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: '', context_length: 128000 },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: '', context_length: 200000 },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: '', context_length: 200000 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: '', context_length: 200000 },
  { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: '', context_length: 1000000 },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: '', context_length: 2000000 },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: '', context_length: 128000 },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: '', context_length: 128000 },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', description: '', context_length: 32000 },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: '', context_length: 64000 },
];

export async function chatCompletion(
  model: string,
  messages: Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function generateChat(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await chatCompletion(model, messages, options);
  return response.choices[0].message.content;
}