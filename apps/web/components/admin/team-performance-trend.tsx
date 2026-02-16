'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ComposedChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendData {
    month: string
    jobCount: number
    workHours: number
    expenses: number
}

interface Props {
    data: TrendData[]
}

export function TeamPerformanceTrend({ data }: Props) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground p-8">
                <p>Trend verisi bulunamadı</p>
            </div>
        )
    }

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="month"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}s`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Bar
                        yAxisId="left"
                        dataKey="jobCount"
                        name="İş Sayısı"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="workHours"
                        name="Çalışma Saati"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
