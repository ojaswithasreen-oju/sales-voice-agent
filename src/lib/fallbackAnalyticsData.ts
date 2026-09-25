import type {
  AiImprovementSuggestion,
  KnowledgeVersion,
  CompanyConversationAnalytics
} from '../types';

export const fallbackImprovementSuggestions: AiImprovementSuggestion[] = [
  {
    id: 'sugg_enterprise_sso',
    tenantId: 'org_acme_cloud',
    category: 'knowledge_gap',
    title: 'Enterprise SAML/SSO Okta Configuration Question',
    description: 'Callers frequently asked if VocalPulse supports SAML 2.0 and SCIM directory sync for Okta and Microsoft Entra ID.',
    detectedFromCount: 8,
    sampleCustomerQuotes: [
      'Does your solution support SAML SSO with Okta directory groups?',
      'Can we manage rep permissions through Microsoft Entra ID?'
    ],
    suggestedAnswer: 'Yes, VocalPulse Enterprise tiers fully support SAML 2.0 and automated SCIM provisioning with Okta, Microsoft Entra ID (Azure AD), Google Workspace, and OneLogin.',
    status: 'pending',
    targetKnowledgeSourceId: 'k1',
    targetKnowledgeTitle: 'Product & Pricing Guide',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'sugg_hipaa_compliance',
    tenantId: 'org_acme_cloud',
    category: 'common_objection',
    title: 'HIPAA & BAA Agreement Clarification',
    description: 'Healthcare prospects asked whether VocalPulse signs Business Associate Agreements (BAAs) for patient audio handling.',
    detectedFromCount: 5,
    sampleCustomerQuotes: [
      'Do you execute a BAA for healthcare deployments under HIPAA?',
      'How is patient identifiable voice data handled?'
    ],
    suggestedAnswer: 'Yes. For healthcare customers handling PHI, we execute standard BAAs with end-to-end audio encryption and automated PII/PHI redaction enabled.',
    status: 'pending',
    targetKnowledgeSourceId: 'k2',
    targetKnowledgeTitle: 'Security & Compliance Whitepaper',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'sugg_sla_latency',
    tenantId: 'org_acme_cloud',
    category: 'unanswered_question',
    title: 'Voice Turnaround Latency SLA',
    description: 'Callers asking about real-time voice latency benchmarks when switching from traditional IVR to conversational AI.',
    detectedFromCount: 12,
    sampleCustomerQuotes: [
      'What is the round-trip latency when an agent responds to caller input?'
    ],
    suggestedAnswer: 'VocalPulse operates at a median conversational latency of 320ms to 450ms end-to-end, utilizing localized edge audio nodes and streaming speech tokens.',
    status: 'approved',
    reviewedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    reviewedBy: 'Alex Rivera (VP Ops)',
    targetKnowledgeSourceId: 'k1',
    targetKnowledgeTitle: 'Product & Pricing Guide',
    appliedVersion: 2,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export const fallbackKnowledgeVersions: KnowledgeVersion[] = [
  {
    id: 'ver_2026_03_01',
    tenantId: 'org_acme_cloud',
    sourceId: 'k1',
    sourceTitle: 'Product & Pricing Guide',
    versionNumber: 3,
    changeSummary: 'Added custom CRM webhook parameters and updated 2026 enterprise pricing tiers.',
    previousContentSnippet: 'Pricing tiers starting at $49/mo with standard SIP forwarding.',
    newContentSnippet: 'Pricing tiers starting at $49/mo with standard SIP forwarding and native CRM webhook sync.',
    updatedBy: 'Sarah Chen (Lead AI Engineer)',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    suggestionId: 'sugg_sla_latency',
    status: 'active',
  },
  {
    id: 'ver_2026_02_15',
    tenantId: 'org_acme_cloud',
    sourceId: 'k2',
    sourceTitle: 'Security & Compliance Whitepaper',
    versionNumber: 2,
    changeSummary: 'Initial baseline voice prompt knowledge base with HIPAA redaction policies.',
    previousContentSnippet: 'Standard audio recording policies with 30-day retention.',
    newContentSnippet: 'SOC 2 Type II compliant audio storage with automatic PII redaction.',
    updatedBy: 'System Migration',
    timestamp: new Date(Date.now() - 3600000 * 240).toISOString(),
    status: 'active',
  },
];

export const fallbackImprovementDashboard = {
  knowledgeGapsCount: 3,
  approvedImprovementsCount: 14,
  pendingSuggestionsCount: 2,
  aiResolutionRate: 91.8,
  knowledgeCoveragePct: 95.4,
  escalationRate: 8.2,
  performanceTrends: [
    { month: 'Nov', resolutionRate: 84.2, escalationRate: 15.8, coveragePct: 88.0 },
    { month: 'Dec', resolutionRate: 86.5, escalationRate: 13.5, coveragePct: 90.2 },
    { month: 'Jan', resolutionRate: 89.1, escalationRate: 10.9, coveragePct: 92.8 },
    { month: 'Feb', resolutionRate: 91.8, escalationRate: 8.2, coveragePct: 95.4 },
  ],
  unresolvedCustomerQuestions: [
    { question: 'Does VocalPulse integrate with on-premise Cisco Unified CallManager?', count: 9, category: 'telephony' },
    { question: 'Do you offer localized Australian and Singapore voice accent models?', count: 7, category: 'voice' },
    { question: 'Can we configure multiple outbound caller IDs by campaign group?', count: 5, category: 'routing' },
  ],
  mostCommonIssues: [
    { category: 'Compliance & BAA', count: 8, percentage: 38 },
    { category: 'Enterprise SSO', count: 6, percentage: 29 },
    { category: 'CRM Webhooks', count: 4, percentage: 19 },
    { category: 'Telephony Trunks', count: 3, percentage: 14 },
  ],
};

export const fallbackConversationAnalytics: CompanyConversationAnalytics = {
  dateRange: 'Last 30 Days',
  totalCalls: 412,
  avgInterestScore: 89,
  humanHandoffRate: '8.4%',
  qualifiedRate: '51.8%',
  frequentlyAskedQuestions: [
    { question: 'What is your standard contract duration and SLA guarantee?', count: 68, category: 'Pricing & SLA', aiAnsweredRate: 98 },
    { question: 'Can we pilot with 10 agents before company-wide rollout?', count: 54, category: 'Enterprise Pilot', aiAnsweredRate: 96 },
    { question: 'Do you offer direct native CRM bi-directional sync?', count: 47, category: 'Integrations', aiAnsweredRate: 100 },
    { question: 'How quickly can incoming phone calls be routed to human SDRs?', count: 39, category: 'Telephony', aiAnsweredRate: 94 },
    { question: 'Is HIPAA compliance and signed BAA available on Growth Platform?', count: 32, category: 'Compliance', aiAnsweredRate: 68 },
  ],
  commonObjections: [
    { objection: 'Migration & implementation timeline', count: 42, percentage: 38, primaryProduct: 'Enterprise Suite', bestCounterTactic: 'Highlight 48-hour automated zero-downtime SIP trunk migration wizard.' },
    { objection: 'Pricing model & custom budget', count: 35, percentage: 31, primaryProduct: 'Enterprise Suite', bestCounterTactic: 'Offer 15% annual upfront discount and Net-30 invoicing terms.' },
    { objection: 'Integration with existing legacy ERP', count: 21, percentage: 19, primaryProduct: 'Custom Connectors', bestCounterTactic: 'Provide pre-built Docker gateway container and OpenAPI schemas.' },
    { objection: 'Security & SOC2 Type II compliance', count: 14, percentage: 12, primaryProduct: 'Security Add-on', bestCounterTactic: 'Instantly email signed SOC2 Type II audit summary and penetration test report.' },
  ],
  frequentlyRequestedProducts: [
    { productName: 'Acme Enterprise Suite', inquiriesCount: 184, conversionRate: 34.2, interestTrend: 'up' },
    { productName: 'Global Edge Webhooks API', inquiriesCount: 92, conversionRate: 28.5, interestTrend: 'up' },
    { productName: 'HIPAA & Healthcare Compliance Add-on', inquiriesCount: 64, conversionRate: 22.0, interestTrend: 'stable' },
    { productName: 'Custom Telephony Trunking', inquiriesCount: 48, conversionRate: 31.0, interestTrend: 'stable' },
  ],
  hesitationReasons: [
    { reason: 'Pricing uncertainty & volume discount approval', count: 46, impact: 'high', description: 'Prospects require authorized executive confirmation of tier discounts for 20+ seats.' },
    { reason: 'Migration timeline and onboarding bandwidth', count: 38, impact: 'high', description: 'Teams worry about disrupted sales workflows during AI voice transition.' },
    { reason: 'Security review and compliance turnaround', count: 27, impact: 'medium', description: 'Legal departments require signed BAAs and SOC2 Type II audit letters.' },
    { reason: 'Legacy ERP & custom CRM sync compatibility', count: 19, impact: 'medium', description: 'Companies using proprietary databases need assurance regarding webhook reliability.' },
  ],
  unansweredTopics: [
    { topic: 'Customer-Managed KMS Encryption Key Escrow outside AWS', frequency: 18, lastAsked: '2 hours ago', sampleQuestion: 'Does Acme allow private on-premise KMS keys for HIPAA data?' },
    { topic: 'Pro Plan Dedicated Priority Support SLAs', frequency: 15, lastAsked: 'Yesterday', sampleQuestion: 'Does the Pro tier have phone support and 1-hour response times?' },
    { topic: 'Hardware Security Module (HSM) Level 3 Certification', frequency: 9, lastAsked: '3 days ago', sampleQuestion: 'Is VocalPulse voice storage FIPS 140-2 Level 3 certified?' },
    { topic: 'Custom Regional Caller ID Provisioning in APAC', frequency: 7, lastAsked: '4 days ago', sampleQuestion: 'Can we purchase Singapore and Australia numbers with local caller ID?' }
  ],
  interestTrends: [
    { period: 'Week 1', overallInterestScore: 78, qualifiedCount: 22, volume: 84 },
    { period: 'Week 2', overallInterestScore: 82, qualifiedCount: 28, volume: 96 },
    { period: 'Week 3', overallInterestScore: 86, qualifiedCount: 37, volume: 118 },
    { period: 'Week 4', overallInterestScore: 91, qualifiedCount: 48, volume: 142 },
    { period: 'Current', overallInterestScore: 95, qualifiedCount: 56, volume: 162 },
  ],
};
