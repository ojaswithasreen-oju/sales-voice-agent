/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot,
  PhoneCall,
  Users,
  Package,
  FileText,
  TrendingUp,
  Shield,
  Layers,
  CreditCard,
  Settings as SettingsIcon,
  LayoutDashboard,
  LogOut,
  Bell,
  Play,
  Phone,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Building,
  Menu,
  X
} from 'lucide-react';
import { api } from './lib/api';
import type {
  Organization,
  User,
  Assistant,
  CallRecord,
  Lead,
  Product,
  KnowledgeSource,
  PhoneNumber,
  TeamMember,
  Integration
} from './types';

import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DashboardOverview } from './components/DashboardOverview';
import { AssistantsView } from './components/AssistantsView';
import { PhoneView } from './components/PhoneView';
import { CallsView } from './components/CallsView';
import { LeadsView } from './components/LeadsView';
import { ProductsView } from './components/ProductsView';
import { KnowledgeView } from './components/KnowledgeView';
import { AnalyticsView } from './components/AnalyticsView';
import { TeamView } from './components/TeamView';
import { IntegrationsView } from './components/IntegrationsView';
import { BillingView } from './components/BillingView';
import { SettingsView } from './components/SettingsView';
import { SimulateCallModal } from './components/SimulateCallModal';

