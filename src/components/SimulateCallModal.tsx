import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Send,
  User,
  Bot,
  Clock,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Globe,
  Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { playVoiceText, cancelVoice } from '../lib/audioVoice';
import { getLanguageByCode, AVAILABLE_LANGUAGES } from '../lib/languages';
import type { Assistant, PhoneNumber } from '../types';

interface SimulateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistants: Assistant[];
  phoneNumbers: PhoneNumber[];
  onCallCompleted: () => void;
}

export const SimulateCallModal: React.FC<SimulateCallModalProps> = ({
  isOpen,
  onClose,
  assistants,
  phoneNumbers,
  onCallCompleted,
}) => {
  const [callerName, setCallerName] = useState('David Miller');
  const [callerPhone, setCallerPhone] = useState('+1 (312) 555-0812');
  const [callerCompany, setCallerCompany] = useState('Nexus Retail Corp');
  const [selectedAssistantId, setSelectedAssistantId] = useState(assistants[0]?.id || '');
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);

  // Turn-by-turn dialogue
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; languageBadge?: string }>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Multilingual state
  const activeAssistant = assistants.find((a) => a.id === selectedAssistantId) || assistants[0];
  const [activeCallLang, setActiveCallLang] = useState<string>(activeAssistant?.primaryLanguageCode || 'en-US');
  const [languageNotice, setLanguageNotice] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (activeAssistant?.primaryLanguageCode) {
      setActiveCallLang(activeAssistant.primaryLanguageCode);
    }
  }, [activeAssistant]);

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setCallState('dialing');
    setCallSeconds(0);
    setLanguageNotice(null);

    const initialLangCode = activeAssistant?.primaryLanguageCode || 'en-US';
    setActiveCallLang(initialLangCode);

    // Simulate 1.8 seconds of telephone ringing tone, then connect
    setTimeout(() => {
      setCallState('connected');
      const greeting = activeAssistant?.greeting || 'Hello! Thank you for calling. How can I help you today?';
      const langObj = getLanguageByCode(initialLangCode);
      const initialMessages = [{
        role: 'assistant' as const,
        text: greeting,
        languageBadge: `${langObj.flag} ${langObj.name}`,
      }];
      setMessages(initialMessages);

      // Speak greeting with regional voice & accent
      playVoiceText(greeting, {
        lang: initialLangCode,
        voice: activeAssistant?.voice,
        voiceGender: activeAssistant?.voiceGender || (activeAssistant?.voice === 'onyx' ? 'male' : 'female'),
        rate: activeAssistant?.speakingSpeed || 1.0,
        pitch: activeAssistant?.pitch || 1.05,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }, 1800);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || currentInput;
    if (!text.trim()) return;

    const nextHistory = [...messages, { role: 'user' as const, text }];
    setMessages(nextHistory);
    setCurrentInput('');
    setIsAiThinking(true);

    try {
      const res = await api.testAssistantVoice({
        assistantId: selectedAssistantId,
        userMessage: text,
        conversationHistory: nextHistory,
        currentLanguage: activeCallLang,
      });

      const responseLang = res.detectedLanguage || activeCallLang;
      const langObj = getLanguageByCode(responseLang);

      if (res.languageSwitched || (res.detectedLanguage && res.detectedLanguage !== activeCallLang)) {
        setActiveCallLang(responseLang);
        setLanguageNotice(`🌐 Customer language detected: Switched naturally to ${langObj.flag} ${langObj.name}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.text,
          languageBadge: `${langObj.flag} ${langObj.name}`,
        },
      ]);

      // Speak AI response with gender-aware & language-aligned voice synthesis
      playVoiceText(res.text, {
        lang: responseLang,
        voice: activeAssistant?.voice,
        voiceGender: res.voiceGender || activeAssistant?.voiceGender || 'female',
        rate: res.speakingSpeed || activeAssistant?.speakingSpeed || 1.0,
        pitch: res.pitch || activeAssistant?.pitch || 1.05,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } catch {
      const langObj = getLanguageByCode(activeCallLang);
      const fallbackReply = "I completely understand your requirements. We can configure that for your enterprise workflow. Would you like me to reserve a demo slot for your team?";
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackReply,
          languageBadge: `${langObj.flag} ${langObj.name}`,
        },
      ]);

      playVoiceText(fallbackReply, {
        lang: activeCallLang,
        voice: activeAssistant?.voice,
        voiceGender: activeAssistant?.voiceGender || 'female',
        rate: activeAssistant?.speakingSpeed || 1.0,
        pitch: activeAssistant?.pitch || 1.05,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  // Web Speech STT Microphone in the caller's active language
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
      const activeObj = getLanguageByCode(activeCallLang);
      recognition.lang = activeObj.bcp47 || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechError(`STT notice: ${event.error}`);
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

  const handleEndCall = async () => {
    setCallState('ended');
    cancelVoice();

    try {
      // Send the conversation to the backend call simulation endpoint
      await api.simulateCall({
        assistantId: selectedAssistantId,
        callerName,
        callerPhone,
        callerCompany,
        transcriptTurns: messages.map(m => ({ role: m.role, text: m.text })),
      });
      onCallCompleted();
    } catch (err) {
      console.error('Failed to persist simulated call', err);
    }
  };

  const handleReset = () => {
    setCallState('idle');
    setMessages([]);
    setCallSeconds(0);
    setLanguageNotice(null);
  };

  const activeLangDetails = getLanguageByCode(activeCallLang);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Call Banner Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Inbound Call Simulator</span>
                {callState === 'connected' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Autonomous Multilingual Voice Agent</span>
                <span>&bull;</span>
                <span className="text-indigo-300 font-mono flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {activeLangDetails.flag} {activeLangDetails.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callState === 'connected' && (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{formatTimer(callSeconds)}</span>
              </span>
            )}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* State 1: Configure / Dial */}
        {callState === 'idle' && (
          <div className="p-6 space-y-4">
            <div className="text-center py-2">
              <h3 className="text-base font-bold text-slate-900">Simulate Prospect Calling Your Company</h3>
              <p className="text-xs text-slate-500 mt-1">
                Experience real-time multilingual speech-to-text, knowledge grounding, and instant natural language switching.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Answering AI Agent</label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role} &bull; Voice: {a.voice} &bull; Lang: {a.language || 'English'})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-semibold text-indigo-900">Initial Call Language:</span>{' '}
                  <span className="text-indigo-700">{activeLangDetails.flag} {activeLangDetails.name}</span>
                </div>
              </div>
              <select
                value={activeCallLang}
                onChange={(e) => setActiveCallLang(e.target.value)}
                className="text-[11px] bg-white border border-indigo-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
              >
                {AVAILABLE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caller Name</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caller Company</label>
                <input
                  type="text"
                  value={callerCompany}
                  onChange={(e) => setCallerCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Caller Phone Number</label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Place Inbound Phone Call</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Dialing / Ringing */}
        {callState === 'dialing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ringing...</h3>
            <p className="text-xs text-slate-500 font-mono">
              Connecting {callerPhone} &rarr; {activeAssistant?.name} ({activeLangDetails.flag} {activeLangDetails.name})
            </p>
            <div className="text-[11px] text-slate-400">
              Low-latency SIP WebRTC line initializing with Multilingual Audio Pipeline...
            </div>
          </div>
        )}

        {/* State 3: Call Connected & In Progress */}
        {callState === 'connected' && (
          <div className="flex flex-col flex-1 h-[480px]">
            {/* Caller Mini-Bar */}
            <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{callerName}</span>
                <span className="text-slate-500">({callerCompany})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  <span>{activeLangDetails.flag} {activeLangDetails.name}</span>
                </span>
                {isSpeaking ? (
                  <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>Agent Speaking</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium">Call Live</span>
                )}
              </div>
            </div>

            {/* Language Notice Banner */}
            {languageNotice && (
              <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>{languageNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLanguageNotice(null)}
                  className="text-amber-700 hover:text-amber-950 font-bold text-[10px] cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Conversation Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-75 mb-0.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span>{m.role === 'user' ? `${callerName} (You)` : activeAssistant?.name}</span>
                        {m.languageBadge && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-normal">
                            {m.languageBadge}
                          </span>
                        )}
                      </div>
                      {m.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => {
                            playVoiceText(m.text, {
                              lang: activeCallLang,
                              voice: activeAssistant?.voice,
                              voiceGender: activeAssistant?.voiceGender || 'female',
                              rate: activeAssistant?.speakingSpeed || 1.0,
                              pitch: activeAssistant?.pitch || 1.05,
                              onStart: () => setIsSpeaking(true),
                              onEnd: () => setIsSpeaking(false),
                            });
                          }}
                          className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                          title="Replay Voice in Caller Language"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    <span>Multilingual AI reasoning from company documents...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Multilingual & Smart Handoff Caller Prompt Chips */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 font-semibold self-center">Quick Triggers:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('We are ready to buy right now. Can I speak with an executive salesperson to close today?')}
                className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer font-semibold"
                title="Test Smart Handoff: Ready to Buy"
              >
                🔥 Ready to Buy (Handoff)
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Can I please speak to a human representative?')}
                className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer font-semibold"
                title="Test Smart Handoff: Human Requested"
              >
                👤 Request Human Rep
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('We have 350 seats. Can we negotiate a volume discount and custom SLA?')}
                className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-pointer font-semibold"
                title="Test Smart Handoff: Pricing Negotiation"
              >
                💰 Pricing Negotiation
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('¿Tienen soporte técnico disponible las 24 horas y qué precio tiene?')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              >
                🇲🇽 Español
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Pouvez-vous m\'expliquer comment vos intégrations fonctionnent ?')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              >
                🇫🇷 Français
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('नमस्ते, आपकी कंपनी की सेवाएं हमारे बिज़नेस के लिए कैसे काम करेंगी?')}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              >
                🇮🇳 हिन्दी
              </button>
            </div>

            {/* In-Call Controls */}
            <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-1.5">
              {speechError && (
                <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {speechError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                  title={isListening ? 'Stop Mic' : `Speak in ${activeLangDetails.name}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="text-[9px] font-mono hidden sm:inline">{activeLangDetails.flag}</span>
                </button>

                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? `Listening in ${activeLangDetails.name}...` : `Speak or type caller response in any language...`}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isAiThinking || !currentInput.trim()}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Hang Up</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Call Ended & Processed */}
        {callState === 'ended' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Call Ended &amp; Multilingual Transcript Logged</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Duration: <b>{formatTimer(callSeconds)}</b>. Final dialogue language: <b>{activeLangDetails.flag} {activeLangDetails.name}</b>. Turn transcript, sentiment scores, and buyer qualification have been logged to your Call Records &amp; CRM.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Simulate Another Call
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-xs"
              >
                View in Call Records &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
