import { Bookmark, Flag, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BrandActions() {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" aria-label="Share">
        <Share2 className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Bookmark">
        <Bookmark className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Report">
        <Flag className="size-4" />
      </Button>
    </div>
  )
}
