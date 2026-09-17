import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import type {
  Organization,
  User,
  Assistant,
  PhoneNumber,
  Product,
  KnowledgeSource,
  Lead,
  CallRecord,
  TeamMember,
  IntegrationItem,
  NotificationItem,
  AuditLogItem,
} from './src/types';
import { SUPPORTED_LANGUAGES, getLanguageByCode, detectLanguageFromText } from './src/lib/languages';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// ----------------------------------------------------------------------------
// IN-MEMORY MULTI-TENANT DATABASE WITH TENANT ISOLATION
// ----------------------------------------------------------------------------

interface TenantDatabase {
  organizations: Map<string, Organization>;
  users: Map<string, User>;
  assistants: Map<string, Assistant[]>;
  phoneNumbers: Map<string, PhoneNumber[]>;
  products: Map<string, Product[]>;
  knowledge: Map<string, KnowledgeSource[]>;
  leads: Map<string, Lead[]>;
  calls: Map<string, CallRecord[]>;
  team: Map<string, TeamMember[]>;
  integrations: Map<string, IntegrationItem[]>;
  notifications: Map<string, NotificationItem[]>;
  auditLogs: Map<string, AuditLogItem[]>;
}

const db: TenantDatabase = {
  organizations: new Map(),
  users: new Map(),
  assistants: new Map(),
  phoneNumbers: new Map(),
  products: new Map(),
  knowledge: new Map(),
  leads: new Map(),
  calls: new Map(),
  team: new Map(),
  integrations: new Map(),
  notifications: new Map(),
  auditLogs: new Map(),
};

// Seed Tenant 1: Acme Cloud Corp
const tenant1Id = 'org_acme_cloud';
const user1Id = 'user_acme_owner';

db.organizations.set(tenant1Id, {
  id: tenant1Id,
  name: 'Acme Cloud Corp',
  slug: 'acme-cloud',
  industry: 'B2B SaaS & Automation',
  size: '51-200',
  phone: '+1 (415) 890-2341',
  website: 'https://acmecloud.example.com',
  plan: 'business',
  minutesUsed: 1420,
  minutesLimit: 5000,
  aiAssistantsLimit: 10,
  phoneNumbersLimit: 5,
  createdAt: '2026-01-15T08:00:00Z',
  timezone: 'America/Los_Angeles',
  currency: 'USD',
});

db.users.set(user1Id, {
  id: user1Id,
  email: 'ojaswithasreen@gmail.com',
  name: 'Ojaswitha Sreen',
  phone: '+1 (415) 890-2341',
  role: 'owner',
  tenantId: tenant1Id,
  emailVerified: true,
  companyName: 'Acme Cloud Corp',
  companySize: '51-200',
  industry: 'B2B SaaS & Automation',
});

db.assistants.set(tenant1Id, [
  {
    id: 'asst_sarah_enterprise',
    tenantId: tenant1Id,
    name: 'Sarah - Enterprise Sales Specialist',
    role: 'Enterprise Inbound Qualifier',
    voice: 'nova',
    voiceGender: 'female',
    language: 'English (US)',
    primaryLanguageCode: 'en-US',
    accent: 'American Standard',
    speakingSpeed: 1.0,
    pitch: 1.05,
    supportedLanguages: ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN', 'it-IT', 'ar-SA'],
    autoDetectLanguage: true,
    allowCodeSwitching: true,
    localizedGreetings: {
      'en-US': 'Hi there! Thank you for calling Acme Cloud Corp. This is Sarah, your AI sales specialist. How can I assist your team today?',
      'es-MX': '¡Hola! Gracias por llamar a Acme Cloud Corp. Le atiende Sarah, su especialista en soluciones en la nube. ¿En qué puedo apoyar a su empresa hoy?',
      'fr-FR': 'Bonjour et bienvenue chez Acme Cloud Corp ! Je m\'appelle Sarah, votre conseillère commerciale IA. En quoi puis-je vous être utile aujourd\'hui ?',
      'de-DE': 'Guten Tag! Herzlich willkommen bei Acme Cloud Corp. Mein Name ist Sarah, Ihre KI-Vertriebsexpertin. Wie darf ich Ihr Unternehmen heute unterstützen?',
      'pt-BR': 'Olá! Muito obrigado por ligar para a Acme Cloud Corp. Sou a Sarah, sua especialista em automação e nuvem. Como posso ajudar a sua equipe hoje?',
      'hi-IN': 'नमस्ते! Acme Cloud Corp में कॉल करने के लिए धन्यवाद। मैं सारा हूँ, आपकी AI सेल्स स्पेशलिस्ट। आज मैं आपकी टीम की क्या सहायता कर सकती हूँ?',
      'ja-JP': 'お電話ありがとうございます。Acme Cloud CorpのAIセールススペシャリスト、サラと申します。本日はどのようなご相談でしょうか？',
      'zh-CN': '您好！感谢致电Acme Cloud Corp。我是您的AI销售顾问Sarah。请问今天有什么我可以协助您团队的吗？'
    },
    personality: 'Professional, consultative, highly articulate female executive sales voice with natural warmth',
    tone: 'consultative',
    greeting: 'Hi there! Thank you for calling Acme Cloud Corp. This is Sarah, your AI sales specialist. How can I assist your team today?',
    instructions: 'You are Sarah, a female enterprise sales specialist for Acme Cloud Corp. Your voice persona is natural, warm, professional, articulate, and confident. Your goal is to understand the caller’s business needs, qualify company size, budget, and timeline, introduce Acme Cloud Platform, and offer a personalized 20-minute executive demo. You are fluent in all authorized languages, automatically detecting when a caller speaks or switches languages mid-call and responding seamlessly in their language.',
    salesObjective: 'Qualify enterprise pipeline and book high-value software architecture demos.',
    qualificationQuestions: [
      'What is your current workflow bottleneck with data pipeline automation?',
      'How many team members would require access to the platform?',
      'What is your target timeline for evaluating and deploying a solution?'
    ],
    callEndingBehavior: 'Summarize key action items, confirm scheduled calendar invite, and thank them warmly.',
    humanHandoffRules: 'If caller asks for an account manager or expresses complex legal/contractual questions, offer warm transfer to David Miller (Director of Sales).',
    isActive: true,
    knowledgeSourceIds: ['kn_acme_overview', 'kn_acme_pricing'],
    productIds: ['prod_acme_enterprise', 'prod_acme_growth'],
    callsHandled: 284,
    avgRating: 4.9,
    conversionRate: 34.2,
  },
  {
    id: 'asst_alex_support',
    tenantId: tenant1Id,
    name: 'Alex - Product & Inbound Support',
    role: 'Product Specialist & Demo Guide',
    voice: 'alloy',
    voiceGender: 'male',
    language: 'English (US)',
    primaryLanguageCode: 'en-US',
    accent: 'American Standard',
    speakingSpeed: 1.0,
    pitch: 0.98,
    supportedLanguages: ['en-US', 'es-MX', 'fr-FR', 'de-DE'],
    autoDetectLanguage: true,
    allowCodeSwitching: true,
    personality: 'Friendly, tech-savvy, structured, and helpful',
    tone: 'warm',
    greeting: 'Hello! You have reached Acme Cloud product support and sales. My name is Alex. Are you exploring our APIs or looking for a product overview?',
    instructions: 'Help inbound prospects and users discover product features, explain API integrations, and route qualified prospects to the sales calendar.',
    salesObjective: 'Guide technical buyers through API capabilities and schedule an engineering consultation.',
    qualificationQuestions: [
      'What tech stack are you looking to integrate with?',
      'Have you reviewed our REST and GraphQL documentation?'
    ],
    callEndingBehavior: 'Send documentation links via SMS/email and schedule follow-up.',
    humanHandoffRules: 'Handoff to Level 2 Solutions Engineering if architecture questions require custom SLA design.',
    isActive: true,
    knowledgeSourceIds: ['kn_acme_overview'],
    productIds: ['prod_acme_growth'],
    callsHandled: 152,
    avgRating: 4.8,
    conversionRate: 28.5,
  }
]);

