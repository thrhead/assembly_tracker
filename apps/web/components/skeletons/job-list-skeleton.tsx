import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function JobListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex gap-2 mt-3">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
