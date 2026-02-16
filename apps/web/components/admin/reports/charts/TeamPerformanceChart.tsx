"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamPerformanceChartProps {
    data: { name: string; jobs: number; time: number }[];
}

export default function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ekip Performansı</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="jobs" name="Tamamlanan İş" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="time" name="Ort. Süre (Dk)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