db.phoneNumbers.set(tenant1Id, [
  {
    id: 'phone_1',
    tenantId: tenant1Id,
    number: '+14158902341',
    formatted: '+1 (415) 890-2341',
    country: 'United States',
    type: 'local',
    status: 'active',
    assignedAssistantId: 'asst_sarah_enterprise',
    provider: 'VocalPulse VoiceNet',
    businessHours: {
      enabled: true,
      start: '08:00',
      end: '18:00',
      timezone: 'America/Los_Angeles',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    callForwarding: {
      enabled: false,
      forwardTo: '+14155550199',
    },
    voicemailFallback: {
      enabled: true,
      emailTo: 'sales@acmecloud.example.com',
    },
  },
  {
    id: 'phone_2',
    tenantId: tenant1Id,
    number: '+18005550192',
    formatted: '+1 (800) 555-0192',
    country: 'United States',
    type: 'toll_free',
    status: 'active',
    assignedAssistantId: 'asst_alex_support',
    provider: 'Twilio',
    businessHours: {
      enabled: false,
      start: '00:00',
      end: '23:59',
      timezone: 'America/Los_Angeles',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    callForwarding: {
      enabled: false,
      forwardTo: '',
    },
    voicemailFallback: {
      enabled: true,
      emailTo: 'support@acmecloud.example.com',
    },
  }
]);

db.products.set(tenant1Id, [
  {
    id: 'prod_acme_enterprise',
    tenantId: tenant1Id,
    name: 'Acme Enterprise Suite',
    description: 'Full-spectrum cloud workflow automation, SOC2-certified security, custom integrations, and 99.99% uptime SLA.',
    price: '$2,400 / month',
    billingCycle: 'annual',
    features: [
      'Unlimited real-time workflows',
      'Dedicated enterprise VPC peering',
      '24/7 Priority Solution Architect Support',
      'Role-based granular access governance'
    ],
    benefits: [
      'Cuts manual processing time by 85%',
      'Eliminates data silo synchronizations',
      'Guaranteed executive SLA'
    ],
    availability: 'in_stock',
    faqs: [
      { question: 'Is custom migration support provided?', answer: 'Yes, full white-glove onboarding and data migration is included with Enterprise Suite.' },
      { question: 'Can we pay via invoice/wire?', answer: 'Yes, annual purchase orders with Net 30 terms are supported.' }
    ],
    targetCustomer: 'Mid-market and enterprise organizations with 100+ employees seeking automated compliance workflows.',
    salesRestrictions: 'Requires minimum 1-year annual contract agreement.',
  },
  {
    id: 'prod_acme_growth',
    tenantId: tenant1Id,
    name: 'Acme Growth Platform',
    description: 'Fast, flexible data integration and event-driven automation for scaling SaaS and tech companies.',
    price: '$790 / month',
    billingCycle: 'monthly',
    features: [
      'Up to 50 active pipelines',
      'Standard REST & Webhook connectors',
      'Standard business hours support',
      'Audit logging (30 days)'
    ],
    benefits: [
      'Setup within 48 hours',
      'No engineering maintenance overhead'
    ],
    availability: 'in_stock',
    faqs: [
      { question: 'Is there a free trial?', answer: 'Yes, 14-day fully featured trial with 1,000 complimentary automated runs.' }
    ],
    targetCustomer: 'Fast-growing startups and tech agencies with 10 to 50 team members.',
    salesRestrictions: 'Self-serve monthly billing via credit card.',
  }
]);

db.knowledge.set(tenant1Id, [
  {
    id: 'kn_acme_overview',
    tenantId: tenant1Id,
    title: 'Acme Cloud Company Overview & Value Proposition.pdf',
    type: 'pdf',
    content: 'Acme Cloud Corp was founded in 2022 to pioneer autonomous cloud operations. Trusted by over 1,200 organizations, Acme delivers sub-second data workflow synchronization, end-to-end encryption at rest and in transit, and ISO 27001 / SOC2 Type II compliance.',
    status: 'indexed',
    chunkCount: 14,
    sizeBytes: 245760,
    updatedAt: '2026-02-10T14:22:00Z',
  },
  {
    id: 'kn_acme_pricing',
    tenantId: tenant1Id,
    title: 'Sales Playbook & Objection Handling 2026.docx',
    type: 'doc',
    content: 'Standard discounts: Up to 15% discount for multi-year upfront commitments. Handling budget objections: Emphasize that Acme replaces 3 disparate point solutions (Zapier, custom Lambda workers, and observability tooling), yielding net cost reductions within 90 days. Trial policy: We offer 14-day proof of concepts with dedicated technical onboarding.',
    status: 'indexed',
    chunkCount: 22,
    sizeBytes: 184320,
    updatedAt: '2026-02-18T10:15:00Z',
  },
  {
    id: 'kn_acme_faqs',
    tenantId: tenant1Id,
    title: 'Security & Compliance FAQ',
    type: 'faq',
    content: 'Security answers: We encrypt all data in transit with TLS 1.3 and at rest with AES-256. Customer data is isolated in separate tenant schemas. We sign BAAs for HIPAA compliance upon request.',
    status: 'indexed',
    chunkCount: 8,
    sizeBytes: 45000,
    updatedAt: '2026-03-01T09:00:00Z',
  }
]);

db.leads.set(tenant1Id, [
  {
    id: 'lead_1',
    tenantId: tenant1Id,
    name: 'Marcus Vance',
    phone: '+1 (212) 555-8942',
    email: 'm.vance@vanguardlogix.com',
    company: 'Vanguard Logix',
    source: 'Inbound Call',
    interestedProduct: 'Acme Enterprise Suite',
    budget: '$30,000 - $50,000 / yr',
    stage: 'demo',
    score: 94,
    notes: [
      'Caller is VP of Engineering. Mentioned current pipeline crashes during peak load.',
      'Needs SOC2 compliance and SAML SSO integration.',
      'Demo scheduled for Thursday 2:00 PM EST with Sarah.'
    ],
    assignedRep: 'David Miller',
    lastInteraction: '2026-03-16T15:30:00Z',
    nextFollowUp: '2026-03-19T14:00:00Z',
    tags: ['High Intent', 'Enterprise', 'Urgent'],
  },
  {
    id: 'lead_2',
    tenantId: tenant1Id,
    name: 'Elena Rostova',
    phone: '+1 (312) 555-6710',
    email: 'elena@novafinancial.io',
    company: 'Nova Financial',
    source: 'Website Voice Widget',
    interestedProduct: 'Acme Enterprise Suite',
    budget: '$25,000 / yr',
    stage: 'qualified',
    score: 88,
    notes: [
      'Needs automated compliance reporting and real-time transaction reconciliation.',
      'Evaluating 2 competing vendors. Budget is already pre-approved for Q2.'
    ],
    assignedRep: 'David Miller',
    lastInteraction: '2026-03-16T11:20:00Z',
    nextFollowUp: '2026-03-18T10:00:00Z',
    tags: ['Fintech', 'Pre-Approved Budget'],
  },
  {
    id: 'lead_3',
    tenantId: tenant1Id,
    name: 'Jordan Hayes',
    phone: '+1 (415) 555-3391',
    email: 'jordan@hayesmedia.agency',
    company: 'Hayes Media Agency',
    source: 'Inbound Call',
    interestedProduct: 'Acme Growth Platform',
    budget: '$10,000 / yr',
    stage: 'negotiation',
    score: 79,
    notes: [
      'Wants to connect 40 client ad accounts.',
      'Sent proposal for Growth Platform with agency multi-workspace add-on.'
    ],
    assignedRep: 'Rachel Torres',
    lastInteraction: '2026-03-15T16:45:00Z',
    nextFollowUp: '2026-03-17T17:00:00Z',
    tags: ['Agency', 'Fast Close'],
  },
  {
    id: 'lead_4',
    tenantId: tenant1Id,
    name: 'Dr. Kevin Zhao',
    phone: '+1 (617) 555-1209',
    email: 'kzhao@bostondiagnostics.org',
    company: 'Boston Diagnostics',
    source: 'Inbound Call',
    interestedProduct: 'Acme Enterprise Suite',
    budget: '$60,000 / yr',
    stage: 'contacted',
    score: 82,
    notes: [
      'Inquired about HIPAA compliance and signed BAA for patient telemetry workflows.'
    ],
    assignedRep: 'Rachel Torres',
    lastInteraction: '2026-03-16T09:15:00Z',
    nextFollowUp: '2026-03-18T13:30:00Z',
    tags: ['Healthcare', 'HIPAA'],
  }
]);

db.calls.set(tenant1Id, [
  {
    id: 'call_101',
    tenantId: tenant1Id,
    assistantId: 'asst_sarah_enterprise',
    assistantName: 'Sarah - Enterprise Sales Specialist',
    callerNumber: '+1 (212) 555-8942',
    callerName: 'Marcus Vance',
    callerCompany: 'Vanguard Logix',
    direction: 'inbound',
    status: 'completed',
    outcome: 'demo_booked',
    durationSeconds: 265,
    timestamp: '2026-03-16T15:25:35Z',
    recordingUrl: 'https://vocalpulse-recordings.storage.googleapis.com/org_acme/call_101.mp3',
    audioDuration: '4m 25s',
    summary: 'Marcus Vance (VP Engineering, Vanguard Logix) called inquiring about enterprise cloud workflow automation. Discussed 500+ pipeline throughput and 99.99% uptime SLA. Sarah addressed compliance requirements, answered questions on VPC peering, and booked a 20-min technical demo for Thursday at 2:00 PM EST.',
    transcript: [
      { speaker: 'assistant', text: 'Hi there! Thank you for calling Acme Cloud Corp. This is Sarah, your AI sales specialist. How can I assist your team today?', timestamp: '00:03' },
      { speaker: 'customer', text: 'Hey Sarah, I am Marcus from Vanguard Logix. We are currently experiencing severe bottlenecks with our pipeline automation, especially during end-of-month processing spikes. I wanted to see if Acme Enterprise can handle our volume.', timestamp: '00:15' },
      { speaker: 'assistant', text: 'It is a pleasure to meet you, Marcus. High-volume spikes are exactly what our Enterprise Suite was engineered for. We offer dedicated VPC peering and horizontally autoscaling workers that process over 50,000 events per second with sub-second latency. May I ask roughly how many pipelines your team runs concurrently?', timestamp: '00:32' },
      { speaker: 'customer', text: 'We run around 450 to 500 concurrent pipelines across two regions. Also, we require SOC2 Type II compliance and SSO. Does your enterprise tier include those out of the box?', timestamp: '00:54' },
      { speaker: 'assistant', text: 'Yes, absolutely. SOC2 Type II audit reports, SAML SSO via Okta or Azure AD, and full audit logging are all native standard features on Enterprise Suite. What does your evaluation timeline look like for rolling this out?', timestamp: '01:12' },
      { speaker: 'customer', text: 'We need to make a decision before the end of Q1, so within the next three weeks. What are the next steps for a deep dive with our lead architect?', timestamp: '01:31' },
      { speaker: 'assistant', text: 'We can set up a personalized 20-minute executive demo with our Director of Sales and Solutions Architect. I have an opening this Thursday at 2:00 PM Eastern. Would that time work well for your team?', timestamp: '01:48' },
      { speaker: 'customer', text: 'Thursday at 2:00 PM Eastern works great. Please send the calendar invite to m.vance@vanguardlogix.com.', timestamp: '02:02' },
      { speaker: 'assistant', text: 'Wonderful, Marcus! I have confirmed your calendar invitation for Thursday at 2:00 PM Eastern, and sent full architectural whitepapers to your inbox. Thank you for calling Acme Cloud, and have an exceptional day!', timestamp: '02:22' }
    ],
    aiAnalysis: {
      intent: 'Evaluate enterprise cloud pipeline capacity, compliance specs, and schedule technical demo',
      productsDiscussed: ['Acme Enterprise Suite', 'VPC Peering', 'SOC2 / SSO'],
      objections: ['Spike reliability concerns', 'Timeline constraint (3 weeks)'],
      sentiment: 'positive',
      buyingInterestScore: 95,
      questionsAsked: [
        'Can Acme handle 500 concurrent pipelines?',
        'Is SOC2 Type II and SAML SSO included out of the box?',
        'How fast can we run an architecture review?'
      ],
      recommendedAction: 'Send calendar invite confirmation with pre-demo architectural overview PDF',
      suggestedSalesStage: 'demo',
    },
    leadId: 'lead_1',
  },
  {
    id: 'call_102',
    tenantId: tenant1Id,
    assistantId: 'asst_alex_support',
    assistantName: 'Alex - Product & Inbound Support',
    callerNumber: '+1 (312) 555-6710',
    callerName: 'Elena Rostova',
    callerCompany: 'Nova Financial',
    direction: 'inbound',
    status: 'completed',
    outcome: 'qualified',
    durationSeconds: 198,
    timestamp: '2026-03-16T11:15:00Z',
    recordingUrl: 'https://vocalpulse-recordings.storage.googleapis.com/org_acme/call_102.mp3',
    audioDuration: '3m 18s',
    summary: 'Elena inquired about real-time reconciliation workflows and webhook latency. Alex confirmed sub-second response times and verified financial sector data encryption standards.',
    transcript: [
      { speaker: 'assistant', text: 'Hello! You have reached Acme Cloud product support and sales. My name is Alex. Are you exploring our APIs or looking for a product overview?', timestamp: '00:03' },
      { speaker: 'customer', text: 'Hi Alex, we need to know what latency to expect on webhook callbacks for fintech transaction logs.', timestamp: '00:14' },
      { speaker: 'assistant', text: 'Our global edge network guarantees p99 webhook delivery under 120 milliseconds worldwide, backed by automated retry queues and HMAC signature verification.', timestamp: '00:28' },
      { speaker: 'customer', text: 'That satisfies our benchmark. Can you connect me with someone regarding commercial pricing for 15 million transactions monthly?', timestamp: '00:46' },
      { speaker: 'assistant', text: 'Certainly! I have captured your requirements and assigned our Fintech Account Executive to contact you this afternoon.', timestamp: '01:02' }
    ],
    aiAnalysis: {
      intent: 'Technical API latency verification and high-volume commercial quote',
      productsDiscussed: ['Acme Enterprise Suite', 'Edge Webhooks API'],
      objections: ['Latency thresholds'],
      sentiment: 'positive',
      buyingInterestScore: 88,
      questionsAsked: ['What is p99 webhook latency?'],
      recommendedAction: 'Sales executive follow-up with volume discount matrix',
      suggestedSalesStage: 'qualified',
    },
    leadId: 'lead_2',
  }
]);

db.team.set(tenant1Id, [
  {
    id: user1Id,
    tenantId: tenant1Id,
    name: 'Ojaswitha Sreen',
    email: 'ojaswithasreen@gmail.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2026-01-15T08:00:00Z',
    lastActive: 'Just now',
  },
  {
    id: 'user_david_m',
    tenantId: tenant1Id,
    name: 'David Miller',
    email: 'david.miller@acmecloud.example.com',
    role: 'sales_manager',
    status: 'active',
    joinedAt: '2026-01-20T10:00:00Z',
    lastActive: '2 hours ago',
  },
  {
    id: 'user_rachel_t',
    tenantId: tenant1Id,
    name: 'Rachel Torres',
    email: 'rachel.torres@acmecloud.example.com',
    role: 'sales_rep',
    status: 'active',
    joinedAt: '2026-02-01T09:30:00Z',
    lastActive: '35 mins ago',
  },
  {
    id: 'user_alex_c',
    tenantId: tenant1Id,
    name: 'Alex Chen',
    email: 'alex.chen@acmecloud.example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2026-02-10T14:00:00Z',
    lastActive: '1 day ago',
  }
]);

db.integrations.set(tenant1Id, [
  {
    id: 'int_hubspot',
    tenantId: tenant1Id,
    provider: 'hubspot',
    name: 'HubSpot CRM',
    category: 'CRM',
    status: 'connected',
    lastSync: '10 mins ago',
    description: 'Auto-sync leads, call transcripts, recordings, and deal stages directly into HubSpot contacts and deals.',
    icon: 'HubSpot',
  },
  {
    id: 'int_salesforce',
    tenantId: tenant1Id,
    provider: 'salesforce',
    name: 'Salesforce Sales Cloud',
    category: 'CRM',
    status: 'disconnected',
    description: 'Bi-directional sync for Enterprise accounts, opportunity updates, and task generation.',
    icon: 'Salesforce',
  },
  {
    id: 'int_calendar',
    tenantId: tenant1Id,
    provider: 'google_calendar',
    name: 'Google Calendar',
    category: 'Calendar',
    status: 'connected',
    lastSync: 'Real-time',
    description: 'Allow AI sales assistants to check rep availability and instantly book confirmed meeting invites.',
    icon: 'Calendar',
  },
  {
    id: 'int_twilio',
    tenantId: tenant1Id,
    provider: 'twilio',
    name: 'Twilio Voice Gateway',
    category: 'Telephony',
    status: 'connected',
    lastSync: 'Real-time',
    description: 'Direct SIP trunking and number provisioning for sub-second PSTN voice termination.',
    icon: 'Phone',
  },
  {
    id: 'int_slack',
    tenantId: tenant1Id,
    provider: 'slack',
    name: 'Slack Alerts',
    category: 'Messaging',
    status: 'connected',
    lastSync: 'Active',
    description: 'Post high-intent lead notifications and call summaries instantly to #sales-leads channel.',
    icon: 'MessageSquare',
  },
  {
    id: 'int_webhooks',
    tenantId: tenant1Id,
    provider: 'webhooks',
    name: 'Outbound Webhooks',
    category: 'Webhooks',
    status: 'connected',
    lastSync: 'Active',
    description: 'Send signed JSON payloads on call completion, lead qualification, and appointment booking events.',
    icon: 'Webhook',
  }
]);

db.notifications.set(tenant1Id, [
  {
    id: 'notif_1',
    tenantId: tenant1Id,
    type: 'high_intent',
    title: 'High-Intent Enterprise Lead Qualified',
    message: 'Marcus Vance (Vanguard Logix) scored 95/100 buying interest on call with Sarah.',
    timestamp: '15 mins ago',
    isRead: false,
    link: '/dashboard/leads',
  },
  {
    id: 'notif_2',
    tenantId: tenant1Id,
    type: 'appointment',
    title: 'Demo Booked via AI Voice Call',
    message: 'Sarah confirmed executive demo with Vanguard Logix for Thursday at 2:00 PM EST.',
    timestamp: '25 mins ago',
    isRead: false,
    link: '/dashboard/calls',
  },
  {
    id: 'notif_3',
    tenantId: tenant1Id,
    type: 'knowledge',
    title: 'Knowledge Base Indexing Complete',
    message: 'Successfully generated 22 semantic chunks for "Sales Playbook 2026.docx".',
    timestamp: '2 hours ago',
    isRead: true,
    link: '/dashboard/knowledge',
  }
]);

db.auditLogs.set(tenant1Id, [
  {
    id: 'audit_1',
    tenantId: tenant1Id,
    actorName: 'Ojaswitha Sreen',
    action: 'ASSISTANT_CONFIG_UPDATED',
    target: 'Sarah - Enterprise Sales Specialist',
    ip: '198.51.100.24',
    timestamp: '2026-03-16T14:10:00Z',
  },
  {
    id: 'audit_2',
    tenantId: tenant1Id,
    actorName: 'David Miller',
    action: 'LEAD_STAGE_CHANGED',
    target: 'Marcus Vance -> Demo Booked',
    ip: '198.51.100.82',
    timestamp: '2026-03-16T15:35:00Z',
  },
  {
    id: 'audit_3',
    tenantId: tenant1Id,
    actorName: 'Alex Chen',
    action: 'INTEGRATION_CONNECTED',
    target: 'HubSpot CRM Webhook',
    ip: '198.51.100.12',
    timestamp: '2026-03-15T09:20:00Z',
  }
]);

// Seed Tenant 2: Zenith Freight Logistics (demonstrating true multi-tenant data isolation)
const tenant2Id = 'org_zenith_logistics';
db.organizations.set(tenant2Id, {
  id: tenant2Id,
  name: 'Zenith Logistics Global',
  slug: 'zenith-logistics',
  industry: 'Transportation & Supply Chain',
  size: '201-500',
  phone: '+1 (312) 800-4491',
  website: 'https://zenithlogistics.example.com',
  plan: 'pro',
  minutesUsed: 620,
  minutesLimit: 2000,
  aiAssistantsLimit: 5,
  phoneNumbersLimit: 3,
  createdAt: '2026-02-01T08:00:00Z',
  timezone: 'America/Chicago',
  currency: 'USD',
});

db.assistants.set(tenant2Id, [
  {
    id: 'asst_zenith_quote',
    tenantId: tenant2Id,
    name: 'Maya - Freight Dispatch & Rate Specialist',
    role: 'Carrier & Shipper Inbound Agent',
    voice: 'shimmer',
    language: 'English (US)',
    personality: 'Fast, precise, logistics-fluent, direct',
    tone: 'direct',
    greeting: 'Thank you for calling Zenith Logistics Global. This is Maya. Are you booking lane capacity or requesting an LTL quote?',
    instructions: 'Quote dry van and refrigerated freight lanes based on Zenith route tables, capture origin and destination zip codes, pallet count, and generate instant spot quotes.',
    salesObjective: 'Capture shipper lane commitments and onboard approved carriers.',
    qualificationQuestions: [
      'What is your origin and destination zip code?',
      'Is temperature control or liftgate required?'
    ],
    callEndingBehavior: 'Dispatch quote confirmation via SMS and confirm pickup window.',
    humanHandoffRules: 'Transfer to Heavy Haul brokerage team if weight exceeds 45,000 lbs.',
    isActive: true,
    knowledgeSourceIds: [],
    productIds: [],
    callsHandled: 98,
    avgRating: 4.7,
    conversionRate: 22.4,
  }
]);

db.phoneNumbers.set(tenant2Id, [
  {
    id: 'phone_zenith_1',
    tenantId: tenant2Id,
    number: '+13128004491',
    formatted: '+1 (312) 800-4491',
    country: 'United States',
    type: 'local',
    status: 'active',
    assignedAssistantId: 'asst_zenith_quote',
    provider: 'Telnyx',
    businessHours: {
      enabled: true,
      start: '07:00',
      end: '19:00',
      timezone: 'America/Chicago',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    callForwarding: { enabled: false, forwardTo: '' },
    voicemailFallback: { enabled: true, emailTo: 'dispatch@zenithlogistics.example.com' },
  }
]);

db.leads.set(tenant2Id, [
  {
    id: 'lead_z1',
    tenantId: tenant2Id,
    name: 'Robert Vance',
    phone: '+1 (847) 555-9012',
    email: 'rvance@midwestcold.com',
    company: 'Midwest Cold Storage',
    source: 'Inbound Call',
    interestedProduct: 'Dedicated Reefer Lane Contract',
    budget: '$85,000 / mo',
    stage: 'qualified',
    score: 91,
    notes: ['Needs 8 refrigerated truckloads weekly from Chicago to Dallas.'],
    assignedRep: 'Tom Bradley',
    lastInteraction: '2026-03-15T14:20:00Z',
    nextFollowUp: '2026-03-17T09:00:00Z',
    tags: ['Reefer', 'High Volume'],
  }
]);

db.calls.set(tenant2Id, []);
db.products.set(tenant2Id, []);
db.knowledge.set(tenant2Id, []);
db.team.set(tenant2Id, []);
db.integrations.set(tenant2Id, []);
db.notifications.set(tenant2Id, []);
db.auditLogs.set(tenant2Id, []);

// ----------------------------------------------------------------------------
// MULTI-TENANT AUTHORIZATION MIDDLEWARE
// ----------------------------------------------------------------------------
function getTenantId(req: express.Request): string {
  const headerTenant = req.headers['x-tenant-id'] as string;
  if (headerTenant && db.organizations.has(headerTenant)) {
    return headerTenant;
  }
  return tenant1Id;
}

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// 1. Auth & Session Management
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, companyName, companySize, industry, phone } = req.body;

  if (!email || !companyName) {
    return res.status(400).json({ error: 'Email and company name are required' });
  }

  // Create isolated tenant
  const slug = String(companyName || 'org').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24) || 'org';
  const newTenantId = `org_${slug}_${Date.now().toString(36)}`;
  const newUserId = `user_${Date.now().toString(36)}`;

  const newOrg: Organization = {
    id: newTenantId,
    name: companyName,
    slug,
    industry: industry || 'Technology',
    size: companySize || '11-50',
    phone: phone || '+1 (555) 000-0000',
    website: `https://${slug}.example.com`,
    plan: 'trial',
    minutesUsed: 0,
    minutesLimit: 500,
    aiAssistantsLimit: 2,
    phoneNumbersLimit: 1,
    createdAt: new Date().toISOString(),
    timezone: 'America/New_York',
    currency: 'USD',
  };

  const newUser: User = {
    id: newUserId,
    email,
    name: name || 'Admin',
    phone,
    role: 'owner',
    tenantId: newTenantId,
    emailVerified: true,
    companyName,
    companySize,
    industry,
  };

  db.organizations.set(newTenantId, newOrg);
  db.users.set(newUserId, newUser);

  // Initialize empty isolated collections for new tenant
  db.assistants.set(newTenantId, []);
  db.phoneNumbers.set(newTenantId, []);
  db.products.set(newTenantId, []);
  db.knowledge.set(newTenantId, []);
  db.leads.set(newTenantId, []);
  db.calls.set(newTenantId, []);
  db.team.set(newTenantId, [
    {
      id: newUserId,
      tenantId: newTenantId,
      name: newUser.name,
      email: newUser.email,
      role: 'owner',
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: 'Just now',
    }
  ]);
  db.integrations.set(newTenantId, [
    {
      id: `int_hub_${newTenantId}`,
      tenantId: newTenantId,
      provider: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM',
      status: 'disconnected',
      description: 'Auto-sync leads, call transcripts, recordings, and deal stages.',
      icon: 'HubSpot',
    },
    {
      id: `int_cal_${newTenantId}`,
      tenantId: newTenantId,
      provider: 'google_calendar',
      name: 'Google Calendar',
      category: 'Calendar',
      status: 'disconnected',
      description: 'Allow AI sales assistants to check rep availability and schedule calls.',
      icon: 'Calendar',
    },
    {
      id: `int_twi_${newTenantId}`,
      tenantId: newTenantId,
      provider: 'twilio',
      name: 'Twilio Voice Gateway',
      category: 'Telephony',
      status: 'disconnected',
      description: 'Direct SIP trunking and phone number provisioning.',
      icon: 'Phone',
    }
  ]);
  db.notifications.set(newTenantId, [
    {
      id: `notif_${Date.now()}`,
      tenantId: newTenantId,
      type: 'usage',
      title: 'Welcome to VocalPulse AI!',
      message: 'Your isolated workspace is ready. Complete onboarding to launch your first voice assistant.',
      timestamp: 'Just now',
      isRead: false,
    }
  ]);
  db.auditLogs.set(newTenantId, [
    {
      id: `audit_${Date.now()}`,
      tenantId: newTenantId,
      actorName: newUser.name,
      action: 'ORGANIZATION_CREATED',
      target: companyName,
      ip: '127.0.0.1',
      timestamp: new Date().toISOString(),
    }
  ]);

  res.status(201).json({
    user: newUser,
    organization: newOrg,
    token: `jwt_sim_${newUserId}`,
  });
});

