'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { User, Clock, CheckCircle2 } from 'lucide-react'

interface MemberStat {
    userId: string
    name: string | null
    completedSteps: number
    workHours: number
}

interface Props {
    members: MemberStat[]
}

export function TeamMemberStats({ members }: Props) {
    if (members.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Üye istatistiği bulunamadı
            </div>
        )
    }

    // Sort by performance (completed steps)
    const sortedMembers = [...members].sort((a, b) => b.completedSteps - a.completedSteps)
    const maxSteps = Math.max(...members.map(m => m.completedSteps), 1)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {sortedMembers.map((member) => (
                <Card key={member.userId} className="overflow-hidden border-none bg-muted/30">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium leading-none">{member.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Saha Personeli</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3" /> Tamamlanan Adımlar
                                    </span>
                                    <span className="font-bold">{member.completedSteps}</span>
                                </div>
                                <Progress value={(member.completedSteps / maxSteps) * 100} className="h-1.5" />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" /> Toplam Mesai
                                </span>
                                <Badge variant="secondary" className="font-mono text-[10px]">
                                    {member.workHours} Saat
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
