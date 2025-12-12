'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerSchema } from '@/lib/validations'
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
import { createUserAction } from '@/lib/actions/users'

type FormData = z.infer<typeof registerSchema>

export function UserDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'WORKER'
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await createUserAction(data)

      toast.success('Kullanıcı başarıyla oluşturuldu')
      setOpen(false)
      reset()
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Kullanıcı oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
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
            <Label htmlFor="password">Şifre</Label>
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
            <Select onValueChange={(val) => setValue('role', val as any)} defaultValue="WORKER">
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

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
