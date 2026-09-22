export interface N8nWebhookPayload {
  event: 'call_completed' | 'lead_qualified' | 'demo_booked' | 'human_handoff_requested';
  organizationId: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface AutomationProvider {
  readonly name: string;
  isConfigured(): boolean;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
  dispatchEvent(payload: N8nWebhookPayload): Promise<{ delivered: boolean; reason?: string }>;
}

export class N8nAutomationService implements AutomationProvider {
  public readonly name = 'n8n Workflow Automation';

  private get webhookUrl() {
    return process.env.N8N_WEBHOOK_URL;
  }

  private get apiKey() {
    return process.env.N8N_API_KEY;
  }

  isConfigured(): boolean {
    const url = this.webhookUrl;
    return Boolean(url && url.trim().length > 0 && !url.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'n8n Automation provider is disabled until N8N_WEBHOOK_URL is configured in environment variables.',
      };
    }

    const url = this.webhookUrl!;
    const start = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-N8N-API-KEY': this.apiKey } : {}),
        },
        body: JSON.stringify({
          event: 'ping_test',
          timestamp: new Date().toISOString(),
          message: 'VocalPulse AI SaaS platform connectivity ping',
        }),
      });
      const latencyMs = Date.now() - start;

      if (response.ok) {
        return {
          connected: true,
          message: 'n8n workflow webhook endpoint confirmed responsive.',
          latencyMs,
        };
      }
      return {
        connected: false,
        message: `n8n webhook endpoint returned HTTP status ${response.status}`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `n8n endpoint unreachable: ${err.message || String(err)}`,
      };
    }
  }

  /**
   * Dispatches an event to the registered n8n automation workflow if configured
   */
  async dispatchEvent(payload: N8nWebhookPayload): Promise<{ delivered: boolean; reason?: string }> {
    if (!this.isConfigured()) {
      return {
        delivered: false,
        reason: 'n8n webhook URL is not configured. Automation provider is disabled.',
      };
    }

    const url = this.webhookUrl!;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-N8N-API-KEY': this.apiKey } : {}),
        },
        body: JSON.stringify(payload),
      });

      return {
        delivered: response.ok,
        reason: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (err: any) {
      console.warn('[n8n Webhook Dispatch] Failed to post event to n8n:', err.message);
      return {
        delivered: false,
        reason: err.message,
      };
    }
  }
}

export class DisabledAutomationProvider implements AutomationProvider {
  public readonly name = 'n8n Workflow Automation (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'n8n Automation provider is disabled. Configure N8N_WEBHOOK_URL to enable webhook dispatches.',
    };
  }

  async dispatchEvent(): Promise<{ delivered: boolean; reason?: string }> {
    return {
      delivered: false,
      reason: 'n8n automation provider is disabled.',
    };
  }
}

const activeN8nService = new N8nAutomationService();

export function getAutomationProvider(): AutomationProvider {
  return activeN8nService.isConfigured()
    ? activeN8nService
    : new DisabledAutomationProvider();
}

export const n8nService: AutomationProvider = activeN8nService;
