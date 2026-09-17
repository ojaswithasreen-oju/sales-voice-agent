import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  FileText,
  Edit3,
  ArrowRight,
  RotateCcw,
  Clock,
  UserCheck,
  Plus,
  HelpCircle,
  TrendingUp,
  FileCode,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type {
  AiImprovementSuggestion,
  KnowledgeVersion,
  KnowledgeSource,
  User,
  Organization
} from '../types';
import { api } from '../lib/api';

interface AIImprovementViewProps {
  knowledge: KnowledgeSource[];
  currentUser?: User | null;
  organization?: Organization | null;
  onRefreshKnowledge?: () => void;
  onNavigateToKnowledge?: () => void;
}

export const AIImprovementView: React.FC<AIImprovementViewProps> = ({
  knowledge,
  currentUser,
  organization,
  onRefreshKnowledge,
  onNavigateToKnowledge,
}) => {
  const [suggestions, setSuggestions] = useState<AiImprovementSuggestion[]>([]);
  const [versions, setVersions] = useState<KnowledgeVersion[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{
    knowledgeGapsCount: number;
    approvedImprovementsCount: number;
    pendingSuggestionsCount: number;
    aiResolutionRate: number;
    knowledgeCoveragePct: number;
    escalationRate: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  // Review & Approval Modal state
  const [reviewingSuggestion, setReviewingSuggestion] = useState<AiImprovementSuggestion | null>(null);
  const [editedAnswer, setEditedAnswer] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [approving, setApproving] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Active view mode
  const [activeTab, setActiveTab] = useState<'suggestions' | 'versions'>('suggestions');

  const loadData = async () => {
    setLoading(true);
    try {
      const [suggs, vers, stats] = await Promise.all([
        api.getImprovementSuggestions('all'),
        api.getKnowledgeVersions(),
        api.getImprovementDashboard(),
      ]);
      setSuggestions(suggs);
      setVersions(vers);
      setDashboardStats(stats);
    } catch (err) {
      console.error('Failed to load improvement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReviewModal = (sugg: AiImprovementSuggestion) => {
    setReviewingSuggestion(sugg);
    setEditedAnswer(sugg.suggestedAnswer);
    setSelectedKnowledgeId(sugg.targetKnowledgeSourceId || knowledge[0]?.id || '');
    setChangeSummary(`Approved AI resolution for: "${sugg.title}"`);
    setApprovalFeedback(null);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSuggestion) return;
    setApproving(true);
    try {
      await api.approveImprovementSuggestion(reviewingSuggestion.id, {
        targetKnowledgeSourceId: selectedKnowledgeId,
        updatedText: editedAnswer,
        changeSummary: changeSummary || `Approved answer for ${reviewingSuggestion.title}`,
        reviewerName: currentUser?.name || 'Authorized Admin',
      });

      setApprovalFeedback('Knowledge Base successfully updated and versioned!');
      setTimeout(() => {
        setReviewingSuggestion(null);
        setApprovalFeedback(null);
        loadData();
        if (onRefreshKnowledge) onRefreshKnowledge();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to approve suggestion');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (suggestionId: string) => {
    if (!confirm('Dismiss this suggestion? It will not be added to the Knowledge Base.')) return;
    try {
      await api.rejectImprovementSuggestion(suggestionId, currentUser?.name || 'Authorized Admin');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject suggestion');
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    if (!confirm('Revert this Knowledge Base version? The change will be marked reverted in audit logs.')) return;
    try {
      await api.revertKnowledgeVersion(versionId);
      loadData();
      if (onRefreshKnowledge) onRefreshKnowledge();
    } catch (err: any) {
      alert(err.message || 'Failed to revert version');
    }
  };

  const filteredSuggestions = suggestions.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const approvedCount = suggestions.filter((s) => s.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Continuous AI Improvement Loop</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Human-in-the-Loop Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect knowledge gaps, incorrect answers, and struggled objections. Review and approve updates before they go live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'suggestions'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggestions ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'versions'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-500" />
              <span>Version History ({versions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* STRICT SAFETY & COMPLIANCE POLICY CALLOUT */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-300 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-bold text-amber-900">Safety &amp; Compliance Guarantee: </span>
          The AI system is strictly architected to <span className="font-bold underline">never automatically change</span> important company information, pricing, policies, or sales rules. Every proposed FAQ, product detail, or objection counter-response requires review and explicit human authorization before updating the active voice knowledge base.
        </div>
      </div>

      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Pending Human Review</div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Requires admin approval</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Approved Improvements</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Live in Knowledge Base</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">AI Resolution Rate</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">
            {dashboardStats?.aiResolutionRate || 89.4}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">+15.2% over last 90 days</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Knowledge Coverage</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {dashboardStats?.knowledgeCoveragePct || 94.2}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across 14 product categories</div>
        </div>
      </div>

      {/* ACTIVE TAB: IMPROVEMENT SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Category & Status Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Issues
              </button>
              <button
                onClick={() => setSelectedCategory('knowledge_gap')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedCategory === 'knowledge_gap'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Knowledge Gaps
              </button>
              <button
                onClick={() => setSelectedCategory('struggled_objection')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedCategory === 'struggled_objection'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Common Objections
              </button>
              <button
                onClick={() => setSelectedCategory('missing_product_detail')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedCategory === 'missing_product_detail'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Missing Product Details
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setSelectedStatus('approved')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  selectedStatus === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  selectedStatus === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Statuses
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.map((sugg) => {
              const isPending = sugg.status === 'pending';
              const isApproved = sugg.status === 'approved';

              let catBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              let catLabel = 'Knowledge Gap';
              if (sugg.category === 'struggled_objection') {
                catBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                catLabel = 'Struggled Objection';
              } else if (sugg.category === 'missing_product_detail') {
                catBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                catLabel = 'Product Spec Gap';
              }

              return (
                <div
                  key={sugg.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${catBadge}`}>
                          {catLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Detected from {sugg.detectedFromCount} customer conversations
                        </span>
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved (v{sugg.appliedVersion || 1})
                          </span>
                        )}
                        {sugg.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                            Dismissed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {sugg.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {sugg.description}
                      </p>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReject(sugg.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(sugg)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Review &amp; Approve</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Customer Quotes */}
                  {sugg.sampleCustomerQuotes && sugg.sampleCustomerQuotes.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>Caller Quotes from Live Transcripts</span>
                      </div>
                      <div className="space-y-1">
                        {sugg.sampleCustomerQuotes.map((quote, qIdx) => (
                          <div key={qIdx} className="text-xs text-slate-700 italic">
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proposed Answer Preview */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>AI Suggested Content Update</span>
                      </span>
                      <span className="text-slate-400 font-normal lowercase">Requires Human Approval</span>
                    </div>
                    <div className="text-xs text-indigo-950 font-medium whitespace-pre-wrap leading-relaxed">
                      {sugg.suggestedAnswer}
                    </div>
                  </div>

                  {isApproved && (
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                      <span>Reviewed by {sugg.reviewedBy || 'Authorized Admin'}</span>
                      <span>Version: v{sugg.appliedVersion || 1} &bull; Live in Knowledge Base</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredSuggestions.length === 0 && (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Pending Issues in this View</h4>
                <p className="text-xs text-slate-500">All detected customer inquiries are resolved and up to date.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE TAB: VERSION HISTORY & AUDIT TRAIL */}
      {activeTab === 'versions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Knowledge Base Version History</h3>
              <p className="text-xs text-slate-500">Immutable change log of all human-approved updates and rollbacks</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{versions.length} versions published</span>
          </div>

          <div className="space-y-4">
            {versions.map((ver) => {
              const isActive = ver.status === 'active';

              return (
                <div
                  key={ver.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isActive ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 bg-slate-100/50 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-600 text-white">
                          v{ver.versionNumber}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{ver.sourceTitle}</span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ver.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold">{ver.changeSummary}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Approved by: {ver.updatedBy}</span>
                        <span>&bull;</span>
                        <span>{new Date(ver.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevertVersion(ver.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revert Version</span>
                      </button>
                    )}
                  </div>

                  {/* Diff Snippet */}
                  <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous Content Context</span>
                      <p className="text-[11px] text-slate-600 italic line-clamp-3">
                        {ver.previousContentSnippet || 'None'}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">New Content Added</span>
                      <p className="text-[11px] text-emerald-950 font-medium line-clamp-3">
                        {ver.newContentSnippet}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {versions.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No version history recorded yet. Approved improvements will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* HUMAN APPROVAL & EDIT MODAL */}
      {reviewingSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Human Approval &amp; Knowledge Update</h3>
                  <p className="text-[11px] text-slate-500">Edit and verify proposed resolution before publishing</p>
                </div>
              </div>
              <button
                onClick={() => setReviewingSuggestion(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {approvalFeedback ? (
              <div className="p-6 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold">{approvalFeedback}</div>
              </div>
            ) : (
              <form onSubmit={handleApprove} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Title</label>
                  <input
                    type="text"
                    disabled
                    value={reviewingSuggestion.title}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Knowledge Source Document</label>
                  <select
                    value={selectedKnowledgeId}
                    onChange={(e) => setSelectedKnowledgeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  >
                    {knowledge.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.title} ({k.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Approved Knowledge Content (Review &amp; Edit text below):
                    </label>
                    <span className="text-[10px] text-indigo-600 font-semibold">Editable by human reviewer</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Change Summary / Commit Note</label>
                  <input
                    type="text"
                    required
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="e.g. Added SLA guarantee policy and priority support specs"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Publishing this update creates a new immutable version in history and updates voice models immediately.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingSuggestion(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={approving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {approving ? (
                      <span>Publishing Version...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Authorize &amp; Update Knowledge</span>
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
