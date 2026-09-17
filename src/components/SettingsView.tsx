import React, { useState } from 'react';
import {
  Settings,
  Building,
  Bot,
  Phone,
  Shield,
  Bell,
  CheckCircle2,
  Save,
  Lock,
  Globe
} from 'lucide-react';
import { api } from '../lib/api';
import type { Organization } from '../types';

interface SettingsViewProps {
  organization: Organization;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organization,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'ai' | 'telephony' | 'security' | 'notifications'>('company');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(organization.name || '');
  const [industry, setIndustry] = useState(organization.industry || 'B2B SaaS');
  const [size, setSize] = useState(organization.size || '11-50');
  const [website, setWebsite] = useState(organization.website || 'https://acme.example.com');
  const [timezone, setTimezone] = useState(organization.timezone || 'America/New_York');

  // AI Defaults
  const [temperature, setTemperature] = useState('0.4');
  const [maxTokens, setMaxTokens] = useState('150');
  const [latencyOptimization, setLatencyOptimization] = useState(true);
  const [providerFallback, setProviderFallback] = useState('google_genai');

  // Telephony
  const [sipDomain, setSipDomain] = useState('sip.vocalpulse.telephony.us-east-1');
  const [codec, setCodec] = useState('opus');
  const [globalFallbackNumber, setGlobalFallbackNumber] = useState('+1 (555) 019-9922');

  // Security
  const [retentionDays, setRetentionDays] = useState('90');
  const [piiMasking, setPiiMasking] = useState(true);
  const [soc2Compliance, setSoc2Compliance] = useState(true);

  // Notifications
  const [notifyLead, setNotifyLead] = useState(true);
  const [notifyDemo, setNotifyDemo] = useState(true);
  const [notifyDrop, setNotifyDrop] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateOrganization({
        name,
        industry,
        size,
        website,
        timezone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onRefresh();
    } catch (err) {
      console.error('Failed to update organization settings', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace &amp; System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure tenant profiles, sub-second AI latency tuning, telephony SIP credentials, and security compliance.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </span>
        )}
      </div>

      {/* Main Settings Container with Left Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Navigation Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-1 bg-slate-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('company')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'company'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Company Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Voice &amp; Model</span>
          </button>

          <button
            onClick={() => setActiveTab('telephony')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'telephony'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>SIP Telephony Trunk</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security &amp; Compliance</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alert Notifications</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 sm:p-8">
          <form onSubmit={handleSave} className="max-w-xl space-y-5">
            {/* COMPANY PROFILE */}
            {activeTab === 'company' && (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Company Information</h3>
                  <p className="text-xs text-slate-500">Legal trading entity and business timezone defaults</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Operational Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </>
            )}

            {/* AI VOICE & MODEL */}
            {activeTab === 'ai' && (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Voice &amp; LLM Architecture</h3>
                  <p className="text-xs text-slate-500">
                    Provider-independent AI architecture (Gemini, DeepSeek, Anthropic, Custom LLM)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Lower = more deterministic</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Response Tokens</label>
                    <input
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Keeps telephone turns concise</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Voice LLM Engine</label>
                  <select
                    value={providerFallback}
                    onChange={(e) => setProviderFallback(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="google_genai">Google Gemini 2.5 Flash (Ultra-low latency streaming)</option>
                    <option value="provider_agnostic">Multi-Model Auto-Failover Protocol</option>
                    <option value="custom_sip_ai">Self-Hosted Private vLLM Endpoint</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={latencyOptimization}
                      onChange={(e) => setLatencyOptimization(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-800">
                      Enable sub-400ms speculative audio token streaming
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* TELEPHONY */}
            {activeTab === 'telephony' && (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900">SIP Telephony Trunking</h3>
                  <p className="text-xs text-slate-500">Configure carrier interconnects and audio codecs</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SIP Trunk Domain</label>
                  <input
                    type="text"
                    value={sipDomain}
                    onChange={(e) => setSipDomain(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Audio Codec</label>
                    <select
                      value={codec}
                      onChange={(e) => setCodec(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white uppercase font-mono"
                    >
                      <option value="opus">Opus (Wideband 48kHz HD)</option>
                      <option value="g711u">G.711 &mu;-law (PSTN Standard)</option>
                      <option value="g722">G.722 Wideband</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Global Fallback Ring Group</label>
                    <input
                      type="text"
                      value={globalFallbackNumber}
                      onChange={(e) => setGlobalFallbackNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Security &amp; Data Governance</h3>
                  <p className="text-xs text-slate-500">Zero-data-retention options and PII redacting</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={piiMasking}
                      onChange={(e) => setPiiMasking(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Automatic PII Masking in Audio &amp; Transcripts
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Redacts credit card numbers, SSNs, and sensitive identifiers.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soc2Compliance}
                      onChange={(e) => setSoc2Compliance(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        SOC2 Type II &amp; HIPAA Strict Encryption Mode
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Enforces TLS 1.3 in transit and AES-256 at rest.
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Call Recording Retention Period
                  </label>
                  <select
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="30">30 Days</option>
                    <option value="90">90 Days (Recommended)</option>
                    <option value="365">1 Year</option>
                    <option value="unlimited">Indefinite Retention</option>
                  </select>
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alert Triggers &amp; Notifications</h3>
                  <p className="text-xs text-slate-500">Choose when your sales team gets notified</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyLead}
                      onChange={(e) => setNotifyLead(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Send Email &amp; Slack alert when High-Intent Lead (&gt;75 score) is captured
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyDemo}
                      onChange={(e) => setNotifyDemo(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Instant calendar invite dispatch when AI books an executive demo
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyDrop}
                      onChange={(e) => setNotifyDrop(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Alert team if an inbound call is dropped or transferred
                    </span>
                  </label>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Workspace Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
