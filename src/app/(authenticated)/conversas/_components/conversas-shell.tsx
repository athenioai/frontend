'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ConversasShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function ConversasShell({ sidebar, children }: ConversasShellProps) {
  const pathname = usePathname()
  const isDetail = pathname.startsWith('/conversas/') && pathname !== '/conversas'

  return (
    <div className="flex h-full lg:gap-3 lg:p-3">
      {/* Left panel — always 380px on desktop, toggle on mobile */}
      <div
        className={cn(
          'relative w-full flex-col overflow-hidden bg-surface-1 lg:flex lg:w-[380px] lg:shrink-0 lg:rounded-2xl lg:border',
          isDetail ? 'hidden' : 'flex',
        )}
      >
        {sidebar}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/15 to-transparent lg:hidden" />
      </div>

      {/* Right panel — always flex-1 on desktop, toggle on mobile */}
      <div
        className={cn(
          'min-w-0 flex-1 flex-col overflow-hidden bg-surface-1 lg:flex lg:rounded-2xl lg:border',
          isDetail ? 'flex' : 'hidden',
        )}
      >
        {children}
      </div>
    </div>
  )
}
