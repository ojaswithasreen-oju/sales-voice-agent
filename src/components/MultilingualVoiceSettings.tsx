import React, { useState } from 'react';
import {
  Globe,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Languages,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption, getLanguageByCode } from '../lib/languages';
import { playVoiceText } from '../lib/audioVoice';
import type { Assistant } from '../types';

interface MultilingualVoiceSettingsProps {
  assistant: Partial<Assistant>;
  onChange: (updates: Partial<Assistant>) => void;
}

export const MultilingualVoiceSettings: React.FC<MultilingualVoiceSettingsProps> = ({
  assistant,
  onChange,
}) => {
  const [langSearch, setLangSearch] = useState('');
  const [previewLanguageCode, setPreviewLanguageCode] = useState(
    assistant.primaryLanguageCode || 'en-US'
  );
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'voice' | 'languages' | 'greetings'>('voice');

  const selectedCodes = new Set<string>(
    assistant.supportedLanguages && assistant.supportedLanguages.length > 0
      ? assistant.supportedLanguages
      : ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN']
  );

  const primaryLang = getLanguageByCode(assistant.primaryLanguageCode || 'en-US');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.region.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const toggleLanguage = (code: string) => {
    const updated = new Set(selectedCodes);
    if (updated.has(code)) {
      // Don't allow removing primary language
      if (code === (assistant.primaryLanguageCode || 'en-US')) return;
      updated.delete(code);
    } else {
      updated.add(code);
    }
    onChange({ supportedLanguages: Array.from(updated) });
  };

  const selectTopTen = () => {
    const top10 = ['en-US', 'es-MX', 'fr-FR', 'de-DE', 'pt-BR', 'hi-IN', 'ja-JP', 'zh-CN', 'it-IT', 'ar-SA'];
    onChange({ supportedLanguages: top10 });
  };

  const selectAll = () => {
    onChange({ supportedLanguages: SUPPORTED_LANGUAGES.map((l) => l.code) });
  };

  const handlePreviewVoice = (langCodeToPreview?: string) => {
    const targetCode = langCodeToPreview || previewLanguageCode || assistant.primaryLanguageCode || 'en-US';
    const langObj = getLanguageByCode(targetCode);

    // Check if custom localized greeting exists
    const greetingText =
      (assistant.localizedGreetings && assistant.localizedGreetings[targetCode]) ||
      (targetCode === assistant.primaryLanguageCode ? assistant.greeting : null) ||
      langObj.sampleGreeting;

    playVoiceText(greetingText, {
      lang: targetCode,
      voice: assistant.voice || 'nova',
      voiceGender: assistant.voiceGender || 'female',
      rate: assistant.speakingSpeed ?? 1.0,
      pitch: assistant.pitch ?? 1.05,
      onStart: () => setIsPlayingPreview(true),
      onEnd: () => setIsPlayingPreview(false),
      onError: () => setIsPlayingPreview(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('voice')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeSubTab === 'voice'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Voice, Accent &amp; Speed
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('languages')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'languages'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Supported Languages</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeSubTab === 'languages' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {selectedCodes.size}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('greetings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activeSubTab === 'greetings'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Localized Greetings
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: VOICE, ACCENT, SPEED, TONE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'voice' && (
        <div className="space-y-5">
          {/* Primary Language & Accent Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Spoken Language
              </label>
              <select
                value={assistant.primaryLanguageCode || 'en-US'}
                onChange={(e) => {
                  const newCode = e.target.value;
                  const chosen = getLanguageByCode(newCode);
                  const updatedSupported = new Set(selectedCodes);
                  updatedSupported.add(newCode);

                  onChange({
                    primaryLanguageCode: newCode,
                    language: chosen.name,
                    accent: chosen.accent,
                    supportedLanguages: Array.from(updatedSupported),
                  });
                  setPreviewLanguageCode(newCode);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} &bull; {lang.nativeName} ({lang.region})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Default language when caller has not specified or detected another language.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Regional Accent &amp; Dialect
              </label>
              <input
                type="text"
                value={assistant.accent || primaryLang.accent}
                onChange={(e) => onChange({ accent: e.target.value })}
                placeholder="e.g. American Standard, British RP, Mexican Spanish..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Injected into conversational prompts for natural regional phonetics and idioms.
              </p>
            </div>
          </div>

          {/* Voice Profile, Gender & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Voice Model Profile
              </label>
              <select
                value={assistant.voice || 'nova'}
                onChange={(e) => {
                  const v = e.target.value;
                  const autoGender = v === 'onyx' ? 'male' : (v === 'alloy' ? 'neutral' : 'female');
                  onChange({
                    voice: v,
                    voiceGender: autoGender,
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="nova">Nova (Female &bull; Warm &amp; Clear)</option>
                <option value="shimmer">Shimmer (Female &bull; Articulate &amp; Dynamic)</option>
                <option value="alloy_female">Alloy (Female &bull; Consultative)</option>
                <option value="alloy">Alloy (Balanced Neutral)</option>
                <option value="onyx">Onyx (Male &bull; Deep Executive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Voice Gender
              </label>
              <select
                value={assistant.voiceGender || 'female'}
                onChange={(e) => onChange({ voiceGender: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="female">Female Voice (Natural Professional)</option>
                <option value="male">Male Voice (Executive Sales)</option>
                <option value="neutral">Neutral Voice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Conversational Tone
              </label>
              <select
                value={assistant.tone || 'consultative'}
                onChange={(e) => onChange({ tone: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="consultative">Consultative &amp; Solution-Driven</option>
                <option value="professional">Crisp &amp; Professional</option>
                <option value="warm">Warm, Empathetic &amp; Friendly</option>
                <option value="direct">Direct &amp; Fast-Paced (Inbound Dispatch)</option>
                <option value="persuasive">High-Velocity Sales Persuasion</option>
              </select>
            </div>
          </div>

          {/* Speaking Speed & Pitch Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-100/70 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Speaking Speed (Pacing)
                </label>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {(assistant.speakingSpeed ?? 1.0).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.50"
                step="0.05"
                value={assistant.speakingSpeed ?? 1.0}
                onChange={(e) => onChange({ speakingSpeed: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.75x (Deliberate)</span>
                <span>1.0x (Normal)</span>
                <span>1.5x (Fast)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Voice Pitch Modulation
                </label>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {(assistant.pitch ?? 1.05).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.25"
                step="0.05"
                value={assistant.pitch ?? 1.05}
                onChange={(e) => onChange({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.80 (Deeper)</span>
                <span>1.0 (Balanced)</span>
                <span>1.25 (Brighter)</span>
              </div>
            </div>
          </div>

          {/* Real-time Voice Audio Test Card */}
          <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Interactive Audio Preview ({primaryLang.flag} {primaryLang.name})
                </div>
                <div className="text-[11px] text-slate-500">
                  Speed: {(assistant.speakingSpeed ?? 1.0).toFixed(2)}x &bull; Pitch: {(assistant.pitch ?? 1.05).toFixed(2)} &bull; Accent: {assistant.accent || primaryLang.accent}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handlePreviewVoice()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              {isPlayingPreview ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Playing Preview...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Voice Audio</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: SUPPORTED LANGUAGES & AUTO-DETECTION */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'languages' && (
        <div className="space-y-4">
          {/* Intelligence Policies: Auto-detect & Mid-call switching */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={assistant.autoDetectLanguage !== false}
                onChange={(e) => onChange({ autoDetectLanguage: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Automatic Customer Language Detection</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  When enabled, the assistant recognizes the caller's spoken language from speech-to-text input and immediately replies in the same language.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={assistant.allowCodeSwitching !== false}
                onChange={(e) => onChange({ allowCodeSwitching: e.target.checked })}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mid-Call Code-Switching</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Allows callers to switch languages at any point during the call (e.g. from English to Spanish or French), responding seamlessly without interruption.
                </div>
              </div>
            </label>
          </div>

          {/* Quick Selection Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search languages or regions..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white w-56"
              />
              <span className="text-xs text-slate-500 font-medium">
                {selectedCodes.size} of {SUPPORTED_LANGUAGES.length} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectTopTen}
                className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
              >
                Top Global 10
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Select All
              </button>
            </div>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedCodes.has(lang.code);
              const isPrimary = lang.code === (assistant.primaryLanguageCode || 'en-US');

              return (
                <div
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{lang.name}</span>
                      {isPrimary && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{lang.region}</span>
                      <span className="font-mono">{lang.bcp47}</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: LOCALIZED GREETINGS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'greetings' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Multilingual Greetings:</span> Provide custom introductory greetings for each authorized language. If left blank, the assistant uses our pre-tuned high-converting enterprise sales greetings.
            </div>
          </div>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {(Array.from(selectedCodes) as string[]).map((code) => {
              const lang = getLanguageByCode(code);
              const customGreeting =
                (assistant.localizedGreetings && assistant.localizedGreetings[code]) ||
                (code === (assistant.primaryLanguageCode || 'en-US') ? assistant.greeting : '') ||
                '';

              return (
                <div key={code} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-xs font-bold text-slate-900">{lang.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({lang.bcp47})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(code)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Hear Greeting</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={customGreeting}
                    placeholder={lang.sampleGreeting}
                    onChange={(e) => {
                      const updatedGreetings = {
                        ...(assistant.localizedGreetings || {}),
                        [code]: e.target.value,
                      };
                      onChange({ localizedGreetings: updatedGreetings });
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
