'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { reviewReportAction } from '@/app/admin/actions'
import type { BrandReport, ReportReason } from '@/lib/services/reports'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ReportsTableProps {
  reports: BrandReport[]
}

const REASON_LABELS: Record<ReportReason, string> = {
  not_mit: '非台灣製造',
  incorrect_info: '資訊有誤',
  broken_link: '連結失效',
  inappropriate: '不當內容',
  removal_request: '要求移除',
}

function ActionPill({
  label,
  onClick,
  variant = 'default',
}: {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === 'destructive'
          ? 'inline-flex items-center rounded-full bg-[#F5F4F1] px-3 py-1 text-xs font-medium text-[#7C7570] transition-colors hover:bg-[#EAE7E2]'
          : 'inline-flex items-center rounded-full bg-[#F5F4F1] px-3 py-1 text-xs font-medium text-[#3D3531] transition-colors hover:bg-[#EAE7E2]'
      }
    >
      {label}
    </button>
  )
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const [, startTransition] = useTransition()

  function handleReview(id: string, decision: 'reviewed' | 'dismissed') {
    startTransition(async () => {
      await reviewReportAction(id, decision)
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>品牌</TableHead>
          <TableHead>原因</TableHead>
          <TableHead>補充</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
              目前沒有待處理的檢舉。
            </TableCell>
          </TableRow>
        ) : (
          reports.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <Link href={`/brands/${r.brandSlug}`} className="underline">
                  {r.brandName}
                </Link>
              </TableCell>
              <TableCell>{REASON_LABELS[r.reason]}</TableCell>
              <TableCell className="max-w-xs truncate">{r.notes ?? '—'}</TableCell>
              <TableCell>{new Date(r.createdAt).toLocaleDateString('zh-TW')}</TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  <ActionPill label="審核" onClick={() => handleReview(r.id, 'reviewed')} />
                  <ActionPill label="忽略" onClick={() => handleReview(r.id, 'dismissed')} variant="destructive" />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
