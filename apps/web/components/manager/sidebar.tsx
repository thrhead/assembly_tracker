'use client'

import { Link, usePathname } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboardIcon,
    BriefcaseIcon,
    CheckCircle2Icon,
    XIcon,
    FileBarChartIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/manager',
        icon: LayoutDashboardIcon
    },
    {
        title: 'İşler',
        href: '/manager/jobs',
        icon: BriefcaseIcon
    },
    {
        title: 'Onaylar',
        href: '/manager/approvals',
        icon: CheckCircle2Icon
    },
    {
        title: 'Raporlar',
        href: '/manager/reports',
        icon: FileBarChartIcon
    }
]

interface ManagerSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function ManagerSidebar({ isOpen, onClose }: ManagerSidebarProps) {
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
                <div className="h-16 flex items-center justify-between px-6 border-b">
                    <span className="font-bold text-lg text-indigo-600">Yönetici Paneli</span>
                    <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>

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
                    className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}
        </>
    )
}