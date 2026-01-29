'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { ApprovalActionCard } from '@/components/admin/approval-action-card'

const AdminJobDetailsTabs = dynamic(
    () => import('@/components/admin/job-details-tabs').then(mod => mod.AdminJobDetailsTabs),
    {
        ssr: false,
        loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 rounded-lg" />
    }
)

interface JobDetailsClientWrapperProps {
    job: any
    workers: { id: string; name: string | null }[]
    teams: { id: string; name: string }[]
    pendingApproval?: any
}

export function JobDetailsClientWrapper({ pendingApproval, ...props }: JobDetailsClientWrapperProps) {
    return (
        <div className="space-y-6">
            {pendingApproval && (
                <ApprovalActionCard approval={pendingApproval} />
            )}
            <AdminJobDetailsTabs {...props} />
        </div>
    )
}
