'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Loader2Icon, CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { processApprovalAction } from '@/lib/actions/approvals'

interface ApprovalDialogProps {
  approval: {
    id: string
    job?: {
      id?: string
      title?: string
      customer?: { company?: string } | null
    } | null
    requester?: { name?: string | null; email?: string } | null
  }
}

export function ApprovalDialog({ approval }: ApprovalDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpenDialog = (selectedAction: 'APPROVED' | 'REJECTED') => {
    setAction(selectedAction)
    setNotes('')
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!action) return

    setLoading(true)
    try {
      await processApprovalAction({
        approvalId: approval.id,
        status: action,
        notes: notes || undefined
      })

      toast.success(action === 'APPROVED' ? 'İş onaylandı' : 'İş reddedildi')
      setOpen(false)
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Buttons outside Dialog to avoid render issues */}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => handleOpenDialog('APPROVED')}
        >
          <CheckIcon className="h-4 w-4 mr-1" />
          Onayla
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => handleOpenDialog('REJECTED')}
        >
          <XIcon className="h-4 w-4 mr-1" />
          Reddet
        </Button>
      </div>

      {/* Dialog controlled by open state */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'APPROVED' ? 'İşi Onayla' : 'İşi Reddet'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 mt-2">
                <p><span className="font-medium">İş:</span> {approval.job?.title || 'Bilinmiyor'}</p>
                <p><span className="font-medium">Müşteri:</span> {approval.job?.customer?.company || 'Bilinmiyor'}</p>
                <p><span className="font-medium">Talep Eden:</span> {approval.requester?.name || approval.requester?.email || 'Bilinmiyor'}</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Not {action === 'REJECTED' && '(Opsiyonel)'}
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === 'APPROVED'
                    ? 'Onay notu ekleyebilirsiniz...'
                    : 'Red nedeni belirtebilirsiniz...'
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant={action === 'APPROVED' ? 'default' : 'destructive'}
            >
              {loading ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {action === 'APPROVED' ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Onayla
                    </>
                  ) : (
                    <>
                      <XIcon className="h-4 w-4 mr-2" />
                      Reddet
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

