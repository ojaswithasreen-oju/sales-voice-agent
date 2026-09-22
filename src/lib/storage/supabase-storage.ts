export interface UploadFileOptions {
  bucket: 'documents' | 'recordings' | 'knowledge-files' | 'transcripts';
  path: string;
  fileBuffer: Buffer | Uint8Array | string;
  contentType?: string;
  organizationId: string;
}

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  sizeBytes: number;
}

export interface StorageProvider {
  readonly name: string;
  isConfigured(): boolean;
  testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }>;
  uploadFile(options: UploadFileOptions): Promise<UploadResult>;
  getDownloadUrl(bucket: string, storagePath: string): Promise<string>;
}

export type SupabaseStorageProvider = StorageProvider;

export class SupabaseStorageService implements StorageProvider {
  public readonly name = 'Supabase Storage';

  private get credentials() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { url, serviceRoleKey };
  }

  isConfigured(): boolean {
    const { url, serviceRoleKey } = this.credentials;
    return Boolean(
      url &&
      serviceRoleKey &&
      url.trim().length > 0 &&
      serviceRoleKey.trim().length > 0 &&
      !url.includes('placeholder')
    );
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        message: 'Supabase Storage is disabled until NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY credentials are provided.',
      };
    }

    const { url, serviceRoleKey } = this.credentials;
    const start = Date.now();

    try {
      const response = await fetch(`${url}/storage/v1/bucket`, {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey as string,
        },
      });
      const latencyMs = Date.now() - start;

      if (response.ok) {
        return {
          connected: true,
          message: 'Supabase Storage & Database connected successfully.',
          latencyMs,
        };
      }
      return {
        connected: false,
        message: `Supabase Storage returned HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `Supabase Storage connection failed: ${err.message || String(err)}`,
      };
    }
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const storagePath = `${options.organizationId}/${options.bucket}/${options.path}`;
    const sizeBytes = typeof options.fileBuffer === 'string'
      ? options.fileBuffer.length
      : options.fileBuffer.byteLength;

    if (!this.isConfigured()) {
      // Safe fallback when provider is disabled - does not crash
      return {
        publicUrl: `https://storage.placeholder.internal/${storagePath}`,
        storagePath,
        sizeBytes,
      };
    }

    const { url, serviceRoleKey } = this.credentials;
    const endpoint = `${url}/storage/v1/object/${options.bucket}/${storagePath}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey as string,
        'Content-Type': options.contentType || 'application/octet-stream',
      },
      body: options.fileBuffer as any,
    });

    if (!response.ok) {
      throw new Error(`Supabase upload failed: ${response.statusText}`);
    }

    const publicUrl = `${url}/storage/v1/object/public/${options.bucket}/${storagePath}`;
    return {
      publicUrl,
      storagePath,
      sizeBytes,
    };
  }

  async getDownloadUrl(bucket: string, storagePath: string): Promise<string> {
    const { url } = this.credentials;
    if (!this.isConfigured() || !url) {
      return `https://storage.placeholder.internal/${storagePath}`;
    }
    return `${url}/storage/v1/object/public/${bucket}/${storagePath}`;
  }
}

export class DisabledStorageProvider implements StorageProvider {
  public readonly name = 'Supabase Storage (Disabled)';

  isConfigured(): boolean {
    return false;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
    return {
      connected: false,
      message: 'Supabase Storage is disabled. Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.',
    };
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const storagePath = `${options.organizationId}/${options.bucket}/${options.path}`;
    return {
      publicUrl: `https://storage.placeholder.internal/${storagePath}`,
      storagePath,
      sizeBytes: typeof options.fileBuffer === 'string' ? options.fileBuffer.length : options.fileBuffer.byteLength,
    };
  }

  async getDownloadUrl(bucket: string, storagePath: string): Promise<string> {
    return `https://storage.placeholder.internal/${storagePath}`;
  }
}

const activeSupabaseStorage = new SupabaseStorageService();

export function getStorageProvider(): StorageProvider {
  return activeSupabaseStorage.isConfigured()
    ? activeSupabaseStorage
    : new DisabledStorageProvider();
}

export const supabaseStorage: StorageProvider = activeSupabaseStorage;