type NavTab =
  | 'overview'
  | 'assistants'
  | 'phone'
  | 'calls'
  | 'leads'
  | 'products'
  | 'knowledge'
  | 'analytics'
  | 'team'
  | 'integrations'
  | 'billing'
  | 'settings';

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core Workspace Data States
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeSource[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Global Modals
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [testAssistantId, setTestAssistantId] = useState<string | undefined>(undefined);

  // Fetch all tenant data
  const loadWorkspaceData = useCallback(async () => {
    try {
      setLoadingData(true);
      const [
        orgData,
        assts,
        callLogs,
        leadItems,
        prods,
        knowl,
        numbers,
        team,
        integs,
      ] = await Promise.all([
        api.getOrganization(),
        api.getAssistants(),
        api.getCalls(),
        api.getLeads(),
        api.getProducts(),
        api.getKnowledge(),
        api.getPhoneNumbers(),
        api.getTeamMembers(),
        api.getIntegrations(),
      ]);

      setCurrentOrg(orgData);
      setAssistants(assts);
      setCalls(callLogs);
      setLeads(leadItems);
      setProducts(prods);
      setKnowledge(knowl);
      setPhoneNumbers(numbers);
      setTeamMembers(team);
      setIntegrations(integs);
    } catch (err) {
      console.error('Failed to load workspace data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Check existing session on mount
  useEffect(() => {
    let mounted = true;
    api.getSession()
      .then((session) => {
        if (mounted && session?.user && session?.organization) {
          setCurrentUser(session.user);
          setCurrentOrg(session.organization);
          loadWorkspaceData();
        }
      })
      .catch(() => {
        // Unauthenticated session, show landing page
      });

    return () => {
      mounted = false;
    };
  }, [loadWorkspaceData]);

  // Auth Success Handler
  const handleAuthSuccess = (user: User, org: Organization, isNewSignup: boolean) => {
    setCurrentUser(user);
    setCurrentOrg(org);
    setAuthModalOpen(false);
    loadWorkspaceData();

    if (isNewSignup) {
      setOnboardingOpen(true);
    }
  };

  const handleLogout = () => {
    api.signout();
    setCurrentUser(null);
    setCurrentOrg(null);
    setActiveTab('overview');
  };

  const handleOpenSimulateModal = () => {
    setSimulateModalOpen(true);
  };

  const handleOpenTestAssistant = (assistantId?: string) => {
    setTestAssistantId(assistantId);
    setActiveTab('assistants');
  };

  const handlePromptFromProduct = (prompt: string) => {
    setActiveTab('assistants');
  };

  // If not logged in, show the marketing Landing Page!
  if (!currentUser || !currentOrg) {
    return (
      <div className="min-h-screen bg-white">
        <LandingPage
          onOpenSignUp={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
          onOpenSignIn={() => {
            setAuthModalMode('signin');
            setAuthModalOpen(true);
          }}
          onSimulateAudioDemo={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<any>; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistants', label: 'AI Voice Agents', icon: Bot, count: assistants.length },
    { id: 'phone', label: 'Phone & Telephony', icon: Phone, count: phoneNumbers.length },
    { id: 'calls', label: 'Call Records & AI', icon: PhoneCall, count: calls.length },
    { id: 'leads', label: 'Leads & CRM', icon: Users, count: leads.length },
    { id: 'products', label: 'Products & Catalogue', icon: Package, count: products.length },
    { id: 'knowledge', label: 'Knowledge Base', icon: FileText, count: knowledge.length },
    { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
    { id: 'team', label: 'Team & RBAC', icon: Shield, count: teamMembers.length },
    { id: 'integrations', label: 'Integrations', icon: Layers, count: integrations.filter(i => i.connected).length },
    { id: 'billing', label: 'Usage & Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Top Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              V
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm text-slate-900 tracking-tight">VocalPulse</span>
              <span className="text-xs font-semibold text-indigo-600 ml-1">AI</span>
            </div>
          </div>

          <span className="text-slate-300 hidden sm:inline">/</span>

          {/* Tenant Selector Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentOrg.name}</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
              ({currentOrg.id.slice(0, 7)})
            </span>
          </div>
        </div>

        {/* Right Top Header Actions */}
        <div className="flex items-center gap-3">
          {/* Live System Operational Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SIP Gateway 99.99%</span>
          </div>

          {/* Global Quick Action: Test Assistant */}
          <button
            onClick={() => handleOpenTestAssistant()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Voice</span>
          </button>

          {/* Global Quick Action: Simulate Inbound Call */}
          <button
            onClick={handleOpenSimulateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Simulate Call</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{String(currentUser?.role || 'owner').replace(/_/g, ' ')}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* App Body Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-2">
              Workspace Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-indigo-700/80 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Usage Widget */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="text-[11px]">Minutes Quota</span>
              <span className="font-mono text-[11px]">
                {currentOrg.minutesUsed} / {currentOrg.minutesLimit}m
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (currentOrg.minutesUsed / Math.max(1, currentOrg.minutesLimit)) * 100
                  )}%`,
                }}
              />
            </div>
            <button
              onClick={() => setActiveTab('billing')}
              className="w-full py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 text-center block cursor-pointer"
            >
              Upgrade Voice Capacity &rarr;
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <DashboardOverview
              organization={currentOrg}
              assistants={assistants}
              calls={calls}
              leads={leads}
              phoneNumbers={phoneNumbers}
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
              onOpenTestAssistant={handleOpenTestAssistant}
              onSimulateCall={handleOpenSimulateModal}
            />
          )}

          {activeTab === 'assistants' && (
            <AssistantsView
              assistants={assistants}
              products={products}
              knowledge={knowledge}
              phoneNumbers={phoneNumbers}
              onRefresh={loadWorkspaceData}
              activeTestAssistantId={testAssistantId}
            />
          )}

          {activeTab === 'phone' && (
            <PhoneView
              phoneNumbers={phoneNumbers}
              assistants={assistants}
              onRefresh={loadWorkspaceData}
              onOpenSimulateModal={handleOpenSimulateModal}
            />
          )}

          {activeTab === 'calls' && (
            <CallsView
              calls={calls}
              assistants={assistants}
              onOpenSimulateModal={handleOpenSimulateModal}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView leads={leads} onRefresh={loadWorkspaceData} />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onRefresh={loadWorkspaceData}
              onTestAssistantPrompt={handlePromptFromProduct}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeView knowledge={knowledge} onRefresh={loadWorkspaceData} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              calls={calls}
              leads={leads}
              assistants={assistants}
            />
          )}

          {activeTab === 'team' && (
            <TeamView members={teamMembers} onRefresh={loadWorkspaceData} />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView
              integrations={integrations}
              onRefresh={loadWorkspaceData}
            />
          )}

          {activeTab === 'billing' && (
            <BillingView organization={currentOrg} onRefresh={loadWorkspaceData} />
          )}

          {activeTab === 'settings' && (
            <SettingsView organization={currentOrg} onRefresh={loadWorkspaceData} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SimulateCallModal
        isOpen={simulateModalOpen}
        onClose={() => setSimulateModalOpen(false)}
        assistants={assistants}
        phoneNumbers={phoneNumbers}
        onCallCompleted={() => {
          loadWorkspaceData();
          setActiveTab('calls');
        }}
      />

      {onboardingOpen && (
        <OnboardingWizard
          organization={currentOrg}
          onComplete={() => {
            setOnboardingOpen(false);
            loadWorkspaceData();
          }}
          onCancel={() => setOnboardingOpen(false)}
        />
      )}
    </div>
  );
}
