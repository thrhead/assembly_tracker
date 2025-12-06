'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  Users2Icon,
  CheckCircle2Icon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  TrendingUpIcon
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboardIcon
  },
  {
    title: 'Kullanıcılar',
    href: '/admin/users',
    icon: UsersIcon
  },
  {
    title: 'Müşteriler',
    href: '/admin/customers',
    icon: Users2Icon
  },
  {
    title: 'Ekipler',
    href: '/admin/teams',
    icon: BriefcaseIcon
  },
  {
    title: 'İşler',
    href: '/admin/jobs',
    icon: BriefcaseIcon
  },
  {
    title: 'Onaylar',
    href: '/admin/approvals',
    icon: CheckCircle2Icon
  },
  {
    title: 'Maliyetler',
    href: '/admin/costs',
    icon: TrendingUpIcon
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[55] w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <span>Montaj Takip</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile / Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@montaj.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