app.post('/api/auth/signin', (req, res) => {
  const { email } = req.body;
  
  // Find matching user or fallback to demo user
  let user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    user = db.users.get(user1Id);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const org = db.organizations.get(user.tenantId);
  res.json({
    user,
    organization: org,
    token: `jwt_sim_${user.id}`,
  });
});

app.get('/api/auth/session', (req, res) => {
  const tenantId = getTenantId(req);
  const org = db.organizations.get(tenantId);
  const user = Array.from(db.users.values()).find((u) => u.tenantId === tenantId) || db.users.get(user1Id);

  // Return all organizations for workspace switcher preview
  const allOrganizations = Array.from(db.organizations.values());

  res.json({
    user,
    organization: org,
    availableOrganizations: allOrganizations,
  });
});

// 2. Organization / Workspace Management
app.get('/api/organizations', (req, res) => {
  res.json(Array.from(db.organizations.values()));
});

app.post('/api/organizations/switch', (req, res) => {
  const { tenantId } = req.body;
  if (!db.organizations.has(tenantId)) {
    return res.status(404).json({ error: 'Workspace not found' });
  }
  const org = db.organizations.get(tenantId);
  const user = Array.from(db.users.values()).find((u) => u.tenantId === tenantId) || {
    ...db.users.get(user1Id)!,
    tenantId,
  };

  res.json({ organization: org, user });
});

