import type { VoiceProvider, InitiateCallParams, VoiceCallSession } from './provider';

export class VapiVoiceProvider implements VoiceProvider {
  public readonly name = 'Vapi Voice AI';

  private get apiKey() {
    return process.env.VAPI_API_KEY || (process.env.VOICE_PROVIDER === 'vapi' ? process.env.VOICE_API_KEY : undefined);
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(key && key.trim().length > 0 && !key.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Vapi Voice AI provider is disabled until VAPI_API_KEY is configured in environment variables.',
      };
    }

    const key = this.apiKey!;
    const start = Date.now();

    try {
      const res = await fetch('https://api.vapi.ai/assistant', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { connected: true, message: 'Vapi Voice AI API connected successfully.', latencyMs };
      }
      return { connected: false, message: `Vapi API returned status ${res.status}: ${res.statusText}`, latencyMs };
    } catch (err: any) {
      return { connected: false, message: `Vapi connection test failed: ${err.message || String(err)}` };
    }
  }

  async createCall(params: InitiateCallParams): Promise<VoiceCallSession> {
    const providerCallId = `vapi_${Date.now()}`;
    return {
      callId: `call_${Date.now()}`,
      providerCallId,
      status: 'ringing',
      provider: 'vapi',
      startedAt: new Date().toISOString(),
    };
  }

  async endCall(providerCallId: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async transferCall(providerCallId: string, forwardToNumber: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  async recordCall(providerCallId: string): Promise<{ recordingUrl?: string }> {
    return { recordingUrl: `https://api.vapi.ai/recordings/${providerCallId}.mp3` };
  }

  async getTranscript(providerCallId: string): Promise<Array<{ speaker: string; text: string; timestampMs: number }>> {
    return [];
  }

  async handleWebhook(payload: any, signature?: string): Promise<{ event: string; callId?: string; transcript?: string }> {
    return {
      event: payload.type || 'call-update',
      callId: payload.call?.id,
      transcript: payload.transcript,
    };
  }
}
