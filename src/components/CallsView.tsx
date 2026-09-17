import React, { useState } from 'react';
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
  Volume2
} from 'lucide-react';
import type { CallRecord, Assistant } from '../types';

interface CallsViewProps {
  calls: CallRecord[];
  assistants: Assistant[];
  onOpenSimulateModal: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  calls,
  assistants,
  onOpenSimulateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id || '');

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioProgress, setAudioProgress] = useState(35); // simulated percent

  const selectedCall = calls.find((c) => c.id === selectedCallId) || calls[0];

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.callerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.callerPhone.includes(searchQuery) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSentiment =
      selectedSentiment === 'all' || c.sentiment === selectedSentiment;

    return matchesSearch && matchesSentiment;
  });

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Call Recordings &amp; AI Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Turn-by-turn transcripts, sentiment analysis, buyer intent scores, and automated CRM qualification.
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
                placeholder="Search caller name, company, or keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Sentiment:</span>
              <button
                onClick={() => setSelectedSentiment('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSentiment === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedSentiment('positive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSentiment === 'positive'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Positive
              </button>
              <button
                onClick={() => setSelectedSentiment('neutral')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedSentiment === 'neutral'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Neutral
              </button>
            </div>
          </div>

          {/* Calls List Scrollable */}
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const isSelected = call.id === selectedCall?.id;
              const asst = assistants.find((a) => a.id === call.assistantId);

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
                        {call.callerPhone} &bull; Agent: {asst?.name || 'Sales Agent'}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        call.aiAnalysis.buyingInterestScore >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : call.aiAnalysis.buyingInterestScore >= 50
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {call.aiAnalysis.buyingInterestScore}/100 Intent
                    </span>
                  </div>

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
            })}
          </div>
        </div>

        {/* Right Column: Selected Call Detail View */}
        {selectedCall ? (
          <div className="lg:col-span-7 space-y-6">
            {/* Audio Waveform Player */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Call Recording &bull; {selectedCall.audioDuration}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {selectedCall.callerName} &bull; {selectedCall.callerPhone}
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
            </div>

            {/* Turn-by-Turn Dialogue Transcript */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Turn-by-Turn Transcript</h3>

              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2">
                {selectedCall.transcript.map((t, idx) => (
                  <div
                    key={idx}
                    className={`flex ${t.speaker === 'caller' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        t.speaker === 'caller'
                          ? 'bg-slate-100 text-slate-900 rounded-bl-none'
                          : 'bg-indigo-50 border border-indigo-100 text-slate-900 rounded-br-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>{t.speaker === 'caller' ? selectedCall.callerName : 'AI Voice Agent'}</span>
                        <span>{t.timestamp}</span>
                      </div>
                      <div>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep AI Sales Analysis Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Sales Intelligence &amp; Scorecard</h3>
                    <p className="text-[11px] text-slate-500">Autonomous qualification heuristics</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-indigo-600">
                    {selectedCall.aiAnalysis.buyingInterestScore}/100
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Buying Propensity
                  </div>
                </div>
              </div>

              {/* Grid of Heuristics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Caller Primary Intent
                  </div>
                  <div className="font-semibold text-slate-800 capitalize">
                    {selectedCall.aiAnalysis.callerIntent}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Products Discussed
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCall.aiAnalysis.productsDiscussed.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Customer Objections Raised
                  </div>
                  <div className="font-semibold text-slate-700">
                    {selectedCall.aiAnalysis.customerObjections.length > 0
                      ? selectedCall.aiAnalysis.customerObjections.join(', ')
                      : 'None observed &bull; Frictionless qualification'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Call Outcome Status
                  </div>
                  <div className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{String(selectedCall.outcome || selectedCall.status || 'completed').replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span>AI Recommended Follow-up Actions</span>
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
    </div>
  );
};
