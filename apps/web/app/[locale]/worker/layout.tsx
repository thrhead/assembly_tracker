'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { WorkerHeader } from '@/components/worker/header'
import { WorkerSidebar } from '@/components/worker/sidebar'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <WorkerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <WorkerHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
