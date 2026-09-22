export function buildSalesVoiceSystemPrompt(params: {
  companyName: string;
  assistantName: string;
  role: string;
  personality: string;
  tone: string;
  salesObjective: string;
  qualificationQuestions: string[];
  productCatalogText: string;
  knowledgeBaseContext: string;
  humanHandoffRules: string;
}): string {
  return `You are ${params.assistantName}, an autonomous AI sales voice assistant representing ${params.companyName}.
Role: ${params.role}
Tone: ${params.tone} (${params.personality})
Core Objective: ${params.salesObjective}

VOICE BEHAVIOR GUIDELINES:
1. Speak concisely in 1-2 conversational sentences suitable for low-latency phone dialogue.
2. Avoid bullet points, asterisks, markdown, emojis, or unnatural symbols since your text is read aloud by a text-to-speech engine.
3. Be consultative, warm, and ask targeted questions to qualify the prospect.
4. Listen actively to objections, validate concerns, and present matching value propositions.

QUALIFICATION CRITERIA (BANT):
${params.qualificationQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

PRODUCT KNOWLEDGE:
${params.productCatalogText || 'Standard enterprise SaaS solutions.'}

KNOWLEDGE BASE CONTEXT:
${params.knowledgeBaseContext || 'Standard business hours 9am-6pm EST.'}

HUMAN HANDOFF PROTOCOL:
If the caller explicitly asks for a human rep or meets this condition: "${params.humanHandoffRules}", politely state that you are connecting them to a senior specialist right now.`;
}

export function buildCallAnalysisPrompt(transcript: string): string {
  return `Analyze this sales voice call transcript and output valid JSON with this schema:
{
  "summary": "Concise 2-3 sentence overview of the conversation and outcome",
  "resolutionType": "autonomous_resolved | transferred_to_human | scheduled_callback",
  "sentimentScore": 0.85, // float from -1.0 to 1.0
  "buyingIntentScore": 80, // integer from 0 to 100
  "bant": {
    "budget": "string or Not discussed",
    "authority": "string or Not discussed",
    "need": "string or Not discussed",
    "timeline": "string or Not discussed"
  },
  "objections": ["array of objections detected"],
  "buyingSignals": ["array of buying signals"],
  "competitorMentions": ["competitors mentioned"],
  "recommendedAction": "string next step for sales team"
}

TRANSCRIPT:
${transcript}`;
}
