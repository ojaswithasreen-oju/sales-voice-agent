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
  Check
} from 'lucide-react';
import { playVoiceText, cancelVoice } from '../lib/audioVoice';

interface LandingPageProps {
  onStartFree: () => void;
  onSignIn: () => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFree,
  onSignIn,
  onLaunchDemo,
}) => {
  // Audio demo player state
  const [activeSample, setActiveSample] = useState<number>(0);
  const [isPlayingSample, setIsPlayingSample] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [billingAnnual, setBillingAnnual] = useState<boolean>(true);

  // Interactive ROI Calculator State
  const [monthlyCalls, setMonthlyCalls] = useState<number>(2500);
  const [avgDealSize, setAvgDealSize] = useState<number>(4500);
  const [conversionBump, setConversionBump] = useState<number>(18); // percent bump

  const calculatedLeads = Math.round(monthlyCalls * 0.35);
  const incrementalDeals = Math.round(calculatedLeads * (conversionBump / 100) * 0.22);
  const addedRevenue = incrementalDeals * avgDealSize;
  const hoursSaved = Math.round((monthlyCalls * 4.2) / 60);

  const samples = [
    {
      title: 'Enterprise Software Qualification',
      agent: 'Sarah (Natural US Female)',
      gender: 'female' as const,
      voice: 'nova',
      duration: '0:38',
      desc: 'Qualifies infrastructure bottlenecks, budget authority, and confirms calendar demo.',
      quote: '"We offer dedicated VPC peering and horizontally autoscaling workers that process over 50k events/sec. I have an opening this Thursday at 2:00 PM Eastern. Would that work?"',
    },
    {
      title: 'Commercial Logistics & Freight Quote',
      agent: 'Maya (Fast & Direct Female)',
      gender: 'female' as const,
      voice: 'shimmer',
      duration: '0:29',
      desc: 'Gathers lane zip codes, trailer type, pallet count, and delivers instant spot rates.',
      quote: '"Chicago to Dallas dry van is quoting at $2,450 all-in for 40,000 lbs. I can lock this carrier rate right now with a confirmed pickup window."',
    },
    {
      title: 'Technical API & Support Inbound',
      agent: 'Alex (Tech Specialist)',
      gender: 'male' as const,
      voice: 'onyx',
      duration: '0:32',
      desc: 'Explains REST webhook latency guarantees and routes enterprise security questions.',
      quote: '"Our edge gateway guarantees p99 delivery under 120ms with HMAC SHA-256 signatures. Let me assign our solutions architect to send technical documentation."',
    },
  ];

  const faqs = [
    {
      q: 'How does VocalPulse AI sound so human without noticeable delays?',
      a: 'VocalPulse operates on our proprietary sub-second voice orchestration pipeline. By pairing streaming speech-to-text with fine-tuned conversational LLM reasoning and ultra-low-latency neural audio synthesis, response latency stays below 450 milliseconds—faster than human conversational pauses.',
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
      a: 'You can configure custom Human Handoff rules. If a caller requests a manager, exhibits frustrated sentiment, or reaches an intricate pricing negotiation, the assistant seamlessly transfers the live call or sends an urgent alert with call summary to your sales team.',
    },
  ];

  const handlePlaySample = (idx: number) => {
    if (activeSample === idx && isPlayingSample) {
      setIsPlayingSample(false);
      cancelVoice();
    } else {
      setActiveSample(idx);
      setIsPlayingSample(true);
      const sample = samples[idx];
      playVoiceText(String(sample?.quote || '').replace(/"/g, ''), {
        voice: sample?.voice,
        voiceGender: sample?.gender,
        onStart: () => setIsPlayingSample(true),
        onEnd: () => setIsPlayingSample(false),
        onError: () => setIsPlayingSample(false),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 text-center flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          New
        </span>
        <span>Sub-400ms Voice Latency &amp; Native HubSpot / Salesforce 2-Way Sync Now Live</span>
        <button
          onClick={onLaunchDemo}
          className="underline text-white font-medium hover:text-indigo-300 ml-1 cursor-pointer"
        >
          Explore Live Workspace &rarr;
        </button>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                VocalPulse <span className="text-indigo-600">AI</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Multi-Tenant Voice Platform
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </a>
            <a href="#audio-samples" className="hover:text-slate-900 transition-colors">
              Audio Demos
            </a>
            <a href="#roi-calculator" className="hover:text-slate-900 transition-colors">
              ROI Calculator
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Platform
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchDemo}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-indigo-200"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Live Demo
            </button>
            <button
              onClick={onStartFree}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <span>Start Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Next-Gen Autonomous B2B Telephony
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Turn Every Call Into a <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800">
                Sales Opportunity.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Deploy autonomous AI sales voice assistants that answer inbound calls, qualify enterprise leads, overcome objections, book calendar demos, and automatically log transcripts into your CRM.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onStartFree}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-200 hover:shadow-lg transition-all cursor-pointer text-base"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLaunchDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:border-slate-400 transition-all cursor-pointer text-base"
              >
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                <span>Explore Live Workspace</span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Isolated multi-tenant workspaces</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>5-minute turnkey onboarding</span>
              </div>
            </div>
          </div>

          {/* Hero Interactive Interactive Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
              {/* Window Header */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    app.vocalpulse.ai/workspace/acme-cloud
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Telephony Live (+1 415 890-2341)
                  </span>
                </div>
              </div>

              {/* Window Body Simulation */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
                {/* Left: Active Live Call Visualizer */}
                <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                          SV
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            Sarah &bull; Enterprise Sales Voice AI
                          </div>
                          <div className="text-xs text-slate-500">
                            Inbound Call with Marcus Vance (VP Eng, Vanguard Logix)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active &bull; 02:44
                        </span>
                      </div>
                    </div>

                    {/* Sound Waves Animation */}
                    <div className="my-5 py-4 bg-slate-900 rounded-lg px-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <span className="text-xs font-mono text-slate-300">
                          Audio Stream: 24kHz / 16-bit PCM (Sub-400ms)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[18, 36, 12, 45, 24, 60, 32, 50, 16, 40, 28, 55, 22].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-indigo-400 rounded-full transition-all duration-300"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dialogue Transcript Snippet */}
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950">
                        <span className="font-bold text-indigo-700">AI Assistant: </span>
                        "We guarantee 99.99% uptime SLA with dedicated VPC peering. Can I confirm your team size and timeline for this rollout?"
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                        <span className="font-bold text-slate-700">Marcus Vance: </span>
                        "We run 500 concurrent data pipelines. We need SOC2 and are ready to deploy before the end of Q1."
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>Grounded in: <b>Acme Enterprise Playbook 2026.docx</b></span>
                    </div>
                    <button
                      onClick={onLaunchDemo}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      View Full Call Record &rarr;
                    </button>
                  </div>
                </div>

                {/* Right: Real-time Sales Intelligence Feed */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Real-Time Qualification</span>
                      <span className="text-indigo-600 font-bold">95/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full w-[95%]" />
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Budget Authority</span>
                        <span className="font-semibold text-emerald-600">Confirmed (VP Level)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Decision Timeline</span>
                        <span className="font-semibold text-slate-900">&lt; 3 Weeks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Interested Tier</span>
                        <span className="font-semibold text-indigo-600">Enterprise Suite ($30k+)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Autonomous Actions Executed
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Created high-priority deal in <b>HubSpot CRM</b></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Booked calendar demo: <b>Thursday at 2:00 PM EST</b></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Dispatched Slack alert to <b>#sales-leads</b> channel</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Badges */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Trusted by modern high-growth B2B SaaS, Logistics, Healthcare &amp; Financial Enterprises
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all text-slate-600 font-bold text-sm">
            <span className="tracking-tight">VANGUARD LOGIX</span>
            <span className="tracking-tight">NOVA FINANCIAL</span>
            <span className="tracking-tight">BOSTON DIAGNOSTICS</span>
            <span className="tracking-tight">ZENITH FREIGHT</span>
            <span className="tracking-tight">CLOUDSCALE HQ</span>
            <span className="tracking-tight">APEX ANALYTICS</span>
          </div>
        </div>
      </section>

      {/* Interactive Audio Demos Section */}
      <section id="audio-samples" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Conversational Voice Quality
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Listen to AI Sales Voice Assistants in Action
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Experience the natural cadence, objection handling, and consultative tone tailored to different industry verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {samples.map((sample, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 border transition-all ${
                  activeSample === idx
                    ? 'bg-white border-indigo-300 shadow-md ring-2 ring-indigo-500/10'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {sample.agent}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{sample.duration}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{sample.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{sample.desc}</p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs italic text-slate-700 mb-5 leading-relaxed">
                  {sample.quote}
                </div>

                <button
                  onClick={() => handlePlaySample(idx)}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    activeSample === idx && isPlayingSample
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {activeSample === idx && isPlayingSample ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Audio Sample</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Audio Sample</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onLaunchDemo}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>Test with your own voice in the Live Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Autonomous Inbound &amp; Outbound Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Inbound Ring to Closed Deal in 4 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Connect Phone Number</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose a local or toll-free number from VocalPulse or route calls from your Twilio/Telnyx or existing PBX carrier.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Upload Knowledge &amp; Products</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingest PDF brochures, pricing sheets, sales guidelines, and FAQs. The agent cites only verified company facts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Autonomous Voice Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The AI answers in sub-second latency, asks custom qualification questions, resolves objections, and pitches your offer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4 shadow-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant CRM &amp; Calendar Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transcripts, intent scores, and scheduled demo calendar invites sync into HubSpot, Salesforce, and your sales team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              ROI &amp; Revenue Modeling
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Calculate Your Revenue Expansion
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              See how capturing 100% of inbound calls and qualifying buyers in real time directly impacts your pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-800/80 rounded-2xl p-6 sm:p-10 border border-slate-700 shadow-2xl">
            {/* Sliders Form */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Monthly Inbound Call Volume</label>
                  <span className="text-indigo-400 font-mono">{monthlyCalls.toLocaleString()} calls</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>500 calls</span>
                  <span>15,000 calls</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Average Closed Deal Value</label>
                  <span className="text-indigo-400 font-mono">${avgDealSize.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={avgDealSize}
                  onChange={(e) => setAvgDealSize(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>$1,000</span>
                  <span>$30,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <label className="text-slate-300">Speed-to-Lead Conversion Bump</label>
                  <span className="text-indigo-400 font-mono">+{conversionBump}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={conversionBump}
                  onChange={(e) => setConversionBump(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>+5%</span>
                  <span>+40%</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="lg:col-span-6 bg-slate-900/90 rounded-xl p-6 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400 mb-1">
                  Projected Additional Annualized Revenue
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 font-mono my-2">
                  +${(addedRevenue * 12).toLocaleString()}
                </div>
                <p className="text-xs text-slate-400">
                  Based on capturing missed calls instantly and accelerating speed-to-qualification.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Monthly Rep Hours Saved</div>
                  <div className="text-2xl font-bold text-white font-mono mt-0.5">
                    {hoursSaved} hrs
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Extra Closed Deals / Month</div>
                  <div className="text-2xl font-bold text-indigo-400 font-mono mt-0.5">
                    +{incrementalDeals} deals
                  </div>
                </div>
              </div>

              <button
                onClick={onStartFree}
                className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Deploy Voice Agent &amp; Capture This Pipeline
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Multi-Tenancy & Security Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Enterprise Infrastructure
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Scale, Privacy, and Isolation
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Built from the ground up as a true multi-tenant SaaS architecture with ironclad logical tenant segregation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Strict Tenant Isolation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All database queries enforce tenant IDs. Cross-tenant access is impossible at both the API and database layer. Your knowledge base and customer recordings are 100% private.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Role-Based Governance (RBAC)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enforce granular privileges across Owner, Admin, Sales Manager, Sales Rep, and Viewer roles with comprehensive timestamped audit logs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Sub-Second Telephony Edge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Low-latency SIP trunking connected directly to tier-1 global carriers guarantees immediate pickup without latency or choppy audio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Transparent SaaS Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Predictable Plans That Scale With Your Pipeline
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              All plans include complete tenant isolation, real-time call transcription, and audio recordings.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-6 inline-flex items-center gap-3 p-1 rounded-xl bg-slate-200 text-xs font-semibold">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  !billingAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  billingAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <span>Annually</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {/* Free Trial */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Free Trial</div>
                <div className="text-xs text-slate-500 mt-1">Test the voice assistant</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">$0</span>
                  <span className="text-xs text-slate-500"> / 14 days</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>500 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>1 AI voice assistant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>1 local phone number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Standard transcription</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Pro Sales</div>
                <div className="text-xs text-slate-500 mt-1">For growing sales teams</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${billingAnnual ? '119' : '149'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>2,000 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>5 AI voice assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>3 phone numbers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>CRM &amp; Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>AI Sales Intelligence</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Business (Popular) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-600 relative shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Business Growth</div>
                <div className="text-xs text-slate-500 mt-1">High-volume sales qualification</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${billingAnnual ? '319' : '399'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>6,000 voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>15 AI assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>10 phone numbers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Full HubSpot &amp; Salesforce 2-way sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Custom vector knowledge ingestion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>RBAC &amp; team management</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                Deploy Business Plan
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Enterprise Scale</div>
                <div className="text-xs text-slate-500 mt-1">Custom infrastructure &amp; SLA</div>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ${billingAnnual ? '799' : '999'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>25,000+ voice minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Unlimited AI assistants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Custom SIP trunking (BYOC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Fine-tuned company voice model</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated VPC &amp; 99.99% SLA</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onStartFree}
                className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-semibold text-sm text-slate-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 py-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to deploy your first AI Sales Voice Assistant?
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Create an isolated workspace, upload company knowledge, and test live calls in less than 5 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg transition-all cursor-pointer"
            >
              Start Free Trial Now &rarr;
            </button>
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              Open Interactive Demo Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">VocalPulse AI</span>
            <span>&bull; Enterprise Multi-Tenant Telephony Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <span>SOC2 Type II Certified</span>
            <span>HIPAA Ready</span>
            <span>GDPR Compliant</span>
            <span>TLS 1.3 Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
