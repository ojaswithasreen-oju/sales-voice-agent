export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: string;
  isConfigured(): boolean;
  sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }>;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
}

export class ResendEmailProvider implements EmailProvider {
  public readonly name = 'Resend';

  private get apiKey() {
    return process.env.RESEND_API_KEY || (process.env.EMAIL_PROVIDER === 'resend' ? process.env.EMAIL_API_KEY : undefined);
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(key && key.trim().length > 0 && !key.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Resend Email provider is disabled until RESEND_API_KEY is configured in environment variables.',
      };
    }

    const key = this.apiKey!;
    const start = Date.now();

    try {
      const res = await fetch('https://api.resend.com/api_keys', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { connected: true, message: 'Resend Email API connected successfully.', latencyMs };
      }
      return { connected: false, message: `Resend returned HTTP ${res.status}`, latencyMs };
    } catch (err: any) {
      return { connected: false, message: `Resend connection failed: ${err.message || String(err)}` };
    }
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('[Resend] Email dispatch skipped: provider is disabled due to missing RESEND_API_KEY.');
      return { success: false, error: 'Email provider disabled: RESEND_API_KEY not configured' };
    }

    const key = this.apiKey!;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: params.from || process.env.EMAIL_FROM_ADDRESS || 'VocalPulse <notifications@vocalpulse.ai>',
          to: params.to,
          subject: params.subject,
          html: params.html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id };
      }
      return { success: false, error: `Resend delivery failed with HTTP ${response.status}: ${response.statusText}` };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }
}

export class SendGridEmailProvider implements EmailProvider {
  public readonly name = 'SendGrid';

  private get apiKey() {
    return process.env.SENDGRID_API_KEY || (process.env.EMAIL_PROVIDER === 'sendgrid' ? process.env.EMAIL_API_KEY : undefined);
  }

  isConfigured(): boolean {
    const key = this.apiKey;
    return Boolean(key && key.trim().length > 0 && !key.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'SendGrid Email provider is disabled until SENDGRID_API_KEY is configured in environment variables.',
      };
    }

    const key = this.apiKey!;
    const start = Date.now();

    try {
      const res = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { connected: true, message: 'SendGrid Email API connected.', latencyMs };
      }
      return { connected: false, message: `SendGrid returned HTTP ${res.status}`, latencyMs };
    } catch (err: any) {
      return { connected: false, message: `SendGrid connection test failed: ${err.message || String(err)}` };
    }
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn('[SendGrid] Email dispatch skipped: provider is disabled due to missing SENDGRID_API_KEY.');
      return { success: false, error: 'Email provider disabled: SENDGRID_API_KEY not configured' };
    }

    const key = this.apiKey!;
    const toAddresses = Array.isArray(params.to) ? params.to : [params.to];

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: toAddresses.map((email) => ({ email })) }],
          from: { email: params.from || process.env.EMAIL_FROM_ADDRESS || 'notifications@vocalpulse.ai' },
          subject: params.subject,
          content: [{ type: 'text/html', value: params.html }],
        }),
      });

      if (response.status >= 200 && response.status < 300) {
        return { success: true };
      }
      return { success: false, error: `SendGrid failed with status ${response.status}` };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }
}

export class DisabledEmailProvider implements EmailProvider {
  public readonly name = 'Email Provider (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Email provider is disabled. Configure RESEND_API_KEY or SENDGRID_API_KEY in environment variables.',
    };
  }

  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.warn(`[Email Provider (Disabled)] Skipping email to ${JSON.stringify(params.to)}: Provider is disabled.`);
    return {
      success: false,
      error: 'Email provider is disabled until credentials are provided.',
    };
  }
}

export function getEmailProvider(): EmailProvider {
  const providerType = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
  if (providerType === 'sendgrid') {
    return new SendGridEmailProvider();
  }
  return new ResendEmailProvider();
}
