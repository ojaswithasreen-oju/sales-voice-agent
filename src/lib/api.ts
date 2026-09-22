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
  HandoffBrief,
  FollowUpTask,
  AiImprovementSuggestion,
  KnowledgeVersion,
  CompanyConversationAnalytics,
  HandoffTriggerReason,
} from '../types';

let currentTenantId = 'org_acme_cloud';

export function setApiTenantId(tenantId: string) {
  currentTenantId = tenantId;
  localStorage.setItem('vocalpulse_tenant_id', tenantId);
}

export function getApiTenantId(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vocalpulse_tenant_id');
    if (saved) return saved;
  }
  return currentTenantId;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-tenant-id', getApiTenantId());

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = 'Request failed';
    try {
      const errData = await response.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch {
      errMsg = response.statusText || errMsg;
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Auth & Session
  async signup(data: {
    name: string;
    email: string;
    password?: string;
    companyName: string;
    companySize?: string;
    industry?: string;
    phone?: string;
  }) {
    const res = await request<{ user: User; organization: Organization; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setApiTenantId(res.organization.id);
    return res;
  },

  async signin(email: string) {
    const res = await request<{ user: User; organization: Organization; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setApiTenantId(res.organization.id);
    return res;
  },

  async getSession() {
    return request<{
      user: User;
      organization: Organization;
      availableOrganizations: Organization[];
    }>('/api/auth/session');
  },

  async getOrganization() {
    const session = await this.getSession();
    return session.organization;
  },

  signout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vocalpulse_tenant_id');
    }
  },

  async switchWorkspace(tenantId: string) {
    setApiTenantId(tenantId);
    return request<{ organization: Organization; user: User }>('/api/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
  },

  async updateOrganization(data: Partial<Organization>) {
    return request<Organization>('/api/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Assistants
  async getAssistants() {
    return request<Assistant[]>('/api/assistants');
  },

  async createAssistant(data: Partial<Assistant>) {
    return request<Assistant>('/api/assistants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAssistant(id: string, data: Partial<Assistant>) {
    return request<Assistant>(`/api/assistants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAssistant(id: string) {
    return request<{ success: boolean }>(`/api/assistants/${id}`, {
      method: 'DELETE',
    });
  },

  // Phone Numbers
  async getPhoneNumbers() {
    return request<PhoneNumber[]>('/api/phone-numbers');
  },

  async createPhoneNumber(data: { areaCode?: string; type?: 'local' | 'toll_free'; provider?: string; assignedAssistantId?: string }) {
    return request<PhoneNumber>('/api/phone-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePhoneNumber(id: string, data: Partial<PhoneNumber>) {
    return request<PhoneNumber>(`/api/phone-numbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Products
  async getProducts() {
    return request<Product[]>('/api/products');
  },

  async createProduct(data: Partial<Product>) {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>) {
    return request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Knowledge
  async getKnowledge() {
    return request<KnowledgeSource[]>('/api/knowledge');
  },

  async createKnowledge(data: { title: string; type: string; content: string }) {
    return request<KnowledgeSource>('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteKnowledge(id: string) {
    return request<{ success: boolean }>(`/api/knowledge/${id}`, {
      method: 'DELETE',
    });
  },

  // Leads
  async getLeads() {
    return request<Lead[]>('/api/leads');
  },

  async createLead(data: Partial<Lead>) {
    return request<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateLead(id: string, data: Partial<Lead>) {
    return request<Lead>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Calls
  async getCalls() {
    return request<CallRecord[]>('/api/calls');
  },

  async getCall(id: string) {
    return request<CallRecord>(`/api/calls/${id}`);
  },

  // Team & Audit
  async getTeam() {
    return request<TeamMember[]>('/api/team');
  },

  async getTeamMembers() {
    return this.getTeam();
  },

  async inviteTeamMember(data: { name: string; email: string; role: string }) {
    return request<TeamMember>('/api/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async removeTeamMember(id: string) {
    return request<{ success: boolean }>(`/api/team/${id}`, {
      method: 'DELETE',
    });
  },

  async getAuditLogs() {
    return request<AuditLogItem[]>('/api/audit-logs');
  },

  // Integrations
  async getIntegrations() {
    return request<IntegrationItem[]>('/api/integrations');
  },

  async toggleIntegration(id: string) {
    return request<IntegrationItem>(`/api/integrations/${id}/toggle`, {
      method: 'POST',
    });
  },

  async testIntegration(serviceOrProvider: string) {
    return request<{
      success: boolean;
      service: string;
      status: 'connected' | 'config_required' | 'connection_failed';
      connected: boolean;
      message: string;
      latencyMs?: number;
      item?: IntegrationItem;
    }>('/api/integrations/test', {
      method: 'POST',
      body: JSON.stringify({ service: serviceOrProvider }),
    });
  },

  async disconnectIntegration(id: string) {
    return request<{ success: boolean; item: IntegrationItem }>(`/api/integrations/${id}/disconnect`, {
      method: 'POST',
    });
  },

  async configureIntegration(id: string, config: Record<string, any>) {
    return request<{ success: boolean; item: IntegrationItem }>(`/api/integrations/${id}/configure`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // Appointments & Calendar
  async getAppointments() {
    return request<any[]>('/api/appointments');
  },

  async createAppointment(data: any) {
    return request<any>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Customers
  async getCustomers() {
    return request<any[]>('/api/customers');
  },

  async createCustomer(data: any) {
    return request<any>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // System Health
  async getHealth() {
    return request<any>('/api/health');
  },

  // Notifications
  async getNotifications() {
    return request<NotificationItem[]>('/api/notifications');
  },

  async markAllNotificationsRead() {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Billing
  async getBilling() {
    return request<{
      organization: Organization;
      plans: any[];
      invoices: any[];
    }>('/api/billing');
  },

  async upgradePlan(plan: string) {
    return request<Organization>('/api/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async updatePlan(plan: string) {
    return this.upgradePlan(plan);
  },

  // AI Voice Testing & Simulation
  async testAssistantVoice(data: {
    assistantId?: string;
    userMessage: string;
    conversationHistory: { role: 'user' | 'assistant'; text: string }[];
    currentLanguage?: string;
  }) {
    return request<{
      text: string;
      assistantName: string;
      voice: string;
      voiceGender?: 'female' | 'male' | 'neutral';
      detectedLanguage?: string;
      detectedLanguageName?: string;
      flag?: string;
      languageSwitched?: boolean;
      speakingSpeed?: number;
      pitch?: number;
    }>('/api/ai/test-assistant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async simulateCall(data: {
    assistantId?: string;
    callerName?: string;
    callerCompany?: string;
    callerPhone?: string;
    scenario?: string;
    transcriptTurns?: { speaker: 'assistant' | 'customer'; text: string; timestamp?: string }[];
  }) {
    return request<{ call: CallRecord; lead: Lead }>('/api/ai/simulate-call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Smart Human Handoff
  async detectHandoff(data: {
    userMessage: string;
    conversationHistory?: { speaker?: string; role?: string; text: string }[];
    callerName?: string;
    callerCompany?: string;
    productDiscussed?: string;
  }) {
    return request<{
      triggered: boolean;
      triggerReason: HandoffTriggerReason | null;
      handoffBrief: HandoffBrief | null;
    }>('/api/handoff/detect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async transferCallToHuman(data: {
    callId?: string;
    repId?: string;
    repName?: string;
    handoffBrief: HandoffBrief;
  }) {
    return request<{
      success: boolean;
      transferredTo: string;
      transferredAt: string;
      status: string;
    }>('/api/handoff/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async requestHandoffCallback(data: {
    callId?: string;
    customerName: string;
    phone: string;
    company?: string;
    preferredTime?: string;
    notes?: string;
    handoffBrief?: HandoffBrief;
  }) {
    return request<{
      success: boolean;
      task: FollowUpTask;
    }>('/api/handoff/callback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getFollowUpTasks() {
    return request<FollowUpTask[]>('/api/handoff/tasks');
  },

  async updateFollowUpTask(id: string, data: Partial<FollowUpTask>) {
    return request<FollowUpTask>(`/api/handoff/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAvailableReps() {
    return request<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: 'available' | 'in_call' | 'offline';
      activeCallsToday: number;
      avatarColor: string;
    }[]>('/api/handoff/reps');
  },

  // Conversation Intelligence
  async getConversationAnalytics(params?: {
    dateRange?: string;
    assistantId?: string;
    productId?: string;
    repId?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.dateRange) query.set('dateRange', params.dateRange);
    if (params?.assistantId) query.set('assistantId', params.assistantId);
    if (params?.productId) query.set('productId', params.productId);
    if (params?.repId) query.set('repId', params.repId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<CompanyConversationAnalytics>(`/api/analytics/conversations${queryString}`);
  },

  async analyzeCall(callId: string) {
    return request<{
      callId: string;
      callerName: string;
      aiAnalysis: any;
      summary: string;
      handoffBrief?: HandoffBrief;
      transcript: any[];
    }>(`/api/calls/${callId}/analyze`, {
      method: 'POST',
    });
  },

  // Continuous AI Improvement Loop
  async getImprovementSuggestions(status?: string) {
    const q = status && status !== 'all' ? `?status=${status}` : '';
    return request<AiImprovementSuggestion[]>(`/api/improvements/suggestions${q}`);
  },

  async createImprovementSuggestion(data: Partial<AiImprovementSuggestion>) {
    return request<AiImprovementSuggestion>('/api/improvements/suggestions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveImprovementSuggestion(id: string, data: {
    targetKnowledgeSourceId?: string;
    updatedText?: string;
    changeSummary?: string;
    reviewerName?: string;
  }) {
    return request<{
      success: boolean;
      suggestion: AiImprovementSuggestion;
      version: KnowledgeVersion;
      knowledgeSource: KnowledgeSource;
    }>(`/api/improvements/suggestions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async rejectImprovementSuggestion(id: string, reviewerName?: string) {
    return request<{
      success: boolean;
      suggestion: AiImprovementSuggestion;
    }>(`/api/improvements/suggestions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewerName }),
    });
  },

  async getKnowledgeVersions() {
    return request<KnowledgeVersion[]>('/api/improvements/versions');
  },

  async revertKnowledgeVersion(id: string) {
    return request<{
      success: boolean;
      version: KnowledgeVersion;
    }>(`/api/improvements/versions/${id}/revert`, {
      method: 'POST',
    });
  },

  async getImprovementDashboard() {
    return request<{
      knowledgeGapsCount: number;
      approvedImprovementsCount: number;
      pendingSuggestionsCount: number;
      aiResolutionRate: number;
      knowledgeCoveragePct: number;
      escalationRate: number;
      performanceTrends: { month: string; resolutionRate: number; escalationRate: number; coveragePct: number }[];
      unresolvedCustomerQuestions: { question: string; count: number; category: string }[];
      mostCommonIssues: { category: string; count: number; percentage: number }[];
    }>('/api/improvements/dashboard');
  },
};
