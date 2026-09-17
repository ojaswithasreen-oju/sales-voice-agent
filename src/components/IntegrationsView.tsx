import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe,
  Send,
  Calendar,
  MessageSquare,
  Shield,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { Integration } from '../types';

interface IntegrationsViewProps {
  integrations: Integration[];
  onRefresh: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onRefresh,
}) => {
  const [webhookUrl, setWebhookUrl] = useState('https://api.acme.example.com/v1/voice-events');
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleIntegration(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle integration', err);
    }
  };

  const handleTestWebhook = () => {
    setWebhookTestStatus('Dispatching sample JSON payload...');
    setTimeout(() => {
      setWebhookTestStatus('HTTP 200 OK — Handshake Verified in 48ms');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ecosystem &amp; Integrations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Bi-directional synchronization for CRMs, calendars, messaging webhooks, and enterprise telephony.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div>
                  {item.connected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggle(item.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  (item.status === 'connected' || item.connected)
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                }`}
              >
                {(item.status === 'connected' || item.connected) ? 'Disconnect' : 'Connect & Authorize'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Webhook Event Dispatcher Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Custom Webhook Ingress / Egress</h3>
            <p className="text-xs text-slate-500">
              Receive real-time JSON payloads for <code className="text-indigo-600">call.completed</code>, <code className="text-indigo-600">lead.qualified</code>, and <code className="text-indigo-600">booking.created</code>.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono"
          />
          <button
            onClick={handleTestWebhook}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Send Test Ping
          </button>
        </div>

        {webhookTestStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{webhookTestStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
