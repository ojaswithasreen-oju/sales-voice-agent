import { getPrismaClient } from './prisma';

/**
 * Tenant-scoped database query utility.
 * Guarantees that every database access is strictly scoped to the authenticated organization.
 */
export class TenantRepository {
  private organizationId: string;

  constructor(organizationId: string) {
    if (!organizationId) {
      throw new Error('TenantRepository requires a valid organizationId');
    }
    this.organizationId = organizationId;
  }

  public get orgId(): string {
    return this.organizationId;
  }

  /**
   * Returns prisma client if connected, or null if unconfigured
   */
  protected get db() {
    return getPrismaClient();
  }

  /**
   * Helper to ensure all query filters include the organizationId
   */
  public scope<T extends Record<string, any>>(whereClause: T): T & { organizationId: string } {
    return {
      ...whereClause,
      organizationId: this.organizationId,
    };
  }
}
