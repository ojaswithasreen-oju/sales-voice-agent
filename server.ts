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
  HandoffTriggerReason,
  HandoffBrief,
  FollowUpTask,
  CallImportantMoment,
  CompetitorMention,
  LeadQualificationBANT,
  CompanyConversationAnalytics,
  ImprovementCategory,
  ImprovementStatus,
  AiImprovementSuggestion,
  KnowledgeVersion,
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
  followUpTasks: Map<string, FollowUpTask[]>;
  improvementSuggestions: Map<string, AiImprovementSuggestion[]>;
  knowledgeVersions: Map<string, KnowledgeVersion[]>;
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
  followUpTasks: new Map(),
  improvementSuggestions: new Map(),
  knowledgeVersions: new Map(),
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
    callerPhone: '+1 (212) 555-8942',
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
      callerIntent: 'Enterprise Evaluation & Demo Booking',
      mainRequirement: '500+ concurrent pipeline processing capacity with sub-second latency and SOC2 Type II compliance',
      productsDiscussed: ['Acme Enterprise Suite', 'VPC Peering', 'SOC2 / SSO Engine'],
      objections: ['Spike reliability concerns', 'Timeline constraint (3 weeks)'],
      customerObjections: ['Spike reliability concerns during month-end', 'Strict 3-week rollout deadline'],
      buyingSignals: [
        'Explicit decision timeline stated (end of Q1 / 3 weeks)',
        'Authority confirmed (VP Engineering with sign-off)',
        'Calendar invite provided and accepted for Thursday demo'
      ],
      sentiment: 'positive',
      buyingInterestScore: 95,
      questionsAsked: [
        'Can Acme handle 500 concurrent pipelines?',
        'Is SOC2 Type II and SAML SSO included out of the box?',
        'How fast can we run an architecture review?'
      ],
      importantMoments: [
        { timestamp: '00:15', title: 'Bottleneck Stated', description: 'Customer explained severe month-end pipeline spikes', type: 'requirement' },
        { timestamp: '00:54', title: 'Security & Compliance Gate', description: 'Inquired whether SOC2 Type II and SSO are native', type: 'question' },
        { timestamp: '01:12', title: 'Timeline Urgency Signal', description: 'Decision deadline set within 3 weeks (Q1 close)', type: 'signal' },
        { timestamp: '01:48', title: 'Demo Scheduled', description: 'Confirmed Thursday 2:00 PM Eastern slot', type: 'signal' }
      ],
      competitorMentions: [
        { competitor: 'AWS Step Functions', context: 'Customer migrating away due to maintenance overhead and latency', sentiment: 'favorable_to_us' }
      ],
      leadQualification: {
        bantScore: 94,
        budget: 'Enterprise tier ($50,000+ budget confirmed)',
        authority: 'Marcus Vance, VP Engineering (Direct Decision Maker)',
        need: 'Urgent replacement for bottlenecked pipeline infrastructure',
        timeline: '3 weeks (end of current quarter)',
        status: 'qualified',
      },
      recommendedAction: 'Send calendar invite confirmation with pre-demo architectural overview PDF',
      recommendedNextSteps: 'Solutions Architect to review AWS Step Functions migration worksheet before Thursday call.',
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
    callerPhone: '+1 (312) 555-6710',
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
      { speaker: 'customer', text: 'Hi Alex, we need to know what latency to expect on webhook callbacks for fintech transaction logs. We had latency issues with Twilio and generic providers.', timestamp: '00:14' },
      { speaker: 'assistant', text: 'Our global edge network guarantees p99 webhook delivery under 120 milliseconds worldwide, backed by automated retry queues and HMAC signature verification.', timestamp: '00:28' },
      { speaker: 'customer', text: 'That satisfies our benchmark. Can you connect me with someone regarding commercial pricing for 15 million transactions monthly?', timestamp: '00:46' },
      { speaker: 'assistant', text: 'Certainly! I have captured your requirements and assigned our Fintech Account Executive to contact you this afternoon.', timestamp: '01:02' }
    ],
    aiAnalysis: {
      intent: 'Technical API latency verification and high-volume commercial quote',
      callerIntent: 'API Benchmark & Volume Pricing',
      mainRequirement: 'Sub-120ms p99 webhook delivery for 15 million monthly financial transactions',
      productsDiscussed: ['Acme Enterprise Suite', 'Edge Webhooks API'],
      objections: ['Latency thresholds under financial compliance rules'],
      customerObjections: ['Concerned about webhook throttling on spikes'],
      buyingSignals: [
        'Benchmark met immediately by Edge network specs',
        '15M transaction monthly volume requested',
        'Requested immediate commercial pricing contact'
      ],
      sentiment: 'positive',
      buyingInterestScore: 88,
      questionsAsked: ['What is p99 webhook latency across global regions?'],
      importantMoments: [
        { timestamp: '00:14', title: 'Latency Objection', description: 'Caller highlighted dissatisfaction with prior providers', type: 'objection' },
        { timestamp: '00:28', title: 'Technical Spec Cleared', description: 'Sub-120ms p99 SLA and HMAC security verified', type: 'signal' },
        { timestamp: '00:46', title: 'Volume Quote Request', description: 'Requested 15M monthly volume contract terms', type: 'signal' }
      ],
      competitorMentions: [
        { competitor: 'Twilio / Generic Webhooks', context: 'Suffering high latency and dropped callback retries', sentiment: 'favorable_to_us' }
      ],
      leadQualification: {
        bantScore: 86,
        budget: '$15,000 - $25,000 / month estimated volume',
        authority: 'Head of Fintech Infrastructure',
        need: 'Low-latency financial webhooks with enterprise SLA',
        timeline: 'Q2 pilot deployment',
        status: 'qualified',
      },
      recommendedAction: 'Sales executive follow-up with volume discount matrix',
      recommendedNextSteps: 'Deliver fintech benchmark sheet and schedule 15-min pricing call.',
      suggestedSalesStage: 'qualified',
    },
    leadId: 'lead_2',
  },
  {
    id: 'call_103',
    tenantId: tenant1Id,
    assistantId: 'asst_sarah_enterprise',
    assistantName: 'Sarah - Enterprise Sales Specialist',
    callerNumber: '+1 (415) 555-3390',
    callerPhone: '+1 (415) 555-3390',
    callerName: 'Jordan Hayes',
    callerCompany: 'Apex Global Logistics',
    direction: 'inbound',
    status: 'transferred',
    outcome: 'transferred',
    durationSeconds: 215,
    timestamp: '2026-03-16T16:10:00Z',
    recordingUrl: 'https://vocalpulse-recordings.storage.googleapis.com/org_acme/call_103.mp3',
    audioDuration: '3m 35s',
    summary: 'Jordan Hayes called seeking enterprise pricing negotiation for 40 seats. The AI detected high purchase intent combined with price negotiation and a request for a human salesperson. Sarah generated a real-time Handoff Brief and warm-transferred the live call to Senior Sales Manager David Miller.',
    transcript: [
      { speaker: 'assistant', text: 'Hello! You have reached Acme Cloud Corp. This is Sarah, how can I help you today?', timestamp: '00:02' },
      { speaker: 'customer', text: 'Hi Sarah. We are expanding from our pilot to 40 sales rep seats. We love the system, but we need custom annual payment terms and a volume discount. Can I speak to a human sales manager right now?', timestamp: '00:18' },
      { speaker: 'assistant', text: 'Congratulations on your expansion, Jordan! I completely understand. Because you are ready to license 40 enterprise seats, I am preparing a comprehensive handoff brief for David Miller, our Senior Sales Manager, and transferring your call right now. Please hold for just a moment.', timestamp: '00:36' }
    ],
    aiAnalysis: {
      intent: 'Expand from pilot to 40 enterprise seats with custom volume pricing negotiation',
      callerIntent: 'Pricing Negotiation & Human Transfer',
      mainRequirement: '40 enterprise user licenses with annual billing discount and custom payment terms',
      productsDiscussed: ['Acme Enterprise Suite', '40-Seat License Expansion'],
      objections: ['Standard list pricing requires volume discount'],
      customerObjections: ['Requires custom payment terms and multi-tier discount'],
      buyingSignals: [
        'Already validated product in pilot with high satisfaction',
        '40 seats immediate expansion ready to close',
        'Customer proactively requested human sales manager'
      ],
      sentiment: 'positive',
      buyingInterestScore: 98,
      questionsAsked: ['Can we receive custom annual payment terms and volume pricing?'],
      importantMoments: [
        { timestamp: '00:18', title: 'Handoff Trigger: Pricing & Human Request', description: 'Customer requested human rep for 40-seat commercial negotiation', type: 'handoff' },
        { timestamp: '00:36', title: 'Handoff Brief Generated', description: 'Sarah generated real-time briefing and initiated transfer to David Miller', type: 'signal' }
      ],
      leadQualification: {
        bantScore: 98,
        budget: '$48,000+ Annual Contract Value (ACV)',
        authority: 'VP of Commercial Operations',
        need: '40 enterprise voice seats for sales team expansion',
        timeline: 'Immediate / Ready to sign this week',
        status: 'qualified',
      },
      recommendedAction: 'Execute warm handoff to David Miller with prepared 40-seat proposal',
      recommendedNextSteps: 'Offer 15% annual commitment discount and net-30 payment terms.',
      suggestedSalesStage: 'negotiation',
      handoffBrief: {
        customerName: 'Jordan Hayes',
        customerRequirement: '40 enterprise sales rep seats with volume discount and custom annual payment terms',
        productDiscussed: 'Acme Enterprise Suite (40 Licenses)',
        keyQuestions: ['What volume discount tier applies to 40 seats?', 'Are Net-30 payment terms permitted?'],
        objections: ['Cannot proceed at standard non-discounted monthly tier'],
        buyingIntent: 'Urgent',
        conversationSummary: 'Caller completed successful pilot and is ready to sign for 40 seats today upon agreeing on volume terms.',
        recommendedNextAction: 'Review 40-seat tier bracket, offer 15% annual upfront discount, and send DocuSign agreement.',
        triggerReason: 'pricing_negotiation',
        suggestedRepId: 'user_david_m',
        assignedRepName: 'David Miller',
        transferredAt: '2026-03-16T16:11:00Z',
        status: 'transferred',
      },
    },
    handoffBrief: {
      customerName: 'Jordan Hayes',
      customerRequirement: '40 enterprise sales rep seats with volume discount and custom annual payment terms',
      productDiscussed: 'Acme Enterprise Suite (40 Licenses)',
      keyQuestions: ['What volume discount tier applies to 40 seats?', 'Are Net-30 payment terms permitted?'],
      objections: ['Cannot proceed at standard non-discounted monthly tier'],
      buyingIntent: 'Urgent',
      conversationSummary: 'Caller completed successful pilot and is ready to sign for 40 seats today upon agreeing on volume terms.',
      recommendedNextAction: 'Review 40-seat tier bracket, offer 15% annual upfront discount, and send DocuSign agreement.',
      triggerReason: 'pricing_negotiation',
      suggestedRepId: 'user_david_m',
      assignedRepName: 'David Miller',
      transferredAt: '2026-03-16T16:11:00Z',
      status: 'transferred',
    },
  },
  {
    id: 'call_104',
    tenantId: tenant1Id,
    assistantId: 'asst_sarah_enterprise',
    assistantName: 'Sarah - Enterprise Sales Specialist',
    callerNumber: '+1 (617) 555-8902',
    callerPhone: '+1 (617) 555-8902',
    callerName: 'Dr. Kevin Zhao',
    callerCompany: 'MetroHealth Telemetry',
    direction: 'inbound',
    status: 'completed',
    outcome: 'callback_requested',
    durationSeconds: 180,
    timestamp: '2026-03-16T09:15:00Z',
    recordingUrl: 'https://vocalpulse-recordings.storage.googleapis.com/org_acme/call_104.mp3',
    audioDuration: '3m 00s',
    summary: 'Dr. Kevin Zhao called with complex legal questions regarding HIPAA Business Associate Agreements (BAA) and on-premise encryption key escrow. Because the legal team was unavailable, the AI generated a handoff brief and automatically scheduled a callback task assigned to Rachel Torres.',
    transcript: [
      { speaker: 'assistant', text: 'Thank you for calling Acme Cloud Corp. My name is Sarah. How can I assist you?', timestamp: '00:02' },
      { speaker: 'customer', text: 'Hi, we are evaluating your voice system for patient intake. We need to know if you execute custom HIPAA BAAs with customer-managed KMS encryption keys outside AWS.', timestamp: '00:17' },
      { speaker: 'assistant', text: 'We take healthcare data privacy very seriously. We do sign standard HIPAA BAAs for enterprise plans; however, customer-managed KMS keys outside our native cloud requires specialized review by our Chief Compliance Officer. Let me connect you with our Healthcare Lead, Rachel Torres.', timestamp: '00:42' },
      { speaker: 'customer', text: 'Rachel is probably busy right now. Could someone please call me back tomorrow morning around 9:30 AM EST?', timestamp: '01:05' },
      { speaker: 'assistant', text: 'I would be glad to arrange that for you, Dr. Zhao. I have created a priority follow-up task for Rachel Torres to call you back tomorrow at 9:30 AM Eastern at +1 (617) 555-8902. You will also receive an SMS confirmation.', timestamp: '01:28' }
    ],
    aiAnalysis: {
      intent: 'HIPAA Business Associate Agreement (BAA) terms and customer-managed external KMS keys',
      callerIntent: 'Compliance Review & Callback Request',
      mainRequirement: 'Custom HIPAA BAA with external KMS key escrow for healthcare patient telemetry intake',
      productsDiscussed: ['Acme Enterprise Suite', 'HIPAA Healthcare Add-on'],
      objections: ['Requires customized BAA legal rider before clinical pilot'],
      customerObjections: ['Cannot proceed without explicit customer-managed KMS encryption verification'],
      buyingSignals: [
        'Dr. Zhao confirmed clinical patient intake deployment budget is approved',
        'Provided callback phone and exact requested time'
      ],
      sentiment: 'neutral',
      buyingInterestScore: 82,
      questionsAsked: [
        'Does Acme execute custom HIPAA BAAs?',
        'Are customer-managed KMS keys supported outside AWS?'
      ],
      importantMoments: [
        { timestamp: '00:17', title: 'Complex Question Outside AI Scope', description: 'Detailed legal KMS escrow question identified', type: 'question' },
        { timestamp: '00:42', title: 'Handoff Trigger: Complex Technical Inquiry', description: 'AI recognized boundary and initiated handoff to Healthcare Lead', type: 'handoff' },
        { timestamp: '01:05', title: 'Callback Preferred by Prospect', description: 'Prospect requested 9:30 AM Eastern callback', type: 'signal' },
        { timestamp: '01:28', title: 'Follow-up Task Auto-Created', description: 'Task assigned to Rachel Torres with reminder notification', type: 'signal' }
      ],
      leadQualification: {
        bantScore: 80,
        budget: '$35,000 / year approved clinical budget',
        authority: 'Chief Medical Officer / Telehealth Lead',
        need: 'HIPAA compliant conversational voice intake',
        timeline: 'Pilot launch in May 2026',
        status: 'nurture',
      },
      recommendedAction: 'Assign Rachel Torres to review external KMS escrow spec and call at 9:30 AM EST',
      recommendedNextSteps: 'Attach Acme Healthcare Whitepaper and standard BAA template to the calendar event.',
      suggestedSalesStage: 'qualified',
      handoffBrief: {
        customerName: 'Dr. Kevin Zhao',
        customerRequirement: 'Custom HIPAA BAA and customer-managed external KMS encryption keys for patient intake',
        productDiscussed: 'Acme Enterprise Suite (Healthcare BAA)',
        keyQuestions: ['Does Acme support customer-managed KMS keys outside AWS?', 'Can legal execute custom BAA riders?'],
        objections: ['Mandatory compliance obstacle before any patient data touches the platform'],
        buyingIntent: 'High',
        conversationSummary: 'Clinical intake project with approved budget, pending compliance verification regarding external key management.',
        recommendedNextAction: 'Review KMS integration doc with SecOps team and phone Dr. Zhao promptly at 9:30 AM EST.',
        triggerReason: 'complex_question',
        suggestedRepId: 'user_rachel_t',
        assignedRepName: 'Rachel Torres',
        transferredAt: '2026-03-16T09:17:00Z',
        status: 'callback_requested',
        callbackDetails: {
          phone: '+1 (617) 555-8902',
          preferredTime: 'Tomorrow at 9:30 AM EST',
          notes: 'Prepare answers on customer-managed KMS key escrow and standard HIPAA BAA rider.'
        }
      },
    },
    handoffBrief: {
      customerName: 'Dr. Kevin Zhao',
      customerRequirement: 'Custom HIPAA BAA and customer-managed external KMS encryption keys for patient intake',
      productDiscussed: 'Acme Enterprise Suite (Healthcare BAA)',
      keyQuestions: ['Does Acme support customer-managed KMS keys outside AWS?', 'Can legal execute custom BAA riders?'],
      objections: ['Mandatory compliance obstacle before any patient data touches the platform'],
      buyingIntent: 'High',
      conversationSummary: 'Clinical intake project with approved budget, pending compliance verification regarding external key management.',
      recommendedNextAction: 'Review KMS integration doc with SecOps team and phone Dr. Zhao promptly at 9:30 AM EST.',
      triggerReason: 'complex_question',
      suggestedRepId: 'user_rachel_t',
      assignedRepName: 'Rachel Torres',
      transferredAt: '2026-03-16T09:17:00Z',
      status: 'callback_requested',
      callbackDetails: {
        phone: '+1 (617) 555-8902',
        preferredTime: 'Tomorrow at 9:30 AM EST',
        notes: 'Prepare answers on customer-managed KMS key escrow and standard HIPAA BAA rider.'
      }
    },
    leadId: 'lead_3',
  }
]);

