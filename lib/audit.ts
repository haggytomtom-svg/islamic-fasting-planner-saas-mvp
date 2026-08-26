import { prisma } from "@/lib/db";

export type AuditAction =
  | "REGISTER"
  | "LOGIN"
  | "LOGOUT"
  | "EMAIL_VERIFIED"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGED"
  | "MFA_ENROLL_STARTED"
  | "MFA_ENABLED"
  | "MFA_VERIFIED"
  | "RECOVERY_CODE_USED"
  | "TRACKER_CREATE"
  | "TRACKER_DELETE"
  | "MOON_SIGHTING_PUBLISHED"
  | "CHECKOUT_STARTED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_UPDATED"
  | "SUBSCRIPTION_CANCELED"
  | "PAYMENT_FAILED"
  | "ADMIN_USER_UPDATE"
  | "ADMIN_ROLE_CHANGE";

export interface AuditLogInput {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Audit logging must never break the primary operation.
    console.error("[AuditLog] Failed to create audit log:", error);
    return null;
  }
}