app.put('/api/organization', (req, res) => {
  const tenantId = getTenantId(req);
  const org = db.organizations.get(tenantId);
  if (!org) return res.status(404).json({ error: 'Tenant not found' });

  const updated: Organization = {
    ...org,
    ...req.body,
    id: tenantId, // Enforce isolation
  };
  db.organizations.set(tenantId, updated);
  res.json(updated);
});

// 3. Assistants
app.get('/api/assistants', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.assistants.get(tenantId) || [];
  res.json(list);
});

app.post('/api/assistants', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.assistants.get(tenantId) || [];

  const newAsst: Assistant = {
    id: `asst_${Date.now().toString(36)}`,
    tenantId,
    name: req.body.name || 'New Sales Assistant',
    role: req.body.role || 'Sales Representative',
    voice: req.body.voice || 'nova',
    voiceGender: req.body.voiceGender || (req.body.voice === 'onyx' ? 'male' : 'female'),
    language: req.body.language || 'English (US)',
    primaryLanguageCode: req.body.primaryLanguageCode || 'en-US',
    accent: req.body.accent || 'American Standard',
    speakingSpeed: req.body.speakingSpeed ?? 1.0,
    pitch: req.body.pitch ?? 1.05,
    supportedLanguages: req.body.supportedLanguages || ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN'],
    autoDetectLanguage: req.body.autoDetectLanguage ?? true,
    allowCodeSwitching: req.body.allowCodeSwitching ?? true,
    localizedGreetings: req.body.localizedGreetings || {},
    personality: req.body.personality || 'Professional and consultative',
    tone: req.body.tone || 'consultative',
    greeting: req.body.greeting || 'Hello! Thank you for calling. How can I assist you today?',
    instructions: req.body.instructions || 'You are an AI sales assistant. Qualify customer intent and schedule meetings. You are multilingual and detect customer languages automatically.',
    salesObjective: req.body.salesObjective || 'Lead qualification and discovery',
    qualificationQuestions: req.body.qualificationQuestions || ['What problem are you looking to solve?'],
    callEndingBehavior: req.body.callEndingBehavior || 'Confirm next steps and thank the caller.',
    humanHandoffRules: req.body.humanHandoffRules || 'Transfer if caller requests human sales executive.',
    isActive: true,
    knowledgeSourceIds: req.body.knowledgeSourceIds || [],
    productIds: req.body.productIds || [],
    callsHandled: 0,
    avgRating: 5.0,
    conversionRate: 0,
  };

  list.push(newAsst);
  db.assistants.set(tenantId, list);

  // Add audit log
  const logs = db.auditLogs.get(tenantId) || [];
  logs.unshift({
    id: `audit_${Date.now()}`,
    tenantId,
    actorName: 'Ojaswitha Sreen',
    action: 'ASSISTANT_CREATED',
    target: newAsst.name,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  db.auditLogs.set(tenantId, logs);

  res.status(201).json(newAsst);
});

app.put('/api/assistants/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.assistants.get(tenantId) || [];
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Assistant not found' });

  list[idx] = {
    ...list[idx],
    ...req.body,
    id: req.params.id,
    tenantId,
  };
  db.assistants.set(tenantId, list);
  res.json(list[idx]);
});