// Seed Follow-Up Tasks for Smart Handoff Callbacks
db.followUpTasks.set(tenant1Id, [
  {
    id: 'task_1',
    tenantId: tenant1Id,
    callId: 'call_104',
    customerName: 'Dr. Kevin Zhao',
    phone: '+1 (617) 555-8902',
    company: 'MetroHealth Telemetry',
    title: 'HIPAA BAA & External KMS Escrow Review',
    reason: 'Smart Handoff Callback: Complex compliance question regarding KMS key escrow',
    priority: 'urgent',
    status: 'pending',
    assignedToName: 'Rachel Torres',
    dueDate: '2026-03-17T13:30:00Z', // 9:30 AM EST
    createdAt: '2026-03-16T09:18:00Z',
    notes: 'Prospect requested 9:30 AM EST callback. Prepare answers on customer-managed KMS key escrow and standard HIPAA BAA rider.',
  },
  {
    id: 'task_2',
    tenantId: tenant1Id,
    callId: 'call_103',
    customerName: 'Jordan Hayes',
    phone: '+1 (415) 555-3390',
    company: 'Apex Global Logistics',
    title: 'Send 40-Seat Enterprise Agreement & Net-30 Terms',
    reason: 'Smart Handoff Follow-up: High-intent pricing negotiation transferred to David Miller',
    priority: 'high',
    status: 'in_progress',
    assignedToName: 'David Miller',
    dueDate: '2026-03-16T21:00:00Z',
    createdAt: '2026-03-16T16:15:00Z',
    notes: 'Warm transfer completed. Prepare 15% discount schedule for annual upfront commitment and send contract.',
  }
]);

