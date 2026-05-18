'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const total = images.length

  if (total === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <div className="flex h-full items-center justify-center">
          <span className="text-4xl font-bold text-muted-foreground">
            {alt.charAt(0)}
          </span>
        </div>
      </div>
    )
  }

  function goTo(index: number) {
    setCurrent(((index % total) + total) % total)
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
      <Image
        src={images[current]}
        alt={`${alt} — photo ${current + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 580px"
        priority={current === 0}
      />

      {total > 1 && (
        <>
          {/* Prev button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm hover:bg-background/80"
            onClick={() => goTo(current - 1)}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </Button>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm hover:bg-background/80"
            onClick={() => goTo(current + 1)}
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </Button>

          {/* Counter badge */}
          <span className="absolute bottom-3 right-3 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            {current + 1} / {total}
          </span>
        </>
      )}
    </div>
  )
}
