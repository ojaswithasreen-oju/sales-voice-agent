import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, hasPermission } from './roles';

export interface AuthenticatedContext {
  userId: string;
  userEmail: string;
  organizationId: string;
  role: UserRole;
  isSuperAdmin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthenticatedContext;
    }
  }
}

/**
 * Server-side authorization middleware enforcing strict multi-tenant isolation.
 * Resolves context strictly from authenticated session token / verified session,
 * never blindly trusting organizationId supplied by the client.
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authContext = req.authContext;

    if (!authContext) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid authenticated session required',
      });
    }

    if (!authContext.organizationId) {
      return res.status(403).json({
        error: 'TenantForbidden',
        message: 'User does not belong to an active organization',
      });
    }

    if (!hasPermission(authContext.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${permission}`,
        userRole: authContext.role,
      });
    }

    next();
  };
}

/**
 * Validates that an entity requested by ID belongs to the tenant in authContext.
 */
export function assertTenantOwnership(
  entityOrgId: string,
  authContext: AuthenticatedContext
): void {
  if (entityOrgId !== authContext.organizationId) {
    const error: any = new Error('Cross-tenant resource access strictly prohibited');
    error.status = 403;
    error.code = 'CROSS_TENANT_VIOLATION';
    throw error;
  }
}