// Seed Continuous AI Improvement Suggestions
db.improvementSuggestions.set(tenant1Id, [
  {
    id: 'sugg_1',
    tenantId: tenant1Id,
    category: 'knowledge_gap',
    title: 'Pro Plan Priority Support Inclusion Clarification',
    description: '47 customers asked whether the Pro Plan includes 24/7 priority support and SLA guarantees.',
    detectedFromCount: 47,
    sampleCustomerQuotes: [
      'Does the Pro Plan include priority support and dedicated Slack?',
      'If we sign up for Pro, what is the guaranteed response time SLA?',
      'Is phone support included on the Pro tier or only ticket support?'
    ],
    suggestedAnswer: 'The Pro Plan includes standard business-hours support (9 AM - 6 PM EST) with a guaranteed 4-hour response SLA. Priority 24/7 dedicated Slack channel and phone support are exclusively available on Enterprise Suite.',
    targetKnowledgeSourceId: 'know_faq',
    targetKnowledgeTitle: 'Frequently Asked Questions & Pricing Tiers',
    status: 'pending',
    createdAt: '2026-03-16T12:00:00Z',
  },
  {
    id: 'sugg_2',
    tenantId: tenant1Id,
    category: 'missing_product_info',
    title: 'HIPAA Compliance & Signed BAA Tier Availability',
    description: '32 customers asked whether HIPAA compliance and signed BAAs are available on Growth Platform or only Enterprise.',
    detectedFromCount: 32,
    sampleCustomerQuotes: [
      'Can we execute a HIPAA BAA on the Growth tier?',
      'Do you sign BAAs for telehealth clinics on mid-tier plans?',
      'What is the minimum tier for HIPAA certification?'
    ],
    suggestedAnswer: 'HIPAA compliance and signed Business Associate Agreements (BAAs) require our Enterprise Suite. We implement dedicated encrypted database partitions, audit logging, and BAA execution for all healthcare workloads.',
    targetKnowledgeSourceId: 'know_playbook',
    targetKnowledgeTitle: 'Sales Playbook & Compliance Guidelines',
    status: 'pending',
    createdAt: '2026-03-15T16:30:00Z',
  },
  {
    id: 'sugg_3',
    tenantId: tenant1Id,
    category: 'common_objection',
    title: 'Webhook Callback Spike & Throttling Mitigation',
    description: '28 customers raised hesitation regarding webhook throughput limits during high-volume traffic bursts.',
    detectedFromCount: 28,
    sampleCustomerQuotes: [
      'What happens if our API webhook spikes past 50,000 req/sec?',
      'Will webhooks be dropped if our endpoint slows down during peak hours?',
      'How does Acme handle bursty traffic without dropping payloads?'
    ],
    suggestedAnswer: 'Acme utilizes multi-region distributed Kafka queues with automated exponential backoff retries. If your receiving server experiences throttling, payloads are safely queued up to 72 hours with HMAC signature verification without dropped events.',
    targetKnowledgeSourceId: 'know_playbook',
    targetKnowledgeTitle: 'Sales Playbook & Compliance Guidelines',
    status: 'pending',
    createdAt: '2026-03-14T11:20:00Z',
  },
  {
    id: 'sugg_4',
    tenantId: tenant1Id,
    category: 'requested_feature',
    title: 'Custom Regional Telephony Caller IDs (Latin America & Europe)',
    description: '21 customers asked if they can configure localized caller ID numbers for European and Latin American regional phone calls.',
    detectedFromCount: 21,
    sampleCustomerQuotes: [
      'Can we display local Madrid and London numbers for European inbound?',
      'Do you support localized caller ID in Brazil and Mexico?',
      'Can outgoing calls show our country-specific office number?'
    ],
    suggestedAnswer: 'Yes. VocalPulse supports localized caller ID and regional number provisioning across 52+ countries including UK (+44), Spain (+34), Germany (+49), Mexico (+52), and Brazil (+55) with automatic local CLI presentation.',
    targetKnowledgeSourceId: 'know_faq',
    targetKnowledgeTitle: 'Frequently Asked Questions & Pricing Tiers',
    status: 'approved',
    createdAt: '2026-03-12T09:15:00Z',
    reviewedAt: '2026-03-13T10:00:00Z',
    reviewedBy: 'Ojaswitha Sreen',
    appliedVersion: 2,
  },
  {
    id: 'sugg_5',
    tenantId: tenant1Id,
    category: 'outdated_info',
    title: 'Correct Uptime SLA Metric from 99.9% to 99.99%',
    description: '15 customers noted that older sales collateral listed 99.9% SLA instead of the upgraded 99.99% multi-region enterprise SLA.',
    detectedFromCount: 15,
    sampleCustomerQuotes: [
      'Your old PDF says 99.9%, but the website says 99.99%. Which is current?',
      'What is the contractual financial credit for downtime?'
    ],
    suggestedAnswer: 'All Acme Cloud Enterprise plans are contractually backed by a 99.99% multi-region uptime SLA with tiered service credits for any downtime exceeding 4.38 minutes per month.',
    targetKnowledgeSourceId: 'know_playbook',
    targetKnowledgeTitle: 'Sales Playbook & Compliance Guidelines',
    status: 'approved',
    createdAt: '2026-03-10T14:40:00Z',
    reviewedAt: '2026-03-11T11:00:00Z',
    reviewedBy: 'David Miller',
    appliedVersion: 1,
  }
]);

