'use client';

import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeeklyStepsChartProps {
    data: any;
    categories: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function WeeklyStepsChart({ data, categories }: WeeklyStepsChartProps) {
    const [selectedDay, setSelectedDay] = useState<any>(null);

    const { currentWeek, previousWeek } = data;

    // Combine current and previous for the chart
    const chartData = currentWeek.map((day: any, index: number) => ({
        ...day,
        prevTotal: previousWeek[index]?.total || 0,
        displayDate: new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })
    }));

    const handleBarClick = (data: any) => {
        setSelectedDay(data);
    };

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Haftalık Tamamlanan Adımlar</CardTitle>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Bu Hafta: {currentWeek.reduce((acc: number, d: any) => acc + d.total, 0)}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                Geçen Hafta: {previousWeek.reduce((acc: number, d: any) => acc + d.total, 0)}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart 
                                data={chartData} 
                                onClick={(e: any) => {
                                    if (e && e.activePayload && e.activePayload.length > 0) {
                                        handleBarClick(e.activePayload[0].payload);
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="displayDate" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                    }}
                                />
                                <Legend verticalAlign="top" height={36}/>
                                
                                {categories.map((cat, index) => (
                                    <Bar 
                                        key={cat} 
                                        dataKey={cat} 
                                        stackId="a" 
                                        fill={COLORS[index % COLORS.length]} 
                                        radius={[0, 0, 0, 0]}
                                        barSize={40}
                                    />
                                ))}
                                
                                {/* Benchmark Line - Previous Week */}
                                <Line 
                                    type="monotone" 
                                    dataKey="prevTotal" 
                                    name="Geçen Hafta (BM)" 
                                    stroke="#94a3b8" 
                                    strokeWidth={2} 
                                    strokeDasharray="5 5"
                                    dot={{ r: 4, fill: '#94a3b8' }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-slate-400 mt-4">
                        Grafikteki sütunlara tıklayarak o güne ait iş detaylarını görebilirsiniz.
                    </p>
                </CardContent>
            </Card>

            {selectedDay && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <CardTitle className="text-md flex justify-between items-center">
                            <span>{new Date(selectedDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} - İş Detayları</span>
                            <Badge>{selectedDay.total} Adım Tamamlandı</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedDay.jobs.length > 0 ? (
                                selectedDay.jobs.map((job: any) => (
                                    <div key={job.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="font-medium text-sm">{job.title}</span>
                                        <Badge variant="secondary" className="text-[10px]">İş Detayına Git</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic">Bu güne ait detaylı iş kaydı bulunamadı.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
