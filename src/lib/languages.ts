export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  accent: string;
  sampleGreeting: string;
  bcp47: string;
  voiceGenderHints?: {
    femaleVoiceKeywords: string[];
    maleVoiceKeywords: string[];
  };
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // English
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    region: 'North America',
    accent: 'American Standard',
    sampleGreeting: 'Hi there! Thank you for calling Acme Cloud Corp. This is Sarah, your AI sales specialist. How can I assist your team today?',
    bcp47: 'en-US',
    voiceGenderHints: {
      femaleVoiceKeywords: ['samantha', 'zira', 'jenny', 'aria', 'ava', 'victoria', 'allison', 'karen', 'female'],
      maleVoiceKeywords: ['david', 'mark', 'george', 'guy', 'male'],
    },
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    region: 'Europe',
    accent: 'British Received Pronunciation',
    sampleGreeting: 'Good day! Thank you for contacting Acme Cloud Corp. My name is Sarah. How may I assist you today?',
    bcp47: 'en-GB',
    voiceGenderHints: {
      femaleVoiceKeywords: ['libby', 'sonia', 'mia', 'hazel', 'serena', 'female'],
      maleVoiceKeywords: ['ryan', 'oliver', 'george', 'male'],
    },
  },
  {
    code: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    flag: '🇮🇳',
    region: 'South Asia',
    accent: 'Indian English',
    sampleGreeting: 'Hello and welcome to Acme Cloud Corp! I am Sarah, your AI sales specialist. How can I assist your enterprise today?',
    bcp47: 'en-IN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['neerja', 'heera', 'swara', 'female'],
      maleVoiceKeywords: ['prabhat', 'madhav', 'male'],
    },
  },
  {
    code: 'en-AU',
    name: 'English (Australia)',
    nativeName: 'English (Australia)',
    flag: '🇦🇺',
    region: 'Oceania',
    accent: 'Australian',
    sampleGreeting: 'G\'day! Thanks for calling Acme Cloud Corp. Sarah here, your AI sales advisor. How can I help your business today?',
    bcp47: 'en-AU',
    voiceGenderHints: {
      femaleVoiceKeywords: ['natasha', 'catherine', 'karen', 'female'],
      maleVoiceKeywords: ['william', 'russell', 'male'],
    },
  },
  {
    code: 'en-CA',
    name: 'English (Canada)',
    nativeName: 'English (Canada)',
    flag: '🇨🇦',
    region: 'North America',
    accent: 'Canadian',
    sampleGreeting: 'Hello! Thank you for calling Acme Cloud Corp. This is Sarah. How can I assist your team today?',
    bcp47: 'en-CA',
    voiceGenderHints: {
      femaleVoiceKeywords: ['clara', 'linda', 'female'],
      maleVoiceKeywords: ['liam', 'male'],
    },
  },

  // Spanish
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    flag: '🇲🇽',
    region: 'Latin America',
    accent: 'Mexican Latin American',
    sampleGreeting: '¡Hola! Gracias por llamar a Acme Cloud Corp. Le atiende Sarah, su especialista en soluciones en la nube. ¿En qué puedo apoyar a su empresa hoy?',
    bcp47: 'es-MX',
    voiceGenderHints: {
      femaleVoiceKeywords: ['dalia', 'sabina', 'paulina', 'hilda', 'female'],
      maleVoiceKeywords: ['jorge', 'raul', 'male'],
    },
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español (España)',
    flag: '🇪🇸',
    region: 'Europe',
    accent: 'Castilian',
    sampleGreeting: '¡Hola! Bienvenido a Acme Cloud Corp. Soy Sarah, especialista de ventas de IA. ¿Cómo puedo ayudarle a optimizar sus procesos?',
    bcp47: 'es-ES',
    voiceGenderHints: {
      femaleVoiceKeywords: ['elena', 'laura', 'monica', 'lucia', 'female'],
      maleVoiceKeywords: ['enrique', 'alvaro', 'male'],
    },
  },
  {
    code: 'es-US',
    name: 'Spanish (United States)',
    nativeName: 'Español (EE. UU.)',
    flag: '🇺🇸',
    region: 'North America',
    accent: 'US Hispanic',
    sampleGreeting: '¡Saludos! Gracias por comunicarse con Acme Cloud Corp. Habla Sarah, su asesora de tecnología. ¿Cómo podemos colaborar hoy?',
    bcp47: 'es-US',
    voiceGenderHints: {
      femaleVoiceKeywords: ['paloma', 'alondra', 'female'],
      maleVoiceKeywords: ['alonso', 'male'],
    },
  },
  {
    code: 'es-AR',
    name: 'Spanish (Argentina)',
    nativeName: 'Español (Argentina)',
    flag: '🇦🇷',
    region: 'South America',
    accent: 'Rioplatense',
    sampleGreeting: '¡Hola! Gracias por comunicarte con Acme Cloud Corp. Te habla Sarah. ¿Cómo podemos potenciar la infraestructura de tu equipo hoy?',
    bcp47: 'es-AR',
    voiceGenderHints: {
      femaleVoiceKeywords: ['elena', 'paula', 'female'],
      maleVoiceKeywords: ['tomas', 'male'],
    },
  },

  // French
  {
    code: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français (France)',
    flag: '🇫🇷',
    region: 'Europe',
    accent: 'Parisian Metropolitan',
    sampleGreeting: 'Bonjour et bienvenue chez Acme Cloud Corp ! Je m\'appelle Sarah, votre conseillère commerciale IA. En quoi puis-je vous être utile aujourd\'hui ?',
    bcp47: 'fr-FR',
    voiceGenderHints: {
      femaleVoiceKeywords: ['hortense', 'julie', 'denise', 'celine', 'amelie', 'female'],
      maleVoiceKeywords: ['paul', 'henri', 'alain', 'male'],
    },
  },
  {
    code: 'fr-CA',
    name: 'French (Canada)',
    nativeName: 'Français (Canada)',
    flag: '🇨🇦',
    region: 'North America',
    accent: 'Québécois',
    sampleGreeting: 'Bonjour ! Merci de contacter Acme Cloud Corp. Ici Sarah, votre spécialiste des solutions infonuagiques. Comment puis-je vous aider aujourd\'hui ?',
    bcp47: 'fr-CA',
    voiceGenderHints: {
      femaleVoiceKeywords: ['sylvie', 'chantal', 'female'],
      maleVoiceKeywords: ['jean', 'antoine', 'male'],
    },
  },

  // German
  {
    code: 'de-DE',
    name: 'German (Germany)',
    nativeName: 'Deutsch (Deutschland)',
    flag: '🇩🇪',
    region: 'Europe',
    accent: 'Standard Hochdeutsch',
    sampleGreeting: 'Guten Tag! Herzlich willkommen bei Acme Cloud Corp. Mein Name ist Sarah, Ihre KI-Vertriebsexpertin. Wie darf ich Ihr Unternehmen heute unterstützen?',
    bcp47: 'de-DE',
    voiceGenderHints: {
      femaleVoiceKeywords: ['katja', 'hedda', 'marlena', 'anna', 'female'],
      maleVoiceKeywords: ['stefan', 'bernd', 'male'],
    },
  },
  {
    code: 'de-CH',
    name: 'German (Switzerland)',
    nativeName: 'Deutsch (Schweiz)',
    flag: '🇨🇭',
    region: 'Europe',
    accent: 'Swiss Standard',
    sampleGreeting: 'Grüezi! Willkommen bei Acme Cloud Corp. Hier ist Sarah. Wie kann ich Ihrem Team heute behilflich sein?',
    bcp47: 'de-CH',
    voiceGenderHints: {
      femaleVoiceKeywords: ['lenni', 'female'],
      maleVoiceKeywords: ['karsten', 'male'],
    },
  },

  // Portuguese
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    region: 'South America',
    accent: 'Brazilian',
    sampleGreeting: 'Olá! Muito obrigado por ligar para a Acme Cloud Corp. Sou a Sarah, sua especialista em automação e nuvem. Como posso ajudar a sua equipe hoje?',
    bcp47: 'pt-BR',
    voiceGenderHints: {
      femaleVoiceKeywords: ['francisca', 'leticia', 'thalita', 'luciana', 'female'],
      maleVoiceKeywords: ['antonio', 'daniel', 'male'],
    },
  },
  {
    code: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (Portugal)',
    flag: '🇵🇹',
    region: 'Europe',
    accent: 'European Portuguese',
    sampleGreeting: 'Olá! Bem-vindo à Acme Cloud Corp. Fala a Sarah, sua assistente comercial de IA. Em que posso ser útil hoje?',
    bcp47: 'pt-PT',
    voiceGenderHints: {
      femaleVoiceKeywords: ['raquel', 'fernanda', 'female'],
      maleVoiceKeywords: ['duarte', 'male'],
    },
  },

  // Italian
  {
    code: 'it-IT',
    name: 'Italian (Italy)',
    nativeName: 'Italiano (Italia)',
    flag: '🇮🇹',
    region: 'Europe',
    accent: 'Standard Italian',
    sampleGreeting: 'Buongiorno e benvenuto in Acme Cloud Corp! Sono Sarah, la sua consulente commerciale AI. Come posso esserle utile oggi?',
    bcp47: 'it-IT',
    voiceGenderHints: {
      femaleVoiceKeywords: ['elsa', 'isabella', 'cosimo', 'female'],
      maleVoiceKeywords: ['diego', 'carlo', 'male'],
    },
  },

  // Japanese
  {
    code: 'ja-JP',
    name: 'Japanese (Japan)',
    nativeName: '日本語 (日本)',
    flag: '🇯🇵',
    region: 'East Asia',
    accent: 'Standard Tokyo',
    sampleGreeting: 'お電話ありがとうございます。Acme Cloud CorpのAIセールススペシャリスト、サラと申します。本日は貴社のどのような課題についてご相談でしょうか？',
    bcp47: 'ja-JP',
    voiceGenderHints: {
      femaleVoiceKeywords: ['nanami', 'aoi', 'mayu', 'ayumi', 'female'],
      maleVoiceKeywords: ['keita', 'daichi', 'male'],
    },
  },

  // Mandarin Chinese
  {
    code: 'zh-CN',
    name: 'Mandarin (Simplified)',
    nativeName: '中文 (普通话·简体)',
    flag: '🇨🇳',
    region: 'East Asia',
    accent: 'Standard Mainland Mandarin',
    sampleGreeting: '您好！感谢致电Acme Cloud Corp。我是您的AI企业销售顾问Sarah。请问今天有什么我可以协助您团队的吗？',
    bcp47: 'zh-CN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['xiaoxiao', 'xiaoyi', 'huihui', 'yaoyao', 'female'],
      maleVoiceKeywords: ['yunjian', 'yunxi', 'male'],
    },
  },
  {
    code: 'zh-TW',
    name: 'Mandarin (Traditional)',
    nativeName: '中文 (國語·繁體)',
    flag: '🇹🇼',
    region: 'East Asia',
    accent: 'Taiwan Standard Mandarin',
    sampleGreeting: '您好！感謝致電Acme Cloud Corp。我是您的智慧銷售顧問Sarah。請問今天有什麼我可以為您的團隊協助的嗎？',
    bcp47: 'zh-TW',
    voiceGenderHints: {
      femaleVoiceKeywords: ['hsiaochen', 'hsiaoyu', 'female'],
      maleVoiceKeywords: ['yunzhe', 'male'],
    },
  },

  // Indian Languages
  {
    code: 'hi-IN',
    name: 'Hindi (India)',
    nativeName: 'हिन्दी (भारत)',
    flag: '🇮🇳',
    region: 'South Asia',
    accent: 'Standard Hindi',
    sampleGreeting: 'नमस्ते! Acme Cloud Corp में कॉल करने के लिए धन्यवाद। मैं सारा हूँ, आपकी AI सेल्स स्पेशलिस्ट। आज मैं आपकी टीम की क्या सहायता कर सकती हूँ?',
    bcp47: 'hi-IN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['swara', 'heera', 'kalpana', 'female'],
      maleVoiceKeywords: ['madhav', 'male'],
    },
  },
  {
    code: 'ta-IN',
    name: 'Tamil (India)',
    nativeName: 'தமிழ் (இந்தியா)',
    flag: '🇮🇳',
    region: 'South Asia',
    accent: 'Standard Tamil',
    sampleGreeting: 'வணக்கம்! Acme Cloud Corp-க்கு அழைத்ததற்கு நன்றி. நான் சாரா, உங்கள் AI விற்பனை ஆலோசகர். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
    bcp47: 'ta-IN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['pallavi', 'female'],
      maleVoiceKeywords: ['valluvar', 'male'],
    },
  },
  {
    code: 'te-IN',
    name: 'Telugu (India)',
    nativeName: 'తెలుగు (భారతదేశం)',
    flag: '🇮🇳',
    region: 'South Asia',
    accent: 'Standard Telugu',
    sampleGreeting: 'నమస్కారం! Acme Cloud Corpకి కాల్ చేసినందుకు ధన్యవాదాలు. నేను సారా, మీ AI సేల్స్ స్పెషలిస్ట్. ఈ రోజు మీ టీమ్‌కి నేను ఎలా సహాయపడగలను?',
    bcp47: 'te-IN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['shruti', 'female'],
      maleVoiceKeywords: ['mohan', 'male'],
    },
  },
  {
    code: 'bn-IN',
    name: 'Bengali (India)',
    nativeName: 'বাংলা (ভারত)',
    flag: '🇮🇳',
    region: 'South Asia',
    accent: 'Standard Bengali',
    sampleGreeting: 'নমস্কার! Acme Cloud Corp-এ কল করার জন্য ধন্যবাদ। আমি সারাহ, আপনার AI সেলস বিশেষজ্ঞ। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
    bcp47: 'bn-IN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['tanishaa', 'female'],
      maleVoiceKeywords: ['bashkar', 'male'],
    },
  },

  // Arabic
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi / Standard)',
    nativeName: 'العربية (المملكة العربية السعودية)',
    flag: '🇸🇦',
    region: 'Middle East',
    accent: 'Modern Standard Arabic',
    sampleGreeting: 'مرحباً بكم في Acme Cloud Corp! معكم سارة، أخصائية المبيعات الذكية. كيف يمكنني مساعدة فريقكم اليوم؟',
    bcp47: 'ar-SA',
    voiceGenderHints: {
      femaleVoiceKeywords: ['zariyah', 'mouna', 'female'],
      maleVoiceKeywords: ['hamed', 'male'],
    },
  },
  {
    code: 'ar-AE',
    name: 'Arabic (UAE)',
    nativeName: 'العربية (الإمارات العربية المتحدة)',
    flag: '🇦🇪',
    region: 'Middle East',
    accent: 'Gulf Arabic',
    sampleGreeting: 'يا هلا ومرحباً بكم في Acme Cloud Corp! معكم سارة مستشارة المبيعات. كيف أقدر أساعد أعمالكم اليوم؟',
    bcp47: 'ar-AE',
    voiceGenderHints: {
      femaleVoiceKeywords: ['fatima', 'female'],
      maleVoiceKeywords: ['hamdan', 'male'],
    },
  },

  // Dutch
  {
    code: 'nl-NL',
    name: 'Dutch (Netherlands)',
    nativeName: 'Nederlands (Nederland)',
    flag: '🇳🇱',
    region: 'Europe',
    accent: 'Standard Dutch',
    sampleGreeting: 'Hallo en welkom bij Acme Cloud Corp! Mijn naam is Sarah, uw AI sales adviseur. Waarmee kan ik uw team vandaag van dienst zijn?',
    bcp47: 'nl-NL',
    voiceGenderHints: {
      femaleVoiceKeywords: ['colette', 'fenna', 'female'],
      maleVoiceKeywords: ['maarten', 'male'],
    },
  },

  // Korean
  {
    code: 'ko-KR',
    name: 'Korean (South Korea)',
    nativeName: '한국어 (대한민국)',
    flag: '🇰🇷',
    region: 'East Asia',
    accent: 'Standard Seoul',
    sampleGreeting: '안녕하세요! Acme Cloud Corp에 전화 주셔서 감사합니다. 저는 AI 세일즈 전문가 사라입니다. 오늘 어떤 업무를 도와드릴까요?',
    bcp47: 'ko-KR',
    voiceGenderHints: {
      femaleVoiceKeywords: ['sunhi', 'jiwon', 'female'],
      maleVoiceKeywords: ['insoo', 'male'],
    },
  },

  // Polish
  {
    code: 'pl-PL',
    name: 'Polish (Poland)',
    nativeName: 'Polski (Polska)',
    flag: '🇵🇱',
    region: 'Europe',
    accent: 'Standard Polish',
    sampleGreeting: 'Dzień dobry! Dziękujemy za kontakt z Acme Cloud Corp. Nazywam się Sarah, jestem specjalistką ds. sprzedaży AI. W czym mogę dziś pomóc?',
    bcp47: 'pl-PL',
    voiceGenderHints: {
      femaleVoiceKeywords: ['zofia', 'agnieszka', 'female'],
      maleVoiceKeywords: ['marek', 'male'],
    },
  },

  // Turkish
  {
    code: 'tr-TR',
    name: 'Turkish (Turkey)',
    nativeName: 'Türkçe (Türkiye)',
    flag: '🇹🇷',
    region: 'Eurasia',
    accent: 'Standard Turkish',
    sampleGreeting: 'Merhaba! Acme Cloud Corp\'a hoş geldiniz. Ben yapay zeka satış uzmanınız Sarah. Bugün ekibinize nasıl yardımcı olabilirim?',
    bcp47: 'tr-TR',
    voiceGenderHints: {
      femaleVoiceKeywords: ['emel', 'filiz', 'female'],
      maleVoiceKeywords: ['ahmet', 'male'],
    },
  },

  // Vietnamese
  {
    code: 'vi-VN',
    name: 'Vietnamese (Vietnam)',
    nativeName: 'Tiếng Việt (Việt Nam)',
    flag: '🇻🇳',
    region: 'Southeast Asia',
    accent: 'Standard Northern/Southern',
    sampleGreeting: 'Xin chào! Cảm ơn bạn đã gọi đến Acme Cloud Corp. Tôi là Sarah, chuyên viên tư vấn bán hàng AI. Hôm nay tôi có thể hỗ trợ gì cho doanh nghiệp của bạn?',
    bcp47: 'vi-VN',
    voiceGenderHints: {
      femaleVoiceKeywords: ['hoaimy', 'maianh', 'female'],
      maleVoiceKeywords: ['namminh', 'male'],
    },
  },

  // Swedish
  {
    code: 'sv-SE',
    name: 'Swedish (Sweden)',
    nativeName: 'Svenska (Sverige)',
    flag: '🇸🇪',
    region: 'Europe',
    accent: 'Standard Swedish',
    sampleGreeting: 'Hej och välkommen till Acme Cloud Corp! Jag heter Sarah, din AI-säljrådgivare. Hur kan jag hjälpa ditt företag i dag?',
    bcp47: 'sv-SE',
    voiceGenderHints: {
      femaleVoiceKeywords: ['hillevi', 'sofie', 'female'],
      maleVoiceKeywords: ['mattias', 'male'],
    },
  },
];

