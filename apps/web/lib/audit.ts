
import { prisma } from './db';
import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
    // Auth - No dedicated Auth model, but actions relate to Users
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',

    // User
    USER_CREATE = 'USER_CREATE',
    USER_UPDATE = 'USER_UPDATE',
    USER_DELETE = 'USER_DELETE',

    // Job
    JOB_CREATE = 'JOB_CREATE',
    JOB_UPDATE = 'JOB_UPDATE',
    JOB_DELETE = 'JOB_DELETE',
    JOB_STATUS_CHANGE = 'JOB_STATUS_CHANGE',

    // Team
    TEAM_ASSIGNMENT = 'TEAM_ASSIGNMENT',
    TEAM_MEMBER_ADD = 'TEAM_MEMBER_ADD',
    TEAM_MEMBER_REMOVE = 'TEAM_MEMBER_REMOVE',

    // Approval
    APPROVAL_REQUEST = 'APPROVAL_REQUEST',
    APPROVAL_APPROVE = 'APPROVAL_APPROVE',
    APPROVAL_REJECT = 'APPROVAL_REJECT',

    // System
    API_KEY_CREATE = 'API_KEY_CREATE',
    WEBHOOK_CREATE = 'WEBHOOK_CREATE'
}

export interface AuditDetails {
    resourceId?: string;
    resourceName?: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
}

/**
 * Logs a critical system action to the database.
 * Uses the existing SystemLog model with level="AUDIT".
 */
export async function logAudit(
    userId: string,
    action: AuditAction | string,
    details: AuditDetails
) {
    try {
        await prisma.systemLog.create({
            data: {
                level: 'AUDIT',
                message: action,
                userId: userId,
                meta: details as any, // Json in Prisma
                platform: 'web', // Default to web, could be inferred
                createdAt: new Date(),
            },
        });
    } catch (error) {
        // Fallback: don't crash the app if logging fails, but log to console
        console.error('[AuditService] Failed to create audit log:', error);
    }
}
