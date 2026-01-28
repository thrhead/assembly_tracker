'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const ApprovalsListClient = dynamic(
    () => import('@/components/admin/approvals-list-client').then(mod => mod.ApprovalsListClient),
    {
        ssr: false,
        loading: () => (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-500">Yükleniyor...</p>
            </div>
        )
    }
)

interface ApprovalsListClientProps {
    approvals: any[]
}

export function ApprovalsListWrapper(props: ApprovalsListClientProps) {
    return <ApprovalsListClient {...props} />
}
