'use client'

import { useState, useEffect } from 'react'
import { JobFiltersPanel, JobFilters } from '@/components/job-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Job {
    id: string
    title: string
    status: string
    priority: string
    scheduledDate: Date | null
    customer: { company: string }
    assignments: Array<{ team: { name: string } | null }>
    steps: Array<{ id: string; isCompleted: boolean }>
}

interface JobsListClientProps {
    initialJobs: Job[]
    teams: Array<{ id: string; name: string }>
    customers: Array<{ id: string; company: string }>
}

export function JobsListClient({ initialJobs, teams, customers }: JobsListClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [jobs, setJobs] = useState<Job[]>(initialJobs)
    const [loading, setLoading] = useState(false)

    const statusConfig: Record<string, { label: string; color: string }> = {
        'PENDING': { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
        'IN_PROGRESS': { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
        'COMPLETED': { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
        'ON_HOLD': { label: 'Beklemede', color: 'bg-orange-100 text-orange-800' }
    }

    const handleFilterChange = async (filters: JobFilters) => {
        setLoading(true)

        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value instanceof Date ? value.toISOString() : value)
            }
        })

        router.push(`?${params.toString()}`)

        try {
            const response = await fetch(`/api/admin/jobs?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            }
        } catch (error) {
            console.error('Filter error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <JobFiltersPanel
                onFilterChange={handleFilterChange}
                teams={teams}
                customers={customers}
            />

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            )}

            {!loading && (
                <div className="grid gap-4">
                    {jobs.map((job) => {
                        const completedSteps = job.steps.filter(s => s.isCompleted).length
                        const totalSteps = job.steps.length
                        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

                        return (
                            <Link key={job.id} href={`/admin/jobs/${job.id}`}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{job.title}</CardTitle>
                                            <Badge className={statusConfig[job.status]?.color || ''}>
                                                {statusConfig[job.status]?.label || job.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="font-medium">Müşteri:</span> {job.customer.company}</div>
                                            <div><span className="font-medium">Ekip:</span> {job.assignments[0]?.team?.name || 'Atanmadı'}</div>
                                            <div><span className="font-medium">İlerleme:</span> {completedSteps}/{totalSteps} ({progress}%)</div>
                                            <div><span className="font-medium">Tarih:</span> {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}

            {!loading && jobs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Filtre kriterlerinize uygun iş bulunamadı.
                </div>
            )}
        </div>
    )
}
