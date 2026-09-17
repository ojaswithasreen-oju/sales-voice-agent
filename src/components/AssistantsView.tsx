import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Play,
  Settings,
  Trash2,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Phone,
  HelpCircle,
  Shield,
  UserCheck,
  ChevronRight,
  X,
  Globe,
  Languages,
  Sliders,
  Zap,
  RotateCcw
} from 'lucide-react';
import { api } from '../lib/api';
import { playVoiceText, cancelVoice } from '../lib/audioVoice';
import { SUPPORTED_LANGUAGES, getLanguageByCode, LanguageOption } from '../lib/languages';
import { MultilingualVoiceSettings } from './MultilingualVoiceSettings';
import type { Assistant, Product, KnowledgeSource, PhoneNumber } from '../types';

interface AssistantsViewProps {
  assistants: Assistant[];
  products: Product[];
  knowledge: KnowledgeSource[];
  phoneNumbers: PhoneNumber[];
  onRefresh: () => void;
  activeTestAssistantId?: string;
}

export const AssistantsView: React.FC<AssistantsViewProps> = ({
  assistants,
  products,
  knowledge,
  phoneNumbers,
  onRefresh,
  activeTestAssistantId,
}) => {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    assistants.find((a) => a.id === activeTestAssistantId) || assistants[0] || null
  );

  // Edit/Create Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Partial<Assistant>>({});
  const [activeEditorTab, setActiveEditorTab] = useState<'persona' | 'multilingual' | 'instructions' | 'qualification' | 'handoff'>('persona');

  // Interactive Test Studio State
  const [isTestModalOpen, setIsTestModalOpen] = useState(Boolean(activeTestAssistantId));
  const [testMessages, setTestMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; reasoning?: string; languageBadge?: string }>>([]);
  const [testInput, setTestInput] = useState('');
  const [activeTestingLangCode, setActiveTestingLangCode] = useState<string>('en-US');
  const [detectedLanguageNotice, setDetectedLanguageNotice] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Initialize test messages when testing an assistant
  const openTestStudio = (asst: Assistant) => {
    setSelectedAssistant(asst);
    const langCode = asst.primaryLanguageCode || 'en-US';
    setActiveTestingLangCode(langCode);
    setDetectedLanguageNotice(null);

    const greetingText =
      (asst.localizedGreetings && asst.localizedGreetings[langCode]) ||
      asst.greeting ||
      'Hello! How can I assist your business today?';

    setTestMessages([
      {
        role: 'assistant',
        text: greetingText,
        languageBadge: `${getLanguageByCode(langCode).flag} ${getLanguageByCode(langCode).name}`,
      },
    ]);
    setIsTestModalOpen(true);
    playVoiceText(greetingText, {
      lang: langCode,
      voice: asst.voice,
      voiceGender: asst.voiceGender || (asst.voice === 'onyx' ? 'male' : 'female'),
      rate: asst.speakingSpeed ?? 1.0,
      pitch: asst.pitch ?? 1.05,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleOpenCreate = () => {
    setEditingAssistant({
      name: 'New Sales Voice Agent',
      role: 'Account Executive Qualifier',
      voice: 'nova',
      voiceGender: 'female',
      language: 'English (US)',
      primaryLanguageCode: 'en-US',
      accent: 'American Standard',
      speakingSpeed: 1.0,
      pitch: 1.05,
      supportedLanguages: ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN', 'it-IT', 'ar-SA'],
      autoDetectLanguage: true,
      allowCodeSwitching: true,
      localizedGreetings: {
        'en-US': 'Hello! Thank you for calling. This is your sales specialist. How can I help your business today?',
        'es-MX': '¡Hola! Gracias por llamar. Soy su especialista comercial. ¿En qué podemos ayudar a su empresa hoy?',
        'fr-FR': 'Bonjour ! Merci pour votre appel. Comment puis-je accompagner votre entreprise aujourd\'hui ?',
        'de-DE': 'Guten Tag! Vielen Dank für Ihren Anruf. Wie kann ich Ihrem Unternehmen heute weiterhelfen?',
        'pt-BR': 'Olá! Obrigado por ligar. Sou seu especialista de vendas. Como posso ajudar sua empresa hoje?',
        'hi-IN': 'नमस्ते! कॉल करने के लिए धन्यवाद। आज मैं आपके व्यवसाय की कैसे मदद कर सकता हूँ?',
        'ja-JP': 'こんにちは！お電話ありがとうございます。本日は御社にどのようなご案内をいたしましょうか？',
      },
      personality: 'Consultative, articulate, empathetic, and persistent',
      tone: 'consultative',
      greeting: 'Hello! Thank you for calling. This is your sales specialist. How can I help your business today?',
      instructions: 'Qualify inbound prospect team size, budget, and deployment timeline. Proactively pitch enterprise offerings and book an executive demo. You are fluent in all authorized languages.',
      salesObjective: 'Capture high-intent discovery data and secure calendar confirmation.',
      qualificationQuestions: [
        'What is your current workflow bottleneck?',
        'How many team members would require access?',
        'What is your target timeline for evaluating and rolling out a solution?'
      ],
      callEndingBehavior: 'Summarize next steps, confirm calendar invite dispatch, and thank caller warmly.',
      humanHandoffRules: 'If caller requests a human manager or asks for custom legal terms, transfer call to Director of Sales.',
      isActive: true,
      productIds: products.map((p) => p.id),
      knowledgeSourceIds: knowledge.map((k) => k.id),
    });
    setActiveEditorTab('persona');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (asst: Assistant) => {
    setEditingAssistant({
      ...asst,
      voiceGender: asst.voiceGender || (asst.voice === 'onyx' ? 'male' : 'female'),
      primaryLanguageCode: asst.primaryLanguageCode || 'en-US',
      supportedLanguages: asst.supportedLanguages && asst.supportedLanguages.length > 0
        ? asst.supportedLanguages
        : ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN'],
      autoDetectLanguage: asst.autoDetectLanguage ?? true,
      allowCodeSwitching: asst.allowCodeSwitching ?? true,
      speakingSpeed: asst.speakingSpeed ?? 1.0,
      pitch: asst.pitch ?? 1.05,
    });
    setActiveEditorTab('persona');
    setIsEditorOpen(true);
  };

  const handleSaveAssistant = async () => {
    if (!editingAssistant.name) return;
    try {
      if (editingAssistant.id) {
        await api.updateAssistant(editingAssistant.id, editingAssistant);
      } else {
        await api.createAssistant(editingAssistant);
      }
      setIsEditorOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save assistant', err);
    }
  };

  const handleDeleteAssistant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI voice assistant?')) return;
    try {
      await api.deleteAssistant(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete assistant', err);
    }
  };

  // Test Assistant Message Send
  const handleSendTestMessage = async (customText?: string) => {
    const text = customText || testInput;
    if (!text.trim() || !selectedAssistant) return;

    const newHistory = [...testMessages, { role: 'user' as const, text }];
    setTestMessages(newHistory);
    setTestInput('');
    setIsAiResponding(true);

    try {
      const res = await api.testAssistantVoice({
        assistantId: selectedAssistant.id,
        userMessage: text,
        conversationHistory: newHistory,
        currentLanguage: activeTestingLangCode,
      });

      const responseLang = res.detectedLanguage || activeTestingLangCode;
      const langObj = getLanguageByCode(responseLang);

      if (res.languageSwitched || (res.detectedLanguage && res.detectedLanguage !== activeTestingLangCode)) {
        setActiveTestingLangCode(responseLang);
        setDetectedLanguageNotice(`🌐 Language detected & switched to ${langObj.flag} ${langObj.name}`);
      }

      setTestMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.text,
          languageBadge: `${langObj.flag} ${langObj.name}`,
          reasoning: `Grounded in ${knowledge.length} company documents and ${products.length} catalog products (Communicated in ${langObj.name}).`,
        },
      ]);

      // Natural Multilingual Voice Playback with matching language, accent & speed
      playVoiceText(res.text, {
        lang: responseLang,
        voice: selectedAssistant.voice,
        voiceGender: res.voiceGender || selectedAssistant.voiceGender || 'female',
        rate: res.speakingSpeed || selectedAssistant.speakingSpeed || 1.0,
        pitch: res.pitch || selectedAssistant.pitch || 1.05,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } catch {
      const langObj = getLanguageByCode(activeTestingLangCode);
      const fallbackReply = `Thank you for asking. Our team provides comprehensive enterprise automation solutions. What is your team size and timeline for evaluating?`;
      setTestMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackReply,
          languageBadge: `${langObj.flag} ${langObj.name}`,
        },
      ]);

      playVoiceText(fallbackReply, {
        lang: activeTestingLangCode,
        voice: selectedAssistant.voice,
        voiceGender: selectedAssistant.voiceGender || 'female',
        rate: selectedAssistant.speakingSpeed || 1.0,
        pitch: selectedAssistant.pitch || 1.05,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } finally {
      setIsAiResponding(false);
    }
  };

  // Speech Recognition (Microphone Speech-to-Text with active language)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Dynamically listen in the active language dialect (e.g. es-MX, fr-FR, de-DE, hi-IN, etc.)
      const activeLangObj = getLanguageByCode(activeTestingLangCode);
      recognition.lang = activeLangObj.bcp47 || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendTestMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechError(`Microphone notice: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError(err.message || 'Microphone access failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Voice Assistant Fleet</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deploy, train, and test specialized conversational voice agents for sales, qualification, and support.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedAssistant && (
            <button
              onClick={() => openTestStudio(selectedAssistant)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Assistant</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Assistant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((asst) => {
          const assignedPhone = phoneNumbers.find((p) => p.assignedAssistantId === asst.id);

          return (
            <div
              key={asst.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-sm">
                      {asst.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{asst.name}</h3>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mt-0.5">
                        {asst.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-700">Active</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  "{asst.greeting}"
                </p>

                {/* Specs Pill List */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Voice &amp; Tone:</span>
                    <span className="font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                      <span>{asst.voice} &bull; {asst.tone}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                        asst.voiceGender === 'female' || asst.voice === 'nova' || asst.voice === 'shimmer' || asst.name.toLowerCase().includes('sarah')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : asst.voiceGender === 'male' || asst.voice === 'onyx'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {asst.voiceGender === 'female' || asst.voice === 'nova' || asst.voice === 'shimmer' || asst.name.toLowerCase().includes('sarah') ? 'Female' : asst.voiceGender === 'male' ? 'Male' : 'Neutral'}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Primary Language:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{getLanguageByCode(asst.primaryLanguageCode || 'en-US').flag}</span>
                      <span>{asst.language || 'English (US)'}</span>
                      <span className="text-[10px] font-mono text-slate-400">({(asst.speakingSpeed ?? 1.0).toFixed(2)}x)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Accent &amp; Dialect:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={asst.accent || 'American Standard'}>
                      {asst.accent || 'American Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Multilingual Engine:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Globe className="w-2.5 h-2.5" />
                      <span>{asst.supportedLanguages?.length || 10} Languages</span>
                      {asst.autoDetectLanguage !== false && <span className="text-[9px] text-indigo-500">&bull; Auto-detect</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Assigned Number:</span>
                    <span className="font-semibold font-mono text-indigo-600">
                      {assignedPhone ? assignedPhone.formatted : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Qualification Checkpoints:</span>
                    <span className="font-semibold text-slate-800">
                      {asst.qualificationQuestions?.length || 3} questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>Calls Handled:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {asst.callsHandled} ({asst.conversionRate}% qualified)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openTestStudio(asst)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Voice</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(asst)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Configure"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteAssistant(asst.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTERACTIVE VOICE TEST STUDIO MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isTestModalOpen && selectedAssistant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
            {/* Studio Header */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {selectedAssistant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <span>{selectedAssistant.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedAssistant.voiceGender === 'male' ? 'Male Voice' : 'Female Voice'} &bull; {(selectedAssistant.speakingSpeed ?? 1.0).toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Voice: <strong className="text-slate-200 capitalize">{selectedAssistant.voice}</strong></span>
                    <span>&bull;</span>
                    <span>Accent: <strong className="text-slate-200">{selectedAssistant.accent || 'American Standard'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Active Spoken Testing Language Selector */}
                <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <select
                    value={activeTestingLangCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setActiveTestingLangCode(newCode);
                      const langObj = getLanguageByCode(newCode);
                      setDetectedLanguageNotice(`🌐 Testing language set to ${langObj.flag} ${langObj.name}`);
                    }}
                    className="bg-transparent text-white text-xs border-none focus:outline-none cursor-pointer pr-1"
                  >
                    {(selectedAssistant.supportedLanguages && selectedAssistant.supportedLanguages.length > 0
                      ? selectedAssistant.supportedLanguages
                      : ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN', 'it-IT', 'ar-SA']
                    ).map((code) => {
                      const lang = getLanguageByCode(code);
                      return (
                        <option key={code} value={code} className="bg-slate-900 text-white">
                          {lang.flag} {lang.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Speaking</span>
                  </span>
                )}
                <button
                  onClick={() => {
                    setIsTestModalOpen(false);
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Auto-Detect Notice Banner */}
            {detectedLanguageNotice && (
              <div className="px-5 py-2 bg-indigo-900/40 border-b border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{detectedLanguageNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetectedLanguageNotice(null)}
                  className="text-indigo-400 hover:text-white text-[10px] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Conversation Log View */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{msg.role === 'user' ? 'Caller (You)' : selectedAssistant.name}</span>
                        {msg.languageBadge && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-normal">
                            {msg.languageBadge}
                          </span>
                        )}
                      </div>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => {
                            playVoiceText(msg.text, {
                              lang: activeTestingLangCode,
                              voice: selectedAssistant.voice,
                              voiceGender: selectedAssistant.voiceGender || 'female',
                              rate: selectedAssistant.speakingSpeed || 1.0,
                              pitch: selectedAssistant.pitch || 1.05,
                              onStart: () => setIsSpeaking(true),
                              onEnd: () => setIsSpeaking(false),
                            });
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-0.5"
                          title="Replay Voice in Target Language"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div>{msg.text}</div>
                    {msg.reasoning && (
                      <div className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{msg.reasoning}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiResponding && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span>Multilingual AI retrieving authorized product &amp; company knowledge...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Multilingual Quick Prompt Chips */}
            <div className="px-5 py-2 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 mr-1 text-[10px] font-semibold uppercase tracking-wider">Test Language Switching:</span>
              <button
                type="button"
                onClick={() => handleSendTestMessage('What are your enterprise package prices and support levels?')}
                className="px-2 py-0.8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center gap-1"
              >
                <span>🇺🇸</span>
                <span>English Pricing</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Hola, ¿cuánto cuesta su plataforma y cómo agendo una demostración ejecutiva?')}
                className="px-2 py-0.8 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer flex items-center gap-1"
              >
                <span>🇲🇽</span>
                <span>Español Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Bonjour, pouvez-vous me présenter vos solutions infonuagiques et tarifs ?')}
                className="px-2 py-0.8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 cursor-pointer flex items-center gap-1"
              >
                <span>🇫🇷</span>
                <span>Français Tarifs</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Guten Tag, wie hoch sind die monatlichen Kosten für Ihr System?')}
                className="px-2 py-0.8 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 cursor-pointer flex items-center gap-1"
              >
                <span>🇩🇪</span>
                <span>Deutsch Kosten</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('नमस्ते, क्या आप मुझे अपनी एंटरप्राइज सर्विस की कीमतों के बारे में बता सकते हैं?')}
                className="px-2 py-0.8 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 cursor-pointer flex items-center gap-1"
              >
                <span>🇮🇳</span>
                <span>हिन्दी जानकारी</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendTestMessage('Olá! Gostaria de agendar uma reunião sobre segurança e integração.')}
                className="px-2 py-0.8 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 cursor-pointer flex items-center gap-1"
              >
                <span>🇧🇷</span>
                <span>Português</span>
              </button>
            </div>

            {/* Studio Bottom Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
              {speechError && (
                <div className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1 rounded">
                  {speechError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                  title={isListening ? 'Stop Listening' : `Speak into Microphone in ${getLanguageByCode(activeTestingLangCode).name}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="text-[10px] font-mono hidden sm:inline">
                    {getLanguageByCode(activeTestingLangCode).flag} STT
                  </span>
                </button>

                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                  placeholder={
                    isListening
                      ? `Listening in ${getLanguageByCode(activeTestingLangCode).name}... speak now`
                      : `Type a question in any language (e.g. English, Spanish, French, German, Hindi)...`
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleSendTestMessage()}
                  disabled={isAiResponding || !testInput.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CREATE / EDIT ASSISTANT MODAL */}
      {/* ------------------------------------------------------------------ */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingAssistant.id ? 'Configure Voice Assistant' : 'Create New AI Voice Agent'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tune voice characteristics, sales objectives, and qualification logic.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
              <button
                onClick={() => setActiveEditorTab('persona')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer shrink-0 ${
                  activeEditorTab === 'persona'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Agent Role &amp; Identity
              </button>
              <button
                onClick={() => setActiveEditorTab('multilingual')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeEditorTab === 'multilingual'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Languages &amp; Regional Voice</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-700">
                  {editingAssistant.supportedLanguages?.length || 10}
                </span>
              </button>
              <button
                onClick={() => setActiveEditorTab('instructions')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer shrink-0 ${
                  activeEditorTab === 'instructions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sales Script &amp; Greeting
              </button>
              <button
                onClick={() => setActiveEditorTab('qualification')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer shrink-0 ${
                  activeEditorTab === 'qualification'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Qualification Questions
              </button>
              <button
                onClick={() => setActiveEditorTab('handoff')}
                className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer shrink-0 ${
                  activeEditorTab === 'handoff'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Human Handoff Rules
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
              {activeEditorTab === 'multilingual' && (
                <MultilingualVoiceSettings
                  assistant={editingAssistant}
                  onChange={(updates) => setEditingAssistant((prev) => ({ ...prev, ...updates }))}
                />
              )}

              {activeEditorTab === 'persona' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Agent Name</label>
                      <input
                        type="text"
                        value={editingAssistant.name || ''}
                        onChange={(e) => setEditingAssistant({ ...editingAssistant, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Specialized Role</label>
                      <input
                        type="text"
                        value={editingAssistant.role || ''}
                        onChange={(e) => setEditingAssistant({ ...editingAssistant, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">Voice Profile</label>
                        <button
                          type="button"
                          onClick={() => {
                            playVoiceText(
                              editingAssistant.greeting || 'Hi there! This is Sarah, your AI sales specialist. How can I assist your team today?',
                              {
                                voice: editingAssistant.voice || 'nova',
                                voiceGender: editingAssistant.voiceGender || 'female',
                              }
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          title="Click to preview this voice profile"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      </div>
                      <select
                        value={editingAssistant.voice || 'nova'}
                        onChange={(e) => {
                          const v = e.target.value;
                          const autoGender = v === 'onyx' ? 'male' : (v === 'alloy' ? 'neutral' : 'female');
                          setEditingAssistant({
                            ...editingAssistant,
                            voice: v,
                            voiceGender: autoGender,
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="nova">Nova (Female &bull; Natural US English)</option>
                        <option value="shimmer">Shimmer (Female &bull; Dynamic &amp; Expressive)</option>
                        <option value="alloy_female">Alloy (Female &bull; Modern Consultative)</option>
                        <option value="alloy">Alloy (Neutral &bull; Balanced)</option>
                        <option value="onyx">Onyx (Male &bull; Deep US English)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Voice Gender</label>
                      <select
                        value={editingAssistant.voiceGender || 'female'}
                        onChange={(e) => setEditingAssistant({ ...editingAssistant, voiceGender: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="female">Female Voice (Warm &amp; Articulate)</option>
                        <option value="male">Male Voice (Deep &amp; Authoritative)</option>
                        <option value="neutral">Neutral Voice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Conversational Tone</label>
                      <select
                        value={editingAssistant.tone || 'consultative'}
                        onChange={(e) => setEditingAssistant({ ...editingAssistant, tone: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="consultative">Consultative &amp; Solution-Oriented</option>
                        <option value="professional">Strictly Professional &amp; Crisp</option>
                        <option value="warm">Warm, Empathetic &amp; Friendly</option>
                        <option value="direct">Direct &amp; Fast-Paced (Logistics/Dispatch)</option>
                        <option value="persuasive">Persuasive High-Velocity Sales</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Personality Prompt</label>
                    <textarea
                      rows={2}
                      value={editingAssistant.personality || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, personality: e.target.value })}
                      placeholder="e.g. Articulate, patient, consultative, highly knowledgeable about cloud pipelines..."
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {activeEditorTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone Opening Greeting</label>
                    <textarea
                      rows={2}
                      value={editingAssistant.greeting || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, greeting: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Sales Objective</label>
                    <input
                      type="text"
                      value={editingAssistant.salesObjective || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, salesObjective: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">System Instructions</label>
                    <textarea
                      rows={4}
                      value={editingAssistant.instructions || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, instructions: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Call Ending Wrap-up</label>
                    <input
                      type="text"
                      value={editingAssistant.callEndingBehavior || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, callEndingBehavior: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {activeEditorTab === 'qualification' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Questions the AI Must Ask Naturally During the Conversation:
                  </div>

                  {(editingAssistant.qualificationQuestions || []).map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...(editingAssistant.qualificationQuestions || [])];
                          updated[idx] = e.target.value;
                          setEditingAssistant({ ...editingAssistant, qualificationQuestions: updated });
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingAssistant.qualificationQuestions || []).filter((_, i) => i !== idx);
                          setEditingAssistant({ ...editingAssistant, qualificationQuestions: updated });
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAssistant({
                        ...editingAssistant,
                        qualificationQuestions: [...(editingAssistant.qualificationQuestions || []), 'What is your budget?'],
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Qualification Checkpoint</span>
                  </button>
                </div>
              )}

              {activeEditorTab === 'handoff' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Human Transfer Triggers &amp; Routing Rules
                    </label>
                    <textarea
                      rows={3}
                      value={editingAssistant.humanHandoffRules || ''}
                      onChange={(e) => setEditingAssistant({ ...editingAssistant, humanHandoffRules: e.target.value })}
                      placeholder="e.g. When caller asks for a human, expresses severe frustration, or requests custom SLA legal review..."
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      <span>Live Transfer Telephony Spec</span>
                    </div>
                    <p className="leading-relaxed">
                      When triggered, the AI pauses and issues a SIP REFER warm transfer to your target ring group while simultaneously dispatching a high-priority Slack notification.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssistant}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs"
              >
                Save Assistant Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
