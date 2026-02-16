'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: 'white',
                },
                className: 'border border-gray-200',
            }}
        />
    )
}
