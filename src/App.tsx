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
  X,
  Lightbulb,
  Search,
  Command,
  ExternalLink,
  Activity,
  ArrowRight
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
import { AIImprovementView } from './components/AIImprovementView';
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
  | 'improvements'
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

  // Global Modals & Modern UI States
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [testAssistantId, setTestAssistantId] = useState<string | undefined>(undefined);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [showLandingShowcase, setShowLandingShowcase] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // If viewing showcase or not logged in, show the marketing Landing Page!
  if (showLandingShowcase || !currentUser || !currentOrg) {
    const handleLaunchDemoWorkspace = async () => {
      try {
        setLoadingData(true);
        const res = await api.signin('alex.chen@acmecloud.example.com');
        handleAuthSuccess(res.user, res.organization, false);
        setShowLandingShowcase(false);
      } catch (err) {
        console.error('Failed to launch demo workspace', err);
        setAuthModalMode('signin');
        setAuthModalOpen(true);
      } finally {
        setLoadingData(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased">
        {currentUser && (
          <div className="bg-indigo-950/80 border-b border-indigo-800/60 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2 text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Previewing 3D Interactive WebGL Showcase</span>
            </div>
            <button
              onClick={() => setShowLandingShowcase(false)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-xs"
            >
              Return to Modern Workspace &rarr;
            </button>
          </div>
        )}

        <LandingPage
          onStartFree={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthModalMode('signin');
            setAuthModalOpen(true);
          }}
          onLaunchDemo={handleLaunchDemoWorkspace}
          onOpenSignUp={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
          onOpenSignIn={() => {
            setAuthModalMode('signin');
            setAuthModalOpen(true);
          }}
          onSimulateAudioDemo={handleLaunchDemoWorkspace}
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

  const navSections: Array<{
    title: string;
    items: Array<{ id: NavTab; label: string; icon: React.FC<any>; count?: number }>;
  }> = [
    {
      title: 'Voice Telephony',
      items: [
        { id: 'overview', label: 'Overview HUD', icon: LayoutDashboard },
        { id: 'assistants', label: 'AI Voice Agents', icon: Bot, count: assistants.length },
        { id: 'phone', label: 'Phone & Telephony', icon: Phone, count: phoneNumbers.length },
        { id: 'calls', label: 'Call Records & AI', icon: PhoneCall, count: calls.length },
      ],
    },
    {
      title: 'CRM & Knowledge',
      items: [
        { id: 'leads', label: 'Leads & CRM', icon: Users, count: leads.length },
        { id: 'products', label: 'Products & Catalogue', icon: Package, count: products.length },
        { id: 'knowledge', label: 'Knowledge Base', icon: FileText, count: knowledge.length },
      ],
    },
    {
      title: 'Intelligence & Growth',
      items: [
        { id: 'improvements', label: 'AI Improvement Loop', icon: Lightbulb },
        { id: 'analytics', label: 'Sales Analytics', icon: TrendingUp },
      ],
    },
    {
      title: 'Platform',
      items: [
        { id: 'team', label: 'Team & RBAC', icon: Shield, count: teamMembers.length },
        { id: 'integrations', label: 'Integrations', icon: Layers, count: integrations.filter(i => i.connected).length },
        { id: 'billing', label: 'Usage & Plans', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((s) => s.items);

  const filteredCommands = allNavItems.filter((item) =>
    item.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="modern-workspace min-h-screen bg-[#07090e] text-slate-100 flex flex-col antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Global Glassmorphic Navigation Bar */}
      <header className="bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xl shadow-black/20">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/25">
              V
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-bold text-sm text-white tracking-tight">VocalPulse</span>
              <span className="text-[10px] font-mono font-extrabold text-indigo-400 px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline">/</span>

          {/* Tenant Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs font-semibold text-slate-200">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentOrg.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search modules, agents, calls...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Top Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live System Operational Status */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>8 PoPs Global SIP &bull; 18ms</span>
          </div>

          {/* Toggle to 3D Showcase */}
          <button
            onClick={() => setShowLandingShowcase(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
            title="View 3D WebGL Showcase"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Showcase</span>
          </button>

          {/* Global Quick Action: Test Assistant */}
          <button
            onClick={() => handleOpenTestAssistant()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/40 transition-all cursor-pointer shadow-xs hover:border-indigo-400"
          >
            <Play className="w-3 h-3 fill-current text-indigo-400" />
            <span>Voice Studio</span>
          </button>

          {/* Global Quick Action: Simulate Inbound Call */}
          <button
            onClick={handleOpenSimulateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 transition-all cursor-pointer shadow-xs shadow-emerald-500/10 hover:border-emerald-400"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>Simulate Call</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden 2xl:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{String(currentUser?.role || 'owner').replace(/_/g, ' ')}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* App Body Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Modern Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b0f19]/90 backdrop-blur-xl border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4 overflow-y-auto pr-1">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-1">
                  {section.title}
                </div>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600/25 to-violet-600/15 text-white border border-indigo-500/40 shadow-xs shadow-indigo-500/10'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r bg-indigo-500 shadow-sm shadow-indigo-500" />
                      )}

                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                            isActive
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : 'bg-slate-800/60 text-slate-500 border-slate-700/50'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Sidebar Usage Widget */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/90 text-xs space-y-2 mt-4 shadow-md shadow-black/20">
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span className="text-[11px]">Minutes Quota</span>
              <span className="font-mono text-[11px] text-indigo-300">
                {currentOrg.minutesUsed} / {currentOrg.minutesLimit}m
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
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
              className="w-full py-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 text-center block cursor-pointer transition-colors"
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
              onRefresh={loadWorkspaceData}
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

          {activeTab === 'improvements' && (
            <AIImprovementView
              knowledge={knowledge}
              currentUser={currentUser}
              organization={currentOrg}
              onRefreshKnowledge={loadWorkspaceData}
              onNavigateToKnowledge={() => setActiveTab('knowledge')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              calls={calls}
              leads={leads}
              assistants={assistants}
              onNavigateToKnowledge={() => setActiveTab('knowledge')}
              onNavigateToImprovements={() => setActiveTab('improvements')}
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

      {/* Global Command Palette Modal */}
      {commandPaletteOpen && (
        <div
          onClick={() => setCommandPaletteOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Command Search Input Bar */}
            <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Jump to module, trigger simulation, or test voice..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700 shrink-0">
                ESC
              </kbd>
            </div>

            {/* Command Actions & Modules List */}
            <div className="p-2 overflow-y-auto space-y-1 divide-y divide-slate-800/40">
              {/* Quick Actions Group */}
              <div className="py-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1">Quick Actions</div>
                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    handleOpenSimulateModal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Simulate Inbound Customer Call</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Run</span>
                </button>

                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    handleOpenTestAssistant();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Play className="w-4 h-4 text-indigo-400 fill-current" />
                    <span>Open Voice Persona Test Studio</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">Launch</span>
                </button>

                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setShowLandingShowcase(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Switch to 3D WebGL Showcase</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">View</span>
                </button>
              </div>

              {/* Navigation Modules */}
              <div className="py-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1">Navigate To Module</div>
                {filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/15 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Command Palette Footer */}
            <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Navigate with cursor or search term</span>
              <span>VocalPulse AI v2.4</span>
            </div>
          </div>
        </div>
      )}

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
