'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="m-4">
                    <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Bir şeyler yanlış gitti</h3>
                        <p className="text-muted-foreground mb-4">
                            Bu bileşen yüklenirken bir hata oluştu.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-4 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-sm text-red-800 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            variant="outline"
                        >
                            Tekrar Dene
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}
