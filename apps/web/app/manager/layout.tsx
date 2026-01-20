import { ManagerSidebar } from '@/components/manager/sidebar'
import { ManagerHeader } from '@/components/manager/header'

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <ManagerSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <ManagerHeader />

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
