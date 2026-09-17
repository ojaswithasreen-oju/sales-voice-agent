import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Download,
  Shield,
  ArrowRight,
  Clock,
  Sparkles,
  Phone
} from 'lucide-react';
import { api } from '../lib/api';
import type { Organization, PlanTier } from '../types';

interface BillingViewProps {
  organization: Organization;
  onRefresh: () => void;
}

const PLANS: Array<{
  id: PlanTier;
  name: string;
  price: string;
  period: string;
  minutes: number;
  assistants: string;
  numbers: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    id: 'trial',
    name: 'Evaluation Sandbox',
    price: '$0',
    period: 'for 14 days',
    minutes: 30,
    assistants: '1 Assistant',
    numbers: '1 Demo Number',
    features: [
      '30 Autonomous Voice Minutes',
      'Basic Knowledge Base (5 docs)',
      'Community Support',
      'Turn-by-turn transcripts',
    ],
  },
  {
    id: 'pro',
    name: 'Starter Pro',
    price: '$149',
    period: '/ month',
    minutes: 500,
    assistants: '3 Assistants',
    numbers: '2 Inbound Numbers',
    features: [
      '500 Autonomous Voice Minutes',
      '3 AI Voice Agents',
      'Full BANT CRM Pipeline',
      'HubSpot & Google Calendar Sync',
      'Sub-400ms Voice Latency',
    ],
  },
  {
    id: 'business',
    name: 'Growth Business',
    price: '$499',
    period: '/ month',
    minutes: 2000,
    assistants: '10 Assistants',
    numbers: '5 Inbound Numbers',
    popular: true,
    features: [
      '2,000 Autonomous Voice Minutes',
      '10 AI Voice Agents',
      'Custom Voice Cloning & Tone Tuning',
      'Salesforce & Webhooks Bi-directional Sync',
      'Multi-user RBAC Team Controls',
      'Priority SLA Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scale',
    price: '$1,999',
    period: '/ month',
    minutes: 10000,
    assistants: 'Unlimited Assistants',
    numbers: 'Dedicated SIP Trunks',
    features: [
      '10,000+ Voice Minutes Included',
      'Custom Bring-Your-Own SIP Trunking',
      'SOC2 Type II & HIPAA Compliance Ready',
      'Dedicated Solutions Architect',
      'Custom LLM Fine-Tuning',
      '99.99% Uptime Guarantee',
    ],
  },
];

export const BillingView: React.FC<BillingViewProps> = ({
  organization,
  onRefresh,
}) => {
  const [upgradingPlan, setUpgradingPlan] = useState<PlanTier | null>(null);

  const used = organization.minutesUsed;
  const limit = organization.minutesLimit;
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  const handleSelectPlan = async (plan: PlanTier) => {
    try {
      await api.updatePlan(plan);
      setUpgradingPlan(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to change plan', err);
    }
  };

  const invoices = [
    { id: 'INV-2026-003', date: 'Mar 01, 2026', amount: '$499.00', status: 'Paid', plan: 'Growth Business' },
    { id: 'INV-2026-002', date: 'Feb 01, 2026', amount: '$499.00', status: 'Paid', plan: 'Growth Business' },
    { id: 'INV-2026-001', date: 'Jan 01, 2026', amount: '$149.00', status: 'Paid', plan: 'Starter Pro' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscription &amp; Voice Minutes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Transparent per-minute voice usage, active SaaS tier, and automated invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Current Tier:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            {organization.plan}
          </span>
        </div>
      </div>

      {/* Usage Meter Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Telephony Minutes Consumption</h3>
            <p className="text-xs text-slate-500">
              Billing cycle resets on the 1st of next month.
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-xl font-bold text-slate-900">{used}</span>
            <span className="text-slate-400 font-mono text-sm"> / {limit} mins</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{limit - used} minutes remaining in balance</span>
          <span className="font-bold text-slate-800">{pct}% utilized</span>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((p) => {
          const isCurrent = organization.plan === p.id;

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                p.popular
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md relative'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 font-mono">{p.price}</span>
                  <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="font-semibold text-indigo-600 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{p.minutes} Minutes / Month</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.assistants}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.numbers}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      p.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Switch to {p.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900 flex items-center justify-between">
          <span>Billing &amp; Invoice History</span>
          <span className="text-[11px] text-slate-500">Auto-billed to Visa ending in &bull;&bull;&bull;&bull; 4092</span>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-bold text-slate-900">{inv.id}</div>
                  <div className="text-[11px] text-slate-500">{inv.date} &bull; {inv.plan}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-slate-900">{inv.amount}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {inv.status}
                </span>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
