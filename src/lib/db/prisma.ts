export interface PrismaClient {
  $queryRaw: (query: TemplateStringsArray, ...values: any[]) => Promise<any>;
  organization?: any;
  user?: any;
  assistant?: any;
  phoneNumber?: any;
  product?: any;
  knowledgeSource?: any;
  customer?: any;
  lead?: any;
  callRecord?: any;
  appointment?: any;
  integration?: any;
  auditLog?: any;
  [key: string]: any;
}

let prismaInstance: PrismaClient | null = null;

/**
 * Returns a PrismaClient instance if DATABASE_URL is configured.
 * Safely handles missing database connection string without crashing the server.
 */
export function getPrismaClient(): PrismaClient | null {
  if (prismaInstance) {
    return prismaInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // Database connection string is pending configuration in .env
    return null;
  }

  try {
    // Dynamic require to prevent bundling or type errors when client generation is pending
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prismaPkg = require('@prisma/client');
    const ClientConstructor = prismaPkg?.PrismaClient;
    if (ClientConstructor) {
      prismaInstance = new ClientConstructor({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return prismaInstance;
  } catch (error) {
    console.error('[Prisma Client] Failed to initialize database client:', error);
    return null;
  }
}

/**
 * Health check verification for PostgreSQL / Supabase connection
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  const db = getPrismaClient();
  if (!db) {
    return {
      connected: false,
      message: 'DATABASE_URL environment variable is not configured.',
    };
  }

  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1 as health_check`;
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      message: 'PostgreSQL connection verified via Prisma.',
      latencyMs,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection failed: ${error.message || String(error)}`,
    };
  }
}
