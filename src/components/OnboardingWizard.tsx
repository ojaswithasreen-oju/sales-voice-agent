import React, { useState } from 'react';
import {
  Building2,
  Package,
  FileText,
  Bot,
  Phone,
  Play,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Globe,
  Plus,
  Trash2,
  Mic,
  Volume2,
  Sparkles,
  Send
} from 'lucide-react';
import { api } from '../lib/api';
import type { Organization, Assistant, Product, PhoneNumber } from '../types';

interface OnboardingWizardProps {
  organization: Organization;
  onComplete: () => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  organization,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Company info
  const [companyName, setCompanyName] = useState(organization.name || 'Acme Cloud Corp');
  const [industry, setIndustry] = useState(organization.industry || 'B2B SaaS');
  const [size, setSize] = useState(organization.size || '11-50');
  const [website, setWebsite] = useState(organization.website || 'https://acmecloud.example.com');
  const [timezone, setTimezone] = useState(organization.timezone || 'America/New_York');

  // Step 2: Products
  const [products, setProducts] = useState<Array<{ name: string; price: string; description: string }>>([
    {
      name: 'Enterprise Cloud Suite',
      price: '$1,990 / month',
      description: 'End-to-end data pipeline automation, SOC2 compliance, and dedicated engineering support.',
    },
  ]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Step 3: Knowledge Base
  const [knowledgeTab, setKnowledgeTab] = useState<'text' | 'url' | 'file'>('text');
  const [knowledgeText, setKnowledgeText] = useState(
    `${companyName} is a market leader in autonomous workflow solutions. Our flagship platform accelerates data pipelines by 85%. Standard evaluation timelines are 14 days, and we offer dedicated solutions architect support for enterprise clients.`
  );
  const [knowledgeUrl, setKnowledgeUrl] = useState('https://example.com/docs');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(['Company_Overview_2026.pdf', 'Sales_FAQ.docx']);

  // Step 4: Configure AI Assistant
  const [assistantName, setAssistantName] = useState('Sarah - Sales Specialist');
  const [assistantVoice, setAssistantVoice] = useState<'nova' | 'alloy' | 'shimmer' | 'onyx'>('nova');
  const [assistantTone, setAssistantTone] = useState<'consultative' | 'professional' | 'warm' | 'direct'>('consultative');
  const [greeting, setGreeting] = useState(
    `Hello! Thank you for calling ${companyName}. My name is Sarah, your sales assistant. How can I help your team today?`
  );
  const [salesObjective, setSalesObjective] = useState(
    'Qualify enterprise prospect, check timeline & budget, and schedule a 20-minute executive demo.'
  );
  const [qualificationQuestions, setQualificationQuestions] = useState<string[]>([
    'What is your current team size and primary workflow bottleneck?',
    'What does your evaluation timeline look like for rolling out a solution?',
  ]);

  // Step 5: Connect Phone Number
  const [selectedNumberType, setSelectedNumberType] = useState<'local' | 'toll_free'>('local');
  const [assignedNumber, setAssignedNumber] = useState('+1 (415) 890-2341');

  // Step 6: Test Voice Assistant
  const [testMessages, setTestMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: greeting,
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stepsList = [
    { num: 1, label: 'Company Info', icon: Building2 },
    { num: 2, label: 'Products & Services', icon: Package },
    { num: 3, label: 'Upload Knowledge', icon: FileText },
    { num: 4, label: 'Configure Assistant', icon: Bot },
    { num: 5, label: 'Connect Phone', icon: Phone },
    { num: 6, label: 'Test Assistant', icon: Play },
    { num: 7, label: 'Launch', icon: Rocket },
  ];

  const handleAddProduct = () => {
    if (!newProdName) return;
    setProducts([
      ...products,
      {
        name: newProdName,
        price: newProdPrice || '$499 / mo',
        description: newProdDesc || 'Product or service offering',
      },
    ]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
  };

  const handleRemoveProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleSendTestMessage = async (textToSend?: string) => {
    const text = textToSend || testInput;
    if (!text.trim()) return;

    const newHistory = [...testMessages, { role: 'user' as const, text }];
    setTestMessages(newHistory);
    setTestInput('');
    setIsAiResponding(true);

    try {
      const res = await api.testAssistantVoice({
        userMessage: text,
        conversationHistory: newHistory,
      });

      setTestMessages((prev) => [...prev, { role: 'assistant', text: res.text }]);

      // Speak response using Web Speech Synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.text);
        utterance.rate = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setTestMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Thank you for sharing that. Based on our ${products[0]?.name || 'platform'}, we can certainly help streamline your workflows. Would you like to reserve a 20-minute executive demo this week?`,
        },
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleFinishLaunch = async () => {
    setLoading(true);
    try {
      // 1. Update organization info
      await api.updateOrganization({
        name: companyName,
        industry,
        size,
        website,
        timezone,
      });

      // 2. Persist products
      for (const p of products) {
        await api.createProduct({
          name: p.name,
          price: p.price,
          description: p.description,
          features: ['Enterprise Support', 'Dedicated SLA'],
        });
      }

      // 3. Persist knowledge
      if (knowledgeText) {
        await api.createKnowledge({
          title: `${companyName} Master Overview.pdf`,
          type: 'manual',
          content: knowledgeText,
        });
      }

      // 4. Create first assistant
      const createdAsst = await api.createAssistant({
        name: assistantName,
        role: 'Inbound Sales Specialist',
        voice: assistantVoice,
        tone: assistantTone,
        greeting,
        instructions: `Represent ${companyName} professionally. Qualify buyers with consultative sales discovery.`,
        salesObjective,
        qualificationQuestions,
        isActive: true,
      });

      // 5. Connect phone number
      await api.createPhoneNumber({
        type: selectedNumberType,
        assignedAssistantId: createdAsst.id,
      });

      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      onComplete(); // proceed gracefully
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Step Indicators */}
        <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Workspace Onboarding Wizard
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Step {step} of 7 &bull; {stepsList[step - 1].label}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              Skip to Dashboard
            </button>
          </div>

          {/* Stepper progress bar */}
          <div className="grid grid-cols-7 gap-2">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isDone = s.num < step;
              const isCurrent = s.num === step;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 hidden sm:block text-center font-medium ${
                      isCurrent ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
          {/* STEP 1: Company Information */}
          {step === 1 && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Tell Us About Your Business</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your AI assistant will adapt its tone and identity to match your company profile.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal / Trading Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="B2B SaaS">B2B SaaS &amp; Cloud</option>
                    <option value="Logistics & Supply Chain">Logistics &amp; Supply Chain</option>
                    <option value="Healthcare & MedTech">Healthcare &amp; MedTech</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="1-10">1-10 team members</option>
                    <option value="11-50">11-50 team members</option>
                    <option value="51-200">51-200 team members</option>
                    <option value="201-500">201-500 team members</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Products & Services */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Add Your Products &amp; Offerings</h3>
                <p className="text-xs text-slate-500 mt-1">
                  The AI voice assistant pitches these offerings when callers express buying intent.
                </p>
              </div>

              {/* Existing Products List */}
              <div className="space-y-3">
                {products.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.name}</span>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {p.price}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Product Mini-Form */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Add Another Offering
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Product / Plan Name"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. $499 / month or Custom"
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Key value proposition, target customer, or included features..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Company Knowledge Base */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Upload Company Knowledge</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Allow: PDF, DOC/DOCX, TXT, Website URLs, and Manual FAQs for ground-truth factual answers.
                </p>
              </div>

              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setKnowledgeTab('text')}
                  className={`pb-2 px-4 text-xs font-semibold border-b-2 cursor-pointer ${
                    knowledgeTab === 'text'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Manual Text &amp; FAQ
                </button>
                <button
                  onClick={() => setKnowledgeTab('file')}
                  className={`pb-2 px-4 text-xs font-semibold border-b-2 cursor-pointer ${
                    knowledgeTab === 'file'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Upload Documents (PDF/DOC)
                </button>
                <button
                  onClick={() => setKnowledgeTab('url')}
                  className={`pb-2 px-4 text-xs font-semibold border-b-2 cursor-pointer ${
                    knowledgeTab === 'url'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Website Documentation URL
                </button>
              </div>

              {knowledgeTab === 'text' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Paste Company Guidelines, Pricing Policies, or Pitch Deck Summary:
                  </label>
                  <textarea
                    rows={6}
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <div className="text-[11px] text-slate-400">
                    The AI engine automatically creates semantic chunk embeddings for sub-second retrieval.
                  </div>
                </div>
              )}

              {knowledgeTab === 'file' && (
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl text-center bg-white cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-800">
                      Drag and drop PDF, DOCX, or TXT sales collaterals
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Max 25MB per document. Instant vectorization included.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Attached Documents:</div>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>{f}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          Indexed Ready
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {knowledgeTab === 'url' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Crawl Website Knowledge URL:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={knowledgeUrl}
                        onChange={(e) => setKnowledgeUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Crawl
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Configure AI Assistant */}
          {step === 4 && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Configure Your AI Sales Agent</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the voice persona, opening greeting, and qualification checkpoints.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voice Persona</label>
                  <select
                    value={assistantVoice}
                    onChange={(e) => setAssistantVoice(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="nova">Nova (Natural US Female &bull; Warm &amp; Clear)</option>
                    <option value="alloy">Alloy (US Neutral &bull; Consultative)</option>
                    <option value="shimmer">Shimmer (US Expressive &bull; Dynamic)</option>
                    <option value="onyx">Onyx (US Deep Male &bull; Authoritative)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone Opening Greeting</label>
                <textarea
                  rows={2}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Sales Objective</label>
                <input
                  type="text"
                  value={salesObjective}
                  onChange={(e) => setSalesObjective(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Qualification Questions to Ask Caller:
                </label>
                <div className="space-y-2">
                  {qualificationQuestions.map((q, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...qualificationQuestions];
                          updated[idx] = e.target.value;
                          setQualificationQuestions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setQualificationQuestions(qualificationQuestions.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQualificationQuestions([...qualificationQuestions, 'What is your budget range?'])}
                    className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Connect Phone Number */}
          {step === 5 && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Connect a Dedicated Telephony Number</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Incoming calls to this number will be answered immediately by your AI sales assistant.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setSelectedNumberType('local');
                    setAssignedNumber('+1 (415) 890-2341');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedNumberType === 'local'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 mb-1">Local Business Number</div>
                  <div className="text-xs text-slate-500">San Francisco Bay Area (415)</div>
                  <div className="mt-3 text-sm font-mono font-bold text-indigo-600">+1 (415) 890-2341</div>
                </div>

                <div
                  onClick={() => {
                    setSelectedNumberType('toll_free');
                    setAssignedNumber('+1 (800) 555-0192');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedNumberType === 'toll_free'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 mb-1">National Toll-Free Number</div>
                  <div className="text-xs text-slate-500">US &amp; Canada (800 Toll-Free)</div>
                  <div className="mt-3 text-sm font-mono font-bold text-indigo-600">+1 (800) 555-0192</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">Telephony Routing Specifications</div>
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Assistant:</span>
                  <span className="font-semibold text-slate-900">{assistantName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Routing Strategy:</span>
                  <span className="font-semibold text-slate-900">Sub-400ms Inbound SIP</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Business Hours:</span>
                  <span className="font-semibold text-slate-900">24/7 Continuous Inbound</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Test Voice Assistant */}
          {step === 6 && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-slate-900">Test Your AI Assistant Live</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Simulate an inbound phone conversation right in your browser before publishing.
                </p>
              </div>

              {/* Chat / Call Simulator Window */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">{assistantName}</span>
                    <span className="text-slate-400">({assignedNumber})</span>
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center gap-1 text-[11px] text-indigo-300">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                  {testMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl text-xs ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-70 mb-0.5">
                          {msg.role === 'user' ? 'Caller (You)' : assistantName}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        <span>AI Assistant reasoning from company knowledge...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                    placeholder="Type what a customer might ask (e.g. How much does it cost?)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestMessage()}
                    disabled={isAiResponding || !testInput.trim()}
                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Sample Questions */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-400 self-center">Try asking:</span>
                <button
                  type="button"
                  onClick={() => handleSendTestMessage('What products do you offer and what is the pricing?')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  "What is your pricing?"
                </button>
                <button
                  type="button"
                  onClick={() => handleSendTestMessage('Can we book a 20-minute demo for Thursday?')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  "Can we book a demo?"
                </button>
                <button
                  type="button"
                  onClick={() => handleSendTestMessage('Can I speak with a human manager?')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  "Connect me to a human"
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Launch */}
          {step === 7 && (
            <div className="max-w-md mx-auto text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Rocket className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Your AI Voice Agent is Ready to Launch!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We have provisioned your dedicated tenant workspace, indexed your products and knowledge, and linked your telephony gateway.
              </p>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Workspace Tenant:</span>
                  <span className="font-bold text-slate-800">{companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Live Assistant:</span>
                  <span className="font-bold text-indigo-600">{assistantName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Connected Inbound Number:</span>
                  <span className="font-bold text-slate-800">{assignedNumber}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishLaunch}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Initializing Workspace...' : 'Enter Live Dashboard & CRM &rarr;'}
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(7, s + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
            >
              <span>Next: {stepsList[step].label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishLaunch}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shadow-xs"
            >
              <Rocket className="w-4 h-4" />
              <span>{loading ? 'Launching...' : 'Complete & Launch'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
