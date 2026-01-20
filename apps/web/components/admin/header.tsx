'use client'

import { BellIcon, LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        const unread = data.filter((n: any) => !n.isRead).length
        console.log('AdminHeader: Fetched notifications', { total: data.length, unread })
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }
  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger is handled by Sidebar component */}
        <div className="w-8" />
        <h1 className="font-bold text-lg text-indigo-600">Montaj Takip</h1>
      </div>
      <div className="hidden lg:block">
        {/* Breadcrumbs or page title could go here */}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-gray-100" onClick={() => router.push('/admin/notifications')}>
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-600 rounded-full ring-2 ring-white" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                A
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
