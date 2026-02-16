'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WifiOffIcon } from 'lucide-react'

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <WifiOffIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Bir şeyler ters gitti</h2>
            <p className="mb-6 text-gray-600">
              Uygulama yüklenirken bir sorun oluştu. İnternet bağlantınızı kontrol edin.
            </p>
            <Button onClick={() => reset()}>Yeniden Dene</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
