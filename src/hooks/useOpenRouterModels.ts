import { useState, useEffect } from 'react';
import { getModels, type OpenRouterModel } from '../lib/openrouter';

export function useOpenRouterModels() {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const data = await getModels();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  return { models, isLoading, error };
}