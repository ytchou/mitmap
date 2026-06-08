'use client'

import { Children, type ReactNode } from 'react'

interface MasonryGridProps { children: ReactNode }

export function MasonryGrid({ children }: MasonryGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="list"
    >
      {Children.map(children, (child) => (
        <div role="listitem">{child}</div>
      ))}
    </div>
  )
}
