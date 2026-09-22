import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  Play,
  Pause,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Download,
  Calendar,
  User,
  Bot,
  Volume2,
  Users,
  Share2,
  Check,
  ShieldCheck,
  Zap,
  PhoneForwarded,
  Clock3,
  Building2,
  AlertTriangle,
  BadgeAlert,
  FileCheck,
  MessageSquare,
  Flame,
  Award,
  ChevronRight,
  Send,
  X,
  Phone,
  Palette
} from 'lucide-react';
import type { CallRecord, Assistant, HandoffBrief, HandoffTriggerReason, FollowUpTask } from '../types';
import { api } from '../lib/api';

type SearchScope = 'all' | 'phone' | 'transcript' | 'assistant';

export type TranscriptFontColor = 'indigo' | 'emerald' | 'navy' | 'violet' | 'slate';

interface TranscriptThemeConfig {
  id: TranscriptFontColor;
  name: string;
  dotClass: string;
  headingColor: string;
  agentText: string;
  agentBubble: string;
  agentBorder: string;
  agentSpeaker: string;
  agentTimestamp: string;
  callerText: string;
  callerBubble: string;
  callerBorder: string;
  callerSpeaker: string;
  callerTimestamp: string;
}

const TRANSCRIPT_COLOR_THEMES: Record<TranscriptFontColor, TranscriptThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    dotClass: 'bg-indigo-600 ring-indigo-400',
    headingColor: 'text-indigo-950',
    agentText: 'text-indigo-950 font-medium',
    agentBubble: 'bg-indigo-50/90',
    agentBorder: 'border-indigo-200/80',
    agentSpeaker: 'text-indigo-700 font-semibold',
    agentTimestamp: 'text-indigo-400 font-mono',
    callerText: 'text-slate-800',
    callerBubble: 'bg-slate-100/90',
    callerBorder: 'border-slate-200/90',
    callerSpeaker: 'text-slate-700 font-semibold',
    callerTimestamp: 'text-slate-400 font-mono',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Teal',
    dotClass: 'bg-emerald-600 ring-emerald-400',
    headingColor: 'text-emerald-950',
    agentText: 'text-emerald-950 font-medium',
    agentBubble: 'bg-emerald-50/90',
    agentBorder: 'border-emerald-200/80',
    agentSpeaker: 'text-emerald-700 font-semibold',
    agentTimestamp: 'text-emerald-500 font-mono',
    callerText: 'text-stone-800',
    callerBubble: 'bg-stone-100/90',
    callerBorder: 'border-stone-200/90',
    callerSpeaker: 'text-stone-700 font-semibold',
    callerTimestamp: 'text-stone-400 font-mono',
  },
  navy: {
    id: 'navy',
    name: 'Deep Navy',
    dotClass: 'bg-sky-700 ring-sky-400',
    headingColor: 'text-sky-950',
    agentText: 'text-sky-950 font-medium',
    agentBubble: 'bg-sky-50/90',
    agentBorder: 'border-sky-200/80',
    agentSpeaker: 'text-sky-800 font-semibold',
    agentTimestamp: 'text-sky-500 font-mono',
    callerText: 'text-zinc-800',
    callerBubble: 'bg-zinc-100/90',
    callerBorder: 'border-zinc-200/90',
    callerSpeaker: 'text-zinc-700 font-semibold',
    callerTimestamp: 'text-zinc-400 font-mono',
  },
  violet: {
    id: 'violet',
    name: 'Vibrant Violet',
    dotClass: 'bg-purple-600 ring-purple-400',
    headingColor: 'text-purple-950',
    agentText: 'text-purple-950 font-medium',
    agentBubble: 'bg-purple-50/90',
    agentBorder: 'border-purple-200/80',
    agentSpeaker: 'text-purple-700 font-semibold',
    agentTimestamp: 'text-purple-400 font-mono',
    callerText: 'text-slate-800',
    callerBubble: 'bg-slate-100/90',
    callerBorder: 'border-slate-200/90',
    callerSpeaker: 'text-slate-700 font-semibold',
    callerTimestamp: 'text-slate-400 font-mono',
  },
  slate: {
    id: 'slate',
    name: 'Charcoal Contrast',
    dotClass: 'bg-slate-900 ring-slate-500',
    headingColor: 'text-slate-950',
    agentText: 'text-slate-950 font-semibold',
    agentBubble: 'bg-slate-150 border-slate-300',
    agentBorder: 'border-slate-300',
    agentSpeaker: 'text-slate-900 font-bold',
    agentTimestamp: 'text-slate-500 font-mono',
    callerText: 'text-slate-900',
    callerBubble: 'bg-slate-50 border-slate-200',
    callerBorder: 'border-slate-200',
    callerSpeaker: 'text-slate-700 font-semibold',
    callerTimestamp: 'text-slate-500 font-mono',
  },
};

