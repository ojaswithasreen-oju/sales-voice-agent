export interface InitiateCallParams {
  toPhoneNumber: string;
  fromPhoneNumber: string;
  assistantId: string;
  assistantName: string;
  firstMessage: string;
  voiceGender?: string;
  systemPrompt?: string;
  metadata?: Record<string, any>;
}

export interface VoiceCallSession {
  callId: string;
  providerCallId: string;
  status: 'ringing' | 'in-progress' | 'completed' | 'transferred' | 'failed';
  provider: 'twilio' | 'vapi' | 'retell' | 'elevenlabs';
  startedAt: string;
}

export interface VoiceProvider {
  readonly name: string;
  isConfigured(): boolean;
  createCall(params: InitiateCallParams): Promise<VoiceCallSession>;
  endCall(providerCallId: string): Promise<{ success: boolean }>;
  transferCall(providerCallId: string, forwardToNumber: string): Promise<{ success: boolean }>;
  recordCall(providerCallId: string): Promise<{ recordingUrl?: string }>;
  getTranscript(providerCallId: string): Promise<Array<{ speaker: string; text: string; timestampMs: number }>>;
  handleWebhook(payload: any, signature?: string): Promise<{ event: string; callId?: string; transcript?: string }>;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
}

export class DisabledVoiceProvider implements VoiceProvider {
  public readonly name = 'Voice Provider (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Voice telephony provider is disabled until credentials (TWILIO_ACCOUNT_SID/AUTH_TOKEN, VAPI_API_KEY, or RETELL_API_KEY) are configured.',
    };
  }

  async createCall(params: InitiateCallParams): Promise<VoiceCallSession> {
    // Graceful simulated call when voice provider is disabled
    const providerCallId = `sim_call_${Date.now()}`;
    return {
      callId: `call_${Date.now()}`,
      providerCallId,
      status: 'ringing',
      provider: 'twilio',
      startedAt: new Date().toISOString(),
    };
  }

  async endCall(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async transferCall(): Promise<{ success: boolean }> {
    return { success: true };
  }

  async recordCall(providerCallId: string): Promise<{ recordingUrl?: string }> {
    return { recordingUrl: `https://storage.placeholder.internal/recordings/${providerCallId}.wav` };
  }

  async getTranscript(): Promise<Array<{ speaker: string; text: string; timestampMs: number }>> {
    return [];
  }

  async handleWebhook(): Promise<{ event: string; callId?: string; transcript?: string }> {
    return { event: 'call_ended' };
  }
}

import { TwilioVoiceProvider } from './twilio';
import { VapiVoiceProvider } from './vapi';
import { RetellVoiceProvider } from './retell';

export function getVoiceProvider(requestedProvider?: string): VoiceProvider {
  const provider = (requestedProvider || process.env.VOICE_PROVIDER || 'twilio').toLowerCase();

  switch (provider) {
    case 'vapi':
      return new VapiVoiceProvider();
    case 'retell':
      return new RetellVoiceProvider();
    case 'twilio':
      return new TwilioVoiceProvider();
    default:
      return new TwilioVoiceProvider();
  }
}
