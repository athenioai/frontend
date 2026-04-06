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
    <div className="flex h-full">
      {/* Left panel — session list */}
      <div
        className={cn(
          'relative flex flex-col overflow-hidden',
          isDetail
            ? 'hidden lg:flex lg:w-[380px] lg:shrink-0'
            : 'flex-1 lg:w-[380px] lg:shrink-0',
        )}
      >
        {sidebar}
        {/* Right-edge glow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/15 to-transparent" />
      </div>

      {/* Right panel — conversation or placeholder */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isDetail ? '' : 'hidden lg:flex',
        )}
      >
        {children}
      </div>
    </div>
  )
}