// Seed Version History for Human-Approved Knowledge Updates
db.knowledgeVersions.set(tenant1Id, [
  {
    id: 'ver_1',
    tenantId: tenant1Id,
    sourceId: 'know_playbook',
    sourceTitle: 'Sales Playbook & Compliance Guidelines',
    versionNumber: 1,
    changeSummary: 'Updated contractual uptime SLA from 99.9% to 99.99% multi-region guarantee with service credits.',
    previousContentSnippet: 'SLA guarantees 99.9% uptime across primary US availability zone.',
    newContentSnippet: 'SLA contractually guarantees 99.99% multi-region uptime with automated failover and financial service credits.',
    updatedBy: 'David Miller',
    timestamp: '2026-03-11T11:00:00Z',
    suggestionId: 'sugg_5',
    status: 'active',
  },
  {
    id: 'ver_2',
    tenantId: tenant1Id,
    sourceId: 'know_faq',
    sourceTitle: 'Frequently Asked Questions & Pricing Tiers',
    versionNumber: 2,
    changeSummary: 'Added support details for local caller ID provisioning in Europe and Latin America.',
    previousContentSnippet: 'Telephony numbers currently default to US and Canada local area codes.',
    newContentSnippet: 'Localized caller ID and two-way telephone number provisioning is supported across 52+ countries including Europe and LATAM.',
    updatedBy: 'Ojaswitha Sreen',
    timestamp: '2026-03-13T10:00:00Z',
    suggestionId: 'sugg_4',
    status: 'active',
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
db.followUpTasks.set(tenant2Id, []);
db.improvementSuggestions.set(tenant2Id, []);
db.knowledgeVersions.set(tenant2Id, []);

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
  db.followUpTasks.set(newTenantId, []);
  db.improvementSuggestions.set(newTenantId, []);
  db.knowledgeVersions.set(newTenantId, []);

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
// 27. SMART HUMAN HANDOFF ENDPOINTS & ENGINE
// ----------------------------------------------------------------------------

function detectHandoffTrigger(text: string, history: any[] = []): { triggered: boolean; reason: HandoffTriggerReason | null } {
  const allTexts = [text, ...history.map((h: any) => h.text || '')].join(' ').toLowerCase();

  // 1. Ready to buy
  if (/ready to (buy|sign|purchase|close|license|commit)|sign up today|send (the|a) contract|where do i sign|take my money|have my credit card|let's buy/i.test(allTexts)) {
    return { triggered: true, reason: 'ready_to_buy' };
  }
  // 2. Customer requests human
  if (/speak to (a )?(human|person|rep)|talk to (a )?(human|person|rep)|real person|human agent|sales representative|transfer me|human please|operator|connect me with a rep/i.test(allTexts)) {
    return { triggered: true, reason: 'human_requested' };
  }
  // 3. Pricing negotiation
  if (/volume discount|negotiate|lower (the )?price|discount|better deal|tight budget|payment terms|net-30|annual discount|can you do 20%|can you do 30%|budget constraint/i.test(allTexts)) {
    return { triggered: true, reason: 'pricing_negotiation' };
  }
  // 4. Frustrated
  if (/frustrated|angry|terrible|useless|waste of time|not listening|annoying|ridiculous|speak with (your|a) manager|stop repeating|worst support/i.test(allTexts)) {
    return { triggered: true, reason: 'customer_frustrated' };
  }
  // 5. Special business request
  if (/reseller|white label|partnership|distributor|acquisition|strategic partner|custom rfp|subcontract|agency partner/i.test(allTexts)) {
    return { triggered: true, reason: 'special_business_request' };
  }
  // 6. Complex question outside AI knowledge
  if (/custom on-premise|air-gapped|kms escrow|fips 140|bespoke compliance|hipaa baa|external key management|penetration test report/i.test(allTexts)) {
    return { triggered: true, reason: 'complex_question' };
  }

  return { triggered: false, reason: null };
}

function generateHandoffBrief(params: {
  customerName?: string;
  customerRequirement?: string;
  productDiscussed?: string;
  triggerReason: HandoffTriggerReason;
  conversationSummary?: string;
  transcriptTurns?: any[];
}): HandoffBrief {
  const { customerName = 'Valued Customer', customerRequirement = 'Commercial expansion inquiry', productDiscussed = 'Acme Enterprise Suite', triggerReason, conversationSummary = 'Inbound prospect qualified for human sales handoff.', transcriptTurns = [] } = params;

  let buyingIntent: 'Low' | 'Medium' | 'High' | 'Urgent' = 'High';
  let recommendedNextAction = 'Conduct immediate live introduction, confirm commercial requirements, and present customized agreement.';
  const objections: string[] = [];
  const keyQuestions: string[] = [];

  switch (triggerReason) {
    case 'ready_to_buy':
      buyingIntent = 'Urgent';
      recommendedNextAction = 'Present finalized pricing schedule and execute DocuSign subscription agreement immediately.';
      keyQuestions.push('What is the earliest onboarding date?', 'Where should we remit electronic invoice payment?');
      break;
    case 'human_requested':
      buyingIntent = 'High';
      recommendedNextAction = 'Warmly greet prospect, validate prior answers, and offer personalized 1-on-1 walkthrough.';
      keyQuestions.push('Can a dedicated solutions consultant assist with our migration?');
      break;
    case 'pricing_negotiation':
      buyingIntent = 'High';
      recommendedNextAction = 'Review multi-seat volume discount tiers (offer 15% upfront annual incentive or Net-30 payment terms).';
      objections.push('Standard pricing model exceeds initial departmental allocation without volume tier');
      keyQuestions.push('What discount applies to 25+ seats?', 'Can payments be split semi-annually?');
      break;
    case 'customer_frustrated':
      buyingIntent = 'Medium';
      recommendedNextAction = 'De-escalate immediately with empathetic listening, validate specific friction points, and provide white-glove assistance.';
      objections.push('Expressed frustration with automated qualification answers');
      break;
    case 'special_business_request':
      buyingIntent = 'High';
      recommendedNextAction = 'Connect with VP of Strategic Alliances to evaluate OEM / Reseller partnership framework.';
      keyQuestions.push('Do you support white-label multi-tenant reselling?');
      break;
    case 'complex_question':
      buyingIntent = 'High';
      recommendedNextAction = 'Review technical compliance architecture and share custom security / BAA documentation.';
      objections.push('Unverified compliance specs require specialized engineering sign-off');
      keyQuestions.push('Can customer-managed KMS keys and dedicated tenant VPC isolation be provided?');
      break;
    default:
      buyingIntent = 'Medium';
  }

  return {
    customerName,
    customerRequirement,
    productDiscussed,
    keyQuestions: keyQuestions.length ? keyQuestions : ['What are the platform capabilities and rollout timeline?'],
    objections: objections.length ? objections : ['Implementation schedule and team migration'],
    buyingIntent,
    conversationSummary,
    recommendedNextAction,
    triggerReason,
    status: 'pending',
  };
}

// Detect handoff trigger in real-time
app.post('/api/handoff/detect', (req, res) => {
  const { userMessage = '', conversationHistory = [], callerName, callerCompany, productDiscussed } = req.body;
  const detection = detectHandoffTrigger(userMessage, conversationHistory);

  if (!detection.triggered) {
    return res.json({ triggered: false, triggerReason: null, handoffBrief: null });
  }

  const brief = generateHandoffBrief({
    customerName: callerName || 'Customer',
    customerRequirement: callerCompany ? `${callerCompany} custom deployment requirements` : 'Enterprise evaluation',
    productDiscussed: productDiscussed || 'Enterprise Suite',
    triggerReason: detection.reason || 'ready_to_buy',
    conversationSummary: `Customer message: "${userMessage}". Trigger: ${detection.reason?.replace(/_/g, ' ')}.`,
    transcriptTurns: conversationHistory,
  });

  res.json({
    triggered: true,
    triggerReason: detection.reason,
    handoffBrief: brief,
  });
});

// Transfer call to available team member
app.post('/api/handoff/transfer', (req, res) => {
  const tenantId = getTenantId(req);
  const { callId, repId, repName, handoffBrief } = req.body;

  const team = db.team.get(tenantId) || [];
  const assignedRep = team.find((t) => t.id === repId) || team[0];
  const finalRepName = repName || assignedRep?.name || 'David Miller';

  // Update Call Record if callId provided
  const calls = db.calls.get(tenantId) || [];
  const call = calls.find((c) => c.id === callId);
  if (call) {
    call.status = 'transferred';
    call.outcome = 'transferred';
    const updatedBrief: HandoffBrief = {
      ...(handoffBrief || call.aiAnalysis?.handoffBrief || {}),
      suggestedRepId: repId || assignedRep?.id,
      assignedRepName: finalRepName,
      transferredAt: new Date().toISOString(),
      status: 'transferred',
    };
    call.handoffBrief = updatedBrief;
    if (call.aiAnalysis) {
      call.aiAnalysis.handoffBrief = updatedBrief;
    }
    db.calls.set(tenantId, [...calls]);
  }

  // Add Notification to Rep
  const notifs = db.notifications.get(tenantId) || [];
  notifs.unshift({
    id: `notif_handoff_${Date.now()}`,
    tenantId,
    type: 'high_intent',
    title: `Live Call Transferred: ${handoffBrief?.customerName || 'Inbound Prospect'}`,
    message: `Call transferred to ${finalRepName}. Reason: ${String(handoffBrief?.triggerReason || 'ready_to_buy').replace(/_/g, ' ')}. Intent: ${handoffBrief?.buyingIntent || 'High'}.`,
    timestamp: 'Just now',
    isRead: false,
    link: '/dashboard/calls',
  });
  db.notifications.set(tenantId, notifs);

  // Add Audit Log
  const logs = db.auditLogs.get(tenantId) || [];
  logs.unshift({
    id: `audit_${Date.now()}`,
    tenantId,
    actorName: 'AI Sales Assistant',
    action: 'CALL_HANDOFF_TRANSFERRED',
    target: `${handoffBrief?.customerName || 'Customer'} -> ${finalRepName}`,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  db.auditLogs.set(tenantId, logs);

  res.json({
    success: true,
    transferredTo: finalRepName,
    transferredAt: new Date().toISOString(),
    status: 'transferred',
  });
});

// Offer callback and automatically create follow-up task
app.post('/api/handoff/callback', (req, res) => {
  const tenantId = getTenantId(req);
  const { callId, customerName = 'Valued Customer', phone = '', company = '', preferredTime = 'Tomorrow morning', notes = '', handoffBrief } = req.body;

  const team = db.team.get(tenantId) || [];
  const assignedRep = team[1]?.name || team[0]?.name || 'Rachel Torres';

  const taskId = `task_${Date.now().toString(36)}`;
  const newTask: FollowUpTask = {
    id: taskId,
    tenantId,
    callId,
    customerName,
    phone,
    company,
    title: `Callback Request: ${customerName} (${company || 'Prospect'})`,
    reason: handoffBrief?.triggerReason ? `Smart Handoff Callback: ${String(handoffBrief.triggerReason).replace(/_/g, ' ')}` : 'Customer requested callback',
    priority: handoffBrief?.buyingIntent === 'Urgent' ? 'urgent' : 'high',
    status: 'pending',
    assignedToName: assignedRep,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    notes: notes || handoffBrief?.conversationSummary || `Preferred Time: ${preferredTime}. Requirements: ${handoffBrief?.customerRequirement || 'General Inquiry'}.`,
  };

  const tasks = db.followUpTasks.get(tenantId) || [];
  tasks.unshift(newTask);
  db.followUpTasks.set(tenantId, tasks);

  // Update Call Record
  const calls = db.calls.get(tenantId) || [];
  const call = calls.find((c) => c.id === callId);
  if (call) {
    call.outcome = 'callback_requested';
    const updatedBrief: HandoffBrief = {
      ...(handoffBrief || call.aiAnalysis?.handoffBrief || {}),
      assignedRepName: assignedRep,
      status: 'callback_requested',
      callbackDetails: {
        phone,
        preferredTime,
        notes,
      },
    };
    call.handoffBrief = updatedBrief;
    if (call.aiAnalysis) {
      call.aiAnalysis.handoffBrief = updatedBrief;
    }
    db.calls.set(tenantId, [...calls]);
  }

  // Create notification
  const notifs = db.notifications.get(tenantId) || [];
  notifs.unshift({
    id: `notif_cb_${Date.now()}`,
    tenantId,
    type: 'appointment',
    title: `Follow-up Task Created: ${customerName}`,
    message: `Assigned to ${assignedRep} for callback at ${preferredTime} (${phone}).`,
    timestamp: 'Just now',
    isRead: false,
    link: '/dashboard/calls',
  });
  db.notifications.set(tenantId, notifs);

  res.status(201).json({
    success: true,
    task: newTask,
  });
});

// Follow-up tasks list & update
app.get('/api/handoff/tasks', (req, res) => {
  const tenantId = getTenantId(req);
  const tasks = db.followUpTasks.get(tenantId) || [];
  res.json(tasks);
});

app.put('/api/handoff/tasks/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const tasks = db.followUpTasks.get(tenantId) || [];
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  db.followUpTasks.set(tenantId, [...tasks]);
  res.json(tasks[taskIndex]);
});

// Team availability for live handoff transfer
app.get('/api/handoff/reps', (req, res) => {
  const tenantId = getTenantId(req);
  const team = db.team.get(tenantId) || [];
  const repsWithStatus = team.map((member, index) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: index === 2 ? 'in_call' : 'available',
    activeCallsToday: index === 0 ? 8 : (index === 1 ? 5 : 12),
    avatarColor: index === 0 ? 'bg-indigo-600' : (index === 1 ? 'bg-emerald-600' : 'bg-amber-600'),
  }));
  res.json(repsWithStatus);
});

// ----------------------------------------------------------------------------
// 28. CONVERSATION INTELLIGENCE (CALL-LEVEL & COMPANY-LEVEL ANALYTICS)
// ----------------------------------------------------------------------------

app.get('/api/analytics/conversations', (req, res) => {
  const tenantId = getTenantId(req);
  const { dateRange = '30d', assistantId, productId, repId } = req.query;

  let calls = db.calls.get(tenantId) || [];

  if (assistantId && assistantId !== 'all') {
    calls = calls.filter((c) => c.assistantId === assistantId);
  }

  const frequentlyAskedQuestions = [
    { question: 'What is your standard contract duration and SLA guarantee?', count: 68, category: 'Pricing & SLA', aiAnsweredRate: 98 },
    { question: 'Does the Pro Plan include 24/7 dedicated priority support?', count: 47, category: 'Support & Tiers', aiAnsweredRate: 72 },
    { question: 'Can we pilot with 10 agents before company-wide rollout?', count: 54, category: 'Enterprise Pilot', aiAnsweredRate: 96 },
    { question: 'Do you offer direct native CRM bi-directional sync?', count: 47, category: 'Integrations', aiAnsweredRate: 100 },
    { question: 'Is HIPAA compliance and signed BAA available on Growth Platform?', count: 32, category: 'Compliance', aiAnsweredRate: 68 },
    { question: 'How quickly can incoming phone calls be transferred to human sales reps?', count: 39, category: 'Telephony & Routing', aiAnsweredRate: 94 },
    { question: 'Can we configure custom regional telephony caller IDs for Europe & LATAM?', count: 21, category: 'Global Calling', aiAnsweredRate: 85 }
  ];

  const commonObjections = [
    { objection: 'Migration & implementation timeline', count: 42, percentage: 38, primaryProduct: 'Enterprise Suite', bestCounterTactic: 'Highlight 48-hour automated zero-downtime SIP trunk migration wizard.' },
    { objection: 'Pricing model & custom annual payment terms', count: 35, percentage: 31, primaryProduct: 'Enterprise Suite', bestCounterTactic: 'Offer 15% annual upfront discount and Net-30 invoicing terms.' },
    { objection: 'Integration with legacy on-premise ERP & KMS', count: 21, percentage: 19, primaryProduct: 'Custom Connectors', bestCounterTactic: 'Provide pre-built Docker gateway container and OpenAPI schemas.' },
    { objection: 'Security & SOC2 Type II compliance verification', count: 14, percentage: 12, primaryProduct: 'Security Add-on', bestCounterTactic: 'Instantly email signed SOC2 Type II audit summary and penetration test report.' },
    { objection: 'Webhook latency during bursty traffic spikes', count: 11, percentage: 10, primaryProduct: 'Edge Webhooks', bestCounterTactic: 'Demonstrate sub-120ms p99 benchmark and automated Kafka buffer queues.' }
  ];

  const frequentlyRequestedProducts = [
    { productName: 'Acme Enterprise Suite', inquiriesCount: 184, conversionRate: 34.2, interestTrend: 'up' as const },
    { productName: 'Global Edge Webhooks API', inquiriesCount: 92, conversionRate: 28.5, interestTrend: 'up' as const },
    { productName: 'HIPAA & Healthcare Compliance Add-on', inquiriesCount: 64, conversionRate: 22.0, interestTrend: 'stable' as const },
    { productName: 'Custom Telephony Trunking (Telnyx/Twilio)', inquiriesCount: 48, conversionRate: 31.0, interestTrend: 'stable' as const },
    { productName: 'White-label Reseller License', inquiriesCount: 24, conversionRate: 16.7, interestTrend: 'up' as const }
  ];

  const hesitationReasons = [
    { reason: 'Pricing uncertainty & volume discount approval', count: 46, impact: 'high' as const, description: 'Prospects require authorized executive confirmation of tier discounts for 20+ seats.' },
    { reason: 'Migration timeline and onboarding bandwidth', count: 38, impact: 'high' as const, description: 'Teams worry about disrupted sales workflows during AI voice transition.' },
    { reason: 'Security review and compliance documentation turnaround', count: 27, impact: 'medium' as const, description: 'Legal departments require signed BAAs and SOC2 Type II audit letters.' },
    { reason: 'Legacy ERP & custom CRM sync compatibility', count: 19, impact: 'medium' as const, description: 'Companies using proprietary databases need assurance regarding webhook reliability.' },
    { reason: 'Contract duration lock-in hesitation', count: 12, impact: 'low' as const, description: 'Prospects prefer 60-day pilot clauses before committing to multi-year contracts.' }
  ];

  const unansweredTopics = [
    { topic: 'Customer-Managed KMS Encryption Key Escrow outside AWS', frequency: 18, lastAsked: '2 hours ago', sampleQuestion: 'Does Acme allow private on-premise KMS keys for HIPAA data?' },
    { topic: 'Pro Plan Dedicated Priority Support SLAs', frequency: 15, lastAsked: 'Yesterday', sampleQuestion: 'Does the Pro tier have phone support and 1-hour response times?' },
    { topic: 'Hardware Security Module (HSM) Level 3 Certification', frequency: 9, lastAsked: '3 days ago', sampleQuestion: 'Is VocalPulse voice storage FIPS 140-2 Level 3 certified?' },
    { topic: 'Custom Regional Caller ID Provisioning in APAC', frequency: 7, lastAsked: '4 days ago', sampleQuestion: 'Can we purchase Singapore and Australia numbers with local caller ID?' }
  ];

  const interestTrends = [
    { period: 'Week 1 (Feb)', overallInterestScore: 78, qualifiedCount: 22, volume: 84 },
    { period: 'Week 2 (Feb)', overallInterestScore: 82, qualifiedCount: 28, volume: 96 },
    { period: 'Week 3 (Feb)', overallInterestScore: 84, qualifiedCount: 31, volume: 104 },
    { period: 'Week 4 (Feb)', overallInterestScore: 86, qualifiedCount: 37, volume: 118 },
    { period: 'Week 1 (Mar)', overallInterestScore: 89, qualifiedCount: 42, volume: 132 },
    { period: 'Week 2 (Mar)', overallInterestScore: 93, qualifiedCount: 51, volume: 145 },
    { period: 'Current Week', overallInterestScore: 95, qualifiedCount: 56, volume: 162 },
  ];

  res.json({
    dateRange,
    totalCalls: calls.length * 45 + 112,
    avgInterestScore: 89,
    humanHandoffRate: '8.4%',
    qualifiedRate: '51.8%',
    frequentlyAskedQuestions,
    commonObjections,
    frequentlyRequestedProducts,
    hesitationReasons,
    unansweredTopics,
    interestTrends,
  });
});

// Single call intelligence analysis
app.post('/api/calls/:id/analyze', (req, res) => {
  const tenantId = getTenantId(req);
  const calls = db.calls.get(tenantId) || [];
  const call = calls.find((c) => c.id === req.params.id);

  if (!call) {
    return res.status(404).json({ error: 'Call record not found' });
  }

  res.json({
    callId: call.id,
    callerName: call.callerName,
    aiAnalysis: call.aiAnalysis,
    summary: call.summary,
    handoffBrief: call.handoffBrief || call.aiAnalysis?.handoffBrief,
    transcript: call.transcript,
  });
});

// ----------------------------------------------------------------------------
// 29. CONTINUOUS AI IMPROVEMENT LOOP (KNOWLEDGE GAPS & HUMAN APPROVAL)
// ----------------------------------------------------------------------------

// Get AI Improvement Suggestions
app.get('/api/improvements/suggestions', (req, res) => {
  const tenantId = getTenantId(req);
  const { status } = req.query;
  let suggestions = db.improvementSuggestions.get(tenantId) || [];

  if (status && status !== 'all') {
    suggestions = suggestions.filter((s) => s.status === status);
  }

  res.json(suggestions);
});

// Create an improvement suggestion (detected by AI analysis)
app.post('/api/improvements/suggestions', (req, res) => {
  const tenantId = getTenantId(req);
  const { category, title, description, detectedFromCount = 1, sampleCustomerQuotes = [], suggestedAnswer, targetKnowledgeSourceId } = req.body;

  const newSuggestion: AiImprovementSuggestion = {
    id: `sugg_${Date.now().toString(36)}`,
    tenantId,
    category: category || 'knowledge_gap',
    title: title || 'New Knowledge Gap Detected',
    description: description || 'Customers asked questions not fully covered in Knowledge Base.',
    detectedFromCount: Number(detectedFromCount) || 1,
    sampleCustomerQuotes,
    suggestedAnswer: suggestedAnswer || '',
    targetKnowledgeSourceId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const suggestions = db.improvementSuggestions.get(tenantId) || [];
  suggestions.unshift(newSuggestion);
  db.improvementSuggestions.set(tenantId, suggestions);

  res.status(201).json(newSuggestion);
});

// HUMAN APPROVAL WORKFLOW GATE:
// CRITICAL: The AI must NEVER automatically change important company information,
// pricing, policies, or sales rules without authorized human approval.
app.post('/api/improvements/suggestions/:id/approve', (req, res) => {
  const tenantId = getTenantId(req);
  const { targetKnowledgeSourceId, updatedText, changeSummary, reviewerName } = req.body;

  const suggestions = db.improvementSuggestions.get(tenantId) || [];
  const suggestion = suggestions.find((s) => s.id === req.params.id);

  if (!suggestion) {
    return res.status(404).json({ error: 'Improvement suggestion not found' });
  }

  const knowledgeList = db.knowledge.get(tenantId) || [];
  const targetDoc = knowledgeList.find((k) => k.id === (targetKnowledgeSourceId || suggestion.targetKnowledgeSourceId)) || knowledgeList[0];

  const sourceTitle = targetDoc?.title || 'Company Knowledge Base';
  const previousSnippet = targetDoc?.content ? targetDoc.content.slice(-200) : 'Standard introductory text';
  const answerToAdd = updatedText || suggestion.suggestedAnswer;

  // Append human-approved knowledge update
  if (targetDoc) {
    targetDoc.content = `${targetDoc.content}\n\n### ${suggestion.title} (Human Approved)\n${answerToAdd}`;
    targetDoc.updatedAt = new Date().toISOString();
  }

  // Generate Version Record
  const versions = db.knowledgeVersions.get(tenantId) || [];
  const newVersionNumber = versions.length + 1;
  const newVersion: KnowledgeVersion = {
    id: `ver_${Date.now().toString(36)}`,
    tenantId,
    sourceId: targetDoc?.id || 'know_main',
    sourceTitle,
    versionNumber: newVersionNumber,
    changeSummary: changeSummary || `Approved answer for: "${suggestion.title}"`,
    previousContentSnippet: previousSnippet,
    newContentSnippet: answerToAdd,
    updatedBy: reviewerName || 'Authorized Admin',
    timestamp: new Date().toISOString(),
    suggestionId: suggestion.id,
    status: 'active',
  };
  versions.unshift(newVersion);
  db.knowledgeVersions.set(tenantId, versions);

  // Update Suggestion status
  suggestion.status = 'approved';
  suggestion.reviewedAt = new Date().toISOString();
  suggestion.reviewedBy = reviewerName || 'Authorized Admin';
  suggestion.appliedVersion = newVersionNumber;
  db.improvementSuggestions.set(tenantId, [...suggestions]);

  // Audit Log
  const logs = db.auditLogs.get(tenantId) || [];
  logs.unshift({
    id: `audit_${Date.now()}`,
    tenantId,
    actorName: reviewerName || 'Authorized Admin',
    action: 'KNOWLEDGE_IMPROVEMENT_APPROVED',
    target: `${sourceTitle} (v${newVersionNumber})`,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  db.auditLogs.set(tenantId, logs);

  // Notification
  const notifs = db.notifications.get(tenantId) || [];
  notifs.unshift({
    id: `notif_imp_${Date.now()}`,
    tenantId,
    type: 'knowledge',
    title: `Knowledge Base Updated: v${newVersionNumber}`,
    message: `Human approved AI improvement: "${suggestion.title}". Now live for all voice assistants.`,
    timestamp: 'Just now',
    isRead: false,
    link: '/dashboard/knowledge',
  });
  db.notifications.set(tenantId, notifs);

  res.json({
    success: true,
    suggestion,
    version: newVersion,
    knowledgeSource: targetDoc,
  });
});

// Reject/dismiss suggestion
app.post('/api/improvements/suggestions/:id/reject', (req, res) => {
  const tenantId = getTenantId(req);
  const suggestions = db.improvementSuggestions.get(tenantId) || [];
  const suggestion = suggestions.find((s) => s.id === req.params.id);

  if (!suggestion) {
    return res.status(404).json({ error: 'Improvement suggestion not found' });
  }

  suggestion.status = 'rejected';
  suggestion.reviewedAt = new Date().toISOString();
  suggestion.reviewedBy = req.body?.reviewerName || 'Admin';
  db.improvementSuggestions.set(tenantId, [...suggestions]);

  res.json({ success: true, suggestion });
});

// Get version history
app.get('/api/improvements/versions', (req, res) => {
  const tenantId = getTenantId(req);
  const versions = db.knowledgeVersions.get(tenantId) || [];
  res.json(versions);
});

// Revert version back
app.post('/api/improvements/versions/:id/revert', (req, res) => {
  const tenantId = getTenantId(req);
  const versions = db.knowledgeVersions.get(tenantId) || [];
  const version = versions.find((v) => v.id === req.params.id);

  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  version.status = 'reverted';
  db.knowledgeVersions.set(tenantId, [...versions]);

  // Log audit
  const logs = db.auditLogs.get(tenantId) || [];
  logs.unshift({
    id: `audit_${Date.now()}`,
    tenantId,
    actorName: 'Authorized Admin',
    action: 'KNOWLEDGE_VERSION_REVERTED',
    target: `${version.sourceTitle} (v${version.versionNumber} Reverted)`,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  db.auditLogs.set(tenantId, logs);

  res.json({ success: true, version });
});

// Continuous AI Improvement Dashboard Overview
app.get('/api/improvements/dashboard', (req, res) => {
  const tenantId = getTenantId(req);
  const suggestions = db.improvementSuggestions.get(tenantId) || [];
  const versions = db.knowledgeVersions.get(tenantId) || [];

  const pending = suggestions.filter((s) => s.status === 'pending');
  const approved = suggestions.filter((s) => s.status === 'approved');

  res.json({
    knowledgeGapsCount: suggestions.filter((s) => s.category === 'knowledge_gap').length,
    approvedImprovementsCount: approved.length,
    pendingSuggestionsCount: pending.length,
    aiResolutionRate: 89.4,
    knowledgeCoveragePct: 94.2,
    escalationRate: 10.6,
    performanceTrends: [
      { month: 'Nov', resolutionRate: 74.2, escalationRate: 25.8, coveragePct: 78.0 },
      { month: 'Dec', resolutionRate: 79.5, escalationRate: 20.5, coveragePct: 83.5 },
      { month: 'Jan', resolutionRate: 83.1, escalationRate: 16.9, coveragePct: 88.2 },
      { month: 'Feb', resolutionRate: 86.8, escalationRate: 13.2, coveragePct: 91.5 },
      { month: 'Mar (Current)', resolutionRate: 89.4, escalationRate: 10.6, coveragePct: 94.2 },
    ],
    unresolvedCustomerQuestions: [
      { question: 'Does Acme allow private on-premise KMS keys for HIPAA data?', count: 18, category: 'Compliance' },
      { question: 'Does the Pro tier have phone support and 1-hour response times?', count: 15, category: 'Pricing & Tiers' },
      { question: 'Is VocalPulse voice storage FIPS 140-2 Level 3 certified?', count: 9, category: 'Security' },
      { question: 'Can we purchase Singapore and Australia numbers with local caller ID?', count: 7, category: 'Telephony' },
    ],
    mostCommonIssues: [
      { category: 'Knowledge Gaps', count: 47, percentage: 38 },
      { category: 'Missing Product Specs', count: 32, percentage: 26 },
      { category: 'Common Objections', count: 28, percentage: 22 },
      { category: 'Outdated Collateral', count: 15, percentage: 14 },
    ]
  });
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
