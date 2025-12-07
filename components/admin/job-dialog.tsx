'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusIcon, Loader2Icon, XIcon, ChevronUpIcon, ChevronDownIcon, CornerDownRightIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const jobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  teamId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledEndDate: z.string().optional(),
})

type FormData = z.infer<typeof jobSchema>

interface Customer {
  id: string
  company: string
  user: { name: string }
}

interface Team {
  id: string
  name: string
}

interface ChecklistStep {
  title: string
  description?: string
  subSteps?: { title: string }[]
}

interface Template {
  id: string
  name: string
  steps: ChecklistStep[]
}

export function JobDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [steps, setSteps] = useState<ChecklistStep[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      priority: 'MEDIUM'
    }
  })

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch('/api/customers').then(res => res.json()),
        fetch('/api/teams').then(res => res.json()),
        fetch('/api/admin/templates').then(res => res.json())
      ]).then(([customersData, teamsData, templatesData]) => {
        if (Array.isArray(customersData)) setCustomers(customersData)
        if (Array.isArray(teamsData)) setTeams(teamsData)
        if (Array.isArray(templatesData)) setTemplates(templatesData)
      }).catch(err => console.error('Failed to fetch data:', err))
    }
  }, [open])

  const addStep = () => {
    setSteps([...steps, { title: '', description: '', subSteps: [] }])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...steps]
    newSteps[index][field] = value
    setSteps(newSteps)
  }

  const addSubStep = (stepIndex: number) => {
    const newSteps = [...steps]
    if (!newSteps[stepIndex].subSteps) newSteps[stepIndex].subSteps = []
    newSteps[stepIndex].subSteps!.push({ title: '' })
    setSteps(newSteps)
  }

  const removeSubStep = (stepIndex: number, subStepIndex: number) => {
    const newSteps = [...steps]
    if (newSteps[stepIndex].subSteps) {
      newSteps[stepIndex].subSteps = newSteps[stepIndex].subSteps!.filter((_, i) => i !== subStepIndex)
      setSteps(newSteps)
    }
  }

  const updateSubStep = (stepIndex: number, subStepIndex: number, value: string) => {
    const newSteps = [...steps]
    if (newSteps[stepIndex].subSteps) {
      newSteps[stepIndex].subSteps![subStepIndex].title = value
      setSteps(newSteps)
    }
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === steps.length - 1) return

    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
    setSteps(newSteps)
  }

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Deep copy to avoid reference issues
      const templateSteps = template.steps.map(step => ({
        title: step.title,
        description: step.description || '',
        subSteps: step.subSteps?.map(sub => ({ title: sub.title })) || []
      }))
      setSteps(templateSteps)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const validSteps = steps.filter(step => step.title.trim() !== '')
        .map(step => ({
          ...step,
          subSteps: step.subSteps?.filter(sub => sub.title.trim() !== '')
        }))

      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          steps: validSteps.length > 0 ? validSteps : null
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Bir hata oluştu')
      }

      setOpen(false)
      reset()
      setSteps([])
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('İş oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Yeni İş
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni İş Oluştur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">İş Başlığı</Label>
            <Input id="title" {...register('title')} placeholder="Örn: Klima Montajı - A Blok" />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Müşteri</Label>
              <Select onValueChange={(val) => setValue('customerId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company} ({customer.user.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-sm text-red-500">{errors.customerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Atanacak Ekip</Label>
              <Select onValueChange={(val) => setValue('teamId', val === 'none' ? undefined : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ekip seçiniz (Opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Henüz Atama Yapma</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Öncelik</Label>
              <Select onValueChange={(val: any) => setValue('priority', val)} defaultValue="MEDIUM">
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Düşük</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Başlangıç Tarihi</Label>
                <Input id="scheduledDate" type="datetime-local" {...register('scheduledDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledEndDate">Bitiş Tarihi</Label>
                <Input id="scheduledEndDate" type="datetime-local" {...register('scheduledEndDate')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Konum / Adres</Label>
            <Input id="location" {...register('location')} placeholder="Montaj yapılacak adres" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea id="description" {...register('description')} placeholder="İş detayları..." rows={3} />
          </div>

          {/* Checklist Section */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Kontrol Listesi (Opsiyonel)</Label>
              <div className="flex gap-2">
                <Select onValueChange={loadTemplate}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Şablondan Yükle" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Yeni Adım
                </Button>
              </div>
            </div>

            {steps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                Henüz adım eklenmedi. İş için özel kontrol listesi oluşturun veya şablon seçin.
              </p>
            ) : (
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-500 mt-2">{index + 1}.</span>
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Adım başlığı (örn: Malzeme kontrolü)"
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Açıklama (opsiyonel)"
                          value={step.description}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                          rows={2}
                        />

                        {/* Sub-steps */}
                        <div className="pl-4 border-l-2 border-gray-200 space-y-2 mt-2">
                          {step.subSteps?.map((subStep, subIndex) => (
                            <div key={subIndex} className="flex items-center gap-2">
                              <CornerDownRightIcon className="h-4 w-4 text-gray-400" />
                              <Input
                                size={1}
                                className="h-8 text-sm"
                                placeholder="Alt görev..."
                                value={subStep.title}
                                onChange={(e) => updateSubStep(index, subIndex, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600"
                                onClick={() => removeSubStep(index, subIndex)}
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-indigo-600 h-6 px-2"
                            onClick={() => addSubStep(index)}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Alt Görev Ekle
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === steps.length - 1}
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeStep(index)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
