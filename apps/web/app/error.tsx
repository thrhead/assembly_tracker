'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-24 w-24 text-red-500" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Hata!</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Bir şeyler yanlış gitti
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                            <p className="text-sm text-red-800 font-mono break-all">
                                {error.message}
                            </p>
                        </div>
                    )}

                    <Button onClick={reset} className="w-full">
                        Tekrar Dene
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
