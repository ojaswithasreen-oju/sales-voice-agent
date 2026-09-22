import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  } catch (error) {
    console.error('[Gemini AI] Failed to initialize client:', error);
    return null;
  }
}

/**
 * Resilient generateContent call with demand-spike fallbacks
 */
export async function generateGeminiContent(params: {
  contents: any;
  systemInstruction?: string;
  config?: any;
}): Promise<string> {
  const ai = getGemini();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const candidateModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          ...params.config,
          systemInstruction: params.systemInstruction,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code || 503;
      console.warn(`[Gemini Engine] Model '${model}' returned ${status}. Attempting fallback...`);
    }
  }

  throw lastError || new Error('All candidate Gemini models temporarily unavailable');
}

/**
 * Verifies Gemini API connectivity
 */
export async function testGeminiConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      connected: false,
      message: 'GEMINI_API_KEY environment variable is not configured.',
    };
  }

  const start = Date.now();
  try {
    const text = await generateGeminiContent({
      contents: 'Respond with the word "CONNECTED" to verify API readiness.',
    });
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      message: `Gemini API connected successfully (${latencyMs}ms). Response: ${text.trim().slice(0, 20)}`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Gemini API connection test failed: ${err.message || String(err)}`,
    };
  }
}
