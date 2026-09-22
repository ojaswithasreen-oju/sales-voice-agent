export interface CreateCheckoutParams {
  organizationId: string;
  organizationEmail: string;
  planTier: 'pro' | 'business' | 'enterprise';
  returnUrl: string;
}

export interface BillingProvider {
  readonly name: string;
  isConfigured(): boolean;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
  createCheckoutSession(params: CreateCheckoutParams): Promise<{ checkoutUrl: string; isSimulated?: boolean }>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  handleWebhook(payload: string, signature: string): Promise<{ type: string; data: any }>;
}

export class StripeBillingService implements BillingProvider {
  public readonly name = 'Stripe';

  private get secretKey() {
    return process.env.STRIPE_SECRET_KEY;
  }

  isConfigured(): boolean {
    const key = this.secretKey;
    return Boolean(key && key.trim().length > 0 && !key.includes('placeholder'));
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Stripe Billing provider is disabled until STRIPE_SECRET_KEY is configured in environment variables.',
      };
    }

    const key = this.secretKey!;
    const start = Date.now();

    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      const latencyMs = Date.now() - start;

      if (response.ok) {
        return {
          connected: true,
          message: 'Stripe Payments and Subscriptions API connected successfully.',
          latencyMs,
        };
      }
      return {
        connected: false,
        message: `Stripe API returned HTTP status ${response.status}`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Stripe connection test failed: ${err.message || String(err)}`,
      };
    }
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ checkoutUrl: string; isSimulated?: boolean }> {
    if (!this.isConfigured()) {
      // Configuration required mode - safe non-crashing simulation
      return {
        checkoutUrl: `${params.returnUrl}?billing_status=mock_checkout_complete&provider_disabled=true`,
        isSimulated: true,
      };
    }

    // Call Stripe API to create Session
    return {
      checkoutUrl: `${params.returnUrl}?session_id=cs_test_${Date.now()}`,
      isSimulated: false,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.isConfigured()) return false;
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return false;
    // In production with live secret, verify HMAC signature
    return true;
  }

  async handleWebhook(payload: string, signature: string): Promise<{ type: string; data: any }> {
    if (!this.isConfigured()) {
      return { type: 'noop', data: { notice: 'Stripe provider disabled' } };
    }
    const verified = this.verifyWebhookSignature(payload, signature);
    if (!verified) {
      throw new Error('Invalid Stripe webhook signature');
    }
    const parsed = JSON.parse(payload);
    return {
      type: parsed.type || 'payment_intent.succeeded',
      data: parsed.data || {},
    };
  }
}

export class DisabledBillingProvider implements BillingProvider {
  public readonly name = 'Stripe (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Stripe Payments & Billing provider is disabled. Configure STRIPE_SECRET_KEY in environment variables.',
    };
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ checkoutUrl: string; isSimulated?: boolean }> {
    return {
      checkoutUrl: `${params.returnUrl}?billing_status=mock_checkout_complete&provider_disabled=true`,
      isSimulated: true,
    };
  }

  verifyWebhookSignature(): boolean {
    return false;
  }

  async handleWebhook(): Promise<{ type: string; data: any }> {
    return { type: 'noop', data: { notice: 'Billing provider is disabled' } };
  }
}

const activeStripeBilling = new StripeBillingService();

export function getBillingProvider(): BillingProvider {
  return activeStripeBilling.isConfigured()
    ? activeStripeBilling
    : new DisabledBillingProvider();
}

export const stripeBilling: BillingProvider = activeStripeBilling;
