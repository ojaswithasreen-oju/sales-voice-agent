import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { Lead, LeadStage } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  onRefresh: () => void;
}

const STAGES: Array<{ id: LeadStage; label: string; color: string }> = [
  { id: 'new', label: 'New Lead', color: 'border-slate-300 bg-slate-50' },
  { id: 'contacted', label: 'Contacted', color: 'border-blue-300 bg-blue-50/50' },
  { id: 'qualified', label: 'Qualified', color: 'border-indigo-300 bg-indigo-50/50' },
  { id: 'demo', label: 'Demo Scheduled', color: 'border-amber-300 bg-amber-50/50' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-purple-300 bg-purple-50/50' },
  { id: 'converted', label: 'Converted Won', color: 'border-emerald-300 bg-emerald-50/50' },
  { id: 'lost', label: 'Lost / Disqualified', color: 'border-rose-300 bg-rose-50/50' },
];

export const LeadsView: React.FC<LeadsViewProps> = ({ leads, onRefresh }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // New Lead Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStage, setNewStage] = useState<LeadStage>('new');
  const [newBudget, setNewBudget] = useState('$10,000 - $25,000');
  const [newProduct, setNewProduct] = useState('Enterprise Cloud Suite');

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStageChange = async (leadId: string, stage: LeadStage) => {
    try {
      await api.updateLead(leadId, { stage });
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, stage });
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to update stage', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead({
        name: newName,
        company: newCompany,
        email: newEmail,
        phone: newPhone,
        stage: newStage,
        score: 75,
        budget: newBudget,
        interestedProduct: newProduct,
        notes: ['Manually logged prospect lead.'],
        nextAction: 'Follow up with executive pitch deck.',
      });
      setIsCreateOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create lead', err);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Name,Company,Email,Phone,Stage,Score,Budget,InterestedProduct,NextAction\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.company}","${l.email}","${l.phone}","${l.stage}",${l.score},"${l.budget}","${l.interestedProduct}","${l.nextAction}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leads &amp; Sales CRM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline captured autonomously from inbound voice calls and qualification dialogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, company, email, or telephone number..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KANBAN BOARD VIEW */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
          {STAGES.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.stage === col.id);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-white text-[11px] font-bold text-slate-600 flex items-center justify-center border border-slate-200">
                      {colLeads.length}
                    </span>
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDetailOpen(true);
                      }}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {lead.company}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700">
                          {lead.score}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="font-semibold text-slate-800 line-clamp-1">{lead.interestedProduct}</div>
                        <div className="text-slate-500">{lead.budget}</div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="truncate max-w-[140px]">{lead.nextAction}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                      No leads in stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TABLE VIEW */}
      {/* ------------------------------------------------------------------ */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Lead Name / Company</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Propensity Score</th>
                  <th className="py-3 px-4">Product &amp; Budget</th>
                  <th className="py-3 px-4">Next Action</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-500">{lead.company}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{lead.email}</div>
                      <div className="font-mono text-[11px] text-slate-400">{lead.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {lead.stage}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {lead.score}/100
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{lead.interestedProduct}</div>
                      <div className="text-[11px] text-slate-400">{lead.budget}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {lead.nextAction}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                          setIsDetailOpen(true);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* LEAD DETAIL MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isDetailOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500">{selectedLead.company}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Stage Selector Bar */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Update Pipeline Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStageChange(selectedLead.id, s.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                        selectedLead.stage === s.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Work Email:</span>
                  <span className="font-semibold text-slate-900">{selectedLead.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedLead.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Account Executive:</span>
                  <span className="font-semibold text-indigo-600">{selectedLead.assignedTo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Interested Offering:</span>
                  <span className="font-semibold text-slate-900">{selectedLead.interestedProduct}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Budget Range:</span>
                  <span className="font-semibold text-slate-900">{selectedLead.budget}</span>
                </div>
              </div>

              {/* AI Discovery Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  AI Qualification Notes &amp; Insights
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedLead.notes}
                </div>
              </div>

              {/* Next Action */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Next Action</label>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium">
                  {selectedLead.nextAction}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CREATE LEAD MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Lead Manually</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Horizon Logistics"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rachel@horizon.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
