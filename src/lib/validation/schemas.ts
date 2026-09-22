import { z } from 'zod';

export const RoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'SALES_MANAGER',
  'SALES_REP',
  'VIEWER',
]);

export const PlanTierSchema = z.enum([
  'TRIAL',
  'PRO',
  'BUSINESS',
  'ENTERPRISE',
]);

export const CreateAssistantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role is required'),
  voice: z.string().default('sarah'),
  voiceGender: z.enum(['female', 'male', 'neutral']).default('female'),
  language: z.string().default('en-US'),
  speakingSpeed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(1.5).default(1.0),
  personality: z.string().default('Consultative and empathetic'),
  tone: z.enum(['professional', 'consultative', 'warm', 'persuasive', 'direct']).default('consultative'),
  greeting: z.string().min(5, 'Greeting must be at least 5 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  salesObjective: z.string().min(5, 'Sales objective is required'),
  qualificationQuestions: z.array(z.string()).default([]),
  callEndingBehavior: z.string().default('Book demo and send calendar invitation'),
  humanHandoffRules: z.string().default('Transfer to sales rep when requested or budget exceeds $10k'),
  assignedPhoneNumberId: z.string().optional().nullable(),
  knowledgeSourceIds: z.array(z.string()).default([]),
  productIds: z.array(z.string()).default([]),
});

export const UpdateAssistantSchema = CreateAssistantSchema.partial();

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Lead name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Valid phone number required'),
  company: z.string().min(2, 'Company name is required'),
  score: z.number().int().min(0).max(100).default(50),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'DEMO_SCHEDULED', 'NEGOTIATION', 'CONVERTED', 'LOST']).default('NEW'),
  source: z.string().default('Inbound Voice Call'),
  budget: z.string().optional(),
  authority: z.string().optional(),
  need: z.string().optional(),
  timeline: z.string().optional(),
  interestedProduct: z.string().optional(),
  estimatedValue: z.number().default(5000),
  assignedRepName: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export const CreateCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(7),
  company: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().min(0),
  pricingModel: z.string().default('monthly'),
  description: z.string().min(5),
  features: z.array(z.string()).default([]),
  idealCustomer: z.string().optional().nullable(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

export const CreateKnowledgeSourceSchema = z.object({
  title: z.string().min(2),
  type: z.enum(['document', 'url', 'faq', 'pdf', 'call_learning']).default('document'),
  content: z.string().min(10),
  tags: z.array(z.string()).default([]),
  fileUrl: z.string().optional().nullable(),
});

export const CreateAppointmentSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  customerId: z.string().optional().nullable(),
  callId: z.string().optional().nullable(),
});

export const VoiceCallInitiateSchema = z.object({
  assistantId: z.string(),
  toPhoneNumber: z.string().min(7),
  fromPhoneNumberId: z.string().optional(),
  customerName: z.string().optional(),
  customerCompany: z.string().optional(),
  customVariables: z.record(z.string(), z.any()).optional(),
});

export const TestConnectionSchema = z.object({
  service: z.enum([
    'gemini',
    'firebase',
    'supabase',
    'twilio',
    'vapi',
    'retell',
    'elevenlabs',
    'resend',
    'sendgrid',
    'google_calendar',
    'stripe',
    'n8n',
  ]),
});
