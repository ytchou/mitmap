'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DashboardQueueItemProps = {
  label: string
  sublabel?: string
  date: string
  riskLevel?: 'high' | 'medium' | 'clean'
  onApprove: () => void
  isPending?: boolean
}

const riskClassNames = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  clean: 'bg-emerald-50 text-emerald-700 border-emerald-200',
} satisfies Record<NonNullable<DashboardQueueItemProps['riskLevel']>, string>

export function DashboardQueueItem({
  label,
  sublabel,
  date,
  riskLevel,
  onApprove,
  isPending = false,
}: DashboardQueueItemProps) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{label}</p>
        {sublabel ? (
          <p className="truncate text-sm text-muted-foreground">{sublabel}</p>
        ) : null}
      </div>
      <time className="shrink-0 text-sm text-muted-foreground">{date}</time>
      {riskLevel ? (
        <Badge className={cn('border text-xs', riskClassNames[riskLevel])}>
          {riskLevel}
        </Badge>
      ) : null}
      <Button size="sm" onClick={onApprove} disabled={isPending}>
        核准
      </Button>
    </div>
  )
}
