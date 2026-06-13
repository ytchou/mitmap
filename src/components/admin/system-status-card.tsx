'use client'

import { useTransition } from 'react'
import { refreshHealthChecks } from '@/app/admin/actions'
import type { ServiceHealthResult } from '@/lib/services/health-checks'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const STATUS_DOT: Record<ServiceHealthResult['status'], string> = {
  healthy: 'bg-[#2D5A27]',
  degraded: 'bg-[#C4870A]',
  down: 'bg-[#D94F3D]',
  unconfigured: 'bg-[#A39E98]',
}

export function SystemStatusCard({ initialResults }: { initialResults: ServiceHealthResult[] }) {
  const [isPending, startTransition] = useTransition()

  const overallStatus =
    initialResults.some((r) => r.status === 'down')
      ? 'down'
      : initialResults.some((r) => r.status === 'degraded')
        ? 'degraded'
        : 'healthy'

  function handleRefresh() {
    startTransition(async () => {
      await refreshHealthChecks()
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[overallStatus]}`} />
          <CardTitle className="text-base font-semibold">系統狀態</CardTitle>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isPending ? '更新中…' : 'Refresh'}
        </button>
      </CardHeader>
      <CardContent className="space-y-2">
        {initialResults.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No data</p>
        )}
        {initialResults.map((result) => (
          <div key={result.service} className="flex items-center justify-between text-sm">
            <span className="font-medium">{result.service}</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[result.status]}`} />
              <span>{result.message}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