const highlightMatch = (text: string, query: string) => {
  if (!query || !query.trim()) return text;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={i} className="bg-amber-200 text-amber-950 rounded-xs px-0.5 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

interface CallsViewProps {
  calls: CallRecord[];
  assistants: Assistant[];
  onOpenSimulateModal: () => void;
  onRefresh?: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  calls,
  assistants,
  onOpenSimulateModal,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id || '');
  const [transcriptFontColor, setTranscriptFontColor] = useState<TranscriptFontColor>('indigo');
  const currentTranscriptTheme = TRANSCRIPT_COLOR_THEMES[transcriptFontColor] || TRANSCRIPT_COLOR_THEMES.indigo;

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioProgress, setAudioProgress] = useState(35); // percent
  const [activeMomentIndex, setActiveMomentIndex] = useState<number | null>(null);

  // Handoff & Transfer modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [availableReps, setAvailableReps] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'available' | 'in_call' | 'offline';
    activeCallsToday: number;
    avatarColor: string;
  }>>([]);
  const [selectedRepId, setSelectedRepId] = useState<string>('');
  const [transferring, setTransferring] = useState(false);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // Callback form state
  const [callbackTime, setCallbackTime] = useState('Tomorrow 10:00 AM');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNotes, setCallbackNotes] = useState('');
  const [submittingCallback, setSubmittingCallback] = useState(false);
  const [callbackSuccessMsg, setCallbackSuccessMsg] = useState<string | null>(null);

  const filteredCalls = calls.filter((c) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const queryDigits = searchQuery.replace(/\D/g, '');

    const asst = assistants.find((a) => a.id === c.assistantId);
    const assistantName = (c.assistantName || asst?.name || '').toLowerCase();
    const callerPhone = (c.callerPhone || '').toLowerCase();
    const callerNumber = (c.callerNumber || '').toLowerCase();
    const callerDigits = (c.callerNumber || c.callerPhone || '').replace(/\D/g, '');

    // 1. Caller number match (formatted string or normalized phone digits)
    const matchesPhone = Boolean(
      normalizedQuery && (
        callerPhone.includes(normalizedQuery) ||
        callerNumber.includes(normalizedQuery) ||
        (queryDigits.length >= 3 && callerDigits.includes(queryDigits))
      )
    );

    // 2. Transcript keywords match across all dialogue turns
    const matchesTranscript = Boolean(
      normalizedQuery &&
      c.transcript &&
      c.transcript.some((turn) => turn.text.toLowerCase().includes(normalizedQuery))
    );

    // 3. Assistant name match
    const matchesAssistant = Boolean(
      normalizedQuery && assistantName.includes(normalizedQuery)
    );

    // 4. General match (caller name, company, summary)
    const matchesGeneral = Boolean(
      normalizedQuery && (
        c.callerName.toLowerCase().includes(normalizedQuery) ||
        c.callerCompany.toLowerCase().includes(normalizedQuery) ||
        c.summary.toLowerCase().includes(normalizedQuery)
      )
    );

    let matchesSearch = true;
    if (normalizedQuery) {
      if (searchScope === 'phone') {
        matchesSearch = matchesPhone;
      } else if (searchScope === 'transcript') {
        matchesSearch = matchesTranscript;
      } else if (searchScope === 'assistant') {
        matchesSearch = matchesAssistant;
      } else {
        // 'all' scope: matches any of caller number, transcript keywords, assistant name, or caller/company/summary
        matchesSearch = matchesPhone || matchesTranscript || matchesAssistant || matchesGeneral;
      }
    }

    const matchesSentiment =
      selectedSentiment === 'all' || c.sentiment === selectedSentiment || c.aiAnalysis?.sentiment === selectedSentiment;

    const matchesOutcome =
      selectedOutcome === 'all' ||
      c.outcome === selectedOutcome ||
      (selectedOutcome === 'handoff' && (c.outcome === 'transferred' || c.outcome === 'callback_requested' || c.handoffBrief));

    return matchesSearch && matchesSentiment && matchesOutcome;
  });

  const selectedCall =
    filteredCalls.find((c) => c.id === selectedCallId) ||
    (filteredCalls.length > 0 ? filteredCalls[0] : null);

  useEffect(() => {
    // Load available reps for live transfer
    api.getAvailableReps()
      .then((reps) => {
        setAvailableReps(reps);
        if (reps.length > 0) {
          setSelectedRepId(reps[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedCall) {
      setCallbackPhone(selectedCall.callerPhone || selectedCall.callerNumber || '');
    }
  }, [selectedCall]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMomentClick = (momentIndex: number, timestamp: string) => {
    setActiveMomentIndex(momentIndex);
    // Parse timestamp (e.g. "00:45" or "01:10") into percentage of audio
    const parts = timestamp.split(':');
    if (parts.length === 2) {
      const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const approxTotalSecs = selectedCall?.durationSeconds || 180;
      const pct = Math.min(100, Math.max(5, (secs / approxTotalSecs) * 100));
      setAudioProgress(pct);
    }
  };

  const handleExecuteTransfer = async () => {
    if (!selectedCall) return;
    setTransferring(true);
    try {
      const rep = availableReps.find((r) => r.id === selectedRepId) || availableReps[0];
      const brief = selectedCall.handoffBrief || selectedCall.aiAnalysis?.handoffBrief || {
        customerName: selectedCall.callerName,
        customerRequirement: selectedCall.summary,
        productDiscussed: selectedCall.aiAnalysis?.productsDiscussed?.[0] || 'Enterprise Suite',
        keyQuestions: selectedCall.aiAnalysis?.questionsAsked || [],
        objections: selectedCall.aiAnalysis?.objections || [],
        buyingIntent: 'High' as const,
        conversationSummary: selectedCall.summary,
        recommendedNextAction: selectedCall.aiAnalysis?.recommendedAction || 'Execute agreement',
        triggerReason: 'human_requested' as const,
        status: 'transferred' as const,
      };

      await api.transferCallToHuman({
        callId: selectedCall.id,
        repId: rep?.id,
        repName: rep?.name,
        handoffBrief: brief,
      });

      setTransferSuccessMsg(`Live call successfully transferred to ${rep?.name || 'team member'}!`);
      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferSuccessMsg(null);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  };

  const handleScheduleCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCall) return;
    setSubmittingCallback(true);
    try {
      const brief = selectedCall.handoffBrief || selectedCall.aiAnalysis?.handoffBrief;
      await api.requestHandoffCallback({
        callId: selectedCall.id,
        customerName: selectedCall.callerName,
        phone: callbackPhone,
        company: selectedCall.callerCompany,
        preferredTime: callbackTime,
        notes: callbackNotes || selectedCall.summary,
        handoffBrief: brief,
      });

      setCallbackSuccessMsg('Callback scheduled and follow-up task created in CRM!');
      setTimeout(() => {
        setIsCallbackModalOpen(false);
        setCallbackSuccessMsg(null);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule callback');
    } finally {
      setSubmittingCallback(false);
    }
  };

  const handoffBrief: HandoffBrief | undefined = selectedCall?.handoffBrief || selectedCall?.aiAnalysis?.handoffBrief;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Call Records &amp; Conversation Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Smart Handoff Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Turn-by-turn transcripts, real-time handoff briefs, competitor mentions, BANT qualification, and key moments.
          </p>
        </div>

        <button
          onClick={onOpenSimulateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Simulate Test Call</span>
        </button>
      </div>

      {/* Main Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Call List & Search/Filters */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search caller number, transcript keywords, or assistant name..."
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scope Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Search in:</span>
              <button
                type="button"
                onClick={() => setSearchScope('all')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                  searchScope === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Fields
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('phone')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  searchScope === 'phone'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Phone className="w-3 h-3" />
                <span>Caller #</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('transcript')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  searchScope === 'transcript'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Transcript</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchScope('assistant')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors flex items-center gap-1 ${
                  searchScope === 'assistant'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>Assistant</span>
              </button>
            </div>

            {/* Results count & status when searching */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>
                  Found <strong className="text-slate-900 font-semibold">{filteredCalls.length}</strong> {filteredCalls.length === 1 ? 'call' : 'calls'}
                  {searchScope !== 'all' ? ` in ${searchScope}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchScope('all');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">Filter:</span>
              <button
                onClick={() => setSelectedOutcome('all')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                  selectedOutcome === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Calls
              </button>
              <button
                onClick={() => setSelectedOutcome('handoff')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center gap-1 ${
                  selectedOutcome === 'handoff'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <PhoneForwarded className="w-3 h-3" />
                <span>Handoffs &amp; Callbacks</span>
              </button>
              <button
                onClick={() => setSelectedSentiment(selectedSentiment === 'positive' ? 'all' : 'positive')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                  selectedSentiment === 'positive'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                High Intent
              </button>
            </div>
          </div>

          {/* Calls List Scrollable */}
          <div className="space-y-3">
            {filteredCalls.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">No Call Records Found</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {searchQuery.trim()
                    ? `No calls match "${searchQuery}". Try searching by caller number (e.g. +1 415), transcript keywords (e.g. pricing, volume discount, demo), or assistant name.`
                    : 'No calls match the selected filters.'}
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchScope('all');
                      setSelectedOutcome('all');
                      setSelectedSentiment('all');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const isSelected = call.id === selectedCall?.id;
                const asst = assistants.find((a) => a.id === call.assistantId);
                const assistantDisplayName = call.assistantName || asst?.name || 'Sales Agent';
                const hasHandoff = Boolean(call.handoffBrief || call.outcome === 'transferred' || call.outcome === 'callback_requested');
                const normalizedQuery = searchQuery.trim().toLowerCase();

                // Specific match checks for feedback tags
                const matchedTurn = normalizedQuery && call.transcript
                  ? call.transcript.find((t) => t.text.toLowerCase().includes(normalizedQuery))
                  : null;
                const matchedPhone = normalizedQuery && (
                  (call.callerPhone && call.callerPhone.toLowerCase().includes(normalizedQuery)) ||
                  (call.callerNumber && call.callerNumber.toLowerCase().includes(normalizedQuery)) ||
                  (searchQuery.replace(/\D/g, '').length >= 3 && (call.callerNumber || call.callerPhone || '').replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')))
                );
                const matchedAssistant = normalizedQuery && assistantDisplayName.toLowerCase().includes(normalizedQuery);

                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{call.callerName}</span>
                          <span className="text-slate-400 font-normal">({call.callerCompany})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          <span className={matchedPhone ? 'text-indigo-700 font-bold bg-indigo-50 px-1 rounded' : ''}>
                            {call.callerPhone || call.callerNumber}
                          </span>
                          {' '}&bull; Agent:{' '}
                          <span className={matchedAssistant ? 'text-indigo-700 font-bold bg-indigo-50 px-1 rounded' : ''}>
                            {assistantDisplayName}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            (call.aiAnalysis?.buyingInterestScore || 0) >= 85
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : (call.aiAnalysis?.buyingInterestScore || 0) >= 50
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {call.aiAnalysis?.buyingInterestScore || 80}/100 Intent
                        </span>

                        {hasHandoff && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-0.5">
                            <PhoneForwarded className="w-2.5 h-2.5" />
                            <span>Handoff</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Matched in Transcript snippet callout */}
                    {matchedTurn && (
                      <div className="mt-2 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-950 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                        <div className="line-clamp-2">
                          <span className="font-semibold text-amber-800">Transcript keyword match: </span>
                          <span className="italic">"{highlightMatch(matchedTurn.text, searchQuery)}"</span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {call.summary}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{call.audioDuration}</span>
                      </span>
                      <span className="capitalize font-semibold text-slate-600">
                        {String(call.outcome || call.status || 'completed').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Call Detail View */}
        {selectedCall ? (
          <div className="lg:col-span-7 space-y-6">
            {/* Audio Waveform Player with Important Moments */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Call Recording &bull; {selectedCall.audioDuration}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {selectedCall.callerName} &bull; {selectedCall.callerPhone} &bull; {selectedCall.callerCompany}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Controls & Waveform Simulation */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* Simulated Audio Waveform Bars */}
                <div className="flex-1 flex items-center gap-1 h-8">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const heightPercent = Math.sin(i * 0.4) * 40 + 50;
                    const isPassed = (i / 48) * 100 <= audioProgress;
                    return (
                      <div
                        key={i}
                        onClick={() => setAudioProgress((i / 48) * 100)}
                        className={`flex-1 rounded-full cursor-pointer transition-all ${
                          isPassed ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>

                <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                  {selectedCall.audioDuration}
                </span>
              </div>

              {/* Important Moments Scrubbing Bar */}
              {selectedCall.aiAnalysis?.importantMoments && selectedCall.aiAnalysis.importantMoments.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Key Conversation Moments (Click to jump):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCall.aiAnalysis.importantMoments.map((m, idx) => {
                      const isSelected = activeMomentIndex === idx;
                      let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (m.type === 'signal') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      if (m.type === 'objection') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      if (m.type === 'handoff') badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';

                      return (
                        <button
                          key={idx}
                          onClick={() => handleMomentClick(idx, m.timestamp)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-indigo-500 font-bold bg-white'
                              : `${badgeColor} hover:opacity-90`
                          }`}
                        >
                          <span className="font-mono font-semibold">{m.timestamp}</span>
                          <span>&bull;</span>
                          <span>{m.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 27. SMART HUMAN HANDOFF BRIEF & ACTIONS CARD */}
            {handoffBrief && (
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50 rounded-2xl p-6 border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <PhoneForwarded className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Smart Human Handoff Brief
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                          Trigger: {handoffBrief.triggerReason?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Generated in real-time before transferring call to human rep
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        handoffBrief.buyingIntent === 'Urgent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : handoffBrief.buyingIntent === 'High'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Intent: {handoffBrief.buyingIntent}
                    </span>
                  </div>
                </div>

                {/* Structured Brief Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Name &amp; Role</span>
                    <div className="font-semibold text-slate-900">{handoffBrief.customerName} ({selectedCall.callerCompany})</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Discussed</span>
                    <div className="font-semibold text-indigo-700">{handoffBrief.productDiscussed}</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Requirement</span>
                    <div className="font-medium text-slate-800">{handoffBrief.customerRequirement}</div>
                  </div>

                  {handoffBrief.keyQuestions && handoffBrief.keyQuestions.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1.5 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Questions Asked</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {handoffBrief.keyQuestions.map((q, i) => (
                          <li key={i} className="font-medium">{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {handoffBrief.objections && handoffBrief.objections.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-1.5 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Objections to Address</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-rose-900">
                        {handoffBrief.objections.map((obj, i) => (
                          <li key={i} className="font-medium">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      <span>Recommended Next Action for Rep</span>
                    </span>
                    <div className="font-semibold text-indigo-950">{handoffBrief.recommendedNextAction}</div>
                  </div>
                </div>

                {/* Transfer & Callback Execution Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    {handoffBrief.status === 'transferred' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Transferred to {handoffBrief.assignedRepName || 'Sales Representative'}
                      </span>
                    ) : handoffBrief.status === 'callback_requested' ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                        <Clock3 className="w-4 h-4" />
                        Callback Requested ({handoffBrief.callbackDetails?.preferredTime || 'Pending'})
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium">
                        Handoff brief ready for rep assignment
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCallbackModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Offer Callback</span>
                    </button>

                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <PhoneForwarded className="w-3.5 h-3.5" />
                      <span>Transfer to Available Rep</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Turn-by-Turn Dialogue Transcript */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${currentTranscriptTheme.headingColor} transition-colors tracking-tight`}>
                        Turn-by-Turn Transcript
                      </h3>
                      {searchQuery.trim() && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Keyword: "{searchQuery.trim()}"
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedCall.transcript.length} turns recorded
                    </span>
                  </div>
                </div>

                {/* Font Color Theme Selector */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>Font Color:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(Object.keys(TRANSCRIPT_COLOR_THEMES) as TranscriptFontColor[]).map((themeKey) => {
                      const theme = TRANSCRIPT_COLOR_THEMES[themeKey];
                      const isSelected = transcriptFontColor === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => setTranscriptFontColor(themeKey)}
                          title={`Switch font color to ${theme.name}`}
                          className={`w-4 h-4 rounded-full transition-all cursor-pointer flex items-center justify-center ${theme.dotClass} ${
                            isSelected
                              ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 shadow-xs'
                              : 'opacity-65 hover:opacity-100 hover:scale-110'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 ml-1 pl-1.5 border-l border-slate-200">
                    {currentTranscriptTheme.name}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2">
                {selectedCall.transcript.map((t, idx) => {
                  const isCaller = t.speaker === 'customer' || t.speaker === 'caller';
                  const hasKeywordMatch = searchQuery.trim() && t.text.toLowerCase().includes(searchQuery.trim().toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`flex ${isCaller ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all border shadow-2xs ${
                          hasKeywordMatch ? 'ring-2 ring-amber-400 shadow-xs ' : ''
                        }${
                          isCaller
                            ? `${currentTranscriptTheme.callerBubble} ${currentTranscriptTheme.callerBorder} ${currentTranscriptTheme.callerText} rounded-bl-none`
                            : `${currentTranscriptTheme.agentBubble} ${currentTranscriptTheme.agentBorder} ${currentTranscriptTheme.agentText} rounded-br-none`
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 gap-2">
                          <span className="flex items-center gap-1.5">
                            <span className={isCaller ? currentTranscriptTheme.callerSpeaker : currentTranscriptTheme.agentSpeaker}>
                              {isCaller ? selectedCall.callerName : 'AI Voice Agent'}
                            </span>
                            {hasKeywordMatch && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-200 text-amber-900">
                                Match
                              </span>
                            )}
                          </span>
                          <span className={isCaller ? currentTranscriptTheme.callerTimestamp : currentTranscriptTheme.agentTimestamp}>
                            {t.timestamp}
                          </span>
                        </div>
                        <div className={`font-normal ${isCaller ? currentTranscriptTheme.callerText : currentTranscriptTheme.agentText}`}>
                          {highlightMatch(t.text, searchQuery)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 28. POST-CONVERSATION INTELLIGENCE SCORECARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Post-Call Sales Intelligence</h3>
                    <p className="text-[11px] text-slate-500">Autonomous customer intent, objections, &amp; BANT qualification</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-indigo-600">
                    {selectedCall.aiAnalysis?.buyingInterestScore || 85}/100
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Buying Propensity
                  </div>
                </div>
              </div>

              {/* Core Heuristics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Customer Intent
                  </div>
                  <div className="font-semibold text-slate-800">
                    {selectedCall.aiAnalysis?.callerIntent || selectedCall.aiAnalysis?.intent || 'Enterprise evaluation'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Main Requirement
                  </div>
                  <div className="font-semibold text-slate-800">
                    {selectedCall.aiAnalysis?.mainRequirement || 'High volume sales qualification and CRM automation'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Products Discussed
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedCall.aiAnalysis?.productsDiscussed?.map((p, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                        {p}
                      </span>
                    )) || <span className="text-slate-400">Standard Suite</span>}
                  </div>
                </div>
              </div>

              {/* Questions Asked & Objections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Questions Asked */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Questions Asked by Caller</span>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedCall.aiAnalysis?.questionsAsked && selectedCall.aiAnalysis.questionsAsked.length > 0 ? (
                      selectedCall.aiAnalysis.questionsAsked.map((q, i) => (
                        <li key={i} className="text-slate-700 flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">&bull;</span>
                          <span className="font-medium">{q}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No complex questions raised</li>
                    )}
                  </ul>
                </div>

                {/* Objections Raised */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Customer Objections</span>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedCall.aiAnalysis?.objections && selectedCall.aiAnalysis.objections.length > 0 ? (
                      selectedCall.aiAnalysis.objections.map((obj, i) => (
                        <li key={i} className="text-rose-900 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">&bull;</span>
                          <span className="font-medium">{obj}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">None observed &bull; Frictionless qualification</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Lead Qualification (BANT Breakdown) */}
              {selectedCall.aiAnalysis?.leadQualification && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>BANT Qualification Framework</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      BANT Score: {selectedCall.aiAnalysis.leadQualification.bantScore}/100 ({selectedCall.aiAnalysis.leadQualification.status})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase text-[9px]">Budget</div>
                      <div className="font-semibold text-slate-800 truncate">{selectedCall.aiAnalysis.leadQualification.budget}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase text-[9px]">Authority</div>
                      <div className="font-semibold text-slate-800 truncate">{selectedCall.aiAnalysis.leadQualification.authority}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase text-[9px]">Need</div>
                      <div className="font-semibold text-slate-800 truncate">{selectedCall.aiAnalysis.leadQualification.need}</div>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-400 uppercase text-[9px]">Timeline</div>
                      <div className="font-semibold text-slate-800 truncate">{selectedCall.aiAnalysis.leadQualification.timeline}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Competitor Mentions */}
              {selectedCall.aiAnalysis?.competitorMentions && selectedCall.aiAnalysis.competitorMentions.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <BadgeAlert className="w-4 h-4 text-amber-600" />
                    <span>Competitor Mention Detected</span>
                  </div>
                  {selectedCall.aiAnalysis.competitorMentions.map((c, i) => (
                    <div key={i} className="text-xs text-amber-950 font-medium">
                      <span className="font-bold text-amber-800">{c.competitor}:</span> {c.context}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Next Steps */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span>AI Recommended Follow-up Action</span>
                </div>
                <div className="text-xs text-indigo-950 font-medium leading-relaxed">
                  {selectedCall.aiAnalysis?.recommendedAction || selectedCall.aiAnalysis?.recommendedNextSteps || 'Follow up with attendee to confirm executive demo.'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <PhoneCall className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Call Selected</h4>
            <p className="text-xs text-slate-500">
              Select a call record on the left or simulate an inbound phone call to review.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: LIVE HUMAN TRANSFER */}
      {isTransferModalOpen && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <PhoneForwarded className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Transfer Call to Rep</h3>
                  <p className="text-[11px] text-slate-500">Real-time team availability</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {transferSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div>{transferSuccessMsg}</div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Select Available Sales Rep:</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableReps.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedRepId(rep.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedRepId === rep.id
                            ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${rep.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                            {rep.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{rep.name}</div>
                            <div className="text-[10px] text-slate-500 capitalize">{rep.role.replace(/_/g, ' ')}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rep.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {rep.status === 'available' ? 'Available' : 'In Call'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Auto-Attached Handoff Brief:</div>
                  <div>Caller: {selectedCall.callerName} ({selectedCall.callerCompany})</div>
                  <div>Trigger: {handoffBrief?.triggerReason?.replace(/_/g, ' ') || 'Ready to buy'} &bull; Intent: {handoffBrief?.buyingIntent || 'High'}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteTransfer}
                    disabled={transferring}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    {transferring ? (
                      <span>Transferring...</span>
                    ) : (
                      <>
                        <PhoneForwarded className="w-3.5 h-3.5" />
                        <span>Confirm Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE CALLBACK & CREATE FOLLOW-UP TASK */}
      {isCallbackModalOpen && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Schedule Callback Task</h3>
                  <p className="text-[11px] text-slate-500">Creates priority follow-up in CRM</p>
                </div>
              </div>
              <button
                onClick={() => setIsCallbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {callbackSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div>{callbackSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleScheduleCallback} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    disabled
                    value={selectedCall.callerName}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-medium text-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Callback Phone Number</label>
                  <input
                    type="text"
                    required
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Callback Window</label>
                  <input
                    type="text"
                    required
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    placeholder="e.g. Tomorrow at 10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes for Assigned Rep</label>
                  <textarea
                    rows={2}
                    value={callbackNotes}
                    onChange={(e) => setCallbackNotes(e.target.value)}
                    placeholder="Key questions or requirements to address..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCallbackModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCallback}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    {submittingCallback ? (
                      <span>Scheduling...</span>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Create Follow-up Task</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
