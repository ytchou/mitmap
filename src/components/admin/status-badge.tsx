import { cn } from '@/lib/utils'

type Status = 'pending' | 'approved' | 'rejected' | 'hidden'

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-[#F5F4F1] text-[#7C7570]',
  },
  approved: {
    label: 'Approved',
    className: 'bg-[#EAF3E8] text-[#2D5A27]',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-[#D94F3D]',
  },
  hidden: {
    label: 'Hidden',
    className: 'bg-gray-100 text-gray-500',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
