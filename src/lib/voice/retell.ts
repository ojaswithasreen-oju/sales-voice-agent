import type { VoiceProvider, InitiateCallParams, VoiceCallSession } from './provider';

export class RetellVoiceProvider implements VoiceProvider {
  public readonly name = 'Retell AI';

  private get apiKey() {
    return process.env.RETELL_API_KEY || (process.env.VOICE_PROVIDER === 'retell' ? process.env.VOICE_API_KEY : undefined);
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(key && key.trim().length > 0 && !key.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Retell AI provider is disabled until RETELL_API_KEY is configured in environment variables.',
      };
    }

    const key = this.apiKey!;
    const start = Date.now();

    try {
      const res = await fetch('https://api.retellai.com/list-agents', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { connected: true, message: 'Retell AI telephony service connected.', latencyMs };
      }
      return { connected: false, message: `Retell API returned status ${res.status}`, latencyMs };
    } catch (err: any) {
      return { connected: false, message: `Retell test failed: ${err.message || String(err)}` };
    }
  }

  async createCall(params: InitiateCallParams): Promise<VoiceCallSession> {
    return {
      callId: `call_${Date.now()}`,
      providerCallId: `retell_${Date.now()}`,
      status: 'ringing',
      provider: 'retell',
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
    return {};
  }

  async getTranscript(providerCallId: string): Promise<Array<{ speaker: string; text: string; timestampMs: number }>> {
    return [];
  }

  async handleWebhook(payload: any, signature?: string): Promise<{ event: string; callId?: string; transcript?: string }> {
    return {
      event: payload.event || 'call_ended',
      callId: payload.call_id,
      transcript: payload.transcript,
    };
  }
}
