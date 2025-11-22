'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusIcon, Edit, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface TeamDialogProps {
  team?: {
    id: string
    name: string
    description: string | null
    leadId: string | null
    isActive: boolean
  }
  trigger?: React.ReactNode
}

export function TeamDialog({ team, trigger }: TeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(team?.name || '')
  const [description, setDescription] = useState(team?.description || '')
  const [leadId, setLeadId] = useState(team?.leadId || '')
  const [isActive, setIsActive] = useState(team?.isActive ?? true)
  const [users, setUsers] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchUsers()
      if (team?.id) {
        fetchTeamMembers()
      }
    }
  }, [open, team?.id])

  useEffect(() => {
    if (team) {
      setName(team.name)
      setDescription(team.description || '')
      setLeadId(team.leadId || '')
      setIsActive(team.isActive)
    }
  }, [team])

  const fetchUsers = async () => {
    const res = await fetch('/api/users?role=TEAM_LEAD,WORKER')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }

  const fetchTeamMembers = async () => {
    if (!team?.id) return
    const res = await fetch(`/api/admin/teams/${team.id}/members`)
    if (res.ok) {
      const data = await res.json()
      setTeamMembers(data)
      setSelectedMembers(data.map((m: any) => m.userId))
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = team ? `/api/admin/teams/${team.id}` : '/api/admin/teams'
      const method = team ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          leadId: leadId || null,
          isActive,
          memberIds: selectedMembers
        })
      })

      if (res.ok) {
        setOpen(false)
        if (!team) {
          setName('')
          setDescription('')
          setLeadId('')
          setIsActive(true)
          setSelectedMembers([])
        }
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error(error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getMemberJoinDate = (userId: string) => {
    const member = teamMembers.find(m => m.userId === userId)
    return member?.joinedAt ? format(new Date(member.joinedAt), 'd MMM yyyy', { locale: tr }) : null
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ekip Adı *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Montaj Ekibi 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ekip hakkında kısa açıklama..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadId">Ekip Lideri</Label>
            <Select value={leadId || 'none'} onValueChange={(v) => setLeadId(v === 'none' ? '' : v)}>
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
                  const joinDate = getMemberJoinDate(user.id)
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
                      {isSelected && joinDate && (
                        <span className="text-xs text-gray-500">
                          Katılma: {joinDate}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs text-gray-500">
              Listeden ekip üyelerini seçin. {team ? 'Katılma tarihleri gösteriliyor.' : 'Yeni üyeler bugün eklenmiş olarak kaydedilecek.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Durum</Label>
            <Select value={isActive.toString()} onValueChange={(v) => setIsActive(v === 'true')}>
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
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Kaydediliyor...' : team ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
