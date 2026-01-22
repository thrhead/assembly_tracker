'use client'

import { BellIcon, LogOutIcon, MenuIcon } from 'lucide-react'
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
import { useRouter } from '@/lib/navigation'

interface ManagerHeaderProps {
    onMenuClick?: () => void
}

export function ManagerHeader({ onMenuClick }: ManagerHeaderProps) {
    const router = useRouter()
    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
                    <MenuIcon className="h-5 w-5" />
                </Button>
                <h1 className="font-bold text-lg text-indigo-600">Montaj Takip</h1>
            </div>
            <div className="hidden lg:block">
                {/* Breadcrumbs or page title could go here */}
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="h-5 w-5 text-gray-500" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                Y
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hesabım (Yönetici)</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/manager/profile')}>
                            Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => signOut({ callbackUrl: '/login' })}>
                            <LogOutIcon className="mr-2 h-4 w-4" />
                            Çıkış Yap
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}