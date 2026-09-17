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
};
