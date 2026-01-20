'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  SettingsIcon,
  XIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/customer',
    icon: LayoutDashboardIcon
  },
  {
    title: 'İşlerim',
    href: '/customer/jobs',
    icon: BriefcaseIcon
  },
  {
    title: 'Profil & Ayarlar',
    href: '/customer/settings',
    icon: SettingsIcon
  }
]

interface CustomerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomerSidebar({ isOpen, onClose }: CustomerSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b lg:hidden">
          <span className="font-bold text-lg">Menü</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={onClose}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
