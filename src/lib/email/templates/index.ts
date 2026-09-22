export function renderDemoBookedEmail(params: {
  prospectName: string;
  companyName: string;
  meetingTime: string;
  meetingLink?: string;
  assistantName: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b0f19; color: #f1f5f9; border-radius: 12px;">
      <h2 style="color: #6366f1; margin-top: 0;">Sales Demo Confirmed</h2>
      <p>Hello <strong>${params.prospectName}</strong>,</p>
      <p>Thank you for speaking with our AI voice assistant, <strong>${params.assistantName}</strong>.</p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <p style="margin: 0 0 8px 0;"><strong>Company:</strong> ${params.companyName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Scheduled Time:</strong> ${params.meetingTime}</p>
        ${params.meetingLink ? `<p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${params.meetingLink}" style="color: #818cf8;">${params.meetingLink}</a></p>` : ''}
      </div>
      <p style="color: #94a3b8; font-size: 14px;">We look forward to demonstrating how our voice intelligence platform can accelerate your revenue pipeline.</p>
    </div>
  `;
}

export function renderLeadQualifiedAlertEmail(params: {
  repName: string;
  prospectName: string;
  company: string;
  phone: string;
  budget: string;
  buyingIntentScore: number;
  callSummary: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b0f19; color: #f1f5f9; border-radius: 12px;">
      <div style="display: inline-block; padding: 4px 10px; background: #065f46; color: #34d399; font-weight: bold; border-radius: 6px; font-size: 12px; margin-bottom: 12px;">HIGH INTENT LEAD QUALIFIED</div>
      <h2 style="margin: 0 0 16px 0; color: #ffffff;">Action Required: New Qualified Lead</h2>
      <p>Hey ${params.repName}, our AI voice assistant just finished a call with a high-intent prospect:</p>
      <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
        <p style="margin: 0 0 8px 0;"><strong>Prospect:</strong> ${params.prospectName} (${params.company})</p>
        <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${params.phone}</p>
        <p style="margin: 0 0 8px 0;"><strong>Budget:</strong> ${params.budget}</p>
        <p style="margin: 0 0 8px 0;"><strong>Buying Intent Score:</strong> <span style="color: #34d399; font-weight: bold;">${params.buyingIntentScore}/100</span></p>
        <p style="margin: 12px 0 4px 0; font-weight: bold; color: #cbd5e1;">Call Summary:</p>
        <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">${params.callSummary}</p>
      </div>
    </div>
  `;
}
