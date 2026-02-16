'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerSchema, CreateUserAdminInput } from '@/lib/validations-edge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateUserAction, createUserAction } from '@/lib/actions/users'
import { Switch } from "@/components/ui/switch"

// Schema for editing (password optional)
const userEditSchema = registerSchema.extend({
  password: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

type FormData = z.infer<typeof userEditSchema>

interface UserDialogProps {
  user?: any
  trigger?: React.ReactNode
}

export function UserDialog({ user, trigger }: UserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? userEditSchema : registerSchema),
    defaultValues: user ? {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'WORKER',
      isActive: user.isActive,
      password: ''
    } : {
      role: 'WORKER',
      isActive: true
    }
  })

  // Watch role to conditionally show fields if needed, or ensuring value updates
  const currentRole = watch('role')
  const currentStatus = watch('isActive')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      if (isEditing) {
        await updateUserAction({
          id: user.id,
          ...data,
          password: data.password || undefined
        })
        toast.success('Kullanıcı güncellendi')
      } else {
        await createUserAction(data as any)
        toast.success('Kullanıcı başarıyla oluşturuldu')
      }

      setOpen(false)
      if (!isEditing) reset()
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input id="name" {...register('name')} placeholder="Ahmet Yılmaz" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" {...register('email')} placeholder="ornek@email.com" />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Şifre {isEditing && '(Değiştirmek istemiyorsanız boş bırakın)'}</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" {...register('phone')} placeholder="555 123 4567" />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select onValueChange={(val) => setValue('role', val as any)} defaultValue={user?.role || "WORKER"}>
              <SelectTrigger>
                <SelectValue placeholder="Rol seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Yönetici (Admin)</SelectItem>
                <SelectItem value="MANAGER">Müdür (Manager)</SelectItem>
                <SelectItem value="TEAM_LEAD">Ekip Lideri</SelectItem>
                <SelectItem value="WORKER">Çalışan (Worker)</SelectItem>
                <SelectItem value="CUSTOMER">Müşteri</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Hesap Durumu</Label>
                <div className="text-sm text-muted-foreground">
                  {currentStatus ? 'Aktif' : 'Pasif/Engelli'}
                </div>
              </div>
              <Switch
                checked={currentStatus}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
