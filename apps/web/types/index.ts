import { User, Job, JobStep, Team, Customer, Notification, Approval, CostTracking } from '@prisma/client'

// Extended Types with Relations
export type UserWithRelations = User & {
  customerProfile?: Customer | null
  ledTeams?: Team[]
  teamMemberships?: Array<{
    team: Team
  }>
}

export type JobWithRelations = Job & {
  customer: Customer & {
    user: User
  }
  team?: Team | null
  createdBy: User
  steps: JobStep[]
  assignments?: Array<{
    user: User
  }>
}

export type TeamWithRelations = Team & {
  lead: User
  members: Array<{
    user: User
  }>
}

// API Response Types
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard Stats Types
export type DashboardStats = {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  pendingApprovals: number
  totalCost: number
  unreadNotifications: number
}

// Job Stats Types
export type JobStats = {
  status: string
  count: number
  percentage: number
}

// Chart Data Types
export type ChartDataPoint = {
  name: string
  value: number
  fill?: string
}

export type TimeSeriesDataPoint = {
  date: string
  completed: number
  inProgress: number
  pending: number
}

// Session User Type
export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
}