app.delete('/api/assistants/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.assistants.get(tenantId) || [];
  const filtered = list.filter((a) => a.id !== req.params.id);
  db.assistants.set(tenantId, filtered);
  res.json({ success: true });
});

// 4. Phone Numbers & Telephony
app.get('/api/phone-numbers', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.phoneNumbers.get(tenantId) || []);
});

app.post('/api/phone-numbers', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.phoneNumbers.get(tenantId) || [];

  const area = req.body.areaCode || '415';
  const randNum = Math.floor(1000000 + Math.random() * 9000000);
  const rawNumber = `+1${area}${randNum.toString().slice(0, 7)}`;
  const formatted = `+1 (${area}) ${randNum.toString().slice(0, 3)}-${randNum.toString().slice(3, 7)}`;

  const newNumber: PhoneNumber = {
    id: `phone_${Date.now().toString(36)}`,
    tenantId,
    number: rawNumber,
    formatted,
    country: 'United States',
    type: req.body.type || 'local',
    status: 'active',
    assignedAssistantId: req.body.assignedAssistantId || (db.assistants.get(tenantId)?.[0]?.id),
    provider: req.body.provider || 'VocalPulse VoiceNet',
    businessHours: {
      enabled: true,
      start: '08:00',
      end: '18:00',
      timezone: 'America/New_York',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    callForwarding: { enabled: false, forwardTo: '' },
    voicemailFallback: { enabled: true, emailTo: 'sales@example.com' },
  };

  list.push(newNumber);
  db.phoneNumbers.set(tenantId, list);
  res.status(201).json(newNumber);
});

app.put('/api/phone-numbers/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.phoneNumbers.get(tenantId) || [];
  const idx = list.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Phone number not found' });

  list[idx] = { ...list[idx], ...req.body, id: req.params.id, tenantId };
  db.phoneNumbers.set(tenantId, list);
  res.json(list[idx]);
});

// 5. Products & Services
app.get('/api/products', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.products.get(tenantId) || []);
});

app.post('/api/products', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.products.get(tenantId) || [];

  const newProd: Product = {
    id: `prod_${Date.now().toString(36)}`,
    tenantId,
    name: req.body.name || 'New Service',
    description: req.body.description || '',
    price: req.body.price || '$99 / month',
    billingCycle: req.body.billingCycle || 'monthly',
    features: req.body.features || [],
    benefits: req.body.benefits || [],
    availability: req.body.availability || 'in_stock',
    faqs: req.body.faqs || [],
    targetCustomer: req.body.targetCustomer || 'Growing businesses',
    salesRestrictions: req.body.salesRestrictions || '',
  };

  list.push(newProd);
  db.products.set(tenantId, list);
  res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.products.get(tenantId) || [];
  const idx = list.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  list[idx] = { ...list[idx], ...req.body, id: req.params.id, tenantId };
  db.products.set(tenantId, list);
  res.json(list[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.products.get(tenantId) || [];
  db.products.set(tenantId, list.filter((p) => p.id !== req.params.id));
  res.json({ success: true });
});

// 6. Knowledge Base
app.get('/api/knowledge', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.knowledge.get(tenantId) || []);
});

app.post('/api/knowledge', async (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.knowledge.get(tenantId) || [];

  const { title, type, content } = req.body;
  const chunkCount = Math.max(1, Math.ceil((content || '').length / 400));

  const newDoc: KnowledgeSource = {
    id: `kn_${Date.now().toString(36)}`,
    tenantId,
    title: title || 'Knowledge Document',
    type: type || 'manual',
    content: content || '',
    status: 'indexed',
    chunkCount,
    sizeBytes: Buffer.byteLength(content || '', 'utf8'),
    updatedAt: new Date().toISOString(),
  };

  list.push(newDoc);
  db.knowledge.set(tenantId, list);

  // Send notification
  const notifs = db.notifications.get(tenantId) || [];
  notifs.unshift({
    id: `notif_${Date.now()}`,
    tenantId,
    type: 'knowledge',
    title: 'Knowledge Document Processed',
    message: `Processed "${newDoc.title}" into ${chunkCount} indexed semantic chunks.`,
    timestamp: 'Just now',
    isRead: false,
    link: '/dashboard/knowledge',
  });
  db.notifications.set(tenantId, notifs);

  res.status(201).json(newDoc);
});

app.delete('/api/knowledge/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.knowledge.get(tenantId) || [];
  db.knowledge.set(tenantId, list.filter((k) => k.id !== req.params.id));
  res.json({ success: true });
});

