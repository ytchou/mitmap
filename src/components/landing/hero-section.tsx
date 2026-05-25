import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="bg-[#FAF7F4] py-16 md:py-24">
      <div className="mx-auto max-w-screen-xl px-6 text-center md:px-10">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-[#1A1918] lg:text-6xl">
          探索台灣製造的精品品牌
        </h1>
        <p className="mt-4 text-lg text-[#7C7570]">
          Discover quality brands made in Taiwan
        </p>
        <Link
          href="/brands"
          className={
            buttonVariants({ variant: 'default', size: 'lg' }) +
            ' mt-8 bg-[#E06B3F] hover:bg-[#c85a34]'
          }
        >
          探索品牌
        </Link>
      </div>
    </section>
  )
}
