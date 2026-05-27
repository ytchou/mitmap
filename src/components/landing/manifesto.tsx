import Link from 'next/link'

export default function Manifesto() {
  return (
    <section className="bg-background py-4 md:py-6">
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute -left-2 -top-8 select-none font-heading text-[72px] leading-none text-warm-secondary/80"
        >
          「
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-8 -right-2 select-none font-heading text-[72px] leading-none text-warm-secondary/80"
        >
          」
        </span>
        <div className="px-16 py-10">
          <p className="text-sm leading-[1.8] text-foreground/70">
            台灣製造不只是一個標籤，而是一份對品質的堅持。從在地食材到設計選品，台灣有太多默默耕耘的品牌，等待被看見。
          </p>
          <p className="mt-4 text-sm leading-[1.8] text-foreground/70">
            MIT Map 想做的，就是成為這些品牌與世界之間的橋樑——讓每一個用心做好產品的人，都有機會被發現。
          </p>
          <div className="mt-6">
            <Link href="/about" className="font-medium text-primary">
              了解我們的故事 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
