export type UserRole = 'owner' | 'admin' | 'sales_manager' | 'sales_rep' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
  emailVerified: boolean;
  companyName?: string;
  companySize?: string;
  industry?: string;
}

export type PlanTier = 'trial' | 'pro' | 'business' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  size: string;
  phone: string;
  website: string;
  plan: PlanTier;
  minutesUsed: number;
  minutesLimit: number;
  aiAssistantsLimit: number;
  phoneNumbersLimit: number;
  createdAt: string;
  timezone: string;
  currency: string;
}

export interface AssistantVoice {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  accent: string;
  sampleAudio?: string;
}

export interface Assistant {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  voice: string;
  voiceGender?: 'female' | 'male' | 'neutral';
  language: string;
  primaryLanguageCode?: string;
  accent?: string;
  speakingSpeed?: number;
  pitch?: number;
  supportedLanguages?: string[];
  autoDetectLanguage?: boolean;
  allowCodeSwitching?: boolean;
  localizedGreetings?: Record<string, string>;
  personality: string;
  tone: 'professional' | 'consultative' | 'warm' | 'persuasive' | 'direct';
  greeting: string;
  instructions: string;
  salesObjective: string;
  qualificationQuestions: string[];
  callEndingBehavior: string;
  humanHandoffRules: string;
  assignedPhoneNumberId?: string;
  isActive: boolean;
  knowledgeSourceIds: string[];
  productIds: string[];
  callsHandled: number;
  avgRating: number;
  conversionRate: number;
}

export interface PhoneNumber {
  id: string;
  tenantId: string;
  number: string;
  formatted: string;
  country: string;
  type: 'local' | 'toll_free';
  status: 'active' | 'offline' | 'config_required';
  assignedAssistantId?: string;
  provider: 'Twilio' | 'Telnyx' | 'VocalPulse VoiceNet';
  businessHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    days: string[];
  };
  callForwarding: {
    enabled: boolean;
    forwardTo: string;
  };
  voicemailFallback: {
    enabled: boolean;
    emailTo: string;
  };
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: string;
  billingCycle: 'monthly' | 'annual' | 'one_time' | 'custom';
  features: string[];
  benefits: string[];
  availability: 'in_stock' | 'preorder' | 'custom_quote';
  faqs: { question: string; answer: string }[];
  targetCustomer: string;
  salesRestrictions: string;
}

export interface KnowledgeSource {
  id: string;
  tenantId: string;
  title: string;
  type: 'pdf' | 'doc' | 'txt' | 'url' | 'manual' | 'faq' | 'catalogue';
  content: string;
  status: 'indexed' | 'processing' | 'failed';
  chunkCount: number;
  sizeBytes: number;
  updatedAt: string;
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'demo' | 'negotiation' | 'converted' | 'lost';

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  interestedProduct: string;
  budget: string;
  stage: LeadStage;
  score: number;
  notes: string[];
  assignedRep: string;
  lastInteraction: string;
  nextFollowUp: string;
  nextAction?: string;
  callId?: string;
  tags?: string[];
}

export interface TranscriptTurn {
  speaker: 'assistant' | 'customer';
  text: string;
  timestamp: string;
  language?: string;
  detectedLanguage?: string;
}

export interface CallAnalysis {
  intent: string;
  productsDiscussed: string[];
  objections: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  buyingInterestScore: number;
  questionsAsked: string[];
  recommendedAction: string;
  recommendedNextSteps?: string;
  suggestedSalesStage: LeadStage;
}

export interface CallRecord {
  id: string;
  tenantId: string;
  assistantId: string;
  assistantName: string;
  callerNumber: string;
  callerName: string;
  callerCompany: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'transferred' | 'missed' | 'failed';
  outcome?: 'demo_booked' | 'qualified' | 'callback_requested' | 'not_interested' | 'voicemail' | 'failed' | string;
  durationSeconds: number;
  timestamp: string;
  recordingUrl: string;
  audioDuration: string;
  transcript: TranscriptTurn[];
  summary: string;
  aiAnalysis: CallAnalysis;
  leadId?: string;
}

export interface TeamMember {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'invited';
  joinedAt: string;
  lastActive: string;
}

export interface IntegrationItem {
  id: string;
  tenantId: string;
  provider: 'hubspot' | 'salesforce' | 'google_calendar' | 'twilio' | 'sendgrid' | 'whatsapp' | 'slack' | 'webhooks';
  name: string;
  category: 'CRM' | 'Calendar' | 'Telephony' | 'Messaging' | 'Webhooks';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  description: string;
  icon: string;
  connected?: boolean;
}

export type Integration = IntegrationItem;

export interface NotificationItem {
  id: string;
  tenantId: string;
  type: 'lead' | 'high_intent' | 'appointment' | 'call_failed' | 'ai_issue' | 'knowledge' | 'usage';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AuditLogItem {
  id: string;
  tenantId: string;
  actorName: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
}

export interface SubscriptionPlan {
  id: 'trial' | 'pro' | 'business' | 'enterprise';
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  minutesIncluded: number;
  assistantsLimit: number;
  numbersIncluded: number;
  features: string[];
  isPopular?: boolean;
}

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
  products: Partial<Product>[];
  knowledgeText: string;
  assistantName: string;
  assistantVoice: string;
  phoneNumber: string;
}
