'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteTeamButtonProps {
    teamId: string
    teamName: string
}

export function DeleteTeamButton({ teamId, teamName }: DeleteTeamButtonProps) {
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm(`"${teamName}" ekibini silmek istediğinizden emin misiniz?`)) {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Ekip başarıyla silindi')
                router.refresh()
            } else {
                toast.error('Ekip silinemedi')
            }
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
    )
}
