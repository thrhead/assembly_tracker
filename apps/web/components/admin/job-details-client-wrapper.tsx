'use client'

import dynamic from 'next/dynamic'
import React from 'react'

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
}

export function JobDetailsClientWrapper(props: JobDetailsClientWrapperProps) {
    return <AdminJobDetailsTabs {...props} />
}
