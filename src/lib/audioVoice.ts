/**
 * Multilingual Audio Voice Synthesis (TTS) & Speech-to-Text (STT) Service
 * Supports multiple languages, regional accents, voice genders, speed, and pitch.
 */

import { getLanguageByCode } from './languages';

export interface PlayVoiceOptions {
  lang?: string;
  voice?: string;
  voiceGender?: 'female' | 'male' | 'neutral';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch {
      cachedVoices = [];
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Finds the most natural voice for the target language and gender
 */
export function findMatchingVoice(langCode?: string, gender: 'female' | 'male' | 'neutral' = 'female'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = getLanguageByCode(langCode || 'en-US');
  const langPrefix = targetLang.bcp47.split('-')[0].toLowerCase();
  const fullBcp47 = targetLang.bcp47.toLowerCase();

  // Filter voices matching the language code (exact BCP-47 or general language prefix)
  const langMatches = voices.filter((v) => {
    const vLang = v.lang.toLowerCase();
    return vLang === fullBcp47 || vLang.startsWith(langPrefix);
  });

  const voicePool = langMatches.length > 0 ? langMatches : voices;
  const hints = targetLang.voiceGenderHints;

  if (gender === 'female') {
    const femaleKeywords = hints?.femaleVoiceKeywords || [
      'female', 'samantha', 'zira', 'jenny', 'aria', 'ava', 'victoria', 'karen',
      'allison', 'lucia', 'hortense', 'katja', 'francisca', 'nanami', 'xiaoxiao',
      'swara', 'zariyah', 'colette', 'sunhi', 'zofia', 'emel'
    ];

    for (const keyword of femaleKeywords) {
      const match = voicePool.find(
        (v) => v.name.toLowerCase().includes(keyword) || (v as any).gender === 'female'
      );
      if (match) return match;
    }
  } else if (gender === 'male') {
    const maleKeywords = hints?.maleVoiceKeywords || [
      'male', 'david', 'mark', 'george', 'guy', 'jorge', 'paul', 'stefan',
      'antonio', 'keita', 'yunjian', 'madhav', 'hamed', 'maarten', 'insoo', 'marek', 'ahmet'
    ];

    for (const keyword of maleKeywords) {
      const match = voicePool.find(
        (v) => v.name.toLowerCase().includes(keyword) || (v as any).gender === 'male'
      );
      if (match) return match;
    }
  }

  // Fallback: Return first language match, or first overall voice
  return langMatches[0] || voices[0] || null;
}

/**
 * Speaks text using the designated assistant voice profile, language, speed, and pitch
 */
export function playVoiceText(text?: string | null, options: PlayVoiceOptions = {}) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    if (options.onEnd) options.onEnd();
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onStart) options.onStart();
    setTimeout(() => {
      if (options.onEnd) options.onEnd();
    }, 1500);
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean markdown/symbols from spoken text
    const cleanText = String(text || '')
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (options.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set utterance language
    const langConfig = getLanguageByCode(options.lang || 'en-US');
    utterance.lang = langConfig.bcp47;

    // Determine voice gender
    const voiceGender = options.voiceGender || (options.voice === 'onyx' ? 'male' : 'female');
    const matchedVoice = findMatchingVoice(langConfig.code, voiceGender);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set pitch & speaking speed rate
    const defaultPitch = voiceGender === 'female' ? 1.05 : 0.95;
    utterance.pitch = options.pitch ?? defaultPitch;
    utterance.rate = options.rate ?? 1.0;

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      if (options.onError) options.onError(e);
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech playback failed:', err);
    if (options.onEnd) options.onEnd();
  }
}

/**
 * Stops any currently playing speech synthesis
 */
export function cancelVoice() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speech Recognition (STT) interface
 */
export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

let activeRecognitionInstance: any = null;

/**
 * Starts real-time Speech-to-Text listening in the chosen language
 */
export function startSpeechRecognition(options: SpeechRecognitionOptions): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    console.warn('Web Speech Recognition API is not supported in this browser environment.');
    if (options.onError) options.onError({ error: 'not-supported' });
    return { stop: () => {} };
  }

  try {
    if (activeRecognitionInstance) {
      try {
        activeRecognitionInstance.abort();
      } catch {}
      activeRecognitionInstance = null;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();

    const targetLang = getLanguageByCode(options.lang || 'en-US');
    recognition.lang = targetLang.bcp47;
    recognition.interimResults = true;
    recognition.continuous = options.continuous ?? false;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const resultText = finalTranscript || interimTranscript;
      if (resultText.trim()) {
        options.onResult(resultText.trim(), !!finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error/event:', event);
      if (options.onError) options.onError(event);
    };

    recognition.onend = () => {
      activeRecognitionInstance = null;
      if (options.onEnd) options.onEnd();
    };

    recognition.start();
    activeRecognitionInstance = recognition;

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {}
        activeRecognitionInstance = null;
      },
    };
  } catch (err) {
    console.warn('Failed to start speech recognition:', err);
    if (options.onError) options.onError(err);
    return { stop: () => {} };
  }
}

export function stopSpeechRecognition() {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.stop();
    } catch {}
    activeRecognitionInstance = null;
  }
}
