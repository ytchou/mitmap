'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Flag } from 'lucide-react'
import { submitReportAction, type ReportState } from '@/app/[locale]/brands/[slug]/actions'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReportDialogProps {
  brandId: string
  brandSlug: string
}

export function ReportDialog({ brandId, brandSlug }: ReportDialogProps) {
  const t = useTranslations('brandDetail.report')
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReportAction, {})

  const alreadyReported =
    typeof window !== 'undefined' && !!localStorage.getItem(`report:${brandSlug}`)

  if (state.success && typeof window !== 'undefined') {
    localStorage.setItem(`report:${brandSlug}`, '1')
  }

  const reasons = [
    { value: 'not_mit', label: t('reasonNotMit') },
    { value: 'incorrect_info', label: t('reasonIncorrectInfo') },
    { value: 'broken_link', label: t('reasonBrokenLink') },
    { value: 'inappropriate', label: t('reasonInappropriate') },
  ]

  return (
    <Dialog>
      <DialogTrigger
        className="flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80"
        aria-label={t('trigger')}
      >
        <Flag className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {state.success ? (
          <div className="space-y-4">
            <p>{t('success')}</p>
            <DialogClose>
              <Button variant="outline">{t('close')}</Button>
            </DialogClose>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="brandId" value={brandId} />

            {alreadyReported && (
              <p className="rounded bg-muted p-2 text-sm text-muted-foreground">
                {t('alreadyReported')}
              </p>
            )}

            <div className="space-y-2">
              {reasons.map(({ value, label }) => (
                <Label key={value} className="flex items-center gap-2">
                  <input type="radio" name="reason" value={value} required />
                  {label}
                </Label>
              ))}
            </div>

            <Textarea name="notes" maxLength={1000} placeholder={t('notesPlaceholder')} />

            {state.error && (
              <p className="rounded bg-destructive/10 p-2 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending || alreadyReported}>
              {pending ? t('submitting') : t('submit')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
