'use client'

import { useState } from 'react'
import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { CustomerHeader } from "@/components/customer/header"
import { CustomerSidebar } from "@/components/customer/sidebar"
import { useSession } from 'next-auth/react'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>
  }

  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> 
      
      <div className="flex-1 flex flex-col min-w-0">
        <CustomerHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          user={session?.user as any} 
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}