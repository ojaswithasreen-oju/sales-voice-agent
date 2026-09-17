import React from 'react';
import {
  PhoneCall,
  Users,
  Target,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Bot,
  Play,
  Plus,
  FileText,
  Package,
  Phone,
  CheckCircle2,
  Sparkles,
  Volume2
} from 'lucide-react';
import type { Organization, Assistant, CallRecord, Lead, PhoneNumber } from '../types';

interface DashboardOverviewProps {
  organization: Organization;
  assistants: Assistant[];
  calls: CallRecord[];
  leads: Lead[];
  phoneNumbers: PhoneNumber[];
  onNavigate: (tab: string) => void;
  onOpenTestAssistant: (assistantId?: string) => void;
  onSimulateCall: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  organization,
  assistants,
  calls,
  leads,
  phoneNumbers,
  onNavigate,
  onOpenTestAssistant,
  onSimulateCall,
}) => {
  // Aggregate KPIs
  const totalCallsCount = calls.length + 384;
  const callsToday = 28;
  const totalLeads = leads.length + 94;
  const qualifiedLeads = leads.filter((l) => ['qualified', 'demo', 'negotiation', 'converted'].includes(l.stage)).length + 42;
  const conversionRate = Math.round((qualifiedLeads / Math.max(1, totalLeads)) * 100);
  const appointmentsBooked = 19;
  const avgCallDuration = '3m 42s';
  const aiResolutionRate = '94.6%';

  const minutesRemaining = Math.max(0, organization.minutesLimit - organization.minutesUsed);
  const minutesPct = Math.min(100, Math.round((organization.minutesUsed / Math.max(1, organization.minutesLimit)) * 100));

  // Weekly Call Activity Data points
  const weeklyData = [
    { day: 'Mon', answered: 54, qualified: 22 },
    { day: 'Tue', answered: 68, qualified: 31 },
    { day: 'Wed', answered: 72, qualified: 35 },
    { day: 'Thu', answered: 81, qualified: 40 },
    { day: 'Fri', answered: 64, qualified: 28 },
    { day: 'Sat', answered: 24, qualified: 8 },
    { day: 'Sun', answered: 21, qualified: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {organization.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {organization.plan} Plan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise AI Voice Telephony Platform &bull; {phoneNumbers.filter(p => p.status === 'active').length} Active Numbers &bull; {assistants.filter(a => a.isActive).length} Voice Agents Live
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenTestAssistant()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Assistant</span>
          </button>

          <button
            onClick={onSimulateCall}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Simulate Inbound Call</span>
          </button>

          <button
            onClick={() => onNavigate('assistants')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assistant</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Calls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalCallsCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{callsToday} today</span>
          </div>
        </div>

        {/* Leads Generated */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Leads Generated</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalLeads}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14 this week</span>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Qualified Leads</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{qualifiedLeads}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            High intent pipeline
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{conversionRate}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +4.2% vs human SDRs
          </div>
        </div>

        {/* Appointments Booked */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Demos Booked</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{appointmentsBooked}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Direct to rep calendars
          </div>
        </div>

        {/* Voice Minutes Remaining */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Minutes Balance</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{minutesRemaining}</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${minutesPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analytics & Pipeline Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call Activity Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Call Ingress &amp; Qualification</h3>
              <p className="text-xs text-slate-500">Autonomous voice resolution rate across 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span className="text-slate-600">Answered Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-slate-600">Qualified Leads</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-5 bg-indigo-600 rounded-t transition-all duration-500 hover:bg-indigo-500"
                    style={{ height: `${(d.answered / 90) * 100}%` }}
                    title={`${d.answered} answered`}
                  />
                  <div
                    className="w-5 bg-emerald-500 rounded-t transition-all duration-500 hover:bg-emerald-400"
                    style={{ height: `${(d.qualified / 90) * 100}%` }}
                    title={`${d.qualified} qualified`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Duration: <b>{avgCallDuration}</b></span>
            <span>AI Resolution Rate: <b className="text-emerald-600">{aiResolutionRate}</b></span>
            <span>Human Transfers: <b>5.4%</b></span>
          </div>
        </div>

        {/* Active AI Assistants Fleet */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">AI Assistant Fleet</h3>
              <button
                onClick={() => onNavigate('assistants')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Manage &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {assistants.slice(0, 3).map((asst) => (
                <div
                  key={asst.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {asst.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{asst.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {asst.role} &bull; {asst.callsHandled} calls
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <button
                      onClick={() => onOpenTestAssistant(asst.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-white cursor-pointer"
                      title="Test Assistant"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('assistants')}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Configure Voices &amp; Personas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Calls & Leads Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Inbound Calls */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Inbound Calls</h3>
              <p className="text-xs text-slate-500">Turn-by-turn transcripts and AI sentiment scoring</p>
            </div>
            <button
              onClick={() => onNavigate('calls')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View All Calls &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {calls.slice(0, 4).map((call) => (
              <div
                key={call.id}
                onClick={() => onNavigate('calls')}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    <PhoneCall className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{call.callerName}</span>
                      <span className="text-slate-400 font-normal">({call.callerCompany})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {call.summary}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {call.aiAnalysis.buyingInterestScore}/100 Intent
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{call.audioDuration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Intent Recent Leads */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">High-Intent Leads</h3>
              <p className="text-xs text-slate-500">Autonomous CRM capture &amp; pipeline stage</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Open CRM &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onNavigate('leads')}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{lead.name}</span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      &bull; {lead.company}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lead.interestedProduct} &bull; {lead.budget}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {lead.stage}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">Score: {lead.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
