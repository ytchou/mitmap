interface TrustBarProps {
  brandCount: number
  categoryCount: number
}

export default function TrustBar({ brandCount, categoryCount }: TrustBarProps) {
  return (
    <section className="py-2 text-center font-heading">
      <div className="border-t border-b border-border py-4">
        <div className="flex items-center justify-center gap-4">
          <span className="rounded-full bg-secondary px-6 py-2 text-base text-muted-foreground">
            {brandCount} 個品牌
          </span>
          <span className="rounded-full bg-secondary px-6 py-2 text-base text-muted-foreground">
            {categoryCount} 個分類
          </span>
          <span className="rounded-full bg-secondary px-6 py-2 text-base text-muted-foreground">
            社群共建
          </span>
        </div>
      </div>
    </section>
  )
}
