import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

export type AIEvaluationResponse = {
  score: number;
  analysis: string;
  strengths: string[];
  improvements: string[];
  comparables?: string[];
};

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

interface AICallOptions {
  systemPrompt: string;
  userPrompt: string;
  maxScore: number;
}

export async function callAI(options: AICallOptions): Promise<AIEvaluationResponse | null> {
  const { systemPrompt, userPrompt, maxScore } = options;

  const schema = z.object({
    score: z.number().min(0).max(maxScore),
    analysis: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    comparables: z.array(z.string()).optional(),
  });

  // Try Gemini first
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const result = await Promise.race([
        generateObject({
          model: google('gemini-2.5-flash-preview-05-20'),
          schema,
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 2048,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 50000)
        ),
      ]);
      return result.object;
    } catch (e: unknown) {
      const error = e as Error & { status?: number };
      console.warn('[AI] Gemini failed:', error.message);
    }
  }

  // Try OpenRouter fallback
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await Promise.race([
        generateObject({
          model: openrouter('deepseek/deepseek-chat:free'),
          schema,
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 2048,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 50000)
        ),
      ]);
      return result.object;
    } catch (e: unknown) {
      const error = e as Error;
      console.warn('[AI] OpenRouter failed:', error.message);
    }
  }

  // All providers failed
  return null;
}

export async function callAISummary(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const summarySchema = z.object({
    summary: z.string(),
  });

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const result = await Promise.race([
        generateObject({
          model: google('gemini-2.5-flash-preview-05-20'),
          schema: summarySchema,
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 1024,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 50000)
        ),
      ]);
      return result.object.summary;
    } catch (e: unknown) {
      const error = e as Error;
      console.warn('[AI Summary] Gemini failed:', error.message);
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await Promise.race([
        generateObject({
          model: openrouter('deepseek/deepseek-chat:free'),
          schema: summarySchema,
          system: systemPrompt,
          prompt: userPrompt,
          maxOutputTokens: 1024,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 50000)
        ),
      ]);
      return result.object.summary;
    } catch (e: unknown) {
      const error = e as Error;
      console.warn('[AI Summary] OpenRouter failed:', error.message);
    }
  }

  return null;
}