// 7. Leads / CRM
app.get('/api/leads', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.leads.get(tenantId) || []);
});

app.post('/api/leads', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.leads.get(tenantId) || [];

  const newLead: Lead = {
    id: `lead_${Date.now().toString(36)}`,
    tenantId,
    name: req.body.name || 'New Inbound Prospect',
    phone: req.body.phone || '+1 (555) 000-0000',
    email: req.body.email || 'prospect@example.com',
    company: req.body.company || 'Enterprise Prospect',
    source: req.body.source || 'Inbound Call',
    interestedProduct: req.body.interestedProduct || 'Enterprise Solution',
    budget: req.body.budget || 'Custom Quote',
    stage: req.body.stage || 'new',
    score: req.body.score || 75,
    notes: req.body.notes || [],
    assignedRep: req.body.assignedRep || 'Ojaswitha Sreen',
    lastInteraction: new Date().toISOString(),
    nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString(),
    tags: req.body.tags || ['New Lead'],
  };

  list.unshift(newLead);
  db.leads.set(tenantId, list);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.leads.get(tenantId) || [];
  const idx = list.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lead not found' });

  list[idx] = { ...list[idx], ...req.body, id: req.params.id, tenantId };
  db.leads.set(tenantId, list);
  res.json(list[idx]);
});

// 8. Calls & Recordings
app.get('/api/calls', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.calls.get(tenantId) || []);
});

app.get('/api/calls/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.calls.get(tenantId) || [];
  const call = list.find((c) => c.id === req.params.id);
  if (!call) return res.status(404).json({ error: 'Call record not found' });
  res.json(call);
});

// 9. Team Management & Audit Logs
app.get('/api/team', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.team.get(tenantId) || []);
});

app.post('/api/team/invite', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.team.get(tenantId) || [];
  const { name, email, role } = req.body;

  const newMember: TeamMember = {
    id: `user_${Date.now().toString(36)}`,
    tenantId,
    name: name || 'Team Member',
    email,
    role: role || 'sales_rep',
    status: 'invited',
    joinedAt: new Date().toISOString(),
    lastActive: 'Invitation Pending',
  };

  list.push(newMember);
  db.team.set(tenantId, list);

  // Add audit log
  const logs = db.auditLogs.get(tenantId) || [];
  logs.unshift({
    id: `audit_${Date.now()}`,
    tenantId,
    actorName: 'Ojaswitha Sreen',
    action: 'TEAM_MEMBER_INVITED',
    target: `${email} (${role})`,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  db.auditLogs.set(tenantId, logs);

  res.status(201).json(newMember);
});

app.delete('/api/team/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.team.get(tenantId) || [];
  db.team.set(tenantId, list.filter((m) => m.id !== req.params.id));
  res.json({ success: true });
});

app.get('/api/audit-logs', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.auditLogs.get(tenantId) || []);
});

// 10. Integrations
app.get('/api/integrations', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.integrations.get(tenantId) || []);
});

app.post('/api/integrations/:id/toggle', (req, res) => {
  const tenantId = getTenantId(req);
  const list = db.integrations.get(tenantId) || [];
  const item = list.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Integration not found' });

  item.status = item.status === 'connected' ? 'disconnected' : 'connected';
  item.lastSync = item.status === 'connected' ? 'Just now' : undefined;
  res.json(item);
});

// 11. Notifications
app.get('/api/notifications', (req, res) => {
  const tenantId = getTenantId(req);
  res.json(db.notifications.get(tenantId) || []);
});

app.post('/api/notifications/read-all', (req, res) => {
  const tenantId = getTenantId(req);
  const notifs = db.notifications.get(tenantId) || [];
  notifs.forEach((n) => (n.isRead = true));
  res.json({ success: true });
});

