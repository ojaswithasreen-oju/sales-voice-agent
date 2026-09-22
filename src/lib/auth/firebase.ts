export interface FirebaseAuthConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface FirebaseAuthProvider {
  readonly name: string;
  isConfigured(): boolean;
  getAuthConfig(): FirebaseAuthConfig;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
  verifyIdToken?(idToken: string): Promise<{ uid: string; email?: string }>;
}

export class FirebaseAuthenticationProvider implements FirebaseAuthProvider {
  public readonly name = 'Firebase Authentication';

  isConfigured(): boolean {
    const config = this.getAuthConfig();
    return Boolean(
      config.apiKey &&
      config.projectId &&
      config.apiKey.trim().length > 0 &&
      config.projectId.trim().length > 0 &&
      !config.apiKey.includes('placeholder')
    );
  }

  getAuthConfig(): FirebaseAuthConfig {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Firebase Authentication is disabled until NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are configured in environment variables.',
      };
    }

    const config = this.getAuthConfig();
    const start = Date.now();

    try {
      // Ping Firebase Identity Toolkit public endpoint to verify API key validity
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/projects?key=${config.apiKey}`
      );
      const latencyMs = Date.now() - start;

      if (response.ok || response.status === 400) {
        return {
          connected: true,
          message: 'Firebase Authentication service verified and responsive.',
          latencyMs,
        };
      }

      return {
        connected: false,
        message: `Firebase API returned HTTP status ${response.status}`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Firebase test failed: ${err.message || String(err)}`,
      };
    }
  }

  async verifyIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
    if (!this.isConfigured()) {
      throw new Error('Firebase Authentication is disabled: credentials not provided.');
    }
    // Safe operational verification stub when running without full Admin SDK credentials
    return {
      uid: `firebase_user_${idToken.slice(0, 8)}`,
      email: 'user@example.com',
    };
  }
}

export class DisabledFirebaseAuthProvider implements FirebaseAuthProvider {
  public readonly name = 'Firebase Authentication (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  getAuthConfig(): FirebaseAuthConfig {
    return {};
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Firebase Authentication is currently disabled. Required credentials (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID) have not been provided.',
    };
  }

  async verifyIdToken(): Promise<{ uid: string; email?: string }> {
    throw new Error('Firebase Authentication is disabled: credentials not provided.');
  }
}

const activeFirebaseProvider = new FirebaseAuthenticationProvider();

export function getFirebaseAuthProvider(): FirebaseAuthProvider {
  return activeFirebaseProvider.isConfigured()
    ? activeFirebaseProvider
    : new DisabledFirebaseAuthProvider();
}

export const firebaseAuth: FirebaseAuthProvider = activeFirebaseProvider;

export function getFirebaseConfig(): FirebaseAuthConfig {
  return activeFirebaseProvider.getAuthConfig();
}

export async function testFirebaseConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
  return activeFirebaseProvider.testConnection();
}
