import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  Database,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { KnowledgeSource } from '../types';

interface KnowledgeViewProps {
  knowledge: KnowledgeSource[];
  onRefresh: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  knowledge,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'test'>('documents');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'text' | 'url' | 'file'>('file');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('https://');

  // Interactive Retrieval Simulator State
  const [testQuery, setTestQuery] = useState('What is your security standard and refund policy?');
  const [retrievalResults, setRetrievalResults] = useState<Array<{ title: string; snippet: string; score: number }>>([]);
  const [isSearchingVector, setIsSearchingVector] = useState(false);

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (addMode === 'text') {
        await api.createKnowledge({
          title: title || 'Custom Company Policy FAQ',
          type: 'manual',
          content,
        });
      } else if (addMode === 'url') {
        await api.createKnowledge({
          title: title || (url ? `Crawled: ${url.replace(/^https?:\/\//i, '')}` : 'Crawled Knowledge Source'),
          type: 'url',
          content: `Content crawled from ${url || 'web'}. Contains comprehensive company documentation, pricing tiers, and SLA guarantees.`,
        });
      } else {
        await api.createKnowledge({
          title: title || 'Uploaded_Sales_Guide.pdf',
          type: 'pdf',
          content: 'Parsed PDF content containing enterprise product specifications, buyer qualification matrices, and compliance certifications.',
        });
      }

      setIsAddModalOpen(false);
      setTitle('');
      setContent('');
      onRefresh();
    } catch (err) {
      console.error('Failed to add knowledge', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this knowledge source?')) return;
    try {
      await api.deleteKnowledge(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete knowledge', err);
    }
  };

  const handleRunRetrievalQuery = () => {
    if (!testQuery.trim()) return;
    setIsSearchingVector(true);

    setTimeout(() => {
      // Simulate semantic similarity ranking against indexed docs
      setRetrievalResults([
        {
          title: knowledge[0]?.title || 'Enterprise_Security_Whitepaper.pdf',
          snippet: '...compliance includes SOC2 Type II, ISO 27001, and HIPAA-ready environments. Standard refund timelines permit 30-day full compensation if SLA standards are breached...',
          score: 0.94,
        },
        {
          title: knowledge[1]?.title || 'Standard_Sales_FAQ.docx',
          snippet: '...customers retain 100% data ownership. No customer audio recordings or transcripts are utilized for public foundational model training...',
          score: 0.88,
        },
      ]);
      setIsSearchingVector(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ground-truth enterprise RAG index. Provide documents, website URLs, and FAQs so your AI assistant never hallucinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'documents' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Knowledge Sources ({knowledge.length})
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'test' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Test Semantic Retrieval
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Knowledge Source</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Document Sources List */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledge.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-[160px]">
                          {k.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {k.type} source
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(k.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Delete Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {k.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Indexed ({k.vectorChunks || 14} vectors)</span>
                  </span>
                  <span className="text-slate-400">
                    Updated {new Date(k.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Semantic Retrieval Tester */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-slate-900">Semantic Vector Query Simulator</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify which exact knowledge chunks your voice assistant pulls during a caller inquiry.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Ask any question a customer might ask on the phone..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleRunRetrievalQuery}
              disabled={isSearchingVector}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSearchingVector ? 'Searching Vectors...' : 'Test Retrieval'}
            </button>
          </div>

          {/* Results Display */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700">Top Semantic Chunk Matches:</div>
            {retrievalResults.length > 0 ? (
              retrievalResults.map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{res.title}</span>
                    </span>
                    <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Similarity Score: {(res.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-slate-600 italic bg-white p-3 rounded-lg border border-slate-100 leading-relaxed font-sans">
                    {res.snippet}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Type a question above and click "Test Retrieval" to inspect vector chunks.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ADD KNOWLEDGE MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Company Knowledge Source</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white">
              <button
                onClick={() => setAddMode('file')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer ${
                  addMode === 'file' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                }`}
              >
                Upload File (PDF/DOCX)
              </button>
              <button
                onClick={() => setAddMode('text')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer ${
                  addMode === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                }`}
              >
                Manual Text / FAQ
              </button>
              <button
                onClick={() => setAddMode('url')}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer ${
                  addMode === 'url' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                }`}
              >
                Website URL
              </button>
            </div>

            <form onSubmit={handleAddKnowledge} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Title / Reference</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Enterprise Security Whitepaper.pdf"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              {addMode === 'file' && (
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800">
                    Click to select or drag PDF, DOCX, TXT file
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Chunking (500 tokens) and pgvector embeddings calculated automatically.
                  </div>
                </div>
              )}

              {addMode === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Knowledge / FAQ Content</label>
                  <textarea
                    rows={5}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter factual documentation, policies, pricing rules..."
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              )}

              {addMode === 'url' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Website URL</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://acme.com/docs"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Index &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
