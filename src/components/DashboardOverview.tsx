import React, { useState } from 'react';
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
  Pause,
  Plus,
  FileText,
  Package,
  Phone,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Activity,
  Globe2,
  ShieldCheck,
  Radio,
  Headphones,
  Sliders,
  ChevronRight
} from 'lucide-react';
import type { Organization, Assistant, CallRecord, Lead, PhoneNumber } from '../types';
import { TiltCard3D } from './3d/TiltCard3D';
import { SoundwaveVisualizer3D } from './3d/SoundwaveVisualizer3D';
import { playVoiceText, cancelVoice } from '../lib/audioVoice';

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

  // Time range toggle for weekly chart
  const [chartRange, setChartRange] = useState<'7d' | '14d' | '30d'>('7d');

  // Live voice audition state
  const [auditioningAssistantId, setAuditioningAssistantId] = useState<string>(assistants[0]?.id || 'asst_1');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const selectedAuditionAssistant = assistants.find((a) => a.id === auditioningAssistantId) || assistants[0];

  const handleAuditionVoice = (assistant: Assistant) => {
    if (isPlayingAudio && auditioningAssistantId === assistant.id) {
      cancelVoice();
      setIsPlayingAudio(false);
      return;
    }

    cancelVoice();
    setAuditioningAssistantId(assistant.id);
    setIsPlayingAudio(true);

    const greeting = assistant.greeting || `Hello! Thank you for calling ${organization.name}. I am ${assistant.name}, an autonomous voice intelligence assistant. How may I assist your business today?`;

    playVoiceText(greeting, {
      lang: assistant.language || 'en-US',
      voiceGender: (assistant.voiceGender as 'female' | 'male' | 'neutral') || 'female',
      rate: assistant.speakingSpeed || 1.0,
      pitch: assistant.pitch || 1.0,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

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
      {/* Top Banner / Modern Executive HUD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 p-6 sm:p-7 border border-slate-800/90 backdrop-blur-xl shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <span>{organization.name}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-xs">
                {organization.plan} Plan
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SIP Edge Gateway Online</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Enterprise Autonomous Telephony Engine</span>
              <span>&bull;</span>
              <span className="text-slate-300 font-medium">{phoneNumbers.filter((p) => p.status === 'active').length} Active DID Numbers</span>
              <span>&bull;</span>
              <span className="text-slate-300 font-medium">{assistants.filter((a) => a.isActive).length} Voice Agents Deployed</span>
              <span>&bull;</span>
              <span className="text-indigo-400 font-mono">Sub-400ms SIP Turnaround</span>
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenTestAssistant()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 transition-all cursor-pointer shadow-xs hover:shadow-indigo-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
              <span>Voice Studio</span>
            </button>

            <button
              onClick={onSimulateCall}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 transition-all cursor-pointer shadow-xs shadow-emerald-500/10 hover:border-emerald-400"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Inbound Call</span>
            </button>

            <button
              onClick={() => onNavigate('assistants')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer shadow-md shadow-indigo-600/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Agent</span>
            </button>
          </div>
        </div>

        {/* Embedded Interactive 3D Audio Visualizer & Voice Audition Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Interactive Voice Audition</div>
              <div className="text-[11px] text-slate-400">Preview neural TTS speech synthesis live</div>
            </div>
          </div>

          {/* Assistant selector & play button */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-2">
            {assistants.slice(0, 3).map((asst) => {
              const isSelected = auditioningAssistantId === asst.id;
              const isCurrentlyPlaying = isPlayingAudio && isSelected;

              return (
                <button
                  key={asst.id}
                  onClick={() => handleAuditionVoice(asst)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/25 text-white border border-indigo-500/50 shadow-xs'
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-700/40 hover:bg-slate-800/70'
                  }`}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-3 h-3 text-emerald-400 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 text-indigo-400 fill-current" />
                  )}
                  <span>{asst.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({asst.role.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>

          {/* Mini 3D Soundwave canvas */}
          <div className="md:col-span-3 flex items-center justify-end gap-3">
            <div className="h-10 w-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950/60 relative">
              <SoundwaveVisualizer3D isPlaying={isPlayingAudio} barCount={20} />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-emerald-400 border border-emerald-500/30">
              {isPlayingAudio ? '48kHz Active' : 'Idle 380ms'}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Grid with 3D Tilt Perspective */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Calls */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Calls</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{totalCallsCount}</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{callsToday} today</span>
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* Leads Generated */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">CRM Leads</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{totalLeads}</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+14 this week</span>
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* Qualified Leads */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-emerald-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">BANT Qualified</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{qualifiedLeads}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                High intent pipeline
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* Conversion Rate */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-violet-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Conversion Rate</span>
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{conversionRate}%</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                +4.2% vs human SDR
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* Appointments Booked */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Demos Booked</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{appointmentsBooked}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                Direct to rep calendar
              </div>
            </div>
          </div>
        </TiltCard3D>

        {/* Voice Minutes Remaining */}
        <TiltCard3D maxTilt={6} className="h-full">
          <div className="bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/40 backdrop-blur-xl p-4 rounded-2xl transition-all h-full flex flex-col justify-between group">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Minutes Balance</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">{minutesRemaining}m</div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${minutesPct}%` }}
                />
              </div>
            </div>
          </div>
        </TiltCard3D>
      </div>

      {/* Analytics & Pipeline Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call Activity Chart */}
        <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Inbound Call Telemetry &amp; AI Qualification</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Real-time
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Autonomous speech-to-resolution efficiency across rolling cycles</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-xs shadow-indigo-500/50" />
                <span className="text-slate-300">Answered Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-xs shadow-emerald-500/50" />
                <span className="text-slate-300">Qualified Leads</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation with glowing bars */}
          <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-slate-800">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div
                    className="w-5 sm:w-6 bg-indigo-500 rounded-t-sm transition-all duration-300 group-hover:bg-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/30"
                    style={{ height: `${(d.answered / 90) * 100}%` }}
                    title={`${d.answered} answered`}
                  />
                  <div
                    className="w-5 sm:w-6 bg-emerald-400 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-300 group-hover:shadow-lg group-hover:shadow-emerald-400/30"
                    style={{ height: `${(d.qualified / 90) * 100}%` }}
                    title={`${d.qualified} qualified`}
                  />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <span className="text-slate-400 text-[11px] block">Avg Duration</span>
              <span className="font-bold text-white font-mono text-sm">{avgCallDuration}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <span className="text-slate-400 text-[11px] block">AI Resolution Rate</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{aiResolutionRate}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
              <span className="text-slate-400 text-[11px] block">Human Transfers</span>
              <span className="font-bold text-indigo-300 font-mono text-sm">5.4%</span>
            </div>
          </div>
        </div>

        {/* Active AI Assistants Fleet */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Voice Fleet</span>
              </h3>
              <button
                onClick={() => onNavigate('assistants')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {assistants.slice(0, 3).map((asst) => (
                <div
                  key={asst.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all bg-slate-800/30 hover:bg-slate-800/50 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {asst.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                        <span>{asst.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {asst.role} &bull; <span className="text-slate-300 font-mono">{asst.callsHandled}</span> calls
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAuditionVoice(asst)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
                      title="Audition Voice"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenTestAssistant(asst.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer"
                      title="Test in Studio"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('assistants')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Configure Voices &amp; Personas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Calls & Leads Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Inbound Calls */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Recent Inbound Turn-by-Turn Calls</span>
              </h3>
              <p className="text-xs text-slate-400">Audio transcripts, sentiment detection &amp; BANT scores</p>
            </div>
            <button
              onClick={() => onNavigate('calls')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {calls.slice(0, 4).map((call) => (
              <div
                key={call.id}
                onClick={() => onNavigate('calls')}
                className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-2.5 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{call.callerName}</span>
                      <span className="text-slate-400 font-normal">({call.callerCompany})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 max-w-md">
                      {call.summary}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    {call.aiAnalysis.buyingInterestScore}/100 Intent
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{call.audioDuration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Intent Recent Leads */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>High-Intent Captured Leads</span>
              </h3>
              <p className="text-xs text-slate-400">Autonomous CRM capture &amp; pipeline stage</p>
            </div>
            <button
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Open CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {leads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onNavigate('leads')}
                className="p-3 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                    <span>{lead.name}</span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      &bull; {lead.company}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {lead.interestedProduct} &bull; <span className="text-slate-300 font-mono">{lead.budget}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {lead.stage}
                  </span>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Score: {lead.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
