import React, { useState } from 'react';
import {
  PhoneCall,
  Play,
  Pause,
  ArrowRight,
  Shield,
  Zap,
  Bot,
  Database,
  Users,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Volume2,
  Calendar,
  Lock,
  Headphones,
  Check,
  Radio,
  Clock,
  Mic,
  Activity,
  Globe2,
  Cpu,
  BarChart3,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { VoiceOrb3D } from './3d/VoiceOrb3D';
import { GlobalNetworkGlobe3D } from './3d/GlobalNetworkGlobe3D';
import { TiltCard3D } from './3d/TiltCard3D';
import { SoundwaveVisualizer3D } from './3d/SoundwaveVisualizer3D';
import { playVoiceText, cancelVoice } from '../lib/audioVoice';

export interface LandingPageProps {
  onStartFree?: () => void;
  onSignIn?: () => void;
  onLaunchDemo?: () => void;
  onOpenSignUp?: () => void;
  onOpenSignIn?: () => void;
  onSimulateAudioDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onSignIn,
  onLaunchDemo,
  onOpenSignUp,
  onOpenSignIn,
  onSimulateAudioDemo,
}) => {
  // Unified action handlers
  const handleSignUp = onStartFree || onOpenSignUp || onLaunchDemo || (() => {});
  const handleSignIn = onSignIn || onOpenSignIn || (() => {});
  const handleDemo = onLaunchDemo || onSimulateAudioDemo || handleSignUp;

  // Audio sample playback state
  const [activeVoiceIdx, setActiveVoiceIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [billingAnnual, setBillingAnnual] = useState<boolean>(true);

  // 3D Orb visualizer theme
  const [orbTheme, setOrbTheme] = useState<'indigo' | 'emerald' | 'violet' | 'amber'>('indigo');

  // Interactive In-Browser Call Simulator State
  const [activeSimPrompt, setActiveSimPrompt] = useState<string>('pricing');
  const [simSpeaking, setSimSpeaking] = useState<boolean>(false);
  const [simTranscript, setSimTranscript] = useState<Array<{ role: 'caller' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: 'Thanks for calling Acme Cloud Platform! This is Sarah, your enterprise sales specialist. How can I assist your team today?',
    },
  ]);

  // Interactive ROI Calculator State
  const [monthlyCalls, setMonthlyCalls] = useState<number>(3500);
  const [avgDealSize, setAvgDealSize] = useState<number>(5500);
  const [conversionBump, setConversionBump] = useState<number>(22);

  const calculatedLeads = Math.round(monthlyCalls * 0.38);
  const incrementalDeals = Math.round(calculatedLeads * (conversionBump / 100) * 0.25);
  const addedAnnualRevenue = incrementalDeals * avgDealSize * 12;
  const hoursSaved = Math.round((monthlyCalls * 4.5) / 60);

  const audioVoices = [
    {
      title: 'Enterprise Software Qualification',
      name: 'Sarah',
      role: 'Senior Sales Specialist',
      voice: 'nova',
      gender: 'female' as const,
      duration: '0:34',
      theme: 'indigo' as const,
      desc: 'Qualifies infrastructure bottlenecks, budget authority, and confirms calendar demo.',
      quote:
        'We offer dedicated VPC peering and horizontally autoscaling workers that process over 50k events per second. I have an opening this Thursday at 2:00 PM Eastern. Would that work for your team?',
    },
    {
      title: 'Commercial Logistics & Freight Quote',
      name: 'Maya',
      role: 'Rapid Logistics Broker',
      voice: 'shimmer',
      gender: 'female' as const,
      duration: '0:28',
      theme: 'emerald' as const,
      desc: 'Gathers lane zip codes, trailer type, pallet count, and delivers instant spot rates.',
      quote:
        'Chicago to Dallas dry van is quoting at $2,450 all-in for 40,000 lbs. I can lock this carrier rate right now with a confirmed pickup window.',
    },
    {
      title: 'Technical API & Support Inbound',
      name: 'Alex',
      role: 'Cloud Architect Agent',
      voice: 'onyx',
      gender: 'male' as const,
      duration: '0:31',
      theme: 'violet' as const,
      desc: 'Explains REST webhook latency guarantees and routes enterprise security questions.',
      quote:
        'Our edge gateway guarantees p99 delivery under 120ms with HMAC SHA-256 signatures. Let me assign our solutions architect to send technical documentation.',
    },
  ];

  const handleToggleVoice = (idx: number) => {
    if (activeVoiceIdx === idx && isPlayingAudio) {
      cancelVoice();
      setIsPlayingAudio(false);
    } else {
      setActiveVoiceIdx(idx);
      setOrbTheme(audioVoices[idx].theme);
      setIsPlayingAudio(true);
      const voice = audioVoices[idx];
      playVoiceText(voice.quote, {
        voice: voice.voice,
        voiceGender: voice.gender,
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  // Interactive in-page simulator
  const simPrompts: Record<string, { label: string; callerText: string; agentResponse: string }> = {
    pricing: {
      label: 'Enterprise Pricing & Volume',
      callerText: 'Can you tell me how much your Enterprise tier costs for 50 sales reps?',
      agentResponse:
        'Our Business and Enterprise packages start from $319 per month, with custom volume discounts for 50 seats. This includes unlimited AI voice minutes, dedicated SIP trunks, and a 99.99% SLA. Would you like me to connect you with our Commercial Director?',
    },
    hipaa: {
      label: 'Security & HIPAA / SOC2',
      callerText: 'Is your telephony stack HIPAA and SOC2 Type II compliant for healthcare data?',
      agentResponse:
        'Yes, absolutely. We operate on strictly isolated tenant boundaries with AES-256 encryption at rest, TLS 1.3 in transit, and Business Associate Agreements available for healthcare customers.',
    },
    crm: {
      label: 'HubSpot & Salesforce Sync',
      callerText: 'How quickly does call transcription and intent sync into our Salesforce CRM?',
      agentResponse:
        'In real time! As soon as the call ends, our webhook streams the full timestamped transcript, intent score, extracted budget, and scheduled calendar events directly into your lead record in under 2 seconds.',
    },
    human: {
      label: 'Request Live Human Specialist',
      callerText: 'I would like to speak to a real human account manager please.',
      agentResponse:
        'Certainly! I completely understand. I have generated a real-time handoff summary with your requirements and am transferring you to Marcus on our executive sales team right now.',
    },
  };

  const handleSelectSimPrompt = (key: string) => {
    setActiveSimPrompt(key);
    const data = simPrompts[key];
    if (!data) return;

    setSimTranscript([
      { role: 'caller', text: data.callerText },
      { role: 'agent', text: data.agentResponse },
    ]);

    setSimSpeaking(true);
    playVoiceText(data.agentResponse, {
      voice: 'nova',
      voiceGender: 'female',
      onStart: () => setSimSpeaking(true),
      onEnd: () => setSimSpeaking(false),
      onError: () => setSimSpeaking(false),
    });
  };

  const faqs = [
    {
      q: 'How does VocalPulse AI sound so human without noticeable latency?',
      a: 'VocalPulse operates on our proprietary sub-second voice orchestration pipeline. By pairing streaming speech-to-text with fine-tuned conversational LLM reasoning and ultra-low-latency neural audio synthesis, response latency stays below 400 milliseconds—faster than natural human conversational pauses.',
    },
    {
      q: 'Is multi-tenancy strictly isolated for sensitive enterprise customer data?',
      a: 'Yes. Every company operates in a strictly isolated tenant boundary. Databases enforce tenant IDs on every single query, and company documents, recordings, customer notes, and CRM records are logically sandboxed. Tenant A can never view or query Tenant B’s data under any circumstances.',
    },
    {
      q: 'Can we connect our existing business phone numbers?',
      a: 'Yes. You can instantly provision local or toll-free numbers directly through VocalPulse, or connect your existing numbers via Twilio, Telnyx, or standard SIP trunk forwarding.',
    },
    {
      q: 'How does the assistant know our specific products and pricing?',
      a: 'You simply upload your product catalogue, sales playbooks, PDFs, website URLs, or FAQs in the Knowledge Base. The AI automatically chunks and indexes this information, answering questions strictly based on your authorized company knowledge.',
    },
    {
      q: 'What happens when a caller demands to speak with a human?',
      a: 'You can configure custom Human Handoff rules. If a caller requests a manager, exhibits frustrated sentiment, or reaches an intricate pricing negotiation, the assistant generates a real-time salesperson brief and seamlessly transfers the live call or alerts your team via Slack.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      {/* Dynamic 3D Atmospheric Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br from-indigo-900/25 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-violet-900/20 via-indigo-950/15 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-emerald-950/20 to-transparent blur-[160px]" />
      </div>

      {/* Top Telephony Live Status Banner */}
      <div className="relative z-50 bg-slate-950/90 text-slate-300 text-xs py-2 px-4 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Global Telephony Live
            </span>
            <span className="hidden sm:inline text-slate-400">
              Sub-400ms neural voice synthesis &amp; 2-way CRM synchronization
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDemo}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Interactive Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Glassmorphism Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                VocalPulse <span className="text-indigo-400 font-black">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Enterprise Voice Telephony
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#voice-engine" className="hover:text-white transition-colors">
              3D Voice Engine
            </a>
            <a href="#interactive-studio" className="hover:text-white transition-colors">
              Live Dial Simulator
            </a>
            <a href="#global-network" className="hover:text-white transition-colors">
              Global SIP Edge
            </a>
            <a href="#features-3d" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#roi-model" className="hover:text-white transition-colors">
              ROI Model
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignIn}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleDemo}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-indigo-700/50 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Demo</span>
            </button>
            <button
              onClick={handleSignUp}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4.5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all cursor-pointer border border-indigo-400/30"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Voice Orb */}
      <section id="voice-engine" className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Copy */}
            <div className="lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Next-Gen Autonomous B2B Telephony</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                Autonomous AI Voice Agents That{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400">
                  Close Enterprise Deals.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Deploy sub-400ms neural telephony agents that answer inbound calls, qualify enterprise buyers, overcome objections, book calendar demos, and automatically log transcripts into Salesforce and HubSpot.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleSignUp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/35 hover:shadow-indigo-500/50 transition-all cursor-pointer text-sm"
                >
                  <span>Deploy Voice Agent Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 shadow-md hover:border-slate-600 transition-all cursor-pointer text-sm"
                >
                  <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                  <span>Launch Live Workspace</span>
                </button>
              </div>

              {/* Trust Checkmarks */}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Sub-400ms neural latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Strict tenant isolation</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive 3D Voice Orb Stage */}
            <div className="lg:col-span-6 relative">
              <TiltCard3D
                maxTilt={10}
                depth={25}
                glowColor="rgba(99, 102, 241, 0.25)"
                className="bg-slate-900/80 rounded-3xl border border-slate-700/80 shadow-2xl p-6 relative overflow-hidden backdrop-blur-md"
              >
                {/* 3D Voice Orb Canvas */}
                <div className="w-full h-[380px] sm:h-[440px] relative">
                  <VoiceOrb3D
                    isPlaying={isPlayingAudio || simSpeaking}
                    intensity={isPlayingAudio || simSpeaking ? 1.6 : 0.8}
                    themeColor={orbTheme}
                    className="w-full h-full"
                  />
                </div>

                {/* Audio Sample Controller embedded in 3D Stage */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      Audition Neural Personas Live
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      24kHz PCM
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {audioVoices.map((voice, idx) => {
                      const isActive = activeVoiceIdx === idx;
                      return (
                        <button
                          key={voice.name}
                          onClick={() => handleToggleVoice(idx)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isActive
                              ? 'bg-indigo-950/70 border-indigo-500/80 text-white shadow-lg ring-1 ring-indigo-500/40'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{voice.name}</span>
                            {isActive && isPlayingAudio ? (
                              <Pause className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{voice.role}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Logos Bar */}
      <section className="py-8 bg-slate-950/80 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Empowering modern high-growth B2B SaaS, Logistics, Healthcare &amp; Enterprise Sales Teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all font-black text-slate-400 tracking-wider text-sm">
            <span className="hover:text-indigo-400 transition-colors">VANGUARD LOGIX</span>
            <span className="hover:text-indigo-400 transition-colors">NOVA FINANCIAL</span>
            <span className="hover:text-indigo-400 transition-colors">BOSTON DIAGNOSTICS</span>
            <span className="hover:text-indigo-400 transition-colors">ZENITH FREIGHT</span>
            <span className="hover:text-indigo-400 transition-colors">CLOUDSCALE HQ</span>
            <span className="hover:text-indigo-400 transition-colors">APEX ANALYTICS</span>
          </div>
        </div>
      </section>

      {/* Interactive In-Browser Live Dial Simulator */}
      <section id="interactive-studio" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Interactive Telephony Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test Inbound Scenarios In Real Time
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Click any inbound caller question to trigger the AI sales persona. Listen to the sub-second response, objection resolution, and autonomous CRM classification.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden backdrop-blur-md">
              {/* Window Header */}
              <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    telephony://vocalpulse-gateway.live/sim-session
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SIP Session Active (+1 415 890-2341)
                  </span>
                </div>
              </div>

              {/* Window Content */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Caller Prompt Selector */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Caller Inquiry Scenario:
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(simPrompts).map(([key, data]) => {
                      const isSelected = activeSimPrompt === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectSimPrompt(key)}
                          className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">{data.label}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              "{data.callerText}"
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 3D Soundwave inside Simulator */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                      <span>3D Frequency Spectrum</span>
                      <span className="text-indigo-400">{simSpeaking ? 'Modulating...' : 'Standby'}</span>
                    </div>
                    <div className="h-24">
                      <SoundwaveVisualizer3D isPlaying={simSpeaking} barCount={36} color="#6366f1" />
                    </div>
                  </div>
                </div>

                {/* Right: Live Dialogue & Sales Intelligence */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  {/* Transcript Viewport */}
                  <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800/90 space-y-3 min-h-[220px]">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
                      <span>Live Speech-to-Text &amp; Autonomous Output</span>
                      <span className="text-[10px] font-mono text-slate-500">Latency: 388ms</span>
                    </div>

                    {simTranscript.map((turn, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                          turn.role === 'agent'
                            ? 'bg-indigo-950/50 border border-indigo-800/40 text-indigo-200'
                            : 'bg-slate-900 border border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="font-bold mb-1 flex items-center gap-1.5">
                          {turn.role === 'agent' ? (
                            <>
                              <Bot className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-indigo-300">Sarah (VocalPulse AI):</span>
                            </>
                          ) : (
                            <>
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-slate-400">Caller:</span>
                            </>
                          )}
                        </div>
                        <p>{turn.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Qualification Card */}
                  <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Intent Readiness</div>
                      <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">96 / 100</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Objection Status</div>
                      <div className="text-lg font-black text-indigo-400 font-mono mt-0.5">Resolved</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">CRM Action</div>
                      <div className="text-lg font-black text-violet-400 font-mono mt-0.5">Auto-Synced</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleSelectSimPrompt(activeSimPrompt)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Replay Audio Dialogue</span>
                    </button>
                    <button
                      onClick={handleDemo}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/30"
                    >
                      <span>Open Studio in Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Global SIP Edge Network Section */}
      <section id="global-network" className="py-24 bg-slate-950/60 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tier-1 Global Telephony Infrastructure</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Global Edge Pops Delivering Sub-Second Packet Routing.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Our distributed SIP network operates across 8 tier-1 data centers worldwide. With direct carrier interconnects via Level 3, Lumen, Telnyx, and Tata Communications, your callers experience zero latency, jitter, or audio clipping.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-2xl font-black text-emerald-400 font-mono">&lt; 18ms</div>
                  <div className="text-xs text-slate-400 mt-1">Average Edge Jitter</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-2xl font-black text-indigo-400 font-mono">99.99%</div>
                  <div className="text-xs text-slate-400 mt-1">Uptime SLA Contract</div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSignUp}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Provision Global Number Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: 3D Globe Interactive Canvas */}
            <div className="lg:col-span-7">
              <TiltCard3D
                maxTilt={8}
                depth={20}
                glowColor="rgba(16, 185, 129, 0.2)"
                className="bg-slate-900/80 rounded-3xl border border-slate-700/80 shadow-2xl p-6 relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-full h-[380px] sm:h-[460px]">
                  <GlobalNetworkGlobe3D className="w-full h-full" />
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Bento Matrix: Enterprise Capabilities */}
      <section id="features-3d" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Autonomous Sales Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Voice Capabilities
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Engineered with mathematical precision to replace lost leads with autonomous calendar bookings and instant sales intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(99, 102, 241, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-5">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sub-400ms Voice Orchestration</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Streaming neural synthesis pipeline eliminates the robotic silence between caller questions and AI responses. The assistant sounds immediate, attentive, and natural.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-indigo-300">
                  <span>Latency Benchmark</span>
                  <span className="font-bold text-emerald-400">388ms Avg</span>
                </div>
              </div>
            </TiltCard3D>

            {/* Bento Card 2 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(16, 185, 129, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-5">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Smart Human Handoff 2.0</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Detects buying intent spikes, pricing negotiations, or frustrated sentiment. Generates a comprehensive salesperson brief before transferring the live caller.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                  <span>Handoff Briefing</span>
                  <span className="font-bold text-white">Instant Sync</span>
                </div>
              </div>
            </TiltCard3D>

            {/* Bento Card 3 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(168, 85, 247, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mb-5">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Multilingual Telephony</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Automatically identifies customer language and regional dialect in real time (English, Spanish, French, German, Japanese, and more) without manual routing menus.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-violet-300">
                  <span>Languages Supported</span>
                  <span className="font-bold text-white">12+ Dialects</span>
                </div>
              </div>
            </TiltCard3D>

            {/* Bento Card 4 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(245, 158, 11, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-5">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Autonomous 2-Way CRM Sync</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Direct integration with HubSpot, Salesforce, Pipedrive, and Slack. Automatically creates deals, logs call recordings, and schedules Google / Outlook calendar invites.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-amber-300">
                  <span>CRM Webhooks</span>
                  <span className="font-bold text-white">&lt; 2s Delivery</span>
                </div>
              </div>
            </TiltCard3D>

            {/* Bento Card 5 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(56, 189, 248, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/40 text-sky-400 flex items-center justify-center mb-5">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Multi-Tenant Data Isolation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Strict logical database boundaries for every organization. Enforces tenant IDs on every single query. SOC2 Type II, HIPAA, and GDPR compliant architectures.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-sky-300">
                  <span>Tenant Isolation</span>
                  <span className="font-bold text-emerald-400">100% Guaranteed</span>
                </div>
              </div>
            </TiltCard3D>

            {/* Bento Card 6 */}
            <TiltCard3D maxTilt={10} depth={20} glowColor="rgba(236, 72, 153, 0.2)">
              <div className="h-full p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/40 text-pink-400 flex items-center justify-center mb-5">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Self-Learning AI Improvement</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Monitors every call transcript to discover knowledge base gaps and unaddressed customer questions. Generates suggested answers for one-click manager approval.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-pink-300">
                  <span>Knowledge Evolution</span>
                  <span className="font-bold text-white">Automated</span>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* Interactive 3D ROI & Expansion Calculator */}
      <section id="roi-model" className="py-24 bg-slate-950/80 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              ROI &amp; Revenue Projection
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Model Your Pipeline Expansion
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              See how capturing 100% of inbound calls and qualifying buyers instantly impacts your annualized revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl backdrop-blur-md">
            {/* Sliders Form */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Monthly Inbound Call Volume</label>
                  <span className="text-indigo-400 font-mono font-bold">{monthlyCalls.toLocaleString()} calls</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>500 calls</span>
                  <span>20,000 calls</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Average Closed Contract Value</label>
                  <span className="text-indigo-400 font-mono font-bold">${avgDealSize.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={avgDealSize}
                  onChange={(e) => setAvgDealSize(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>$1,000</span>
                  <span>$50,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Speed-to-Lead Qualification Boost</label>
                  <span className="text-emerald-400 font-mono font-bold">+{conversionBump}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={conversionBump}
                  onChange={(e) => setConversionBump(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>+5%</span>
                  <span>+45%</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-7 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">
                  Projected Additional Annualized Revenue
                </div>
                <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-mono my-3">
                  +${addedAnnualRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculated by capturing missed calls instantly, eliminating phone-tag delays, and automatically booking executive demos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Monthly Rep Hours Saved</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    {hoursSaved} hrs
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Extra Closed Deals / Month</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">
                    +{incrementalDeals} deals
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignUp}
                className="mt-6 w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Deploy Voice Agent &amp; Capture This Pipeline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Transparent SaaS Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Predictable Plans That Scale With Your Growth
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              All plans include complete multi-tenant isolation, real-time transcription, and live recordings.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-6 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  !billingAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                  billingAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annually</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {/* Free Trial */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-white">Free Trial</div>
                <div className="text-xs text-slate-400 mt-1">Experience the voice assistant</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-slate-400"> / 14 days</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>500 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>1 AI voice assistant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>1 local phone number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Standard transcription</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleSignUp}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-white">Pro Sales</div>
                <div className="text-xs text-slate-400 mt-1">For growing sales teams</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-white">
                    ${billingAnnual ? '119' : '149'}
                  </span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>2,000 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>5 AI voice assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>3 phone numbers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>CRM &amp; Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>AI Sales Intelligence</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleSignUp}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-700/60 transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Business (Popular) */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border-2 border-indigo-500 relative shadow-2xl flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <div>
                <div className="text-sm font-bold text-white">Business Growth</div>
                <div className="text-xs text-slate-400 mt-1">High-volume sales qualification</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-white">
                    ${billingAnnual ? '319' : '399'}
                  </span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>6,000 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>15 AI assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>10 phone numbers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Full HubSpot &amp; Salesforce 2-way sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Custom vector knowledge ingestion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Smart Human Handoff 2.0</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleSignUp}
                className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Deploy Business Plan
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-white">Enterprise Scale</div>
                <div className="text-xs text-slate-400 mt-1">Custom infrastructure &amp; SLA</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-white">
                    ${billingAnnual ? '799' : '999'}
                  </span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>25,000+ voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Unlimited AI assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Custom SIP trunking (BYOC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Dedicated VPC &amp; 99.99% SLA</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={handleSignUp}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 bg-slate-950/60 border-y border-slate-800/80 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/90 bg-slate-900/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm text-white hover:text-indigo-300 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 bg-slate-950/60 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final 3D CTA Banner */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to deploy your first autonomous AI Sales Voice Assistant?
            </h2>
            <p className="mt-3 text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
              Create an isolated tenant workspace, ingest company knowledge, and test live calls in less than 5 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleSignUp}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/40 transition-all cursor-pointer"
              >
                Start Free Trial Now &rarr;
              </button>
              <button
                onClick={handleDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
              >
                Launch Live Demo Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-xs border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300 text-sm">VocalPulse AI</span>
              <div className="text-[10px] text-slate-500">Autonomous Enterprise Telephony Platform</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400">
            <span>SOC2 Type II Certified</span>
            <span>HIPAA Compliant</span>
            <span>GDPR Ready</span>
            <span>TLS 1.3 Encryption</span>
            <span>Tier-1 SIP Carriers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
