'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-4">
                        <FileQuestion className="h-24 w-24 text-gray-400" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Sayfa Bulunamadı
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Aradığınız sayfa bulunamadı veya taşınmış olabilir.
                    </p>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" asChild>
                            <Link href="/">Ana Sayfa</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin">Dashboard</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
