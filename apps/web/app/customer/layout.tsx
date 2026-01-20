'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { CustomerHeader } from '@/components/customer/header'
import { CustomerSidebar } from '@/components/customer/sidebar'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader onMenuClick={() => setSidebarOpen(true)} />
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <main>{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
