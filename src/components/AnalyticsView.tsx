import React, { useState } from 'react';
import {
  TrendingUp,
  PhoneCall,
  Users,
  Target,
  DollarSign,
  Clock,
  PieChart,
  BarChart2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import type { CallRecord, Lead, Assistant } from '../types';

interface AnalyticsViewProps {
  calls: CallRecord[];
  leads: Lead[];
  assistants: Assistant[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  calls,
  leads,
  assistants,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Aggregate metrics
  const totalCalls = 412;
  const avgDuration = '3m 48s';
  const totalLeads = 108;
  const qualifiedLeads = 56;
  const demosBooked = 28;
  const closedWon = 12;
  const attributedRevenue = '$184,500';

  // Common objections
  const objections = [
    { name: 'Migration & implementation timeline', count: 42, pct: 38 },
    { name: 'Pricing model & custom budget', count: 35, pct: 31 },
    { name: 'Integration with existing legacy ERP', count: 21, pct: 19 },
    { name: 'Security & SOC2 Type II compliance', count: 14, pct: 12 },
  ];

  // Common questions
  const commonQuestions = [
    { question: 'What is your standard contract duration and SLA guarantee?', count: 68 },
    { question: 'Can we pilot with 10 agents before company-wide rollout?', count: 54 },
    { question: 'Do you offer direct native CRM bi-directional sync?', count: 47 },
    { question: 'How quickly can incoming phone calls be routed to human SDRs?', count: 39 },
  ];

  const topAssistant = assistants.reduce(
    (prev, current) => (prev.callsHandled > current.callsHandled ? prev : current),
    assistants[0]
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales &amp; AI Intelligence Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track call volume, full-funnel attribution, objection clustering, and autonomous conversion metrics.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              timeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              timeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${
              timeRange === '90d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Total Inbound Calls</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalCalls}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% vs prev period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Avg Call Duration</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{avgDuration}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Sub-400ms voice latency
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">AI Discovery Qualification</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">51.8%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +6.2% vs human SDR benchmarks
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Attributed Pipeline Revenue</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">{attributedRevenue}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            12 closed deals influenced
          </div>
        </div>
      </div>

      {/* Full-Funnel Lead Conversion Funnel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">End-to-End Voice Conversion Funnel</h3>
          <p className="text-xs text-slate-500">How inbound calls translate into qualified enterprise meetings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-slate-500 text-xs font-medium">Inbound Calls</div>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalCalls}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% Top of Funnel</div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
            <div className="text-blue-700 text-xs font-medium">CRM Leads Captured</div>
            <div className="text-2xl font-bold text-blue-950 font-mono mt-1">{totalLeads}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">26.2% Conversion</div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center">
            <div className="text-indigo-700 text-xs font-medium">BANT Qualified</div>
            <div className="text-2xl font-bold text-indigo-950 font-mono mt-1">{qualifiedLeads}</div>
            <div className="text-[10px] text-indigo-600 mt-0.5">51.8% of Leads</div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
            <div className="text-amber-700 text-xs font-medium">Demos Booked</div>
            <div className="text-2xl font-bold text-amber-950 font-mono mt-1">{demosBooked}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">50.0% of Qualified</div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
            <div className="text-emerald-700 text-xs font-medium">Won Deals</div>
            <div className="text-2xl font-bold text-emerald-950 font-mono mt-1">{closedWon}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">42.8% Close Rate</div>
          </div>
        </div>
      </div>

      {/* Objections & Questions Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objections Raised */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Prospect Objections Clustering</h3>
            <span className="text-xs text-slate-400 font-mono">112 observed</span>
          </div>

          <div className="space-y-3">
            {objections.map((obj, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <span>{obj.name}</span>
                  <span className="font-bold text-slate-900">{obj.pct}% ({obj.count})</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${obj.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            Tip: Upload solutions addressing "migration timeline" to your Knowledge Base to further improve resolution.
          </div>
        </div>

        {/* Most Frequent Questions Asked */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Common Inbound Questions</h3>
            <span className="text-xs text-slate-400 font-mono">Real-time transcripts</span>
          </div>

          <div className="space-y-3">
            {commonQuestions.map((q, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-3"
              >
                <span className="text-slate-800 font-medium">"{q.question}"</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                  {q.count} calls
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
