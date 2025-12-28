import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostTrendChartProps {
    data: { date: string; amount: number }[];
}

export default function CostTrendChart({ data }: CostTrendChartProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Maliyet Trendi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                             <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date" 
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
                                tickFormatter={(value) => `₺${value}`}
                            />
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                labelFormatter={(label) => `Tarih: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
