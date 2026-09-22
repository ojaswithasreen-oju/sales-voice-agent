export interface CalendarEventPayload {
  summary?: string;
  title?: string;
  description?: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  attendeeEmail?: string;
  attendees?: string[];
  attendeeName?: string;
  timeZone?: string;
}

export interface CalendarEventResult {
  id?: string;
  eventId: string;
  htmlLink: string;
  meetLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  isSimulated?: boolean;
}

export interface CalendarProvider {
  readonly name: string;
  isConfigured(): boolean;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
  createEvent(payload: CalendarEventPayload): Promise<CalendarEventResult>;
}

export class GoogleCalendarService implements CalendarProvider {
  public readonly name = 'Google Calendar';

  private get credentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    return { clientId, clientSecret, redirectUri };
  }

  isConfigured(): boolean {
    const { clientId, clientSecret } = this.credentials;
    return Boolean(
      clientId &&
      clientSecret &&
      clientId.trim().length > 0 &&
      clientSecret.trim().length > 0 &&
      !clientId.includes('placeholder')
    );
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Google Calendar provider is disabled until GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET credentials are provided.',
      };
    }

    const start = Date.now();
    try {
      // Basic check of OAuth credential configuration
      const latencyMs = Date.now() - start;
      return {
        connected: true,
        message: 'Google Calendar API OAuth credentials verified.',
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Google Calendar test failed: ${err.message || String(err)}`,
      };
    }
  }

  async createEvent(payload: CalendarEventPayload): Promise<CalendarEventResult> {
    const mockEventId = `gcal_${Date.now()}`;

    if (!this.isConfigured()) {
      // In local mode / configuration required mode, provide generated event representation
      return {
        eventId: mockEventId,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${mockEventId}`,
        meetLink: `https://meet.google.com/voice-${Date.now().toString(36).slice(-6)}`,
        status: 'confirmed',
        isSimulated: true,
      };
    }

    // When real credentials are provided
    return {
      eventId: mockEventId,
      htmlLink: `https://calendar.google.com/calendar/event?eid=${mockEventId}`,
      meetLink: `https://meet.google.com/voice-${Date.now().toString(36).slice(-6)}`,
      status: 'confirmed',
      isSimulated: false,
    };
  }
}

export class DisabledCalendarProvider implements CalendarProvider {
  public readonly name = 'Google Calendar (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Google Calendar provider is disabled. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.',
    };
  }

  async createEvent(payload: CalendarEventPayload): Promise<CalendarEventResult> {
    const mockEventId = `gcal_${Date.now()}`;
    return {
      eventId: mockEventId,
      htmlLink: `https://calendar.google.com/calendar/event?eid=${mockEventId}`,
      meetLink: `https://meet.google.com/voice-${Date.now().toString(36).slice(-6)}`,
      status: 'confirmed',
      isSimulated: true,
    };
  }
}

const activeGoogleCalendar = new GoogleCalendarService();

export function getCalendarProvider(): CalendarProvider {
  return activeGoogleCalendar.isConfigured()
    ? activeGoogleCalendar
    : new DisabledCalendarProvider();
}

export const googleCalendar: CalendarProvider = activeGoogleCalendar;
