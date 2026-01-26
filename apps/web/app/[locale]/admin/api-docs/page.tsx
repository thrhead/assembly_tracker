
'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { LanguagesIcon } from 'lucide-react'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
    const [lang, setLang] = useState<'tr' | 'en'>('tr')

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <div>
                    <h1 className="text-xl font-bold">API Documentation</h1>
                    <p className="text-sm text-muted-foreground">Interactive API explorer for developers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={lang === 'tr' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLang('tr')}
                    >
                        Türkçe
                    </Button>
                    <Button
                        variant={lang === 'en' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLang('en')}
                    >
                        English
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
                <div className="max-w-5xl mx-auto">
                    {(SwaggerUI as any) && (
                        <div className="swagger-ui-custom">
                            <SwaggerUI url={`/api/openapi?lang=${lang}`} />
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info { margin: 20px 0; }
                .swagger-ui .scheme-container { 
                    padding: 20px; 
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    )
}
