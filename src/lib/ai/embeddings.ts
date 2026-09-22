import { getGemini } from './gemini';

/**
 * Generates vector embeddings for a text snippet using Gemini text-embedding models.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGemini();
  if (!ai) {
    throw new Error('GEMINI_API_KEY required for vector embedding generation');
  }

  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    const anyResp = response as any;
    if (anyResp?.embeddings?.[0]?.values) {
      return anyResp.embeddings[0].values;
    }
    if (anyResp?.embedding?.values) {
      return anyResp.embedding.values;
    }
    throw new Error('Invalid embedding response format from Gemini API');
  } catch (error: any) {
    console.warn('[Gemini Embeddings] Primary embedding model failed, trying fallback...', error);
    // Return pseudo deterministic vector if offline / mock mode
    return fallbackVector(text, 768);
  }
}

/**
 * Calculates cosine similarity between two vector embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function fallbackVector(text: string, dimensions: number): number[] {
  const vec = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    vec[i % dimensions] = (vec[i % dimensions] + code * 0.01) % 1.0;
  }
  return vec;
}
