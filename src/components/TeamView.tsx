import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  Mail,
  Trash2,
  Clock,
  Lock,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { TeamMember, UserRole } from '../types';

interface TeamViewProps {
  members: TeamMember[];
  onRefresh: () => void;
}

const ROLES: Array<{ role: UserRole; title: string; desc: string }> = [
  { role: 'owner', title: 'Workspace Owner', desc: 'Full billing, tenant ownership, security & system controls.' },
  { role: 'admin', title: 'Administrator', desc: 'Manage assistants, phone numbers, knowledge bases, and users.' },
  { role: 'sales_manager', title: 'Sales Manager', desc: 'Review calls, manage lead pipeline, audit AI scores and assign reps.' },
  { role: 'sales_rep', title: 'Sales Representative', desc: 'Access assigned leads, inspect call transcripts, update deal stages.' },
  { role: 'viewer', title: 'Read-only Viewer', desc: 'View dashboards, listen to recordings, no configuration changes.' },
];

export const TeamView: React.FC<TeamViewProps> = ({ members, onRefresh }) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('sales_rep');

  // Audit Logs (Simulated Enterprise Security Audit Trail)
  const auditLogs = [
    { action: 'Assistant Sarah greeting updated', user: 'Ojaswitha Sreen', time: '14 minutes ago' },
    { action: 'Lead Rachel Adams moved to Qualified', user: 'AI Voice Engine', time: '1 hour ago' },
    { action: 'New phone line +1 (415) 890-2341 provisioned', user: 'Ojaswitha Sreen', time: '3 hours ago' },
    { action: 'Document Sales_Guide.pdf uploaded & indexed', user: 'Marcus Vance', time: 'Yesterday' },
  ];

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inviteTeamMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      setIsInviteOpen(false);
      setInviteName('');
      setInviteEmail('');
      onRefresh();
    } catch (err) {
      console.error('Failed to invite member', err);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.removeTeamMember(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Team &amp; Access Controls (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage teammates, configure granular role permissions, and review security audit logs.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
          <span>Active Organization Members ({members.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Tenant Data Isolation Enforced</span>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{member.name}</span>
                    {member.role === 'owner' && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{member.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {String(member.role || 'member').replace(/_/g, ' ')}
                </span>

                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Revoke Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix & Audit Trail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles & Permissions Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
          </div>

          <div className="space-y-3">
            {ROLES.map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="font-bold text-slate-900 mb-0.5">{r.title}</div>
                <div className="text-slate-500 text-[11px] leading-relaxed">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Security &amp; Action Audit Trail</h3>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">{log.action}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">By {log.user}</div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INVITE TEAM MEMBER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Invite Workspace Teammate</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="sarah@company.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="admin">Administrator (Full config)</option>
                  <option value="sales_manager">Sales Manager (CRM &amp; Calls)</option>
                  <option value="sales_rep">Sales Rep (Assigned Leads)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
