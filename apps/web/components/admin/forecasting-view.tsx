
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BrainCircuit, Clock, BarChart3, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ForecastData {
    title: string
    averageDurationHours: number
    sampleSize: number
}

export function ForecastingView() {
    const t = useTranslations('Admin')
    const tCommon = useTranslations('Common')
    const [forecasts, setForecasts] = useState<ForecastData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchForecasts()
    }, [])

    const fetchForecasts = async () => {
        try {
            const res = await fetch('/api/admin/jobs/forecast')
            const data = await res.json()
            setForecasts(data)
        } catch (error) {
            console.error('Forecast fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">{tCommon('loading')}</div>

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forecasts.length === 0 ? (
                <Card className="col-span-full p-12 flex flex-col items-center justify-center text-muted-foreground italic">
                    <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
                    {t('noData') || 'Henüz yeterli veri toplanmadı.'}
                </Card>
            ) : (
                forecasts.map((item, idx) => (
                    <Card key={idx} className="overflow-hidden border-border hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold text-foreground">
                                        {item.averageDurationHours} <span className="text-sm font-normal text-muted-foreground">saat</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{t('avgDuration') || 'Ortalama Tamamlanma Süresi'}</p>
                                </div>
                                <div className="bg-muted px-2 py-1 rounded text-[10px] font-medium">
                                    {item.sampleSize} {t('samples') || 'örnek veri'}
                                </div>
                            </div>
                            
                            {/* Simple Bar Visualization */}
                            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${Math.min(100, (item.averageDurationHours / 8) * 100)}%` }} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )
}
