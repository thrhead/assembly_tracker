'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2Icon, PlusIcon, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTeamAction, updateTeamAction } from '@/lib/actions/teams'

const teamSchema = z.object({
  name: z.string().min(2, 'Ekip adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  leadId: z.string().optional().nullable(),
  isActive: z.boolean(),
  memberIds: z.array(z.string()).optional()
})

type TeamFormData = z.infer<typeof teamSchema>

interface User {
  id: string
  name: string | null
  role: string
}

interface TeamDialogProps {
  team?: {
    id: string
    name: string
    description: string | null
    leadId: string | null
    isActive: boolean
  }
  users: User[]
  currentMembers?: string[] // IDs of current members if editing
  trigger?: React.ReactNode
}

export function TeamDialog({ team, users, currentMembers = [], trigger }: TeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name || '',
      description: team?.description || '',
      leadId: team?.leadId || 'none',
      isActive: team?.isActive ?? true,
      memberIds: currentMembers
    }
  })

  // Update form when team prop changes (e.g., in a list where the same dialog instance might be reused or remounted)
  useEffect(() => {
    if (team) {
      setValue('name', team.name)
      setValue('description', team.description || '')
      setValue('leadId', team.leadId || 'none')
      setValue('isActive', team.isActive)
      setValue('memberIds', currentMembers)
    }
  }, [team, currentMembers, setValue])

  const selectedMembers = watch('memberIds') || []

  const toggleMember = (userId: string) => {
    const current = selectedMembers
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId]
    setValue('memberIds', updated)
  }

  const onSubmit = async (data: TeamFormData) => {
    setLoading(true)
    try {
      if (team) {
        await updateTeamAction(team.id, data)
        toast.success('Ekip güncellendi')
      } else {
        await createTeamAction(data)
        toast.success('Ekip oluşturuldu')
      }

      setOpen(false)
      if (!team) reset()
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Yeni Ekip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{team ? 'Ekip Düzenle' : 'Yeni Ekip Ekle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ekip Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Örn: Montaj Ekibi 1"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Ekip hakkında kısa açıklama..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadId">Ekip Lideri</Label>
            <Select
              onValueChange={(v) => setValue('leadId', v)}
              defaultValue={team?.leadId || 'none'}
            >
              <SelectTrigger id="leadId">
                <SelectValue placeholder="Lider seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Atanmamış</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ekip Üyeleri</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-[250px] overflow-y-auto bg-gray-50">
              {users.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Uygun çalışan bulunamadı.</p>
              ) : (
                users.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').map((user) => {
                  const isSelected = selectedMembers.includes(user.id)

                  return (
                    <div key={user.id} className="flex items-center justify-between space-x-2 py-1">
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="checkbox"
                          id={`member-${user.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={isSelected}
                          onChange={() => toggleMember(user.id)}
                        />
                        <label
                          htmlFor={`member-${user.id}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {user.name}
                          {user.role === 'TEAM_LEAD' && (
                            <span className="ml-2 text-xs text-indigo-600">(Lider)</span>
                          )}
                        </label>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs text-gray-500">
              Listeden ekip üyelerini seçin.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Durum</Label>
            <Select
              onValueChange={(v) => setValue('isActive', v === 'true')}
              defaultValue={String(team?.isActive ?? true)}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Kaydediliyor...' : team ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
