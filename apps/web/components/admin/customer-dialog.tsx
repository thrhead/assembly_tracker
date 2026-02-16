'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createCustomerAction } from '@/lib/actions/customers'

const customerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Firma adı en az 2 karakter olmalıdır'),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
})


// Schema for editing (password optional)
const customerEditSchema = customerSchema.extend({
  password: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof customerEditSchema>

import { updateCustomerAction } from '@/lib/actions/customers'

interface CustomerDialogProps {
  customer?: any
  trigger?: React.ReactNode
}

export function CustomerDialog({ customer, trigger }: CustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const isEditing = !!customer

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? customerEditSchema : customerSchema),
    defaultValues: customer ? {
      name: customer.user.name || '',
      email: customer.user.email || '',
      phone: customer.user.phone || '',
      company: customer.company || '',
      address: customer.address || '',
      taxId: customer.taxId || '',
      notes: customer.notes || '',
      password: ''
    } : undefined
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      if (isEditing) {
        await updateCustomerAction({
          id: customer.id,
          ...data,
          password: data.password || undefined
        })
        toast.success('Müşteri güncellendi')
      } else {
        await createCustomerAction(data as any)
        toast.success('Müşteri başarıyla oluşturuldu')
      }

      setOpen(false)
      if (!isEditing) reset()
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Müşteri oluşturulurken bir hata oluştu')
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
            Yeni Müşteri
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Yetkili Kişi</Label>
              <Input id="name" {...register('name')} placeholder="Ad Soyad" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Firma Adı</Label>
            <Input id="company" {...register('company')} placeholder="Firma Ünvanı" />
            {errors.company && (
              <p className="text-sm text-red-500">{errors.company.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId">Vergi No</Label>
              <Input id="taxId" {...register('taxId')} placeholder="Opsiyonel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" {...register('address')} placeholder="Opsiyonel" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea id="notes" {...register('notes')} placeholder="Müşteri hakkında notlar..." />
          </div>

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
