import React, { useState } from 'react';
import {
  Phone,
  Plus,
  PhoneCall,
  PhoneForwarded,
  Clock,
  Mic,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  Settings,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import type { PhoneNumber, Assistant } from '../types';

interface PhoneViewProps {
  phoneNumbers: PhoneNumber[];
  assistants: Assistant[];
  onRefresh: () => void;
  onOpenSimulateModal: () => void;
}

export const PhoneView: React.FC<PhoneViewProps> = ({
  phoneNumbers,
  assistants,
  onRefresh,
  onOpenSimulateModal,
}) => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyType, setBuyType] = useState<'local' | 'toll_free'>('local');
  const [buyProvider, setBuyProvider] = useState<'twilio' | 'telnyx' | 'vonage' | 'sip'>('twilio');
  const [assignedAssistantId, setAssignedAssistantId] = useState(assistants[0]?.id || '');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Settings Modal
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handlePurchaseNumber = async () => {
    setIsPurchasing(true);
    try {
      await api.createPhoneNumber({
        type: buyType,
        provider: buyProvider,
        assignedAssistantId,
      });
      setIsBuyModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to buy number', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleToggleStatus = async (phone: PhoneNumber) => {
    const nextStatus = phone.status === 'active' ? 'offline' : 'active';
    try {
      await api.updatePhoneNumber(phone.id, { status: nextStatus });
      onRefresh();
    } catch (err) {
      console.error('Failed to update phone status', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Telephony &amp; Numbers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage inbound phone lines, SIP trunking, business hours, and instant AI voice answering.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSimulateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Simulate Inbound Call</span>
          </button>

          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision New Number</span>
          </button>
        </div>
      </div>

      {/* Numbers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {phoneNumbers.map((phone) => {
          const assignedAssistant = assistants.find((a) => a.id === phone.assignedAssistantId);

          return (
            <div
              key={phone.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold font-mono text-slate-900">
                        {phone.formatted}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        {String(phone.type || 'local').replace(/_/g, ' ')} line &bull; Carrier:{' '}
                        <span className="uppercase font-semibold text-slate-700">{phone.provider}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {phone.status === 'active' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active 🟢</span>
                      </span>
                    )}
                    {phone.status === 'offline' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Offline 🔴</span>
                      </span>
                    )}
                    {phone.status === 'pending_config' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Config Required 🟡</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Telephony Specs */}
                <div className="space-y-2.5 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned AI Agent:</span>
                    <span className="font-bold text-slate-900">
                      {assignedAssistant ? assignedAssistant.name : 'None (Unassigned)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Business Hours:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{phone.businessHours.enabled ? `${phone.businessHours.start} - ${phone.businessHours.end}` : '24/7 Unlimited'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Forwarding Target:</span>
                    <span className="font-mono text-slate-700">{phone.forwardingNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Call Audio Recording:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      <span>Encrypted WAV &amp; Turn Transcript</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={onOpenSimulateModal}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Simulate Call In</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(phone)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    phone.status === 'active'
                      ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {phone.status === 'active' ? 'Disable Line' : 'Activate Line'}
                </button>

                <button
                  onClick={() => {
                    setSelectedNumber(phone);
                    setIsConfigOpen(true);
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  title="Configure Routing Rules"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PROVISION NUMBER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Provision Inbound Telephony Line</h3>
              <button
                onClick={() => setIsBuyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBuyType('local')}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer text-left ${
                      buyType === 'local'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>Local Number</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">Area code targeted</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuyType('toll_free')}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer text-left ${
                      buyType === 'toll_free'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>Toll-Free (800)</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">Nationwide coverage</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephony Gateway Provider</label>
                <select
                  value={buyProvider}
                  onChange={(e) => setBuyProvider(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="twilio">Twilio Programmable Voice (Tier 1 US/Global)</option>
                  <option value="telnyx">Telnyx Low-Latency SIP Trunk</option>
                  <option value="vonage">Vonage Voice API</option>
                  <option value="sip">Custom Bring-Your-Own SIP Trunk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign AI Voice Assistant</label>
                <select
                  value={assignedAssistantId}
                  onChange={(e) => setAssignedAssistantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchaseNumber}
                disabled={isPurchasing}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isPurchasing ? 'Configuring SIP...' : 'Instant Provision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONFIGURE NUMBER MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isConfigOpen && selectedNumber && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Configure {selectedNumber.formatted}
              </h3>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Voice Assistant</label>
                <select
                  value={selectedNumber.assignedAssistantId}
                  onChange={(e) =>
                    setSelectedNumber({ ...selectedNumber, assignedAssistantId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Human Forwarding Fallback Number</label>
                <input
                  type="text"
                  value={selectedNumber.forwardingNumber}
                  onChange={(e) =>
                    setSelectedNumber({ ...selectedNumber, forwardingNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNumber.recordCalls}
                    onChange={(e) =>
                      setSelectedNumber({ ...selectedNumber, recordCalls: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Record all inbound phone calls for AI transcription &amp; compliance
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNumber.voicemailFallback}
                    onChange={(e) =>
                      setSelectedNumber({ ...selectedNumber, voicemailFallback: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-800">
                    Allow caller voicemail fallback if network drops
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await api.updatePhoneNumber(selectedNumber.id, selectedNumber);
                  setIsConfigOpen(false);
                  onRefresh();
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-xs"
              >
                Save Telephony Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