// 12. Billing & Subscription
app.get('/api/billing', (req, res) => {
  const tenantId = getTenantId(req);
  const org = db.organizations.get(tenantId);
  res.json({
    organization: org,
    plans: [
      {
        id: 'trial',
        name: 'Free Trial',
        priceMonthly: 0,
        priceAnnually: 0,
        minutesIncluded: 500,
        assistantsLimit: 1,
        numbersIncluded: 1,
        features: ['500 voice minutes', '1 AI voice assistant', '1 phone number', 'Standard transcripts', 'Community support'],
      },
      {
        id: 'pro',
        name: 'Pro Sales',
        priceMonthly: 149,
        priceAnnually: 119,
        minutesIncluded: 2000,
        assistantsLimit: 5,
        numbersIncluded: 3,
        features: ['2,000 voice minutes', '5 AI assistants', '3 phone numbers', 'CRM & Calendar sync', 'AI Sales Intelligence', 'Email & chat support'],
        isPopular: true,
      },
      {
        id: 'business',
        name: 'Business Growth',
        priceMonthly: 399,
        priceAnnually: 319,
        minutesIncluded: 6000,
        assistantsLimit: 15,
        numbersIncluded: 10,
        features: ['6,000 voice minutes', '15 AI assistants', '10 phone numbers', 'Full CRM integration (HubSpot/Salesforce)', 'Custom knowledge embeddings', 'Role-based access & team management', 'Dedicated account manager'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise Scale',
        priceMonthly: 999,
        priceAnnually: 799,
        minutesIncluded: 25000,
        assistantsLimit: 50,
        numbersIncluded: 30,
        features: ['25,000+ voice minutes', 'Unlimited AI assistants', 'Custom SIP trunks & Twilio Bring-Your-Own-Carrier', 'Custom fine-tuned voice models', 'Dedicated VPC & 99.99% SLA', 'SOC2 compliance guarantee'],
      }
    ],
    invoices: [
      { id: 'INV-2026-003', date: 'Mar 1, 2026', amount: '$399.00', status: 'Paid', pdfUrl: '#' },
      { id: 'INV-2026-002', date: 'Feb 1, 2026', amount: '$399.00', status: 'Paid', pdfUrl: '#' },
      { id: 'INV-2026-001', date: 'Jan 15, 2026', amount: '$399.00', status: 'Paid', pdfUrl: '#' },
    ]
  });
});

app.post('/api/billing/upgrade', (req, res) => {
  const tenantId = getTenantId(req);
  const org = db.organizations.get(tenantId);
  if (!org) return res.status(404).json({ error: 'Tenant not found' });

  const { plan } = req.body;
  org.plan = plan;
  if (plan === 'business') {
    org.minutesLimit = 6000;
    org.aiAssistantsLimit = 15;
    org.phoneNumbersLimit = 10;
  } else if (plan === 'pro') {
    org.minutesLimit = 2000;
    org.aiAssistantsLimit = 5;
    org.phoneNumbersLimit = 3;
  } else if (plan === 'enterprise') {
    org.minutesLimit = 25000;
    org.aiAssistantsLimit = 50;
    org.phoneNumbersLimit = 30;
  }

  res.json(org);
});

// ----------------------------------------------------------------------------
// REAL AI VOICE AGENT INTERACTION & INTELLIGENCE WITH GEMINI
// ----------------------------------------------------------------------------

app.post('/api/ai/test-assistant', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { assistantId, userMessage = '', conversationHistory = [], currentLanguage } = req.body;

    const assistants = db.assistants.get(tenantId) || [];
    const assistant = assistants.find((a) => a.id === assistantId) || assistants[0];
    const products = db.products.get(tenantId) || [];
    const knowledge = db.knowledge.get(tenantId) || [];
    const org = db.organizations.get(tenantId);

    const genAI = getGenAI();

    // Multilingual configuration
    const supportedCodes = assistant?.supportedLanguages && assistant.supportedLanguages.length > 0
      ? assistant.supportedLanguages
      : ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN', 'it-IT', 'ar-SA'];

    const autoDetect = assistant?.autoDetectLanguage !== false;
    let detectedFromMessage = autoDetect ? detectLanguageFromText(userMessage, supportedCodes) : null;

    let activeLang = getLanguageByCode(assistant?.primaryLanguageCode || assistant?.language || 'en-US');
    let languageSwitched = false;

    if (detectedFromMessage) {
      if (currentLanguage && detectedFromMessage.code !== currentLanguage) {
        languageSwitched = true;
      }
      activeLang = detectedFromMessage;
    } else if (currentLanguage) {
      activeLang = getLanguageByCode(currentLanguage);
    }

    // Prepare ground knowledge and prompt
    const knowledgeSummary = knowledge.map((k) => `[Document: ${k.title}]\n${k.content}`).join('\n\n');
    const productsSummary = products.map((p) => `Product: ${p.name}\nPrice: ${p.price}\nFeatures: ${p.features.join(', ')}\nBenefits: ${p.benefits.join(', ')}`).join('\n\n');

    const voiceGender = assistant?.voiceGender || (assistant?.voice === 'onyx' ? 'male' : 'female');
    const accent = assistant?.accent || activeLang.accent;
    const speed = assistant?.speakingSpeed ?? 1.0;

    const systemPrompt = `You are ${assistant?.name || 'Sarah - Enterprise Sales Specialist'}, representing ${org?.name || 'Acme Cloud Corp'}.
Role: ${assistant?.role || 'Enterprise Sales Specialist'}
Tone: ${assistant?.tone || 'consultative and professional'}.
Voice Persona & Gender: ${voiceGender === 'male' ? 'Male' : 'Female'} (${assistant?.voice || 'nova'}). Maintain a natural, warm, crisp, and articulate telephone conversational presence.
Speaking Cadence & Speed: ${speed}x normal speed with an ${accent} accent.

MULTILINGUAL INTELLIGENCE & CALLER LANGUAGE RULES:
- Primary Language: ${assistant?.language || 'English (US)'}.
- Authorized Supported Languages: ${supportedCodes.join(', ')}.
- CURRENT TARGET LANGUAGE FOR THIS TURN: ${activeLang.name} (${activeLang.code} - ${activeLang.nativeName}).
- YOU MUST RESPOND DIRECTLY AND ENTIRELY IN ${activeLang.name.toUpperCase()}.
- Mid-Call Language Switching: If the caller switches between English, Spanish, French, German, Hindi, Japanese, or any supported language, switch seamlessly to match their language without breaking character or explaining the switch.
- Knowledge Retrieval: Ground all your statements in the company knowledge and authorized products below. Translate all facts, pricing terms, security assurances, and feature descriptions accurately and persuasively into ${activeLang.name}.

Primary Sales Objective: ${assistant?.salesObjective || 'Qualify prospect and offer demo'}.
Specific Instructions: ${assistant?.instructions || 'Be conversational, concise, and helpful'}.
Qualification Questions to weave into conversation naturally (translated into ${activeLang.name}):
${(assistant?.qualificationQuestions || []).map((q, idx) => `${idx + 1}. ${q}`).join('\n')}

Human Handoff Trigger: ${assistant?.humanHandoffRules || 'If asked for a human manager or pricing dispute'}

Company & Product Authorized Knowledge:
${knowledgeSummary || 'Leading B2B solution provider'}

Authorized Products:
${productsSummary || 'Enterprise software and consulting'}

CRITICAL VOICE CONVERSATION RULES:
1. Speak as if talking live over a telephone call with a ${voiceGender} voice. Keep responses crisp, conversational, and direct (1-3 sentences maximum per turn).
2. Avoid bullet points, asterisks, markdown headers, or numbered lists in your spoken response. Speak in natural conversational prose suitable for text-to-speech.
3. If the caller expresses interest or asks a question, answer accurately from the knowledge base in ${activeLang.name}, then politely advance toward qualifying questions or scheduling an executive demo.
4. If the caller asks for a human or has an objection that triggers human handoff rules, gracefully offer to transfer to a human specialist.`;

    if (genAI) {
      // Build conversation contents
      const formattedContents = conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      }));

      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const aiResponse = response.text || activeLang.sampleGreeting;
      return res.json({
        text: aiResponse,
        assistantName: assistant?.name,
        voice: assistant?.voice || 'nova',
        voiceGender,
        detectedLanguage: activeLang.code,
        detectedLanguageName: activeLang.name,
        flag: activeLang.flag,
        languageSwitched,
        speakingSpeed: speed,
        pitch: assistant?.pitch ?? (voiceGender === 'female' ? 1.05 : 0.95),
      });
    } else {
      // High-quality multilingual fallback if GEMINI_API_KEY is not set
      const lower = userMessage.toLowerCase();
      const firstProduct = products[0]?.name || 'Acme Cloud Platform';
      const priceTag = products[0]?.price || '$790/mo';
      let fallbackText = '';

      const langPrefix = activeLang.code.slice(0, 2);

      if (langPrefix === 'es') {
        if (lower.includes('precio') || lower.includes('cost') || lower.includes('cuanto') || lower.includes('cuánto')) {
          fallbackText = `Nuestras soluciones empresariales para ${firstProduct} comienzan desde ${priceTag}, incluyendo soporte 24/7 y SLA garantizado. ¿Desea que agendemos una demostración ejecutiva de 15 minutos esta semana?`;
        } else if (lower.includes('demo') || lower.includes('demostracion') || lower.includes('demostración') || lower.includes('agendar')) {
          fallbackText = `¡Excelente! Me encantará coordinar una demostración personalizada con nuestro equipo de arquitectura en la nube. ¿Qué día de esta semana le viene mejor?`;
        } else {
          fallbackText = `Gracias por comunicarse con Acme Cloud Corp. Ayudamos a automatizar flujos de datos y llamadas de ventas a gran escala. ¿Cuántos miembros de su equipo requerirían acceso a la plataforma?`;
        }
      } else if (langPrefix === 'fr') {
        if (lower.includes('prix') || lower.includes('combien') || lower.includes('cout') || lower.includes('coût')) {
          fallbackText = `Nos forfaits pour ${firstProduct} débutent à ${priceTag} avec une infrastructure infonuagique haute performance. Souhaitez-vous planifier une présentation technique cette semaine ?`;
        } else if (lower.includes('demo') || lower.includes('rendez-vous') || lower.includes('démonstration')) {
          fallbackText = `Avec grand plaisir ! Je peux vous organiser une démonstration personnalisée avec un ingénieur solutions. Quel jour vous conviendrait le mieux ?`;
        } else {
          fallbackText = `Merci d'avoir contacté Acme Cloud Corp. Nous optimisons vos processus d'entreprise avec intelligence et sécurité. Combien d'utilisateurs prévoyez-vous d'équiper ?`;
        }
      } else if (langPrefix === 'de') {
        if (lower.includes('preis') || lower.includes('wieviel') || lower.includes('kosten')) {
          fallbackText = `Unsere Enterprise-Tarife für ${firstProduct} starten bei ${priceTag} mit dedizierter VPC und 99,99% SLA. Möchten Sie einen kurzen Demo-Termin vereinbaren?`;
        } else if (lower.includes('demo') || lower.includes('termin') || lower.includes('präsentation')) {
          fallbackText = `Sehr gerne! Ich plane gerne eine persönliche Demonstration für Ihr Team ein. Welcher Wochentag passt Ihnen am besten?`;
        } else {
          fallbackText = `Herzlichen Dank für Ihre Kontaktaufnahme bei Acme Cloud Corp. Wir automatisieren Vertriebs- und Datenworkflows für Unternehmen. Wie viele Mitarbeiter sollen die Plattform nutzen?`;
        }
      } else if (langPrefix === 'pt') {
        if (lower.includes('preco') || lower.includes('preço') || lower.includes('quanto') || lower.includes('custa')) {
          fallbackText = `Nossas soluções para ${firstProduct} começam a partir de ${priceTag} com alta disponibilidade e conformidade total de dados. Gostaria de agendar uma breve demonstração?`;
        } else if (lower.includes('demo') || lower.includes('demonstracao') || lower.includes('demonstração') || lower.includes('reuniao')) {
          fallbackText = `Com certeza! Terei o maior prazer em agendar uma demonstração exclusiva com nossos engenheiros de soluções. Qual horário fica melhor para você?`;
        } else {
          fallbackText = `Muito obrigado por ligar para a Acme Cloud Corp. Especializamo-nos em inteligência de vendas e automação em nuvem. Qual é o principal desafio da sua equipe hoje?`;
        }
      } else if (langPrefix === 'hi') {
        fallbackText = `Acme Cloud Corp में संपर्क करने के लिए धन्यवाद। हमारा ${firstProduct} सॉल्यूशन ${priceTag} से शुरू होता है। क्या आप इस सप्ताह एक 20 मिनट का लाइव डेमो शेड्यूल करना चाहेंगे?`;
      } else if (langPrefix === 'ja') {
        fallbackText = `Acme Cloud Corpへのお問い合わせありがとうございます。弊社の${firstProduct}は月額${priceTag}から導入いただけます。今週、製品デモをご案内いたしましょうか？`;
      } else if (langPrefix === 'zh') {
        fallbackText = `感谢致电Acme Cloud Corp。我们的${firstProduct}企业套件起始定价为每月${priceTag}。请问您是否希望本周安排一次专属的产品演示？`;
      } else if (langPrefix === 'it') {
        fallbackText = `Grazie per aver contattato Acme Cloud Corp. I nostri piani per ${firstProduct} partono da ${priceTag} al mese. Desidera programmare una dimostrazione personalizzata questa settimana?`;
      } else {
        // English default
        if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
          fallbackText = `Our enterprise packages for ${firstProduct} start at ${priceTag}, with custom scaling, dedicated VPC, and 24/7 technical support. Would you like to schedule a quick 15-minute walkthrough this week?`;
        } else if (lower.includes('demo') || lower.includes('schedule') || lower.includes('meeting')) {
          fallbackText = `I would be thrilled to arrange a personalized architecture demo with our engineering solutions team. What day this week works best for your schedule?`;
        } else {
          fallbackText = `Thank you for reaching out to Acme Cloud Corp. We help modern enterprises automate sales workflows and high-volume communication. Could you share a bit more about your current team size and primary timeline?`;
        }
      }

      return res.json({
        text: fallbackText,
        assistantName: assistant?.name,
        voice: assistant?.voice || 'nova',
        voiceGender,
        detectedLanguage: activeLang.code,
        detectedLanguageName: activeLang.name,
        flag: activeLang.flag,
        languageSwitched,
        speakingSpeed: speed,
        pitch: assistant?.pitch ?? (voiceGender === 'female' ? 1.05 : 0.95),
      });
    }
  } catch (err: any) {
    console.error('AI assistant test error:', err);
    res.status(500).json({
      error: 'Failed to process assistant dialogue',
      message: err?.message || 'AI service unavailable',
    });
  }
});

