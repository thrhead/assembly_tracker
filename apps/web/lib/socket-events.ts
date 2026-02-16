// Socket.IO Event Types and Emitters

export type SocketEvent =
    | 'job:updated'
    | 'job:completed'
    | 'job:assigned'
    | 'cost:submitted'
    | 'cost:approved'
    | 'cost:rejected'
    | 'step:completed'
    | 'team:assigned'
    | 'notification:new'
    | 'photo:uploaded'

export interface PhotoUploadedPayload {
    jobId: string
    stepId: string
    subStepId: string | null
    photoUrl: string
    uploadedBy: string
    uploadedAt: Date
}

export interface JobUpdatedPayload {
    jobId: string
    title: string
    status: string
    updatedBy: string
}

export interface JobCompletedPayload {
    jobId: string
    title: string
    completedBy: string
    completedAt: Date
}

export interface CostSubmittedPayload {
    costId: string
    jobId: string
    amount: number
    category: string
    submittedBy: string
}

export interface CostApprovedPayload {
    costId: string
    jobId: string
    amount: number
    approvedBy: string
}

export interface StepCompletedPayload {
    jobId: string
    stepId: string
    stepTitle: string
    completedBy: string
}

export interface TeamAssignedPayload {
    jobId: string
    jobTitle: string
    teamId: string
    teamName: string
}

export interface NotificationPayload {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    userId?: string
    teamId?: string
}