export function getLanguageByCode(code?: string): LanguageOption {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const normalized = code.toLowerCase().trim();
  const directMatch = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === normalized || l.bcp47.toLowerCase() === normalized
  );
  if (directMatch) return directMatch;

  // Match language prefix (e.g., 'es' -> 'es-MX')
  const prefixMatch = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(normalized.slice(0, 2)));
  return prefixMatch || SUPPORTED_LANGUAGES[0];
}

/**
 * Fast client-side & server-side language detector for natural mid-call language switching
 */
export function detectLanguageFromText(text: string, allowedCodes?: string[]): LanguageOption | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;

  // 1. Script checks for non-Latin scripts
  // Japanese (Hiragana, Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) {
    return getLanguageByCode('ja-JP');
  }
  // Korean (Hangul)
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(trimmed)) {
    return getLanguageByCode('ko-KR');
  }
  // Chinese (Hanzi) without Japanese kana
  if (/[\u4E00-\u9FFF]/.test(trimmed)) {
    return getLanguageByCode('zh-CN');
  }
  // Hindi & Sanskrit (Devanagari)
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return getLanguageByCode('hi-IN');
  }
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(trimmed)) {
    return getLanguageByCode('ta-IN');
  }
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return getLanguageByCode('te-IN');
  }
  // Bengali
  if (/[\u0980-\u09FF]/.test(trimmed)) {
    return getLanguageByCode('bn-IN');
  }
  // Arabic
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return getLanguageByCode('ar-SA');
  }

  const lower = ` ${trimmed.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')} `;

  // 2. High-confidence keyword / token detection for European languages
  const patterns: { code: string; tokens: string[] }[] = [
    {
      code: 'es-MX',
      tokens: [
        'hola', 'buenos', 'buenas', 'dias', 'tardes', 'noches', 'gracias', 'precio', 'precios',
        'cuanto', 'cuánto', 'cuesta', 'empresa', 'demostracion', 'demostración', 'demo', 'hablar',
        'por favor', 'necesito', 'servicios', 'plataforma', 'llamada', 'cotizacion', 'cotización',
        'horario', 'agendar', 'reunion', 'reunión', 'puedes', 'ustedes'
      ],
    },
    {
      code: 'fr-FR',
      tokens: [
        'bonjour', 'bonsoir', 'salut', 'merci', 'combien', 'coute', 'coûte', 'entreprise',
        'demonstration', 'démonstration', 'prix', 'logiciel', 'rendez-vous', 'besoin',
        'pouvez-vous', 'rappeler', 'plateforme', 'devis', 'solution', 'horaires', 'equipe'
      ],
    },
    {
      code: 'de-DE',
      tokens: [
        'hallo', 'guten', 'tag', 'morgen', 'abend', 'danke', 'wieviel', 'kostet', 'unternehmen',
        'preis', 'preise', 'beratung', 'termin', 'losung', 'lösung', 'funktionen', 'plattform',
        'konnen', 'können', 'hilfe', 'angebot', 'terminvereinbarung'
      ],
    },
    {
      code: 'pt-BR',
      tokens: [
        'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'obrigado', 'obrigada', 'quanto', 'custa',
        'empresa', 'preco', 'preço', 'demonstracao', 'demonstração', 'preciso', 'reuniao', 'reunião',
        'atendimento', 'plataforma', 'ajuda', 'falar'
      ],
    },
    {
      code: 'it-IT',
      tokens: [
        'buongiorno', 'buonasera', 'ciao', 'grazie', 'quanto', 'costa', 'azienda', 'prezzo', 'prezzi',
        'dimostrazione', 'servizi', 'bisogno', 'parlare', 'appuntamento', 'offerta', 'piattaforma'
      ],
    },
    {
      code: 'nl-NL',
      tokens: [
        'hallo', 'goedemorgen', 'goedemiddag', 'dank u', 'bedankt', 'hoeveel', 'kost', 'bedrijf',
        'prijs', 'prijzen', 'demonstratie', 'afspraak', 'kunnen', 'oplossing'
      ],
    },
    {
      code: 'tr-TR',
      tokens: [
        'merhaba', 'gunaydin', 'günaydın', 'tesekkurler', 'teşekkürler', 'fiyat', 'fiyatlar',
        'sirket', 'şirket', 'demo', 'randevu', 'bilgi', 'yardim', 'yardım'
      ],
    },
    {
      code: 'vi-VN',
      tokens: [
        'xin chao', 'xin chào', 'cam on', 'cảm ơn', 'gia', 'giá', 'bao nhieu', 'bao nhiêu',
        'cong ty', 'công ty', 'tu van', 'tư vấn', 'dat lich', 'đặt lịch'
      ],
    },
    {
      code: 'pl-PL',
      tokens: [
        'dzien dobry', 'dzień dobry', 'czesc', 'cześć', 'dziekuje', 'dziękuję', 'ile', 'kosztuje',
        'firma', 'cena', 'ceny', 'spotkanie', 'oferta', 'pomoc'
      ],
    },
  ];

  let bestMatch: { code: string; score: number } | null = null;

  for (const { code, tokens } of patterns) {
    let score = 0;
    for (const token of tokens) {
      if (lower.includes(` ${token} `)) {
        score += 2;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { code, score };
    }
  }

  if (bestMatch && bestMatch.score >= 2) {
    if (allowedCodes && allowedCodes.length > 0) {
      const isAllowed = allowedCodes.some((ac) => ac.toLowerCase().startsWith(bestMatch!.code.slice(0, 2).toLowerCase()));
      if (!isAllowed) return null;
    }
    return getLanguageByCode(bestMatch.code);
  }

  return null;
}

export const AVAILABLE_LANGUAGES = SUPPORTED_LANGUAGES;