// AI Call Simulation (generates realistic completed calls & transcripts)
app.post('/api/ai/simulate-call', async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { assistantId, callerName = 'Jordan Rivera', callerCompany = 'Apex Dynamics', callerPhone = '+1 (415) 555-7788', scenario = 'Enterprise Inbound Interest' } = req.body;

    const assistants = db.assistants.get(tenantId) || [];
    const assistant = assistants.find((a) => a.id === assistantId) || assistants[0];
    const org = db.organizations.get(tenantId);
    const products = db.products.get(tenantId) || [];

    const callId = `call_${Date.now().toString(36)}`;
    const now = new Date();

    const genAI = getGenAI();
    let transcriptTurns: any[] = (req.body.transcriptTurns && req.body.transcriptTurns.length > 0)
      ? req.body.transcriptTurns
      : [];
    let summary = '';
    let analysis: any = null;

    if (transcriptTurns.length > 0) {
      summary = `${callerName} from ${callerCompany} engaged in a live simulated voice conversation with ${assistant?.name || 'the AI Assistant'}. Key topics and requirements were discussed.`;
      analysis = {
        intent: 'Inbound sales evaluation and product discovery call',
        productsDiscussed: [products[0]?.name || 'Standard Offering'],
        objections: ['Implementation timeline'],
        sentiment: 'positive',
        buyingInterestScore: 88,
        questionsAsked: ['How does your platform handle data security?', 'What is the implementation timeline?'],
        recommendedAction: 'Schedule follow-up product demonstration and share pricing schedule',
        suggestedSalesStage: 'qualified',
      };
    } else if (genAI) {
      const prompt = `Simulate an authentic 4-turn B2B sales telephone call between an AI Sales Assistant (${assistant?.name || 'Sarah'}) for ${org?.name || 'our company'} and an inbound caller (${callerName} from ${callerCompany}).
Scenario: ${scenario}.
Products: ${products.map(p => p.name).join(', ')}.

Return ONLY a valid JSON object strictly matching this format without markdown code fences:
{
  "transcript": [
    {"speaker": "assistant", "text": "...", "timestamp": "00:03"},
    {"speaker": "customer", "text": "...", "timestamp": "00:14"},
    {"speaker": "assistant", "text": "...", "timestamp": "00:26"},
    {"speaker": "customer", "text": "...", "timestamp": "00:41"}
  ],
  "summary": "Concise executive summary of call outcome",
  "aiAnalysis": {
    "intent": "Caller intent",
    "productsDiscussed": ["Product A"],
    "objections": ["Objection 1"],
    "sentiment": "positive",
    "buyingInterestScore": 88,
    "questionsAsked": ["Question 1"],
    "recommendedAction": "Actionable sales follow-up step",
    "suggestedSalesStage": "demo"
  }
}`;

      try {
        const aiRes = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.6,
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(aiRes.text || '{}');
        if (parsed.transcript && parsed.summary) {
          transcriptTurns = parsed.transcript;
          summary = parsed.summary;
          analysis = parsed.aiAnalysis;
        }
      } catch (parseErr) {
        console.warn('Gemini parse fallback', parseErr);
      }
    }

    if (!transcriptTurns.length) {
      transcriptTurns = [
        { speaker: 'assistant', text: `Hi there! Thank you for calling ${org?.name}. This is ${assistant?.name || 'Sarah'}. How can I assist you today?`, timestamp: '00:03' },
        { speaker: 'customer', text: `Hello, I am ${callerName} with ${callerCompany}. We are exploring automated solutions to streamline our sales qualification calls and need to integrate with our CRM.`, timestamp: '00:15' },
        { speaker: 'assistant', text: `It is great to connect with you, ${callerName}. We offer native 2-way sync with HubSpot and Salesforce, plus custom webhooks. How many monthly inbound calls does your team currently handle?`, timestamp: '00:32' },
        { speaker: 'customer', text: `We handle roughly 3,000 to 5,000 calls a month. Could you email over an architectural overview and schedule a team walkthrough for early next week?`, timestamp: '00:48' },
        { speaker: 'assistant', text: `Absolutely! I have noted your contact details and will send over our security and architecture specs right away. Let us connect Tuesday at 10:00 AM. Thank you!`, timestamp: '01:04' }
      ];
      summary = `${callerName} from ${callerCompany} inquired about CRM integration and handling 3,000-5,000 monthly calls. Assistant verified HubSpot/Salesforce connectors and booked demo for Tuesday 10:00 AM.`;
      analysis = {
        intent: 'CRM integration inquiry and high-volume sales qualification deployment',
        productsDiscussed: [products[0]?.name || 'Enterprise Suite', 'HubSpot / Salesforce 2-Way Sync'],
        objections: ['High call volume reliability'],
        sentiment: 'positive',
        buyingInterestScore: 92,
        questionsAsked: ['Does the platform integrate natively with Salesforce?', 'Can it handle 5,000 calls per month?'],
        recommendedAction: 'Send calendar invite and architecture whitepaper to prospect',
        suggestedSalesStage: 'demo',
      };
    }

    const safeCallerName = String(callerName || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '.');
    const safeCallerCompany = String(callerCompany || 'prospect').toLowerCase().replace(/[^a-z0-9]/g, '');

    // Auto-create lead in CRM
    const leads = db.leads.get(tenantId) || [];
    const newLead: Lead = {
      id: `lead_${Date.now().toString(36)}`,
      tenantId,
      name: callerName || 'Valued Caller',
      phone: callerPhone || '+1 (555) 000-0000',
      email: `${safeCallerName || 'prospect'}@${safeCallerCompany || 'company'}.com`,
      company: callerCompany || 'Enterprise Client',
      source: 'Inbound Call',
      interestedProduct: analysis?.productsDiscussed?.[0] || 'Enterprise Suite',
      budget: '$20,000 - $40,000 / yr',
      stage: analysis?.suggestedSalesStage || 'qualified',
      score: analysis?.buyingInterestScore || 85,
      notes: [summary, `AI Recommended Next Action: ${analysis?.recommendedAction}`],
      assignedRep: 'Ojaswitha Sreen',
      lastInteraction: now.toISOString(),
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString(),
      callId,
      tags: ['AI Qualified', 'High Intent'],
    };
    leads.unshift(newLead);
    db.leads.set(tenantId, leads);

    // Save Call Record
    const calls = db.calls.get(tenantId) || [];
    const newCall: CallRecord = {
      id: callId,
      tenantId,
      assistantId: assistant?.id || 'asst_1',
      assistantName: assistant?.name || 'Sales Voice Agent',
      callerNumber: callerPhone || '+1 (555) 000-0000',
      callerName: callerName || 'Valued Caller',
      callerCompany: callerCompany || 'Enterprise Client',
      direction: 'inbound',
      status: 'completed',
      outcome: analysis?.suggestedSalesStage === 'demo' ? 'demo_booked' : 'qualified',
      durationSeconds: 184,
      timestamp: now.toISOString(),
      recordingUrl: `https://vocalpulse-recordings.storage.googleapis.com/${tenantId}/${callId}.mp3`,
      audioDuration: '3m 04s',
      transcript: transcriptTurns,
      summary,
      aiAnalysis: analysis,
      leadId: newLead.id,
    };
    calls.unshift(newCall);
    db.calls.set(tenantId, calls);

    // Increment tenant minutes
    if (org) {
      org.minutesUsed += 3;
    }

    // Add Notification
    const notifs = db.notifications.get(tenantId) || [];
    notifs.unshift({
      id: `notif_${Date.now()}`,
      tenantId,
      type: 'high_intent',
      title: `New High-Intent Call: ${callerName}`,
      message: `${callerName} (${callerCompany}) scored ${analysis?.buyingInterestScore}/100. Demo suggested.`,
      timestamp: 'Just now',
      isRead: false,
      link: '/dashboard/calls',
    });
    db.notifications.set(tenantId, notifs);

    res.status(201).json({ call: newCall, lead: newLead });
  } catch (err: any) {
    console.error('Call simulation error:', err);
    res.status(500).json({ error: 'Call simulation failed', message: err?.message });
  }
});

// ----------------------------------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VocalPulse AI Multi-Tenant SaaS server running on port ${PORT}`);
  });
}

startServer();
