import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Database,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sliders,
  PowerOff,
  Check,
  Copy,
  Info,
  ExternalLink,
  Layers,
  X,
  Clock,
  Terminal,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Integration, IntegrationStatusState } from '../types';

interface IntegrationsViewProps {
  integrations: Integration[];
  onRefresh: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onRefresh,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [configModalItem, setConfigModalItem] = useState<Integration | null>(null);
  const [disconnectModalItem, setDisconnectModalItem] = useState<Integration | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Icon selector based on provider or category
  const renderProviderIcon = (provider: string, category: string) => {
    switch (provider) {
      case 'gemini':
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
      case 'firebase':
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'supabase':
        return <Database className="w-5 h-5 text-emerald-600" />;
      case 'twilio':
      case 'vapi':
      case 'retell':
      case 'elevenlabs':
        return <Phone className="w-5 h-5 text-cyan-600" />;
      case 'resend':
      case 'sendgrid':
        return <Mail className="w-5 h-5 text-rose-500" />;
      case 'google_calendar':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-violet-600" />;
      case 'n8n':
        return <Workflow className="w-5 h-5 text-orange-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  // Status badge with strict visual indicators
  const renderStatusBadge = (status: IntegrationStatusState, connected?: boolean) => {
    if (status === 'connected' || connected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Connected</span>
        </span>
      );
    }
    if (status === 'config_required') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Configuration Required</span>
        </span>
      );
    }
    if (status === 'disabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <PowerOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Disabled (Credentials Required)</span>
        </span>
      );
    }
    if (status === 'connection_failed' || status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Connection Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span>Disconnected</span>
      </span>
    );
  };

  // Run live connection test against actual API endpoint
  const handleTestConnection = async (item: Integration) => {
    setTestingId(item.id);
    setTestResult(null);
    try {
      const res = await api.testIntegration(item.provider);
      setTestResult({
        id: item.id,
        success: res.connected,
        message: res.message,
        latencyMs: res.latencyMs,
      });
      onRefresh();
    } catch (err: any) {
      setTestResult({
        id: item.id,
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingId(null);
    }
  };

  // Handle disconnect
  const handleDisconnect = async (item: Integration) => {
    try {
      await api.disconnectIntegration(item.id);
      setDisconnectModalItem(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to disconnect integration', err);
    }
  };

  // Copy env variable name
  const handleCopyVar = (varName: string) => {
    navigator.clipboard.writeText(varName);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  // Save integration configuration
  const handleSaveConfig = async () => {
    if (!configModalItem) return;
    setSavingConfig(true);
    try {
      await api.configureIntegration(configModalItem.id, configValues);
      setConfigModalItem(null);
      setConfigValues({});
      onRefresh();
    } catch (err) {
      console.error('Failed to save config', err);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Core SaaS Integrations &amp; Connectors</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-tenant infrastructure connectors across AI intelligence, authentication, PostgreSQL database, PSTN voice telephony, transactional email, Google Calendar, Stripe billing, and n8n workflows.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start md:self-center cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Global Status Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Real Connectivity Enforcement
          </p>
          <p className="text-slate-500">
            Services without required environment variables are marked as <span className="font-medium text-amber-700">Configuration Required</span>. Click <span className="font-medium text-slate-700">Test Connection</span> on any integration to run a real server-side ping test. Only integrations with successful tests will display <span className="font-medium text-emerald-700">Connected</span>.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => {
          const isTesting = testingId === item.id;
          const currentResult = testResult && testResult.id === item.id ? testResult : null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Icon, Name, Category, Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {renderProviderIcon(item.provider, item.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mb-3">
                  {renderStatusBadge(item.status, item.connected)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {item.description}
                </p>

                {/* Missing / Required Env Variables Tag */}
                {item.envVarsRequired && item.envVarsRequired.length > 0 && (
                  <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-slate-400" />
                        Required Keys
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.envVarsRequired.map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Test Result Alert */}
                {currentResult && (
                  <div
                    className={`mb-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      currentResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {currentResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {currentResult.success ? 'Handshake Successful' : 'Connection Failed'}
                        {currentResult.latencyMs && (
                          <span className="ml-1.5 font-normal text-[11px] opacity-80">
                            ({currentResult.latencyMs}ms)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] leading-relaxed">{currentResult.message}</p>
                    </div>
                  </div>
                )}

                {/* Error Message from Database State */}
                {!currentResult && item.errorMessage && (
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item.errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Test Connection, Configure, Disconnect */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(item)}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setConfigModalItem(item);
                      setConfigValues(item.config || {});
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Configure</span>
                  </button>
                </div>

                {(item.status === 'connected' || item.connected) && (
                  <button
                    onClick={() => setDisconnectModalItem(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <PowerOff className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Modal */}
      {configModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  {renderProviderIcon(configModalItem.provider, configModalItem.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Configure {configModalItem.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {configModalItem.category} Service Settings
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfigModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction on how to configure */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">
                Environment Variable Declaration
              </p>
              <p>
                API keys and credentials are securely managed via your project settings or container environment. Click below to copy required variable names:
              </p>
              {configModalItem.envVarsRequired && (
                <div className="space-y-1.5 pt-1">
                  {configModalItem.envVarsRequired.map((v) => (
                    <div
                      key={v}
                      className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
                    >
                      <span className="font-semibold text-slate-700">{v}</span>
                      <button
                        onClick={() => handleCopyVar(v)}
                        className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-sans font-medium cursor-pointer"
                      >
                        {copiedVar === v ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Custom Configuration Attributes */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Optional Metadata / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Production US-East Pool, Backup Relay"
                value={configValues.customNote || ''}
                onChange={(e) => setConfigValues({ ...configValues, customNote: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfigModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingConfig ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {disconnectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <PowerOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Disconnect {disconnectModalItem.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Active workflows and automated sync routines for this service will be temporarily suspended until re-authorized.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDisconnectModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisconnect(disconnectModalItem)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
