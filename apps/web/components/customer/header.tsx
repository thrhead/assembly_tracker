'use client'

import { signOut, useSession } from 'next-auth/react'
import { MenuIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CustomerHeaderProps {
  onMenuClick: () => void
}

export function CustomerHeader({ onMenuClick }: CustomerHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-indigo-600">Montaj Takip</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{session?.user?.name}</span>
                <span className="text-xs text-gray-500">{session?.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
