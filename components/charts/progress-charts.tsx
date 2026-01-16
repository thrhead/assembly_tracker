'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface ProgressChartsProps {
    totalSteps: number
    completedSteps: number
    blockedSteps: number
    steps: {
        title: string
        isCompleted: boolean
        blockedAt: Date | null
    }[]
}

const COLORS = {
    completed: '#10b981',
    pending: '#6b7280',
    blocked: '#ef4444'
}

export function ProgressCharts({ totalSteps, completedSteps, blockedSteps, steps }: ProgressChartsProps) {
    const pendingSteps = totalSteps - completedSteps - blockedSteps

    const pieData = [
        { name: 'Tamamlandı', value: completedSteps, color: COLORS.completed },
        { name: 'Devam Ediyor', value: pendingSteps, color: COLORS.pending },
        { name: 'Bloklandı', value: blockedSteps, color: COLORS.blocked }
    ].filter(item => item.value > 0)

    const barData = steps.map((step, index) => ({
        name: `Adım ${index + 1}`,
        durum: step.isCompleted ? 100 : step.blockedAt ? -50 : 50
    }))

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">İlerleme Durumu</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Adım Bazında Durum</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[-100, 100]} ticks={[-50, 0, 50, 100]} />
                            <Tooltip
                                formatter={(value: number) => {
                                    if (value === 100) return ['Tamamlandı', 'Durum']
                                    if (value === -50) return ['Bloklandı', 'Durum']
                                    return ['Devam Ediyor', 'Durum']
                                }}
                            />
                            <Bar dataKey="durum" fill="#8884d8">
                                {barData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.durum === 100 ? COLORS.completed : entry.durum === -50 ? COLORS.blocked : COLORS.pending}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
