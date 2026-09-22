import { generateGeminiContent } from './gemini';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ConversationTurnResult {
  replyText: string;
  detectedIntent?: string;
  triggerHandoff?: boolean;
  handoffReason?: string;
}

/**
 * Executes a single conversational turn in the voice pipeline
 */
export async function processVoiceConversationTurn(params: {
  systemPrompt: string;
  history: ChatMessage[];
  latestCallerMessage: string;
}): Promise<ConversationTurnResult> {
  const contents = [
    ...params.history.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: params.latestCallerMessage }],
    },
  ];

  try {
    const rawResponse = await generateGeminiContent({
      systemInstruction: params.systemPrompt,
      contents,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150, // Keep short for voice latency
      },
    });

    const reply = rawResponse.trim();
    const isHandoff =
      reply.toLowerCase().includes('connecting you to') ||
      reply.toLowerCase().includes('transferring you') ||
      params.latestCallerMessage.toLowerCase().includes('speak to human') ||
      params.latestCallerMessage.toLowerCase().includes('real person');

    return {
      replyText: reply,
      triggerHandoff: isHandoff,
      handoffReason: isHandoff ? 'Caller requested human rep or threshold reached' : undefined,
    };
  } catch (err: any) {
    console.error('[Voice Conversation] Gemini processing error:', err);
    return {
      replyText:
        'Thank you for your response. Let me make note of that and ensure our sales specialist reaches out right away.',
    };
  }
}
