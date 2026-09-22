export type IntegrationServiceId =
  | 'gemini'
  | 'firebase'
  | 'supabase'
  | 'twilio'
  | 'vapi'
  | 'retell'
  | 'elevenlabs'
  | 'resend'
  | 'sendgrid'
  | 'google_calendar'
  | 'stripe'
  | 'n8n';

export type IntegrationStatus = 'connected' | 'config_required' | 'connection_failed' | 'disconnected';

export interface SaaSIntegrationInfo {
  service: IntegrationServiceId;
  name: string;
  category: 'AI' | 'Auth' | 'Database' | 'Voice' | 'Email' | 'Calendar' | 'Billing' | 'Automation';
  status: IntegrationStatus;
  description: string;
  envVarsRequired: string[];
  docsUrl?: string;
  lastTestedAt?: string;
  errorMessage?: string;
}
